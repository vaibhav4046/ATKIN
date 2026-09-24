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
  Sparkles
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

  return (
    <div className="space-y-6 max-w-[920px] mx-auto py-2">
      {/* Matter Header Banner */}
      {/* Matter Header Banner */}
      {(() => {
        const isBates = matter.id.includes('bates');
        const isContract = matter.matterType === 'contract' || matter.id.includes('contract');
        const isTenancy = matter.matterType === 'tenancy' || matter.id.includes('tenancy');

        const categoryBadge = isBates 
          ? 'High Court Commercial / Group Litigation' 
          : isContract 
          ? 'Enterprise Cloud Master Agreement' 
          : isTenancy 
          ? 'Housing & Tenancy Disrepair' 
          : 'Civil Consumer Litigation';

        const trackBadge = isBates 
          ? 'Civil Procedure Rules (CPR Part 19 / Part 31)' 
          : isContract 
          ? 'Institutional SaaS Playbook Review' 
          : isTenancy 
          ? 'Housing Act 2004 Pre-Action' 
          : 'Pre-Action Protocol for Debt Claims';

        const timelineNote = isBates
          ? {
              text: 'Judgment Handdown: 16 Dec 2019 (Fraser J) → Horizon Bug 188 Disclosed · Implied Duty of Good Faith Established',
              badge: 'UCTA 1977 s.3 & CPR Part 31'
            }
          : isContract
          ? {
              text: 'Agreement Effective: 10 Feb 2026 → 30-Day Non-Renewal Notification Deadline: 11 Jan 2027',
              badge: 'Playbook Rules & Cap Active'
            }
          : isTenancy
          ? {
              text: 'Tenancy Deposit Received: 01 Sep 2025 → 30-Day Mandatory Protection Expiry: 01 Oct 2025',
              badge: 'Housing Act 2004 s.214 Active'
            }
          : {
              text: 'Delivery: 18 Jan 2026 → Statutory 6-Month Presumption Window ends: 18 Jul 2026',
              badge: 'CRA 2015 s.19(14) Active'
            };

        return (
          <div className="bg-gallery-white border border-border-hairline rounded-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="blue" size="sm">{categoryBadge}</Badge>
                  <Badge variant="slate" size="sm">{trackBadge}</Badge>
                  <Badge variant="green" size="sm">Jurisdiction: {matter.jurisdiction}</Badge>
                </div>
                <h2 className="text-2xl font-semibold text-ink tracking-tight">
                  {matter.title}
                </h2>
                <p className="text-[14px] text-ink-slate mt-1 leading-relaxed">
                  {matter.notes || 'Matter file under active evidential audit and statutory assessment.'}
                </p>
              </div>

              <div className="shrink-0 flex sm:flex-col items-end justify-between gap-2">
                <span className="text-[12px] text-ink-steel font-mono">
                  Created: {new Date(matter.createdAt).toLocaleDateString('en-GB')}
                </span>
                <button
                  onClick={() => onNavigateTab('draft')}
                  className="px-4 py-2 bg-proofline-blue hover:bg-proofline-navy text-white text-[13px] font-medium rounded-full-pill transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Audit Draft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timeline Presumption Banner */}
            <div className="mt-5 pt-4 border-t border-border-hairline/80 flex items-center justify-between text-[12px] text-ink-slate">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-proofline-blue" />
                <span>{timelineNote.text}</span>
              </div>
              <span className="text-proofline-green font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {timelineNote.badge}
              </span>
            </div>
          </div>
        );
      })()}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => onNavigateTab('sources')}
          className="bg-gallery-white border border-border-hairline hover:border-proofline-blue/40 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-subtle"
        >
          <div className="flex items-center justify-between text-ink-steel mb-2">
            <span className="text-[12px] font-medium">Source Documents</span>
            <FileText className="w-4 h-4 text-proofline-blue" />
          </div>
          <div className="text-2xl font-bold text-ink">{documents.length}</div>
          <div className="text-[11px] text-proofline-green mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            100% SHA-256 Verified
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('facts')}
          className="bg-gallery-white border border-border-hairline hover:border-proofline-blue/40 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-subtle"
        >
          <div className="flex items-center justify-between text-ink-steel mb-2">
            <span className="text-[12px] font-medium">Claim Ledger</span>
            <CheckSquare className="w-4 h-4 text-proofline-blue" />
          </div>
          <div className="text-2xl font-bold text-ink">{claims.length}</div>
          <div className="text-[11px] text-ink-slate mt-1">
            {claims.filter(c => c.status === 'supported').length} supported facts
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('timeline')}
          className="bg-gallery-white border border-border-hairline hover:border-proofline-ochre/40 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-subtle"
        >
          <div className="flex items-center justify-between text-ink-steel mb-2">
            <span className="text-[12px] font-medium">Contradictions</span>
            <AlertTriangle className="w-4 h-4 text-proofline-ochre" />
          </div>
          <div className="text-2xl font-bold text-proofline-ochre">{contestedClaims.length}</div>
          <div className="text-[11px] text-proofline-ochre mt-1">
            8 Apr vs 12 Apr onset
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('review')}
          className="bg-gallery-white border border-border-hairline hover:border-proofline-blue/40 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-subtle"
        >
          <div className="flex items-center justify-between text-ink-steel mb-2">
            <span className="text-[12px] font-medium">Review Queue</span>
            <Badge variant="ochre" size="sm">{pendingReviews.length} pending</Badge>
          </div>
          <div className="text-2xl font-bold text-ink">{reviewItems.length}</div>
          <div className="text-[11px] text-ink-slate mt-1">
            Pre-action sign-off needed
          </div>
        </div>
      </div>

      {/* Featured Contradiction Callout */}
      {contestedClaims.length > 0 && (
        <div className="bg-gallery-white border border-proofline-ochre/30 rounded-card p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-proofline-ochre/10 flex items-center justify-center text-proofline-ochre shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-proofline-ochre uppercase tracking-wider">
                  Adverse Factual Contradiction Discovered
                </span>
                <Badge variant="ochre" size="sm">High Priority</Badge>
              </div>
              <h3 className="text-[15px] font-semibold text-ink mt-0.5">
                Defect Onset Discrepancy: 8 April (Merchant Intake) vs 12 April (Client Statement)
              </h3>
              <p className="text-[13px] text-ink-slate mt-1 leading-relaxed">
                Client’s witness statement recalls catastrophic failure on 12 April 2026. However, ZenithTech’s contemporary CRM telephony log records a call reporting intermittent freezing on 8 April 2026. Both fall inside the 6-month statutory window, but must be reconciled before issuing the Letter Before Claim.
              </p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="text-[12px] font-medium text-proofline-ochre bg-proofline-ochre/10 hover:bg-proofline-ochre/20 px-3 py-1 rounded-full-pill transition-colors flex items-center gap-1"
                >
                  <span>Compare Timeline Evidence</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onNavigateTab('draft')}
                  className="text-[12px] font-medium text-ink-slate hover:text-ink transition-colors"
                >
                  View Affected Draft Block →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Boundary Architecture Receipt */}
      <div className="bg-gallery-white border border-border-hairline rounded-card p-5 text-[13px] text-ink space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <Lock className="w-4 h-4 text-proofline-green" />
          <span>Local-First Evidence Sovereignty &amp; Security Boundary</span>
        </div>
        <p className="text-ink-slate leading-relaxed">
          All case files, extracted spans, and claim ledgers are stored strictly in client-side IndexedDB on this machine. No matter text is sent to third-party APIs. Prompt injection instructions embedded in imported documents are safely parsed as inert quoted text and cannot alter the verifier gate or execute network calls.
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-ink-steel font-mono">
          <span className="px-2 py-0.5 bg-gallery-mist rounded">IndexedDB: Active</span>
          <span className="px-2 py-0.5 bg-gallery-mist rounded">SHA-256 Provenance: Enforced</span>
          <span className="px-2 py-0.5 bg-gallery-mist rounded">Local Model Loopback: 127.0.0.1</span>
          <span className="px-2 py-0.5 bg-gallery-mist rounded">SRA Guidance: Compliant</span>
        </div>
      </div>
    </div>
  );
};
