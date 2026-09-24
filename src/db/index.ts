import Dexie, { type Table } from 'dexie';
import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  EvidenceEdge, 
  Authority, 
  Draft, 
  ReviewItem 
} from '../types/index.ts';

import { 
  BATES_MATTER, 
  BATES_DOCUMENTS, 
  BATES_SPANS, 
  BATES_CLAIMS, 
  BATES_REVIEWS, 
  BATES_DRAFT,
  BATES_AUTHORITIES
} from './fixtures/batesPostOfficeMatter.ts';
import { 
  CONTRACT_MATTER, 
  CONTRACT_DOCUMENTS, 
  CONTRACT_SPANS, 
  CONTRACT_CLAIMS, 
  CONTRACT_REVIEWS, 
  CONTRACT_DRAFT 
} from './fixtures/contractMatter.ts';
import { 
  TENANCY_MATTER, 
  TENANCY_DOCUMENTS, 
  TENANCY_SPANS, 
  TENANCY_CLAIMS, 
  TENANCY_REVIEWS, 
  TENANCY_DRAFT 
} from './fixtures/tenancyMatter.ts';
import { 
  SAMPLE_MATTER, 
  SAMPLE_DOCUMENTS, 
  SAMPLE_SPANS, 
  SAMPLE_CLAIMS, 
  SAMPLE_REVIEW_ITEMS, 
  SAMPLE_DRAFT 
} from './fixtures/consumerLaptop.ts';
import { 
  CRA_2015_AUTHORITIES, 
  COMMERCIAL_CONTRACT_AUTHORITIES, 
  TENANCY_HOUSING_AUTHORITIES 
} from './fixtures/authorities.ts';

export class ProoflineDatabase extends Dexie {
  matters!: Table<Matter, string>;
  documents!: Table<Document, string>;
  spans!: Table<Span, string>;
  claims!: Table<Claim, string>;
  edges!: Table<EvidenceEdge, string>;
  authorities!: Table<Authority, string>;
  drafts!: Table<Draft, string>;
  reviewItems!: Table<ReviewItem, string>;

  constructor() {
    super('ProoflineLocalDB');
    this.version(1).stores({
      matters: 'id, title, jurisdiction, clientAlias, status, createdAt, updatedAt',
      documents: 'id, matterId, filename, sha256, sourceDate, importedAt',
      spans: 'id, documentId, checksum',
      claims: 'id, matterId, kind, status, polarity, updatedAt',
      edges: 'id, claimId, spanId, type, reviewState',
      authorities: 'id, identifier, jurisdiction, verificationLevel',
      drafts: 'id, matterId, type, reviewStatus, updatedAt',
      reviewItems: 'id, matterId, type, severity, status, createdAt'
    });
  }
}

export const db = new ProoflineDatabase();

/**
 * Seed initial sample matters into IndexedDB if database is freshly initialized.
 * Marks sample matters with isDemo: true so the user clearly distinguishes synthetic
 * demonstration records from their private client records.
 */
export async function seedInitialFixturesIfEmpty(): Promise<boolean> {
  try {
    const matterCount = await db.matters.count();
    if (matterCount > 0) {
      return false; // Database already has persisted records
    }

    await db.transaction('rw', [
      db.matters, 
      db.documents, 
      db.spans, 
      db.claims, 
      db.authorities, 
      db.drafts, 
      db.reviewItems
    ], async () => {
      // 1. Bates Post Office Matter
      await db.matters.put({ ...BATES_MATTER, isDemo: true });
      await db.documents.bulkPut(BATES_DOCUMENTS);
      await db.spans.bulkPut(BATES_SPANS);
      await db.claims.bulkPut(BATES_CLAIMS);
      await db.authorities.bulkPut(BATES_AUTHORITIES);
      await db.drafts.put(BATES_DRAFT);
      await db.reviewItems.bulkPut(BATES_REVIEWS);

      // 2. Contract Review Matter
      await db.matters.put({ ...CONTRACT_MATTER, isDemo: true });
      await db.documents.bulkPut(CONTRACT_DOCUMENTS);
      await db.spans.bulkPut(CONTRACT_SPANS);
      await db.claims.bulkPut(CONTRACT_CLAIMS);
      await db.authorities.bulkPut(COMMERCIAL_CONTRACT_AUTHORITIES);
      await db.drafts.put(CONTRACT_DRAFT);
      await db.reviewItems.bulkPut(CONTRACT_REVIEWS);

      // 3. Tenancy Matter
      await db.matters.put({ ...TENANCY_MATTER, isDemo: true });
      await db.documents.bulkPut(TENANCY_DOCUMENTS);
      await db.spans.bulkPut(TENANCY_SPANS);
      await db.claims.bulkPut(TENANCY_CLAIMS);
      await db.authorities.bulkPut(TENANCY_HOUSING_AUTHORITIES);
      await db.drafts.put(TENANCY_DRAFT);
      await db.reviewItems.bulkPut(TENANCY_REVIEWS);

      // 4. Consumer Laptop Matter
      await db.matters.put({ ...SAMPLE_MATTER, isDemo: true });
      await db.documents.bulkPut(SAMPLE_DOCUMENTS);
      await db.spans.bulkPut(SAMPLE_SPANS);
      await db.claims.bulkPut(SAMPLE_CLAIMS);
      await db.authorities.bulkPut(CRA_2015_AUTHORITIES);
      await db.drafts.put(SAMPLE_DRAFT);
      await db.reviewItems.bulkPut(SAMPLE_REVIEW_ITEMS);
    });

    return true;
  } catch (err) {
    console.warn('Proofline IndexedDB seeding notice:', err);
    return false;
  }
}

