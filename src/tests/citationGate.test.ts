import { describe, it, expect } from 'vitest';
import { CitationGate, type CitationBinding, type DocumentRecord } from '../engine/protocol/citationGate.ts';
import { sha256Hex } from '../engine/protocol/auditLedger.ts';
import type { Span } from '../types/index.ts';

describe('CitationGate — Strict Independent Provenance Verification', () => {
  const matterA = 'matter-alder-peak';
  const matterB = 'matter-unrelated';

  const doc1Content = 'Clause 3.2: Notice of termination without cause shall be 37 calendar days in writing.';
  const doc1Sha256 = sha256Hex(doc1Content);

  const testDocuments = new Map<string, DocumentRecord>([
    [
      'doc-001',
      {
        id: 'doc-001',
        matterId: matterA,
        currentVersionId: 'v2',
        sha256: doc1Sha256,
        content: doc1Content,
        versions: [
          { versionId: 'v1', sha256: 'oldhash123', content: 'Old terms' },
          { versionId: 'v2', sha256: doc1Sha256, content: doc1Content }
        ]
      }
    ]
  ]);

  const testSpans = new Map<string, Span>([
    [
      'span-cl-3.2',
      {
        id: 'span-cl-3.2',
        documentId: 'doc-001',
        startOffset: 0,
        endOffset: doc1Content.length,
        exactText: doc1Content,
        checksum: sha256Hex(doc1Content)
      }
    ]
  ]);

  const validBinding: CitationBinding = {
    spanId: 'span-cl-3.2',
    documentId: 'doc-001',
    documentVersionId: 'v2',
    matterId: matterA,
    startOffset: 0,
    endOffset: doc1Content.length,
    exactText: doc1Content,
    exactTextSha256: sha256Hex(doc1Content),
    documentSha256: doc1Sha256,
    quotedSubstring: '37 calendar days'
  };

  it('verifies valid citation matching exact byte offsets, text, and hashes', () => {
    const result = CitationGate.verifyBinding(validBinding, {
      activeMatterId: matterA,
      documents: testDocuments,
      spans: testSpans
    });

    expect(result.status).toBe('VERIFIED');
    expect(result.isValid).toBe(true);
    expect(result.details.matterMatch).toBe(true);
    expect(result.details.textFidelity).toBe(true);
  });

  it('flags WRONG_MATTER when citation originates from a foreign matter', () => {
    const crossMatterBinding = { ...validBinding, matterId: matterB };
    const result = CitationGate.verifyBinding(crossMatterBinding, {
      activeMatterId: matterA,
      documents: testDocuments,
      spans: testSpans
    });

    expect(result.status).toBe('WRONG_MATTER');
    expect(result.isValid).toBe(false);
    expect(result.failureReason).toContain('Matter boundary violation');
  });

  it('flags MISSING_SOURCE when document is not in permitted source list or missing', () => {
    const restrictedContext = {
      activeMatterId: matterA,
      allowedDocumentIds: ['doc-other-only'],
      documents: testDocuments,
      spans: testSpans
    };

    const result = CitationGate.verifyBinding(validBinding, restrictedContext);
    expect(result.status).toBe('MISSING_SOURCE');
    expect(result.isValid).toBe(false);
    expect(result.failureReason).toContain('not in the permitted source selection');
  });

  it('flags STALE_VERSION when citation points to an older document version in history', () => {
    const staleBinding = { ...validBinding, documentVersionId: 'v1' };
    const result = CitationGate.verifyBinding(staleBinding, {
      activeMatterId: matterA,
      documents: testDocuments,
      spans: testSpans
    });

    expect(result.status).toBe('STALE_VERSION');
    expect(result.isValid).toBe(false);
    expect(result.failureReason).toContain('superseded document version');
  });

  it('flags VERSION_MISMATCH when document content SHA-256 does not match', () => {
    const tamperedBinding = { ...validBinding, documentSha256: 'tampered-hash-00000000000000000000000000000000' };
    const result = CitationGate.verifyBinding(tamperedBinding, {
      activeMatterId: matterA,
      documents: testDocuments,
      spans: testSpans
    });

    expect(result.status).toBe('VERSION_MISMATCH');
    expect(result.isValid).toBe(false);
    expect(result.failureReason).toContain('content SHA-256 mismatch');
  });

  it('flags INVALID_SPAN when character offsets are incorrect', () => {
    const badOffsetBinding = { ...validBinding, startOffset: 5, endOffset: 25 };
    const result = CitationGate.verifyBinding(badOffsetBinding, {
      activeMatterId: matterA,
      documents: testDocuments,
      spans: testSpans
    });

    expect(result.status).toBe('INVALID_SPAN');
    expect(result.isValid).toBe(false);
    expect(result.failureReason).toContain('Span bounds mismatch');
  });

  it('flags TEXT_MISMATCH when quoted substring does not exist in source text', () => {
    const halluncinatedQuoteBinding = { ...validBinding, quotedSubstring: '60 business days' };
    const result = CitationGate.verifyBinding(halluncinatedQuoteBinding, {
      activeMatterId: matterA,
      documents: testDocuments,
      spans: testSpans
    });

    expect(result.status).toBe('TEXT_MISMATCH');
    expect(result.isValid).toBe(false);
    expect(result.failureReason).toContain('Quoted substring "60 business days" is not present');
  });

  it('batch verifies multiple citations accurately', () => {
    const batch = [
      validBinding,
      { ...validBinding, quotedSubstring: 'invented phrase' }
    ];

    const summary = CitationGate.verifyAll(batch, {
      activeMatterId: matterA,
      documents: testDocuments,
      spans: testSpans
    });

    expect(summary.allValid).toBe(false);
    expect(summary.verifiedCount).toBe(1);
    expect(summary.failedCount).toBe(1);
    expect(summary.verifications[0].status).toBe('VERIFIED');
    expect(summary.verifications[1].status).toBe('TEXT_MISMATCH');
  });
});
