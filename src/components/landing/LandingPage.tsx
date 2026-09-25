import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Scale, 
  FileText, 
  Cpu, 
  Lock, 
  ExternalLink,
  BookOpen,
  Binary,
  Layers,
  FileCheck2,
  CalendarClock,
  Sparkles,
  HelpCircle,
  Eye,
  GitBranch,
  Terminal,
  Database
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
  const [demoQuery, setDemoQuery] = useState<'remote-access' | 'governing-law' | 'abstention'>('remote-access');

  const demoResponses = {
    'remote-access': {
      query: 'Did Fujitsu engineering staff have covert remote access to alter branch accounts?',
      status: 'verified',
      matter: 'Bates & Others v Post Office Ltd [2019] EWHC 3408 (QB)',
      jurisdiction: 'England and Wales',
      citation: 'Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt § L21 (Offset 1644–1875)',
      sha256: '60b0b7a6b53e2cd3d4499f2c54e8a1c94dc07d22c0acf064e24d293d9429af67',
      text: '[549] "The evidence in this trial has made it clear that such remote access to branch accounts does exist; such remote access is possible by employees within Fujitsu; it does exist specifically by design; and it has been used in the past."',
      finding: 'Judicial finding establishes Fujitsu remote account modification by design, refuting Post Office public claims of computer inviolability.',
      actionType: 'Cite in Court Brief'
    },
    'governing-law': {
      query: 'What is the governing law of this contract, and does it conflict with this matter?',
      status: 'flagged',
      matter: 'NovaCorp Solutions Inc v Meridian Cloud Technologies Ltd',
      jurisdiction: 'England and Wales (Matter Jurisdiction)',
      citation: 'Meridian_Master_Cloud_Agreement_2026.pdf § Section 13 (Offset 2140–2295)',
      sha256: 'af14d77e7ae11632ad2decd7a9b49d0fd0005604d3dbe6500221a51557a08808',
      text: '"This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles."',
      finding: 'Jurisdictional Mismatch: Matter is docketed in England and Wales, but Section 13 specifies State of Delaware law. English court will evaluate Rome I Regulation and foreign law expert requirements.',
      actionType: 'Review Conflict'
    },
    'abstention': {
      query: 'Alan Bates was born on 1 January 1970.',
      status: 'abstained',
      matter: 'Bates & Others v Post Office Ltd [2019] EWHC 3408 (QB)',
      jurisdiction: 'England and Wales',
      citation: 'Zero Documents Cited (Evidential Abstention Triggered)',
      sha256: 'None emitted — Factual predicate absent from matter record',
      text: 'No uploaded document in this matter contains evidence proving that Alan Bates was born on 1 January 1970. In accordance with evidential abstention principles, no assertion is made and no citations are provided.',
      finding: 'Strict Evidential Abstention: Unlike ungrounded LLMs that confabulate birth dates, Proofline verifies propositions against the matter corpus and emits 0 citations when unsupported.',
      actionType: 'Abstention Enforced'
    }
  };

  const currentDemo = demoResponses[demoQuery];

  return (
    <div className="pt-[72px] pb-24 px-4 sm:px-8 space-y-24 max-w-[1240px] mx-auto select-none font-sans text-ink">
      {/* Editorial Hero Section */}
      <section className="text-center space-y-6 max-w-[940px] mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-white border border-border-hairline shadow-subtle">
          <Badge variant="blue" size="sm">LexHack 2026</Badge>
          <span className="text-[12px] font-medium text-ink-slate font-mono">
            Open-Source Legal Technology &bull; England &amp; Wales Civil Litigation
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-serif text-ink tracking-tight leading-[1.08]">
          A case file you can question.<br />
          <span className="text-ink-slate italic font-serif">An answer you can verify.</span>
        </h1>

        <p className="text-base sm:text-lg text-ink-slate max-w-[700px] mx-auto leading-relaxed">
          Bring documents into a private matter, trace claims to their exact sources, surface adverse conflicts, and draft with a verifiable review trail.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={onLoadSample}
            className="px-6 py-3 rounded-[4px] bg-proofline-blue hover:bg-proofline-navy text-white text-[13.5px] font-medium transition-colors shadow-subtle flex items-center gap-2 cursor-pointer"
          >
            <span>Explore a Sample Matter</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenWorkbench}
            className="px-6 py-3 rounded-[4px] bg-white border border-border-hairline hover:bg-canvas-subtle text-ink text-[13.5px] font-medium transition-colors shadow-subtle cursor-pointer"
          >
            Create a Private Matter
          </button>
        </div>

        {/* Truthful Mode Label & System Invariants */}
        <div className="text-[12px] text-ink-steel flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3 font-mono">
          <span className="flex items-center gap-1.5 text-proofline-green font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Browser-Local IndexedDB
          </span>
          <span>&bull;</span>
          <span>Deterministic IRAC Core</span>
          <span>&bull;</span>
          <span>Optional Local Gemma 4 Daemon</span>
          <span>&bull;</span>
          <span>89 Vitest Checks Passing (21 Suites)</span>
        </div>
      </section>

      {/* The Problem Litigators Recognize: Before vs After */}
      <section className="space-y-6 max-w-[1080px] mx-auto">
        <div className="text-center space-y-2 max-w-[680px] mx-auto">
          <Badge variant="ochre" size="sm">The Verification Crisis in Legal AI</Badge>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
            Why Generic AI Fails the Courtroom
          </h2>
          <p className="text-[13.5px] text-ink-slate leading-relaxed">
            Standard conversational chatbots hallucinate non-existent paragraph citations, invent missing facts, and leak client documents to remote cloud servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Standard AI Hallucination */}
          <div className="bg-white border border-rose-200 rounded-[6px] p-6 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-[13px]">
                <AlertTriangle className="w-4 h-4 text-proofline-crimson" />
                <span>Standard Generative AI (High Regulatory Risk)</span>
              </div>
              <span className="text-[11px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Unverified</span>
            </div>

            <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded text-[12px] font-mono text-slate-800 space-y-2 leading-relaxed">
              <p className="text-rose-900 font-medium">Prompt: "Did Fujitsu alter accounts, and when was Alan Bates born?"</p>
              <p className="text-slate-600">
                "According to paragraph 280 of the judgment, Fujitsu regularly altered subpostmaster accounts. Also, Alan Bates was born on 1 January 1970 and served as lead claimant."
              </p>
            </div>

            <ul className="text-[12.5px] text-rose-900 space-y-1.5 list-disc pl-5">
              <li><strong>Confabulated Paragraphs:</strong> Citations do not match the real judgment text.</li>
              <li><strong>Hallucinated Birth Date:</strong> The judgment contains zero evidence of Bates&apos; birth date.</li>
              <li><strong>Cloud Egress:</strong> Client disclosure transmitted to commercial cloud LLM APIs.</li>
            </ul>
          </div>

          {/* Card 2: Proofline Invariant */}
          <div className="bg-white border border-emerald-200 rounded-[6px] p-6 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[13px]">
                <ShieldCheck className="w-4 h-4 text-proofline-green" />
                <span>Proofline Sovereign Evidential Core (CPR 32.14 Grounded)</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Verifiable</span>
            </div>

            <div className="p-3.5 bg-emerald-50/40 border border-emerald-100 rounded text-[12px] font-mono text-slate-800 space-y-2 leading-relaxed">
              <p className="text-emerald-950 font-medium">Prompt: "Did Fujitsu alter accounts, and when was Alan Bates born?"</p>
              <p className="text-slate-700">
                1. Fraser J [549] verbatim: remote access does exist by design [Doc: 60b0b7a... § L21].<br />
                2. Strict Selective Abstention: No document in this matter proves birth date. 0 citations emitted.
              </p>
            </div>

            <ul className="text-[12.5px] text-emerald-950 space-y-1.5 list-disc pl-5">
              <li><strong>Exact Character-Spans:</strong> Pinned to exact byte offsets and SHA-256 digests.</li>
              <li><strong>Strict Selective Abstention:</strong> Never guesses or invents unprovable facts.</li>
              <li><strong>Sovereign Privacy:</strong> Persisted in local browser IndexedDB; optional local Ollama.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Proofline in Four Acts */}
      <section className="space-y-8">
        <div className="max-w-[720px] space-y-2">
          <Badge variant="blue" size="sm">The Evidential Workflow</Badge>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
            Proofline in Four Acts
          </h2>
          <p className="text-[13.5px] text-ink-slate leading-relaxed">
            From raw documentary disclosures to practitioner sign-off, every stage preserves provenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Act 1 */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle hover:border-proofline-blue/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-ink-steel">ACT 01</span>
              <FileText className="w-4 h-4 text-proofline-blue" />
            </div>
            <h3 className="text-base font-semibold text-ink">
              Add Documents
            </h3>
            <p className="text-[12.5px] text-ink-slate leading-relaxed">
              Import case files, witness statements, and contracts locally. WebCrypto computes full 64-character SHA-256 digests immediately upon arrival.
            </p>
          </div>

          {/* Act 2 */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle hover:border-proofline-blue/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-ink-steel">ACT 02</span>
              <Eye className="w-4 h-4 text-proofline-green" />
            </div>
            <h3 className="text-base font-semibold text-ink">
              Ask &amp; Inspect
            </h3>
            <p className="text-[12.5px] text-ink-slate leading-relaxed">
              Submit legal inquiries. Every answer highlights exact character-span offsets in the original text, or abstains if the record lacks proof.
            </p>
          </div>

          {/* Act 3 */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle hover:border-proofline-blue/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-ink-steel">ACT 03</span>
              <Scale className="w-4 h-4 text-proofline-ochre" />
            </div>
            <h3 className="text-base font-semibold text-ink">
              Compare Conflicts
            </h3>
            <p className="text-[12.5px] text-ink-slate leading-relaxed">
              Side-by-side radar detects factual contradictions between contemporaneous technical logs and opposing witness statements automatically.
            </p>
          </div>

          {/* Act 4 */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 space-y-2.5 shadow-subtle hover:border-proofline-blue/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-ink-steel">ACT 04</span>
              <FileCheck2 className="w-4 h-4 text-indigo-700" />
            </div>
            <h3 className="text-base font-semibold text-ink">
              Draft &amp; Review
            </h3>
            <p className="text-[12.5px] text-ink-slate leading-relaxed">
              Assemble pre-action letters and briefs with embedded citation anchors, ready for qualified fee-earner CPR 32.14 verification and sign-off.
            </p>
          </div>
        </div>
      </section>

      {/* 60–90s Guided Interactive Demonstration */}
      <section className="bg-white border border-border-hairline rounded-[8px] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-hairline pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">Live Demonstration</Badge>
              <span className="text-[11.5px] font-mono text-ink-steel">Try interactive queries without setup</span>
            </div>
            <h2 className="text-2xl font-serif text-ink tracking-tight">
              Test Grounded Legal Reasoning &amp; Selective Abstention
            </h2>
            <p className="text-[13px] text-ink-slate">
              Select a scenario below to observe how Proofline responds with exact citations or enforces strict evidential abstention:
            </p>
          </div>

          <button
            onClick={onLoadSample}
            className="self-start md:self-auto px-4 py-2 bg-proofline-blue hover:bg-proofline-navy text-white text-[12.5px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer shrink-0"
          >
            <span>Open Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDemoQuery('remote-access')}
            className={`px-3.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer border ${
              demoQuery === 'remote-access'
                ? 'bg-ink text-white border-ink'
                : 'bg-canvas-subtle text-ink-slate border-border-hairline hover:bg-white'
            }`}
          >
            1. Bates: Fujitsu Remote Access (Grounded)
          </button>

          <button
            onClick={() => setDemoQuery('governing-law')}
            className={`px-3.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer border ${
              demoQuery === 'governing-law'
                ? 'bg-ink text-white border-ink'
                : 'bg-canvas-subtle text-ink-slate border-border-hairline hover:bg-white'
            }`}
          >
            2. NovaCorp: Delaware Governing Law (Conflict)
          </button>

          <button
            onClick={() => setDemoQuery('abstention')}
            className={`px-3.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer border ${
              demoQuery === 'abstention'
                ? 'bg-ink text-white border-ink'
                : 'bg-canvas-subtle text-ink-slate border-border-hairline hover:bg-white'
            }`}
          >
            3. Abstention: Bates Birth Date (Zero Citation)
          </button>
        </div>

        {/* Live Output Stage */}
        <div className="bg-canvas-subtle border border-border-hairline rounded-[6px] p-5 space-y-4 font-mono text-[12px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline pb-3 text-ink-steel">
            <div>
              <span className="text-ink font-semibold">User Query: </span>
              <span className="text-ink-slate">"{currentDemo.query}"</span>
            </div>
            <Badge 
              variant={currentDemo.status === 'verified' ? 'green' : currentDemo.status === 'flagged' ? 'ochre' : 'slate'} 
              size="sm"
            >
              {currentDemo.status.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-3 bg-white border border-border-hairline p-4 rounded-[4px]">
            <div className="text-[11.5px] text-ink-steel flex flex-wrap items-center justify-between gap-2">
              <span>Matter: <strong>{currentDemo.matter}</strong></span>
              <span className="text-proofline-blue">{currentDemo.jurisdiction}</span>
            </div>

            <div className="p-3 bg-canvas-subtle border-l-2 border-proofline-blue text-ink-slate text-[12.5px] leading-relaxed font-sans italic">
              {currentDemo.text}
            </div>

            <div className="text-[11px] text-ink-steel space-y-1">
              <div>Source Citation: <span className="text-ink font-mono">{currentDemo.citation}</span></div>
              <div className="truncate" title={currentDemo.sha256}>SHA-256 Digest: <span className="text-ink font-mono">{currentDemo.sha256}</span></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[12px] font-sans text-ink-slate">
            <div>
              <strong className="text-ink font-medium">Finding: </strong>
              <span>{currentDemo.finding}</span>
            </div>
            <button
              onClick={onLoadSample}
              className="text-proofline-blue hover:text-proofline-navy font-medium underline cursor-pointer shrink-0"
            >
              Examine in Workbench &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Purposeful Bento Gallery */}
      <section className="space-y-6">
        <div className="max-w-[700px] space-y-2">
          <Badge variant="blue" size="sm">Evidence Architecture</Badge>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
            Designed for Evidential Scrutiny
          </h2>
          <p className="text-[13.5px] text-ink-slate leading-relaxed">
            Every component in Proofline solves an actual failure mode in legal document management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tile 1: Double-width Evidence Verifier */}
          <div className="md:col-span-2 bg-white border border-border-hairline rounded-[6px] p-6 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-proofline-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Primary Source Grounding
              </span>
              <span className="text-[11px] font-mono text-ink-steel">Character Offset Span</span>
            </div>

            <h3 className="text-lg font-serif font-semibold text-ink">
              Verbatim Judicial Findings with Byte-Level Provenance
            </h3>
            <p className="text-[13px] text-ink-slate leading-relaxed">
              When citing judgments or witness statements, Proofline records exact character offsets and computes cryptographic WebCrypto SHA-256 digests. Changing even one byte of the source file automatically marks dependent legal propositions stale.
            </p>

            <div className="p-3.5 bg-canvas-subtle border border-border-hairline rounded-[4px] font-mono text-[11.5px] space-y-2 text-ink-slate">
              <div className="flex items-center justify-between text-[11px] text-ink-steel pb-1 border-b border-border-hairline">
                <span>File: Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt</span>
                <span className="text-proofline-green font-medium">Verified Hex Match</span>
              </div>
              <p className="text-ink leading-relaxed">
                [549] "The evidence in this trial has made it clear that such remote access to branch accounts does exist; such remote access is possible by employees within Fujitsu; it does exist specifically by design; and it has been used in the past."
              </p>
              <div className="text-[10.5px] text-ink-steel truncate">
                SHA-256: 60b0b7a6b53e2cd3d4499f2c54e8a1c94dc07d22c0acf064e24d293d9429af67
              </div>
            </div>
          </div>

          {/* Tile 2: Strict Selective Abstention */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-6 space-y-3.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Anti-Hallucination
              </span>
              <span className="text-[11px] font-mono text-ink-steel">Zero Guessing</span>
            </div>

            <h3 className="text-lg font-serif font-semibold text-ink">
              Strict Selective Abstention
            </h3>
            <p className="text-[13px] text-ink-slate leading-relaxed">
              When asked unanswerable or unsubstantiated questions, Proofline refuses to confabulate. It explicitly abstains, emits zero false citations, and protects court draft integrity.
            </p>

            <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-[4px] text-[11.5px] font-mono text-amber-950 space-y-1">
              <span className="font-semibold text-[10.5px] uppercase tracking-wider text-amber-900">Abstention Rule:</span>
              <p className="text-[11px] leading-relaxed">
                "No uploaded document in this matter contains evidence proving this fact. 0 citations emitted."
              </p>
            </div>
          </div>

          {/* Tile 3: Contradiction Radar */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-6 space-y-3.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Contradiction Radar
              </span>
              <span className="text-[11px] font-mono text-ink-steel">CPR Part 31</span>
            </div>

            <h3 className="text-lg font-serif font-semibold text-ink">
              Contemporaneous Conflict Detection
            </h3>
            <p className="text-[13px] text-ink-slate leading-relaxed">
              Discovers discrepancies between witness depositions and internal telemetry (e.g. Fujitsu Call 188 Bug discrepancy in *Bates*), alerting fee earners immediately.
            </p>

            <div className="p-3 bg-purple-50/40 border border-purple-200/50 rounded-[4px] text-[11px] font-mono text-purple-950 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-purple-900">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Adverse Conflict Flagged</span>
              </div>
              <p className="text-slate-700">Internal memo directing non-disclosure conflicts with public denial of remote access.</p>
            </div>
          </div>

          {/* Tile 4: Double-width Privacy Architecture */}
          <div className="md:col-span-2 bg-white border border-border-hairline rounded-[6px] p-6 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Data Boundary Transparency
              </span>
              <span className="text-[11px] font-mono text-ink-steel">Zero Cloud Egress</span>
            </div>

            <h3 className="text-lg font-serif font-semibold text-ink">
              Clear Privacy Boundaries by Operational Mode
            </h3>
            <p className="text-[13px] text-ink-slate leading-relaxed">
              Proofline provides complete transparency regarding where your data lives and where computation occurs:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] font-mono">
              <div className="p-3 bg-canvas-subtle rounded border border-border-hairline space-y-1">
                <div className="font-semibold text-ink flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-proofline-blue" />
                  <span>Matter Storage</span>
                </div>
                <p className="text-ink-slate text-[11px] font-sans">
                  100% in browser IndexedDB. Case files never touch Vercel or cloud servers.
                </p>
              </div>

              <div className="p-3 bg-canvas-subtle rounded border border-border-hairline space-y-1">
                <div className="font-semibold text-ink flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-proofline-green" />
                  <span>Model Runtime</span>
                </div>
                <p className="text-ink-slate text-[11px] font-sans">
                  Runs on local Ollama (<code>127.0.0.1:11434</code>) or deterministic core if offline.
                </p>
              </div>

              <div className="p-3 bg-canvas-subtle rounded border border-border-hairline space-y-1">
                <div className="font-semibold text-ink flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  <span>Web Assets</span>
                </div>
                <p className="text-ink-slate text-[11px] font-sans">
                  Static HTML/JS delivered via Vercel CDN. Zero telemetry or ad trackers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Exhibit Feature Stage */}
      <section id="workflow-evidence" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 px-1">
          <div>
            <h2 className="text-xl font-semibold text-ink font-serif">
              Contemporaneous Document Comparison Stage
            </h2>
            <p className="text-[13px] text-ink-slate">
              Switch exhibits below to audit authentic high-court litigation records, B2B SaaS discrepancies, and tenancy breaches:
            </p>
          </div>
          <span className="text-[11px] font-mono text-ink-steel">
            Interactive Matter Exhibits
          </span>
        </div>

        <FeatureStage onOpenWorkbench={onOpenWorkbench} />
      </section>

      {/* Open Source & Getting Started */}
      <section className="bg-white border border-border-hairline rounded-[8px] p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-2 max-w-[700px]">
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">Open Source</Badge>
            <span className="text-[12px] font-mono text-ink-steel">Apache 2.0 / MIT Licensed</span>
          </div>
          <h2 className="text-2xl font-serif text-ink tracking-tight">
            Run Sovereign Proofline Locally
          </h2>
          <p className="text-[13.5px] text-ink-slate leading-relaxed">
            Proofline is fully open source. You can clone the repository, run the test suite, and launch the web app or sovereign desktop build with zero external API keys:
          </p>
        </div>

        <div className="bg-canvas-subtle border border-border-hairline rounded-[6px] p-4 font-mono text-[12.5px] space-y-2 text-ink">
          <div className="flex items-center justify-between text-ink-steel text-[11px] border-b border-border-hairline pb-2">
            <span>Terminal Setup Commands</span>
            <span>Node 20+ &bull; npm 10+</span>
          </div>
          <pre className="text-proofline-navy overflow-x-auto py-1 leading-relaxed">
{`# 1. Clone repository
git clone https://github.com/vaibhav-lalwani/proofline.git
cd proofline

# 2. Install dependencies & run vitest audit
npm install
npm test -- --run

# 3. Start local development server
npm run dev

# 4. (Optional) Run local Gemma 4 legal adapter via Ollama
ollama run gemma4:e2b-it-qat`}
          </pre>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[12.5px] text-ink-steel">
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/vaibhav-lalwani/proofline"
              target="_blank"
              rel="noopener noreferrer"
              className="text-proofline-blue hover:text-proofline-navy font-medium flex items-center gap-1.5 underline"
            >
              <span>View GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <span className="font-mono text-[11.5px]">Tested on Windows, macOS &amp; Linux</span>
        </div>
      </section>

      {/* SRA Regulatory Notice & Professional Responsibility */}
      <section className="border-t border-border-hairline pt-10 space-y-3 max-w-[840px] mx-auto text-center text-[13px] text-ink-slate">
        <h3 className="font-semibold text-ink text-[14px]">
          Solicitors Regulation Authority (SRA) Standards &amp; Professional Responsibility
        </h3>
        <p className="leading-relaxed text-[12.5px]">
          Proofline is designed in direct alignment with SRA Generative AI Guidance. The application operates as an evidential organization and audit-trail workbench for qualified legal practitioners and researchers. It does not provide autonomous legal advice, submit court pleadings, or substitute for legal professional skill. All draft court documents require fee-earner verification and signature under CPR 32.14.
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
            href="https://github.com/vaibhav-lalwani/proofline" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
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
