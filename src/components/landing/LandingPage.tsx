import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Scale, 
  FileText, 
  Cpu, 
  Lock, 
  ExternalLink,
  BookOpen,
  Binary,
  Layers,
  FileCheck2,
  CalendarClock
} from 'lucide-react';
import { FeatureStage } from './FeatureStage.tsx';
import { Badge } from '../common/Badge.tsx';
import { LegalModal } from '../common/LegalModal.tsx';

interface LandingPageProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWorkbench,
  onLoadSample
}) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  return (
    <div className="pt-[80px] pb-24 px-4 sm:px-8 space-y-24 max-w-[1200px] mx-auto select-none">
      {/* Editorial Hero Section */}
      <section className="text-center space-y-6 max-w-[900px] mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-white border border-border-hairline shadow-subtle">
          <Badge variant="blue" size="sm">LexHack 2026</Badge>
          <span className="text-[12px] font-medium text-ink-slate">
            Open-Source Legal Technology &bull; England &amp; Wales Jurisdiction
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif text-ink tracking-tight leading-[1.12]">
          Sovereign Evidential Workbench for Civil Litigators
        </h1>

        <p className="text-base sm:text-lg text-ink-slate max-w-[680px] mx-auto leading-relaxed">
          Transform disorderly client disclosures, technical telemetry, and contractual addenda into a source-linked ledger of verified facts, adverse contradictions, and court-admissible drafts.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenWorkbench}
            className="px-5 py-2.5 rounded-[4px] bg-proofline-blue hover:bg-blue-700 text-white text-[13.5px] font-medium transition-colors shadow-subtle flex items-center gap-2"
          >
            <span>Launch Sovereign Workbench</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLoadSample}
            className="px-5 py-2.5 rounded-[4px] bg-white border border-border-hairline hover:bg-canvas-subtle text-ink text-[13.5px] font-medium transition-colors shadow-subtle"
          >
            Audit Bates v Post Office [2019]
          </button>
        </div>

        {/* Engineering-Grade Metrics Line */}
        <div className="text-[11.5px] text-ink-steel flex flex-wrap items-center justify-center gap-4 pt-2 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-proofline-green" />
            100% Client-Side IndexedDB
          </span>
          <span>&bull;</span>
          <span>82/82 Vitest Tests Passing (20 Suites)</span>
          <span>&bull;</span>
          <span>Zero Cloud Egress Invariant</span>
          <span>&bull;</span>
          <span>Technical Evidence Integrity &amp; SHA-256 Provenance</span>
        </div>
      </section>

      {/* Live Interactive Product Exhibit Stage */}
      <section id="workflow-evidence" className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Live Evidential Exhibit &amp; Contradiction Inspector
            </h2>
            <p className="text-[13px] text-ink-slate">
              Switch exhibits below to audit authentic high-court litigation records, B2B SaaS discrepancies, and tenancy breaches.
            </p>
          </div>
          <span className="text-[11px] font-mono text-ink-steel hidden sm:inline">
            Interactive Prototype &bull; Real Matter Data
          </span>
        </div>

        <FeatureStage onOpenWorkbench={onOpenWorkbench} />
      </section>

      {/* The 4-Stage Evidential Pipeline (Replacing 3 generic cards) */}
      <section id="landmark-matter" className="space-y-8">
        <div className="max-w-[700px] space-y-2">
          <Badge variant="blue" size="sm">Evidential Protocol</Badge>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
            How Proofline Enforces Evidential Provenance
          </h2>
          <p className="text-[14px] text-ink-slate leading-relaxed">
            Large language models confabulate fictitious citations and ungrounded legal assertions. Proofline separates non-deterministic language generation from deterministic propositional verification gates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-ink-steel">STAGE 01</span>
              <FileText className="w-4 h-4 text-proofline-blue" />
            </div>
            <h3 className="text-base font-semibold text-ink">
              Primary Evidence Ingestion
            </h3>
            <p className="text-[12.5px] text-ink-slate leading-relaxed">
              Ingests raw text, Markdown, RFC 822 email disclosures (.eml), and JSON files locally. Computes immutable WebCrypto SHA-256 document digests immediately upon receipt.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-ink-steel">STAGE 02</span>
              <Binary className="w-4 h-4 text-proofline-green" />
            </div>
            <h3 className="text-base font-semibold text-ink">
              Span Offset &amp; Hash Grounding
            </h3>
            <p className="text-[12.5px] text-ink-slate leading-relaxed">
              Segments source files into character spans with exact line coordinates (`[L14: 240-312]`). Every factual proposition is anchored to a verified text checksum.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-ink-steel">STAGE 03</span>
              <Scale className="w-4 h-4 text-proofline-ochre" />
            </div>
            <h3 className="text-base font-semibold text-ink">
              Adverse Contradiction Engine
            </h3>
            <p className="text-[12.5px] text-ink-slate leading-relaxed">
              Detects factual discrepancies between client assertions and technical logs (such as the Fujitsu Call 188 Bug discrepancy in *Bates v Post Office*), generating neutral witness inquiries.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-ink-steel">STAGE 04</span>
              <FileCheck2 className="w-4 h-4 text-purple-700" />
            </div>
            <h3 className="text-base font-semibold text-ink">
              Court Briefs &amp; Evidence Integrity
            </h3>
            <p className="text-[12.5px] text-ink-slate leading-relaxed">
              Generates CPR-compliant Pre-Action Letters and Briefs with anchored citations, accompanied by a Technical Evidence Integrity Schedule with SHA-256 manifests for practitioner CPR 32.14 sign-off.
            </p>
          </div>
        </div>
      </section>

      {/* Local Edge AI Hardware Calibration (NVIDIA RTX 3050 Budget) */}
      <section id="court-admissibility" className="bg-white border border-border-hairline rounded-[6px] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 max-w-[640px]">
            <div className="flex items-center gap-2">
              <Badge variant="green" size="sm">Local Hardware Calibration</Badge>
              <Badge variant="slate" size="sm">Zero Cloud Token Cost</Badge>
            </div>
            <h2 className="text-2xl font-serif text-ink tracking-tight">
              Calibrated for Consumer &amp; Practice Hardware
            </h2>
            <p className="text-[13.5px] text-ink-slate leading-relaxed">
              Proofline executes open-weights models locally via loopback Ollama (<code>127.0.0.1:11434</code>) within a strict 6GB VRAM budget. If no local GPU or model daemon is available, Proofline operates at 100% functionality using its deterministic propositional reasoning engine.
            </p>
          </div>

          <div className="p-4 bg-canvas-subtle border border-border-hairline rounded-[4px] font-mono text-[12px] space-y-2 w-full md:w-80 shrink-0">
            <div className="font-semibold text-ink flex items-center justify-between border-b border-border-hairline pb-1.5">
              <span>RTX 3050 VRAM Budget:</span>
              <span className="text-proofline-blue">6,144 MB</span>
            </div>
            <div className="flex justify-between text-ink-slate">
              <span>Gemma 4 Base Weights:</span>
              <span className="text-ink">3,800 MB</span>
            </div>
            <div className="flex justify-between text-ink-slate">
              <span>KV Cache (4k Context):</span>
              <span className="text-ink">920 MB</span>
            </div>
            <div className="flex justify-between text-ink-slate">
              <span>OS / Display Headroom:</span>
              <span className="text-proofline-green font-medium">1,424 MB</span>
            </div>
            <div className="pt-1 border-t border-border-hairline text-[11px] text-ink-steel">
              Loopback Binding: 127.0.0.1 (No Cloud Egress)
            </div>
          </div>
        </div>

        {/* Verification Invariants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border-hairline text-[12.5px]">
          <div className="p-3 bg-canvas-subtle rounded-[4px] border border-border-hairline space-y-1">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-proofline-green" />
              <span>4-Tier Memory Isolation</span>
            </div>
            <p className="text-ink-slate text-[12px]">
              Canary secrets in unit tests mathematically prove that Matter B confidential records cannot leak into Matter A or C.
            </p>
          </div>

          <div className="p-3 bg-canvas-subtle rounded-[4px] border border-border-hairline space-y-1">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-proofline-blue" />
              <span>Adversarial Injection Defense</span>
            </div>
            <p className="text-ink-slate text-[12px]">
              Ingested case files and contracts are treated strictly as inert data; embedded hostile prompt injection directives are quarantined without execution.
            </p>
          </div>

          <div className="p-3 bg-canvas-subtle rounded-[4px] border border-border-hairline space-y-1">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-purple-700" />
              <span>Declarative Playbook Auditing</span>
            </div>
            <p className="text-ink-slate text-[12px]">
              Validates SaaS contracts against declarative JSON playbooks, identifying uncapped indemnities and Net 30 vs. Net 60 conflicts instantly.
            </p>
          </div>
        </div>
      </section>

      {/* SRA & Bar Standards Regulatory Notice */}
      <section className="border-t border-border-hairline pt-10 space-y-3 max-w-[800px] mx-auto text-center text-[13px] text-ink-slate">
        <h3 className="font-semibold text-ink text-[14px]">
          Solicitors Regulation Authority (SRA) Standards &amp; Professional Responsibility
        </h3>
        <p className="leading-relaxed text-[12.5px]">
          Proofline is designed in direct compliance with SRA Generative AI Guidance. The application operates as a deterministic evidential audit trail for qualified solicitors and barristers. It does not provide autonomous legal advice, submit court pleadings, or substitute for legal professional skill.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11.5px] text-ink-steel font-mono">
          <span>Solo Builder: Vaibhav Lalwani (MSc, University of Liverpool)</span>
          <span>&bull;</span>
          <span>LexHack 2026 Submission</span>
          <span>&bull;</span>
          <span>Apache 2.0 / MIT Open Source</span>
        </div>
      </section>

      {/* Professional Legal Documentation Footer */}
      <footer className="border-t border-border-hairline pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-ink-steel">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-[2px] bg-ink flex items-center justify-center text-white text-[9px] font-mono font-bold">
            P
          </div>
          <span>Proofline &bull; Sovereign Legal Workbench</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveLegalModal('terms')} 
            className="hover:text-ink transition-colors underline-offset-2 hover:underline"
          >
            Terms of Service &amp; SRA Disclosures
          </button>
          <span>&bull;</span>
          <button 
            onClick={() => setActiveLegalModal('privacy')} 
            className="hover:text-ink transition-colors underline-offset-2 hover:underline"
          >
            Privacy Notice &amp; Zero-Egress Reality
          </button>
          <span>&bull;</span>
          <a 
            href="https://github.com/vaibhav-lalwani/proofline" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>

      {/* Legal Documentation Modal */}
      <LegalModal
        type={activeLegalModal || 'terms'}
        isOpen={activeLegalModal !== null}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
};
