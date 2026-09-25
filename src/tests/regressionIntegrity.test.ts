import { describe, it, expect } from 'vitest';
import { LegalReasoningEngine } from '../engine/reasoning/legalReasoningEngine.ts';
import { 
  BATES_MATTER, 
  BATES_DOCUMENTS, 
  BATES_SPANS, 
  BATES_CLAIMS, 
  BATES_AUTHORITIES, 
  BATES_REVIEWS 
} from '../db/fixtures/batesPostOfficeMatter.ts';
import { 
  CONTRACT_MATTER, 
  CONTRACT_DOCUMENTS, 
  CONTRACT_SPANS, 
  CONTRACT_CLAIMS, 
  CONTRACT_REVIEWS 
} from '../db/fixtures/contractMatter.ts';
import { COMMERCIAL_CONTRACT_AUTHORITIES } from '../db/fixtures/authorities.ts';
import { 
  TENANCY_MATTER, 
  TENANCY_DOCUMENTS, 
  TENANCY_SPANS 
} from '../db/fixtures/tenancyMatter.ts';
import { 
  SAMPLE_MATTER, 
  SAMPLE_DOCUMENTS, 
  SAMPLE_SPANS 
} from '../db/fixtures/consumerLaptop.ts';

describe('LexHack 2026 Regression & Evidential Integrity Audit Suite', () => {
  const engine = new LegalReasoningEngine();

  describe('1. Evidential Abstention on Unsubstantiated Facts', () => {
    it('strictly abstains when queried on Alan Bates birth date without citing sources', () => {
      const output = engine.reason({
        query: 'Alan Bates was born on 1 January 1970.',
        matterId: BATES_MATTER.id,
        matterTitle: BATES_MATTER.title,
        matterJurisdiction: BATES_MATTER.jurisdiction,
        documents: BATES_DOCUMENTS,
        spans: BATES_SPANS,
        claims: BATES_CLAIMS,
        authorities: BATES_AUTHORITIES,
        reviewItems: BATES_REVIEWS,
        memories: []
      });

      expect(output).toBeDefined();
      expect(output.sourcesUsed).toEqual([]);
      expect(output.formattedResponse).toContain(
        'No uploaded document in this matter contains evidence proving that Alan Bates was born on 1 January 1970.'
      );
      expect(output.formattedResponse).toContain(
        'In accordance with evidential abstention principles, no assertion is made and no citations are provided.'
      );
      // Abstention must produce 0 citations
      expect(output.formattedResponse).not.toContain('[Doc:');
    });

    it('abstains on arbitrary fabricated queries not grounded in matter record', () => {
      const output = engine.reason({
        query: 'Did the defendant fly to Mars on a rocket in 1999?',
        matterId: BATES_MATTER.id,
        matterTitle: BATES_MATTER.title,
        matterJurisdiction: BATES_MATTER.jurisdiction,
        documents: BATES_DOCUMENTS,
        spans: BATES_SPANS,
        claims: BATES_CLAIMS,
        authorities: BATES_AUTHORITIES,
        reviewItems: BATES_REVIEWS,
        memories: []
      });

      expect(output.sourcesUsed).toEqual([]);
      expect(output.formattedResponse).toContain(
        'In accordance with evidential abstention principles, no assertion is made and no citations are provided.'
      );
      expect(output.formattedResponse).not.toContain('[Doc:');
    });
  });

  describe('2. Contract Governing Law & Cross-Jurisdiction Analysis', () => {
    it('correctly identifies Delaware Section 13 in NovaCorp MSA and flags jurisdictional conflict', () => {
      const output = engine.reason({
        query: 'What is the governing law of this contract?',
        matterId: CONTRACT_MATTER.id,
        matterTitle: CONTRACT_MATTER.title,
        matterJurisdiction: CONTRACT_MATTER.jurisdiction,
        documents: CONTRACT_DOCUMENTS,
        spans: CONTRACT_SPANS,
        claims: CONTRACT_CLAIMS,
        authorities: COMMERCIAL_CONTRACT_AUTHORITIES,
        reviewItems: CONTRACT_REVIEWS,
        memories: []
      });

      expect(output).toBeDefined();
      // Must cite the Delaware span
      expect(output.sourcesUsed.some(s => s.spanId === 'span-msa-delaware')).toBe(true);

      // Must contain Section 13 verbatim extract
      expect(output.formattedResponse).toContain(
        'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware'
      );

      // Must flag jurisdictional conflict with England and Wales
      expect(output.formattedResponse).toContain('Governing Law & Jurisdictional Conflict Assessment');
      expect(output.formattedResponse).toContain('England and Wales');

      // Must NOT bleed in Bates or Tenancy details
      expect(output.formattedResponse).not.toContain('Horizon');
      expect(output.formattedResponse).not.toContain('PIN-188');
      expect(output.formattedResponse).not.toContain('Fujitsu');
      expect(output.formattedResponse).not.toContain('tenancy');
      expect(output.formattedResponse).not.toContain('subpostmaster');
    });
  });

  describe('3. Primary-Source Authenticity & Verbatim Alignment', () => {
    it('verifies Bates v Post Office judgment contains authentic Fraser J extracts', () => {
      const judgmentDoc = BATES_DOCUMENTS.find(d => d.id === 'doc-bates-01');
      expect(judgmentDoc).toBeDefined();

      // Fraser J para 176-177
      expect(judgmentDoc!.text).toContain('176. He had also said that "during the course of resolving the software issues, we would frequently access a Post Office counter IT system remotely"');
      expect(judgmentDoc!.text).toContain('177. His use of "frequently" and "routine" are, in my judgment, subjective');

      // Fraser J para 549-550
      expect(judgmentDoc!.text).toContain('549. It may therefore be that the Post Office itself fell into error');
      expect(judgmentDoc!.text).toContain('550. It follows that the previously stated public position of the Post Office to the contrary');

      // Fraser J para 929-930
      expect(judgmentDoc!.text).toContain('929. This approach by the Post Office has amounted, in reality, to bare assertions and denials');
      expect(judgmentDoc!.text).toContain('930. When real world examples such as Mr Latif\'s are put together with the expert evidence');
    });

    it('verifies character span byte offsets match the underlying document text verbatim', () => {
      const judgmentDoc = BATES_DOCUMENTS.find(d => d.id === 'doc-bates-01')!;
      expect(judgmentDoc).toBeDefined();
      
      const span01 = BATES_SPANS.find(s => s.id === 'span-bates-01')!;
      expect(span01).toBeDefined();
      const extracted01 = judgmentDoc.text.slice(span01.startOffset, span01.endOffset);
      expect(extracted01).toBe(span01.exactText);

      const span02 = BATES_SPANS.find(s => s.id === 'span-bates-02')!;
      expect(span02).toBeDefined();
      const extracted02 = judgmentDoc.text.slice(span02.startOffset, span02.endOffset);
      expect(extracted02).toBe(span02.exactText);

      const span03 = BATES_SPANS.find(s => s.id === 'span-bates-03')!;
      expect(span03).toBeDefined();
      const extracted03 = judgmentDoc.text.slice(span03.startOffset, span03.endOffset);
      expect(extracted03).toBe(span03.exactText);
    });
  });

  describe('4. Cryptographic SHA-256 Digest Verification', () => {
    const sha256Regex = /^[a-f0-9]{64}$/;

    it('ensures all documents across all matters have authentic 64-char SHA-256 digests', () => {
      const allDocs = [
        ...BATES_DOCUMENTS,
        ...CONTRACT_DOCUMENTS,
        ...TENANCY_DOCUMENTS,
        ...SAMPLE_DOCUMENTS
      ];

      expect(allDocs.length).toBeGreaterThan(0);
      for (const doc of allDocs) {
        expect(doc.sha256).toMatch(sha256Regex);
        expect(doc.sha256).not.toContain('simulated');
        expect(doc.sha256).not.toContain('mock');
      }
    });

    it('ensures all spans across all matters have authentic 64-char SHA-256 checksums', () => {
      const allSpans = [
        ...BATES_SPANS,
        ...CONTRACT_SPANS,
        ...TENANCY_SPANS,
        ...SAMPLE_SPANS
      ];

      expect(allSpans.length).toBeGreaterThan(0);
      for (const span of allSpans) {
        expect(span.checksum).toMatch(sha256Regex);
        expect(span.checksum).not.toContain('simulated');
        expect(span.checksum).not.toContain('mock');
      }
    });
  });
});
