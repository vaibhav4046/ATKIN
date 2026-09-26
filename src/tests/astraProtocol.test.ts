import { describe, it, expect } from 'vitest';
import { 
  AstraProtocolEngine, 
  AuthorityResolver, 
  ScopeLock, 
  DeadlineCalculatorTool, 
  RetrievalReasoningEngine, 
  ApprovalGate,
  type RankedSource,
  type AstraScope
} from '../engine/protocol/astra.ts';
import type { Span } from '../types/index.ts';

describe('ASTRA Legal Execution Protocol Specification & Engine', () => {
  const defaultScope: AstraScope = {
    jurisdiction: 'England and Wales',
    matterId: 'matter-alder-peak',
    operativeDate: '2026-03-12',
    sourcePolicy: 'selected_sources_only',
    privacyBoundary: 'local_airgap'
  };

  describe('Pillar A — Authority Hierarchy & Normative Weighting', () => {
    it('ranks sources strictly by English legal normative hierarchy', () => {
      const sources: RankedSource[] = [
        { id: 'src-email', title: 'Intake Email', tier: 'tier_6_extrinsic_evidence', isMandatoryLaw: false, content: 'Email notes' },
        { id: 'src-contract', title: 'Master Services Agreement', tier: 'tier_5_operative_contract', isMandatoryLaw: false, content: 'Contract terms' },
        { id: 'src-statute', title: 'Consumer Rights Act 2015', tier: 'tier_1_primary_statute', isMandatoryLaw: true, content: 'Statutory provisions' },
        { id: 'src-precedent', title: 'Supreme Court Judgment', tier: 'tier_3_binding_precedent', isMandatoryLaw: false, content: 'Ratio decidendi' }
      ];

      const ranked = AuthorityResolver.rankSources(sources);
      expect(ranked[0].tier).toBe('tier_1_primary_statute');
      expect(ranked[1].tier).toBe('tier_3_binding_precedent');
      expect(ranked[2].tier).toBe('tier_5_operative_contract');
      expect(ranked[3].tier).toBe('tier_6_extrinsic_evidence');
    });

    it('detects statutory override when contract excludes liability for negligence personal injury', () => {
      const contracts: RankedSource[] = [
        {
          id: 'clause-liability',
          title: 'Clause 9.1 Limitation',
          tier: 'tier_5_operative_contract',
          isMandatoryLaw: false,
          content: 'The Supplier shall exclude all liability for negligence resulting in any loss or injury.'
        }
      ];
      const statutes: RankedSource[] = [
        {
          id: 'statute-ucta',
          title: 'Unfair Contract Terms Act 1977 s.2(1)',
          tier: 'tier_1_primary_statute',
          isMandatoryLaw: true,
          content: 'A person cannot by reference to any contract term exclude or restrict his liability for death or personal injury resulting from negligence.'
        }
      ];

      const overrides = AuthorityResolver.detectStatutoryOverrides(contracts, statutes);
      expect(overrides.length).toBe(1);
      expect(overrides[0].clauseId).toBe('clause-liability');
      expect(overrides[0].reason).toContain('UCTA 1977 s.2(1)');
    });
  });

  describe('Pillar S — Scope Locking & Jurisdictional Boundary Enforcement', () => {
    it('accepts valid England and Wales queries within scope', () => {
      const check = ScopeLock.validateQueryScope(
        'What is the notice period required under English contract law?',
        defaultScope
      );
      expect(check.valid).toBe(true);
      expect(check.warning).toBeUndefined();
    });

    it('quarantines queries containing foreign US legal doctrines', () => {
      const check = ScopeLock.validateQueryScope(
        'Can we claim punitive damages under the parol evidence rule?',
        defaultScope
      );
      expect(check.valid).toBe(false);
      expect(check.warning).toContain('Jurisdictional Scope Boundary Violation');
      expect(check.warning).toContain('punitive damages');
    });
  });

  describe('Pillar T — Deterministic Local Tooling Contract', () => {
    it('calculates statutory response deadlines with CPR court weekend rollover', () => {
      // 14 calendar days starting Friday
      const startDate = new Date('2026-05-01T12:00:00Z'); // Friday
      const deadline = DeadlineCalculatorTool.calculateStatutoryDeadline(startDate, 14); // Friday May 15
      expect(deadline.expiryDate).toBe('2026-05-15');
      expect(deadline.isCourtWorkingDay).toBe(true);

      // Starting Saturday May 2 + 14 days = Saturday May 16 -> Rolls to Monday May 18
      const saturdayStart = new Date('2026-05-02T12:00:00Z');
      const rolledDeadline = DeadlineCalculatorTool.calculateStatutoryDeadline(saturdayStart, 14);
      expect(rolledDeadline.expiryDate).toBe('2026-05-18');
      expect(rolledDeadline.isCourtWorkingDay).toBe(false);
    });
  });

  describe('Pillar R — Retrieval + Reasoning & Evidential Abstention', () => {
    const testSpans: Span[] = [
      {
        id: 'span-term-1',
        documentId: 'doc-001',
        startOffset: 120,
        endOffset: 240,
        exactText: '3.2 Either party may terminate this Agreement without cause upon giving not less than 37 days prior written notice.',
        checksum: 'chk-37days'
      },
      {
        id: 'span-parties-1',
        documentId: 'doc-001',
        startOffset: 0,
        endOffset: 110,
        exactText: 'ALDER PEAK SYSTEMS LTD, a company incorporated in England and Wales ("Supplier").',
        checksum: 'chk-parties'
      }
    ];

    it('answers exact termination notice using verified span quote', () => {
      const irac = RetrievalReasoningEngine.evaluateQuery({
        query: 'What is the termination notice period under the contract?',
        spans: testSpans,
        scope: defaultScope
      });

      expect(irac.isAbstention).toBe(false);
      expect(irac.conclusion).toContain('37 calendar days');
      expect(irac.citations.length).toBe(1);
      expect(irac.citations[0].spanId).toBe('span-term-1');
      expect(irac.confidenceScore).toBeGreaterThan(0.9);
    });

    it('truthfully abstains when asked about unrecorded incorporation date', () => {
      const irac = RetrievalReasoningEngine.evaluateQuery({
        query: 'What is the exact incorporation date of the supplier?',
        spans: testSpans,
        scope: defaultScope
      });

      expect(irac.isAbstention).toBe(true);
      expect(irac.conclusion).toContain('Evidential abstention is applied; no date or year is stated');
      expect(irac.citations.length).toBe(0);
      expect(irac.abstentionReason).toContain('Factual matrix is silent');
    });
  });

  describe('Pillar A — Approval Gates & Human Sign-Off Tiers', () => {
    it('executes tier 1 read-only actions autonomously', () => {
      const receipt = ApprovalGate.createActionReceipt(
        'document_span_extraction',
        'tier_1_autonomous_read_only'
      );
      expect(receipt.isConfirmed).toBe(true);
      expect(receipt.confirmedBy).toBe('system:autonomous_read_only');
    });

    it('blocks tier 2 and tier 3 consequential actions without human confirmation', () => {
      const pendingReceipt = ApprovalGate.createActionReceipt(
        'dispatch_statutory_letter_before_claim',
        'tier_3_partner_signoff_required'
      );
      expect(pendingReceipt.isConfirmed).toBe(false);
      expect(pendingReceipt.confirmedBy).toBeUndefined();

      const confirmedReceipt = ApprovalGate.createActionReceipt(
        'dispatch_statutory_letter_before_claim',
        'tier_3_partner_signoff_required',
        'solicitor:eleanor_vance'
      );
      expect(confirmedReceipt.isConfirmed).toBe(true);
      expect(confirmedReceipt.confirmedBy).toBe('solicitor:eleanor_vance');
    });
  });

  describe('ASTRA Master Protocol Engine End-to-End Orchestration', () => {
    it('executes comprehensive legal inquiry across all 5 ASTRA pillars', () => {
      const engine = new AstraProtocolEngine(defaultScope);
      const testSpans: Span[] = [
        {
          id: 'span-cl-3.2',
          documentId: 'doc-contract',
          startOffset: 100,
          endOffset: 215,
          exactText: 'Clause 3.2: Notice of termination without cause shall be 37 days in writing.',
          checksum: 'chk-notice'
        }
      ];

      const sources: RankedSource[] = [
        {
          id: 'src-contract',
          title: 'Operative Contract',
          tier: 'tier_5_operative_contract',
          isMandatoryLaw: false,
          content: 'Notice of termination without cause shall be 37 days in writing.'
        },
        {
          id: 'src-cpr',
          title: 'Civil Procedure Rules Part 44',
          tier: 'tier_2_secondary_instrument',
          isMandatoryLaw: true,
          content: 'Court costs rules'
        }
      ];

      const result = engine.executeTask({
        query: 'What notice is required for termination?',
        sources,
        spans: testSpans,
        actionType: 'draft_termination_notice',
        requiredApprovalTier: 'tier_2_solicitor_review_required',
        approver: 'solicitor:eleanor_vance'
      });

      // 1. A — Authority verified
      expect(result.rankedSources[0].tier).toBe('tier_2_secondary_instrument');
      expect(result.rankedSources[1].tier).toBe('tier_5_operative_contract');

      // 2. S — Scope verified
      expect(result.scope.jurisdiction).toBe('England and Wales');

      // 3. R — Retrieval + Reasoning verified
      expect(result.irac.conclusion).toContain('37 calendar days');
      expect(result.irac.citations[0].spanId).toBe('span-cl-3.2');

      // 4. A — Approval verified
      expect(result.approval.isConfirmed).toBe(true);
      expect(result.approval.confirmedBy).toBe('solicitor:eleanor_vance');
    });
  });
});
