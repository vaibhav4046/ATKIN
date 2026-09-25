import { describe, it, expect } from 'vitest';
import { QualificationSuite } from '../engine/model/qualificationSuite.ts';
import { DeterministicOfflineAdapter, LocalGemmaAdapter } from '../engine/model/modelAdapter.ts';
import { localSpeechEngine } from '../engine/media/localSpeechEngine.ts';
import { deepResearchMachine } from '../engine/research/deepResearchMachine.ts';
import { StrategyLabEngine } from '../engine/strategy/strategyLabEngine.ts';
import { corpusTracker } from '../engine/adaptation/corpusTracker.ts';
import { conflictCheckEngine } from '../engine/conflicts/conflictCheckEngine.ts';
import { benchmarkHarness } from '../engine/benchmark/benchmarkHarness.ts';
import { memoryEngine } from '../engine/memory/memoryEngine.ts';
import type { Matter, Document, Claim, ReviewItem } from '../types/index.ts';

describe('Production Slices (Slices 1 to 7 Verification)', () => {
  // Slice 1: State Ledger & 6 Classes
  describe('Slice 1: 6-Class State Ledger & Temporal Provenance', () => {
    it('classifies state across 6 sovereign classes and enforces scoped recall', () => {
      const records = memoryEngine.getMemoriesByStateClass('user_preferences');
      expect(records.length).toBeGreaterThan(0);
      expect(records[0].scope).toBe('user_preferences');

      // Verify backup/restore
      const exported = memoryEngine.exportStateLedger();
      expect(exported).toContain('version');
      expect(memoryEngine.importStateLedger(exported)).toBe(true);
    });
  });

  // Slice 2: Model Portability & 6 Contracts
  describe('Slice 2: Model Portability & 7-Point Qualification Suite', () => {
    it('runs 7-point qualification check and verifies all rules on deterministic adapter', async () => {
      const adapter = new DeterministicOfflineAdapter();
      const report = await QualificationSuite.runQualification(
        'deterministic-sovereign',
        (packet, policy) => adapter.generate(packet, policy)
      );

      expect(report.totalChecks).toBe(7);
      expect(report.passedCount).toBe(7);
      expect(report.overallPassed).toBe(true);
      expect(report.checks.map(c => c.ruleName)).toEqual([
        'Source-ID Preservation',
        'Exact Quotation Fidelity',
        'Conflicting Fact Identification',
        'Missing Evidence Abstention (arXiv:2411.06037)',
        'Structured Extraction Compliance',
        'Tool-Call Boundary Denial',
        'Cross-Matter Memory Isolation'
      ]);
    });

    it('abstains explicitly when required evidence is missing', async () => {
      const adapter = new DeterministicOfflineAdapter();
      const result = await adapter.generate({
        matterId: 'consumer-empty',
        documentVersionIds: [],
        literalSpans: [],
        provenanceHierarchy: [],
        keyDates: [],
        contraryEvidence: [],
        identifiedGaps: ['Missing invoice', 'Missing serial number'],
        prompt: 'Confirm statutory liability'
      }, {
        permittedTools: [],
        tokenBudget: 256,
        requiresSolicitorReview: true,
        networkMode: 'offline',
        allowedSourceScopes: [],
        abstentionPermitted: true
      });

      expect(result.abstained).toBe(true);
      expect(result.abstentionReason).toContain('Missing invoice');
      expect(result.draftBlocks.length).toBe(0);
    });
  });

  // Slice 3: First-Class Local Voice & Audio
  describe('Slice 3: First-Class Local Voice Engine', () => {
    it('calculates SRA 6-minute billing units accurately', () => {
      expect(localSpeechEngine.calculateBillingUnits(0)).toBe(0);
      expect(localSpeechEngine.calculateBillingUnits(180)).toBe(1); // 3 mins -> 1 unit
      expect(localSpeechEngine.calculateBillingUnits(360)).toBe(1); // 6 mins -> 1 unit
      expect(localSpeechEngine.calculateBillingUnits(361)).toBe(2); // 6 mins 1 sec -> 2 units
      expect(localSpeechEngine.calculateBillingUnits(720)).toBe(2); // 12 mins -> 2 units
    });

    it('prepares text for offline TTS with Latin legal pronunciation phonetics', () => {
      const text = 'The court noted prima facie evidence and considered inter alia the statutory terms.';
      const prepared = localSpeechEngine.prepareTextForTTS(text);
      expect(prepared).toContain('prima facie (PRY-muh FAY-shee)');
      expect(prepared).toContain('inter alia (IN-ter AY-lee-uh)');
    });

    it('processes offline audio with consent and returns editable transcript', async () => {
      const result = await localSpeechEngine.processOfflineAudio({
        matterId: 'matter-test-1',
        audioBlob: new ArrayBuffer(1024),
        clientConsentRecorded: true
      });

      expect(result.clientConsentRecorded).toBe(true);
      expect(result.audioSha256).toContain('sha256-audio');
      expect(result.words.length).toBeGreaterThan(0);

      // Verify transcript editing
      const updated = localSpeechEngine.updateTranscript(result, 'Amended verified transcript text.');
      expect(updated.fullText).toBe('Amended verified transcript text.');
      expect(updated.words[0].confidence).toBe(1.0);
    });
  });

  // Slice 4: Deep Research State Machine & Strategy Lab
  describe('Slice 4: Executable Deep Research State Machine & Strategy Lab', () => {
    it('advances through deep research states and evaluates sufficiency', async () => {
      const session = deepResearchMachine.startSession('bates-post-office', 'Bates v Post Office relational contract good faith');
      expect(session.currentStep).toBe('scope');

      await deepResearchMachine.advanceStep(session.id); // -> plan
      expect(session.currentStep).toBe('plan');

      await deepResearchMachine.advanceStep(session.id); // -> local_search
      expect(session.currentStep).toBe('local_search');

      await deepResearchMachine.advanceStep(session.id); // -> sufficiency_check
      expect(session.currentStep).toBe('sufficiency_check');

      await deepResearchMachine.advanceStep(session.id); // -> rights_gate
      expect(session.sufficiencyScore).toBeGreaterThan(0);
    });

    it('generates objective case readiness report without uncalibrated win odds', () => {
      const mockMatter: Matter = {
        id: 'matter-bates-post-office',
        title: 'Bates & Ors v Post Office Ltd',
        jurisdiction: 'England and Wales',
        clientAlias: 'Subpostmasters',
        status: 'active',
        createdAt: '2026-09-24T00:00:00Z',
        updatedAt: '2026-09-24T00:00:00Z'
      };

      const report = StrategyLabEngine.evaluateCaseReadiness(mockMatter, [], [], []);
      expect(report.totalRequiredElements).toBe(4);
      expect(report.evidencedElements).toBe(3);
      expect(report.evidenceCoverageRatio).toBe(0.75);
      expect(report.explicitAbstentionNotice).toContain('Outcome prediction not validated for this matter');
      expect(report.explicitAbstentionNotice).toContain('Evidential coverage: 75%');
      expect(report.missingDocumentChecklist.length).toBeGreaterThan(0);
    });
  });

  // Slice 5: Corpus Tracker & Kaggle Terms Quarantining
  describe('Slice 5: 6,000-Document Corpus Manifest & Adaptation', () => {
    it('tracks 6,000+ reference documents and quarantines unverified Kaggle dumps', () => {
      const summary = corpusTracker.getSummary();
      expect(summary.totalDocuments).toBeGreaterThanOrEqual(6000);
      expect(summary.percentAchieved).toBeGreaterThanOrEqual(100);

      const quarantined = corpusTracker.getQuarantinedCollections();
      expect(quarantined.length).toBe(1);
      expect(quarantined[0].collectionId).toBe('col-kaggle-unverified');
      expect(quarantined[0].quarantined).toBe(true);
      expect(quarantined[0].quarantineReason).toContain('Kaggle community mirrors excluded');
    });
  });

  // Slice 6: Role-Gated Conflict Check
  describe('Slice 6: Role-Gated Conflict Check Engine', () => {
    it('identifies former client blocking conflicts with zero confidential fact leakage', () => {
      const matches = conflictCheckEngine.searchConflicts('Alan Bates', 'new-matter-id');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].conflictType).toBe('former_client');
      expect(matches[0].severity).toBe('blocking');
      expect(matches[0].explanation).toContain('existing or former client of the firm');
      // Verify zero secret case notes leaked
      expect(matches[0].explanation).not.toContain('PIN-188');
    });

    it('identifies adverse party conflicts and flags them', () => {
      const matches = conflictCheckEngine.searchConflicts('Post Office Limited', 'new-matter-id');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].conflictType).toBe('direct_adverse');
      expect(matches[0].severity).toBe('flagged');
    });
  });

  // Slice 7: Controlled 120-Task Benchmark Suite
  describe('Slice 7: Controlled 120-Task Benchmark Harness', () => {
    it('seeds and verifies 120 held-out legal benchmark tasks', () => {
      const tasks = benchmarkHarness.getTasks();
      expect(tasks.length).toBe(120);

      const categories = tasks.map(t => t.category);
      const statutory = categories.filter(c => c === 'statutory_citation_preservation').length;
      const contradiction = categories.filter(c => c === 'adverse_evidence_identification').length;
      const abstention = categories.filter(c => c === 'missing_evidence_abstention').length;
      const contract = categories.filter(c => c === 'contract_playbook_redline').length;

      expect(statutory).toBe(40);
      expect(contradiction).toBe(30);
      expect(abstention).toBe(25);
      expect(contract).toBe(25);
    });

    it('demonstrates benchmark progression across 3 tiers (Base -> Local Gemma 4 -> Sovereign Core)', () => {
      const tiers = benchmarkHarness.evaluateTiers();
      expect(tiers.length).toBe(3);

      const [base, gemma4, core] = tiers;
      expect(base.accuracyPercent).toBeLessThan(gemma4.accuracyPercent);
      expect(gemma4.accuracyPercent).toBeLessThanOrEqual(core.accuracyPercent);
      expect(gemma4.accuracyPercent).toBe(87.5);
      expect(core.accuracyPercent).toBe(100.0);
      expect(core.abstentionPrecisionPercent).toBe(100.0);
    });
  });
});
