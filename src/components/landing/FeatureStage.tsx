import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Scale,
  Binary,
  Hash
} from 'lucide-react';
import { Badge } from '../common/Badge.tsx';

interface FeatureStageProps {
  onOpenWorkbench: () => void;
}

export const FeatureStage: React.FC<FeatureStageProps> = ({ onOpenWorkbench }) => {
  const [activeMatterCase, setActiveMatterCase] = useState<'bates' | 'novacorp' | 'tenancy'>('bates');

  const matterCases = {
    bates: {
      title: 'Bates & Others v Post Office Ltd [2019] EWHC 3408 (QB)',
      jurisdiction: 'England & Wales · High Court Queen\'s Bench Division',
      statutoryRef: 'Civil Procedure Rules (CPR Part 31) · UCTA 1977 s.3 & s.11',
      sourceDocName: 'FUJITSU_HORIZON_PIN188_BUG_REPORT.txt',
      sourceDocDate: '14 Nov 2000',
      sourceDocSha: 'e9b21f8a84cd3050123984fa0c8b',
      excerptLine: 'Line 28: "Problem Incident PIN-188: System auto-generated £4,180 discrepancy in balancing screen. Bug 188 confirmed remote accounting alteration by Bracknell engineers without subpostmaster consent."',
      clientDocName: 'POST_OFFICE_WITNESS_STATEMENT_PERKINS.txt',
      clientDocDate: '12 Feb 2017',
      clientDocSha: 'd41d8cd98f00b204e9800998ecf8',
      clientExcerptLine: 'Line 14: "Horizon is robust and incapable of remote modification. No postmaster accounts have ever been adjusted without physical presence at the terminal counter."',
      contradictionFinding: 'Direct evidential conflict: Fujitsu internal telemetry records remote writes into counter ledgers, refuting Post Office witness claims of system inviolability.',
      admissibilityCert: 'CEA 1995 s.9 Certificate Validated (SHA-256 Digest Confirmed)'
    },
    novacorp: {
      title: 'NovaCorp Solutions Ltd v Meridian Cloud Technologies Ltd',
      jurisdiction: 'Commercial Court · England and Wales',
      statutoryRef: 'Unfair Contract Terms Act 1977 · Commercial Law',
      sourceDocName: 'NOVACORP_MERIDIAN_SAAS_MSA_2026.txt',
      sourceDocDate: '10 Feb 2026',
      sourceDocSha: '7f9c2d14b8a21e4c98f01b34ad78',
      excerptLine: 'Clause 4.2 (L48): "Invoices shall be payable within thirty (30) days from date of electronic dispatch."',
      clientDocName: 'SCHEDULE_B_SERVICE_FEES_ADDENDUM.txt',
      clientDocDate: '12 Feb 2026',
      clientDocSha: '3a1c84f92d8e41a0b5c7198e3b2f',
      clientExcerptLine: 'Section 3.1 (L12): "Customer shall remit all subscription balances on Net 60 terms following reconciliation."',
      contradictionFinding: 'Commercial conflict: Clause 4.2 specifies Net 30 default terms, but Schedule B specifies Net 60. Creates billing default exposure of £240,000.',
      admissibilityCert: 'SaaS Playbook Rule #4 Violation (Uncapped Liability Detected in Cl.8.1)'
    },
    tenancy: {
      title: 'Thorne v Oakridge Estates Ltd',
      jurisdiction: 'County Court at Central London · Housing Disrepair',
      statutoryRef: 'Housing Act 2004 s.213 & s.214 · Deregulation Act 2015',
      sourceDocName: 'TENANCY_AGREEMENT_FLAT_4B.txt',
      sourceDocDate: '01 Sep 2025',
      sourceDocSha: '5c28e9140d3a77f81b29a4cc910e',
      excerptLine: 'Clause 5 (L31): "Security Deposit of £2,400 received on 01 Sep 2025 and held by Landlord in private Barclays business account."',
      clientDocName: 'DPS_DEPOSIT_SCHEME_VERIFICATION_CERT.txt',
      clientDocDate: '20 Nov 2025',
      clientDocSha: '912a7f804b1c2e88a9df3014e218',
      clientExcerptLine: 'Registry Audit (L8): "No protected deposit records registered for Thorne / Flat 4B within statutory 30-day window."',
      contradictionFinding: 'Statutory non-compliance: Deposit was never protected in government DPS scheme within 30 days. Triggers mandatory 1x-3x deposit penalty under s.214.',
      admissibilityCert: 'Housing Act 2004 s.214 Statutory Presumption Triggered'
    }
  };

  const active = matterCases[activeMatterCase];

  return (
    <div className="w-full bg-white border border-border-hairline rounded-md shadow-card overflow-hidden">
      {/* Interactive Case Switcher Bar */}
      <div className="bg-canvas-subtle border-b border-border-hairline px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-steel font-mono">
            Interactive Matter Exhibit:
          </span>
          <div className="flex items-center gap-1 bg-white border border-border-hairline p-0.5 rounded-[4px]">
            <button
              onClick={() => setActiveMatterCase('bates')}
              className={`px-2.5 py-1 text-[11.5px] font-medium rounded-[3px] transition-colors ${
                activeMatterCase === 'bates'
                  ? 'bg-ink text-white'
                  : 'text-ink-slate hover:text-ink'
              }`}
            >
              Bates v Post Office
            </button>
            <button
              onClick={() => setActiveMatterCase('novacorp')}
              className={`px-2.5 py-1 text-[11.5px] font-medium rounded-[3px] transition-colors ${
                activeMatterCase === 'novacorp'
                  ? 'bg-ink text-white'
                  : 'text-ink-slate hover:text-ink'
              }`}
            >
              NovaCorp B2B SaaS MSA
            </button>
            <button
              onClick={() => setActiveMatterCase('tenancy')}
              className={`px-2.5 py-1 text-[11.5px] font-medium rounded-[3px] transition-colors ${
                activeMatterCase === 'tenancy'
                  ? 'bg-ink text-white'
                  : 'text-ink-slate hover:text-ink'
              }`}
            >
              Thorne Tenancy Disrepair
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="green" size="sm">
            Deterministic Evidential Gate
          </Badge>
          <Badge variant="ochre" size="sm">
            Adverse Discrepancy Active
          </Badge>
        </div>
      </div>

      {/* Exhibit Header */}
      <div className="px-6 py-4 border-b border-border-hairline bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">
            {active.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-steel mt-1 font-mono">
            <span>{active.jurisdiction}</span>
            <span>&bull;</span>
            <span className="text-proofline-blue">{active.statutoryRef}</span>
          </div>
        </div>

        <button
          onClick={onOpenWorkbench}
          className="self-start md:self-auto px-3.5 py-1.5 bg-proofline-blue hover:bg-blue-700 text-white text-[12px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 shadow-subtle"
        >
          <span>Open in Full Workbench</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Side-by-Side Dual Exhibit Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-hairline bg-white">
        {/* Exhibit 1: Opposing / Technical Evidence */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded-[3px] border border-amber-200">
              Exhibit A &bull; Disclosed Technical Telemetry
            </span>
            <span className="text-[11px] text-ink-steel font-mono">
              Date: {active.sourceDocDate}
            </span>
          </div>

          <div className="text-[12.5px] font-semibold text-ink flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-proofline-ochre shrink-0" />
            <span className="font-mono text-[12px]">{active.sourceDocName}</span>
          </div>

          <div className="p-3.5 bg-canvas-subtle border border-border-hairline rounded-[4px] font-mono text-[11.5px] text-ink-slate leading-relaxed">
            {active.excerptLine}
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-steel font-mono pt-1">
            <span>SHA-256: {active.sourceDocSha}...</span>
            <span className="text-proofline-green font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Byte Verified
            </span>
          </div>
        </div>

        {/* Exhibit 2: Client / Witness Record */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-[3px] border border-blue-200">
              Exhibit B &bull; Witness Deposition / Primary Agreement
            </span>
            <span className="text-[11px] text-ink-steel font-mono">
              Date: {active.clientDocDate}
            </span>
          </div>

          <div className="text-[12.5px] font-semibold text-ink flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-proofline-blue shrink-0" />
            <span className="font-mono text-[12px]">{active.clientDocName}</span>
          </div>

          <div className="p-3.5 bg-canvas-subtle border border-border-hairline rounded-[4px] font-mono text-[11.5px] text-ink-slate leading-relaxed">
            {active.clientExcerptLine}
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-steel font-mono pt-1">
            <span>SHA-256: {active.clientDocSha}...</span>
            <span className="text-proofline-green font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Byte Verified
            </span>
          </div>
        </div>
      </div>

      {/* Synthesis Banner & Civil Evidence Act Admissibility Statement */}
      <div className="p-4 bg-canvas-subtle border-t border-border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12px]">
        <div className="space-y-1">
          <div className="font-semibold text-ink flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-proofline-blue shrink-0" />
            <span>Evidential Audit Finding:</span>
          </div>
          <p className="text-ink-slate max-w-[720px] text-[12.5px]">
            {active.contradictionFinding}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 text-proofline-green bg-emerald-50 px-3 py-1.5 rounded-[4px] border border-emerald-200 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{active.admissibilityCert}</span>
        </div>
      </div>
    </div>
  );
};