/**
 * Fetch all matters from IndexedDB.
 */
export async function getMattersFromDB(): Promise<Matter[]> {
  try {
    return await db.matters.toArray();
  } catch {
    return [BATES_MATTER, CONTRACT_MATTER, TENANCY_MATTER, SAMPLE_MATTER];
  }
}

/**
 * Save a matter to IndexedDB.
 */
export async function saveMatterToDB(matter: Matter): Promise<void> {
  try {
    await db.matters.put(matter);
  } catch (err) {
    console.error('Failed to save matter to IndexedDB:', err);
  }
}

/**
 * Load all entities for a specific matter from IndexedDB.
 */
export async function loadMatterEntitiesFromDB(matterId: string): Promise<{
  documents: Document[];
  spans: Span[];
  claims: Claim[];
  authorities: Authority[];
  draft: Draft | null;
  reviewItems: ReviewItem[];
}> {
  try {
    const documents = await db.documents.where('matterId').equals(matterId).toArray();
    const docIds = new Set(documents.map(d => d.id));
    
    const allSpans = await db.spans.toArray();
    const spans = allSpans.filter(s => docIds.has(s.documentId));

    const claims = await db.claims.where('matterId').equals(matterId).toArray();
    const authorities = await db.authorities.toArray();
    const drafts = await db.drafts.where('matterId').equals(matterId).toArray();
    const reviewItems = await db.reviewItems.where('matterId').equals(matterId).toArray();

    return {
      documents,
      spans,
      claims,
      authorities,
      draft: drafts[0] || null,
      reviewItems
    };
  } catch (err) {
    console.error('Failed to load matter entities from DB:', err);
    return {
      documents: [],
      spans: [],
      claims: [],
      authorities: [],
      draft: null,
      reviewItems: []
    };
  }
}

/**
 * Save an ingested document, its character spans, extracted claims, review items, and draft blocks.
 */
export async function persistIngestionResultToDB(params: {
  document: Document;
  spans: Span[];
  claims: Claim[];
  reviewItems: ReviewItem[];
  draft?: Draft;
}): Promise<void> {
  try {
    await db.transaction('rw', [
      db.documents, 
      db.spans, 
      db.claims, 
      db.reviewItems, 
      db.drafts
    ], async () => {
      await db.documents.put(params.document);
      if (params.spans.length > 0) {
        await db.spans.bulkPut(params.spans);
      }
      if (params.claims.length > 0) {
        await db.claims.bulkPut(params.claims);
      }
      if (params.reviewItems.length > 0) {
        await db.reviewItems.bulkPut(params.reviewItems);
      }
      if (params.draft) {
        await db.drafts.put(params.draft);
      }
    });
  } catch (err) {
    console.error('Failed to persist ingestion result to IndexedDB:', err);
  }
}

/**
 * Save draft revisions to IndexedDB.
 */
export async function saveDraftToDB(draft: Draft): Promise<void> {
  try {
    await db.drafts.put(draft);
  } catch (err) {
    console.error('Failed to save draft to IndexedDB:', err);
  }
}

/**
 * Save updated claims to IndexedDB.
 */
export async function saveClaimToDB(claim: Claim): Promise<void> {
  try {
    await db.claims.put(claim);
  } catch (err) {
    console.error('Failed to save claim to IndexedDB:', err);
  }
}

/**
 * Delete a claim from IndexedDB.
 */
export async function deleteClaimFromDB(claimId: string): Promise<void> {
  try {
    await db.claims.delete(claimId);
  } catch (err) {
    console.error('Failed to delete claim from IndexedDB:', err);
  }
}

/**
 * Save or update review items in IndexedDB.
 */
export async function saveReviewItemToDB(item: ReviewItem): Promise<void> {
  try {
    await db.reviewItems.put(item);
  } catch (err) {
    console.error('Failed to save review item to IndexedDB:', err);
  }
}
