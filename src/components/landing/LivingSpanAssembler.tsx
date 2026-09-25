import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Scale, 
  ArrowRight, 
  Hash, 
  CheckCircle2, 
  Sliders, 
  Lock,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../common/Badge.tsx';

interface LivingSpanAssemblerProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
}

type CaseKey = 'bates' | 'novacorp' | 'abstention';

interface CaseData {
  key: CaseKey;
  label: string;
  matterTitle: string;
  jurisdiction: string;
  docA: {
    filename: string;
    label: string;
    fullText: string;
    spanStart: number;
    spanEnd: number;
    highlightedText: string;
    sha256: string;
    lineNo: string;
  };
  docB: {
    filename: string;
    label: string;
    fullText: string;
    spanStart: number;
    spanEnd: number;
    highlightedText: string;
    sha256: string;
    lineNo: string;
  };
  tensionScore: number; // 0 to 100
  tensionSeverity: 'critical' | 'warning' | 'abstention';
  legalImplication: string;
  cprNotice: string;
}

const CASES: Record<CaseKey, CaseData> = {
  bates: {
    key: 'bates',
    label: '1. Bates v Post Office [2019]',
    matterTitle: 'Bates & Others v Post Office Ltd [2019] EWHC 3408 (QB)',
    jurisdiction: 'High Court of Justice (Queen\'s Bench Division)',
    docA: {
      filename: 'Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt',
      label: 'Exhibit A: High Court Judgment (Fraser J Finding)',
      lineNo: 'Para 549 (Line 21)',
      spanStart: 1644,
      spanEnd: 1875,
      sha256: '60b0b7a6b53e2cd3d4499f2c54e8a1c94dc07d22c0acf064e24d293d9429af67',
      fullText: 'The evidence in this trial has made it clear that such remote access to branch accounts does exist; such remote access is possible by employees within Fujitsu; it does exist specifically by design; and it has been used in the past.',
      highlightedText: 'remote access to branch accounts does exist; such remote access is possible by employees within Fujitsu; it does exist specifically by design'
    },
    docB: {
      filename: 'Post_Office_Security_Division_Confidential_Memo_2010.txt',
      label: 'Exhibit B: Contemporaneous Internal Memorandum',
      lineNo: 'Para 3 (Line 12)',
      spanStart: 340,
      spanEnd: 565,
      sha256: '6f9588665ea87c062779fa4f595c25dbcb28fa7a00f27471fbaf8a1fa18784ad',
      fullText: 'Under no circumstances should Fujitsu Known Error Logs, including PIN 188 or SSC remote access procedures, be disclosed in civil or criminal proceedings without prior review by senior management. Disclosing that Fujitsu can remotely alter accounts would fatally undermine our civil recovery actions.',
      highlightedText: 'Under no circumstances should Fujitsu Known Error Logs, including PIN 188 or SSC remote access procedures, be disclosed in civil or criminal proceedings'
    },
    tensionScore: 94,
    tensionSeverity: 'critical',
    legalImplication: 'Adverse Documentary Conflict: Internal memo ordering non-disclosure directly conflicts with public assertions of system inviolability, providing conclusive evidence of knowledge under CPR Part 31.',
    cprNotice: 'Adverse Record Verified under CPR 31.6 • Requires Human Fee-Earner Sign-off'
  },
  novacorp: {
    key: 'novacorp',
    label: '2. NovaCorp Cloud Contract [2026]',
    matterTitle: 'NovaCorp Solutions Inc v Meridian Cloud Technologies Ltd',
    jurisdiction: 'Commercial Court (England & Wales)',
    docA: {
      filename: 'Meridian_Master_Cloud_Agreement_2026.pdf',
      label: 'Exhibit A: Master Cloud Agreement',
      lineNo: 'Section 4.1 (Line 15)',
      spanStart: 2140,
      spanEnd: 2260,
      sha256: 'af14d77e7ae11632ad2decd7a9b49d0fd0005604d3dbe6500221a51557a08808',
      fullText: 'Payment of undisputed fees shall be made within thirty (30) days from the date of Provider\'s invoice. Any late payments shall accrue interest at statutory rate.',
      highlightedText: 'Payment of undisputed fees shall be made within thirty (30) days from the date of Provider\'s invoice.'
    },
    docB: {
      filename: 'Schedule_B_Service_Fees_Addendum.pdf',
      label: 'Exhibit B: Schedule B Addendum',
      lineNo: 'Section 2.1 (Line 8)',
      spanStart: 890,
      spanEnd: 1010,
      sha256: 'c8d19a2b53f47e61a90c1284d7e35b91a4c82e6051f93047a2e8b15d90c37e41',
      fullText: 'Customer shall remit aggregate subscription payments on Net 60 days terms following monthly telemetry reconciliation and service credit calculation.',
      highlightedText: 'remit aggregate subscription payments on Net 60 days terms following monthly telemetry reconciliation'
    },
    tensionScore: 78,
    tensionSeverity: 'warning',
    legalImplication: 'Payment Schedule Discrepancy: Master Agreement Section 4.1 specifies Net 30 days while Schedule B specifies Net 60 days, creating conflicting contractual default triggers.',
    cprNotice: 'Contractual Ambiguity Flagged • Priority of Documents Review Required'
  },
  abstention: {
    key: 'abstention',
    label: '3. Strict Evidential Abstention',
    matterTitle: 'Factual Predicate Verification: Alan Bates Date of Birth',
    jurisdiction: 'High Court Record Invariant',
    docA: {
      filename: 'Bates_v_Post_Office_Corpus_1200_Paragraphs.txt',
      label: 'Exhibit A: Complete Matter Record (Zero Evidence)',
      lineNo: 'Audited Matter Corpus (1,200 Paragraphs)',
      spanStart: 0,
      spanEnd: 0,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fullText: 'Audited entire trial record, pleadings, and transcripts. No document contains evidence regarding Alan Bates\' date of birth. Proposition is unprovable from record.',
      highlightedText: 'No document contains evidence regarding Alan Bates\' date of birth.'
    },
    docB: {
      filename: 'Standard_Generative_AI_Output.txt',
      label: 'Exhibit B: Unconstrained Commercial Chatbot (Hallucination)',
      lineNo: 'External Cloud LLM Response',
      spanStart: 12,
      spanEnd: 88,
      sha256: 'Fabricated Citation — Zero Provenance',
      fullText: 'Alan Bates was born on 1 January 1970 and served as lead claimant in the group litigation against the Post Office Ltd.',
      highlightedText: 'Alan Bates was born on 1 January 1970'
    },
    tensionScore: 100,
    tensionSeverity: 'abstention',
    legalImplication: 'Strict Evidential Abstention: Where an evidentiary predicate is absent from disclosure, Proofline emits zero citations and explicitly refuses confabulation. Prevents court sanctions under CPR 32.14.',
    cprNotice: 'Zero Citations Emitted • Proofline Selective Abstention Enforced'
  }
};

