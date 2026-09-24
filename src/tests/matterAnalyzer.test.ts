import { describe, it, expect } from 'vitest';
import { MatterAnalyzer } from '../engine/ingestion/matterAnalyzer.ts';
import type { Claim } from '../types/index.ts';

describe('MatterAnalyzer — Sovereign Evidential Ingestion Engine', () => {
  const analyzer = new MatterAnalyzer();

  it('correctly ingests text, computes SHA-256, and extracts exact character spans', async () => {
    const rawText = `WITNESS STATEMENT OF JOHN DOE
Date: 15 March 2026

1. On 10 January 2026, I examined the branch accounting system terminal.
2. The terminal suffered an unexpected shutdown during transaction balancing, producing a £1,500 deficit.
3. Fujitsu support engineers confirmed the defect was due to a database retry bug.`;

    const result = await analyzer.analyzeDocument({
      matterId: 'matter-test-1',
      filename: 'Witness_Statement_John_Doe.txt',
      text: rawText,
      sourceDate: '2026-03-15'
    });

    expect(result.document.sha256).toBeDefined();
    expect(result.document.sha256.length).toBe(64);
    expect(result.spans.length).toBeGreaterThan(0);

    // Verify first span byte offsets against raw text
    const firstSpan = result.spans[0];
    const extractedSlice = rawText.slice(firstSpan.startOffset, firstSpan.endOffset);
    expect(extractedSlice).toBe(firstSpan.exactText);
  });

  it('formulates claims from substantive legal assertions and links provenance edges', async () => {
    const rawText = `CONTRACTUAL WARRANTY AND SERVICE LEVEL AGREEMENT
Section 4: System Availability and Integrity.
Meridian Cloud Technologies Ltd warrants that the cloud infrastructure services will operate without severe defect.
Customer acknowledges that payment of all subscription fees shall be strictly due within thirty days of invoice.`;

    const result = await analyzer.analyzeDocument({
      matterId: 'matter-test-2',
      filename: 'Service_Level_Agreement.txt',
      text: rawText
    });

    expect(result.claims.length).toBeGreaterThan(0);
    const warrantClaim = result.claims.find(c => c.statement.toLowerCase().includes('warrant'));
    expect(warrantClaim).toBeDefined();
    expect(warrantClaim?.provenanceEdges[0].type).toBe('supports');
    expect(warrantClaim?.provenanceEdges[0].author).toBe('rule');
  });

  it('detects adverse contradictions when conflicting assertions are ingested against existing records', async () => {
    // Existing claim asserting system is robust and has no bugs
    const existingClaim: Claim = {
      id: 'claim-existing-denial',
      matterId: 'matter-bates',
      statement: 'Post Office Ltd asserts that the Horizon computer system is completely robust and free from defect.',
      kind: 'fact',
      polarity: 'adverse',
      status: 'supported',
      provenanceEdges: [],
      updatedAt: '2026-09-24T00:00:00Z'
    };

    // Newly ingested text acknowledging software defect/bug
    const newDocText = `FUJITSU PROBLEM LOG
System Component: Horizon Counter Accounting.
Fujitsu software engineering report confirms that Bug 188 causes repeated transaction failure and branch balancing discrepancy.`;

    const result = await analyzer.analyzeDocument({
      matterId: 'matter-bates',
      filename: 'Fujitsu_Problem_Log.txt',
      text: newDocText,
      existingClaims: [existingClaim]
    });

    // Should detect contradiction
    expect(result.reviewItems.length).toBeGreaterThan(0);
    const contraItem = result.reviewItems.find(r => r.type === 'contradiction');
    expect(contraItem).toBeDefined();
    expect(contraItem?.severity).toBe('high');

    // Claim should have a 'contradicts' edge
    const defectClaim = result.claims.find(c => c.statement.toLowerCase().includes('bug'));
    expect(defectClaim).toBeDefined();
    const contraEdge = defectClaim?.provenanceEdges.find(e => e.type === 'contradicts');
    expect(contraEdge).toBeDefined();
  });
});
