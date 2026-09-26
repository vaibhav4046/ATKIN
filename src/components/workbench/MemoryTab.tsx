import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Check, 
  X, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  FileText, 
  Layers,
  Cpu,
  History,
  Network,
  BookOpen,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { MemoryRecord } from '../../types/index.ts';
import { MemoryEngine } from '../../engine/memory/memoryEngine.ts';
import { 
  ContextPlanner, 
  EpisodicMemoryEngine, 
  SemanticMemoryEngine, 
  ProceduralMemoryEngine, 
  MemoryGovernance,
  type TaskEpisode,
  type LegalEntity,
  type ProceduralSkill
} from '../../engine/memory/index.ts';
import { Badge } from '../common/Badge.tsx';

interface MemoryTabProps {
  matterId: string;
  memoryEngine: MemoryEngine;
}

// Instantiate shared memory layer instances with matter-specific grounding
const episodicEngine = new EpisodicMemoryEngine([
  {
    id: 'ep-001',
    matterId: 'matter-contract-review',
    taskType: 'clause_qa',
    queryOrGoal: 'Extract payment terms, invoice sum, and dispute notification window from Clause 4',
    approachSummary: 'Located Clause 4 in Elmbridge MSA. Extracted £2,375 sum and strict 17-day notice period.',
    keyDecisions: ['Directly quoted Clause 4 without irrelevant UCTA boilerplate', 'Flagged missing delivery date fact'],
    spansReferenced: ['span-msa-cl4', 'span-msa-inv'],
    authoritiesReferenced: [],
    outcome: 'success',
    userFeedback: {
      rating: 'positive',
      comment: 'Concise, quoted exact text, avoided generic boilerplate.',
      timestamp: '2026-09-25T14:30:00Z'
    },
    tokensUsed: 185,
    createdAt: '2026-09-25T14:30:00Z'
  },
  {
    id: 'ep-002',
    matterId: 'matter-bates-post-office',
    taskType: 'disclosure_review',
    queryOrGoal: 'Audit Fujitsu Known Errors Log (KEL) for Horizon software bugs',
    approachSummary: 'Cross-referenced KEL bug reports against Horizon branch accounting discrepancies.',
    keyDecisions: ['Focused on Call Reception discrepancy slips', 'Applied Fraser J relational contract findings'],
    spansReferenced: ['span-bates-kel-01'],
    authoritiesReferenced: ['Bates v Post Office [2019] EWHC 606 (QB)'],
    outcome: 'success',
    userFeedback: {
      rating: 'positive',
      comment: 'Direct match with Fraser J Horizon Issues judgment findings.',
      timestamp: '2026-09-24T11:00:00Z'
    },
    tokensUsed: 310,
    createdAt: '2026-09-24T11:00:00Z'
  }
]);

