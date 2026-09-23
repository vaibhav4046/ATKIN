import React, { useState, useEffect } from 'react';
import { GlobalNav } from './components/layout/GlobalNav.tsx';
import { TopRail } from './components/layout/TopRail.tsx';
import { Sidebar, type WorkbenchTab } from './components/layout/Sidebar.tsx';
import { SourceInspector } from './components/common/SourceInspector.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';

import { OverviewTab } from './components/workbench/OverviewTab.tsx';
import { SourcesTab } from './components/workbench/SourcesTab.tsx';
import { FactsTab } from './components/workbench/FactsTab.tsx';
import { TimelineTab } from './components/workbench/TimelineTab.tsx';
import { GraphTab } from './components/workbench/GraphTab.tsx';
import { ResearchTab } from './components/workbench/ResearchTab.tsx';
import { DraftTab } from './components/workbench/DraftTab.tsx';
import { ReviewTab } from './components/workbench/ReviewTab.tsx';
import { SettingsTab } from './components/workbench/SettingsTab.tsx';

import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  Authority, 
  Draft, 
  ReviewItem, 
  ModelStatus,
  DraftType
} from './types/index.ts';

import { 
  SAMPLE_MATTER, 
  SAMPLE_DOCUMENTS, 
  SAMPLE_SPANS, 
  SAMPLE_CLAIMS, 
  SAMPLE_REVIEW_ITEMS, 
  SAMPLE_DRAFT 
} from './db/fixtures/consumerLaptop.ts';
import { CRA_2015_AUTHORITIES } from './db/fixtures/authorities.ts';
import { checkOllamaConnection, requestGemmaDraftBlock } from './engine/modelBridge.ts';
import { generateDeterministicDraft, exportDraftAsMarkdown } from './engine/draftingEngine.ts';
import { detectContradictions } from './engine/contradictionEngine.ts';

