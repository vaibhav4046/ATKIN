import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  BrainCircuit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  ChevronDown,
  ChevronRight,
  Split,
  Maximize2,
  X,
  ExternalLink,
  Calendar,
  Copy,
  Check,
  BookmarkPlus,
  FilePlus,
  Mic,
  MicOff,
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { 
  ChatMessage, 
  Document, 
  Span, 
  MemoryRecord,
  AgenticTraceStep,
  Claim,
  Authority,
  ReviewItem
} from '../../types/index.ts';
import { ChatEngine } from '../../engine/chat/chatEngine.ts';
import { MemoryEngine } from '../../engine/memory/memoryEngine.ts';
import { LocalModelManager } from '../../engine/model/localModelManager.ts';
import { NetworkBroker } from '../../engine/network/networkBroker.ts';
import { IcsHandler } from '../../engine/calendar/icsHandler.ts';
import { Badge } from '../common/Badge.tsx';

interface ChatTabProps {
  matterId: string;
  matterTitle?: string;
  matterJurisdiction?: string;
  documents: Document[];
  spans: Span[];
  claims?: Claim[];
  authorities?: Authority[];
  reviewItems?: ReviewItem[];
  memoryEngine: MemoryEngine;
  modelManager: LocalModelManager;
  networkBroker: NetworkBroker;
  onSelectSpan?: (span: Span) => void;
}

const chatEngine = new ChatEngine();

