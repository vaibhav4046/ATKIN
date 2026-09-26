/**
 * ATKIN Sovereign Legal OS — Provenance Citation Gate
 * 
 * Independently verifies byte-level provenance and integrity of citations:
 * - Matter boundary enforcement
 * - Permitted document validation
 * - Document version and content hash matching
 * - Span ownership and offset bounds checking
 * - Exact-text and exact-text SHA-256 matching
 * - Quoted substring fidelity
 * 
 * Strictly separates syntactic provenance from semantic/legal interpretation.
 */

import { sha256Hex } from './auditLedger.ts';
import type { Span, Document } from '../../types/index.ts';

export type CitationStatus = 
  | 'VERIFIED'
  | 'MISSING_SOURCE'
  | 'WRONG_MATTER'
  | 'VERSION_MISMATCH'
  | 'INVALID_SPAN'
  | 'TEXT_MISMATCH'
  | 'STALE_VERSION';

export interface CitationBinding {
  spanId: string;
  documentId: string;
  documentVersionId?: string;
  matterId: string;
  startOffset: number;
  endOffset: number;
  exactText: string;
  exactTextSha256?: string;
  documentSha256?: string;
  quotedSubstring: string;
}

export interface CitationVerification {
  citationId: string;
  spanId: string;
  documentId: string;
  status: CitationStatus;
  isValid: boolean;
  failureReason?: string;
  checkedAt: string;
  details: {
    matterMatch: boolean;
    documentFound: boolean;
    versionMatch: boolean;
    hashMatch: boolean;
    spanBoundsValid: boolean;
    textFidelity: boolean;
  };
}

export interface DocumentRecord {
  id: string;
  matterId: string;
  currentVersionId: string;
  sha256: string;
  content: string;
  versions?: Array<{
    versionId: string;
    sha256: string;
    content: string;
  }>;
}

export class CitationGate {
  /**
   * Independently verifies citation bindings against canonical storage records.
   */
  public static verifyBinding(
    binding: CitationBinding,
    context: {
      activeMatterId: string;
      allowedDocumentIds?: string[];
      documents: Map<string, DocumentRecord>;
      spans: Map<string, Span>;
    }
  ): CitationVerification {
    const citationId = `cite-${binding.spanId}-${Date.now()}`;
    const checkedAt = new Date().toISOString();

    const details = {
      matterMatch: false,
      documentFound: false,
      versionMatch: false,
      hashMatch: false,
      spanBoundsValid: false,
      textFidelity: false
    };

    // 1. Matter Scope Check
    if (binding.matterId !== context.activeMatterId) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'WRONG_MATTER',
        isValid: false,
        failureReason: `Matter boundary violation: citation belongs to matter ${binding.matterId}, active matter is ${context.activeMatterId}`,
        checkedAt,
        details
      };
    }
    details.matterMatch = true;

    // 2. Permitted Document Check
    if (context.allowedDocumentIds && !context.allowedDocumentIds.includes(binding.documentId)) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'MISSING_SOURCE',
        isValid: false,
        failureReason: `Document ${binding.documentId} is not in the permitted source selection for this task.`,
        checkedAt,
        details
      };
    }

    const doc = context.documents.get(binding.documentId);
    if (!doc) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'MISSING_SOURCE',
        isValid: false,
        failureReason: `Referenced document ${binding.documentId} does not exist in matter record.`,
        checkedAt,
        details
      };
    }
    details.documentFound = true;

    // 3. Document Version Check
    if (binding.documentVersionId && doc.currentVersionId !== binding.documentVersionId) {
      // Check if version exists in history
      const hasOldVersion = doc.versions?.some(v => v.versionId === binding.documentVersionId);
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: hasOldVersion ? 'STALE_VERSION' : 'VERSION_MISMATCH',
        isValid: false,
        failureReason: hasOldVersion
          ? `Citation references superseded document version ${binding.documentVersionId}. Current version is ${doc.currentVersionId}.`
          : `Document version ${binding.documentVersionId} not recognized.`,
        checkedAt,
        details
      };
    }
    details.versionMatch = true;

    // 4. Document Content SHA-256 Check
    if (binding.documentSha256 && doc.sha256 !== binding.documentSha256) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'VERSION_MISMATCH',
        isValid: false,
        failureReason: `Document content SHA-256 mismatch: expected ${doc.sha256}, found ${binding.documentSha256}`,
        checkedAt,
        details
      };
    }
    details.hashMatch = true;

    // 5. Span Ownership & Bounds Check
    const storedSpan = context.spans.get(binding.spanId);
    if (!storedSpan) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'INVALID_SPAN',
        isValid: false,
        failureReason: `Span ID ${binding.spanId} does not exist in matter span index.`,
        checkedAt,
        details
      };
    }

    if (
      storedSpan.startOffset !== binding.startOffset ||
      storedSpan.endOffset !== binding.endOffset ||
      storedSpan.documentId !== binding.documentId
    ) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'INVALID_SPAN',
        isValid: false,
        failureReason: `Span bounds mismatch for ${binding.spanId}: expected [${storedSpan.startOffset}, ${storedSpan.endOffset}], citation supplied [${binding.startOffset}, ${binding.endOffset}]`,
        checkedAt,
        details
      };
    }
    details.spanBoundsValid = true;

    // 6. Text Fidelity & SHA-256 Check
    if (storedSpan.exactText !== binding.exactText) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'TEXT_MISMATCH',
        isValid: false,
        failureReason: 'Stored span text does not match citation exactText.',
        checkedAt,
        details
      };
    }

    // Verify exact-text SHA-256
    const computedTextSha = sha256Hex(storedSpan.exactText);
    if (binding.exactTextSha256 && binding.exactTextSha256 !== computedTextSha) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'TEXT_MISMATCH',
        isValid: false,
        failureReason: `Span exact-text SHA-256 integrity failed: expected ${computedTextSha}, found ${binding.exactTextSha256}`,
        checkedAt,
        details
      };
    }

    // 7. Quoted Substring Fidelity Check
    if (binding.quotedSubstring && !storedSpan.exactText.includes(binding.quotedSubstring)) {
      return {
        citationId,
        spanId: binding.spanId,
        documentId: binding.documentId,
        status: 'TEXT_MISMATCH',
        isValid: false,
        failureReason: `Quoted substring "${binding.quotedSubstring}" is not present in stored span text.`,
        checkedAt,
        details
      };
    }
    details.textFidelity = true;

    return {
      citationId,
      spanId: binding.spanId,
      documentId: binding.documentId,
      status: 'VERIFIED',
      isValid: true,
      checkedAt,
      details
    };
  }

  /**
   * Batch verifies all citations produced by a model or tool output
   */
  public static verifyAll(
    bindings: CitationBinding[],
    context: {
      activeMatterId: string;
      allowedDocumentIds?: string[];
      documents: Map<string, DocumentRecord>;
      spans: Map<string, Span>;
    }
  ): {
    allValid: boolean;
    verifications: CitationVerification[];
    verifiedCount: number;
    failedCount: number;
  } {
    const verifications = bindings.map(b => this.verifyBinding(b, context));
    const verifiedCount = verifications.filter(v => v.isValid).length;
    const failedCount = verifications.length - verifiedCount;

    return {
      allValid: failedCount === 0,
      verifications,
      verifiedCount,
      failedCount
    };
  }
}