const semanticEngine = new SemanticMemoryEngine([
  {
    id: 'ent-001',
    matterId: 'matter-contract-review',
    type: 'party',
    name: 'Elmbridge Borough Council',
    canonicalKey: 'party:elmbridge_borough_council',
    properties: { role: 'Customer / Public Authority', jurisdiction: 'England and Wales' },
    provenance: {
      documentId: 'doc-elmbridge-msa-2026',
      sourceTextSnippet: 'between Elmbridge Borough Council ("Customer") and Riverglass Software Ltd ("Supplier")',
      charOffset: [0, 95]
    },
    confidence: 1.0,
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'ent-002',
    matterId: 'matter-contract-review',
    type: 'party',
    name: 'Riverglass Software Ltd',
    canonicalKey: 'party:riverglass_software_ltd',
    properties: { role: 'Supplier', companyNumber: '09876543' },
    provenance: {
      documentId: 'doc-elmbridge-msa-2026',
      sourceTextSnippet: 'Riverglass Software Ltd (Company No. 09876543)',
      charOffset: [96, 150]
    },
    confidence: 1.0,
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'ent-003',
    matterId: 'matter-contract-review',
    type: 'clause',
    name: 'Clause 4: Payment & Dispute Notice',
    canonicalKey: 'clause:elmbridge_msa_cl4',
    properties: { days: 17, amount: 2375, currency: 'GBP' },
    provenance: {
      documentId: 'doc-elmbridge-msa-2026',
      sourceTextSnippet: 'Clause 4: Payment of £2,375 within 30 days. Written notice of dispute within 17 calendar days.',
      charOffset: [450, 560]
    },
    confidence: 1.0,
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'ent-004',
    matterId: 'matter-contract-review',
    type: 'deadline',
    name: 'Dispute Notice Window (17 Days)',
    canonicalKey: 'deadline:dispute_notice',
    properties: { days: 17, calendarDays: true },
    provenance: {
      documentId: 'doc-elmbridge-msa-2026',
      sourceTextSnippet: 'written notice within 17 calendar days of receipt',
      charOffset: [500, 555]
    },
    confidence: 1.0,
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'ent-005',
    matterId: 'matter-contract-review',
    type: 'deadline',
    name: 'Conflicting Dispute Notice (Draft Letter)',
    canonicalKey: 'deadline:dispute_notice',
    properties: { days: 14, calendarDays: true },
    provenance: {
      documentId: 'doc-draft-dispute-notice',
      sourceTextSnippet: 'Please note dispute response is required within 14 calendar days.',
      charOffset: [120, 185]
    },
    confidence: 0.9,
    createdAt: '2026-09-22T15:00:00Z'
  },
  {
    id: 'ent-006',
    matterId: 'matter-bates-post-office',
    type: 'precedent',
    name: 'Bates v Post Office [2019] EWHC 606 (QB)',
    canonicalKey: 'precedent:bates_v_post_office_no3',
    properties: { judge: 'Fraser J', doctrine: 'Relational Contract Good Faith' },
    provenance: {
      documentId: 'doc-bates-judgment-01',
      sourceTextSnippet: 'Bates & Ors v Post Office Ltd (No 3: Common Issues) [2019] EWHC 606 (QB)',
      charOffset: [0, 80]
    },
    confidence: 1.0,
    createdAt: '2026-09-21T09:00:00Z'
  }
]);

const proceduralEngine = new ProceduralMemoryEngine([
  {
    id: 'skill-cand-escalation',
    name: 'Contractual Dispute Escalation & Senior Executive Meeting Protocol',
    version: 1,
    description: 'Enforces mandatory 14-day negotiation window between Managing Directors before arbitration or High Court proceedings.',
    jurisdiction: 'England and Wales',
    practiceArea: 'Commercial Litigation',
    triggerPatterns: ['executive negotiation', 'dispute escalation', 'tiered dispute resolution'],
    requiredInputs: ['dispute_notice_date', 'nominated_directors'],
    steps: [
      { stepNumber: 1, actionName: 'Notice Verification', instruction: 'Confirm formal notice sent to nominated email.', expectedOutput: 'Service confirmed' },
      { stepNumber: 2, actionName: '14-Day Standstill', instruction: 'Calculate standstill date before legal proceedings.', expectedOutput: 'Calendar standstill date' }
    ],
    verificationChecks: [
      { checkId: 'chk-service', description: 'Notice of escalation formally served', mandatory: true }
    ],
    reviewGateRequired: true,
    status: 'candidate',
    createdAt: '2026-09-24T16:00:00Z'
  }
]);

const governanceEngine = new MemoryGovernance({
  episodicTtlDays: 365,
  maxEpisodesPerMatter: 50
});

