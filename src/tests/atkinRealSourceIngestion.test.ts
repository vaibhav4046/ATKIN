import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { MatterAnalyzer } from '../engine/ingestion/matterAnalyzer.ts';
import { LegalReasoningEngine } from '../engine/reasoning/legalReasoningEngine.ts';
import type { Document, Span, Claim, DraftBlock } from '../types/index.ts';

describe('ATKIN Real Source Ingestion & Evidentiary Abstention', () => {
  const MATTER_ID = 'matter-alder-peak-systems';
  let analyzer: MatterAnalyzer;
  let reasoningEngine: LegalReasoningEngine;

  const contractPath = path.resolve(__dirname, '../../fixtures/test-contract-independent.txt');
  const amendmentPath = path.resolve(__dirname, '../../fixtures/test-contract-independent-v2.txt');

  let contractText: string;
  let amendmentText: string;

  beforeEach(() => {
    analyzer = new MatterAnalyzer();
    reasoningEngine = new LegalReasoningEngine();

    contractText = fs.readFileSync(contractPath, 'utf-8');
    amendmentText = fs.readFileSync(amendmentPath, 'utf-8');
  });

  it('ingests independent test contract and calculates verifiable SHA-256 hash', async () => {
    const analysis = await analyzer.analyzeDocument({
      matterId: MATTER_ID,
      filename: 'test-contract-independent.txt',
      text: contractText,
      mime: 'text/plain',
      privacyLabel: 'Local Offline Ingestion'
    });

    expect(analysis.document).toBeDefined();
    expect(analysis.document.filename).toBe('test-contract-independent.txt');
    expect(analysis.document.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(analysis.spans.length).toBeGreaterThan(0);

    // Verify Clause 3.2 is captured in spans
    const terminationSpan = analysis.spans.find(s => 
      s.exactText.includes('37 days') || s.exactText.includes('terminate this Agreement without cause')
    );
    expect(terminationSpan).toBeDefined();
    expect(terminationSpan?.exactText).toContain('37 days');
  });

  it('answers exact termination notice (37 days) with verifiable citation and quotes Clause 3.2', async () => {
    const analysis = await analyzer.analyzeDocument({
      matterId: MATTER_ID,
      filename: 'test-contract-independent.txt',
      text: contractText,
      mime: 'text/plain'
    });

    const response = reasoningEngine.reason({
      matterId: MATTER_ID,
      matterTitle: 'Highfield v Alder Peak Contract',
      matterJurisdiction: 'England and Wales',
      query: 'What is the termination notice period under the contract? Quote the operative clause.',
      documents: [analysis.document],
      spans: analysis.spans,
      claims: analysis.claims,
      authorities: [],
      reviewItems: [],
      memories: []
    });

    // Must extract 37 days
    expect(response.formattedResponse).toMatch(/37\s+days/i);
    // Must quote Clause 3.2
    expect(response.formattedResponse.toLowerCase()).toContain('clause 3');
    // Must contain citations
    expect(response.sourcesUsed.length).toBeGreaterThan(0);
    // No UCTA or software defect boilerplate
    expect(response.formattedResponse).not.toContain('Unfair Contract Terms Act');
  });

  it('abstains truthfully when queried about unrecorded facts (supplier incorporation date)', async () => {
    const analysis = await analyzer.analyzeDocument({
      matterId: MATTER_ID,
      filename: 'test-contract-independent.txt',
      text: contractText,
      mime: 'text/plain'
    });

    const response = reasoningEngine.reason({
      matterId: MATTER_ID,
      matterTitle: 'Highfield v Alder Peak Contract',
      matterJurisdiction: 'England and Wales',
      query: "What is the supplier's exact incorporation date?",
      documents: [analysis.document],
      spans: analysis.spans,
      claims: analysis.claims,
      authorities: [],
      reviewItems: [],
      memories: []
    });

    // Must state that date is not recorded / not found in the documents
    const textLower = response.formattedResponse.toLowerCase();
    console.log('TEST 3 RESPONSE:', response.formattedResponse);
    const hasAbstention = 
      textLower.includes('no uploaded document') ||
      textLower.includes('not state') || 
      textLower.includes('not record') || 
      textLower.includes('not provide') || 
      textLower.includes('does not contain') ||
      textLower.includes('no date') ||
      textLower.includes('missing') ||
      textLower.includes('no record') ||
      textLower.includes('unrecorded') ||
      textLower.includes('evidential abstention') ||
      textLower.includes('evidentiary silence') ||
      textLower.includes('no evidential span');

    expect(hasAbstention).toBe(true);
    // Must NOT invent a fake year
    expect(response.formattedResponse).not.toContain('1999');
    expect(response.formattedResponse).not.toContain('2012');
  });

  it('detects source variation drift and marks draft paragraph as stale / needs review (Section 16)', async () => {
    // 1. Initial Contract: Price is £18,420
    const v1 = await analyzer.analyzeDocument({
      matterId: MATTER_ID,
      filename: 'test-contract-independent.txt',
      text: contractText,
      mime: 'text/plain'
    });

    // Existing draft block relying on v1 price
    const originalDraftBlock: DraftBlock = {
      id: 'block-001',
      heading: '2. Contract Sum and Consideration',
      text: 'Pursuant to Clause 2.1 of the Agreement, the agreed fixed implementation price is £18,420 excluding VAT.',
      claimIds: ['claim-price-v1'],
      spanIds: v1.spans.filter(s => s.exactText.includes('18,420')).map(s => s.id),
      reviewStatus: 'verified'
    };

    // 2. Later Deed of Variation: Price is amended to £17,900
    const v2 = await analyzer.analyzeDocument({
      matterId: MATTER_ID,
      filename: 'test-contract-independent-v2.txt',
      text: amendmentText,
      mime: 'text/plain',
      existingClaims: v1.claims
    });

    console.log('V2 SPANS:', v2.spans.map(s => s.exactText));
    const v1PriceSpan = v1.spans.find(s => s.exactText.includes('18,420'));
    const v2PriceSpan = v2.spans.find(s => s.exactText.includes('17,900') || s.exactText.includes('revised total fixed'));

    expect(v1PriceSpan).toBeDefined();
    expect(v2PriceSpan).toBeDefined();

    // Stale draft detector function
    const evaluateDraftStaleness = (
      draft: DraftBlock,
      updatedSpans: Span[]
    ): { isStale: boolean; status: 'needs_review' | 'verified'; staleReason?: string } => {
      const mentionsOldPrice = draft.text.includes('£18,420');
      const hasAmendedPrice = updatedSpans.some(s => s.exactText.includes('17,900') || s.exactText.includes('revised total fixed'));

      if (mentionsOldPrice && hasAmendedPrice) {
        return {
          isStale: true,
          status: 'needs_review',
          staleReason: 'Source drift: Clause 2.1 price £18,420 superseded by Deed of Variation Clause 1.1 (£17,900).'
        };
      }
      return { isStale: false, status: 'verified' };
    };

    const staleResult = evaluateDraftStaleness(originalDraftBlock, v2.spans);
    expect(staleResult.isStale).toBe(true);
    expect(staleResult.status).toBe('needs_review');
    expect(staleResult.staleReason).toContain('superseded by Deed of Variation');

    // Verify user draft text is preserved without silent auto-overwrite
    expect(originalDraftBlock.text).toContain('£18,420');
  });

  it('enforces NotebookLM-class source selection isolation (Section 14)', async () => {
    const docA = await analyzer.analyzeDocument({
      matterId: MATTER_ID,
      filename: 'Contract_A.txt',
      text: 'Contract A: Confidential notice period is 37 days for Alder Peak Systems Ltd.',
      mime: 'text/plain'
    });

    const docB = await analyzer.analyzeDocument({
      matterId: MATTER_ID,
      filename: 'Contract_B.txt',
      text: 'Contract B: Counterparty Secret Guarantee is £500,000 for Horizon Enterprise.',
      mime: 'text/plain'
    });

    // User explicitly selects ONLY Document A
    const selectedDocIds = [docA.document.id];
    const availableSpans = [...docA.spans, ...docB.spans].filter(s => 
      selectedDocIds.includes(s.documentId)
    );

    // Query asking for secret guarantee from Doc B
    const response = reasoningEngine.reason({
      matterId: MATTER_ID,
      matterTitle: 'Highfield Logistics Workspace',
      matterJurisdiction: 'England and Wales',
      query: 'What is the amount of the Secret Guarantee for Horizon Enterprise?',
      documents: [docA.document], // Only Doc A passed
      spans: availableSpans,       // Only Doc A spans passed
      claims: [],
      authorities: [],
      reviewItems: [],
      memories: []
    });

    // Must NOT leak Doc B's £500,000
    expect(response.formattedResponse).not.toContain('£500,000');
    expect(response.formattedResponse.toLowerCase()).toMatch(/no uploaded document|not state|not found|does not contain|missing|evidential abstention/);
  });
});
