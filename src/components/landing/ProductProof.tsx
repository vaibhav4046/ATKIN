import React, { useState } from 'react';
import { ShieldCheck, Check, Copy, FileText, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { PRODUCT_PROOF } from '../../content/productCopy';
import { motion } from 'framer-motion';

interface ProductProofProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
}

export const ProductProof: React.FC<ProductProofProps> = ({
  onOpenWorkbench,
  onLoadSample
}) => {
  const [copied, setCopied] = useState(false);
  const proof = PRODUCT_PROOF.contractFixture;

  const handleCopyCitation = () => {
    const citation = `[Alder Peak MSA, Clause 3.2 #L20; SHA-256: ${proof.sha256Digest.slice(0, 16)}...]`;
    navigator.clipboard?.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="proof" className="py-20 px-4 sm:px-8 border-b border-atkin-border max-w-[1180px] mx-auto w-full select-none">
      {/* Chapter header tag */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-10 border-b border-atkin-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-atkin-muted">
            <span className="font-semibold text-atkin-ink">02 REAL PRODUCT PROOF</span>
            <span>/</span>
            <span>VERIFIED GROUNDING ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-atkin-ink tracking-tight font-normal">
            Every legal assertion anchored to exact source spans.
          </h2>
        </div>
        <div className="text-[12px] font-mono text-atkin-muted sm:text-right">
          <div>Matter: Alder Peak Systems Ltd</div>
          <div className="text-atkin-ink font-medium">Demo fixture · Verified</div>
        </div>
      </div>

      {/* Proof Stage: Real Q&A Inspection Card */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Query & Grounded Answer */}
        <div className="lg:col-span-7 rounded-[8px] bg-atkin-surface border border-atkin-border shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-atkin-border pb-4">
            <div className="flex items-center gap-2 text-[12px] font-mono">
              <span className="px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-muted">INQUIRY</span>
              <span className="text-atkin-ink font-medium">Termination Notice Duration</span>
            </div>
            <span className="text-[11px] font-mono text-atkin-muted">
              atkin-sovereign-core
            </span>
          </div>

          {/* User Prompt */}
          <div className="p-3.5 rounded-[4px] bg-atkin-bg border border-atkin-border text-[13px] font-sans text-atkin-ink flex items-start gap-2.5">
            <CornerDownRight className="w-4 h-4 text-atkin-muted shrink-0 mt-0.5" />
            <p className="font-normal italic">
              &quot;{proof.query}&quot;
            </p>
          </div>

          {/* Assistant Grounded Answer */}
          <div className="space-y-4 pt-1">
            <div className="text-[14px] text-atkin-ink leading-relaxed font-sans space-y-3">
              <p>
                Yes. Under <strong>{proof.clauseReference}</strong> of the Master Services Agreement, either party holds the right to terminate for convenience without cause.
              </p>
              <p className="text-[13px] text-atkin-muted">
                The mandatory notice duration is precisely <strong>37 calendar days</strong> prior written notice.
              </p>
            </div>

            {/* Verbatim Grounded Quote Card */}
            <div className="p-4 rounded-[6px] bg-atkin-bg-subtle border-l-2 border-atkin-ink space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-atkin-muted">
                <span className="font-semibold text-atkin-ink">VERBATIM RECORD (EXHIBIT A)</span>
                <span>{proof.clauseReference} · {proof.lineOffset}</span>
              </div>
              <blockquote className="text-[13px] font-serif text-atkin-ink italic leading-relaxed">
                &quot;{proof.verbatimQuote}&quot;
              </blockquote>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-atkin-muted border-t border-atkin-border/60">
                <span>Span: {proof.characterSpan.start}..{proof.characterSpan.end}</span>
                <button
                  onClick={handleCopyCitation}
                  className="hover:text-atkin-ink flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-atkin-ink" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Citation copied' : 'Copy citation'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Verification Footer Bar */}
          <div className="pt-4 border-t border-atkin-border flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-atkin-ink" />
              <span className="text-atkin-ink font-medium">{proof.verificationStatus}</span>
            </div>
            <span className="text-atkin-muted">{proof.admissibilityNotice}</span>
          </div>
        </div>

        {/* Right: Technical Provenance & Source Metadata */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-[8px] bg-atkin-surface border border-atkin-border p-6 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-atkin-ink font-semibold">
              Source Provenance Ledger
            </h3>
            <p className="text-[12.5px] text-atkin-muted leading-relaxed font-sans">
              Unlike generic AI platforms that synthesize answers from unverified weights, ATKIN requires every factual proposition to be anchored to a cryptographically validated document offset.
            </p>

            <div className="space-y-3 pt-2 text-[11.5px] font-mono">
              <div className="p-3 rounded bg-atkin-bg border border-atkin-border space-y-1">
                <div className="text-atkin-muted text-[10px]">INDEXED ARTIFACT</div>
                <div className="text-atkin-ink font-medium truncate">{proof.sourceDocument}</div>
              </div>

              <div className="p-3 rounded bg-atkin-bg border border-atkin-border space-y-1">
                <div className="text-atkin-muted text-[10px]">DOCUMENT DIGEST</div>
                <div className="text-atkin-muted text-[10px] break-all">{proof.sha256Digest}</div>
              </div>

              <div className="p-3 rounded bg-atkin-bg border border-atkin-border space-y-1">
                <div className="text-atkin-muted text-[10px]">STRICT SELECTIVE ABSTENTION</div>
                <div className="text-atkin-ink text-[11px] font-sans">
                  If the source record does not contain the answer, ATKIN emits 0 citations and explicitly abstains rather than inventing terms.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onLoadSample}
                className="w-full py-2.5 rounded-[4px] border border-atkin-border bg-atkin-bg hover:bg-atkin-bg-subtle text-atkin-ink font-medium text-[12.5px] font-sans flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 text-atkin-muted" />
                <span>Examine Alder Peak matter in workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
