import type { 
  ChatMessage, 
  MemoryRecord, 
  EvidenceSpan,
  DocumentRecord,
  AgenticTraceStep,
  Claim,
  Authority,
  ReviewItem
} from '../../types/index.ts';
import { MemoryEngine } from '../memory/memoryEngine.ts';
import { LocalModelManager } from '../model/localModelManager.ts';
import { NetworkBroker } from '../network/networkBroker.ts';
import { legalReasoningEngine } from '../reasoning/legalReasoningEngine.ts';
import { saveChatMessageToDB, loadChatMessagesFromDB, clearChatMessagesFromDB } from '../../db/index.ts';
import { AstraRuntime } from '../protocol/astraRuntime.ts';
import { OllamaLegalModel, DeterministicOfflineLegalModel } from '../protocol/models.ts';
import type { DocumentRecord as CitationDocRecord } from '../protocol/citationGate.ts';

export interface ChatEngineContext {
  matterId: string;
  matterTitle?: string;
  matterJurisdiction?: string;
  documents: DocumentRecord[];
  spans: EvidenceSpan[];
  claims?: Claim[];
  authorities?: Authority[];
  reviewItems?: ReviewItem[];
  memoryEngine: MemoryEngine;
  modelManager: LocalModelManager;
  networkBroker: NetworkBroker;
}

export class ChatEngine {
  private messages: Map<string, ChatMessage[]> = new Map();

  constructor() {}

  public getMessagesForMatter(matterId: string): ChatMessage[] {
    return this.messages.get(matterId) || [];
  }

  public async loadHistoryForMatter(matterId: string): Promise<ChatMessage[]> {
    const fromDB = await loadChatMessagesFromDB(matterId);
    if (fromDB.length > 0) {
      this.messages.set(matterId, fromDB);
      return fromDB;
    }
    return this.messages.get(matterId) || [];
  }

  public addMessage(message: ChatMessage): void {
    const list = this.messages.get(message.matterId) || [];
    list.push(message);
    this.messages.set(message.matterId, list);
    // Persist to local IndexedDB asynchronously
    saveChatMessageToDB(message).catch(err => console.error('Error persisting message:', err));
  }

  public clearHistory(matterId: string): void {
    this.messages.set(matterId, []);
    clearChatMessagesFromDB(matterId).catch(err => console.error('Error clearing messages:', err));
  }

  public async processUserQuery(
    context: ChatEngineContext,
    userQuery: string
  ): Promise<ChatMessage> {
    const { 
      matterId, 
      matterTitle = 'Active Matter',
      matterJurisdiction = 'England and Wales',
      documents, 
      spans, 
      claims = [], 
      authorities = [], 
      reviewItems = [], 
      memoryEngine, 
      modelManager 
    } = context;

    // Record user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      matterId,
      role: 'user',
      content: userQuery,
      timestamp: new Date().toISOString()
    };
    this.addMessage(userMsg);

    // 1. Scoped memory isolation
    const availableMemories = memoryEngine.getMemoriesForMatter(matterId);
    const activeMemories = availableMemories.filter(m => m.status === 'active' && m.reviewState === 'accepted');

    // 2. Multi-step IRAC Legal Reasoning Engine
    const startTime = Date.now();
    const reasoningOutput = legalReasoningEngine.reason({
      query: userQuery,
      matterId,
      matterTitle,
      matterJurisdiction,
      documents,
      spans,
      claims,
      authorities,
      reviewItems,
      memories: activeMemories
    });

    // 3. Prepare Documents Map for ASTRA & CitationGate
    const docMap = new Map<string, CitationDocRecord>();
    for (const d of documents) {
      docMap.set(d.id, {
        id: d.id,
        filename: d.filename,
        matterId: d.matterId,
        currentVersionId: 'v1',
        content: d.text || d.content || '',
        sha256: d.sha256
      });
    }

    const modelStatus = await modelManager.checkHealth();
    const legalModel = (modelStatus.state === 'connected')
      ? new OllamaLegalModel({ modelTag: modelStatus.modelTag })
      : new DeterministicOfflineLegalModel();

    const astra = new AstraRuntime({ legalModel });

    const astraRes = await astra.execute({
      id: `req-${Date.now()}`,
      userId: 'solicitor-01',
      workspaceId: 'ws-personal',
      matterId,
      mode: 'ask',
      message: userQuery,
      jurisdiction: (matterJurisdiction as any) || 'England and Wales',
      privacyMode: 'local_only'
    }, {
      spans,
      documents: docMap
    });

    let assistantReply = '';
    let isLocalRuntime = false;
    let modelTagUsed = legalModel.name;

