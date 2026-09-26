import { describe, it, expect, beforeEach } from 'vitest';
import {
  GOLDEN_MATTER,
  GOLDEN_DOCUMENTS,
  GOLDEN_DOC_MSA_TEXT,
  GOLDEN_DOC_VARIATION_TEXT,
  GOLDEN_CLAIMS
} from '../domain/matters/goldenMatter.ts';
import { MatterAnalyzer } from '../engine/ingestion/matterAnalyzer.ts';
import { LegalReasoningEngine } from '../engine/reasoning/legalReasoningEngine.ts';
import {
  createWorkProduct,
  appendProductVersion,
  detectSourceDrift
} from '../domain/workProducts/workProduct.ts';

describe('ATKIN Golden Matter 3-Minute Journey (Sections 72, 73, 75)', () => {
  let analyzer: MatterAnalyzer;
  let reasoningEngine: LegalReasoningEngine;

  beforeEach(() => {
    analyzer = new MatterAnalyzer();
    reasoningEngine = new LegalReasoningEngine();
  });

  it('Step 1 (0:00–0:45): Ingests Golden contract and verifies cryptographic SHA-256 hash & spans', async () => {
    const analysis = await analyzer.analyzeDocument({
      matterId: GOLDEN_MATTER.id,
      filename: 'Alder_Peak_Master_Services_Agreement_2026.txt',
      text: GOLDEN_DOC_MSA_TEXT,
      mime: 'text/plain',
      privacyLabel: 'Confidential B2B Commercial'
    });

    expect(analysis.document).toBeDefined();
    expect(analysis.document.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(analysis.spans.length).toBeGreaterThan(0);

    // Verify Clause 3.2 notice span is extracted
    const noticeSpan = analysis.spans.find(s => s.exactText.includes('37 days'));
    expect(noticeSpan).toBeDefined();
    expect(noticeSpan?.exactText).toContain('37 days');
  });

  it('Step 2 (0:45–1:05): Grounded Ask returns exact 37 days notice with Clause 3.2 citation', async () => {
    const analysis = await analyzer.analyzeDocument({
      matterId: GOLDEN_MATTER.id,
      filename: 'Alder_Peak_Master_Services_Agreement_2026.txt',
      text: GOLDEN_DOC_MSA_TEXT,
      mime: 'text/plain'
    });

    const response = reasoningEngine.reason({
      matterId: GOLDEN_MATTER.id,
      matterTitle: GOLDEN_MATTER.title,
      matterJurisdiction: GOLDEN_MATTER.jurisdiction,
      query: 'What notice is required to terminate under the contract? Quote the operative clause.',
      documents: [analysis.document],
      spans: analysis.spans,
      claims: analysis.claims,
      authorities: [],
      reviewItems: [],
      memories: []
    });

    // Answers 37 days
    expect(response.formattedResponse).toMatch(/37\s+days/i);
    // Mentions Clause 3
    expect(response.formattedResponse.toLowerCase()).toContain('clause 3');
    // Quotes exact text
    expect(response.sourcesUsed.length).toBeGreaterThan(0);
  });

  it('Step 3 (1:05–1:20): Applies truthful evidential abstention on unrecorded supplier incorporation date', async () => {
    const analysis = await analyzer.analyzeDocument({
      matterId: GOLDEN_MATTER.id,
      filename: 'Alder_Peak_Master_Services_Agreement_2026.txt',
      text: GOLDEN_DOC_MSA_TEXT,
      mime: 'text/plain'
    });

    const response = reasoningEngine.reason({
      matterId: GOLDEN_MATTER.id,
      matterTitle: GOLDEN_MATTER.title,
      matterJurisdiction: GOLDEN_MATTER.jurisdiction,
      query: "What is the supplier's exact incorporation date?",
      documents: [analysis.document],
      spans: analysis.spans,
      claims: analysis.claims,
      authorities: [],
      reviewItems: [],
      memories: []
    });

    // Verifies truthful abstention
    expect(response.formattedResponse.toLowerCase()).toContain('not state or record');
    expect(response.formattedResponse.toLowerCase()).toContain('evidential abstention');
  });

  it('Step 4 (1:20–1:40): Deed of variation varies Clause 2.1 price to £17,900 and triggers SOURCE_CHANGED drift', async () => {
    // 1. Initial advice note drafted on original contract price (£14,500)
    const initialProduct = createWorkProduct({
      matterId: GOLDEN_MATTER.id,
      workspaceId: 'demo',
      type: 'advice_note',
      title: 'Fee and Termination Risk Advice',
      blocks: [
        {
          id: 'blk-price-advice',
          productVersionId: 'v1',
          heading: 'Agreed Contract Price',
          text: 'The total implementation fee is £14,500 under Clause 2.1 of the Master Services Agreement.',
          sourceSpanIds: ['span-msa-clause-2-1'],
          sourceDocumentIds: ['doc-golden-msa'],
          generatedAt: new Date().toISOString(),
          status: 'active'
        }
      ],
      sourceRefs: ['doc-golden-msa']
    });

    expect(initialProduct.versions[0].blocks[0].status).toBe('active');

    // 2. Deed of variation is executed, amending Clause 2.1
    const variationAnalysis = await analyzer.analyzeDocument({
      matterId: GOLDEN_MATTER.id,
      filename: 'Alder_Peak_Deed_of_Variation_2026.txt',
      text: GOLDEN_DOC_VARIATION_TEXT,
      mime: 'text/plain'
    });

    expect(variationAnalysis.document.text).toContain('£17,900');

    // 3. System evaluates source drift against superseded doc
    const driftCheck = detectSourceDrift(initialProduct.versions[0], ['doc-golden-msa']);

    expect(driftCheck.hasDrift).toBe(true);
    expect(driftCheck.driftedBlockIds).toContain('blk-price-advice');
    expect(driftCheck.updatedVersion.blocks[0].status).toBe('SOURCE_CHANGED');
  });

  it('Step 5 (1:40–2:30): Work Product creates persistent revision beside conversation and receives lawyer approval', () => {
    const wp = createWorkProduct({
      matterId: GOLDEN_MATTER.id,
      workspaceId: 'demo',
      type: 'advice_note',
      title: 'Final Client Advice Note: Highfield v Alder Peak',
      body: 'Drafted advice concerning 37-day notice and Deed of Variation £17,900 price.',
      createdBy: 'ai',
      sourceRefs: ['doc-golden-msa', 'doc-golden-variation']
    });

    expect(wp.versions).toHaveLength(1);
    expect(wp.versions[0].createdBy).toBe('ai');

    // User updates advice
    const userVersion = appendProductVersion(wp, {
      blocks: [
        {
          id: 'blk-final',
          productVersionId: '',
          heading: 'Notice and Invoicing Position',
          text: 'Advised client that 37 days notice must be given under Clause 3.2, and £17,900 is payable within 30 days pursuant to Clause 2.3.',
          sourceSpanIds: [],
          sourceDocumentIds: ['doc-golden-msa', 'doc-golden-variation'],
          generatedAt: new Date().toISOString(),
          status: 'active'
        }
      ],
      createdBy: 'user'
    });

    expect(userVersion.versions).toHaveLength(2);
    expect(userVersion.versions[1].createdBy).toBe('user');

    // Lawyer signs off
    const approvedProduct = appendProductVersion(userVersion, {
      blocks: userVersion.versions[1].blocks.map(b => ({ ...b, status: 'verified' as const })),
      createdBy: 'lawyer_approved'
    });

    expect(approvedProduct.versions).toHaveLength(3);
    expect(approvedProduct.versions[2].createdBy).toBe('lawyer_approved');
  });
});
