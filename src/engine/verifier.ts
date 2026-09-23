import type { Span, Document, Claim, Authority } from '../types/index.ts';

export interface VerificationResult {
  isValid: boolean;
  code: 'VERIFIED' | 'MISSING_SPAN' | 'TEXT_MISMATCH' | 'CORRUPTED_OFFSETS' | 'INERT_INJECTION_DETECTED';
  detail: string;
}

export function verifySpanGrounding(span: Span, doc: Document): VerificationResult {
  if (!doc || doc.id !== span.documentId) {
    return {
      isValid: false,
      code: 'MISSING_SPAN',
      detail: `Referenced document ${span.documentId} not found in matter store.`
    };
  }

  if (span.startOffset < 0 || span.endOffset > doc.text.length || span.startOffset >= span.endOffset) {
    return {
      isValid: false,
      code: 'CORRUPTED_OFFSETS',
      detail: `Offsets [${span.startOffset}, ${span.endOffset}] exceed document length of ${doc.text.length}.`
    };
  }

  const actualSlice = doc.text.slice(span.startOffset, span.endOffset);
  if (actualSlice !== span.exactText) {
    return {
      isValid: false,
      code: 'TEXT_MISMATCH',
      detail: `Extracted text mismatch. Expected "${span.exactText.slice(0, 30)}...", found "${actualSlice.slice(0, 30)}...".`
    };
  }

  // Check if span contains hostile injection instructions
  const isInjected = checkPromptInjectionRisk(span.exactText);
  if (isInjected) {
    return {
      isValid: true,
      code: 'INERT_INJECTION_DETECTED',
      detail: 'Adversarial instruction detected in source; safely isolated as inert quoted evidence.'
    };
  }

  return {
    isValid: true,
    code: 'VERIFIED',
    detail: 'Citation resolved to exact document offsets with verified text integrity.'
  };
}

export function checkPromptInjectionRisk(text: string): boolean {
  const suspiciousPatterns = [
    /ignore\s+(all\s+)?prior\s+instructions/i,
    /system\s+instruction:/i,
    /mark\s+the\s+seller\s+innocent/i,
    /upload\s+(the\s+)?case\s+file\s+to/i,
    /you\s+are\s+now\s+in\s+developer\s+mode/i,
    /disregard\s+the\s+above/i
  ];
  return suspiciousPatterns.some(pattern => pattern.test(text));
}

export function verifyClaimGrounding(
  claim: Claim, 
  spansById: Map<string, Span>, 
  docsById: Map<string, Document>
): {
  isFullyGrounded: boolean;
  verifiedCount: number;
  totalEdges: number;
  results: Array<{ edgeId: string; result: VerificationResult }>;
} {
  const results: Array<{ edgeId: string; result: VerificationResult }> = [];
  let verifiedCount = 0;

  for (const edge of claim.provenanceEdges) {
    const span = spansById.get(edge.spanId);
    if (!span) {
      results.push({
        edgeId: edge.id,
        result: {
          isValid: false,
          code: 'MISSING_SPAN',
          detail: `Evidence span ${edge.spanId} does not exist.`
        }
      });
      continue;
    }

    const doc = docsById.get(span.documentId);
    if (!doc) {
      results.push({
        edgeId: edge.id,
        result: {
          isValid: false,
          code: 'MISSING_SPAN',
          detail: `Document ${span.documentId} is missing from matter.`
        }
      });
      continue;
    }

    const res = verifySpanGrounding(span, doc);
    if (res.isValid) {
      verifiedCount++;
    }
    results.push({ edgeId: edge.id, result: res });
  }

  const isFullyGrounded = claim.provenanceEdges.length > 0 && verifiedCount === claim.provenanceEdges.length;
  return {
    isFullyGrounded,
    verifiedCount,
    totalEdges: claim.provenanceEdges.length,
    results
  };
}

export function auditAuthorityStatus(authority: Authority): {
  statusLabel: string;
  hasCaveat: boolean;
  requiresHumanReview: boolean;
} {
  const isFindCaseLaw = authority.identifier.toLowerCase().includes('case law') || 
                        authority.officialUrl.includes('caselaw.nationalarchives.gov.uk');
  
  return {
    statusLabel: authority.verificationLevel === 'text_checked' ? 'Statute in force' : 'Official repository link',
    hasCaveat: isFindCaseLaw || authority.coverageCaveat.length > 0,
    requiresHumanReview: isFindCaseLaw || authority.verificationLevel !== 'text_checked'
  };
}
