import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  db, 
  seedInitialFixturesIfEmpty, 
  getMattersFromDB, 
  saveMatterToDB, 
  loadMatterEntitiesFromDB, 
  persistIngestionResultToDB, 
  saveDraftToDB, 
  saveClaimToDB, 
  deleteClaimFromDB, 
  saveReviewItemToDB 
} from '../db/index.ts';
import type { Matter, Document, Span, Claim, Draft, ReviewItem } from '../types/index.ts';

describe('Proofline IndexedDB Persistence Service', () => {
  beforeEach(async () => {
    await db.matters.clear();
    await db.documents.clear();
    await db.spans.clear();
    await db.claims.clear();
    await db.authorities.clear();
    await db.drafts.clear();
    await db.reviewItems.clear();
  });

  it('seeds initial fixtures with isDemo: true when database is empty', async () => {
    const seeded = await seedInitialFixturesIfEmpty();
    expect(seeded).toBe(true);

    const matters = await getMattersFromDB();
    expect(matters.length).toBeGreaterThanOrEqual(4);
    expect(matters.every(m => m.isDemo === true)).toBe(true);

    // Calling it again should not re-seed
    const seededAgain = await seedInitialFixturesIfEmpty();
    expect(seededAgain).toBe(false);
  });

  it('persists a new real user matter and retrieves it cleanly', async () => {
    const newMatter: Matter = {
      id: 'matter-real-999',
      title: 'Apex Dynamics v Sovereign Cloud Corp',
      jurisdiction: 'England and Wales',
      clientAlias: 'Apex Legal Team',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };

    await saveMatterToDB(newMatter);

    const allMatters = await getMattersFromDB();
    const found = allMatters.find(m => m.id === newMatter.id);
    expect(found).toBeDefined();
    expect(found?.isDemo).toBe(false);
    expect(found?.title).toBe('Apex Dynamics v Sovereign Cloud Corp');
  });

  it('persists an ingested document, its spans, extracted claims, and draft blocks', async () => {
    const doc: Document = {
      id: 'doc-contract-1',
      matterId: 'matter-real-999',
      filename: 'Master_Services_Agreement_2026.txt',
      mime: 'text/plain',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      importedAt: new Date().toISOString(),
      sourceDate: '2026-02-14',
      extractionStatus: 'success',
      pageCount: 4,
      text: 'Clause 8.1: Customer indemnity shall be capped at 100% of aggregate fees.',
      privacyLabel: 'Browser-local verified'
    };

    const span: Span = {
      id: 'span-c1',
      documentId: doc.id,
      startOffset: 0,
      endOffset: 73,
      exactText: 'Clause 8.1: Customer indemnity shall be capped at 100% of aggregate fees.',
      checksum: 'sha256-c1'
    };

    const claim: Claim = {
      id: 'claim-c1',
      matterId: 'matter-real-999',
      statement: 'Customer indemnity is subject to a 100% aggregate fee limitation.',
      kind: 'fact',
      polarity: 'favourable',
      status: 'supported',
      provenanceEdges: [
        {
          id: 'edge-c1',
          claimId: 'claim-c1',
          spanId: 'span-c1',
          type: 'supports',
          author: 'model',
          rationale: 'Literal clause wording',
          reviewState: 'approved',
          createdAt: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    };

    const reviewItem: ReviewItem = {
      id: 'rev-c1',
      matterId: 'matter-real-999',
      type: 'contract_risk',
      severity: 'medium',
      title: 'Uncapped aggregate indemnity audit required',
      description: 'Check if bilateral reciprocity applies',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const draft: Draft = {
      id: 'draft-c1',
      matterId: 'matter-real-999',
      type: 'matter_brief',
      title: 'Contractual Assessment Brief',
      blocks: [
        {
          id: 'block-1',
          heading: 'Indemnity Risk Assessment',
          text: 'The proposed clause limits customer liability to 100% of fees paid.',
          claimIds: [claim.id],
          spanIds: [span.id],
          reviewStatus: 'verified'
        }
      ],
      generatedBy: 'deterministic_offline',
      reviewStatus: 'needs_review',
      updatedAt: new Date().toISOString()
    };

    await persistIngestionResultToDB({
      document: doc,
      spans: [span],
      claims: [claim],
      reviewItems: [reviewItem],
      draft
    });

    // Rehydrate entities for matter
    const entities = await loadMatterEntitiesFromDB('matter-real-999');
    expect(entities.documents.length).toBe(1);
    expect(entities.documents[0].filename).toBe('Master_Services_Agreement_2026.txt');
    expect(entities.spans.length).toBe(1);
    expect(entities.claims.length).toBe(1);
    expect(entities.reviewItems.length).toBe(1);
    expect(entities.draft?.title).toBe('Contractual Assessment Brief');
  });

  it('updates draft blocks and review items with persistence', async () => {
    const draft: Draft = {
      id: 'draft-upd-1',
      matterId: 'matter-test-888',
      type: 'matter_brief',
      title: 'Initial Brief',
      blocks: [{ id: 'b1', text: 'Original paragraph.', claimIds: [], spanIds: [], reviewStatus: 'needs_review' }],
      generatedBy: 'deterministic_offline',
      reviewStatus: 'needs_review',
      updatedAt: new Date().toISOString()
    };
    await saveDraftToDB(draft);

    // Modify draft block
    const updatedDraft: Draft = {
      ...draft,
      blocks: [{ id: 'b1', text: 'Revised paragraph with solicitor approval.', claimIds: [], spanIds: [], reviewStatus: 'verified' }],
      updatedAt: new Date().toISOString()
    };
    await saveDraftToDB(updatedDraft);

    const reloaded = await loadMatterEntitiesFromDB('matter-test-888');
    expect(reloaded.draft?.blocks[0].text).toBe('Revised paragraph with solicitor approval.');
    expect(reloaded.draft?.blocks[0].reviewStatus).toBe('verified');
  });

  it('manages claim lifecycle: add, update, and delete', async () => {
    const claim: Claim = {
      id: 'claim-lifecycle-1',
      matterId: 'matter-test-888',
      statement: 'Initial factual assertion',
      kind: 'fact',
      polarity: 'neutral',
      status: 'unverified',
      provenanceEdges: [],
      updatedAt: new Date().toISOString()
    };

    await saveClaimToDB(claim);
    let entities = await loadMatterEntitiesFromDB('matter-test-888');
    expect(entities.claims.length).toBe(1);

    // Update claim
    const updatedClaim: Claim = { ...claim, status: 'supported', polarity: 'favourable' };
    await saveClaimToDB(updatedClaim);
    entities = await loadMatterEntitiesFromDB('matter-test-888');
    expect(entities.claims[0].status).toBe('supported');

    // Delete claim
    await deleteClaimFromDB(claim.id);
    entities = await loadMatterEntitiesFromDB('matter-test-888');
    expect(entities.claims.length).toBe(0);
  });
});