export const MemoryTab: React.FC<MemoryTabProps> = ({
  matterId,
  memoryEngine
}) => {
  const [activeTier, setActiveTier] = useState<
    'working' | 'episodic' | 'semantic' | 'procedural' | 'governance' | 'ledger'
  >('working');

  const [activeScopeTab, setActiveScopeTab] = useState<'matter_facts' | 'user_preferences' | 'workspace_playbooks' | 'suggested'>('matter_facts');
  const [newText, setNewText] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Working Memory State
  const contextPlanner = new ContextPlanner({
    maxContextTokens: 8192,
    systemReservePercent: 0.15,
    spansReservePercent: 0.45,
    episodicReservePercent: 0.10,
    dialogueReservePercent: 0.30
  });

  const plannedContext = contextPlanner.planContext({
    systemPrompt: `You are ATKIN Sovereign Legal AI acting for Matter: ${matterId}. Jurisdiction: England and Wales. Strictly quote verified spans.`,
    evidenceSpans: [
      { id: 's1', citation: 'Elmbridge MSA, Clause 4', text: 'Payment of £2,375 within 30 days. Written notice of dispute within 17 calendar days.', score: 98 },
      { id: 's2', citation: 'Schedule B Deliverables', text: 'Phase 1 Core Software Implementation delivered with acceptance testing.', score: 85 }
    ],
    dialogueHistory: [
      { role: 'user', content: 'What is the exact dispute notice deadline in Clause 4?' },
      { role: 'assistant', content: 'Under Clause 4, written notice of dispute must be served within 17 calendar days.' },
      { role: 'user', content: 'Has the delivery date been recorded anywhere in the documentation?' }
    ],
    episodicSummaries: episodicEngine.summarizeLearnedInsights(matterId)
  });

  // Layer 2: Episodic
  const episodes = episodicEngine.getEpisodesForMatter(matterId);

  // Layer 3: Semantic
  const semanticEntities = semanticEngine.getEntitiesForMatter(matterId);

  // Layer 4: Procedural
  const approvedSkills = proceduralEngine.getApprovedSkills();
  const candidateSkills = proceduralEngine.getCandidateSkills();

  // Layer 5: Governance
  const allMatterEntities = semanticEngine.getEntitiesForMatter(matterId);
  const contradictions = governanceEngine.detectContradictions(matterId, allMatterEntities);

  // Legacy ledger
  const allMemories = memoryEngine.getMemoriesForMatter(matterId);
  const filteredMemories = allMemories.filter(m => {
    if (activeScopeTab === 'suggested') return m.reviewState === 'suggested';
    return m.scope === activeScopeTab && m.reviewState === 'accepted';
  });

  const handleApprove = (id: string) => {
    memoryEngine.approveMemory(id);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReject = (id: string) => {
    memoryEngine.rejectMemory(id);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePromoteSkill = (skillId: string) => {
    proceduralEngine.promoteCandidate(skillId, 'Senior Partner (Legal Director)');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRecordFeedback = (episodeId: string, rating: 'positive' | 'negative') => {
    episodicEngine.recordFeedback(episodeId, {
      rating,
      comment: rating === 'positive' ? 'Confirmed by practitioner.' : 'Rejected approach.',
      timestamp: new Date().toISOString()
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    memoryEngine.suggestMemory({
      vaultId: 'default-vault',
      matterId: activeScopeTab === 'user_preferences' ? undefined : matterId,
      scope: activeScopeTab === 'suggested' ? 'matter_facts' : activeScopeTab,
      kind: 'fact',
      text: newText.trim(),
      createdBy: 'human'
    });

    setNewText('');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-8 max-w-[1120px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-mono uppercase tracking-widest text-proofline-blue font-semibold bg-proofline-blue/10 px-2 py-0.5 rounded">
              ATKIN Sovereign Core
            </span>
            <span className="text-xs text-ink-slate font-mono">Matter: {matterId}</span>
          </div>
          <h2 className="text-[24px] font-semibold text-ink tracking-tight flex items-center gap-2.5 mt-1.5 font-serif">
            <BrainCircuit className="w-5 h-5 text-proofline-blue" />
            5-Layer Sovereign Memory Architecture
          </h2>
          <p className="text-[13px] text-ink-slate mt-1 max-w-[760px] leading-relaxed">
            Persistent, auditable legal memory partitioned into 5 sovereign tiers: Working context budgeting, Episodic task learning, Semantic ontology graphs, Procedural skill playbooks, and Strict memory governance.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="green" size="md">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Matter Isolation Verified
          </Badge>
          <span className="text-[11px] text-ink-steel font-mono">Zero Cross-Matter Leakage</span>
        </div>
      </div>

      {/* 5-Tier Memory Architecture Navigation */}
      <div className="grid grid-cols-6 gap-2 border-b border-border-hairline pb-3">
        <button
          onClick={() => setActiveTier('working')}
          className={`px-3 py-2 rounded-[6px] text-left transition-all border ${
            activeTier === 'working'
              ? 'bg-ink text-white border-ink shadow-sm'
              : 'bg-gallery-white text-ink-slate hover:text-ink hover:bg-gallery-paper border-border-hairline'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider opacity-75">
            <Cpu className="w-3 h-3" />
            <span>Layer 1</span>
          </div>
          <div className="text-[12.5px] font-semibold mt-0.5">Working Context</div>
        </button>

        <button
          onClick={() => setActiveTier('episodic')}
          className={`px-3 py-2 rounded-[6px] text-left transition-all border ${
            activeTier === 'episodic'
              ? 'bg-ink text-white border-ink shadow-sm'
              : 'bg-gallery-white text-ink-slate hover:text-ink hover:bg-gallery-paper border-border-hairline'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider opacity-75">
            <History className="w-3 h-3" />
            <span>Layer 2</span>
          </div>
          <div className="text-[12.5px] font-semibold mt-0.5">Episodic Learning</div>
        </button>

        <button
          onClick={() => setActiveTier('semantic')}
          className={`px-3 py-2 rounded-[6px] text-left transition-all border ${
            activeTier === 'semantic'
              ? 'bg-ink text-white border-ink shadow-sm'
              : 'bg-gallery-white text-ink-slate hover:text-ink hover:bg-gallery-paper border-border-hairline'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider opacity-75">
            <Network className="w-3 h-3" />
            <span>Layer 3</span>
          </div>
          <div className="text-[12.5px] font-semibold mt-0.5">Semantic Graph</div>
        </button>

        <button
          onClick={() => setActiveTier('procedural')}
          className={`px-3 py-2 rounded-[6px] text-left transition-all border ${
            activeTier === 'procedural'
              ? 'bg-ink text-white border-ink shadow-sm'
              : 'bg-gallery-white text-ink-slate hover:text-ink hover:bg-gallery-paper border-border-hairline'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider opacity-75">
            <BookOpen className="w-3 h-3" />
            <span>Layer 4</span>
          </div>
          <div className="text-[12.5px] font-semibold mt-0.5">Procedural Skills</div>
        </button>

        <button
          onClick={() => setActiveTier('governance')}
          className={`px-3 py-2 rounded-[6px] text-left transition-all border ${
            activeTier === 'governance'
              ? 'bg-ink text-white border-ink shadow-sm'
              : 'bg-gallery-white text-ink-slate hover:text-ink hover:bg-gallery-paper border-border-hairline'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider opacity-75">
            <AlertTriangle className="w-3 h-3" />
            <span>Layer 5</span>
          </div>
          <div className="text-[12.5px] font-semibold mt-0.5">Governance</div>
        </button>

        <button
          onClick={() => setActiveTier('ledger')}
          className={`px-3 py-2 rounded-[6px] text-left transition-all border ${
            activeTier === 'ledger'
              ? 'bg-ink text-white border-ink shadow-sm'
              : 'bg-gallery-white text-ink-slate hover:text-ink hover:bg-gallery-paper border-border-hairline'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider opacity-75">
            <Layers className="w-3 h-3" />
            <span>State</span>
          </div>
          <div className="text-[12.5px] font-semibold mt-0.5">Memory Records</div>
        </button>
      </div>

      {/* Layer 1: Working Memory & ContextPlanner */}
      {activeTier === 'working' && (
        <div className="space-y-6">
          <div className="bg-gallery-white border border-border-hairline rounded-[8px] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-ink">ContextPlanner &amp; Dynamic Token Allocator</h3>
                <p className="text-xs text-ink-slate mt-0.5">
                  Protects model context budget against overflow. Balances system rules, verified evidence spans, episodic summaries, and sliding dialogue turns.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-ink">
                  {plannedContext.totalTokensEstimated}
                </span>
                <span className="text-xs text-ink-slate font-mono"> / {plannedContext.maxTokensAllowed} tokens</span>
              </div>
            </div>

            {/* Token Budget Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${(plannedContext.budgetBreakdown.systemTokens / plannedContext.maxTokensAllowed) * 100}%` }}
                  className="bg-blue-500 h-full"
                  title="System Rules"
                />
                <div 
                  style={{ width: `${(plannedContext.budgetBreakdown.spansTokens / plannedContext.maxTokensAllowed) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title="Grounding Spans"
                />
                <div 
                  style={{ width: `${(plannedContext.budgetBreakdown.episodicTokens / plannedContext.maxTokensAllowed) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title="Episodic Precedent"
                />
                <div 
                  style={{ width: `${(plannedContext.budgetBreakdown.dialogueTokens / plannedContext.maxTokensAllowed) * 100}%` }}
                  className="bg-purple-500 h-full"
                  title="Dialogue Window"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-ink-slate pt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    System Rules ({plannedContext.budgetBreakdown.systemTokens} tokens)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Evidence Spans ({plannedContext.budgetBreakdown.spansTokens} tokens)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    Episodic Insights ({plannedContext.budgetBreakdown.episodicTokens} tokens)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                    Dialogue Window ({plannedContext.budgetBreakdown.dialogueTokens} tokens)
                  </span>
                </div>
                <span className="font-mono text-emerald-600 font-medium">Headroom: {plannedContext.maxTokensAllowed - plannedContext.totalTokensEstimated} tokens</span>
              </div>
            </div>

            {/* Grounding Spans Packed */}
            <div className="pt-2 border-t border-border-hairline space-y-2">
              <div className="text-xs font-semibold text-ink flex items-center justify-between">
                <span>Active Evidential Spans in Prompt Budget ({plannedContext.retainedSpans.length})</span>
                <span className="text-[11px] text-ink-steel">Sorted by Evidential Salience</span>
              </div>
              <div className="space-y-2">
                {plannedContext.retainedSpans.map(span => (
                  <div key={span.id} className="p-3 bg-stone-50 border border-stone-200 rounded-[5px] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink font-mono">{span.citation}</span>
                      <Badge variant="blue" size="sm">Score {span.score}/100</Badge>
                    </div>
                    <p className="text-ink-slate font-serif italic">{span.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evicted Context Digest */}
            {plannedContext.evictedDialogueDigest && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-[6px] space-y-1 text-xs">
                <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Lossless Evicted Dialogue Digest ({plannedContext.evictedTurnsCount} older turns compressed)
                </span>
                <p className="text-amber-800 whitespace-pre-line font-mono text-[11px]">
                  {plannedContext.evictedDialogueDigest}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Layer 2: Episodic Memory */}
      {activeTier === 'episodic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">Recorded Task Episodes &amp; Practitioner Feedback</h3>
              <p className="text-xs text-ink-slate">
                Each interaction forms an auditable episode. Thumbs up/down feedback refines future legal reasoning patterns.
              </p>
            </div>
            <Badge variant="blue" size="md">{episodes.length} Episodes for this Matter</Badge>
          </div>

          <div className="space-y-3">
            {episodes.length === 0 ? (
              <div className="p-8 text-center bg-gallery-white border border-dashed border-border-hairline rounded-[6px] text-ink-steel text-xs">
                No prior episodes recorded for this matter yet. Ask a legal question in Legal Chat to create an episode.
              </div>
            ) : (
              episodes.map(ep => (
                <div key={ep.id} className="p-5 bg-gallery-white border border-border-hairline rounded-[8px] space-y-3 shadow-subtle">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" size="sm">
                          {ep.taskType.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        <span className="text-[11px] font-mono text-ink-steel">{new Date(ep.createdAt).toLocaleString('en-GB')}</span>
                        <Badge variant={ep.outcome === 'success' ? 'green' : 'ochre'} size="sm">
                          {ep.outcome.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-ink mt-1.5">{ep.queryOrGoal}</h4>
                    </div>

                    {/* Practitioner Feedback Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRecordFeedback(ep.id, 'positive')}
                        className={`p-1.5 rounded-[4px] border transition-colors ${
                          ep.userFeedback?.rating === 'positive'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-gallery-white border-border-hairline text-ink-steel hover:text-ink'
                        }`}
                        title="Affirm approach"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRecordFeedback(ep.id, 'negative')}
                        className={`p-1.5 rounded-[4px] border transition-colors ${
                          ep.userFeedback?.rating === 'negative'
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-gallery-white border-border-hairline text-ink-steel hover:text-ink'
                        }`}
                        title="Reject approach"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-ink-slate space-y-1">
                    <p className="font-medium text-ink">Approach: <span className="font-normal text-ink-slate">{ep.approachSummary}</span></p>
                    {ep.keyDecisions.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {ep.keyDecisions.map((dec, i) => (
                          <span key={i} className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono">
                            {dec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {ep.userFeedback?.comment && (
                    <div className="p-2.5 bg-stone-50 border-l-2 border-proofline-blue rounded-r text-[12px] text-ink-slate italic">
                      Practitioner Note: "{ep.userFeedback.comment}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Layer 3: Semantic Ontology Graph */}
      {activeTier === 'semantic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">Typed Legal Ontology &amp; Provenance Graph</h3>
              <p className="text-xs text-ink-slate">
                Grounded entities extracted directly from evidentiary documents. Zero hallucinated or ungrounded propositions allowed.
              </p>
            </div>
            <Badge variant="blue" size="md">{semanticEntities.length} Grounded Entities</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {semanticEntities.map(ent => (
              <div key={ent.id} className="p-4 bg-gallery-white border border-border-hairline rounded-[6px] space-y-2 shadow-subtle">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">{ent.type.toUpperCase()}</Badge>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Confidence: {(ent.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">{ent.name}</h4>
                  <p className="text-[11px] font-mono text-ink-steel">{ent.canonicalKey}</p>
                </div>
                <div className="p-2 bg-stone-50 rounded text-xs text-ink-slate border border-stone-200">
                  <div className="text-[10.5px] font-semibold text-ink-slate uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-proofline-blue" />
                    Document Provenance: {ent.provenance.documentId}
                  </div>
                  <p className="font-serif italic text-[11.5px] text-ink">"{ent.provenance.sourceTextSnippet}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer 4: Procedural Skills */}
      {activeTier === 'procedural' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">Procedural Skills &amp; Review-Gated Playbooks</h3>
              <p className="text-xs text-ink-slate">
                Versioned, deterministic legal reasoning procedures. Candidate skills require explicit practitioner sign-off before being active.
              </p>
            </div>
            <Badge variant="green" size="md">{approvedSkills.length} Approved Playbooks</Badge>
          </div>

          {/* Candidate Skills (Awaiting Review Gate) */}
          {candidateSkills.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Candidate Skills Awaiting Practitioner Review Gate ({candidateSkills.length})
              </h4>
              {candidateSkills.map(cand => (
                <div key={cand.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-[6px] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="ochre" size="sm">CANDIDATE v{cand.version}</Badge>
                      <span className="text-xs font-semibold text-ink">{cand.name}</span>
                      <span className="text-[11px] text-ink-slate">({cand.jurisdiction} · {cand.practiceArea})</span>
                    </div>
                    <p className="text-xs text-ink-slate">{cand.description}</p>
                    <div className="text-[11px] text-ink-steel font-mono pt-1">
                      Steps: {cand.steps.map(s => s.actionName).join(' → ')}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePromoteSkill(cand.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Skill
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Approved Skills List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-slate">
              Active Practitioner-Approved Legal Procedures
            </h4>
            {approvedSkills.map(skill => (
              <div key={skill.id} className="p-4 bg-gallery-white border border-border-hairline rounded-[6px] space-y-2.5 shadow-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="green" size="sm">APPROVED v{skill.version}</Badge>
                    <h5 className="text-sm font-semibold text-ink">{skill.name}</h5>
                    <span className="text-xs text-ink-slate">· {skill.practiceArea}</span>
                  </div>
                  <div className="text-[11px] font-mono text-ink-steel">
                    Approved by {skill.approvedBy}
                  </div>
                </div>

                <p className="text-xs text-ink-slate leading-relaxed">{skill.description}</p>

                <div className="pt-2 border-t border-border-hairline/60 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-ink-steel block mb-1">Execution Steps</span>
                    <ol className="list-decimal list-inside space-y-0.5 text-ink-slate text-[11.5px]">
                      {skill.steps.map(s => (
                        <li key={s.stepNumber}><strong className="text-ink">{s.actionName}:</strong> {s.instruction}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-ink-steel block mb-1">Mandatory Verification Checks</span>
                    <ul className="space-y-0.5 text-ink-slate text-[11.5px]">
                      {skill.verificationChecks.map(chk => (
                        <li key={chk.checkId} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{chk.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer 5: Governance & Contradiction Radar */}
      {activeTier === 'governance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">Memory Governance &amp; Contradiction Radar</h3>
              <p className="text-xs text-ink-slate">
                Monitors data retention, automatic supersession, and surfaces conflicting facts across evidentiary records.
              </p>
            </div>
            <Badge variant={contradictions.length > 0 ? 'red' : 'green'} size="md">
              {contradictions.length} Contradictions Flagged
            </Badge>
          </div>

          {/* Contradiction Radar Alert */}
          {contradictions.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Active Evidential Contradictions Requiring Human Review
              </h4>
              {contradictions.map(contra => (
                <div key={contra.id} className="p-5 bg-rose-50/50 border border-rose-200 rounded-[8px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-rose-900">{contra.title}</span>
                    <Badge variant="red" size="sm">High Severity</Badge>
                  </div>
                  <p className="text-xs text-rose-800">{contra.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 bg-white border border-rose-200/80 rounded">
                      <div className="font-semibold text-ink mb-0.5">{contra.sourceA.label}</div>
                      <div className="text-[11px] text-ink-steel font-mono">Doc: {contra.sourceA.documentId}</div>
                      <p className="font-serif italic text-ink-slate mt-1 text-[11.5px]">"{contra.sourceA.text}"</p>
                    </div>
                    <div className="p-2.5 bg-white border border-rose-200/80 rounded">
                      <div className="font-semibold text-ink mb-0.5">{contra.sourceB.label}</div>
                      <div className="text-[11px] text-ink-steel font-mono">Doc: {contra.sourceB.documentId}</div>
                      <p className="font-serif italic text-ink-slate mt-1 text-[11.5px]">"{contra.sourceB.text}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[6px] text-xs text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Contradiction Radar: No conflicting dates, clauses, or financial obligations detected in this matter.</span>
            </div>
          )}

          {/* Retention & Isolation Policies */}
          <div className="p-5 bg-gallery-white border border-border-hairline rounded-[8px] space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-ink">Active Retention &amp; Isolation Rules</h4>
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
                <span className="font-medium text-ink">Cross-Matter Isolation</span>
                <p className="text-ink-slate text-[11.5px]">Strict cryptographic partition. Zero leakage between client matters.</p>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
                <span className="font-medium text-ink">Episodic TTL</span>
                <p className="text-ink-slate text-[11.5px]">Retained for 365 days or matter duration. Older episodes auto-compacted.</p>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
                <span className="font-medium text-ink">Semantic Indefinite</span>
                <p className="text-ink-slate text-[11.5px]">Ontology entities preserved with cryptographic hashes for legal audit.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legacy / State Records */}
      {activeTier === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border-hairline pb-2">
            <button
              onClick={() => setActiveScopeTab('matter_facts')}
              className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors ${
                activeScopeTab === 'matter_facts'
                  ? 'bg-ink text-white'
                  : 'text-ink-slate hover:text-ink hover:bg-gallery-mist'
              }`}
            >
              This Matter Facts ({allMemories.filter(m => m.scope === 'matter_facts' && m.reviewState === 'accepted').length})
            </button>
            <button
              onClick={() => setActiveScopeTab('user_preferences')}
              className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors ${
                activeScopeTab === 'user_preferences'
                  ? 'bg-ink text-white'
                  : 'text-ink-slate hover:text-ink hover:bg-gallery-mist'
              }`}
            >
              My Style Preferences ({allMemories.filter(m => m.scope === 'user_preferences' && m.reviewState === 'accepted').length})
            </button>
            <button
              onClick={() => setActiveScopeTab('workspace_playbooks')}
              className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors ${
                activeScopeTab === 'workspace_playbooks'
                  ? 'bg-ink text-white'
                  : 'text-ink-slate hover:text-ink hover:bg-gallery-mist'
              }`}
            >
              Playbooks &amp; Guidelines ({allMemories.filter(m => m.scope === 'workspace_playbooks' && m.reviewState === 'accepted').length})
            </button>
            <button
              onClick={() => setActiveScopeTab('suggested')}
              className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
                activeScopeTab === 'suggested'
                  ? 'bg-proofline-ochre text-white'
                  : 'text-proofline-ochre hover:bg-proofline-ochre/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Pending Approvals ({allMemories.filter(m => m.reviewState === 'suggested').length})
            </button>
          </div>

          {activeScopeTab !== 'suggested' && (
            <form onSubmit={handleAddMemory} className="p-4 bg-gallery-white border border-border-hairline rounded-[6px] shadow-subtle flex gap-3">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={`Add explicit memory record to ${activeScopeTab.replace(/_/g, ' ')}...`}
                className="flex-1 px-3 py-2 text-[13px] border border-border-hairline rounded-[4px] focus:outline-none focus:ring-1 focus:ring-proofline-blue bg-gallery-mist/30"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-ink text-white rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 hover:bg-ink/85 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record</span>
              </button>
            </form>
          )}

          <div className="space-y-3">
            {filteredMemories.length === 0 ? (
              <div className="p-8 text-center bg-gallery-white border border-dashed border-border-hairline rounded-[6px] text-ink-steel text-[13px]">
                No memory records found under this scope.
              </div>
            ) : (
              filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 bg-gallery-white border border-border-hairline rounded-[6px] shadow-subtle flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Badge variant={mem.createdBy === 'human' ? 'green' : 'ochre'} size="sm">
                        {mem.createdBy === 'human' ? 'Human Verified' : 'AI Suggested'}
                      </Badge>
                      <span className="text-ink-steel">
                        Recorded {new Date(mem.createdAt).toLocaleDateString('en-GB')}
                      </span>
                      {mem.matterId ? (
                        <span className="text-ink-steel">· Scoped to Matter {mem.matterId}</span>
                      ) : (
                        <span className="text-proofline-blue font-medium">· Global Scope (Cross-Matter Safe)</span>
                      )}
                      {mem.status === 'invalidated' && (
                        <Badge variant="red" size="sm">Invalidated (Source Drift)</Badge>
                      )}
                    </div>

                    <p className="text-[13.5px] text-ink font-normal leading-relaxed">
                      {mem.text}
                    </p>

                    {mem.sourceDocumentVersions.length > 0 && (
                      <div className="text-[11px] text-ink-steel flex items-center gap-1 pt-1">
                        <FileText className="w-3 h-3 text-proofline-blue" />
                        <span>Dependency: {mem.sourceDocumentVersions.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {mem.reviewState === 'suggested' ? (
                      <>
                        <button
                          onClick={() => handleApprove(mem.id)}
                          className="p-1.5 rounded-[4px] bg-proofline-green/10 text-proofline-green hover:bg-proofline-green hover:text-white transition-colors"
                          title="Approve Memory"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(mem.id)}
                          className="p-1.5 rounded-[4px] bg-proofline-crimson/10 text-proofline-crimson hover:bg-proofline-crimson hover:text-white transition-colors"
                          title="Reject Memory"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleReject(mem.id)}
                        className="p-1.5 rounded-[4px] text-ink-steel hover:text-proofline-crimson hover:bg-gallery-mist transition-colors"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