export function App() {
  const [activeView, setActiveView] = useState<'landing' | 'workbench'>('landing');
  const [currentTab, setCurrentTab] = useState<WorkbenchTab>('overview');

  // Matter state
  const [matters, setMatters] = useState<Matter[]>([SAMPLE_MATTER]);
  const [activeMatterId, setActiveMatterId] = useState<string>(SAMPLE_MATTER.id);

  // Evidential state
  const [documents, setDocuments] = useState<Document[]>(SAMPLE_DOCUMENTS);
  const [spans, setSpans] = useState<Span[]>(SAMPLE_SPANS);
  const [claims, setClaims] = useState<Claim[]>(SAMPLE_CLAIMS);
  const [authorities, setAuthorities] = useState<Authority[]>(CRA_2015_AUTHORITIES);
  const [draft, setDraft] = useState<Draft>(SAMPLE_DRAFT);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(SAMPLE_REVIEW_ITEMS);

  // Inspector and modal state
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  const [isNewMatterOpen, setIsNewMatterOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');

  // Local model state
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    state: 'offline',
    endpoint: '/api/local-model',
    modelTag: 'None (Offline)',
    detectedTags: []
  });

  const activeMatter = matters.find(m => m.id === activeMatterId) || matters[0];

  // Check Ollama on startup
  useEffect(() => {
    checkOllamaConnection().then(setModelStatus);
  }, []);

  const handleRefreshModel = async () => {
    const status = await checkOllamaConnection();
    setModelStatus(status);
  };

  const handleLoadSampleMatter = () => {
    setMatters([SAMPLE_MATTER]);
    setActiveMatterId(SAMPLE_MATTER.id);
    setDocuments(SAMPLE_DOCUMENTS);
    setSpans(SAMPLE_SPANS);
    setClaims(SAMPLE_CLAIMS);
    setAuthorities(CRA_2015_AUTHORITIES);
    setDraft(SAMPLE_DRAFT);
    setReviewItems(SAMPLE_REVIEW_ITEMS);
    setSelectedSpan(SAMPLE_SPANS[0]);
    setActiveView('workbench');
    setCurrentTab('overview');
  };

  const handleCreateNewMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newM: Matter = {
      id: `matter-${Date.now()}`,
      title: newTitle.trim(),
      jurisdiction: 'England and Wales',
      clientAlias: newClient.trim() || 'Anonymous Client',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };

    setMatters(prev => [newM, ...prev]);
    setActiveMatterId(newM.id);
    setDocuments([]);
    setSpans([]);
    setClaims([]);
    setReviewItems([]);
    setDraft(generateDeterministicDraft(newM, [], [], [], 'matter_brief'));
    setIsNewMatterOpen(false);
    setNewTitle('');
    setNewClient('');
    setActiveView('workbench');
    setCurrentTab('sources');
  };

  const handleAddDocument = (newDoc: Document) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleUpdateClaimNotes = (claimId: string, notes: string) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, editorNotes: notes } : c));
  };

  const handleRegenerateDraft = async (type: DraftType, useModel: boolean) => {
    if (useModel && modelStatus.state === 'connected') {
      const proposal = await requestGemmaDraftBlock(
        `Draft a ${type.replace('_', ' ')} based on the evidence.`,
        spans.slice(0, 5),
        modelStatus.modelTag
      );

      setDraft(prev => ({
        ...prev,
        type,
        generatedBy: `local_gemma (${modelStatus.modelTag})`,
        blocks: [
          {
            id: `blk-gemma-${Date.now()}`,
            heading: 'Synthesis by Local Gemma 4',
            text: proposal.proposedText,
            claimIds: claims.map(c => c.id),
            spanIds: spans.slice(0, 4).map(s => s.id),
            reviewStatus: 'needs_review',
            reviewReason: 'Generated by local model; requires solicitor verification.'
          },
          ...prev.blocks.slice(1)
        ],
        updatedAt: new Date().toISOString()
      }));
    } else {
      const newD = generateDeterministicDraft(activeMatter, documents, spans, claims, type);
      setDraft(newD);
    }
  };

  const handleUpdateDraftBlock = (blockId: string, newText: string) => {
    setDraft(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, text: newText } : b),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleApproveBlock = (blockId: string) => {
    setDraft(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, reviewStatus: 'verified', reviewReason: undefined } : b),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleResolveReviewItem = (id: string, note?: string) => {
    setReviewItems(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved', resolutionNote: note } : r));
  };

  const handleDismissReviewItem = (id: string) => {
    setReviewItems(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
  };

  const handleExportMarkdown = () => {
    const spansById = new Map(spans.map(s => [s.id, s]));
    const docsById = new Map(documents.map(d => [d.id, d]));
    const md = exportDraftAsMarkdown(draft, activeMatter, spansById, docsById);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeMatter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-draft.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedDocument = selectedSpan ? documents.find(d => d.id === selectedSpan.documentId) || null : null;
  const contestedCount = claims.filter(c => c.status === 'contested').length;
  const pendingReviewCount = reviewItems.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gallery-mist flex flex-col font-sans text-ink">
      {/* 44px Quiet Global Navigation */}
      <GlobalNav
        activeView={activeView}
        onOpenWorkbench={() => setActiveView('workbench')}
        onLoadSample={handleLoadSampleMatter}
        onNavigateHome={() => setActiveView('landing')}
      />

      {activeView === 'landing' ? (
        <LandingPage
          onOpenWorkbench={() => setActiveView('workbench')}
          onLoadSample={handleLoadSampleMatter}
        />
      ) : (
        <div className="flex-1 flex flex-col pt-[44px]">
          {/* 64px Top Rail */}
          <TopRail
            matter={activeMatter}
            modelStatus={modelStatus}
            onExport={handleExportMarkdown}
            onOpenSettings={() => setCurrentTab('settings')}
          />

          {/* Workbench Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* 248px Left Sidebar */}
            <Sidebar
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              counts={{
                docs: documents.length,
                claims: claims.length,
                conflicts: contestedCount,
                reviewItems: pendingReviewCount,
                authorities: authorities.length
              }}
              onLoadSample={handleLoadSampleMatter}
              onNewMatter={() => setIsNewMatterOpen(true)}
              matters={matters}
              activeMatterId={activeMatterId}
              onSelectMatter={setActiveMatterId}
            />

            {/* Central Evidence Canvas */}
            <main className="flex-1 overflow-y-auto p-6 transition-all">
              {currentTab === 'overview' && (
                <OverviewTab
                  matter={activeMatter}
                  documents={documents}
                  claims={claims}
                  reviewItems={reviewItems}
                  authorities={authorities}
                  onNavigateTab={setCurrentTab}
                />
              )}

              {currentTab === 'sources' && (
                <SourcesTab
                  documents={documents}
                  spans={spans}
                  selectedSpan={selectedSpan}
                  onSelectSpan={setSelectedSpan}
                  onAddDocument={handleAddDocument}
                />
              )}

              {currentTab === 'facts' && (
                <FactsTab
                  claims={claims}
                  spans={spans}
                  documents={documents}
                  onSelectSpan={setSelectedSpan}
                  onUpdateClaimNotes={handleUpdateClaimNotes}
                />
              )}

              {currentTab === 'timeline' && (
                <TimelineTab
                  claims={claims}
                  spans={spans}
                  documents={documents}
                  onSelectSpan={setSelectedSpan}
                />
              )}

              {currentTab === 'graph' && (
                <GraphTab
                  documents={documents}
                  claims={claims}
                  spans={spans}
                  authorities={authorities}
                  onSelectSpan={setSelectedSpan}
                />
              )}

              {currentTab === 'research' && (
                <ResearchTab authorities={authorities} />
              )}

              {currentTab === 'draft' && (
                <DraftTab
                  draft={draft}
                  matter={activeMatter}
                  documents={documents}
                  spans={spans}
                  modelStatus={modelStatus}
                  onSelectSpan={setSelectedSpan}
                  onRegenerateDraft={handleRegenerateDraft}
                  onUpdateDraftBlock={handleUpdateDraftBlock}
                  onApproveBlock={handleApproveBlock}
                />
              )}

              {currentTab === 'review' && (
                <ReviewTab
                  reviewItems={reviewItems}
                  onResolveItem={handleResolveReviewItem}
                  onDismissItem={handleDismissReviewItem}
                  onNavigateTab={setCurrentTab}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsTab
                  modelStatus={modelStatus}
                  onRefreshModel={handleRefreshModel}
                />
              )}
            </main>

            {/* Right 300px Source Inspector Panel */}
            <SourceInspector
              span={selectedSpan}
              document={selectedDocument}
              onClose={() => setSelectedSpan(null)}
            />
          </div>
        </div>
      )}

      {/* New Matter Modal */}
      {isNewMatterOpen && (
        <div className="fixed inset-0 bg-ink/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-gallery-white border border-border-hairline rounded-card p-6 w-full max-w-[460px] shadow-stage space-y-4">
            <h3 className="text-lg font-semibold text-ink">
              Create New Civil Matter
            </h3>
            <form onSubmit={handleCreateNewMatter} className="space-y-3.5">
              <div>
                <label className="text-[12px] font-medium text-ink block mb-1">
                  Matter Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Smith v NorthStar Electronics Ltd"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-lg px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-ink block mb-1">
                  Client Alias / Representative
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Smith"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-lg px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                />
              </div>

              <div className="text-[11px] text-ink-steel">
                Default Jurisdiction: <strong>England and Wales</strong>. Files remain 100% on this computer.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMatterOpen(false)}
                  className="text-[12px] px-3.5 py-1.5 text-ink-slate hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-[12px] px-4 py-1.5 bg-proofline-blue hover:bg-proofline-navy text-white rounded-full-pill font-medium shadow-xs"
                >
                  Create Matter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
