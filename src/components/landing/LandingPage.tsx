import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileSignature, 
  Cpu, 
  Lock, 
  Terminal,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { FeatureStage } from './FeatureStage.tsx';
import { Badge } from '../common/Badge.tsx';

interface LandingPageProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWorkbench,
  onLoadSample
}) => {
  return (
    <div className="pt-[110px] pb-24 px-4 sm:px-8 space-y-28 max-w-[1240px] mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-[860px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full-pill bg-gallery-white border border-border-hairline shadow-xs">
          <Badge variant="blue" size="sm">LexHack 2026</Badge>
          <span className="text-[12px] font-medium text-ink-slate">
            Open-Source Legal Tech &amp; AI Safety Track
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-ink leading-[1.05]">
          Every claim has a trail.
        </h1>

        <p className="text-lg sm:text-[19px] text-ink-slate max-w-[660px] mx-auto leading-relaxed">
          A local-first matter workspace for England &amp; Wales civil litigation. Turn disorderly client files into a source-linked map of facts, contradictions, authorities, and audit-ready drafts.
        </p>

        {/* Hero CTA Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenWorkbench}
            className="px-6 py-3 rounded-full-pill bg-proofline-blue hover:bg-proofline-navy text-white text-[15px] font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <span>Try the workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLoadSample}
            className="px-6 py-3 rounded-full-pill bg-gallery-white border border-border-hairline hover:bg-gallery-mist text-ink text-[15px] font-medium transition-colors shadow-xs"
          >
            Load Sample Consumer Matter
          </button>
        </div>

        <div className="text-[12px] text-ink-steel flex items-center justify-center gap-2 pt-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-proofline-green" />
          <span>Zero cloud uploads · 100% Client IndexedDB · Verified Deterministic Engine</span>
        </div>
      </section>

      {/* Product Feature Stage (1180px borderless stage) */}
      <section className="pt-4">
        <FeatureStage onOpenWorkbench={onOpenWorkbench} />
      </section>

      {/* 3 Core Benefit Pillars */}
      <section id="why-it-matters" className="space-y-12">
        <div className="text-center max-w-[600px] mx-auto space-y-2">
          <h2 className="text-3xl font-semibold text-ink tracking-tight">
            Built for how lawyers actually audit evidence.
          </h2>
          <p className="text-[15px] text-ink-slate">
            Generic chatbots summarize PDFs and hallucinate citations. Proofline enforces provenance down to the byte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-gallery-white border border-border-hairline rounded-card p-7 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-proofline-blue/10 text-proofline-blue flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-ink">
              Follow the fact.
            </h3>
            <p className="text-[14px] text-ink-slate leading-relaxed">
              Source before prose. Every factual proposition is anchored to exact document offsets, line numbers, and SHA-256 hashes. If a citation doesn't match underlying text, the verifier blocks it.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-gallery-white border border-border-hairline rounded-card p-7 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-proofline-ochre/10 text-proofline-ochre flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-ink">
              Catch the contradiction.
            </h3>
            <p className="text-[14px] text-ink-slate leading-relaxed">
              Contradiction is a first-class citizen. Adverse records are surfaced alongside client assertions. A later email that disputes defect onset changes claim status and marks drafts for review.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-gallery-white border border-border-hairline rounded-card p-7 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-proofline-green/10 text-proofline-green flex items-center justify-center">
              <FileSignature className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-ink">
              Draft with receipts.
            </h3>
            <p className="text-[14px] text-ink-slate leading-relaxed">
              Generate structured litigation briefs and client letters with sentence-by-sentence source badges. Export clean Markdown with an automated evidential citation index and manifest.
            </p>
          </div>
        </div>
      </section>

      {/* Local Gemma 4 & Privacy Reality */}
      <section id="local-gemma" className="bg-gallery-white border border-border-hairline rounded-card p-8 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="blue" size="sm">Local AI Innovation</Badge>
              <Badge variant="green" size="sm">Apache 2.0 Licensed</Badge>
            </div>
            <h2 className="text-2xl font-bold text-ink tracking-tight">
              Local Gemma 4 Integration: Honest Reality
            </h2>
            <p className="text-[14px] text-ink-slate mt-1 max-w-[620px] leading-relaxed">
              Connect to your local Ollama instance on loopback (<code>127.0.0.1:11434</code>) running Gemma 4 (E2B / E4B). If unavailable, Proofline falls back smoothly to its deterministic offline engine.
            </p>
          </div>

          <button
            onClick={onOpenWorkbench}
            className="px-5 py-2.5 rounded-full-pill bg-ink text-white hover:bg-ink/85 text-[13px] font-medium transition-colors shrink-0 shadow-sm"
          >
            Launch Live Demo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-[13px]">
          <div className="p-4 rounded-xl bg-gallery-paper border border-border-hairline space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-proofline-green" />
              <span>Zero-Cloud Transmission</span>
            </div>
            <p className="text-ink-slate text-[12px]">
              Case files never touch external servers or third-party inference APIs. Total client confidentiality.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gallery-paper border border-border-hairline space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-proofline-blue" />
              <span>Deterministic Citation Gate</span>
            </div>
            <p className="text-ink-slate text-[12px]">
              Small or large models can propose text, but only verified document spans may become clickable citations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gallery-paper border border-border-hairline space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-ink-steel" />
              <span>Lightweight Quantization</span>
            </div>
            <p className="text-ink-slate text-[12px]">
              Tested on laptop RTX 3050 (6GB VRAM) with <code>gemma4:e2b</code> and <code>gemma4:e4b</code> variants.
            </p>
          </div>
        </div>
      </section>

      {/* SRA Guidance & Safety Warning Section */}
      <section id="rules-compliance" className="border-t border-border-hairline pt-12 space-y-4 text-center max-w-[780px] mx-auto text-[13px] text-ink-slate">
        <h3 className="font-semibold text-ink text-base">
          Solicitors Regulation Authority (SRA) AI Guidance Compliance
        </h3>
        <p className="leading-relaxed">
          Proofline is designed in direct response to the SRA guidance warning against unverified AI outputs, confidentiality breaches, and fabricated legal citations. Proofline does not generate automated court filings or provide personalized legal advice; it produces an evidential audit trail for qualified solicitors.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[12px] text-ink-steel">
          <span>Author: Vaibhav Lalwani (MSc, Univ. of Liverpool)</span>
          <span>·</span>
          <span>LexHack 2026 Submission</span>
          <span>·</span>
          <span>Open Source (MIT / Apache 2.0)</span>
        </div>
      </section>
    </div>
  );
};
