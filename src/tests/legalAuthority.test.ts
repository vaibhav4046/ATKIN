import { describe, it, expect } from 'vitest';
import { 
  LegalAuthorityResolver, 
  ContractVersionResolver, 
  EvidenceWeightResolver, 
  RulePackEngine,
  type LegalSource,
  type ContractClause 
} from '../engine/protocol/legalAuthority.ts';

describe('LegalAuthority & Versioned Rule Packs', () => {
  describe('LegalAuthorityResolver Precedence', () => {
    it('ranks 8 categories strictly by constitutional and normative hierarchy', () => {
      const sources: LegalSource[] = [
        { id: '1', title: 'Intake Call Log', category: 'factual_evidence', jurisdiction: 'England and Wales', bindingStatus: 'evidential_only', currentStatus: 'in_force', content: '', versionHash: 'h1', retrievedAt: '' },
        { id: '2', title: 'Deed of Variation', category: 'amendment', jurisdiction: 'England and Wales', bindingStatus: 'contractual_inter_partes', currentStatus: 'in_force', content: '', versionHash: 'h2', retrievedAt: '' },
        { id: '3', title: 'Consumer Rights Act 2015', category: 'legislation', jurisdiction: 'UK_Wide', bindingStatus: 'strictly_binding', currentStatus: 'in_force', content: '', versionHash: 'h3', retrievedAt: '' },
        { id: '4', title: 'Civil Procedure Rules Part 44', category: 'delegated_legislation', jurisdiction: 'England and Wales', bindingStatus: 'strictly_binding', currentStatus: 'in_force', content: '', versionHash: 'h4', retrievedAt: '' },
        { id: '5', title: 'Supreme Court Judgment', category: 'judicial_decision', jurisdiction: 'UK_Wide', bindingStatus: 'strictly_binding', currentStatus: 'in_force', content: '', versionHash: 'h5', retrievedAt: '' }
      ];

      const ranked = LegalAuthorityResolver.rankSources(sources);
      expect(ranked[0].category).toBe('legislation');
      expect(ranked[1].category).toBe('delegated_legislation');
      expect(ranked[2].category).toBe('judicial_decision');
      expect(ranked[3].category).toBe('amendment');
      expect(ranked[4].category).toBe('factual_evidence');
    });
  });

  describe('ContractVersionResolver (Master Agreement vs Deeds of Variation)', () => {
    it('replaces varied parent clause with amending clause while continuing unvaried terms', () => {
      const parentClauses: ContractClause[] = [
        { clauseId: 'p-1', documentId: 'doc-msa', clauseNumber: '2.1', text: 'Price is £18,420.', sourceCategory: 'contract', effectiveDate: '2026-03-12' },
        { clauseId: 'p-2', documentId: 'doc-msa', clauseNumber: '3.2', text: 'Notice is 37 days.', sourceCategory: 'contract', effectiveDate: '2026-03-12' }
      ];

      const amendments: ContractClause[] = [
        { clauseId: 'am-1', documentId: 'doc-deed-v2', clauseNumber: '2.1', text: 'Price is varied to £17,900.', sourceCategory: 'amendment', effectiveDate: '2026-04-28' }
      ];

      const res = ContractVersionResolver.resolveOperativeClauses(parentClauses, amendments);

      expect(res.supersededClauses.length).toBe(1);
      expect(res.supersededClauses[0].original.clauseNumber).toBe('2.1');
      expect(res.supersededClauses[0].replacingAmendment.text).toBe('Price is varied to £17,900.');

      // Operative clauses: 2.1 is the new varied price, 3.2 is original unvaried notice
      const cl21 = res.operativeClauses.find(c => c.clauseNumber === '2.1');
      const cl32 = res.operativeClauses.find(c => c.clauseNumber === '3.2');

      expect(cl21?.text).toBe('Price is varied to £17,900.');
      expect(cl21?.isVariedBy).toBe('doc-deed-v2');
      expect(cl32?.text).toBe('Notice is 37 days.');
      expect(cl32?.isVariedBy).toBeUndefined();
    });
  });

  describe('EvidenceWeightResolver (Gestmin Probative Hierarchy)', () => {
    it('weights contemporaneous cryptographic log significantly higher than subsequent recollection', () => {
      const logWeight = EvidenceWeightResolver.evaluateProbativeWeight({
        type: 'contemporaneous_log',
        recordedDate: '2026-03-12T10:00:00Z',
        eventDate: '2026-03-12T09:59:58Z',
        hasCryptographicIntegrity: true
      });

      const oralWeight = EvidenceWeightResolver.evaluateProbativeWeight({
        type: 'oral_recollection',
        recordedDate: '2026-08-20T10:00:00Z',
        eventDate: '2026-03-12T10:00:00Z',
        hasCryptographicIntegrity: false
      });

      expect(logWeight.weightScore).toBeGreaterThanOrEqual(0.9);
      expect(logWeight.justification).toContain('Gestmin');
      expect(oralWeight.weightScore).toBeLessThanOrEqual(0.5);
    });
  });

  describe('RulePackEngine with Applicability Predicates', () => {
    const invalidClause: ContractClause = {
      clauseId: 'cl-ex',
      documentId: 'doc-contract',
      clauseNumber: '9.1',
      text: 'The Supplier shall exclude all liability for negligence resulting in personal injury.',
      sourceCategory: 'contract',
      effectiveDate: '2026-03-12'
    };

    it('applies UCTA 1977 s.2(1) to B2B commercial contracts', () => {
      const result = RulePackEngine.evaluateLiabilityRules({
        contractType: 'B2B_COMMERCIAL',
        clauses: [invalidClause]
      });

      expect(result.statute).toBe('UCTA_1977');
      expect(result.status).toBe('APPLIES');
      expect(result.overriddenClauses.length).toBe(1);
      expect(result.overriddenClauses[0].statutoryRef).toContain('Unfair Contract Terms Act 1977 s.2(1)');
    });

    it('applies CRA 2015 s.65 to B2C consumer contracts', () => {
      const result = RulePackEngine.evaluateLiabilityRules({
        contractType: 'B2C_CONSUMER',
        clauses: [invalidClause]
      });

      expect(result.statute).toBe('CRA_2015');
      expect(result.status).toBe('APPLIES');
      expect(result.overriddenClauses.length).toBe(1);
      expect(result.overriddenClauses[0].statutoryRef).toContain('Consumer Rights Act 2015 s.65(1)');
    });

    it('emits REQUIRES_REVIEW when contracting party relationship is unknown', () => {
      const result = RulePackEngine.evaluateLiabilityRules({
        contractType: 'UNKNOWN',
        clauses: [invalidClause]
      });

      expect(result.status).toBe('REQUIRES_REVIEW');
      expect(result.reason).toContain('B2B vs B2C');
    });
  });
});
