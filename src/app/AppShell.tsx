import React, { useState, useEffect } from 'react';
import { TopRail } from '../components/layout/TopRail.tsx';
import { Sidebar, type WorkbenchTab } from '../components/layout/Sidebar.tsx';
import { SourceInspector } from '../components/common/SourceInspector.tsx';
import { WorkProductPanel } from '../features/workProducts/WorkProductPanel.tsx';

import { OverviewTab } from '../components/workbench/OverviewTab.tsx';
import { SourcesTab } from '../components/workbench/SourcesTab.tsx';
import { FactsTab } from '../components/workbench/FactsTab.tsx';
import { TimelineTab } from '../components/workbench/TimelineTab.tsx';
import { GraphTab } from '../components/workbench/GraphTab.tsx';
import { ResearchTab } from '../components/workbench/ResearchTab.tsx';
import { DraftTab } from '../components/workbench/DraftTab.tsx';
import { ReviewTab } from '../components/workbench/ReviewTab.tsx';
import { SettingsTab } from '../components/workbench/SettingsTab.tsx';
import { ChatTab } from '../components/workbench/ChatTab.tsx';
import { MemoryTab } from '../components/workbench/MemoryTab.tsx';
import { ContractTab } from '../components/workbench/ContractTab.tsx';
import { NotebookStudioTab } from '../components/workbench/NotebookStudioTab.tsx';
import { OnboardingModal } from '../components/onboarding/OnboardingModal.tsx';
import { DevicePairingModal } from '../components/sync/DevicePairingModal.tsx';

import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  Authority, 
  Draft, 
  DraftBlock,
  ReviewItem, 
  NetworkMode,
  UserProfile,
  WorkspaceType
} from '../types/index.ts';

import { 
  BATES_MATTER, 
  BATES_DOCUMENTS, 
  BATES_SPANS, 
  BATES_CLAIMS, 
  BATES_REVIEWS, 
  BATES_DRAFT,
  BATES_AUTHORITIES
} from '../db/fixtures/batesPostOfficeMatter.ts';
import { 
  SAMPLE_MATTER, 
  SAMPLE_DOCUMENTS, 
  SAMPLE_SPANS, 
  SAMPLE_CLAIMS, 
  SAMPLE_REVIEW_ITEMS, 
  SAMPLE_DRAFT 
} from '../db/fixtures/consumerLaptop.ts';
import { 
  CONTRACT_MATTER, 
  CONTRACT_DOCUMENTS, 
  CONTRACT_SPANS, 
  CONTRACT_CLAIMS, 
  CONTRACT_REVIEWS, 
  CONTRACT_DRAFT 
} from '../db/fixtures/contractMatter.ts';
import { 
  TENANCY_MATTER, 
  TENANCY_DOCUMENTS, 
  TENANCY_SPANS, 
  TENANCY_CLAIMS, 
  TENANCY_REVIEWS, 
  TENANCY_DRAFT 
} from '../db/fixtures/tenancyMatter.ts';
import { 
  GOLDEN_MATTER,
  GOLDEN_DOCUMENTS,
  GOLDEN_CLAIMS,
  GOLDEN_REVIEWS
} from '../domain/matters/goldenMatter.ts';
import { 
  CRA_2015_AUTHORITIES, 
  COMMERCIAL_CONTRACT_AUTHORITIES, 
  TENANCY_HOUSING_AUTHORITIES 
} from '../db/fixtures/authorities.ts';

import { generateDeterministicDraft } from '../engine/draftingEngine.ts';
import { detectContradictions } from '../engine/contradictionEngine.ts';
import { MemoryEngine } from '../engine/memory/memoryEngine.ts';
import { NetworkBroker } from '../engine/network/networkBroker.ts';
import { LocalModelManager } from '../engine/model/localModelManager.ts';
import { vaultService } from '../engine/vault/vaultService.ts';
import { DocxExporter } from '../engine/export/docxExporter.ts';
import { BundleExchange } from '../engine/collaboration/bundleExchange.ts';
import { NotebookExporter } from '../engine/export/notebookExporter.ts';
import { IcsHandler, type CalendarEvent } from '../engine/calendar/icsHandler.ts';
import { type IngestionAnalysisResult } from '../engine/ingestion/matterAnalyzer.ts';
import { 
  getMattersFromDB, 
  saveMatterToDB, 
  loadMatterEntitiesFromDB, 
  persistIngestionResultToDB, 
  saveDraftToDB, 
  saveClaimToDB, 
  deleteClaimFromDB, 
  saveReviewItemToDB,
  saveUserProfileToDB
} from '../db/index.ts';
import { useApp } from './AppProviders.tsx';
import { WorkProduct, createWorkProduct, detectSourceDrift } from '../domain/workProducts/workProduct.ts';