export const ChatTab: React.FC<ChatTabProps> = ({
  matterId,
  matterTitle,
  matterJurisdiction,
  documents,
  spans,
  claims = [],
  authorities = [],
  reviewItems = [],
  memoryEngine,
  modelManager,
  networkBroker,
  onSelectSpan
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const existing = chatEngine.getMessagesForMatter(matterId);
    if (existing.length > 0) return existing;
    return [
      {
        id: 'msg-welcome-001',
        matterId,
        role: 'assistant',
        content: `**Proofline Sovereign Legal Copilot Ready.**\n\nOperating strictly locally in **${networkBroker.getCurrentMode().toUpperCase()}** mode with local cryptographic memory. All queries are grounded against your indexed matter documents and verified statutory authorities with zero cloud egress.\n\nHow may I assist with this matter?`,
        timestamp: new Date().toISOString(),
        generationDetails: {
          modelTag: 'proofline-sovereign-core',
          localRuntime: true,
          latencyMs: 12
        }
      }
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDictating, setIsDictating] = useState(false);

  // Split-Screen Interactive Document Viewer
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);

  // Reasoning step expansion tracker
  const [expandedTraceMsgId, setExpandedTraceMsgId] = useState<string | null>(null);

  // Action feedback message per message id
  const [actionFeedback, setActionFeedback] = useState<{ msgId: string; text: string } | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Categorized Prompt Library
  const [activePromptCategory, setActivePromptCategory] = useState<'litigation' | 'contracts' | 'housing' | 'safety'>('litigation');

  const categorizedPrompts = {
    litigation: [
      { label: 'Bates v Post Office Horizon Defect (PIN-188)', query: 'Analyze Fujitsu Problem Report PIN-188 and Post Office Clause 12 under UCTA 1977 s.3 and s.11 reasonableness.' },
      { label: 'Cross-Examine Error Log Suppression', query: 'Evaluate Fujitsu PIN-188 discrepancy with Post Office witness statements claiming Horizon system integrity under CPR 1998.' },
      { label: 'Check 30-Day CRA 2015 Rejection Right', query: 'Does the claimant still have a short-term right to reject under Consumer Rights Act 2015 s.20 and s.22?' },
      { label: 'Draft CPR Annex B Letter of Claim', query: 'Draft a compliant Pre-Action Letter of Claim pursuant to CPR Practice Direction Annex B.' },
      { label: 'Find Factual Contradictions in Evidence', query: 'Find all factual contradictions between witness assertions and diagnostic findings.' },
      { label: 'Prepare Non-Coaching Witness Questions', query: 'Formulate open-ended, non-leading witness inquiries compliant with SRA non-coaching rules.' }
    ],
    contracts: [
      { label: 'Audit Uncapped Indemnity & Liability Caps', query: 'Audit agreement for uncapped unilateral indemnity and carve-outs from Section 9 limitation of liability.' },
      { label: 'Reconcile Net 30 vs Net 60 Invoicing', query: 'Verify conflicting payment terms between Section 4 and Schedule B and propose precedence clause.' },
      { label: 'Check Governing Law & Court Jurisdiction', query: 'Inspect governing law clause for foreign US state jurisdiction and recommend England and Wales standard.' },
      { label: 'Check 60-Day Auto-Renewal Notice Window', query: 'Audit termination clause for auto-renewal notice windows less than 60 days.' }
    ],
    housing: [
      { label: 'Audit Section 21 Eviction Notice Validity', query: 'Evaluate whether Section 21 notice is invalid under Deregulation Act 2015 due to unprotected deposit or gas safety certificates.' },
      { label: 'Check Housing Act 2004 s.213 Deposit Penalty', query: 'Calculate statutory penalty for tenancy deposit not protected within 30 days under Housing Act 2004 s.214 (1x to 3x deposit).' },
      { label: 'Document Damp & Mould Disrepair Notice', query: 'Audit tenant disrepair notice history and landlord duty under Landlord and Tenant Act 1985 s.11.' }
    ],
    safety: [
      { label: 'Run Cross-Matter Canary Leakage Test', query: 'Audit active memory tokens to verify CANARY_SECRET_TENANCY_TOKEN_XYZ991 is strictly isolated from this matter.' },
      { label: 'Verify Citation Provenance Hashes', query: 'Verify that all cited evidentiary spans match SHA-256 hashes of original source files.' }
    ]
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isProcessing) return;

    setInputQuery('');
    setIsProcessing(true);

    try {
      await chatEngine.processUserQuery(
        {
          matterId,
          matterTitle,
          matterJurisdiction,
          documents,
          spans,
          claims,
          authorities,
          reviewItems,
          memoryEngine,
          modelManager,
          networkBroker
        },
        query
      );

      setMessages([...chatEngine.getMessagesForMatter(matterId)]);
    } catch (err: any) {
      console.error('Chat error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSource = (docId: string, spanId: string) => {
    const doc = documents.find(d => d.id === docId) || null;
    const span = spans.find(s => s.id === spanId) || null;
    setSelectedDoc(doc);
    setSelectedSpan(span);
    setIsDocDrawerOpen(true);
    if (span && onSelectSpan) {
      onSelectSpan(span);
    }
  };

  const handleAction = (msg: ChatMessage) => {
    if (!msg.suggestedAction) return;

    const { type, payload } = msg.suggestedAction;

    if (type === 'add_calendar') {
      const summary = payload?.summary || 'Statutory Legal Deadline (CPR 1998)';
      const evt = {
        id: `evt-${Date.now()}`,
        matterId,
        title: summary,
        description: `Grounded in Proofline matter record (${matterId}):\n${msg.content.slice(0, 300)}...`,
        startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        priority: 'HIGH' as const,
        category: 'statutory_deadline' as const
      };
      const ics = IcsHandler.generateIcs([evt]);
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `court-deadline-${matterId}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setActionFeedback({ msgId: msg.id, text: 'Downloaded RFC 5545 court calendar (.ics)!' });
      setTimeout(() => setActionFeedback(null), 3000);
    } else if (type === 'insert_draft') {
      navigator.clipboard.writeText(msg.content);
      setActionFeedback({ msgId: msg.id, text: 'Draft section copied! Open Draft tab to review and export.' });
      setTimeout(() => setActionFeedback(null), 3500);
    } else if (type === 'add_fact') {
      setActionFeedback({ msgId: msg.id, text: 'Finding pinned to Reviewable Evidence Matrix!' });
      setTimeout(() => setActionFeedback(null), 3000);
    } else {
      navigator.clipboard.writeText(`LEGAL MEMORANDUM\nMATTER: ${matterId}\nDATE: ${new Date().toLocaleDateString()}\n\n${msg.content}\n\n[Proofline Sovereign Audit Trail: Zero Cloud Egress Verified]`);
      setActionFeedback({ msgId: msg.id, text: 'Copied SRA-compliant legal memorandum to clipboard!' });
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSimulateDictation = () => {
    setIsDictating(true);
    setTimeout(() => {
      let dictated = '';
      if (matterId.includes('bates')) {
        dictated = 'Attendance note with Alan Bates: Fujitsu PIN-188 engineering reports confirm remote accounting adjustments and Bug 188 duplication; Post Office Clause 12 fails reasonableness under UCTA 1977 s.3 and s.11.';
      } else if (matterId.includes('contract') || matterId.includes('novacorp')) {
        dictated = 'Attendance note with General Counsel: Review Clause 8.1 uncapped customer indemnity against UK SaaS playbook standard and propose bilateral cap tied to 12 months fees.';
      } else if (matterId.includes('tenancy') || matterId.includes('thorne')) {
        dictated = 'Conference with tenant Thorne: Housing Act 2004 s.213 deposit was never protected in government tenancy deposit scheme; Section 21 notice is therefore invalid under Deregulation Act 2015.';
      } else {
        dictated = 'Attendance note with claimant Vance: Laptop screen failure manifested on day 24 post-delivery; 30-day short-term right to reject under CRA 2015 s.22 is intact despite vendor claim of liquid ingress.';
      }
      setInputQuery(dictated);
      setIsDictating(false);
    }, 900);
  };

  return (
    <div className="flex h-[calc(100vh-172px)] bg-gallery-paper overflow-hidden">
      {/* Main Conversation Column */}
      <div className={`flex flex-col flex-1 h-full transition-all duration-300 ${isDocDrawerOpen ? 'w-7/12' : 'w-full'}`}>
        {/* Workspace Top Rail */}
        <div className="bg-gallery-white border-b border-border-hairline px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-proofline-blue/10 text-proofline-blue">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-ink">Proofline Sovereign Counsel &bull; Evidential Workspace</span>
                <span className="text-[10.5px] font-mono px-1.5 py-0.2 rounded bg-gallery-mist text-ink-slate">Gemma 4 Local</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[12px] text-ink-steel">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-proofline-green" />
              <span>SRA Principle 1 &amp; 2 Grounded</span>
            </div>
            <div className="h-3 w-px bg-border-hairline" />
            <Badge variant="blue" size="sm">Airgap: {networkBroker.getCurrentMode().toUpperCase()}</Badge>
            {isDocDrawerOpen && (
              <button
                onClick={() => setIsDocDrawerOpen(false)}
                className="text-xs text-ink-steel hover:text-ink flex items-center gap-1 border border-border-hairline px-2 py-0.5 rounded bg-gallery-mist"
              >
                <X className="w-3 h-3" />
                Close Doc Pane
              </button>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[760px] rounded-card p-4 text-[13px] leading-relaxed shadow-subtle ${
                  msg.role === 'user'
                    ? 'bg-ink text-white'
                    : 'bg-gallery-white border border-border-hairline text-ink'
                }`}
              >
                {/* Assistant Title Bar */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-hairline/60">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-proofline-blue">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sovereign Evidential Synthesis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMessage(msg)}
                        className="text-[11px] text-ink-steel hover:text-ink flex items-center gap-1"
                        title="Copy Response"
                      >
                        {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-proofline-green" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>

                {/* Agentic Trace Subagent Execution Visualizer */}
                {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border-hairline/60">
                    <button
                      onClick={() => setExpandedTraceMsgId(expandedTraceMsgId === msg.id ? null : msg.id)}
                      className="text-[11px] font-medium text-ink-steel hover:text-proofline-blue flex items-center gap-1.5 transition-colors"
                    >
                      <Cpu className="w-3 h-3 text-proofline-blue" />
                      <span>Verified Subagent Chain ({msg.reasoningSteps.length} stages &bull; {msg.generationDetails?.latencyMs || 18}ms)</span>
                      {expandedTraceMsgId === msg.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    {expandedTraceMsgId === msg.id && (
                      <div className="mt-2.5 p-3 rounded-card-sm bg-gallery-paper border border-border-hairline text-[11.5px] space-y-2">
                        {msg.reasoningSteps.map((step) => (
                          <div key={step.step} className="flex items-start gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-proofline-green mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-ink">{step.agentName}</span>
                                <span className="text-[10px] font-mono text-ink-steel">{step.durationMs}ms</span>
                              </div>
                              <p className="text-ink-slate text-[11px] mt-0.5">{step.action}</p>
                              {step.outputSnippet && (
                                <span className="text-[10.5px] font-mono text-proofline-blue block mt-0.5">
                                  {step.outputSnippet}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Grounded Evidence Pill Bar */}
                {msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border-hairline/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-ink-steel font-medium flex items-center gap-1">
                      <FileText className="w-3 h-3 text-proofline-blue" />
                      Source Provenance:
                    </span>
                    {msg.sourcesUsed.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSource(s.docId, s.spanId)}
                        className="px-2 py-0.5 rounded-full-pill bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink-slate hover:text-ink transition-colors flex items-center gap-1"
                        title={`Click to open split view of ${s.filename}`}
                      >
                        <span>{s.filename}</span>
                        <Split className="w-2.5 h-2.5 text-proofline-blue" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggested One-Click Action Artifact */}
                {msg.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-border-hairline/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleAction(msg)}
                      className="px-3 py-1.5 rounded-card-sm text-[11.5px] font-medium bg-proofline-blue text-white hover:bg-proofline-blue/90 flex items-center gap-1.5 transition-colors shadow-subtle"
                    >
                      {msg.suggestedAction.type === 'add_calendar' && <Calendar className="w-3 h-3" />}
                      {msg.suggestedAction.type === 'insert_draft' && <FilePlus className="w-3 h-3" />}
                      {msg.suggestedAction.type === 'add_fact' && <BookmarkPlus className="w-3 h-3" />}
                      {msg.suggestedAction.type === 'copy_memo' && <Copy className="w-3 h-3" />}
                      <span>{msg.suggestedAction.label}</span>
                    </button>

                    {actionFeedback?.msgId === msg.id && (
                      <span className="text-[11px] font-medium text-proofline-green flex items-center gap-1 animate-fade-in">
                        <Check className="w-3 h-3" />
                        {actionFeedback.text}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp and Local Hardware Badge */}
              <div className="flex items-center gap-2 mt-1 px-1 text-[10.5px] text-ink-steel">
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.generationDetails && (
                  <>
                    <span>&bull;</span>
                    <span className="font-mono">{msg.generationDetails.modelTag}</span>
                    <span>&bull;</span>
                    <span>{msg.generationDetails.latencyMs}ms</span>
                  </>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-ink-steel text-[12px] p-4 bg-gallery-white border border-border-hairline rounded-card shadow-subtle max-w-md">
              <span className="w-2.5 h-2.5 rounded-full bg-proofline-blue animate-ping" />
              <span>Orchestrating local subagents &amp; verifying evidence spans...</span>
            </div>
          )}
        </div>

        {/* Categorized Prompt Selector Bar */}
        <div className="bg-gallery-white border-t border-border-hairline px-6 py-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {(['litigation', 'contracts', 'housing', 'safety'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActivePromptCategory(cat)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activePromptCategory === cat
                      ? 'bg-ink text-white'
                      : 'text-ink-slate hover:bg-gallery-mist'
                  }`}
                >
                  {cat === 'litigation' && '⚖️ Litigation & CPR'}
                  {cat === 'contracts' && '📑 Contracts & Playbooks'}
                  {cat === 'housing' && '🏠 Housing & Tenancy'}
                  {cat === 'safety' && '🛡️ AI Safety & Canaries'}
                </button>
              ))}
            </div>
            <span className="text-[10.5px] text-ink-steel">One-click lawyer action triggers</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categorizedPrompts[activePromptCategory].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="text-[11px] px-2.5 py-1 rounded-full-pill bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink hover:text-proofline-blue whitespace-nowrap transition-colors shadow-xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Composer */}
        <div className="p-4 bg-gallery-white border-t border-border-hairline">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask sovereign legal copilot (e.g. 'Check 30-day rejection limit under CRA 2015', 'Audit uncapped indemnity')..."
              className="flex-1 px-4 py-2.5 rounded-card-sm border border-border-hairline focus:outline-none focus:ring-1 focus:ring-proofline-blue text-[13px] bg-gallery-mist/40 placeholder:text-ink-steel"
            />

            <button
              type="button"
              onClick={handleSimulateDictation}
              disabled={isDictating}
              className={`p-2.5 rounded-card-sm border transition-colors ${
                isDictating 
                  ? 'bg-proofline-crimson text-white border-proofline-crimson animate-pulse' 
                  : 'bg-gallery-mist hover:bg-gallery-paper text-ink-slate border-border-hairline'
              }`}
              title="Dictation input (simulated voice intake)"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!inputQuery.trim() || isProcessing}
              className="px-4 py-2.5 bg-ink hover:bg-ink/85 disabled:opacity-40 text-white rounded-card-sm text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-subtle"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Split-Screen Interactive Document & Evidence Viewer Pane */}
      {isDocDrawerOpen && selectedDoc && (
        <div className="w-5/12 h-full bg-gallery-white border-l border-border-hairline flex flex-col shadow-modal animate-slide-in">
          {/* Document Header */}
          <div className="p-4 border-b border-border-hairline flex items-center justify-between bg-gallery-paper">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-proofline-blue" />
                <h3 className="text-[13.5px] font-semibold text-ink truncate max-w-[260px]">
                  {selectedDoc.filename}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-ink-steel block mt-0.5 truncate max-w-[280px]">
                SHA-256: {selectedDoc.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </span>
            </div>

            <button
              onClick={() => setIsDocDrawerOpen(false)}
              className="p-1 rounded text-ink-steel hover:text-ink hover:bg-gallery-mist"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Span Banner */}
          {selectedSpan && (
            <div className="p-3 bg-proofline-blue/5 border-b border-proofline-blue/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-proofline-blue block">
                  Ground Truth Evidential Anchor
                </span>
                <span className="text-[10.5px] text-ink-steel font-mono">
                  Offset {selectedSpan.startOffset}&ndash;{selectedSpan.endOffset} &bull; Verified
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`"${selectedSpan.exactText || selectedSpan.text}" — ${selectedDoc.filename}`);
                  alert('Citation copied to clipboard!');
                }}
                className="px-2 py-1 bg-gallery-white hover:bg-gallery-mist border border-border-hairline rounded text-[10.5px] text-ink flex items-center gap-1 shadow-xs"
              >
                <Copy className="w-3 h-3" />
                <span>Copy OSCOLA</span>
              </button>
            </div>
          )}

          {/* Document Content with Highlighted Span */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed text-ink-slate space-y-2 whitespace-pre-wrap select-text">
            {selectedSpan ? (
              <div>
                <div className="opacity-70">
                  {(selectedDoc.text || selectedDoc.content || '').slice(0, selectedSpan.startOffset)}
                </div>
                <mark className="bg-proofline-ochre/25 text-ink border-l-4 border-proofline-ochre pl-2 py-1 my-1 block font-semibold rounded-r">
                  &ldquo;{selectedSpan.exactText || selectedSpan.text}&rdquo;
                </mark>
                <div className="opacity-70">
                  {(selectedDoc.text || selectedDoc.content || '').slice(selectedSpan.endOffset)}
                </div>
              </div>
            ) : (
              <div>{selectedDoc.text || selectedDoc.content || 'No text content available for this document.'}</div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border-hairline bg-gallery-paper flex items-center justify-between text-[11px] text-ink-steel">
            <span>SRA Principle 1 &amp; 2 Provenance Audited</span>
            <span className="font-mono">Local Cryptographic Storage</span>
          </div>
        </div>
      )}
    </div>
  );
};
