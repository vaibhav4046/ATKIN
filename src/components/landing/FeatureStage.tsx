import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Scale,
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
      jurisdiction: 'High Court of Justice · Queen\'s Bench Division · England & Wales',
      statutoryRef: 'Civil Procedure Rules (CPR Part 31) · Unfair Contract Terms Act 1977 s.3 & s.11',
      sourceDocName: 'Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt',
      sourceDocDate: '16 Dec 2019',
      sourceDocSha: '60b0b7a6b53e2cd3d4499f2c54e8a1c94dc07d22c0acf064e24d293d9429af67',
      excerptLine: 'Para 549 (L21): "The evidence in this trial has made it clear that such remote access to branch accounts does exist; such remote access is possible by employees within Fujitsu; it does exist specifically by design; and it has been used in the past."',
      clientDocName: 'Post_Office_Security_Division_Confidential_Memo_2010.txt',
      clientDocDate: '24 Feb 2010',
      clientDocSha: '6f9588665ea87c062779fa4f595c25dbcb28fa7a00f27471fbaf8a1fa18784ad',
      clientExcerptLine: 'Para 3 (L12): "Under no circumstances should Fujitsu Known Error Logs, including PIN 188 or SSC remote access procedures, be disclosed in civil or criminal proceedings without prior review by senior management. Disclosing that Fujitsu can remotely alter accounts would fatally undermine our civil debt recovery actions"',
      contradictionFinding: 'Direct evidential conflict: Mr Justice Fraser held at para 550 that Post Office statements denying remote access were specifically wrong in fact, directly contradicting internal memos ordering concealment of Fujitsu remote alteration capabilities.',
      admissibilityCert: 'Verified Document Hash Recorded • CPR 32.14 Human Sign-off Required'
    },
    novacorp: {
      title: 'NovaCorp Solutions Inc v Meridian Cloud Technologies Ltd',
      jurisdiction: 'Commercial Court · England and Wales',
      statutoryRef: 'Unfair Contract Terms Act 1977 · Commercial Law',
      sourceDocName: 'Meridian_Master_Cloud_Agreement_2026.pdf',
      sourceDocDate: '10 Feb 2026',
      sourceDocSha: 'af14d77e7ae11632ad2decd7a9b49d0fd0005604d3dbe6500221a51557a08808',
      excerptLine: 'Section 4.1 (L15): "Payment of undisputed fees shall be made within thirty (30) days from the date of Provider\'s invoice."',
      clientDocName: 'Schedule_B_Service_Fees_Addendum.pdf',
      clientDocDate: '12 Feb 2026',
      clientDocSha: 'c8d19a2b53f47e61a90c1284d7e35b91a4c82e6051f93047a2e8b15d90c37e41',
      clientExcerptLine: 'Section 2.1 (L8): "Customer shall remit aggregate subscription payments on Net 60 days terms following monthly telemetry reconciliation."',
      contradictionFinding: 'Commercial term conflict: Master Agreement Section 4.1 specifies Net 30 payment terms, while Schedule B Addendum specifies Net 60. Creates conflicting contractual obligations and billing exposure.',
      admissibilityCert: 'Playbook Rule Violation • Human Verification Required'
    },
    tenancy: {
      title: 'Thorne v Oakridge Estates Ltd',
      jurisdiction: 'County Court at Central London · Housing Disrepair',
      statutoryRef: 'Housing Act 2004 s.213 & s.214 · Deregulation Act 2015',
      sourceDocName: 'Assured_Shorthold_Tenancy_Agreement_Flat4B.pdf',
      sourceDocDate: '01 Sep 2025',
      sourceDocSha: '5e4b2d18a90c37f81b29a4cc910e74f82c14b8a21e4c98f01b34ad78e9b21f8a',
      excerptLine: 'Clause 5.1 (L14): "The Tenant pays a deposit of £2,400 to be held in the Landlord\'s designated bank account as security for the performance of the Tenant\'s obligations."',
      clientDocName: 'DPS_Deposit_Protection_Scheme_Search_Certificate.pdf',
      clientDocDate: '20 Nov 2025',
      clientDocSha: '9f2b8a4c1e78d3050123984fa0c8be9b21f8a84cd3050123984fa0c8b912a7f8',
      clientExcerptLine: 'Search Result (L6): "No record of tenancy deposit protection found for Flat 4B, 18 Oakridge Terrace within statutory 30-day window following 01 September 2025."',
      contradictionFinding: 'Statutory non-compliance: AST Clause 5.1 records deposit receipt, but DPS search confirms deposit was never protected within statutory 30-day window, triggering Housing Act 2004 s.214 financial penalties.',
      admissibilityCert: 'Statutory Discrepancy Verified • 1x–3x Deposit Compensation Claim'
    }
  };

  const active = matterCases[activeMatterCase];

  return (
    <div className="w-full bg-white border border-border-hairline rounded-md shadow-card overflow-hidden">
      {/* Interactive Case Switcher Bar */}
      <div className="bg-canvas-subtle border-b border-border-hairline px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-steel font-mono">
            Sample Matter Exhibit:
          </span>
          <div className="flex items-center gap-1 bg-white border border-border-hairline p-0.5 rounded-[4px]">
            <button
              onClick={() => setActiveMatterCase('bates')}
              className={`px-2.5 py-1 text-[11.5px] font-medium rounded-[3px] transition-colors cursor-pointer ${
                activeMatterCase === 'bates'
                  ? 'bg-ink text-white'
                  : 'text-ink-slate hover:text-ink'
              }`}
            >
              Bates v Post Office [2019]
            </button>
            <button
              onClick={() => setActiveMatterCase('novacorp')}
              className={`px-2.5 py-1 text-[11.5px] font-medium rounded-[3px] transition-colors cursor-pointer ${
                activeMatterCase === 'novacorp'
                  ? 'bg-ink text-white'
                  : 'text-ink-slate hover:text-ink'
              }`}
            >
              NovaCorp Cloud MSA
            </button>
            <button
              onClick={() => setActiveMatterCase('tenancy')}
              className={`px-2.5 py-1 text-[11.5px] font-medium rounded-[3px] transition-colors cursor-pointer ${
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
            Deterministic Grounding Active
          </Badge>
          <Badge variant="ochre" size="sm">
            Adverse Discrepancy Flagged
          </Badge>
        </div>
      </div>

      {/* Exhibit Header */}
      <div className="px-6 py-4 border-b border-border-hairline bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink font-serif">
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
          className="self-start md:self-auto px-3.5 py-1.5 bg-proofline-blue hover:bg-proofline-navy text-white text-[12px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer"
        >
          <span>Open in Full Workbench</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Side-by-Side Dual Exhibit Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-hairline bg-white">
        {/* Exhibit 1: Judicial / Master Record */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded-[3px] border border-amber-200">
              Exhibit A &bull; Contemporaneous Disclosure / Judgment
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-ink-steel font-mono pt-1">
            <span className="truncate max-w-[280px]" title={active.sourceDocSha}>SHA-256: {active.sourceDocSha.slice(0, 16)}...{active.sourceDocSha.slice(-8)}</span>
            <span className="text-proofline-green font-medium flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Verifiable Digest
            </span>
          </div>
        </div>

        {/* Exhibit 2: Client / Opposing Record */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-[3px] border border-blue-200">
              Exhibit B &bull; Opposing Representation / Search Record
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-ink-steel font-mono pt-1">
            <span className="truncate max-w-[280px]" title={active.clientDocSha}>SHA-256: {active.clientDocSha.slice(0, 16)}...{active.clientDocSha.slice(-8)}</span>
            <span className="text-proofline-green font-medium flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Verifiable Digest
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

        <div className="shrink-0 flex items-center gap-1.5 text-ink-slate bg-white px-3 py-1.5 rounded-[4px] border border-border-hairline font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-proofline-green" />
          <span>{active.admissibilityCert}</span>
        </div>
      </div>
    </div>
  );
};
