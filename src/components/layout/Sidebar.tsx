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
  ShieldCheck
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
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'Sovereign Copilot', icon: <FileSignature className="w-4 h-4 text-proofline-blue" /> },
    { id: 'sources', label: 'Sources', icon: <FileText className="w-4 h-4" />, badge: counts.docs },
    { id: 'facts', label: 'Fact Ledger', icon: <CheckSquare className="w-4 h-4" />, badge: counts.claims },
    { id: 'timeline', label: 'Timeline & Conflicts', icon: <CalendarClock className="w-4 h-4" />, badge: counts.conflicts > 0 ? `${counts.conflicts} conflict` : undefined, badgeColor: 'bg-proofline-ochre/15 text-proofline-ochre' },
    { id: 'contract', label: 'Contract & Playbook', icon: <FileText className="w-4 h-4 text-proofline-ochre" /> },
    { id: 'graph', label: 'Evidence Graph', icon: <Network className="w-4 h-4" /> },
    { id: 'research', label: 'Research & Law', icon: <BookOpen className="w-4 h-4" />, badge: counts.authorities },
    { id: 'draft', label: 'Drafting Studio', icon: <FileSignature className="w-4 h-4" /> },
    { id: 'review', label: 'Review Queue', icon: <AlertCircle className="w-4 h-4" />, badge: counts.reviewItems > 0 ? counts.reviewItems : undefined, badgeColor: 'bg-proofline-ochre text-white font-semibold' },
    { id: 'memory', label: 'Scoped Memory', icon: <ShieldCheck className="w-4 h-4 text-proofline-green" /> },
    { id: 'settings', label: 'Model & Diagnostics', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-[248px] bg-gallery-paper border-r border-border-hairline flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-108px)]">
      <div>
        {/* Matter Switcher Header */}
        <div className="p-3.5 border-b border-border-hairline">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold tracking-wider text-ink-steel uppercase">
              Matter Portfolio
            </span>
            <button
              onClick={onNewMatter}
              className="p-1 rounded hover:bg-gallery-mist text-ink-slate hover:text-ink transition-colors"
              title="Create New Blank Matter"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            value={activeMatterId}
            onChange={(e) => onSelectMatter(e.target.value)}
            className="w-full text-[13px] bg-gallery-white border border-border-hairline rounded-lg px-2.5 py-1.5 text-ink font-medium focus:border-proofline-blue focus:outline-none"
          >
            {matters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-2 space-y-0.5" aria-label="Workbench Sections">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-gallery-white text-ink shadow-subtle'
                    : 'text-ink-slate hover:text-ink hover:bg-gallery-mist/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-proofline-blue' : 'text-ink-steel'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full-pill ${item.badgeColor || 'bg-gallery-mist text-ink-steel'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions & Data Sovereignty Badge */}
      <div className="p-3 border-t border-border-hairline bg-gallery-mist/40 space-y-2.5">
        <button
          onClick={onLoadSample}
          className="w-full flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-slate hover:text-ink bg-gallery-white border border-border-hairline hover:bg-gallery-mist py-1.5 rounded-lg transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Matter</span>
        </button>

        <div className="flex items-start gap-1.5 text-[11px] text-ink-steel leading-tight">
          <ShieldCheck className="w-3.5 h-3.5 text-proofline-green shrink-0 mt-0.5" />
          <span>Local IndexedDB · 100% client storage · Zero cloud telemetry</span>
        </div>
      </div>
    </aside>
  );
};
