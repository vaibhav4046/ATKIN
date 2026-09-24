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
import { ChatTab } from './components/workbench/ChatTab.tsx';
import { MemoryTab } from './components/workbench/MemoryTab.tsx';
import { ContractTab } from './components/workbench/ContractTab.tsx';

import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  Authority, 
  Draft, 
  ReviewItem, 
  ModelStatus,
  NetworkMode
} from './types/index.ts';

import { 
  BATES_MATTER, 
  BATES_DOCUMENTS, 
  BATES_SPANS, 
  BATES_CLAIMS, 
  BATES_REVIEWS, 
  BATES_DRAFT,
  BATES_AUTHORITIES
} from './db/fixtures/batesPostOfficeMatter.ts';
import { 
  SAMPLE_MATTER, 
  SAMPLE_DOCUMENTS, 
  SAMPLE_SPANS, 
  SAMPLE_CLAIMS, 
  SAMPLE_REVIEW_ITEMS, 
  SAMPLE_DRAFT 
} from './db/fixtures/consumerLaptop.ts';
import { 
  CONTRACT_MATTER, 
  CONTRACT_DOCUMENTS, 
  CONTRACT_SPANS, 
  CONTRACT_CLAIMS, 
  CONTRACT_REVIEWS, 
  CONTRACT_DRAFT 
} from './db/fixtures/contractMatter.ts';
import { 
  TENANCY_MATTER, 
  TENANCY_DOCUMENTS, 
  TENANCY_SPANS, 
  TENANCY_CLAIMS, 
  TENANCY_REVIEWS, 
  TENANCY_DRAFT 
} from './db/fixtures/tenancyMatter.ts';
import { 
  CRA_2015_AUTHORITIES, 
  COMMERCIAL_CONTRACT_AUTHORITIES, 
  TENANCY_HOUSING_AUTHORITIES 
} from './db/fixtures/authorities.ts';
import { checkOllamaConnection } from './engine/modelBridge.ts';
import { generateDeterministicDraft, exportDraftAsMarkdown } from './engine/draftingEngine.ts';
import { detectContradictions } from './engine/contradictionEngine.ts';
import { MemoryEngine } from './engine/memory/memoryEngine.ts';
import { NetworkBroker } from './engine/network/networkBroker.ts';
import { LocalModelManager } from './engine/model/localModelManager.ts';
import { vaultService } from './engine/vault/vaultService.ts';
import { DocxExporter } from './engine/export/docxExporter.ts';
import { BundleExchange } from './engine/collaboration/bundleExchange.ts';
import { NotebookExporter } from './engine/export/notebookExporter.ts';
import { IcsHandler, type CalendarEvent } from './engine/calendar/icsHandler.ts';
import { type IngestionAnalysisResult } from './engine/ingestion/matterAnalyzer.ts';

// Singletons for sovereign runtime
const memoryEngine = new MemoryEngine();
const networkBroker = new NetworkBroker('offline');
const modelManager = new LocalModelManager();

