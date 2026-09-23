import { describe, it, expect } from 'vitest';
import { detectContradictions } from '../engine/contradictionEngine.ts';
import { SAMPLE_CLAIMS, SAMPLE_SPANS } from '../db/fixtures/consumerLaptop.ts';

describe('Adverse Contradiction Detection Engine', () => {
  const spanMap = new Map(SAMPLE_SPANS.map(s => [s.id, s]));

  it('detects planted date contradiction between 8 April and 12 April', () => {
    const { contradictions, generatedReviewItems } = detectContradictions(SAMPLE_CLAIMS, spanMap);

    expect(contradictions.length).toBeGreaterThan(0);
    
    // Find the 8 Apr vs 12 Apr contradiction
    const dateConflict = contradictions.find(c => 
      (c.claimA.temporalScope === '2026-04-12' && c.claimB.temporalScope === '2026-04-08') ||
      (c.claimA.temporalScope === '2026-04-08' && c.claimB.temporalScope === '2026-04-12')
    );

    expect(dateConflict).toBeDefined();
    expect(dateConflict?.neutralQuestion).toContain('2026-04-08');
    expect(dateConflict?.severity).toBe('high');

    // Verify a review item was generated for the review queue
    const reviewItem = generatedReviewItems.find(r => r.type === 'contradiction');
    expect(reviewItem).toBeDefined();
    expect(reviewItem?.severity).toBe('high');
  });
});
