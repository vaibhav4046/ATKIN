import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  FileText,
  RotateCcw
} from 'lucide-react';
import type { ReviewItem, ReviewSeverity } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import type { WorkbenchTab } from '../layout/Sidebar.tsx';

interface ReviewTabProps {
  reviewItems: ReviewItem[];
  onResolveItem: (id: string, note?: string) => void;
  onDismissItem: (id: string) => void;
  onNavigateTab: (tab: WorkbenchTab) => void;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  reviewItems,
  onResolveItem,
  onDismissItem,
  onNavigateTab
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const pendingItems = reviewItems.filter(r => r.status === 'pending');
  const resolvedItems = reviewItems.filter(r => r.status === 'resolved' || r.status === 'dismissed');

  const filteredPending = pendingItems.filter(r => {
    if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
    return true;
  });

  const handleConfirmResolve = (id: string) => {
    onResolveItem(id, resolutionText || 'Resolved by solicitor audit.');
    setResolvingId(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-6 max-w-[920px] mx-auto py-2">
      {/* Header & Metrics */}
      <div className="bg-gallery-white border border-border-hairline p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="ochre" size="sm">Pre-Action Audit Gate</Badge>
            <Badge variant="slate" size="sm">{pendingItems.length} Action Items</Badge>
          </div>
          <h2 className="text-[17px] font-semibold text-ink">
            Legal Evidential Review Queue
          </h2>
          <p className="text-[12px] text-ink-slate mt-0.5">
            Blocks unverified assertions, contradiction hazards, and hostile injection payloads before draft approval.
          </p>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-[12px] bg-gallery-paper border border-border-hairline rounded-full-pill px-3 py-1.5 text-ink focus:border-proofline-blue focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity Only</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Pending Items */}
      <div className="space-y-3.5">
        <h3 className="text-[14px] font-semibold text-ink flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-proofline-ochre" />
          <span>Pending Action Items ({filteredPending.length})</span>
        </h3>

        {filteredPending.length === 0 ? (
          <div className="bg-gallery-white border border-border-hairline rounded-2xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-proofline-green mx-auto" />
            <h4 className="text-[15px] font-semibold text-ink">All Action Items Resolved</h4>
            <p className="text-[13px] text-ink-slate max-w-[360px] mx-auto">
              No outstanding evidential conflicts, unsupported assertions, or unverified authorities remain in this matter.
            </p>
          </div>
        ) : (
          filteredPending.map((item) => {
            const isHigh = item.severity === 'high';
            const isResolving = resolvingId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-gallery-white border rounded-2xl p-5 shadow-xs space-y-3 transition-all ${
                  isHigh ? 'border-proofline-ochre/40 ring-1 ring-proofline-ochre/20' : 'border-border-hairline'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={isHigh ? 'ochre' : 'slate'} size="sm">
                      {item.severity.toUpperCase()} PRIORITY
                    </Badge>
                    <span className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider">
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-ink-steel">
                    {new Date(item.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>

                <div>
                  <h4 className="text-[15px] font-semibold text-ink">
                    {item.title}
                  </h4>
                  <p className="text-[13px] text-ink-slate mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Resolution Controls */}
                {isResolving ? (
                  <div className="p-3 bg-gallery-paper rounded-xl border border-border-hairline space-y-2">
                    <label className="text-[12px] font-medium text-ink block">
                      Solicitor Audit / Resolution Rationale:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Client confirmed 8 April was initial intermittent freeze, 12 April was complete failure."
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      className="w-full text-[12px] bg-gallery-white border border-border-hairline rounded-lg px-3 py-1.5 text-ink focus:border-proofline-blue focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setResolvingId(null)}
                        className="text-[12px] px-3 py-1 text-ink-slate hover:text-ink"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmResolve(item.id)}
                        className="text-[12px] px-3.5 py-1 bg-proofline-green text-white rounded-full-pill hover:bg-proofline-green/90 font-medium"
                      >
                        Confirm Resolution
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-border-hairline flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (item.type === 'contradiction') onNavigateTab('timeline');
                        else if (item.targetType === 'claim') onNavigateTab('facts');
                        else if (item.targetType === 'draft_block') onNavigateTab('draft');
                        else onNavigateTab('sources');
                      }}
                      className="text-[12px] text-proofline-blue hover:underline font-medium flex items-center gap-1"
                    >
                      <span>Jump to Evidential Context</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDismissItem(item.id)}
                        className="text-[11px] text-ink-steel hover:text-ink px-2.5 py-1 rounded hover:bg-gallery-mist"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => setResolvingId(item.id)}
                        className="text-[12px] font-medium px-3.5 py-1 rounded-full-pill bg-ink text-white hover:bg-ink/85 flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sign-off / Resolve</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Resolved Audit History */}
      {resolvedItems.length > 0 && (
        <div className="pt-4 border-t border-border-hairline space-y-3">
          <h3 className="text-[13px] font-semibold text-ink-steel uppercase tracking-wider">
            Resolution Audit Trail ({resolvedItems.length})
          </h3>

          <div className="space-y-2">
            {resolvedItems.map((item) => (
              <div
                key={item.id}
                className="bg-gallery-white border border-border-hairline/80 rounded-xl p-3 text-[12px] text-ink-slate flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 font-medium text-ink">
                    <CheckCircle2 className="w-3.5 h-3.5 text-proofline-green shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {item.resolutionNote && (
                    <div className="text-ink-steel pl-5 mt-0.5 font-mono text-[11px]">
                      Note: {item.resolutionNote}
                    </div>
                  )}
                </div>
                <Badge variant="green" size="sm">Resolved</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
