import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Check, ShieldAlert, FileText, ExternalLink } from 'lucide-react';
import type { Span, Document } from '../../types/index.ts';
import { Badge } from './Badge.tsx';
import { checkPromptInjectionRisk } from '../../engine/verifier.ts';

interface SourceInspectorProps {
  span: Span | null;
  document: Document | null;
  onClose: () => void;
  isExcluded?: boolean;
}

export const SourceInspector: React.FC<SourceInspectorProps> = ({
  span,
  document,
  onClose,
  isExcluded = false
}) => {
  const [copied, setCopied] = useState(false);

  if (!span || !document) {
    return (
      <aside className="w-[300px] bg-gallery-paper border-l border-border-hairline p-5 text-center flex flex-col items-center justify-center text-ink-steel shrink-0 select-none">
        <FileText className="w-8 h-8 text-ink-steel/40 mb-2" />
        <div className="text-[13px] font-medium text-ink">Source Inspector</div>
        <div className="text-[11px] text-ink-slate mt-1 max-w-[200px]">
          Click any fact, claim badge, or citation in the workbench to inspect verified text provenance.
        </div>
      </aside>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(span.exactText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInjection = checkPromptInjectionRisk(span.exactText);

  return (
    // 110px is the real application chrome: the fixed GlobalNav (52px) plus the
    // TopRail (58px). This panel used to say 108px, a leftover from when the rail
    // was 56px, so once the window scrolled and this panel pinned, its top edge
    // sat 2px underneath the rail and the panel's own header border was hidden.
    <aside className="w-[320px] bg-gallery-paper border-l border-border-hairline flex flex-col justify-between shrink-0 h-[calc(100vh-110px)] sticky top-[110px] overflow-y-auto">
      <div>
        {/* Header */}
        <div className="p-4 border-b border-border-hairline flex items-start justify-between bg-gallery-white">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-steel uppercase tracking-wider">
              <span>Source Provenance</span>
            </div>
            <div className="text-[14px] font-semibold text-ink truncate max-w-[230px] mt-0.5">
              {document.filename}
            </div>
            <div className="text-[11px] text-ink-slate font-mono mt-0.5">
              Lines {span.lineStart ?? 1}–{span.lineEnd ?? 1} · {span.startOffset}..{span.endOffset}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gallery-mist text-ink-slate hover:text-ink transition-colors"
            aria-label="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verification Status */}
        <div className="p-4 space-y-3">
          {isInjection ? (
            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-800 text-[12px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Adversarial Injection Quarantined</span>
                <span>This span contains an adversarial directive. ATKIN isolates it strictly as inert source text.</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[12px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-medium">Character-Grounded in Source Text</span>
            </div>
          )}

          {isExcluded && (
            <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
              <span className="font-semibold font-mono uppercase text-[10px] bg-amber-200/60 px-1 rounded">Excluded</span>
              <span>This document is excluded from active query context.</span>
            </div>
          )}

          {/* Exact Extracted Text */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-atkin-muted mb-1.5">
              <span>Verified Excerpt</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-atkin-ink hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 bg-atkin-surface rounded border border-atkin-border text-[13px] text-atkin-ink font-sans leading-relaxed">
              <mark className="bg-amber-100 text-black p-0.5 rounded">
                "{span.exactText}"
              </mark>
            </div>
          </div>

          {/* Integrity Metadata */}
          <div className="pt-2 border-t border-border-hairline space-y-1.5 text-[11px] text-ink-steel">
            <div className="flex justify-between">
              <span>Span Checksum:</span>
              <span className="font-mono text-ink">{span.checksum}</span>
            </div>
            <div className="flex justify-between">
              <span>Document SHA-256:</span>
              <span className="font-mono text-ink" title={document.sha256}>
                {document.sha256.slice(0, 14)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span>Storage Location:</span>
              <span className="text-ink font-medium">Browser IndexedDB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border-hairline bg-gallery-mist/50 text-[11px] text-ink-steel text-center">
        Deterministic Verification Gate: Active
      </div>
    </aside>
  );
};
