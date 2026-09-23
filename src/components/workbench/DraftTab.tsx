import React, { useState } from 'react';
import { 
  FileSignature, 
  Download, 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  RotateCcw,
  FileText
} from 'lucide-react';
import type { Draft, DraftType, Span, Document, Matter, ModelStatus } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { exportDraftAsMarkdown } from '../../engine/draftingEngine.ts';

interface DraftTabProps {
  draft: Draft;
  matter: Matter;
  documents: Document[];
  spans: Span[];
  modelStatus: ModelStatus;
  onSelectSpan: (span: Span | null) => void;
  onRegenerateDraft: (type: DraftType, useModel: boolean) => Promise<void>;
  onUpdateDraftBlock: (blockId: string, newText: string) => void;
  onApproveBlock: (blockId: string) => void;
}

export const DraftTab: React.FC<DraftTabProps> = ({
  draft,
  matter,
  documents,
  spans,
  modelStatus,
  onSelectSpan,
  onRegenerateDraft,
  onUpdateDraftBlock,
  onApproveBlock
}) => {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const spansById = new Map(spans.map(s => [s.id, s]));
  const docsById = new Map(documents.map(d => [d.id, d]));

  const handleStartEdit = (blockId: string, text: string) => {
    setEditingBlockId(blockId);
    setEditText(text);
  };

  const handleSaveEdit = (blockId: string) => {
    onUpdateDraftBlock(blockId, editText);
    setEditingBlockId(null);
  };

  const handleExport = () => {
    const md = exportDraftAsMarkdown(draft, matter, spansById, docsById);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegen = async (type: DraftType, useModel: boolean) => {
    setIsGenerating(true);
    try {
      await onRegenerateDraft(type, useModel);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[920px] mx-auto py-2">
      {/* Draft Studio Header & Actions */}
      <div className="bg-gallery-white border border-border-hairline p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" size="sm">Audit-Ready Work Product</Badge>
            <Badge variant={draft.reviewStatus === 'needs_review' ? 'ochre' : 'green'} size="sm">
              {draft.reviewStatus === 'needs_review' ? '⚠️ Needs Solicitor Review' : '✅ Approved'}
            </Badge>
          </div>
          <h2 className="text-[17px] font-semibold text-ink">
            {draft.title}
          </h2>
          <div className="text-[12px] text-ink-slate font-mono mt-0.5">
            Engine: <strong>{draft.generatedBy}</strong> · Updated: {new Date(draft.updatedAt).toLocaleTimeString('en-GB')}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Template Switcher */}
          <div className="flex items-center bg-gallery-paper border border-border-hairline p-1 rounded-full-pill text-[12px]">
            <button
              onClick={() => handleRegen('matter_brief', false)}
              className={`px-3 py-1 rounded-full-pill font-medium transition-colors ${
                draft.type === 'matter_brief' ? 'bg-gallery-white text-ink shadow-xs' : 'text-ink-slate hover:text-ink'
              }`}
            >
              Matter Brief
            </button>
            <button
              onClick={() => handleRegen('client_letter', false)}
              className={`px-3 py-1 rounded-full-pill font-medium transition-colors ${
                draft.type === 'client_letter' ? 'bg-gallery-white text-ink shadow-xs' : 'text-ink-slate hover:text-ink'
              }`}
            >
              Client Letter
            </button>
          </div>

          {/* Model vs Deterministic Generation */}
          {modelStatus.state === 'connected' && (
            <button
              disabled={isGenerating}
              onClick={() => handleRegen(draft.type, true)}
              className="text-[12px] font-medium px-3.5 py-1.5 rounded-full-pill bg-proofline-blue hover:bg-proofline-navy text-white transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing...' : 'Local Gemma 4 Draft'}</span>
            </button>
          )}

          {/* Export Action */}
          <button
            onClick={handleExport}
            className="text-[12px] font-medium px-3.5 py-1.5 rounded-full-pill bg-ink text-white hover:bg-ink/85 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Draft Content Blocks */}
      <div className="space-y-4">
        {draft.blocks.map((block) => {
          const isNeedsReview = block.reviewStatus === 'needs_review';
          const isEditing = editingBlockId === block.id;

          return (
            <div
              key={block.id}
              className={`bg-gallery-white border rounded-2xl p-6 transition-all shadow-xs space-y-3 ${
                isNeedsReview
                  ? 'border-proofline-ochre/40 ring-1 ring-proofline-ochre/20'
                  : 'border-border-hairline'
              }`}
            >
              {/* Block Header */}
              <div className="flex items-center justify-between">
                {block.heading && (
                  <h3 className="text-[15px] font-semibold text-ink">
                    {block.heading}
                  </h3>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant={isNeedsReview ? 'ochre' : 'green'} size="sm">
                    {isNeedsReview ? 'Needs Review' : 'Verified Provenance'}
                  </Badge>

                  {isNeedsReview && (
                    <button
                      onClick={() => onApproveBlock(block.id)}
                      className="text-[11px] font-medium text-proofline-green hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approve Block</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Review Callout if flagged */}
              {isNeedsReview && (
                <div className="p-3 bg-proofline-ochre/10 rounded-xl border border-proofline-ochre/25 text-[12px] text-proofline-ochre flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Evidential Audit Flag:</span>
                    <span>{block.reviewReason || 'Contested factual assertion detected.'}</span>
                  </div>
                </div>
              )}

              {/* Body Text */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-[14px] bg-gallery-paper border border-border-hairline rounded-lg p-3 text-ink focus:border-proofline-blue focus:outline-none font-sans leading-relaxed"
                    rows={4}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingBlockId(null)}
                      className="text-[12px] px-3 py-1 text-ink-slate hover:text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(block.id)}
                      className="text-[12px] px-4 py-1 bg-ink text-white rounded-full-pill hover:bg-ink/85 font-medium"
                    >
                      Save Text
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[14px] text-ink leading-relaxed font-sans whitespace-pre-line">
                  {block.text}
                </div>
              )}

              {/* Citation Anchors Footer */}
              {block.spanIds.length > 0 && (
                <div className="pt-3 border-t border-border-hairline/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-steel font-mono">
                    <span className="font-semibold text-ink-slate">Anchors:</span>
                    {block.spanIds.map((sid) => {
                      const span = spansById.get(sid);
                      const doc = span ? docsById.get(span.documentId) : undefined;
                      return (
                        <button
                          key={sid}
                          onClick={() => span && onSelectSpan(span)}
                          className="px-2 py-0.5 rounded bg-gallery-mist border border-border-hairline text-ink hover:border-proofline-blue hover:text-proofline-blue transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span>{doc?.filename || sid}</span>
                          {span?.lineStart && <span>#L{span.lineStart}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(block.id, block.text)}
                      className="text-[11px] text-ink-slate hover:text-ink font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Block</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