export const LivingSpanAssembler: React.FC<LivingSpanAssemblerProps> = ({
  onOpenWorkbench,
  onLoadSample
}) => {
  const [selectedCase, setSelectedCase] = useState<CaseKey>('bates');
  const [scrubberValue, setScrubberValue] = useState<number>(100); // 0 to 100% of span length

  const current = CASES[selectedCase];

  // Dynamic span length calculation based on scrubber
  const totalBytes = current.docA.spanEnd - current.docA.spanStart;
  const activeByteLength = totalBytes > 0 
    ? Math.max(12, Math.round((totalBytes * scrubberValue) / 100))
    : 0;
  const currentEndOffset = current.docA.spanStart + activeByteLength;

  return (
    <div 
      className="bg-white border border-border-hairline rounded-[8px] shadow-card overflow-hidden"
      id="signature-span-assembler"
    >
      {/* Top Controller Bar */}
      <div className="bg-[#FAF9F5] border-b border-border-hairline p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-proofline-blue bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Signature Interaction
            </span>
            <span className="text-[11.5px] font-mono text-ink-steel">
              Living Evidentiary Span Grounding
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-ink tracking-tight">
            The Living Evidentiary Span Assembler &amp; Contradiction Radar
          </h2>
          <p className="text-[13px] text-ink-slate mt-0.5">
            Select a dispute scenario below. Watch how Proofline isolates verbatim character spans and exposes documentary contradictions in real time:
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenWorkbench}
          className="self-start md:self-auto px-4 py-2 bg-proofline-blue hover:bg-proofline-navy text-white text-[12.5px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer shrink-0"
        >
          <span>Examine in Workbench</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Case Selector Tabs */}
      <div className="px-4 sm:px-6 pt-4 pb-2 bg-white border-b border-border-hairline flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CASES) as CaseKey[]).map((key) => {
            const item = CASES[key];
            const isActive = selectedCase === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedCase(key);
                  setScrubberValue(100);
                }}
                className={`px-3.5 py-1.5 rounded-[4px] text-[12px] font-medium transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-ink text-white border-ink shadow-subtle'
                    : 'bg-canvas-subtle text-ink-slate border-border-hairline hover:bg-white hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Real-time Tension Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-mono text-ink-steel">Evidential Tension:</span>
          {current.tensionSeverity === 'critical' && (
            <Badge variant="red" size="sm">
              Critical Adverse Conflict ({current.tensionScore}%)
            </Badge>
          )}
          {current.tensionSeverity === 'warning' && (
            <Badge variant="ochre" size="sm">
              Term Inconsistency ({current.tensionScore}%)
            </Badge>
          )}
          {current.tensionSeverity === 'abstention' && (
            <Badge variant="green" size="sm">
              Strict Abstention Active (0 Citations)
            </Badge>
          )}
        </div>
      </div>

      {/* Active Matter Context Line */}
      <div className="px-6 py-2.5 bg-[#FAF9F5] border-b border-border-hairline flex flex-wrap items-center justify-between text-[11.5px] font-mono text-ink-steel gap-2">
        <div>
          <span className="text-ink font-semibold">Matter Record: </span>
          <span className="text-ink-slate">{current.matterTitle}</span>
        </div>
        <div className="text-proofline-blue font-medium">
          {current.jurisdiction}
        </div>
      </div>

      {/* Side-by-Side Dual Documentary Comparison Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-hairline bg-white">
        {/* Document A Column (Primary Grounding) */}
        <div className="p-5 sm:p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-proofline-blue" />
              <span className="text-[12.5px] font-semibold text-ink font-sans">
                {current.docA.label}
              </span>
            </div>
            <span className="text-[11px] font-mono text-proofline-blue font-semibold">
              {current.docA.lineNo}
            </span>
          </div>

          {/* Primary Text Stage with Active Highlight */}
          <div className="bg-[#FAF9F5] border border-border-hairline rounded-[6px] p-4 text-[12.5px] font-mono space-y-3 leading-relaxed text-ink">
            <div className="text-[11px] text-ink-steel flex items-center justify-between border-b border-border-hairline/60 pb-1.5">
              <span>File: {current.docA.filename}</span>
              <span className="text-proofline-green font-medium">Verified UTF-8</span>
            </div>

            <div className="p-2 bg-white rounded border border-border-hairline/80 font-sans text-ink leading-relaxed">
              <span className="text-ink-slate">{current.docA.fullText.slice(0, 32)}</span>{' '}
              <mark className="bg-amber-100 text-ink font-medium px-1 py-0.5 rounded border border-amber-300">
                &quot;{current.docA.highlightedText}&quot;
              </mark>{' '}
              <span className="text-ink-slate">{current.docA.fullText.slice(current.docA.highlightedText.length + 32)}</span>
            </div>

            {/* Live Character Offset & Hash Readout */}
            <div className="pt-1 text-[11px] space-y-1 text-ink-steel">
              <div className="flex justify-between">
                <span>Character Offset Range:</span>
                <span className="text-ink font-semibold">
                  [{current.docA.spanStart} to {currentEndOffset}] ({activeByteLength} bytes)
                </span>
              </div>
              <div className="truncate" title={current.docA.sha256}>
                <span>SHA-256 Digest: </span>
                <span className="text-ink font-mono text-[10.5px]">{current.docA.sha256}</span>
              </div>
            </div>
          </div>

          {/* Tactile Span Scrubber Slider */}
          {totalBytes > 0 && (
            <div className="pt-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11.5px] font-mono text-ink-slate">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-proofline-blue" />
                  <span>Interactive Span Assembly Window:</span>
                </span>
                <span className="font-semibold text-ink">{scrubberValue}% span length</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={scrubberValue}
                onChange={(e) => setScrubberValue(Number(e.target.value))}
                className="w-full h-1.5 bg-border-hairline rounded-lg appearance-none cursor-pointer accent-proofline-blue"
                aria-label="Span Scrubber Control"
              />
              <div className="flex justify-between text-[10.5px] font-mono text-ink-steel">
                <span>Start: Offset {current.docA.spanStart}</span>
                <span>Active End: Offset {currentEndOffset}</span>
              </div>
            </div>
          )}
        </div>

        {/* Document B Column (Opposing Record or Confabulation Contrast) */}
        <div className="p-5 sm:p-6 space-y-4 bg-[#FCFBF8]">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${current.tensionSeverity === 'critical' ? 'text-proofline-crimson' : current.tensionSeverity === 'warning' ? 'text-proofline-ochre' : 'text-proofline-green'}`} />
              <span className="text-[12.5px] font-semibold text-ink font-sans">
                {current.docB.label}
              </span>
            </div>
            <span className="text-[11px] font-mono text-ink-steel">
              {current.docB.lineNo}
            </span>
          </div>

          {/* Opposing Text Stage */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-4 text-[12.5px] font-mono space-y-3 leading-relaxed text-ink">
            <div className="text-[11px] text-ink-steel flex items-center justify-between border-b border-border-hairline/60 pb-1.5">
              <span>File: {current.docB.filename}</span>
              <span className={current.tensionSeverity === 'critical' ? 'text-proofline-crimson font-medium' : 'text-proofline-ochre font-medium'}>
                {current.tensionSeverity === 'abstention' ? 'Ungrounded Confabulation' : 'Contemporaneous Record'}
              </span>
            </div>

            <div className="p-2 bg-[#FAF9F5] rounded border border-border-hairline/80 font-sans text-ink leading-relaxed">
              <mark className={`px-1 py-0.5 rounded border ${current.tensionSeverity === 'critical' ? 'bg-rose-100 text-rose-950 border-rose-300' : current.tensionSeverity === 'warning' ? 'bg-amber-100 text-amber-950 border-amber-300' : 'bg-slate-100 text-slate-900 border-slate-300'}`}>
                &quot;{current.docB.highlightedText}&quot;
              </mark>{' '}
              <span className="text-ink-slate">{current.docB.fullText.slice(current.docB.highlightedText.length)}</span>
            </div>

            {/* Hash & Verification Status */}
            <div className="pt-1 text-[11px] space-y-1 text-ink-steel">
              <div className="flex justify-between">
                <span>Span Boundaries:</span>
                <span className="text-ink font-semibold">
                  [{current.docB.spanStart} to {current.docB.spanEnd}]
                </span>
              </div>
              <div className="truncate" title={current.docB.sha256}>
                <span>Digest Status: </span>
                <span className="text-ink font-mono text-[10.5px]">{current.docB.sha256}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Legal Implication Card */}
          <div className="p-3.5 bg-white border border-border-hairline rounded-[6px] space-y-1.5 shadow-subtle">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              <Scale className="w-3.5 h-3.5 text-proofline-blue" />
              <span>Procedural Analysis &amp; Finding:</span>
            </div>
            <p className="text-[12px] text-ink-slate leading-relaxed font-sans">
              {current.legalImplication}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Forensic Bar: CPR 32.14 Human Statement of Truth Notice */}
      <div className="bg-[#FAF9F5] border-t border-border-hairline px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
        <div className="flex items-center gap-2 text-ink">
          <ShieldCheck className="w-4 h-4 text-proofline-green shrink-0" />
          <span className="font-medium font-sans">
            {current.cprNotice}
          </span>
        </div>

        <button
          onClick={onLoadSample}
          className="text-proofline-blue hover:text-proofline-navy font-medium underline flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>Open Full Matter in Sovereign Workbench</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
