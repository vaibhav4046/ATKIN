import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import type { Matter, Document, Claim, ReviewItem, Authority } from '../../types/index';
import { Badge } from '../common/Badge';
import type { WorkbenchTab } from '../layout/Sidebar';
import { MorningReviewQueue } from './MorningReviewQueue';
import { StrategyLabEngine } from '../../engine/strategy/strategyLabEngine';
import { AtkinLogo } from '../common/AtkinLogo';
import { BRAND, TERMINOLOGY } from '../../content/brand';

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
  const [askQuery, setAskQuery] = useState('');
  const pendingReviews = reviewItems.filter(r => r.status === 'pending');
  const contestedClaims = claims.filter(c => c.status === 'contested');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const isBates = matter.id.includes('bates');
  const isContract = matter.matterType === 'contract' || matter.id.includes('contract');
  const isTenancy = matter.matterType === 'tenancy' || matter.id.includes('tenancy');

  const categoryBadge = isBates 
    ? 'High Court Group Litigation' 
    : isContract 
    ? 'Commercial Services Agreement' 
    : isTenancy 
    ? 'Housing & Tenancy Disrepair' 
    : 'Civil Dispute Matter';

  const trackBadge = isBates 
    ? 'CPR Part 19 & Part 31 Evidential Disclosure' 
    : isContract 
    ? 'Commercial Playbook Review' 
    : isTenancy 
    ? 'Housing Act 2004 Pre-Action Protocol' 
    : 'Pre-Action Protocol for Civil Claims';

  const timelineNote = isBates
    ? {
        text: 'Horizon Bug 188 Disclosed · Implied Duty of Good Faith Established (Fraser J)',
        badge: 'UCTA 1977 s.3 & CPR Part 31'
      }
    : isContract
    ? {
        text: 'Agreement Effective: 12 March 2026 · Notice Clause 3.2: 37 Calendar Days',
        badge: 'Contract Terms Active'
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
        description: 'Fujitsu Problem Incident PIN-188 documents remote accounting branch modifications, contradicting witness statements claiming Horizon inviolability.',
        buttonText: 'Compare Telemetry Evidence'
      }
    : isContract
    ? {
        title: 'Notice for Convenience (37 Days) vs Material Breach Cure (14 Days)',
        description: 'Clause 3.2 establishes 37 days notice for convenience without cause, while Clause 3.3 requires 14 days cure window for material breach.',
        buttonText: 'Compare Notice Provisions'
      }
    : isTenancy
    ? {
        title: 'Tenancy Deposit Receipt vs Deposit Scheme Registration Failure',
        description: 'Agreement confirms £2,400 deposit payment, but Tenancy Deposit Scheme records confirm deposit was never registered within the mandatory 30-day statutory window.',
        buttonText: 'Audit Statutory Breach'
      }
    : {
        title: 'Defect Onset Discrepancy: 8 April Telephony Intake vs 12 April Statement',
        description: 'Intake record notes freezing on 8 April 2026, while statement recalls failure on 12 April 2026. Both fall inside the 6-month statutory window.',
        buttonText: 'Reconcile Timeline Dates'
      };

  return (
    <div className="space-y-6 max-w-[940px] mx-auto py-2 font-sans text-atkin-ink">
      {/* Home Greeting & Practice Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-atkin-border">
        <div>
          <h2 className="text-2xl font-serif text-atkin-ink font-normal tracking-tight">
            {greeting}, Practitioner
          </h2>
          <p className="text-[12.5px] text-atkin-muted font-mono mt-0.5">
            Active Matter: <span className="text-atkin-ink font-semibold">{matter.title}</span> ({matter.clientAlias})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-atkin-surface border border-atkin-border text-atkin-muted">
            {matter.jurisdiction}
          </span>
          <button
            onClick={() => onNavigateTab('sources')}
            className="text-[12px] font-medium text-atkin-muted hover:text-atkin-ink px-2.5 py-1 rounded border border-atkin-border hover:bg-atkin-surface transition-colors cursor-pointer"
          >
            + Add Source
          </button>
        </div>
      </div>

      {/* Prominent Ask Composer (Home Quick Action) */}
      <div className="bg-atkin-surface border border-atkin-border rounded-[8px] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-atkin-muted">
          <div className="flex items-center gap-1.5 font-semibold text-atkin-ink">
            <MessageSquare className="w-3.5 h-3.5 text-atkin-ink" />
            <span>ASK THIS MATTER</span>
          </div>
          <span>Local Sovereign Reasoning</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text"
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            placeholder="Ask a question against indexed documents, timeline dates, or statutory clauses..."
            onKeyDown={(e) => { 
              if (e.key === 'Enter') {
                onNavigateTab('chat');
              }
            }}
            className="flex-1 bg-atkin-bg border border-atkin-border rounded-[4px] px-3.5 py-2 text-[13px] text-atkin-ink placeholder:text-atkin-muted focus:outline-none focus:border-atkin-ink"
          />
          <button 
            onClick={() => onNavigateTab('chat')}
            className="px-4 py-2 bg-atkin-ink text-atkin-bg rounded-[4px] text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Ask</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Matter Master Card */}
      <div className="bg-atkin-surface border border-atkin-border rounded-[8px] p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <AtkinLogo className="w-10 h-10 rounded-[6px] border border-atkin-border shadow-xs mt-1 shrink-0" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-ink">{categoryBadge}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-muted">{trackBadge}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-muted">{matter.jurisdiction}</span>
              </div>
              <h3 className="text-xl font-serif text-atkin-ink tracking-tight pt-0.5">
                {matter.title}
              </h3>
              <p className="text-[13px] text-atkin-muted leading-relaxed max-w-[680px]">
                {matter.notes || 'Matter file under active evidential audit and statutory assessment.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col items-end justify-between gap-2.5">
            <span className="text-[11px] text-atkin-muted font-mono">
              Indexed: {new Date(matter.createdAt).toLocaleDateString('en-GB')}
            </span>
            <button
              onClick={() => onNavigateTab('draft')}
              className="px-3.5 py-1.5 bg-atkin-ink text-atkin-bg hover:opacity-90 text-[12px] font-medium rounded-[4px] transition-opacity flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Examine Draft</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Procedural Limitation & Authority Strip */}
        <div className="mt-4 pt-3 border-t border-atkin-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-atkin-muted">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-atkin-ink shrink-0" />
            <span className="text-atkin-ink">{timelineNote.text}</span>
          </div>
          <span className="text-atkin-muted font-medium flex items-center gap-1 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-atkin-ink" />
            {timelineNote.badge}
          </span>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => onNavigateTab('sources')}
          className="bg-atkin-surface border border-atkin-border hover:border-atkin-ink rounded-[6px] p-3.5 cursor-pointer transition-colors shadow-2xs"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('sources'); }}
          aria-label="View Source Documents"
        >
          <div className="flex items-center justify-between text-atkin-muted mb-1.5">
            <span className="text-[11.5px] font-medium font-sans">{TERMINOLOGY.source}s</span>
            <FileText className="w-3.5 h-3.5 text-atkin-ink" />
          </div>
          <div className="text-2xl font-bold font-mono text-atkin-ink">{documents.length}</div>
          <div className="text-[10.5px] text-atkin-muted mt-1 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3 text-atkin-ink" />
            SHA-256 Provenance
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('facts')}
          className="bg-atkin-surface border border-atkin-border hover:border-atkin-ink rounded-[6px] p-3.5 cursor-pointer transition-colors shadow-2xs"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('facts'); }}
          aria-label="View Fact Ledger"
        >
          <div className="flex items-center justify-between text-atkin-muted mb-1.5">
            <span className="text-[11.5px] font-medium font-sans">Fact Ledger</span>
            <CheckSquare className="w-3.5 h-3.5 text-atkin-ink" />
          </div>
          <div className="text-2xl font-bold font-mono text-atkin-ink">{claims.length}</div>
          <div className="text-[10.5px] text-atkin-muted mt-1">
            {claims.filter(c => c.status === 'supported').length} supported facts
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('timeline')}
          className="bg-atkin-surface border border-atkin-border hover:border-amber-500 rounded-[6px] p-3.5 cursor-pointer transition-colors shadow-2xs"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('timeline'); }}
          aria-label="View Contradictions"
        >
          <div className="flex items-center justify-between text-atkin-muted mb-1.5">
            <span className="text-[11.5px] font-medium font-sans">Adverse Conflicts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{contestedClaims.length}</div>
          <div className="text-[10.5px] text-amber-700 dark:text-amber-400 mt-1">
            Pre-action attention
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('review')}
          className="bg-atkin-surface border border-atkin-border hover:border-atkin-ink rounded-[6px] p-3.5 cursor-pointer transition-colors shadow-2xs"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('review'); }}
          aria-label="View Review Queue"
        >
          <div className="flex items-center justify-between text-atkin-muted mb-1.5">
            <span className="text-[11.5px] font-medium font-sans">{TERMINOLOGY.needsReview}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">{pendingReviews.length} pending</span>
          </div>
          <div className="text-2xl font-bold font-mono text-atkin-ink">{reviewItems.length}</div>
          <div className="text-[10.5px] text-atkin-muted mt-1">
            Sign-off items
          </div>
        </div>
      </div>

      {/* Lawyer Morning Review Queue */}
      <MorningReviewQueue
        matterId={matter.id}
        matterTitle={matter.title}
        onNavigateTab={onNavigateTab}
      />

      {/* Featured Matter Contradiction Callout */}
      {contestedClaims.length > 0 && (
        <div className="bg-atkin-surface border border-amber-500/40 rounded-[6px] p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-[4px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Adverse Factual Contradiction Discovered
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">High Priority</span>
              </div>
              <h4 className="text-[14px] font-semibold text-atkin-ink font-serif">
                {dynamicContradiction.title}
              </h4>
              <p className="text-[12.5px] text-atkin-muted leading-relaxed font-sans">
                {dynamicContradiction.description}
              </p>

              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="text-[11.5px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-[3px] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{dynamicContradiction.buttonText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onNavigateTab('draft')}
                  className="text-[11.5px] font-medium text-atkin-muted hover:text-atkin-ink transition-colors cursor-pointer"
                >
                  View Affected Draft Block &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Lab: Objective Evidential Readiness */}
      {(() => {
        const strategyReport = StrategyLabEngine.evaluateCaseReadiness(matter, documents, claims, reviewItems);
        const percent = Math.round(strategyReport.evidenceCoverageRatio * 100);

        return (
          <div className="bg-atkin-surface border border-atkin-border rounded-[8px] p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-atkin-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-serif font-semibold text-atkin-ink">
                    Strategy Lab: Evidential Grounding
                  </h3>
                  <span className={`text-[10.5px] font-mono px-2 py-0.5 rounded border ${percent >= 75 ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'}`}>
                    {percent}% Evidenced
                  </span>
                </div>
                <p className="text-xs text-atkin-muted mt-0.5">
                  Civil Evidence Act 1995 &amp; CPR Part 32 readiness ratio. Zero ungrounded outcome claims.
                </p>
              </div>

              <span className="text-[11px] font-mono text-atkin-muted">
                {strategyReport.evidencedElements} / {strategyReport.totalRequiredElements} Elements Grounded
              </span>
            </div>

            {/* Coverage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-atkin-muted font-medium font-sans">
                <span>Statutory Evidence Coverage</span>
                <span className="font-mono text-atkin-ink">{percent}%</span>
              </div>
              <div className="w-full bg-atkin-bg rounded-[2px] h-2 overflow-hidden border border-atkin-border">
                <div 
                  className="h-full bg-atkin-ink transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Statutory Elements Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-atkin-muted font-mono">
                Required Statutory &amp; Precedent Elements
              </h4>
              <div className="space-y-1.5">
                {strategyReport.statutoryCoverages.map(elem => (
                  <div 
                    key={elem.elementId}
                    className="p-2.5 bg-atkin-bg border border-atkin-border rounded-[4px] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-atkin-ink font-sans">
                        {elem.requirementDescription}
                      </div>
                      <div className="text-[11px] font-mono text-atkin-muted">
                        {elem.statutoryReference}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${elem.isEvidenced ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'}`}>
                      {elem.isEvidenced ? 'Evidenced' : 'Unproven'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Essential Proof Checklist */}
            {strategyReport.missingDocumentChecklist.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-atkin-muted font-mono">
                  Evidential Gap Checklist (Missing Disclosures)
                </h4>
                <ul className="space-y-1 text-xs text-atkin-muted">
                  {strategyReport.missingDocumentChecklist.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-atkin-ink font-bold">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })()}

      {/* Trust & Boundary Architecture Receipt */}
      <div className="bg-atkin-surface border border-atkin-border rounded-[8px] p-4 text-[12.5px] text-atkin-ink space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 font-semibold">
          <Lock className="w-3.5 h-3.5 text-atkin-ink" />
          <span>Local Evidence Sovereignty &amp; Boundary Receipt</span>
        </div>
        <p className="text-atkin-muted leading-relaxed text-[12px] font-sans">
          All case files, extracted spans, and claim ledgers are stored strictly in client-side storage on this machine. No matter text is sent to third-party APIs unless explicitly configured. Prompt injection instructions embedded in imported documents are safely parsed as inert quoted text and cannot alter the verifier gate or execute network calls.
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-[10.5px] text-atkin-muted font-mono">
          <span className="px-2 py-0.5 bg-atkin-bg border border-atkin-border rounded-[3px]">IndexedDB / SQLite: Active</span>
          <span className="px-2 py-0.5 bg-atkin-bg border border-atkin-border rounded-[3px]">SHA-256 Provenance: Enforced</span>
          <span className="px-2 py-0.5 bg-atkin-bg border border-atkin-border rounded-[3px]">Loopback: 127.0.0.1</span>
        </div>
      </div>
    </div>
  );
};