const memoryEngine = new MemoryEngine();
const networkBroker = new NetworkBroker('offline');
const modelManager = new LocalModelManager();

interface AppShellProps {
  onNavigateHome: () => void;
  isNewMatterModalRequested?: boolean;
  onClearNewMatterModalRequest?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  onNavigateHome,
  isNewMatterModalRequested = false,
  onClearNewMatterModalRequest
}) => {
  const { workspace, setWorkspace, userProfile, setUserProfile, modelStatus, refreshModelStatus } = useApp();

  const [currentTab, setCurrentTab] = useState<WorkbenchTab>('overview');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Multi-matter portfolio partitioned by workspace
  const [matters, setMatters] = useState<Matter[]>([]);
  const [activeMatterId, setActiveMatterId] = useState<string>('');

  // Evidential state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [spans, setSpans] = useState<Span[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

  // Work Product Subsystem Side Panel
  const [activeWorkProduct, setActiveWorkProduct] = useState<WorkProduct | null>(null);

  // Sovereign Broker & Vault state
  const [networkMode, setNetworkMode] = useState<NetworkMode>('offline');
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Inspector and modal state
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  const [isNewMatterOpen, setIsNewMatterOpen] = useState(isNewMatterModalRequested);
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [isOfflineBannerDismissed, setIsOfflineBannerDismissed] = useState(false);
  const [isPairingOpen, setIsPairingOpen] = useState(false);

  useEffect(() => {
    if (isNewMatterModalRequested) {
      setIsNewMatterOpen(true);
      onClearNewMatterModalRequest?.();
    }
  }, [isNewMatterModalRequested, onClearNewMatterModalRequest]);

  const fallbackEmptyMatter: Matter = {
    id: 'empty-matter',
    title: 'My Practice (Clean)',
    jurisdiction: userProfile?.primaryJurisdiction || 'England and Wales',
    clientAlias: 'Private Client',
    status: 'active',
    workspaceType: workspace,
    isDemo: workspace === 'demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const activeMatter = matters.find(m => m.id === activeMatterId) || (matters.length > 0 ? matters[0] : fallbackEmptyMatter);

  // Load matters when workspace changes or mounts
  useEffect(() => {
    async function loadWorkspaceMatters() {
      const storedMatters = await getMattersFromDB(workspace);
      setMatters(storedMatters);

      if (storedMatters && storedMatters.length > 0) {
        const defaultMatter = storedMatters[0];
        setActiveMatterId(defaultMatter.id);
        await hydrateMatter(defaultMatter.id);
      } else {
        // Clean empty personal state
        setActiveMatterId('');
        setDocuments([]);
        setSpans([]);
        setClaims([]);
        setAuthorities([]);
        setReviewItems([]);
        setDraft(null);
        setSelectedSpan(null);
        setActiveWorkProduct(null);
      }
    }
    loadWorkspaceMatters();
  }, [workspace]);

  const hydrateMatter = async (matterId: string) => {
    const entities = await loadMatterEntitiesFromDB(matterId);
    if (entities && (entities.documents.length > 0 || entities.claims.length > 0)) {
      setDocuments(entities.documents);
      setSpans(entities.spans);
      setClaims(entities.claims);
      if (entities.authorities.length > 0) setAuthorities(entities.authorities);
      if (entities.draft) setDraft(entities.draft);
      setReviewItems(entities.reviewItems);
      if (entities.spans.length > 0) setSelectedSpan(entities.spans[0]);
    } else if (matterId === GOLDEN_MATTER.id) {
      setDocuments(GOLDEN_DOCUMENTS);
      setSpans([]);
      setClaims(GOLDEN_CLAIMS);
      setAuthorities(COMMERCIAL_CONTRACT_AUTHORITIES);
      setReviewItems(GOLDEN_REVIEWS);
      setDraft(CONTRACT_DRAFT);
      setSelectedSpan(null);
    } else if (matterId === BATES_MATTER.id) {
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
    } else if (matterId === SAMPLE_MATTER.id) {
      setDocuments(SAMPLE_DOCUMENTS);
      setSpans(SAMPLE_SPANS);
      setClaims(SAMPLE_CLAIMS);
      setAuthorities(CRA_2015_AUTHORITIES);
      setReviewItems(SAMPLE_REVIEW_ITEMS);
      setDraft(SAMPLE_DRAFT);
      setSelectedSpan(SAMPLE_SPANS[0]);
    } else {
      // User created matter
      setDocuments([]);
      setSpans([]);
      setClaims([]);
      setAuthorities([]);
      setReviewItems([]);
      setDraft({
        id: `draft-${matterId}`,
        matterId,
        title: 'Draft Assessment',
        type: 'matter_brief',
        blocks: [
          {
            id: `blk-${Date.now()}-1`,
            heading: 'Initial Legal Assessment & Case Strategy',
            text: 'Enter draft pleadings, statutory claims, or client advice here. Click text to edit.',
            claimIds: [],
            spanIds: [],
            reviewStatus: 'verified'
          }
        ],
        generatedBy: 'deterministic',
        reviewStatus: 'needs_review',
        updatedAt: new Date().toISOString()
      });
      setSelectedSpan(null);
    }
  };

  const handleSelectMatter = async (matterId: string) => {
    setActiveMatterId(matterId);
    await hydrateMatter(matterId);
  };

  const handleSelectWorkspace = async (ws: WorkspaceType) => {
    setWorkspace(ws);
  };

  const handleLoadSampleMatter = async () => {
    setWorkspace('demo');
    await handleSelectMatter(GOLDEN_MATTER.id);
    setCurrentTab('overview');
  };

  const handleIngestAnalysis = async (result: IngestionAnalysisResult) => {
    const baseDraft: Draft = draft || {
      id: `draft-${activeMatterId}`,
      matterId: activeMatterId,
      type: 'matter_brief',
      title: `Matter Assessment Brief`,
      blocks: [],
      generatedBy: 'deterministic_offline',
      reviewStatus: 'needs_review',
      updatedAt: new Date().toISOString()
    };

    const updatedDraft: Draft = result.draftBlocks.length > 0 ? {
      ...baseDraft,
      blocks: [...baseDraft.blocks, ...result.draftBlocks],
      updatedAt: new Date().toISOString()
    } : baseDraft;

    setDocuments(prev => [result.document, ...prev]);
    setSpans(prev => [...prev, ...result.spans]);
    setClaims(prev => [...prev, ...result.claims]);
    setReviewItems(prev => [...result.reviewItems, ...prev]);
    setDraft(updatedDraft);
    if (result.spans.length > 0) {
      setSelectedSpan(result.spans[0]);
    }

    // Check if active work product needs source drift alert
    if (activeWorkProduct) {
      const currentVer = activeWorkProduct.versions.find(v => v.id === activeWorkProduct.currentVersionId);
      if (currentVer) {
        const drift = detectSourceDrift(currentVer, [result.document.id]);
        if (drift.hasDrift) {
          setActiveWorkProduct({
            ...activeWorkProduct,
            versions: activeWorkProduct.versions.map(v => v.id === currentVer.id ? drift.updatedVersion : v)
          });
        }
      }
    }

    await persistIngestionResultToDB({
      document: result.document,
      spans: result.spans,
      claims: result.claims,
      reviewItems: result.reviewItems,
      draft: updatedDraft
    });
  };

  const handleCreateNewMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMatter: Matter = {
      id: `matter-${Date.now()}`,
      title: newTitle.trim(),
      jurisdiction: userProfile?.primaryJurisdiction || 'England and Wales',
      clientAlias: newClient.trim() || 'Confidential Client',
      status: 'active',
      workspaceType: 'personal',
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newDraft: Draft = {
      id: `draft-${Date.now()}`,
      matterId: newMatter.id,
      type: 'matter_brief',
      title: `Matter Assessment Brief: ${newMatter.title}`,
      blocks: [
        {
          id: `blk-${Date.now()}-1`,
          heading: 'Initial Legal Assessment & Case Strategy',
          text: 'Enter draft pleadings, statutory claims, or client advice here. Click text to edit.',
          claimIds: [],
          spanIds: [],
          reviewStatus: 'verified'
        }
      ],
      generatedBy: 'deterministic_offline',
      reviewStatus: 'needs_review',
      updatedAt: new Date().toISOString()
    };

    await saveMatterToDB(newMatter);
    await saveDraftToDB(newDraft);

    setWorkspace('personal');
    setMatters(prev => [newMatter, ...prev]);
    setActiveMatterId(newMatter.id);
    setDocuments([]);
    setSpans([]);
    setClaims([]);
    setReviewItems([]);
    setDraft(newDraft);
    setSelectedSpan(null);
    setIsNewMatterOpen(false);
    setNewTitle('');
    setNewClient('');
    setCurrentTab('sources');
  };

  const handleCreateWorkProduct = (type: WorkProduct['type'], title: string, body: string) => {
    const wp = createWorkProduct({
      matterId: activeMatterId,
      workspaceId: workspace,
      type,
      title,
      body,
      createdBy: 'ai',
      sourceRefs: documents.map(d => d.id)
    });
    setActiveWorkProduct(wp);
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

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    if (!draft) return;
    const md = DocxExporter.exportToMarkdown(draft, activeMatter, claims);
    downloadFile(md, `${activeMatter.title.replace(/[^a-z0-9]/gi, '_')}_Brief.md`, 'text/markdown');
  };

  const handleExportDocx = () => {
    if (!draft) return;
    const docHtml = DocxExporter.exportToWordDocument(draft, activeMatter, claims);
    downloadFile(docHtml, `${activeMatter.title.replace(/[^a-z0-9]/gi, '_')}_Legal_Brief.doc`, 'application/msword');
  };

  const handleExportBundle = async () => {
    const bundle = await BundleExchange.createPlainBundle({
      matter: activeMatter,
      documents,
      spans,
      claims,
      drafts: draft ? [draft] : [],
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
      draft ? [draft] : []
    );
    let fullNotebook = `# ATKIN Knowledge Notebook: ${activeMatter.title}\n\n`;
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
        title: `Pre-Trial Case Management Hearing: ${activeMatter.title}`,
        startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 14 * 86400000 + 7200000).toISOString(),
        description: `Court milestone for ${activeMatter.clientAlias}. Subject to CPR 2.8 clear-day calculations.`,
        priority: 'HIGH',
        category: 'court_hearing'
      }
    ];
    const ics = IcsHandler.generateIcs(events);
    downloadFile(ics, `${activeMatter.title.replace(/[^a-z0-9]/gi, '_')}_Deadlines.ics`, 'text/calendar');
  };

  const handleRegenerateDraft = async () => {
    const newDraft = generateDeterministicDraft(activeMatter, documents, spans, claims);
    setDraft(newDraft);
    await saveDraftToDB(newDraft);
  };

  const handleUpdateDraftBlock = async (blockId: string, newText: string) => {
    if (!draft) return;
    const updatedDraft: Draft = {
      ...draft,
      blocks: draft.blocks.map(b => b.id === blockId ? { ...b, text: newText } : b),
      updatedAt: new Date().toISOString()
    };
    setDraft(updatedDraft);
    await saveDraftToDB(updatedDraft);
  };

  const handleApproveBlock = async (blockId: string) => {
    if (!draft) return;
    const updatedDraft: Draft = {
      ...draft,
      blocks: draft.blocks.map(b => b.id === blockId ? { ...b, reviewStatus: 'verified' } : b),
      updatedAt: new Date().toISOString()
    };
    setDraft(updatedDraft);
    await saveDraftToDB(updatedDraft);
  };

  const handleAppendDraftBlock = async (block: DraftBlock) => {
    const baseDraft: Draft = draft || {
      id: `draft-${activeMatterId}`,
      matterId: activeMatterId,
      type: 'matter_brief',
      title: `Matter Assessment Brief`,
      blocks: [],
      generatedBy: 'deterministic_offline',
      reviewStatus: 'needs_review',
      updatedAt: new Date().toISOString()
    };
    const updatedDraft: Draft = {
      ...baseDraft,
      blocks: [...baseDraft.blocks, block],
      updatedAt: new Date().toISOString()
    };
    setDraft(updatedDraft);
    await saveDraftToDB(updatedDraft);
  };

  const handleResolveReviewItem = async (id: string) => {
    setReviewItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated: ReviewItem = { ...item, status: 'resolved' };
        saveReviewItemToDB(updated);
        return updated;
      }
      return item;
    }));
  };

  const handleDismissReviewItem = async (id: string) => {
    setReviewItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated: ReviewItem = { ...item, status: 'dismissed' };
        saveReviewItemToDB(updated);
        return updated;
      }
      return item;
    }));
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
        onOpenPairing={() => setIsPairingOpen(true)}
      />

      {/* Honest Sovereign Mode / Local LLM Status Banner */}
      {modelStatus.state !== 'connected' && !isOfflineBannerDismissed && (
        <div className="bg-[#FAF8F5] border-b border-border-hairline px-4 py-2 flex items-center justify-between text-[12px] text-ink-slate shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0 animate-pulse" />
            <span>
              <strong className="text-ink font-semibold">Sovereign Deterministic IRAC Core Active</strong>: Local Ollama endpoint offline. ATKIN is operating in deterministic evidential mode with SHA-256 verifiable citations.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('settings')}
              className="text-atkin-ink hover:underline font-medium cursor-pointer"
            >
              Configure Local Model
            </button>
            <button
              onClick={() => setIsOfflineBannerDismissed(true)}
              className="text-ink-muted hover:text-ink text-xs px-1.5 py-0.5 rounded cursor-pointer"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
          activeWorkspace={workspace}
          onSelectWorkspace={handleSelectWorkspace}
        />

        {/* Central Work Area */}
        <main className="flex-1 overflow-y-auto bg-gallery-paper">
          {matters.length === 0 ? (
            <div className="flex-1 h-full min-h-[500px] flex items-center justify-center p-8 bg-gallery-paper">
              <div className="max-w-md w-full bg-white border border-border-hairline rounded-xl p-8 text-center shadow-subtle space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center mx-auto text-xl font-serif">
                  A
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-serif text-ink tracking-tight">Your Practice is Clean</h3>
                  <p className="text-xs text-ink-slate leading-relaxed">
                    You are in your private, sovereign workspace. No matters have been created yet.
                    All documents you import remain 100% on this computer.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewMatterOpen(true)}
                    className="w-full py-2.5 px-4 bg-atkin-ink hover:opacity-90 text-white text-xs font-semibold rounded-md shadow-xs transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Create First Client Matter</span>
                    <span className="font-mono text-xs">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('demo')}
                    className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-md border border-stone-200 transition-colors cursor-pointer"
                  >
                    Explore Demo Sandbox (Alder Peak & Bates)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
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

              {currentTab === 'notebook' && (
                <NotebookStudioTab
                  matter={activeMatter}
                  documents={documents}
                  spans={spans}
                  claims={claims}
                  authorities={authorities}
                  onSelectSpan={setSelectedSpan}
                  modelStatus={modelStatus}
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

              {currentTab === 'draft' && draft && (
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
                  onAppendDraftBlock={handleAppendDraftBlock}
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
                  onRefreshModel={refreshModelStatus}
                  isVaultLocked={isVaultLocked}
                  onToggleVaultLock={handleToggleVaultLock}
                  onExportVaultBackup={handleExportBundle}
                />
              )}
            </>
          )}
        </main>

        {/* Right Source Inspector Panel */}
        <SourceInspector
          span={selectedSpan}
          document={selectedDocument}
          onClose={() => setSelectedSpan(null)}
        />

        {/* Right Work Product Side Panel (Sections 20, 21, 22) */}
        {activeWorkProduct && (
          <WorkProductPanel
            product={activeWorkProduct}
            onClose={() => setActiveWorkProduct(null)}
            onUpdateProduct={(upd) => setActiveWorkProduct(upd)}
          />
        )}
      </div>

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
                className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-[4px] px-3 py-2 text-ink focus:border-atkin-ink focus:outline-none"
                required
                autoFocus
              />
              {unlockError && (
                <div className="text-[12px] text-rose-600 font-medium">
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
                  className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-[4px] px-3 py-2 text-ink focus:border-atkin-ink focus:outline-none"
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
                  className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-[4px] px-3 py-2 text-ink focus:border-atkin-ink focus:outline-none"
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
                  className="text-[12px] px-4 py-1.5 bg-atkin-ink hover:opacity-90 text-white rounded-[4px] font-medium transition-opacity"
                >
                  Create Matter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cross-Device Companion Pairing Modal */}
      <DevicePairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
      />
    </div>
  );
};
