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
  ChevronRight
} from 'lucide-react';
import type { Matter, WorkspaceType } from '../../types/index.ts';

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
  const isSampleMatter = activeMatter?.isDemo || activeMatterId.includes('bates') || activeMatterId.includes('contract') || activeMatterId.includes('tenancy') || activeMatterId.includes('consumer');

  const isExploreActive = ['explore', 'chat', 'facts', 'timeline', 'graph', 'research', 'notebook', 'memory'].includes(currentTab);
  const isDraftActive = ['draft', 'contract'].includes(currentTab);

  const exploreSubItems: Array<{ id: WorkbenchTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }> = [
    { id: 'chat', label: 'Ask Copilot', icon: <FileSignature className="w-3.5 h-3.5 text-proofline-blue" /> },
    { id: 'facts', label: 'Fact Ledger', icon: <CheckSquare className="w-3.5 h-3.5" />, badge: counts.claims },
    { id: 'timeline', label: 'Chronology & Conflicts', icon: <CalendarClock className="w-3.5 h-3.5" />, badge: counts.conflicts > 0 ? `${counts.conflicts} conflict` : undefined, badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold' },
    { id: 'graph', label: 'Evidence Graph', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'research', label: 'Authorities & Law', icon: <BookOpen className="w-3.5 h-3.5" />, badge: counts.authorities },
    { id: 'notebook', label: 'Notebook Studio', icon: <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> },
    { id: 'memory', label: 'Matter History', icon: <Lock className="w-3.5 h-3.5 text-proofline-green" /> }
  ];

  const draftSubItems: Array<{ id: WorkbenchTab; label: string; icon: React.ReactNode }> = [
    { id: 'draft', label: 'Court Brief & Pleadings', icon: <FileSignature className="w-3.5 h-3.5 text-proofline-blue" /> },
    { id: 'contract', label: 'Contract Playbooks', icon: <FileText className="w-3.5 h-3.5 text-proofline-ochre" /> }
  ];

  return (
    <aside className="w-[248px] bg-canvas-subtle border-r border-border-hairline flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-106px)] font-sans">
      <div>
        {/* Workspace Partition Selector */}
        <div className="p-2 border-b border-border-hairline bg-slate-50">
          <div className="flex bg-slate-200/80 p-0.5 rounded-[5px] text-[11px] font-medium">
            <button
              type="button"
              onClick={() => onSelectWorkspace && onSelectWorkspace('personal')}
              className={`flex-1 py-1 text-center rounded-[4px] transition-all cursor-pointer ${
                activeWorkspace === 'personal'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-slate hover:text-ink'
              }`}
            >
              My Practice
            </button>
            <button
              type="button"
              onClick={() => onSelectWorkspace && onSelectWorkspace('demo')}
              className={`flex-1 py-1 text-center rounded-[4px] transition-all cursor-pointer ${
                activeWorkspace === 'demo'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-slate hover:text-ink'
              }`}
            >
              Demo Sandbox
            </button>
          </div>
        </div>

        {/* Matter Portfolio Switcher */}
        <div className="p-3 border-b border-border-hairline bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-ink-steel uppercase font-mono">
              {activeWorkspace === 'demo' ? 'Sandbox Cases' : 'Active Matter'}
            </span>
            <button
              onClick={onNewMatter}
              className="p-1 rounded-[3px] hover:bg-canvas-subtle text-ink-steel hover:text-ink transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Create New Matter"
              aria-label="New Matter"
            >
              <Plus className="w-3.5 h-3.5 text-proofline-blue" />
              <span className="text-proofline-blue font-medium">New</span>
            </button>
          </div>

          {matters.length === 0 ? (
            <div className="p-2.5 bg-stone-50 border border-dashed border-stone-300 rounded-[5px] text-center space-y-2">
              <div className="text-[11.5px] text-stone-700 font-medium">No Private Matters</div>
              <p className="text-[10.5px] text-stone-500 leading-tight">
                Your private workspace is completely clean.
              </p>
              <button
                type="button"
                onClick={onNewMatter}
                className="w-full py-1 px-2 bg-proofline-blue hover:bg-proofline-navy text-white text-[11px] font-medium rounded transition-colors"
              >
                + Create Matter
              </button>
            </div>
          ) : (
            <select
              value={activeMatterId}
              onChange={(e) => onSelectMatter(e.target.value)}
              className="w-full text-[12.5px] bg-white border border-border-hairline rounded-[4px] px-2 py-1.5 text-ink font-medium focus-visible:outline-none focus:border-proofline-blue cursor-pointer"
            >
              {matters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          )}

          {/* Persistent Truthful Sample Label or Air-Gap Badge */}
          {activeWorkspace === 'demo' ? (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                Demo Sandbox
              </span>
              <button
                onClick={() => onSelectWorkspace && onSelectWorkspace('personal')}
                className="text-proofline-blue hover:text-proofline-navy underline text-[10.5px] cursor-pointer"
              >
                My Practice
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10.5px] text-proofline-green font-mono pt-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Private Local Matter</span>
            </div>
          )}
        </div>

        {/* Streamlined 6-Job Navigation Hierarchy */}
        <nav className="p-2 space-y-1" aria-label="Workbench Sections">
          {/* 1. Matter Home */}
          <button
            onClick={() => onSelectTab('overview')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-white text-ink border border-border-hairline shadow-subtle'
                : 'text-ink-slate hover:text-ink hover:bg-slate-200/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentTab === 'overview' ? 'text-proofline-blue' : 'text-ink-steel'}`} />
              <span>Matter Home</span>
            </div>
          </button>

          {/* 2. Sources */}
          <button
            onClick={() => onSelectTab('sources')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
              currentTab === 'sources'
                ? 'bg-white text-ink border border-border-hairline shadow-subtle'
                : 'text-ink-slate hover:text-ink hover:bg-slate-200/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className={`w-4 h-4 ${currentTab === 'sources' ? 'text-proofline-blue' : 'text-ink-steel'}`} />
              <span>Sources</span>
            </div>
            {counts.docs > 0 && (
              <span className="text-[10.5px] px-1.5 py-0.2 rounded-[3px] font-mono bg-slate-200/70 text-ink-slate">
                {counts.docs}
              </span>
            )}
          </button>

          {/* 3. Explore & Copilot */}
          <div>
            <button
              onClick={() => onSelectTab('chat')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
                isExploreActive
                  ? 'bg-white text-ink border border-border-hairline shadow-subtle'
                  : 'text-ink-slate hover:text-ink hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className={`w-4 h-4 ${isExploreActive ? 'text-proofline-blue' : 'text-ink-steel'}`} />
                <span>Explore &amp; Copilot</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-ink-steel transition-transform ${isExploreActive ? 'rotate-90' : ''}`} />
            </button>

            {/* Indented Explore Sub-items */}
            {isExploreActive && (
              <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-proofline-blue/20 ml-3.5 mt-1">
                {exploreSubItems.map((sub) => {
                  const isSubActive = currentTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectTab(sub.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[3px] text-[11.5px] transition-colors cursor-pointer ${
                        isSubActive
                          ? 'bg-proofline-blue/10 text-proofline-blue font-semibold'
                          : 'text-ink-slate hover:text-ink hover:bg-slate-200/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSubActive ? 'text-proofline-blue' : 'text-ink-steel'}>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </div>
                      {sub.badge !== undefined && (
                        <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono ${sub.badgeColor || 'bg-slate-200/60 text-ink-slate'}`}>
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
                  ? 'bg-white text-ink border border-border-hairline shadow-subtle'
                  : 'text-ink-slate hover:text-ink hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSignature className={`w-4 h-4 ${isDraftActive ? 'text-proofline-blue' : 'text-ink-steel'}`} />
                <span>Drafting</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-ink-steel transition-transform ${isDraftActive ? 'rotate-90' : ''}`} />
            </button>

            {/* Indented Draft Sub-items */}
            {isDraftActive && (
              <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-proofline-blue/20 ml-3.5 mt-1">
                {draftSubItems.map((sub) => {
                  const isSubActive = currentTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectTab(sub.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[3px] text-[11.5px] transition-colors cursor-pointer ${
                        isSubActive
                          ? 'bg-proofline-blue/10 text-proofline-blue font-semibold'
                          : 'text-ink-slate hover:text-ink hover:bg-slate-200/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSubActive ? 'text-proofline-blue' : 'text-ink-steel'}>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Review Queue */}
          <button
            onClick={() => onSelectTab('review')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
              currentTab === 'review'
                ? 'bg-white text-ink border border-border-hairline shadow-subtle'
                : 'text-ink-slate hover:text-ink hover:bg-slate-200/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className={`w-4 h-4 ${currentTab === 'review' ? 'text-proofline-ochre' : 'text-ink-steel'}`} />
              <span>Review Queue</span>
            </div>
            {counts.reviewItems > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-[3px] font-mono bg-rose-100 text-rose-900 border border-rose-200 font-semibold">
                {counts.reviewItems}
              </span>
            )}
          </button>

          {/* 6. Settings & Runtime */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-white text-ink border border-border-hairline shadow-subtle'
                : 'text-ink-slate hover:text-ink hover:bg-slate-200/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'text-proofline-blue' : 'text-ink-steel'}`} />
              <span>Settings &amp; Runtime</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Footer Controls & Local Verification Invariant */}
      <div className="p-3 border-t border-border-hairline bg-white space-y-2">
        <button
          onClick={onLoadSample}
          className="w-full text-left text-[11px] text-ink-steel hover:text-ink hover:bg-canvas-subtle p-1.5 rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reload Bates v Post Office Horizon Litigation"
        >
          <RotateCcw className="w-3 h-3 text-ink-steel" />
          <span>Reload Sample Matter</span>
        </button>

        <div className="pt-2 border-t border-border-hairline/80 flex items-center gap-1.5 text-[10.5px] text-ink-steel font-mono">
          <ShieldCheck className="w-3 h-3 text-proofline-green shrink-0" />
          <span>Browser-Local Storage (IndexedDB)</span>
        </div>
      </div>
    </aside>
  );
};