export function App() {
  const [activeView, setActiveView] = useState<'landing' | 'workbench'>('landing');
  const [currentTab, setCurrentTab] = useState<WorkbenchTab>('overview');

  // Multi-matter portfolio with real landmark litigation as primary
  const [matters, setMatters] = useState<Matter[]>([
    BATES_MATTER,
    CONTRACT_MATTER,
    TENANCY_MATTER,
    SAMPLE_MATTER
  ]);
  const [activeMatterId, setActiveMatterId] = useState<string>(BATES_MATTER.id);

  // Evidential state
  const [documents, setDocuments] = useState<Document[]>(BATES_DOCUMENTS);
  const [spans, setSpans] = useState<Span[]>(BATES_SPANS);
  const [claims, setClaims] = useState<Claim[]>(BATES_CLAIMS);
  const [authorities, setAuthorities] = useState<Authority[]>(BATES_AUTHORITIES);
  const [draft, setDraft] = useState<Draft>(BATES_DRAFT);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(BATES_REVIEWS);

  // Sovereign Broker & Vault state
  const [networkMode, setNetworkMode] = useState<NetworkMode>('offline');
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

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

  useEffect(() => {
    checkOllamaConnection().then(setModelStatus);
  }, []);

  const handleRefreshModel = async () => {
    const status = await checkOllamaConnection();
    setModelStatus(status);
  };

  const handleSelectMatter = (matterId: string) => {
    setActiveMatterId(matterId);

    if (matterId === BATES_MATTER.id) {
      setDocuments(BATES_DOCUMENTS);
      setSpans(BATES_SPANS);
      setClaims(BATES_CLAIMS);
      setAuthorities(BATES_AUTHORITIES);
      setReviewItems(BATES_REVIEWS);
      setDraft(BATES_DRAFT);
      setSelectedSpan(BATES_SPANS[0]);
    } else if (matterId === CONTRACT_MATTER.id) {
      setDocuments(CONTRACT_DOCUMENTS);
      setSpans(CONTRACT_SPANS);
      setClaims(CONTRACT_CLAIMS);
      setAuthorities(COMMERCIAL_CONTRACT_AUTHORITIES);
      setReviewItems(CONTRACT_REVIEWS);
      setDraft(CONTRACT_DRAFT);
      setSelectedSpan(CONTRACT_SPANS[0]);
    } else if (matterId === TENANCY_MATTER.id) {
      setDocuments(TENANCY_DOCUMENTS);
      setSpans(TENANCY_SPANS);
      setClaims(TENANCY_CLAIMS);
      setAuthorities(TENANCY_HOUSING_AUTHORITIES);
      setReviewItems(TENANCY_REVIEWS);
      setDraft(TENANCY_DRAFT);
      setSelectedSpan(TENANCY_SPANS[0]);
    } else {
      setDocuments(SAMPLE_DOCUMENTS);
      setSpans(SAMPLE_SPANS);
      setClaims(SAMPLE_CLAIMS);
      setAuthorities(CRA_2015_AUTHORITIES);
      setReviewItems(SAMPLE_REVIEW_ITEMS);
      setDraft(SAMPLE_DRAFT);
      setSelectedSpan(SAMPLE_SPANS[0]);
    }
  };

  const handleLoadSampleMatter = () => {
    handleSelectMatter(BATES_MATTER.id);
    setActiveView('workbench');
    setCurrentTab('overview');
  };

  const handleIngestAnalysis = (result: IngestionAnalysisResult) => {
    setDocuments(prev => [result.document, ...prev]);
    setSpans(prev => [...prev, ...result.spans]);
    setClaims(prev => [...prev, ...result.claims]);
    setReviewItems(prev => [...result.reviewItems, ...prev]);
    if (result.draftBlocks.length > 0) {
      setDraft(prev => ({
        ...prev,
        blocks: [...prev.blocks, ...result.draftBlocks],
        updatedAt: new Date().toISOString()
      }));
    }
    if (result.spans.length > 0) {
      setSelectedSpan(result.spans[0]);
    }
  };

  const handleCreateNewMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMatter: Matter = {
      id: `matter-${Date.now()}`,
      title: newTitle.trim(),
      jurisdiction: 'England and Wales',
      clientAlias: newClient.trim() || 'Confidential Client',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };

    setMatters(prev => [newMatter, ...prev]);
    setActiveMatterId(newMatter.id);
    setDocuments([]);
    setSpans([]);
    setClaims([]);
    setReviewItems([]);
    setDraft({
      id: `draft-${Date.now()}`,
      matterId: newMatter.id,
      type: 'matter_brief',
      title: `Matter Assessment Brief — ${newMatter.title}`,
      blocks: [],
      generatedBy: 'deterministic_offline',
      reviewStatus: 'needs_review',
      updatedAt: new Date().toISOString()
    });
    setSelectedSpan(null);
    setIsNewMatterOpen(false);
    setNewTitle('');
    setNewClient('');
    setCurrentTab('sources');
  };

  const handleChangeNetworkMode = (mode: NetworkMode) => {
    networkBroker.setMode(mode);
    setNetworkMode(mode);
  };

  const handleToggleVaultLock = () => {
    if (!isVaultLocked) {
      vaultService.lock();
      setIsVaultLocked(true);
    } else {
      setIsUnlockModalOpen(true);
      setUnlockError('');
    }
  };

  const handleUnlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vaultService.unlock(passphraseInput);
      setIsVaultLocked(false);
      setIsUnlockModalOpen(false);
      setPassphraseInput('');
      setUnlockError('');
    } catch {
      setUnlockError('Invalid vault passphrase. Decryption refused.');
    }
  };

  const handleExportMarkdown = () => {
    const md = DocxExporter.exportToMarkdown(draft, activeMatter, claims);
    downloadFile(md, `${activeMatter.title.replace(/[^a-z0-9]/gi, '_')}_Brief.md`, 'text/markdown');
  };

  const handleExportDocx = () => {
    const docHtml = DocxExporter.exportToWordDocument(draft, activeMatter, claims);
    downloadFile(docHtml, `${activeMatter.title.replace(/[^a-z0-9]/gi, '_')}_Legal_Brief.doc`, 'application/msword');
  };

  const handleExportBundle = async () => {
    const bundle = await BundleExchange.createPlainBundle({
      matter: activeMatter,
      documents,
      spans,
      claims,
      drafts: [draft],
      reviews: reviewItems,
      memories: memoryEngine.getMemoriesForMatter(activeMatter.id)
    });
    const jsonStr = JSON.stringify(bundle, null, 2);
    downloadFile(jsonStr, `${activeMatter.title.replace(/[^a-z0-9]/gi, '_')}_Sovereign_Bundle.proofline`, 'application/json');
  };

  const handleExportNotebook = () => {
    const spanMap = new Map(spans.map(s => [s.id, s]));
    const { contradictions } = detectContradictions(claims, spanMap);
    const files = NotebookExporter.generateObsidianVault(
      activeMatter,
      documents,
      claims,
      contradictions,
      authorities,
      [draft]
    );
    let fullNotebook = `# Proofline Knowledge Notebook: ${activeMatter.title}\n\n`;
    for (const f of files) {
      fullNotebook += `\n<!-- ========================================== -->\n`;
      fullNotebook += `<!-- FILE: ${f.relativePath} -->\n`;
      fullNotebook += `<!-- ========================================== -->\n\n`;
      fullNotebook += f.content;
    }
    downloadFile(fullNotebook, `${activeMatter.title.replace(/[^a-z0-9]/gi, '_')}_Obsidian_Notebook.md`, 'text/markdown');
  };

  const handleExportCalendar = () => {
    const events: CalendarEvent[] = [
      {
        id: `evt-${activeMatter.id}-1`,
        matterId: activeMatter.id,
        title: `Court Deadline: Letter Before Claim Expiry (${activeMatter.title})`,
        description: `14-day statutory response window for ${activeMatter.title} expires pursuant to CPR Pre-Action Protocol.`,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
        location: 'County Court Money Claims Centre',
        priority: 'HIGH',
        category: 'statutory_deadline'
      }
    ];
    const icsContent = IcsHandler.generateIcs(events);
    downloadFile(icsContent, `${activeMatter.title.replace(/[^a-z0-9]/gi, '_')}_Court_Deadlines.ics`, 'text/calendar');
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddClaim = (claim: Claim) => {
    setClaims(prev => [claim, ...prev]);
  };

  const handleUpdateClaim = (updated: Claim) => {
    setClaims(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteClaim = (id: string) => {
    setClaims(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateDraftBlock = (blockId: string, newText: string) => {
    setDraft(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, text: newText } : b)
    }));
  };

  const handleApproveBlock = (blockId: string) => {
    setDraft(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, reviewStatus: 'verified' } : b)
    }));
  };

  const handleRegenerateDraft = () => {
    const freshDraft = generateDeterministicDraft(activeMatter, documents, spans, claims);
    setDraft(freshDraft);
  };

  const handleResolveReviewItem = (id: string) => {
    setReviewItems(prev => prev.map(item => item.id === id ? { ...item, status: 'resolved' } : item));
  };

  const handleDismissReviewItem = (id: string) => {
    setReviewItems(prev => prev.map(item => item.id === id ? { ...item, status: 'dismissed' } : item));
  };

  const spansMap = new Map(spans.map(s => [s.id, s]));
  const { contradictions } = detectContradictions(claims, spansMap);
  const pendingReviewCount = reviewItems.filter(i => i.status === 'pending').length;

  const counts = {
    docs: documents.length,
    claims: claims.length,
    conflicts: contradictions.length,
    reviewItems: pendingReviewCount,
    authorities: authorities.length
  };

  const selectedDocument = selectedSpan ? documents.find(d => d.id === selectedSpan.documentId) || null : null;

  return (
    <div className="min-h-screen bg-gallery-paper flex flex-col font-sans text-ink antialiased">
      {/* Universal Global Header */}
      <GlobalNav
        activeView={activeView}
        onOpenWorkbench={handleLoadSampleMatter}
        onLoadSample={handleLoadSampleMatter}
        onNavigateHome={() => setActiveView('landing')}
      />

      {activeView === 'landing' ? (
        <LandingPage onOpenWorkbench={handleLoadSampleMatter} onLoadSample={handleLoadSampleMatter} />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Top Context Rail */}
          <TopRail
            matter={activeMatter}
            modelStatus={modelStatus}
            networkMode={networkMode}
            isVaultLocked={isVaultLocked}
            onToggleVaultLock={handleToggleVaultLock}
            onChangeNetworkMode={handleChangeNetworkMode}
            onExportMarkdown={handleExportMarkdown}
            onExportDocx={handleExportDocx}
            onExportBundle={handleExportBundle}
            onExportNotebook={handleExportNotebook}
            onExportCalendar={handleExportCalendar}
            onOpenSettings={() => setCurrentTab('settings')}
          />

          {/* Workbench Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left 248px Navigation Sidebar */}
            <Sidebar
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              counts={counts}
              onLoadSample={handleLoadSampleMatter}
              onNewMatter={() => setIsNewMatterOpen(true)}
              matters={matters}
              activeMatterId={activeMatterId}
              onSelectMatter={handleSelectMatter}
            />

            {/* Central Work Area */}
            <main className="flex-1 overflow-y-auto bg-gallery-paper">
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

              {currentTab === 'chat' && (
                <ChatTab
                  matterId={activeMatterId}
                  matterTitle={activeMatter.title}
                  matterJurisdiction={activeMatter.jurisdiction}
                  claims={claims}
                  authorities={authorities}
                  reviewItems={reviewItems}
                  documents={documents}
                  spans={spans}
                  memoryEngine={memoryEngine}
                  modelManager={modelManager}
                  networkBroker={networkBroker}
                  onSelectSpan={setSelectedSpan}
                />
              )}

              {currentTab === 'contract' && (
                <ContractTab
                  matterId={activeMatterId}
                  documents={documents}
                />
              )}

              {currentTab === 'memory' && (
                <MemoryTab
                  matterId={activeMatterId}
                  memoryEngine={memoryEngine}
                />
              )}

              {currentTab === 'sources' && (
                <SourcesTab
                  documents={documents}
                  spans={spans}
                  onSelectSpan={setSelectedSpan}
                  selectedSpan={selectedSpan}
                  onAddDocument={(doc) => setDocuments(prev => [doc, ...prev])}
                  onIngestAnalysis={handleIngestAnalysis}
                  existingClaims={claims}
                  matterId={activeMatterId}
                />
              )}

              {currentTab === 'facts' && (
                <FactsTab
                  matterId={activeMatterId}
                  claims={claims}
                  documents={documents}
                  spans={spans}
                  onSelectSpan={setSelectedSpan}
                  onUpdateClaimNotes={(id, notes) => setClaims(prev => prev.map(c => c.id === id ? { ...c, editorNotes: notes } : c))}
                />
              )}

              {currentTab === 'timeline' && (
                <TimelineTab
                  matterId={activeMatterId}
                  claims={claims}
                  documents={documents}
                  spans={spans}
                  reviewItems={reviewItems}
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
                <ResearchTab 
                  authorities={authorities}
                  networkMode={networkMode}
                  onAddAuthority={(newAuth) => setAuthorities(prev => [newAuth, ...prev])}
                />
              )}

              {currentTab === 'draft' && (
                <DraftTab
                  draft={draft}
                  matter={activeMatter}
                  documents={documents}
                  spans={spans}
                  modelStatus={modelStatus}
                  onSelectSpan={setSelectedSpan}
                  onRegenerateDraft={async () => { handleRegenerateDraft(); }}
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
                  isVaultLocked={isVaultLocked}
                  onToggleVaultLock={handleToggleVaultLock}
                  onExportVaultBackup={handleExportBundle}
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

      {/* Vault Unlock Passphrase Modal */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gallery-white border border-border-hairline rounded-[6px] p-6 w-full max-w-[420px] shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-ink">
              Unlock Sovereign Vault
            </h3>
            <p className="text-[12.5px] text-ink-slate">
              Enter your master passphrase to derive the AES-GCM-256 decryption key and rehydrate memory records.
            </p>
            <form onSubmit={handleUnlockVault} className="space-y-3.5">
              <input
                type="password"
                placeholder="Enter vault passphrase..."
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-[4px] px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                required
                autoFocus
              />
              {unlockError && (
                <div className="text-[12px] text-proofline-crimson font-medium">
                  {unlockError}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUnlockModalOpen(false)}
                  className="text-[12px] px-3.5 py-1.5 text-ink-slate hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-[12px] px-4 py-1.5 bg-ink hover:bg-ink-slate text-white rounded-[4px] font-medium transition-colors"
                >
                  Unlock Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Matter Modal */}
      {isNewMatterOpen && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gallery-white border border-border-hairline rounded-[6px] p-6 w-full max-w-[460px] shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-ink">
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
                  className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-[4px] px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
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
                  className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-[4px] px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
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
                  className="text-[12px] px-4 py-1.5 bg-proofline-blue hover:bg-proofline-navy text-white rounded-[4px] font-medium transition-colors"
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
