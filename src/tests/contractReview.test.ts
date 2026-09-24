import { describe, it, expect } from 'vitest';
import { ContractReviewer } from '../engine/contract/contractReviewer.ts';
import { 
  CONTRACT_MATTER_ID, 
  CONTRACT_DOCUMENTS 
} from '../db/fixtures/contractMatter.ts';

describe('Contract Reviewer & Institutional Playbook Audit', () => {
  const reviewer = new ContractReviewer();
  const msaDoc = CONTRACT_DOCUMENTS[0];

  it('extracts key contractual clauses from Master Cloud Agreement', () => {
    const result = reviewer.reviewDocument(CONTRACT_MATTER_ID, msaDoc);

    expect(result.matterId).toBe(CONTRACT_MATTER_ID);
    expect(result.documentId).toBe(msaDoc.id);
    expect(result.clauses.length).toBeGreaterThanOrEqual(4);

    const categories = result.clauses.map(c => c.category);
    expect(categories).toContain('indemnity');
    expect(categories).toContain('liability_cap');
    expect(categories).toContain('payment_terms');
    expect(categories).toContain('governing_law');
  });

  it('detects HIGH risk for uncapped unilateral indemnity', () => {
    const result = reviewer.reviewDocument(CONTRACT_MATTER_ID, msaDoc);

    const indemnityRisk = result.risks.find(r => r.title.includes('Uncapped Unilateral Customer Indemnity'));
    expect(indemnityRisk).toBeDefined();
    expect(indemnityRisk?.severity).toBe('high');
    expect(indemnityRisk?.playbookReference).toContain('SaaS Playbook Rule 4.1');
    expect(indemnityRisk?.suggestedRevision).toContain('Section 9');
  });

  it('detects HIGH risk for conflicting payment terms (Net 30 vs Net 60)', () => {
    const result = reviewer.reviewDocument(CONTRACT_MATTER_ID, msaDoc);

    const paymentRisk = result.risks.find(r => r.title.includes('Payment Terms'));
    expect(paymentRisk).toBeDefined();
    expect(paymentRisk?.severity).toBe('high');
    expect(paymentRisk?.explanation).toContain('Section 4.2');
    expect(paymentRisk?.explanation).toContain('Schedule B');
  });

  it('detects MEDIUM risk for foreign governing law (Delaware vs England & Wales)', () => {
    const result = reviewer.reviewDocument(CONTRACT_MATTER_ID, msaDoc);

    const govLawRisk = result.risks.find(r => r.title.includes('Foreign Governing Law'));
    expect(govLawRisk).toBeDefined();
    expect(govLawRisk?.severity).toBe('medium');
    expect(govLawRisk?.explanation).toContain('Delaware');
  });

  it('extracts actionable obligations for both parties', () => {
    const result = reviewer.reviewDocument(CONTRACT_MATTER_ID, msaDoc);

    expect(result.obligations.length).toBeGreaterThan(0);
    const customerObs = result.obligations.filter(o => o.obligorParty === 'Customer');
    expect(customerObs.length).toBeGreaterThan(0);
  });
});
