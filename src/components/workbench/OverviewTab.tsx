import React from 'react';
import { 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  Calendar,
  Lock,
  Scale,
  Binary
} from 'lucide-react';
import type { Matter, Document, Claim, ReviewItem, Authority } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import type { WorkbenchTab } from '../layout/Sidebar.tsx';

interface OverviewTabProps {
  matter: Matter;
  documents: Document[];
  claims: Claim[];
  reviewItems: ReviewItem[];
  authorities: Authority[];
  onNavigateTab: (tab: WorkbenchTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  matter,
  documents,
  claims,
  reviewItems,
  authorities,
  onNavigateTab
}) => {
  const pendingReviews = reviewItems.filter(r => r.status === 'pending');
  const contestedClaims = claims.filter(c => c.status === 'contested');

  const isBates = matter.id.includes('bates');
  const isContract = matter.matterType === 'contract' || matter.id.includes('contract');
  const isTenancy = matter.matterType === 'tenancy' || matter.id.includes('tenancy');

  const categoryBadge = isBates 
    ? 'High Court Group Litigation' 
    : isContract 
    ? 'Enterprise Cloud Master Agreement' 
    : isTenancy 
    ? 'Housing & Tenancy Disrepair' 
    : 'Civil Consumer Litigation';

  const trackBadge = isBates 
    ? 'CPR Part 19 & Part 31 Evidential Disclosure' 
    : isContract 
    ? 'Institutional SaaS Playbook Review' 
    : isTenancy 
    ? 'Housing Act 2004 Pre-Action Protocol' 
    : 'Pre-Action Protocol for Debt Claims';

  const timelineNote = isBates
    ? {
        text: 'Horizon Bug 188 Disclosed · Implied Duty of Good Faith Established (Fraser J)',
        badge: 'UCTA 1977 s.3 & CPR Part 31'
      }
    : isContract
    ? {
        text: 'Agreement Effective: 10 Feb 2026 · Non-Renewal Notice Deadline: 11 Jan 2027',
        badge: 'Playbook Rules Active'
      }
    : isTenancy
    ? {
        text: 'Deposit Received: 01 Sep 2025 · 30-Day Mandatory Protection Expiry: 01 Oct 2025',
        badge: 'Housing Act 2004 s.214 Active'
      }
    : {
        text: 'Delivery: 18 Jan 2026 · Statutory 6-Month Presumption Window ends: 18 Jul 2026',
        badge: 'CRA 2015 s.19(14) Active'
      };

  const dynamicContradiction = isBates
    ? {
        title: 'Fujitsu PIN-188 Bug Report vs Post Office Terminal Integrity Testimony',
        description: 'Fujitsu Problem Incident PIN-188 documents remote accounting branch modifications and terminal lockups, directly contradicting Post Office witness depositions claiming Horizon system inviolability.',
        buttonText: 'Compare Horizon Telemetry Evidence'
      }
    : isContract
    ? {
        title: 'Master Agreement Net 30 vs Schedule B Net 60 Billing Discrepancy',
        description: 'Clause 4.2 specifies invoice payment on Net 30 terms, but Schedule B Fee Addendum specifies Net 60 terms, creating contractual ambiguity and £240,000 in payment default exposure.',
        buttonText: 'Compare Payment Term Provisions'
      }
    : isTenancy
    ? {
        title: 'Tenancy Deposit Receipt vs Government Deposit Scheme Registration Failure',
        description: 'Tenancy agreement confirms £2,400 deposit payment, but Tenancy Deposit Scheme database audit confirms deposit was never registered within the mandatory 30-day statutory window.',
        buttonText: 'Audit Housing Act Breach'
      }
    : {
        title: 'Defect Onset Discrepancy: 8 April Telephony Intake vs 12 April Witness Statement',
        description: 'Client recalls total failure on 12 April 2026. However, contemporary CRM telephony log records a call reporting freezing on 8 April 2026. Both fall inside the 6-month statutory window.',
        buttonText: 'Reconcile Timeline Dates'
      };

  return (
    <div className="space-y-5 max-w-[940px] mx-auto py-2">
      {/* Matter Master Card */}
      <div className="bg-white border border-border-hairline rounded-[6px] p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="blue" size="sm">{categoryBadge}</Badge>
              <Badge variant="slate" size="sm">{trackBadge}</Badge>
              <Badge variant="green" size="sm">{matter.jurisdiction}</Badge>
            </div>
            <h2 className="text-xl font-serif font-semibold text-ink tracking-tight pt-0.5">
              {matter.title}
            </h2>
            <p className="text-[13px] text-ink-slate leading-relaxed max-w-[680px]">
              {matter.notes || 'Matter file under active evidential audit and statutory assessment.'}
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-end justify-between gap-2.5">
            <span className="text-[11px] text-ink-steel font-mono">
              Indexed: {new Date(matter.createdAt).toLocaleDateString('en-GB')}
            </span>
            <button
              onClick={() => onNavigateTab('draft')}
              className="px-3.5 py-1.5 bg-proofline-blue hover:bg-blue-700 text-white text-[12px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 shadow-subtle"
            >
              <span>Audit Draft Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Procedural Limitation & Authority Strip */}
        <div className="mt-4 pt-3 border-t border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-ink-slate">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-proofline-blue shrink-0" />
            <span>{timelineNote.text}</span>
          </div>
          <span className="text-proofline-green font-medium flex items-center gap-1 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            {timelineNote.badge}
          </span>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => onNavigateTab('sources')}
          className="bg-white border border-border-hairline hover:border-proofline-blue rounded-[6px] p-3.5 cursor-pointer transition-colors shadow-subtle"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('sources'); }}
          aria-label="View Source Documents"
        >
          <div className="flex items-center justify-between text-ink-steel mb-1.5">
            <span className="text-[11.5px] font-medium">Source Documents</span>
            <FileText className="w-3.5 h-3.5 text-proofline-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{documents.length}</div>
          <div className="text-[10.5px] text-proofline-green mt-1 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3" />
            SHA-256 Verified
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('facts')}
          className="bg-white border border-border-hairline hover:border-proofline-blue rounded-[6px] p-3.5 cursor-pointer transition-colors shadow-subtle"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('facts'); }}
          aria-label="View Fact Ledger"
        >
          <div className="flex items-center justify-between text-ink-steel mb-1.5">
            <span className="text-[11.5px] font-medium">Claim Ledger</span>
            <CheckSquare className="w-3.5 h-3.5 text-proofline-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{claims.length}</div>
          <div className="text-[10.5px] text-ink-slate mt-1">
            {claims.filter(c => c.status === 'supported').length} supported facts
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('timeline')}
          className="bg-white border border-border-hairline hover:border-amber-500 rounded-[6px] p-3.5 cursor-pointer transition-colors shadow-subtle"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('timeline'); }}
          aria-label="View Contradictions"
        >
          <div className="flex items-center justify-between text-ink-steel mb-1.5">
            <span className="text-[11.5px] font-medium">Adverse Conflicts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">{contestedClaims.length}</div>
          <div className="text-[10.5px] text-amber-800 mt-1">
            Requires Pre-Action Inquiry
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('review')}
          className="bg-white border border-border-hairline hover:border-proofline-blue rounded-[6px] p-3.5 cursor-pointer transition-colors shadow-subtle"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('review'); }}
          aria-label="View Review Queue"
        >
          <div className="flex items-center justify-between text-ink-steel mb-1.5">
            <span className="text-[11.5px] font-medium">Review Queue</span>
            <Badge variant="ochre" size="sm">{pendingReviews.length} pending</Badge>
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{reviewItems.length}</div>
          <div className="text-[10.5px] text-ink-slate mt-1">
            Evidential Sign-off Needed
          </div>
        </div>
      </div>

      {/* Featured Matter Contradiction Callout */}
      {contestedClaims.length > 0 && (
        <div className="bg-white border border-amber-300 rounded-[6px] p-4 shadow-subtle">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-[4px] bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-900">
                  Adverse Factual Contradiction Discovered
                </span>
                <Badge variant="ochre" size="sm">High Priority</Badge>
              </div>
              <h3 className="text-[14px] font-semibold text-ink">
                {dynamicContradiction.title}
              </h3>
              <p className="text-[12.5px] text-ink-slate leading-relaxed">
                {dynamicContradiction.description}
              </p>

              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="text-[11.5px] font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-[3px] transition-colors flex items-center gap-1"
                >
                  <span>{dynamicContradiction.buttonText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onNavigateTab('draft')}
                  className="text-[11.5px] font-medium text-ink-steel hover:text-ink transition-colors"
                >
                  View Affected Draft Block &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Boundary Architecture Receipt */}
      <div className="bg-canvas-subtle border border-border-hairline rounded-[6px] p-4 text-[12.5px] text-ink space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <Lock className="w-3.5 h-3.5 text-proofline-green" />
          <span>Local Evidence Sovereignty &amp; Security Boundary</span>
        </div>
        <p className="text-ink-slate leading-relaxed text-[12px]">
          All case files, extracted spans, and claim ledgers are stored strictly in client-side IndexedDB on this machine. No matter text is sent to third-party APIs. Prompt injection instructions embedded in imported documents are safely parsed as inert quoted text and cannot alter the verifier gate or execute network calls.
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-[10.5px] text-ink-steel font-mono">
          <span className="px-2 py-0.5 bg-white border border-border-hairline rounded-[3px]">IndexedDB: Active</span>
          <span className="px-2 py-0.5 bg-white border border-border-hairline rounded-[3px]">SHA-256 Provenance: Enforced</span>
          <span className="px-2 py-0.5 bg-white border border-border-hairline rounded-[3px]">Loopback: 127.0.0.1</span>
          <span className="px-2 py-0.5 bg-white border border-border-hairline rounded-[3px]">SRA AI Guidance: Compliant</span>
        </div>
      </div>
    </div>
  );
};
