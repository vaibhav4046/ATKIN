import type { Claim, Span, ReviewItem } from '../types/index.ts';

export interface ContradictionPair {
  id: string;
  claimA: Claim;
  claimB: Claim;
  spanA?: Span;
  spanB?: Span;
  summary: string;
  neutralQuestion: string;
  severity: 'high' | 'medium';
}

export function detectContradictions(
  claims: Claim[], 
  spansById: Map<string, Span>
): {
  contradictions: ContradictionPair[];
  generatedReviewItems: ReviewItem[];
} {
  const contradictions: ContradictionPair[] = [];
  const generatedReviewItems: ReviewItem[] = [];

  // 1. Scan for explicit edges marked 'contradicts'
  for (const claim of claims) {
    for (const edge of claim.provenanceEdges) {
      if (edge.type === 'contradicts') {
        const opposingSpan = spansById.get(edge.spanId);
        // Find if another claim owns this opposing span
        const opposingClaim = claims.find(c => 
          c.id !== claim.id && c.provenanceEdges.some(e => e.spanId === edge.spanId)
        );

        if (opposingClaim) {
          const primarySpan = claim.provenanceEdges.find(e => e.type === 'supports') 
            ? spansById.get(claim.provenanceEdges.find(e => e.type === 'supports')!.spanId)
            : undefined;

          const pairId = `contra-${[claim.id, opposingClaim.id].sort().join('-')}`;
          
          // Avoid duplicate pairs
          if (!contradictions.some(c => c.id === pairId)) {
            const pair: ContradictionPair = {
              id: pairId,
              claimA: claim,
              claimB: opposingClaim,
              spanA: primarySpan,
              spanB: opposingSpan,
              summary: `Contradiction between "${claim.statement.slice(0, 50)}..." and "${opposingClaim.statement.slice(0, 50)}..."`,
              neutralQuestion: `Factual conflict regarding dates/events: Does the client recall an earlier support call on ${opposingClaim.temporalScope || 'earlier date'}, or was ${claim.temporalScope || 'the later date'} the first notification?`,
              severity: 'high'
            };
            contradictions.push(pair);

            generatedReviewItems.push({
              id: `rev-${pairId}`,
              matterId: claim.matterId,
              type: 'contradiction',
              severity: 'high',
              title: `Adverse Factual Contradiction: ${claim.temporalScope || 'Claim'} vs ${opposingClaim.temporalScope || 'Counter-record'}`,
              description: pair.neutralQuestion,
              targetId: claim.id,
              targetType: 'claim',
              status: 'pending',
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    }
  }

  // 2. Scan for temporal discrepancies between claims discussing failure onset
  const failureClaims = claims.filter(c => 
    c.temporalScope && (c.statement.toLowerCase().includes('fail') || c.statement.toLowerCase().includes('freeze'))
  );

  for (let i = 0; i < failureClaims.length; i++) {
    for (let j = i + 1; j < failureClaims.length; j++) {
      const c1 = failureClaims[i];
      const c2 = failureClaims[j];
      if (c1.temporalScope !== c2.temporalScope) {
        const pairId = `contra-temp-${[c1.id, c2.id].sort().join('-')}`;
        if (!contradictions.some(c => c.id === pairId)) {
          const pair: ContradictionPair = {
            id: pairId,
            claimA: c1,
            claimB: c2,
            summary: `Temporal discrepancy: Onset reported as ${c1.temporalScope} vs ${c2.temporalScope}`,
            neutralQuestion: `Timeline discrepancy between records: Please verify whether incident onset was ${c1.temporalScope} or ${c2.temporalScope}.`,
            severity: 'high'
          };
          contradictions.push(pair);
        }
      }
    }
  }

  return { contradictions, generatedReviewItems };
}
