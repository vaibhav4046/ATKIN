import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Compass,
  FileSignature, 
  AlertCircle, 
  Settings, 
  Plus, 
  RotateCcw,
  ShieldCheck,
  CheckSquare,
  CalendarClock,
  Network,
  BookOpen,
  Lock,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import type { Matter, WorkspaceType } from '../../types/index';
import { AtkinLogo } from '../common/AtkinLogo';
import { BRAND, TERMINOLOGY } from '../../content/brand';

export type WorkbenchTab = 
  | 'overview' 
  | 'explore' 
  | 'chat' 
  | 'notebook' 
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
  activeWorkspace?: WorkspaceType;
  onSelectWorkspace?: (ws: WorkspaceType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  counts,
  onLoadSample,
  onNewMatter,
  matters,
  activeMatterId,
  onSelectMatter,
  activeWorkspace = 'personal',
  onSelectWorkspace
}) => {
  const activeMatter = matters.find(m => m.id === activeMatterId);
  const isDemo = activeMatter?.isDemo || activeWorkspace === 'demo' || activeMatterId.includes('bates') || activeMatterId.includes('contract');

  const isExploreActive = ['explore', 'chat', 'facts', 'timeline', 'graph', 'research', 'notebook', 'memory'].includes(currentTab);
  const isDraftActive = ['draft', 'contract'].includes(currentTab);

  const exploreSubItems: Array<{ id: WorkbenchTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }> = [
    { id: 'chat', label: TERMINOLOGY.ask, icon: <MessageSquare className="w-3.5 h-3.5 text-atkin-ink" /> },
    { id: 'facts', label: 'Fact Ledger', icon: <CheckSquare className="w-3.5 h-3.5" />, badge: counts.claims },
    { id: 'timeline', label: 'Timeline & Conflicts', icon: <CalendarClock className="w-3.5 h-3.5" />, badge: counts.conflicts > 0 ? `${counts.conflicts} conflict` : undefined, badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold' },
    { id: 'graph', label: 'Evidence Graph', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'research', label: TERMINOLOGY.research, icon: <BookOpen className="w-3.5 h-3.5" />, badge: counts.authorities },
    { id: 'notebook', label: 'Notebook Studio', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'memory', label: 'Matter Memory', icon: <Lock className="w-3.5 h-3.5" /> }
  ];

  const draftSubItems: Array<{ id: WorkbenchTab; label: string; icon: React.ReactNode }> = [
    { id: 'draft', label: 'Court Briefs & Pleadings', icon: <FileSignature className="w-3.5 h-3.5 text-atkin-ink" /> },
    { id: 'contract', label: 'Contract Playbooks', icon: <FileText className="w-3.5 h-3.5 text-atkin-ink" /> }
  ];

  return (
    <aside className="w-[248px] bg-atkin-bg-subtle border-r border-atkin-border flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-106px)] font-sans text-atkin-ink">
      <div>
        {/* Practice Brand Badge */}
        <div className="px-3.5 py-2.5 bg-atkin-surface border-b border-atkin-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AtkinLogo className="w-6 h-6 rounded-[4px] border border-atkin-border" />
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-atkin-ink leading-tight font-serif">{BRAND.name} Practice</span>
              <span className="text-[9.5px] font-mono text-atkin-muted">Local Workspace</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-atkin-muted px-1.5 py-0.5 bg-atkin-bg rounded border border-atkin-border">v1.2.0</span>
        </div>

        {/* Workspace Partition Selector */}
        <div className="p-2 border-b border-atkin-border bg-atkin-bg">
          <div className="flex bg-atkin-surface p-0.5 rounded-[5px] text-[11px] font-medium border border-atkin-border">
            <button
              type="button"
              onClick={() => onSelectWorkspace && onSelectWorkspace('personal')}
              className={`flex-1 py-1 text-center rounded-[3px] transition-all cursor-pointer ${
                activeWorkspace === 'personal'
                  ? 'bg-atkin-ink text-atkin-bg shadow-xs font-semibold'
                  : 'text-atkin-muted hover:text-atkin-ink'
              }`}
            >
              My Practice
            </button>
            <button
              type="button"
              onClick={() => onSelectWorkspace && onSelectWorkspace('demo')}
              className={`flex-1 py-1 text-center rounded-[3px] transition-all cursor-pointer ${
                activeWorkspace === 'demo'
                  ? 'bg-atkin-ink text-atkin-bg shadow-xs font-semibold'
                  : 'text-atkin-muted hover:text-atkin-ink'
              }`}
            >
              Demo Sandbox
            </button>
          </div>
        </div>

        {/* Matter Portfolio Switcher */}
        <div className="p-3 border-b border-atkin-border bg-atkin-surface space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-atkin-muted uppercase font-mono">
              {activeWorkspace === 'demo' ? 'Sandbox Matters' : 'Active Matter'}
            </span>
            <button
              onClick={onNewMatter}
              className="p-1 rounded-[3px] hover:bg-atkin-bg text-atkin-muted hover:text-atkin-ink transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Create New Matter"
              aria-label="New Matter"
            >
              <Plus className="w-3.5 h-3.5 text-atkin-ink" />
              <span className="font-medium text-atkin-ink">New</span>
            </button>
          </div>

          {matters.length === 0 ? (
            <div className="p-2.5 bg-atkin-bg border border-dashed border-atkin-border rounded-[5px] text-center space-y-2">
              <div className="text-[11.5px] text-atkin-ink font-medium">No Private Matters</div>
              <p className="text-[10.5px] text-atkin-muted leading-tight">
                Your private practice workspace is clean.
              </p>
              <button
                type="button"
                onClick={onNewMatter}
                className="w-full py-1 px-2 bg-atkin-ink text-atkin-bg text-[11px] font-medium rounded transition-opacity hover:opacity-90"
              >
                + Create Matter
              </button>
            </div>
          ) : (
            <select
              value={activeMatterId}
              onChange={(e) => onSelectMatter(e.target.value)}
              className="w-full text-[12.5px] bg-atkin-bg border border-atkin-border rounded-[4px] px-2 py-1.5 text-atkin-ink font-medium focus-visible:outline-none focus:border-atkin-ink cursor-pointer"
            >
              {matters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          )}

          {/* Matter Partition Label */}
          {activeWorkspace === 'demo' ? (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                Demo Matter
              </span>
              <button
                onClick={() => onSelectWorkspace && onSelectWorkspace('personal')}
                className="text-atkin-ink hover:underline text-[10.5px] cursor-pointer"
              >
                Switch to My Practice
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10.5px] text-atkin-muted font-mono pt-1">
              <ShieldCheck className="w-3 h-3 text-atkin-ink" />
              <span>Private Local Matter</span>
            </div>
          )}
        </div>

        {/* Navigation Hierarchy */}
        <nav className="p-2 space-y-1" aria-label="Workbench Sections">
          {/* 1. Home / Overview */}
          <button
            onClick={() => onSelectTab('overview')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-atkin-surface text-atkin-ink border border-atkin-border shadow-xs'
                : 'text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-atkin-ink" />
              <span>Home</span>
            </div>
          </button>

          {/* 2. Sources */}
          <button
            onClick={() => onSelectTab('sources')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
              currentTab === 'sources'
                ? 'bg-atkin-surface text-atkin-ink border border-atkin-border shadow-xs'
                : 'text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-atkin-ink" />
              <span>{TERMINOLOGY.source}s</span>
            </div>
            {counts.docs > 0 && (
              <span className="text-[10.5px] px-1.5 py-0.2 rounded-[3px] font-mono bg-atkin-bg text-atkin-muted border border-atkin-border">
                {counts.docs}
              </span>
            )}
          </button>

          {/* 3. Explore & Reasoning Tools */}
          <div>
            <button
              onClick={() => onSelectTab('chat')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
                isExploreActive
                  ? 'bg-atkin-surface text-atkin-ink border border-atkin-border shadow-xs'
                  : 'text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-atkin-ink" />
                <span>Matter Intelligence</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-atkin-muted transition-transform ${isExploreActive ? 'rotate-90' : ''}`} />
            </button>

            {/* Indented Explore Sub-items */}
            {isExploreActive && (
              <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-atkin-border ml-3.5 mt-1">
                {exploreSubItems.map((sub) => {
                  const isSubActive = currentTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectTab(sub.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[3px] text-[11.5px] transition-colors cursor-pointer ${
                        isSubActive
                          ? 'bg-atkin-ink text-atkin-bg font-semibold'
                          : 'text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSubActive ? 'text-atkin-bg' : 'text-atkin-ink'}>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </div>
                      {sub.badge !== undefined && (
                        <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono ${sub.badgeColor || (isSubActive ? 'bg-atkin-bg/20 text-atkin-bg' : 'bg-atkin-bg text-atkin-muted border border-atkin-border')}`}>
                          {sub.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Drafting */}
          <div>
            <button
              onClick={() => onSelectTab('draft')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
                isDraftActive
                  ? 'bg-atkin-surface text-atkin-ink border border-atkin-border shadow-xs'
                  : 'text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSignature className="w-4 h-4 text-atkin-ink" />
                <span>{TERMINOLOGY.draft}ing</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-atkin-muted transition-transform ${isDraftActive ? 'rotate-90' : ''}`} />
            </button>

            {/* Indented Draft Sub-items */}
            {isDraftActive && (
              <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-atkin-border ml-3.5 mt-1">
                {draftSubItems.map((sub) => {
                  const isSubActive = currentTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectTab(sub.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[3px] text-[11.5px] transition-colors cursor-pointer ${
                        isSubActive
                          ? 'bg-atkin-ink text-atkin-bg font-semibold'
                          : 'text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSubActive ? 'text-atkin-bg' : 'text-atkin-ink'}>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Needs Review Queue */}
          <button
            onClick={() => onSelectTab('review')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
              currentTab === 'review'
                ? 'bg-atkin-surface text-atkin-ink border border-atkin-border shadow-xs'
                : 'text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-atkin-ink" />
              <span>{TERMINOLOGY.needsReview}</span>
            </div>
            {counts.reviewItems > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-[3px] font-mono bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-semibold">
                {counts.reviewItems}
              </span>
            )}
          </button>

          {/* 6. Settings & Connectors */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-atkin-surface text-atkin-ink border border-atkin-border shadow-xs'
                : 'text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-atkin-ink" />
              <span>Settings &amp; {TERMINOLOGY.connector}s</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Footer Controls & Local Verification Invariant */}
      <div className="p-3 border-t border-atkin-border bg-atkin-surface space-y-2">
        <button
          onClick={onLoadSample}
          className="w-full text-left text-[11px] text-atkin-muted hover:text-atkin-ink hover:bg-atkin-bg p-1.5 rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-atkin-border"
          title="Reload Demo Matter"
        >
          <RotateCcw className="w-3 h-3 text-atkin-muted" />
          <span>Reload Demo Matter</span>
        </button>

        <div className="pt-2 border-t border-atkin-border/80 flex items-center gap-1.5 text-[10.5px] text-atkin-muted font-mono">
          <ShieldCheck className="w-3 h-3 text-atkin-ink shrink-0" />
          <span>On-device storage</span>
        </div>
      </div>
    </aside>
  );
};
