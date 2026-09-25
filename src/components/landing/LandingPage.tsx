import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Scale, 
  FileText, 
  Cpu, 
  Lock, 
  ExternalLink,
  BookOpen,
  Binary,
  FileCheck2,
  CalendarClock,
  Eye,
  Database,
  Download
} from 'lucide-react';
import { HeroDimensional } from './HeroDimensional.tsx';
import { LivingSpanAssembler } from './LivingSpanAssembler.tsx';
import { Badge } from '../common/Badge.tsx';
import { LegalModal } from '../common/LegalModal.tsx';

interface LandingPageProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
  onNewMatter?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWorkbench,
  onLoadSample,
  onNewMatter
}) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  return (
    <div className="pt-[52px] pb-24 space-y-24 max-w-[1240px] w-full max-w-full overflow-x-hidden mx-auto select-none font-sans text-ink">
      {/* =========================================================================
          HERO: DIMENSIONAL LAYERED HERO (4 INDEPENDENT PLANES)
          Adhering to references/hero-depth.md
         ========================================================================= */}
      <HeroDimensional
        onOpenWorkbench={onOpenWorkbench}
        onLoadSample={onLoadSample}
        onNewMatter={onNewMatter}
      />

      <div className="px-4 sm:px-8 space-y-24">
        {/* =========================================================================
            CHAPTER 1: RECOGNITION (THE VERACITY CRISIS IN CIVIL LITIGATION)
            Before vs After: Generic Hallucinations vs Proofline CPR 32.14 Grounding
           ========================================================================= */}
        <section className="space-y-6 max-w-[1080px] mx-auto" aria-labelledby="chapter-recognition-heading">
          <div className="text-center space-y-2 max-w-[700px] mx-auto">
            <Badge variant="ochre" size="sm">The Verification Crisis in Legal AI</Badge>
            <h2 id="chapter-recognition-heading" className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
              Why Generic AI Fails the Courtroom
            </h2>
            <p className="text-[13.5px] text-ink-slate leading-relaxed text-pretty">
              Standard commercial chatbots hallucinate non-existent case paragraphs, invent missing facts, and expose confidential client disclosures to external cloud servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Standard AI Hallucination & Risk */}
            <div className="bg-white border border-rose-200 rounded-[6px] p-6 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2 text-rose-800 font-semibold text-[13px]">
                  <AlertTriangle className="w-4 h-4 text-proofline-crimson" />
                  <span>Standard Commercial Chatbot (Severe Sanction Risk)</span>
                </div>
                <span className="text-[11px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Unverified
                </span>
              </div>

              <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded text-[12px] font-mono text-slate-800 space-y-2 leading-relaxed">
                <p className="text-rose-900 font-medium">
                  User Inquiry: &quot;Did Fujitsu alter accounts, and when was Alan Bates born?&quot;
                </p>
                <p className="text-slate-600">
                  &quot;According to paragraph 280 of the judgment, Fujitsu regularly altered subpostmaster accounts. Also, Alan Bates was born on 1 January 1970 and served as lead claimant.&quot;
                </p>
              </div>

              <ul className="text-[12.5px] text-rose-900 space-y-2 list-disc pl-5">
                <li>
                  <strong>Confabulated Paragraph Citation:</strong> Paragraph 280 of Fraser J discusses contract formation, not remote access.
                </li>
                <li>
                  <strong>Hallucinated Birth Date:</strong> The judgment record contains zero evidence of Bates&apos; date of birth.
                </li>
                <li>
                  <strong>Cloud Data Leakage:</strong> Client privileged disclosures transmitted over third-party API networks.
                </li>
              </ul>
            </div>

            {/* Card 2: Proofline Sovereign Evidential Core */}
            <div className="bg-white border border-emerald-200 rounded-[6px] p-6 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[13px]">
                  <ShieldCheck className="w-4 h-4 text-proofline-green" />
                  <span>Proofline Evidential Core (CPR 32.14 Grounded)</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Admissible
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50/40 border border-emerald-100 rounded text-[12px] font-mono text-slate-800 space-y-2 leading-relaxed">
                <p className="text-emerald-950 font-medium">
                  User Inquiry: &quot;Did Fujitsu alter accounts, and when was Alan Bates born?&quot;
                </p>
                <p className="text-slate-700">
                  1. Fraser J [549] verbatim: remote access does exist by design [Doc: 60b0b7a... Section L21].<br />
                  2. Strict Selective Abstention: No document in this matter proves birth date. 0 citations emitted.
                </p>
              </div>

              <ul className="text-[12.5px] text-emerald-950 space-y-2 list-disc pl-5">
                <li>
                  <strong>Exact Character Spans:</strong> Pinned to exact byte offsets and WebCrypto SHA-256 digests.
                </li>
                <li>
                  <strong>Strict Selective Abstention:</strong> Never guesses or confabulates unprovable propositions.
                </li>
                <li>
                  <strong>Sovereign Isolation:</strong> Persisted in local browser IndexedDB or local Ollama daemon.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 2: SOVEREIGN BOUNDARIES & ZERO CLOUD EGRESS
            Architectural integrity: Where client data lives and runs
           ========================================================================= */}
        <section className="bg-white border border-border-hairline rounded-[8px] p-6 sm:p-8 shadow-card space-y-6 max-w-[1080px] mx-auto" aria-labelledby="sovereign-boundaries-heading">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border-hairline pb-5">
            <div className="space-y-1.5 max-w-[700px]">
              <div className="flex items-center gap-2">
                <Badge variant="blue" size="sm">Legal Privilege Architecture</Badge>
                <span className="text-[11.5px] font-mono text-ink-steel">Air-Gapped Sovereign Computing</span>
              </div>
              <h2 id="sovereign-boundaries-heading" className="text-2xl font-serif text-ink tracking-tight">
                Clear Privacy Boundaries by Operational Mode
              </h2>
              <p className="text-[13px] text-ink-slate leading-relaxed">
                Proofline eliminates remote cloud transmission. All case documents, embeddings, and chat histories remain strictly on the client workstation:
              </p>
            </div>

            <button
              onClick={onOpenWorkbench}
              className="self-start md:self-auto px-4 py-2 bg-proofline-blue hover:bg-proofline-navy text-white text-[12px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer shrink-0"
            >
              <span>Launch Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px] font-mono">
            {/* Storage Boundary */}
            <div className="p-4 bg-[#FAF9F5] rounded-[6px] border border-border-hairline space-y-2">
              <div className="font-semibold text-ink flex items-center gap-1.5">
                <Database className="w-4 h-4 text-proofline-blue" />
                <span>Matter Storage</span>
              </div>
              <p className="text-ink-slate text-[11.5px] font-sans leading-relaxed">
                100% in local browser IndexedDB. Case files and witness statements never touch Vercel or cloud databases.
              </p>
              <div className="text-[10px] text-ink-steel pt-1 border-t border-border-hairline/60">
                Encrypted via WebCrypto AES-GCM
              </div>
            </div>

            {/* Model Runtime Boundary */}
            <div className="p-4 bg-[#FAF9F5] rounded-[6px] border border-border-hairline space-y-2">
              <div className="font-semibold text-ink flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-proofline-green" />
                <span>Model Execution</span>
              </div>
              <p className="text-ink-slate text-[11.5px] font-sans leading-relaxed">
                Runs on local Ollama loopback daemon (<code>127.0.0.1:11434</code>) or deterministic IRAC engine if completely offline.
              </p>
              <div className="text-[10px] text-ink-steel pt-1 border-t border-border-hairline/60">
                0 Bytes Network Egress
              </div>
            </div>

            {/* Static Distribution Boundary */}
            <div className="p-4 bg-[#FAF9F5] rounded-[6px] border border-border-hairline space-y-2">
              <div className="font-semibold text-ink flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-700" />
                <span>Web Asset Delivery</span>
              </div>
              <p className="text-ink-slate text-[11.5px] font-sans leading-relaxed">
                Static client-side bundle served via CDN. Zero user telemetry, zero analytics scripts, and zero advertising cookies.
              </p>
              <div className="text-[10px] text-ink-steel pt-1 border-t border-border-hairline/60">
                SRA Principle 2 Compliant
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 3: THE SIGNATURE MOVE (PEAK OF THE VISITOR EXPERIENCE)
            The Living Evidentiary Span Assembler & Contradiction Radar
           ========================================================================= */}
        <section aria-labelledby="signature-span-assembler">
          <LivingSpanAssembler
            onOpenWorkbench={onOpenWorkbench}
            onLoadSample={onLoadSample}
          />
        </section>

        {/* =========================================================================
            CHAPTER 4: THE FOUR-ACT EVIDENTIAL WORKFLOW
            Structured procedural progression from disclosure to court draft
           ========================================================================= */}
        <section className="space-y-6 max-w-[1080px] mx-auto" aria-labelledby="workflow-heading">
          <div className="space-y-2 max-w-[700px]">
            <Badge variant="blue" size="sm">Procedural Pipeline</Badge>
            <h2 id="workflow-heading" className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
              Proofline in Four Acts
            </h2>
            <p className="text-[13.5px] text-ink-slate leading-relaxed">
              From raw documentary disclosure to final practitioner verification, every step preserves cryptographic provenance:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Act 1 */}
            <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle hover:border-proofline-blue/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-ink-steel">ACT 1</span>
                <FileText className="w-4 h-4 text-proofline-blue" />
              </div>
              <h3 className="text-base font-semibold text-ink font-serif">
                Add Documents
              </h3>
              <p className="text-[12.5px] text-ink-slate leading-relaxed">
                Import contracts, disclosures, and transcripts locally. WebCrypto computes full 64-character SHA-256 digests immediately on ingestion.
              </p>
            </div>

            {/* Act 2 */}
            <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle hover:border-proofline-blue/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-ink-steel">ACT 2</span>
                <Eye className="w-4 h-4 text-proofline-green" />
              </div>
              <h3 className="text-base font-semibold text-ink font-serif">
                Inquire &amp; Ground
              </h3>
              <p className="text-[12.5px] text-ink-slate leading-relaxed">
                Submit complex legal queries. Every answer pins verbatim character offsets to primary sources, or explicitly abstains if proof is absent.
              </p>
            </div>

            {/* Act 3 */}
            <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle hover:border-proofline-blue/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-ink-steel">ACT 3</span>
                <Scale className="w-4 h-4 text-proofline-ochre" />
              </div>
              <h3 className="text-base font-semibold text-ink font-serif">
                Reconcile Conflicts
              </h3>
              <p className="text-[12.5px] text-ink-slate leading-relaxed">
                Side-by-side radar detects discrepancies between contemporaneous technical records and opposing witness statements automatically.
              </p>
            </div>

            {/* Act 4 */}
            <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle hover:border-proofline-blue/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-ink-steel">ACT 4</span>
                <FileCheck2 className="w-4 h-4 text-indigo-700" />
              </div>
              <h3 className="text-base font-semibold text-ink font-serif">
                Draft &amp; Sign
              </h3>
              <p className="text-[12.5px] text-ink-slate leading-relaxed">
                Assemble court submissions and letters with embedded citation anchors, ready for fee-earner CPR 32.14 verification and signature.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CHAPTER 5: SOVEREIGN WINDOWS DESKTOP INSTALLERS & OPEN SOURCE
            Stand-alone native packages with cryptographic checksums
           ========================================================================= */}
        <section className="bg-white border border-border-hairline rounded-[8px] p-6 sm:p-8 shadow-card space-y-6 max-w-[1080px] mx-auto" aria-labelledby="downloads-heading">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-[680px]">
              <div className="flex items-center gap-2">
                <Badge variant="green" size="sm">v1.0.0 Production Release</Badge>
                <span className="text-[12px] font-mono text-ink-steel">Windows Native Workstation (x64)</span>
              </div>
              <h2 id="downloads-heading" className="text-2xl font-serif text-ink tracking-tight">
                Download Sovereign Windows Desktop App
              </h2>
              <p className="text-[13.5px] text-ink-slate leading-relaxed">
                Install Proofline as a standalone Windows workstation application. Connects directly to local Ollama on loopback socket (<code>127.0.0.1:11434</code>) with zero cloud dependencies and cryptographic SHA-256 file hashing:
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:items-end gap-2">
              <a
                href="https://github.com/vaibhav4046/proofline/releases/tag/v1.0.0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium text-proofline-blue hover:underline flex items-center gap-1"
              >
                <span>View Release on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NSIS Standard Setup */}
            <div className="p-4 bg-[#FAF9F5] rounded-[6px] border border-border-hairline flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink text-[14px]">Windows NSIS Setup (.exe)</span>
                  <span className="text-[11px] font-mono text-ink-steel">2.64 MB</span>
                </div>
                <p className="text-[12px] text-ink-slate mt-1">
                  Single-user installer for Windows 10/11 with automatic desktop shortcut and environment auto-detection.
                </p>
                <div className="mt-2 text-[10px] font-mono text-ink-steel break-all bg-white p-2 rounded border border-border-hairline">
                  <span className="font-semibold text-ink">SHA-256: </span>
                  99B19A0E2FD7A3687818AF9924CB94D771D07AEAD012CF5EE5064FA81FC52A5A
                </div>
              </div>

              <a
                href="https://github.com/vaibhav4046/proofline/releases/download/v1.0.0/Proofline_1.0.0_x64-setup.exe"
                className="px-4 py-2 bg-proofline-blue hover:bg-proofline-navy text-white text-[12.5px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-2 shadow-subtle cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Proofline Setup (.exe)</span>
              </a>
            </div>

            {/* Enterprise MSI Package */}
            <div className="p-4 bg-[#FAF9F5] rounded-[6px] border border-border-hairline flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink text-[14px]">Enterprise Windows Installer (.msi)</span>
                  <span className="text-[11px] font-mono text-ink-steel">3.92 MB</span>
                </div>
                <p className="text-[12px] text-ink-slate mt-1">
                  Standard MSI package for enterprise law firm deployment, Group Policy (GPO), and silent IT installation.
                </p>
                <div className="mt-2 text-[10px] font-mono text-ink-steel break-all bg-white p-2 rounded border border-border-hairline">
                  <span className="font-semibold text-ink">SHA-256: </span>
                  B77B8659DEA209826F032151E1630DD116491352FC31C51CEF3D71506DD93D76
                </div>
              </div>

              <a
                href="https://github.com/vaibhav4046/proofline/releases/download/v1.0.0/Proofline_1.0.0_x64_en-US.msi"
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-border-hairline text-ink text-[12.5px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-2 shadow-subtle cursor-pointer"
              >
                <Download className="w-4 h-4 text-proofline-blue" />
                <span>Download Enterprise MSI (.msi)</span>
              </a>
            </div>
          </div>

          {/* Open Source CLI Setup Box */}
          <div className="pt-4 border-t border-border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-ink font-mono uppercase tracking-wider">
                Developer Local Workstation Setup
              </span>
              <span className="text-[11px] font-mono text-ink-steel">Node 20+ &bull; npm 10+</span>
            </div>

            <div className="bg-[#FAF9F5] border border-border-hairline rounded-[6px] p-4 font-mono text-[12px] text-ink leading-relaxed overflow-x-auto">
              <pre className="text-proofline-navy">
{`# 1. Clone repository
git clone https://github.com/vaibhav4046/proofline.git
cd proofline

# 2. Install dependencies & execute verified test suite
npm install
npm test -- --run

# 3. Launch local development server
npm run dev

# 4. (Optional) Run local Gemma 4 legal daemon via Ollama
ollama run gemma4:e2b-it-qat`}
              </pre>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SRA REGULATORY NOTICE & PROFESSIONAL RESPONSIBILITY
            Explicit compliance with Solicitors Regulation Authority standards
           ========================================================================= */}
        <section className="border-t border-border-hairline pt-10 space-y-3 max-w-[840px] mx-auto text-center text-[13px] text-ink-slate" aria-label="SRA Compliance Notice">
          <h3 className="font-semibold text-ink text-[14px]">
            Solicitors Regulation Authority (SRA) Standards &amp; Professional Responsibility
          </h3>
          <p className="leading-relaxed text-[12.5px]">
            Proofline is developed in direct alignment with SRA Generative AI Guidance. The application operates as an evidential organization and audit-trail workbench for qualified legal practitioners and researchers. It does not provide autonomous legal advice, submit court pleadings, or substitute for legal professional judgment. All draft court documents require fee-earner verification and signature under CPR 32.14.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11.5px] text-ink-steel font-mono">
            <span>Solo Builder: Vaibhav Lalwani (MSc, University of Liverpool)</span>
            <span>&bull;</span>
            <span>LexHack 2026 Submission</span>
            <span>&bull;</span>
            <span>Apache 2.0 / MIT Open Source</span>
          </div>
        </section>

        {/* =========================================================================
            PROFESSIONAL FOOTER & LEGAL MODAL TRIGGERS
           ========================================================================= */}
        <footer className="border-t border-border-hairline pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-ink-steel">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[2px] bg-ink flex items-center justify-center text-white text-[9px] font-mono font-bold">
              P
            </div>
            <span className="font-medium text-ink">Proofline &bull; Sovereign Legal Workbench</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveLegalModal('terms')} 
              className="hover:text-ink transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Terms of Use &amp; SRA Disclosures
            </button>
            <span>&bull;</span>
            <button 
              onClick={() => setActiveLegalModal('privacy')} 
              className="hover:text-ink transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Privacy Notice &amp; Data Boundaries
            </button>
            <span>&bull;</span>
            <a 
              href="https://github.com/vaibhav4046/proofline" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </div>

      {/* Legal Documentation Modal */}
      <LegalModal
        type={activeLegalModal || 'terms'}
        isOpen={activeLegalModal !== null}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
};
