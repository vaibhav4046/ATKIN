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

  public addMessage(message: ChatMessage): void {
    const list = this.messages.get(message.matterId) || [];
    list.push(message);
    this.messages.set(message.matterId, list);
  }

  public clearHistory(matterId: string): void {
    this.messages.set(matterId, []);
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

    let assistantReply = '';
    let isLocalRuntime = false;
    let modelTagUsed = 'proofline-sovereign-irac';

    // 3. Attempt local LLM call if Ollama is running and model connected
    const modelStatus = await modelManager.checkHealth();
    if (modelStatus.state === 'connected') {
      try {
        const sysPrompt = this.buildSystemPrompt(
          activeMemories, 
          documents, 
          spans.slice(0, 6), 
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
        // Fall back cleanly to deterministic sovereign IRAC engine
        assistantReply = reasoningOutput.formattedResponse;
      }
    } else {
      assistantReply = reasoningOutput.formattedResponse;
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

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      matterId,
      role: 'assistant',
      content: assistantReply,
      timestamp: new Date().toISOString(),
      sourcesUsed: reasoningOutput.sourcesUsed.length > 0 ? reasoningOutput.sourcesUsed : undefined,
      memoriesUsed: activeMemories.length > 0 ? activeMemories.slice(0, 3).map(m => ({ memoryId: m.id, text: m.text, scope: m.scope })) : undefined,
      needsReviewItems: suggestedMemories.length > 0 ? ['New matter fact suggested for review in Memory tab.'] : undefined,
      reasoningSteps: reasoningOutput.reasoningSteps,
      suggestedAction: reasoningOutput.suggestedAction,
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

    return `You are Proofline, an air-gapped sovereign legal copilot operating under ${jurisdiction} law.
You operate with the highest standards of evidence grounding (SRA Principles, CPR 1998, and Civil Evidence Act 1995).
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
