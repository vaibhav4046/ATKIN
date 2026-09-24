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
  FileText,
  Mic,
  Plus,
  Clock,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import type { Draft, DraftType, DraftBlock, Span, Document, Matter, ModelStatus } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { exportDraftAsMarkdown } from '../../engine/draftingEngine.ts';
import { DictationParser, type AttendanceNote } from '../../engine/media/dictationParser.ts';

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
  onAppendDraftBlock?: (block: DraftBlock) => void;
}

const SAMPLE_DICTATION_TRANSCRIPT = `[00:00:15] [Solicitor]: Conference with client Eleanor Vance regarding ZenithTech defective laptop.
[00:01:20] [Eleanor Vance]: The power failure happened on 12 April 2026. The screen went black and wouldn't power on.
[00:02:45] [Solicitor]: Did you speak with ZenithTech support on 8 April?
[00:03:10] [Eleanor Vance]: Yes, on 8 April it froze twice, but on 12 April it suffered complete hardware collapse.
[00:04:30] [Solicitor]: Understood. The independent Apex report confirms micro-fractures in the motherboard solder.
[00:05:15] [Solicitor]: Action: Draft formal Letter Before Claim under Consumer Rights Act 2015 s.20 short-term right to reject.
[00:05:50] [Solicitor]: Action: Request full refund of £1,499 plus £120 diagnostic reimbursement by 14 days.`;

export const DraftTab: React.FC<DraftTabProps> = ({
  draft,
  matter,
  documents,
  spans,
  modelStatus,
  onSelectSpan,
  onRegenerateDraft,
  onUpdateDraftBlock,
  onApproveBlock,
  onAppendDraftBlock
}) => {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDictationModalOpen, setIsDictationModalOpen] = useState(false);
  const [transcriptInput, setTranscriptInput] = useState(SAMPLE_DICTATION_TRANSCRIPT);
  const [parsedAttendanceNote, setParsedAttendanceNote] = useState<AttendanceNote | null>(null);

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

  const handleParseDictation = () => {
    const note = DictationParser.parseToAttendanceNote(
      matter.id,
      transcriptInput,
      `Client Conference Attendance Note: ${matter.title}`
    );
    setParsedAttendanceNote(note);
  };

  const handleAppendAttendanceNoteToDraft = () => {
    if (!parsedAttendanceNote) return;

    let contentText = `${parsedAttendanceNote.formattedNote}\n\nKey Action Points:\n`;
    parsedAttendanceNote.actionItems.forEach(item => {
      contentText += `• ${item.action} (Assigned to: ${item.assignee})\n`;
    });

    const newBlock: DraftBlock = {
      id: `blk-attendance-${Date.now()}`,
      heading: 'Client Conference & Attendance Record (SRA Compliant)',
      text: contentText,
      claimIds: [],
      spanIds: [],
      reviewStatus: 'verified'
    };

    if (onAppendDraftBlock) {
      onAppendDraftBlock(newBlock);
    } else {
      // Fallback: update existing block
      draft.blocks.push(newBlock);
    }

    setIsDictationModalOpen(false);
    setParsedAttendanceNote(null);
  };

  return (
    <div className="space-y-6 max-w-[960px] mx-auto py-2">
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

          {/* Dictation / Attendance Note Studio Button */}
          <button
            onClick={() => setIsDictationModalOpen(true)}
            className="text-[12px] font-medium px-3.5 py-1.5 rounded-full-pill bg-gallery-paper border border-border-hairline hover:bg-gallery-mist text-ink transition-colors flex items-center gap-1.5 shadow-xs"
            title="Import voice dictation or meeting transcript"
          >
            <Mic className="w-3.5 h-3.5 text-proofline-blue" />
            <span>Attendance Note</span>
          </button>

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

      {/* Dictation & Attendance Note Studio Modal */}
      {isDictationModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-gallery-white border border-border-hairline rounded-card p-6 w-full max-w-[620px] shadow-stage space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-proofline-blue" />
                <h3 className="text-[16px] font-semibold text-ink">
                  Dictation &amp; SRA Attendance Note Studio
                </h3>
              </div>
              <Badge variant="blue" size="sm">Local Processing</Badge>
            </div>

            <p className="text-[12px] text-ink-slate">
              Parse raw conference audio transcripts into SRA file-audit compliant attendance notes with automatic billing unit calculation (6-min units) and action items.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-semibold text-ink-steel uppercase tracking-wider">
                  Raw Transcript / Voice Dictation Input:
                </label>
                <button
                  onClick={() => setTranscriptInput(SAMPLE_DICTATION_TRANSCRIPT)}
                  className="text-proofline-blue hover:underline"
                >
                  Load Sample Transcript
                </button>
              </div>

              <textarea
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                rows={6}
                className="w-full text-[12px] font-mono bg-gallery-paper border border-border-hairline rounded-lg p-3 text-ink focus:border-proofline-blue focus:outline-none leading-relaxed"
                placeholder="Paste conference transcript with [timestamps] and [speakers]..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleParseDictation}
                className="px-4 py-2 bg-proofline-blue text-white rounded-full-pill text-[12px] font-medium hover:bg-proofline-blue/90 transition-colors shadow-xs"
              >
                Parse SRA Attendance Note
              </button>
            </div>

            {/* Parsed Note Preview */}
            {parsedAttendanceNote && (
              <div className="p-4 bg-gallery-mist/40 border border-border-hairline rounded-xl space-y-3 pt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-ink">{parsedAttendanceNote.title}</span>
                  <Badge variant="green" size="sm">Audit-Ready</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-gallery-white rounded border border-border-hairline">
                    <span className="text-ink-steel block">Attendees</span>
                    <span className="text-ink font-semibold">{parsedAttendanceNote.attendees.join(', ') || 'Solicitor, Client'}</span>
                  </div>
                  <div className="p-2 bg-gallery-white rounded border border-border-hairline">
                    <span className="text-ink-steel block">Billing Units</span>
                    <span className="text-ink font-semibold">1 unit (6 mins)</span>
                  </div>
                </div>

                <div className="text-[12px] text-ink-slate font-sans whitespace-pre-line bg-gallery-white p-3 rounded-lg border border-border-hairline">
                  {parsedAttendanceNote.formattedNote}
                </div>

                {parsedAttendanceNote.actionItems.length > 0 && (
                  <div className="space-y-1 text-[11px]">
                    <span className="font-semibold text-ink block">Extracted Action Points:</span>
                    {parsedAttendanceNote.actionItems.map((act, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-ink-slate">
                        <CheckSquare className="w-3 h-3 text-proofline-blue shrink-0" />
                        <span><strong>{act.action}</strong> ({act.assignee})</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-border-hairline/60">
                  <button
                    onClick={() => setIsDictationModalOpen(false)}
                    className="text-[12px] px-3.5 py-1.5 text-ink-slate hover:text-ink font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAppendAttendanceNoteToDraft}
                    className="px-4 py-1.5 bg-ink text-white rounded-full-pill text-[12px] font-medium hover:bg-ink/85 transition-colors shadow-xs"
                  >
                    Append to Matter Draft
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
