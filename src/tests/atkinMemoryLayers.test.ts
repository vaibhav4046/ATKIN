import { describe, it, expect, beforeEach } from 'vitest';
import {
  ContextPlanner,
  estimateTokens,
  EpisodicMemoryEngine,
  SemanticMemoryEngine,
  ProceduralMemoryEngine,
  MemoryGovernance,
  MemoryIsolationError,
  type TaskEpisode,
  type LegalEntity,
} from '../engine/memory/index.ts';

describe('ATKIN 5-Layer Memory Architecture', () => {
  const MATTER_A = 'matter-bates-post-office';
  const MATTER_B = 'matter-riverglass-contract';

  describe('Layer 1: Working Memory & ContextPlanner', () => {
    it('estimates tokens accurately using legal text heuristics', () => {
      const shortText = 'Clause 4: The Customer must notify within 17 days.';
      const tokens = estimateTokens(shortText);
      expect(tokens).toBeGreaterThan(5);
      expect(tokens).toBeLessThan(25);
    });

    it('enforces token budget limits and preserves highest-scoring spans first', () => {
      const planner = new ContextPlanner({
        maxContextTokens: 200,
        systemReservePercent: 0.20, // 40 tokens
        spansReservePercent: 0.50,  // 100 tokens
        dialogueReservePercent: 0.30 // 60 tokens
      });

      const spans = [
        { id: 's1', citation: 'Doc 1, p.1', text: 'Low score background fact that is very long and has lots of words to consume tokens', score: 5 },
        { id: 's2', citation: 'Doc 2, Clause 4', text: 'Dispute notice window is 17 days.', score: 95 },
        { id: 's3', citation: 'Doc 2, Clause 12', text: 'Invoice sum of £2,375 due upon delivery.', score: 85 }
      ];

      const result = planner.planContext({
        systemPrompt: 'You are ATKIN sovereign legal counsel.',
        evidenceSpans: spans,
        dialogueHistory: [
          { role: 'user', content: 'What is the dispute notice deadline?' }
        ]
      });

      expect(result.totalTokensEstimated).toBeLessThanOrEqual(200);
      // High score spans (s2, s3) should be retained
      expect(result.retainedSpans.some(s => s.id === 's2')).toBe(true);
      expect(result.retainedSpans.some(s => s.id === 's3')).toBe(true);
    });

    it('evicts older dialogue turns and synthesizes a running digest', () => {
      const planner = new ContextPlanner({
        maxContextTokens: 150,
        systemReservePercent: 0.15,
        spansReservePercent: 0.60,
        dialogueReservePercent: 0.25 // ~37 tokens
      });

      const longDialogue = [
        { role: 'user' as const, content: 'First message regarding Elmbridge MSA dated January 2026.' },
        { role: 'assistant' as const, content: 'Understood. Reviewing Elmbridge MSA.' },
        { role: 'user' as const, content: 'Second message concerning Riverglass Software invoices.' },
        { role: 'assistant' as const, content: 'Found two invoices totaling £2,375.' },
        { role: 'user' as const, content: 'Third message: What is the exact deadline in Clause 4?' }
      ];

      const result = planner.planContext({
        systemPrompt: 'ATKIN legal AI',
        evidenceSpans: [],
        dialogueHistory: longDialogue
      });

      expect(result.evictedTurnsCount).toBeGreaterThan(0);
      expect(result.evictedDialogueDigest).toBeDefined();
      expect(result.evictedDialogueDigest).toContain('Prior Turn Summary');
      // Most recent user query must be retained
      expect(result.retainedDialogue.some(m => m.content.includes('Third message'))).toBe(true);
    });
  });

  describe('Layer 2: Episodic Memory', () => {
    let episodic: EpisodicMemoryEngine;

    beforeEach(() => {
      episodic = new EpisodicMemoryEngine();
    });

    it('records task episodes and retrieves them by matter ID', () => {
      const ep = episodic.recordEpisode({
        matterId: MATTER_B,
        taskType: 'clause_qa',
        queryOrGoal: 'Quote clause 4 and verify 17-day deadline',
        approachSummary: 'Located Clause 4, verified 17-day written dispute window.',
        keyDecisions: ['Direct quotation of Clause 4', 'Flagged lack of delivery date'],
        spansReferenced: ['span-msa-cl4'],
        authoritiesReferenced: [],
        outcome: 'success',
        tokensUsed: 140
      });

      expect(ep.id).toMatch(/^ep-/);
      const episodes = episodic.getEpisodesForMatter(MATTER_B);
      expect(episodes.length).toBe(1);
      expect(episodes[0].keyDecisions).toContain('Direct quotation of Clause 4');
    });

    it('records lawyer feedback and updates outcome and recall scoring', () => {
      const ep = episodic.recordEpisode({
        matterId: MATTER_B,
        taskType: 'risk_audit',
        queryOrGoal: 'Audit indemnity clause',
        approachSummary: 'Proposed broad uncapped indemnity disclaimer.',
        keyDecisions: ['Added UCTA disclaimer'],
        spansReferenced: ['span-indemnity'],
        authoritiesReferenced: ['UCTA 1977'],
        outcome: 'success',
        tokensUsed: 210
      });

      // Practitioner gives negative feedback
      episodic.recordFeedback(ep.id, {
        rating: 'negative',
        comment: 'Do not introduce irrelevant UCTA boilerplate for simple payment clauses.',
        timestamp: new Date().toISOString()
      });

      const updated = episodic.getEpisodeById(ep.id);
      expect(updated?.outcome).toBe('rejected_by_lawyer');

      const insights = episodic.summarizeLearnedInsights(MATTER_B);
      expect(insights.some(i => i.includes('Do not introduce irrelevant UCTA boilerplate'))).toBe(true);
    });

    it('prioritizes positively rated episodes during recall', () => {
      const ep1 = episodic.recordEpisode({
        matterId: MATTER_B,
        taskType: 'clause_qa',
        queryOrGoal: 'Check payment terms and dispute timeline',
        approachSummary: 'Concise 2-sentence factual breakdown.',
        keyDecisions: ['No boilerplate'],
        spansReferenced: ['span-1'],
        authoritiesReferenced: [],
        outcome: 'success',
        tokensUsed: 80
      });
      episodic.recordFeedback(ep1.id, {
        rating: 'positive',
        comment: 'Excellent concise format.',
        timestamp: new Date().toISOString()
      });

      episodic.recordEpisode({
        matterId: MATTER_B,
        taskType: 'clause_qa',
        queryOrGoal: 'Check payment terms and dispute timeline',
        approachSummary: 'Verbose multi-page disquisition.',
        keyDecisions: ['Added theoretical analysis'],
        spansReferenced: ['span-2'],
        authoritiesReferenced: [],
        outcome: 'rejected_by_lawyer',
        tokensUsed: 400
      });

      const recalled = episodic.recallRelevantEpisodes(MATTER_B, 'payment terms dispute timeline', 'clause_qa', 1);
      expect(recalled.length).toBe(1);
      expect(recalled[0].id).toBe(ep1.id);
    });
  });

  describe('Layer 3: Semantic Memory (Ontology Graph)', () => {
    let semantic: SemanticMemoryEngine;

    beforeEach(() => {
      semantic = new SemanticMemoryEngine();
    });

    it('enforces strict document provenance for legal entities', () => {
      // Valid entity with provenance
      const party = semantic.addEntity({
        matterId: MATTER_B,
        type: 'party',
        name: 'Riverglass Software Ltd',
        canonicalKey: 'party:riverglass_software_ltd',
        properties: { role: 'Supplier', companyNumber: '11223344' },
        provenance: {
          documentId: 'doc-msa-2026',
          sourceTextSnippet: 'between Elmbridge Borough Council and Riverglass Software Ltd',
          charOffset: [0, 60]
        },
        confidence: 1.0
      });

      expect(party.id).toMatch(/^ent-/);
      expect(semantic.verifyGrounding(party.id)).toBe(true);

      // Ungrounded entity must be rejected
      expect(() => {
        semantic.addEntity({
          matterId: MATTER_B,
          type: 'party',
          name: 'Fabricated Entity Corp',
          canonicalKey: 'party:fabricated',
          properties: {},
          provenance: {
            documentId: '',
            sourceTextSnippet: ''
          },
          confidence: 0.1
        });
      }).toThrow(/Ungrounded entity rejected/);
    });

    it('connects entities via typed relations and retrieves graph neighborhoods', () => {
      const party = semantic.addEntity({
        matterId: MATTER_B,
        type: 'party',
        name: 'Riverglass Software Ltd',
        canonicalKey: 'party:riverglass',
        properties: {},
        provenance: { documentId: 'doc-1', sourceTextSnippet: 'Riverglass Software Ltd' },
        confidence: 1.0
      });

      const clause = semantic.addEntity({
        matterId: MATTER_B,
        type: 'clause',
        name: 'Clause 4 Dispute Window',
        canonicalKey: 'clause:elmbridge_msa_cl4',
        properties: { days: 17 },
        provenance: { documentId: 'doc-1', sourceTextSnippet: 'Clause 4: 17 days dispute window' },
        confidence: 1.0
      });

      const rel = semantic.addRelation({
        matterId: MATTER_B,
        sourceEntityId: clause.id,
        targetEntityId: party.id,
        relationType: 'binds',
        details: 'Clause 4 binds Riverglass to receive disputes within 17 days.',
        provenance: { documentId: 'doc-1', sourceTextSnippet: 'Clause 4: Dispute Notice' }
      });

      expect(rel.id).toMatch(/^rel-/);
      const neighbors = semantic.getNeighbors(clause.id);
      expect(neighbors.length).toBe(1);
      expect(neighbors[0].targetEntity.name).toBe('Riverglass Software Ltd');
      expect(neighbors[0].relation.relationType).toBe('binds');
    });
  });

  describe('Layer 4: Procedural Memory', () => {
    let procedural: ProceduralMemoryEngine;

    beforeEach(() => {
      procedural = new ProceduralMemoryEngine();
    });

    it('contains built-in approved procedural skills', () => {
      const approved = procedural.getApprovedSkills();
      expect(approved.length).toBeGreaterThanOrEqual(4);
      expect(approved.some(s => s.id === 'skill-cpr16-particulars')).toBe(true);
      expect(approved.some(s => s.id === 'skill-commercial-notice-limitation')).toBe(true);
    });

    it('enforces practitioner review gate before candidate skill promotion', () => {
      const candidate = procedural.registerCandidateSkill({
        name: 'Automated Insolvency Demand Check',
        version: 1,
        description: 'Assesses 21-day statutory demand under Insolvency Act 1986.',
        jurisdiction: 'England and Wales',
        practiceArea: 'Insolvency',
        triggerPatterns: ['statutory demand', 'insolvency act'],
        requiredInputs: ['debt_amount', 'demand_served_date'],
        steps: [
          { stepNumber: 1, actionName: 'Check Threshold', instruction: 'Ensure debt exceeds £5,000 for bankruptcy or £750 for corporate.', expectedOutput: 'Threshold check result' }
        ],
        verificationChecks: [
          { checkId: 'chk-threshold', description: 'Statutory debt minimum verified', mandatory: true }
        ],
        reviewGateRequired: true
      });

      expect(candidate.status).toBe('candidate');

      // Candidate cannot be returned when searching approved skills
      const matchedApproved = procedural.matchSkills('statutory demand under insolvency act', 'England and Wales', true);
      expect(matchedApproved.some(s => s.id === candidate.id)).toBe(false);

      // Practitioner signs off on candidate
      const promoted = procedural.promoteCandidate(candidate.id, 'Partner Jane Doe, QC');
      expect(promoted).toBe(true);

      const updated = procedural.getSkillById(candidate.id);
      expect(updated?.status).toBe('approved');
      expect(updated?.approvedBy).toBe('Partner Jane Doe, QC');

      // Now it matches approved queries
      const matchedAfterPromotion = procedural.matchSkills('statutory demand under insolvency act', 'England and Wales', true);
      expect(matchedAfterPromotion.some(s => s.id === candidate.id)).toBe(true);
    });
  });

  describe('Layer 5: Memory Governance & Cross-Matter Isolation', () => {
    let governance: MemoryGovernance;

    beforeEach(() => {
      governance = new MemoryGovernance({
        episodicTtlDays: 30,
        maxEpisodesPerMatter: 2
      });
    });

    it('blocks cross-matter access attempts with MemoryIsolationError', () => {
      // Matter A trying to access Matter B record
      expect(() => {
        governance.assertMatterAccess(MATTER_A, MATTER_B, 'matter_facts');
      }).toThrow(MemoryIsolationError);

      // Same matter allowed
      expect(() => {
        governance.assertMatterAccess(MATTER_A, MATTER_A, 'matter_facts');
      }).not.toThrow();

      // Global user preferences allowed
      expect(() => {
        governance.assertMatterAccess(MATTER_A, undefined, 'user_preferences');
      }).not.toThrow();
    });

    it('purges episodes older than retention TTL window', () => {
      const now = new Date('2026-10-01T00:00:00.000Z');
      const episodes: TaskEpisode[] = [
        {
          id: 'ep-fresh',
          matterId: MATTER_A,
          taskType: 'clause_qa',
          queryOrGoal: 'Fresh goal',
          approachSummary: 'Recent',
          keyDecisions: [],
          spansReferenced: [],
          authoritiesReferenced: [],
          outcome: 'success',
          tokensUsed: 100,
          createdAt: '2026-09-20T00:00:00.000Z' // 11 days old (retained)
        },
        {
          id: 'ep-stale',
          matterId: MATTER_A,
          taskType: 'clause_qa',
          queryOrGoal: 'Stale goal',
          approachSummary: 'Old',
          keyDecisions: [],
          spansReferenced: [],
          authoritiesReferenced: [],
          outcome: 'success',
          tokensUsed: 100,
          createdAt: '2026-08-01T00:00:00.000Z' // 61 days old (purged)
        }
      ];

      const { retained, purgedCount } = governance.purgeExpiredEpisodes(episodes, now);
      expect(purgedCount).toBe(1);
      expect(retained.length).toBe(1);
      expect(retained[0].id).toBe('ep-fresh');
    });

    it('compacts older episodes into a milestone summary when exceeding threshold', () => {
      const episodes: TaskEpisode[] = [
        {
          id: 'ep-1',
          matterId: MATTER_A,
          taskType: 'clause_qa',
          queryOrGoal: 'Episode 1',
          approachSummary: 'Approach 1',
          keyDecisions: ['Decision 1'],
          spansReferenced: ['span-1'],
          authoritiesReferenced: [],
          outcome: 'success',
          tokensUsed: 50,
          createdAt: '2026-09-01T00:00:00.000Z'
        },
        {
          id: 'ep-2',
          matterId: MATTER_A,
          taskType: 'clause_qa',
          queryOrGoal: 'Episode 2',
          approachSummary: 'Approach 2',
          keyDecisions: ['Decision 2'],
          spansReferenced: ['span-2'],
          authoritiesReferenced: [],
          outcome: 'success',
          tokensUsed: 50,
          createdAt: '2026-09-02T00:00:00.000Z'
        },
        {
          id: 'ep-3',
          matterId: MATTER_A,
          taskType: 'clause_qa',
          queryOrGoal: 'Episode 3',
          approachSummary: 'Approach 3',
          keyDecisions: ['Decision 3'],
          spansReferenced: ['span-3'],
          authoritiesReferenced: [],
          outcome: 'success',
          tokensUsed: 50,
          createdAt: '2026-09-03T00:00:00.000Z'
        }
      ];

      // Threshold is 2 episodes max
      const { activeEpisodes, compactedSummary } = governance.compactEpisodes(MATTER_A, episodes);
      expect(compactedSummary).toBeDefined();
      expect(compactedSummary?.keyDecisions).toContain('Decision 1');
      // activeEpisodes should contain compactedSummary + 2 latest
      expect(activeEpisodes.length).toBe(3);
    });

    it('detects factual contradictions in deadlines and financial sums across documents', () => {
      const entities: LegalEntity[] = [
        {
          id: 'ent-d1',
          matterId: MATTER_B,
          type: 'deadline',
          name: 'Dispute Notice Window (Doc A)',
          canonicalKey: 'deadline:dispute_notice',
          properties: { days: 17 },
          provenance: { documentId: 'doc-contract-original', sourceTextSnippet: '17 calendar days' },
          confidence: 1.0,
          createdAt: '2026-09-01T00:00:00.000Z'
        },
        {
          id: 'ent-d2',
          matterId: MATTER_B,
          type: 'deadline',
          name: 'Dispute Notice Window (Doc B)',
          canonicalKey: 'deadline:dispute_notice',
          properties: { days: 14 },
          provenance: { documentId: 'doc-dispute-letter', sourceTextSnippet: '14 calendar days' },
          confidence: 1.0,
          createdAt: '2026-09-10T00:00:00.000Z'
        }
      ];

      const contradictions = governance.detectContradictions(MATTER_B, entities);
      expect(contradictions.length).toBe(1);
      expect(contradictions[0].severity).toBe('high');
      expect(contradictions[0].description).toContain('17 days');
      expect(contradictions[0].description).toContain('14 days');
    });
  });
});
