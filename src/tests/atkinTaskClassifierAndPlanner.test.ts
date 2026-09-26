import { describe, it, expect } from 'vitest';
import { taskClassifier } from '../runtime/classifier/taskClassifier.ts';
import { contextPlanner } from '../runtime/context/contextPlanner.ts';
import type { Matter, Document, Span, MemoryRecord } from '../types/index.ts';

describe('ATKIN Task Classifier & Context Planner (Sections 8, 9, 27)', () => {
  const mockMatter: Matter = {
    id: 'matter-alder-peak',
    title: 'Alder Peak Systems Ltd v Highfield Logistics Group Ltd',
    jurisdiction: 'England and Wales',
    clientAlias: 'Highfield Logistics Group Ltd',
    status: 'active',
    workspaceType: 'demo',
    isDemo: true,
    createdAt: '2026-04-12T00:00:00Z',
    updatedAt: '2026-04-12T00:00:00Z'
  };

  describe('Task Classifier', () => {
    it('classifies procedural deadline calculations with deterministic tool requirements', () => {
      const result = taskClassifier.classify('Calculate the statutory deadline under CPR 2.8 clear days.');
      expect(result.taskType).toBe('calculation');
      expect(result.toolRequirement).toContain('TimeRuleEngine');
      expect(result.networkRequirement).toBe('offline_mandatory');
      expect(result.approvalRequirement).toBe('none');
    });

    it('classifies factual inconsistency inquiries as comparison', () => {
      const result = taskClassifier.classify('ATKIN, find every inconsistency between these witness statements and invoices.');
      expect(result.taskType).toBe('comparison');
      expect(result.toolRequirement).toContain('ContradictionEngine');
      expect(result.networkRequirement).toBe('offline_mandatory');
    });

    it('classifies primary law inquiry as legal_research', () => {
      const result = taskClassifier.classify('Research whether this limitation clause could be unenforceable under UCTA 1977.');
      expect(result.taskType).toBe('legal_research');
      expect(result.toolRequirement).toContain('LegalAuthorityEngine');
    });

    it('classifies client drafting requests as drafting with structured output requirement', () => {
      const result = taskClassifier.classify('Draft advice to the client regarding the termination notice.');
      expect(result.taskType).toBe('drafting');
      expect(result.requiredCapabilities.structuredOutput).toBe(true);
      expect(result.approvalRequirement).toBe('recommended');
    });

    it('classifies external communications as external_action with mandatory human approval', () => {
      const result = taskClassifier.classify('Email the final draft advice to Sarah.');
      expect(result.taskType).toBe('external_action');
      expect(result.networkRequirement).toBe('internet_required');
      expect(result.approvalRequirement).toBe('mandatory');
    });
  });

  describe('Context Planner & Memory Isolation', () => {
    const mockMemories: MemoryRecord[] = [
      {
        id: 'mem-matter-01',
        vaultId: 'vault-01',
        matterId: 'matter-alder-peak',
        scope: 'matter_facts',
        kind: 'fact',
        text: 'Supplier operates out of Newcastle upon Tyne.',
        sourceDocumentVersions: [],
        sourceSpanIds: [],
        sourceMessageIds: [],
        createdBy: 'human',
        createdAt: new Date().toISOString(),
        reviewState: 'accepted',
        status: 'active',
        dependencyIds: []
      },
      {
        id: 'mem-foreign-matter',
        vaultId: 'vault-01',
        matterId: 'matter-foreign-002',
        scope: 'matter_facts',
        kind: 'fact',
        text: 'Settlement figure in unrelated case was £50,000.',
        sourceDocumentVersions: [],
        sourceSpanIds: [],
        sourceMessageIds: [],
        createdBy: 'human',
        createdAt: new Date().toISOString(),
        reviewState: 'accepted',
        status: 'active',
        dependencyIds: []
      },
      {
        id: 'mem-practice-pref',
        vaultId: 'vault-01',
        scope: 'user_preferences',
        kind: 'preference',
        text: 'Firm prefers concise numbered advisory bullets.',
        sourceDocumentVersions: [],
        sourceSpanIds: [],
        sourceMessageIds: [],
        createdBy: 'human',
        createdAt: new Date().toISOString(),
        reviewState: 'accepted',
        status: 'active',
        dependencyIds: []
      }
    ];

    it('enforces STRICT_MATTER_ONLY: strictly isolates matter memories and excludes other matters', () => {
      const plan = contextPlanner.planContext({
        userQuery: 'What is the supplier location?',
        matter: mockMatter,
        sources: [],
        spans: [],
        memories: mockMemories,
        memoryMode: 'STRICT_MATTER_ONLY'
      });

      expect(plan.memoryMode).toBe('STRICT_MATTER_ONLY');
      expect(plan.semanticMemories.some(m => m.id === 'mem-matter-01')).toBe(true);
      expect(plan.semanticMemories.some(m => m.id === 'mem-foreign-matter')).toBe(false);
      expect(plan.semanticMemories.some(m => m.id === 'mem-practice-pref')).toBe(false);
    });

    it('enforces PRACTICE_PLUS_MATTER: allows global practice preferences alongside matter memories', () => {
      const plan = contextPlanner.planContext({
        userQuery: 'Draft a summary note.',
        matter: mockMatter,
        sources: [],
        spans: [],
        memories: mockMemories,
        memoryMode: 'PRACTICE_PLUS_MATTER'
      });

      expect(plan.memoryMode).toBe('PRACTICE_PLUS_MATTER');
      expect(plan.semanticMemories.some(m => m.id === 'mem-matter-01')).toBe(true);
      expect(plan.semanticMemories.some(m => m.id === 'mem-practice-pref')).toBe(true);
    });

    it('enforces TEMPORARY: excludes all persistent semantic memories for zero leakage', () => {
      const plan = contextPlanner.planContext({
        userQuery: 'Quick sensitive question',
        matter: mockMatter,
        sources: [],
        spans: [],
        memories: mockMemories,
        memoryMode: 'TEMPORARY'
      });

      expect(plan.memoryMode).toBe('TEMPORARY');
      expect(plan.semanticMemories).toHaveLength(0);
      expect(plan.episodes).toHaveLength(0);
    });

    it('attaches matched LegalSkill instructions to assembled system prompt', () => {
      const plan = contextPlanner.planContext({
        userQuery: 'Prepare a commercial contract review for this agreement.',
        matter: mockMatter,
        sources: [],
        spans: [],
        memories: [],
        memoryMode: 'STRICT_MATTER_ONLY'
      });

      expect(plan.activeSkills.length).toBeGreaterThan(0);
      expect(plan.activeSkills[0].id).toBe('contract-review');
      expect(plan.assembledSystemPrompt).toContain('Active Legal Skill: Commercial Contract Review');
    });
  });
});