    if (modelStatus.state === 'connected' && reasoningOutput.sourcesUsed.length > 0) {
      try {
        const relevantSpansForLlm = reasoningOutput.sourcesUsed
          .map(su => spans.find(s => s.id === su.spanId))
          .filter((s): s is EvidenceSpan => Boolean(s));

        const sysPrompt = this.buildSystemPrompt(
          activeMemories, 
          documents, 
          relevantSpansForLlm, 
          claims, 
          authorities, 
          matterJurisdiction
        );
        const prompt = `${sysPrompt}\n\nSolicitor Enquiry: ${userQuery}\n\nExecute formal legal reasoning. Cite exact document filenames and span offsets verbatim:`;
        
        const llmResponse = await modelManager.generateCompletion(prompt, {
          temperature: 0.1,
          maxTokens: 1024
        });

        assistantReply = llmResponse;
        isLocalRuntime = true;
        modelTagUsed = modelStatus.modelTag;
      } catch {
        assistantReply = (astraRes.claimSupportStatus === 'FULLY_SUPPORTED' || astraRes.irac.isAbstention)
          ? astraRes.answer
          : (reasoningOutput.formattedResponse || astraRes.answer);
      }
    } else {
      assistantReply = (astraRes.claimSupportStatus === 'FULLY_SUPPORTED' || astraRes.irac.isAbstention)
        ? astraRes.answer
        : (reasoningOutput.formattedResponse || astraRes.answer);
    }

    const latencyMs = Date.now() - startTime;

    // 4. Auto-detect if new memory fact should be suggested
    const suggestedMemories: string[] = [];
    if (userQuery.toLowerCase().includes('remember') || userQuery.toLowerCase().includes('always note')) {
      const suggested = memoryEngine.suggestMemory({
        vaultId: 'default-vault',
        matterId,
        scope: 'matter_facts',
        kind: 'fact',
        text: userQuery.replace(/remember that|always note that|remember/i, '').trim(),
        createdBy: 'model',
        sourceMessageIds: [userMsg.id]
      });
      suggestedMemories.push(suggested.id);
    }

    const sources = reasoningOutput.sourcesUsed.length > 0
      ? reasoningOutput.sourcesUsed
      : astraRes.irac.citations.map(c => {
          const s = spans.find(sp => sp.id === c.spanId);
          return {
            docId: s?.documentId || 'doc-001',
            filename: docMap.get(s?.documentId || '')?.filename || 'Document',
            spanId: c.spanId,
            lineRange: s?.lineStart ? `L${s.lineStart}` : undefined
          };
        });

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      matterId,
      role: 'assistant',
      content: assistantReply,
      timestamp: new Date().toISOString(),
      sourcesUsed: sources.length > 0 ? sources : undefined,
      memoriesUsed: activeMemories.length > 0 ? activeMemories.slice(0, 3).map(m => ({ memoryId: m.id, text: m.text, scope: m.scope })) : undefined,
      needsReviewItems: suggestedMemories.length > 0 ? ['New matter fact suggested for review in Memory tab.'] : undefined,
      reasoningSteps: reasoningOutput.reasoningSteps,
      suggestedAction: reasoningOutput.suggestedAction,
      claimSupportStatus: astraRes.claimSupportStatus,
      auditReceiptHash: astraRes.auditReceiptHash,
      astraStages: astraRes.executionTrace.stages,
      verifications: astraRes.verifications.map(v => ({
        spanId: v.spanId,
        status: v.status,
        reason: v.failureReason || 'Verification passed'
      })),
      generationDetails: {
        modelTag: modelTagUsed,
        localRuntime: isLocalRuntime,
        latencyMs,
        tokensGenerated: Math.round(assistantReply.length / 4)
      }
    };

    this.addMessage(assistantMsg);
    return assistantMsg;
  }

  private buildSystemPrompt(
    memories: MemoryRecord[],
    documents: DocumentRecord[],
    matchedSpans: EvidenceSpan[],
    claims: Claim[],
    authorities: Authority[],
    jurisdiction: string
  ): string {
    const memContext = memories.map(m => `[Memory: ${m.scope}] ${m.text}`).join('\n');
    const docContext = documents.map(d => `Document: ${d.filename} (SHA-256: ${d.sha256.slice(0, 16)}...)`).join('\n');
    const spanContext = matchedSpans.map(s => `[Span ${s.id} in Doc ${s.documentId} L${s.lineStart || 1}]: "${s.exactText || s.text || ''}"`).join('\n');
    const claimContext = claims.slice(0, 5).map(c => `[Claim (${c.kind})]: ${c.statement} (${c.status})`).join('\n');
    const authContext = authorities.slice(0, 4).map(a => `[Authority]: ${a.identifier} - ${a.citation}: ${a.summary}`).join('\n');

    return `You are ATKIN, a local-first legal workspace operating under ${jurisdiction} law.
You operate with the highest standards of evidence grounding under Civil Procedure Rules (CPR Parts 31 & 32) and the SRA Code of Conduct.
NEVER fabricate citations, precedents, or factual claims.
Every assertion must be tied to the provided evidence spans.

PRIMARY AUTHORITIES:
${authContext || 'Standard common law and statutory principles apply.'}

VERIFIED CLAIMS:
${claimContext || 'No claims recorded yet.'}

ACTIVE MEMORIES:
${memContext || 'No specific memories.'}

MATTER DOCUMENTS:
${docContext}

RELEVANT EVIDENCE SPANS (VERIFIED CHECKSUMS):
${spanContext || 'No direct text spans matched.'}`;
  }
}

export const chatEngine = new ChatEngine();
