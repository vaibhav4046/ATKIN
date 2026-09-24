import React, { useState } from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  FileText, 
  GitCompare, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import type { MorningQueueItem } from '../../types/index.ts';
import type { WorkbenchTab } from '../layout/Sidebar.tsx';
import { Badge } from '../common/Badge.tsx';

interface MorningReviewQueueProps {
  matterId: string;
  matterTitle: string;
  onNavigateTab: (tab: WorkbenchTab) => void;
}

export const MorningReviewQueue: React.FC<MorningReviewQueueProps> = ({
  matterId,
  matterTitle,
  onNavigateTab
}) => {
  // Generate realistic, legally sound queue items grounded in the current matter
  const isBates = matterId.includes('bates');
  const isContract = matterId.includes('contract');
  const isTenancy = matterId.includes('tenancy');

  const initialItems: MorningQueueItem[] = isBates ? [
    {
      id: 'mq-1',
      matterId,
      matterTitle,
      category: 'contradiction',
      priority: 'urgent',
      title: 'Fujitsu PIN-188 Bug Report Contradiction',
      summary: 'Horizon Problem Incident PIN-188 directly impeaches Post Office witness deposition on branch accounting inviolability.',
      dueOrAlertDate: 'Immediate',
      targetTab: 'facts',
      isResolved: false
    },
    {
      id: 'mq-2',
      matterId,
      matterTitle,
      category: 'deadline',
      priority: 'high',
      title: 'CPR Part 31 List of Documents Exchange',
      summary: 'Mandatory standard disclosure exchange deadline with Defendant legal representatives.',
      dueOrAlertDate: '28 Sep 2026',
      targetTab: 'timeline',
      isResolved: false
    },
    {
      id: 'mq-3',
      matterId,
      matterTitle,
      category: 'unreviewed_draft',
      priority: 'high',
      title: 'Witness Statement Paras 14-19 Unverified',
      summary: 'Draft brief contains 6 factual assertions regarding branch audit telemetry requiring exact character-span verification.',
      dueOrAlertDate: 'Pending Sign-off',
      targetTab: 'draft',
      isResolved: false
    },
    {
      id: 'mq-4',
      matterId,
      matterTitle,
      category: 'changed_evidence',
      priority: 'normal',
      title: 'Supplemental Horizon Accounting Log Ingested',
      summary: 'SHA-256 hash verified. 4 new branch discrepancies identified by matter analyzer.',
      dueOrAlertDate: '24 Sep 2026',
      targetTab: 'sources',
      isResolved: false
    }
  ] : isContract ? [
    {
      id: 'mq-1',
      matterId,
      matterTitle,
      category: 'contradiction',
      priority: 'urgent',
      title: 'Clause 4.2 (Net 30) vs Schedule B (Net 60) Payment Conflict',
      summary: 'Dual payment term conflict creates £240,000 billing exposure under institutional playbook rules.',
      dueOrAlertDate: 'Immediate',
      targetTab: 'contract',
      isResolved: false
    },
    {
      id: 'mq-2',
      matterId,
      matterTitle,
      category: 'deadline',
      priority: 'high',
      title: 'Non-Renewal Written Notice Window',
      summary: 'Contract Clause 8.2 requires 30 days prior written notice before annual auto-renewal executes.',
      dueOrAlertDate: '11 Jan 2027',
      targetTab: 'timeline',
      isResolved: false
    },
    {
      id: 'mq-3',
      matterId,
      matterTitle,
      category: 'unreviewed_draft',
      priority: 'normal',
      title: 'Clause 7.2 Mutual Indemnity Redline Draft',
      summary: 'Automated redline inserting gross negligence and IP infringement exceptions awaits solicitor review.',
      dueOrAlertDate: 'Pending Sign-off',
      targetTab: 'draft',
      isResolved: false
    }
  ] : isTenancy ? [
    {
      id: 'mq-1',
      matterId,
      matterTitle,
      category: 'deadline',
      priority: 'urgent',
      title: 'Housing Act 2004 s.214 Penalty Claim Limitation',
      summary: 'Statutory 6-year limitation for tenancy deposit non-protection claim approaching.',
      dueOrAlertDate: '15 Oct 2026',
      targetTab: 'timeline',
      isResolved: false
    },
    {
      id: 'mq-2',
      matterId,
      matterTitle,
      category: 'contradiction',
      priority: 'high',
      title: 'Deposit Receipt vs DPS Registration Search',
      summary: 'Landlord confirmed receipt of £2,400 deposit but Deposit Protection Service register confirms zero entry.',
      dueOrAlertDate: 'Action Required',
      targetTab: 'facts',
      isResolved: false
    }
  ] : [
    {
      id: 'mq-1',
      matterId,
      matterTitle,
      category: 'deadline',
      priority: 'urgent',
      title: 'Statutory 6-Month Defect Window Expiry',
      summary: 'Consumer Rights Act 2015 s.19(14) reversed burden of proof expires in 11 days.',
      dueOrAlertDate: '18 Jul 2026',
      targetTab: 'timeline',
      isResolved: false
    },
    {
      id: 'mq-2',
      matterId,
      matterTitle,
      category: 'unreviewed_draft',
      priority: 'high',
      title: 'Letter Before Action Awaiting Character-Span Verification',
      summary: 'CRA 2015 s.9 statutory remedy letter requires confirmation of engineer invoice character span.',
      dueOrAlertDate: 'Pending Sign-off',
      targetTab: 'draft',
      isResolved: false
    }
  ];

  const [items, setItems] = useState<MorningQueueItem[]>(initialItems);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const toggleResolved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isResolved: !item.isResolved } : item
    ));
  };

  const filteredItems = items.filter(item => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const unresolvedCount = items.filter(i => !i.isResolved).length;

  const getCategoryBadge = (category: MorningQueueItem['category']) => {
    switch (category) {
      case 'deadline':
        return <Badge variant="ochre" size="sm">Statutory Deadline</Badge>;
      case 'contradiction':
        return <Badge variant="red" size="sm">Evidential Conflict</Badge>;
      case 'unreviewed_draft':
        return <Badge variant="blue" size="sm">Unreviewed Draft</Badge>;
      case 'changed_evidence':
        return <Badge variant="green" size="sm">Evidence Updated</Badge>;
      default:
        return <Badge variant="slate" size="sm">Matter Task</Badge>;
    }
  };

  const getPriorityBadge = (priority: MorningQueueItem['priority']) => {
    if (priority === 'urgent') return <Badge variant="red" size="sm">Urgent</Badge>;
    if (priority === 'high') return <Badge variant="ochre" size="sm">High</Badge>;
    return <Badge variant="slate" size="sm">Standard</Badge>;
  };

  return (
    <div className="bg-white border border-border-hairline rounded-[6px] p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-serif font-semibold text-ink">
              Morning Review Queue
            </h3>
            <span className="text-xs px-2 py-0.5 bg-canvas text-ink-slate font-medium border border-border-hairline rounded-[4px]">
              {unresolvedCount} Action Item{unresolvedCount === 1 ? '' : 's'} Pending
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            12-stage daily working queue: deadlines, evidence changes, draft sign-offs, and procedural audit gates.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-ink-muted mr-1" />
          {[
            { id: 'all', label: 'All' },
            { id: 'deadline', label: 'Deadlines' },
            { id: 'contradiction', label: 'Conflicts' },
            { id: 'unreviewed_draft', label: 'Drafts' },
            { id: 'changed_evidence', label: 'Evidence' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`text-xs px-2.5 py-1 rounded-[4px] border transition-colors ${
                filterCategory === f.id
                  ? 'bg-ink text-white border-ink font-medium'
                  : 'bg-white text-ink-slate border-border-hairline hover:bg-canvas hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Item List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-ink-muted bg-canvas border border-dashed border-border-hairline rounded-[4px]">
            No pending items in this category. All evidential gates satisfied.
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => onNavigateTab(item.targetTab)}
              className={`p-3.5 border rounded-[4px] transition-all cursor-pointer flex items-start justify-between gap-4 ${
                item.isResolved
                  ? 'bg-canvas/50 border-border-hairline opacity-60'
                  : 'bg-white border-border-hairline hover:border-slate-400 hover:shadow-subtle'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={(e) => toggleResolved(item.id, e)}
                  title={item.isResolved ? 'Mark uncompleted' : 'Mark completed'}
                  className={`mt-0.5 w-4 h-4 rounded-[2px] border flex items-center justify-center transition-colors ${
                    item.isResolved
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-slate-500 bg-white'
                  }`}
                >
                  {item.isResolved && <Check className="w-3 h-3 stroke-[2.5]" />}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {getCategoryBadge(item.category)}
                    {getPriorityBadge(item.priority)}
                    {item.dueOrAlertDate && (
                      <span className="text-[11px] font-mono text-ink-muted">
                        {item.dueOrAlertDate}
                      </span>
                    )}
                  </div>
                  <h4 className={`text-sm font-medium ${item.isResolved ? 'line-through text-ink-muted' : 'text-ink'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-ink-slate leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-blue-700 font-medium whitespace-nowrap self-center hover:underline">
                <span>Open {item.targetTab}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
