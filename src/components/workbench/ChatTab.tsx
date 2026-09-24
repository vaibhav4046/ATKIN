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
  FileText 
} from 'lucide-react';
import type { 
  ChatMessage, 
  Document, 
  Span, 
  MemoryRecord 
} from '../../types/index.ts';
import { ChatEngine } from '../../engine/chat/chatEngine.ts';
import { MemoryEngine } from '../../engine/memory/memoryEngine.ts';
import { LocalModelManager } from '../../engine/model/localModelManager.ts';
import { NetworkBroker } from '../../engine/network/networkBroker.ts';
import { Badge } from '../common/Badge.tsx';

interface ChatTabProps {
  matterId: string;
  documents: Document[];
  spans: Span[];
  memoryEngine: MemoryEngine;
  modelManager: LocalModelManager;
  networkBroker: NetworkBroker;
  onSelectSpan?: (span: Span) => void;
}

const chatEngine = new ChatEngine();

export const ChatTab: React.FC<ChatTabProps> = ({
  matterId,
  documents,
  spans,
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
        content: `**Proofline Sovereign Legal Copilot Ready.**\n\nOperating strictly locally in **${networkBroker.getCurrentMode().toUpperCase()}** mode with local cryptographic memory. All queries are grounded against your indexed matter documents and verified statutory authorities.\n\nHow may I assist with this matter?`,
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

  const quickPrompts = [
    'Find all factual contradictions in evidence',
    'Audit contract for uncapped indemnity and liability caps',
    'Verify conflicting payment terms between Section 4 and Schedule B',
    'Draft Letter of Claim pursuant to CPR Annex B'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isProcessing) return;

    setInputQuery('');
    setIsProcessing(true);

    try {
      const response = await chatEngine.processUserQuery(
        {
          matterId,
          documents,
          spans,
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

  const handleApproveSuggestedMemory = (memoryId: string) => {
    memoryEngine.approveMemory(memoryId);
    setMessages([...chatEngine.getMessagesForMatter(matterId)]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-172px)] bg-gallery-paper">
      {/* Top Banner */}
      <div className="bg-gallery-white border-b border-border-hairline px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-proofline-blue" />
          <span className="text-[13px] font-semibold text-ink">Sovereign Copilot Assistant</span>
          <Badge variant="blue" size="sm">Local Loopback Only</Badge>
          <Badge variant="neutral" size="sm">Zero Cloud Egress</Badge>
        </div>
        <div className="text-[12px] text-ink-steel flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-proofline-green" />
          <span>SRA Evidence Grounded · AES-GCM Memory</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[720px] rounded-card-sm p-4 text-[13px] leading-relaxed shadow-subtle ${
                msg.role === 'user'
                  ? 'bg-proofline-blue text-white'
                  : 'bg-gallery-white border border-border-hairline text-ink'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {msg.content}
              </div>

              {/* Sources Used Pill Bar */}
              {msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border-hairline/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-ink-steel font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3 text-proofline-blue" />
                    Sources Grounded:
                  </span>
                  {msg.sourcesUsed.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const target = spans.find(sp => sp.id === s.spanId);
                        if (target && onSelectSpan) onSelectSpan(target);
                      }}
                      className="px-2 py-0.5 rounded-full-pill bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink-slate hover:text-ink transition-colors"
                      title={`Inspect ${s.filename} (${s.lineRange})`}
                    >
                      {s.filename} ({s.lineRange})
                    </button>
                  ))}
                </div>
              )}

              {/* Memories Used Bar */}
              {msg.memoriesUsed && msg.memoriesUsed.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-ink-steel font-medium flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3 text-proofline-ochre" />
                    Memory Used:
                  </span>
                  {msg.memoriesUsed.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full-pill bg-proofline-ochre/10 text-proofline-ochre border border-proofline-ochre/20"
                    >
                      [{m.scope}] {m.text.slice(0, 45)}...
                    </span>
                  ))}
                </div>
              )}

              {/* Generation Telemetry Footer */}
              {msg.generationDetails && (
                <div className="mt-2 pt-2 text-[10.5px] text-ink-steel flex items-center gap-3">
                  <span>Model: <strong>{msg.generationDetails.modelTag}</strong></span>
                  <span>Latency: {msg.generationDetails.latencyMs}ms</span>
                  <span>Tokens: ~{msg.generationDetails.tokensGenerated}</span>
                </div>
              )}
            </div>

            <span className="text-[10.5px] text-ink-steel mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-ink-steel text-[12px] p-3">
            <span className="w-2 h-2 rounded-full bg-proofline-blue animate-ping" />
            <span>Consulting local evidential indices and applying SRA grounding rules...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-6 py-2 bg-gallery-white border-t border-border-hairline flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-medium text-ink-steel shrink-0">Quick Queries:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full-pill bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink-slate hover:text-ink whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
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
            placeholder="Ask sovereign copilot about this matter, contradictions, statutes, or contract clauses..."
            className="flex-1 px-4 py-2.5 rounded-card-sm border border-border-hairline focus:outline-none focus:ring-1 focus:ring-proofline-blue text-[13px] bg-gallery-mist/40 placeholder:text-ink-steel"
          />
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
  );
};
