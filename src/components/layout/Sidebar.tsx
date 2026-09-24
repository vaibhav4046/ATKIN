import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  CalendarClock, 
  Network, 
  BookOpen, 
  FileSignature, 
  AlertCircle, 
  Settings, 
  Plus, 
  RotateCcw,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import type { Matter } from '../../types/index.ts';

export type WorkbenchTab = 
  | 'overview' 
  | 'chat'
  | 'sources' 
  | 'facts' 
  | 'timeline' 
  | 'contract'
  | 'graph' 
  | 'research' 
  | 'draft' 
  | 'review' 
  | 'memory'
  | 'settings';

interface SidebarProps {
  currentTab: WorkbenchTab;
  onSelectTab: (tab: WorkbenchTab) => void;
  counts: {
    docs: number;
    claims: number;
    conflicts: number;
    reviewItems: number;
    authorities: number;
  };
  onLoadSample: () => void;
  onNewMatter: () => void;
  matters: Matter[];
  activeMatterId: string;
  onSelectMatter: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  counts,
  onLoadSample,
  onNewMatter,
  matters,
  activeMatterId,
  onSelectMatter
}) => {
  const navItems: Array<{ id: WorkbenchTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }> = [
    { id: 'overview', label: 'Matter Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'Evidential Copilot', icon: <FileSignature className="w-4 h-4 text-proofline-blue" /> },
    { id: 'sources', label: 'Primary Evidence', icon: <FileText className="w-4 h-4" />, badge: counts.docs },
    { id: 'facts', label: 'Fact & Claim Ledger', icon: <CheckSquare className="w-4 h-4" />, badge: counts.claims },
    { id: 'timeline', label: 'Chronology & Adverse', icon: <CalendarClock className="w-4 h-4" />, badge: counts.conflicts > 0 ? `${counts.conflicts} conflict` : undefined, badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300' },
    { id: 'contract', label: 'Contract & Playbooks', icon: <FileText className="w-4 h-4 text-proofline-ochre" /> },
    { id: 'graph', label: 'Impact Simulator', icon: <Network className="w-4 h-4" /> },
    { id: 'research', label: 'Statutes & Authorities', icon: <BookOpen className="w-4 h-4" />, badge: counts.authorities },
    { id: 'draft', label: 'Drafting & Section 9', icon: <FileSignature className="w-4 h-4" /> },
    { id: 'review', label: 'Review Queue', icon: <AlertCircle className="w-4 h-4" />, badge: counts.reviewItems > 0 ? counts.reviewItems : undefined, badgeColor: 'bg-rose-100 text-rose-900 border border-rose-300 font-semibold' },
    { id: 'memory', label: 'Cryptographic Memory', icon: <ShieldCheck className="w-4 h-4 text-proofline-green" /> },
    { id: 'settings', label: 'Model Runtime', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-[240px] bg-canvas-subtle border-r border-border-hairline flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-106px)]">
      <div>
        {/* Matter Portfolio Switcher */}
        <div className="p-3 border-b border-border-hairline bg-white">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold tracking-wider text-ink-steel uppercase">
              Active Matter File
            </span>
            <button
              onClick={onNewMatter}
              className="p-1 rounded-[3px] hover:bg-canvas-subtle text-ink-steel hover:text-ink transition-colors"
              title="Create New Matter File"
              aria-label="New Matter"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            value={activeMatterId}
            onChange={(e) => onSelectMatter(e.target.value)}
            className="w-full text-[12.5px] bg-white border border-border-hairline rounded-[4px] px-2 py-1.5 text-ink font-medium focus-visible:outline-none focus:border-proofline-blue"
          >
            {matters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Workbench Section Tabs */}
        <nav className="p-2 space-y-0.5" aria-label="Workbench Sections">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-[12.5px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-ink border border-border-hairline shadow-subtle'
                    : 'text-ink-slate hover:text-ink hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isActive ? 'text-proofline-blue' : 'text-ink-steel'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[10.5px] px-1.5 py-0.2 rounded-[3px] font-mono ${item.badgeColor || 'bg-slate-200/70 text-ink-slate'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & Local Verification Invariant */}
      <div className="p-3 border-t border-border-hairline bg-white space-y-2">
        <button
          onClick={onLoadSample}
          className="w-full text-left text-[11px] text-ink-steel hover:text-ink hover:bg-canvas-subtle p-1.5 rounded-[4px] flex items-center gap-1.5 transition-colors"
          title="Reload Bates v Post Office Horizon Litigation"
        >
          <RotateCcw className="w-3 h-3 text-ink-steel" />
          <span>Reload Landmark Litigation</span>
        </button>

        <div className="pt-2 border-t border-border-hairline/80 flex items-center gap-1.5 text-[10.5px] text-ink-steel font-mono">
          <ShieldCheck className="w-3 h-3 text-proofline-green shrink-0" />
          <span>IndexedDB · Zero Egress</span>
        </div>
      </div>
    </aside>
  );
};
