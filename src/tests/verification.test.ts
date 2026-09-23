import { describe, it, expect } from 'vitest';
import { verifySpanGrounding, verifyClaimGrounding, checkPromptInjectionRisk } from '../engine/verifier.ts';
import { SAMPLE_DOCUMENTS, SAMPLE_SPANS, SAMPLE_CLAIMS } from '../db/fixtures/consumerLaptop.ts';
import type { Span, Document } from '../types/index.ts';

describe('Deterministic Citation Verifier Gate', () => {
  const docMap = new Map(SAMPLE_DOCUMENTS.map(d => [d.id, d]));
  const spanMap = new Map(SAMPLE_SPANS.map(s => [s.id, s]));

  it('correctly verifies a valid span grounded in document text', () => {
    const span = spanMap.get('span-receipt-purchase-delivery')!;
    const doc = docMap.get(span.documentId)!;

    const result = verifySpanGrounding(span, doc);
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('VERIFIED');
  });

  it('rejects a span with corrupted or out-of-bound offsets', () => {
    const validSpan = spanMap.get('span-receipt-purchase-delivery')!;
    const doc = docMap.get(validSpan.documentId)!;

    const corruptedSpan: Span = {
      ...validSpan,
      startOffset: 99999,
      endOffset: 100050
    };

    const result = verifySpanGrounding(corruptedSpan, doc);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('CORRUPTED_OFFSETS');
  });

  it('rejects a span with fabricated or altered text content', () => {
    const validSpan = spanMap.get('span-receipt-purchase-delivery')!;
    const doc = docMap.get(validSpan.documentId)!;

    const alteredSpan: Span = {
      ...validSpan,
      exactText: 'Fabricated text: Laptop purchased in 2020 for £50.'
    };

    const result = verifySpanGrounding(alteredSpan, doc);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('TEXT_MISMATCH');
  });

  it('quarantines missing spans during claim grounding audit', () => {
    const claim = {
      ...SAMPLE_CLAIMS[0],
      provenanceEdges: [
        {
          id: 'fake-edge',
          claimId: SAMPLE_CLAIMS[0].id,
          spanId: 'nonexistent-hallucinated-span-999',
          type: 'supports' as const,
          author: 'model' as const,
          rationale: 'Hallucinated citation',
          reviewState: 'pending' as const,
          createdAt: new Date().toISOString()
        }
      ]
    };

    const grounding = verifyClaimGrounding(claim, spanMap, docMap);
    expect(grounding.isFullyGrounded).toBe(false);
    expect(grounding.results[0].result.code).toBe('MISSING_SPAN');
  });
});
