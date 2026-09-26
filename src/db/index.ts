import Dexie, { type Table } from 'dexie';
import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  EvidenceEdge, 
  Authority, 
  Draft, 
  ReviewItem,
  ChatMessage,
  UserProfile,
  WorkspaceType 
} from '../types/index.ts';
import { mirrorToNativeStorage, hydrateFromNativeStorageIfEmpty } from './nativeStorageBridge.ts';

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
  messages!: Table<ChatMessage, string>;
  userProfile!: Table<UserProfile, string>;

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
    this.version(2).stores({
      matters: 'id, title, jurisdiction, clientAlias, status, createdAt, updatedAt',
      documents: 'id, matterId, filename, sha256, sourceDate, importedAt',
      spans: 'id, documentId, checksum',
      claims: 'id, matterId, kind, status, polarity, updatedAt',
      edges: 'id, claimId, spanId, type, reviewState',
      authorities: 'id, identifier, jurisdiction, verificationLevel',
      drafts: 'id, matterId, type, reviewStatus, updatedAt',
      reviewItems: 'id, matterId, type, severity, status, createdAt',
      messages: 'id, matterId, role, timestamp'
    });
    this.version(3).stores({
      matters: 'id, title, jurisdiction, clientAlias, status, workspaceType, isDemo, createdAt, updatedAt',
      documents: 'id, matterId, filename, sha256, sourceDate, importedAt',
      spans: 'id, documentId, checksum',
      claims: 'id, matterId, kind, status, polarity, updatedAt',
      edges: 'id, claimId, spanId, type, reviewState',
      authorities: 'id, identifier, jurisdiction, verificationLevel',
      drafts: 'id, matterId, type, reviewStatus, updatedAt',
      reviewItems: 'id, matterId, type, severity, status, createdAt',
      messages: 'id, matterId, role, timestamp',
      userProfile: 'id, role, primaryJurisdiction, onboardingCompleted'
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
    await hydrateFromNativeStorageIfEmpty(db.matters, db.userProfile);
    const matterCount = await db.matters.count();
    if (matterCount > 0) {
      return false; // Database already has persisted records (or hydrated from SQLite)
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
      await db.matters.put({ ...BATES_MATTER, isDemo: true, workspaceType: 'demo' });
      await db.documents.bulkPut(BATES_DOCUMENTS);
      await db.spans.bulkPut(BATES_SPANS);
      await db.claims.bulkPut(BATES_CLAIMS);
      await db.authorities.bulkPut(BATES_AUTHORITIES);
      await db.drafts.put(BATES_DRAFT);
      await db.reviewItems.bulkPut(BATES_REVIEWS);

      // 2. Contract Review Matter
      await db.matters.put({ ...CONTRACT_MATTER, isDemo: true, workspaceType: 'demo' });
      await db.documents.bulkPut(CONTRACT_DOCUMENTS);
      await db.spans.bulkPut(CONTRACT_SPANS);
      await db.claims.bulkPut(CONTRACT_CLAIMS);
      await db.authorities.bulkPut(COMMERCIAL_CONTRACT_AUTHORITIES);
      await db.drafts.put(CONTRACT_DRAFT);
      await db.reviewItems.bulkPut(CONTRACT_REVIEWS);

      // 3. Tenancy Matter
      await db.matters.put({ ...TENANCY_MATTER, isDemo: true, workspaceType: 'demo' });
      await db.documents.bulkPut(TENANCY_DOCUMENTS);
      await db.spans.bulkPut(TENANCY_SPANS);
      await db.claims.bulkPut(TENANCY_CLAIMS);
      await db.authorities.bulkPut(TENANCY_HOUSING_AUTHORITIES);
      await db.drafts.put(TENANCY_DRAFT);
      await db.reviewItems.bulkPut(TENANCY_REVIEWS);

      // 4. Consumer Laptop Matter
      await db.matters.put({ ...SAMPLE_MATTER, isDemo: true, workspaceType: 'demo' });
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
 * Fetch matters from IndexedDB, optionally filtered by workspace ('personal' vs 'demo').
 */
export async function getMattersFromDB(workspaceType?: WorkspaceType): Promise<Matter[]> {
  try {
    const all = await db.matters.toArray();
    if (workspaceType) {
      return all.filter(m => {
        const mWorkspace = m.workspaceType || (m.isDemo ? 'demo' : 'personal');
        return mWorkspace === workspaceType;
      });
    }
    return all;
  } catch {
    if (workspaceType === 'personal') return [];
    return [
      { ...BATES_MATTER, isDemo: true, workspaceType: 'demo' },
      { ...CONTRACT_MATTER, isDemo: true, workspaceType: 'demo' },
      { ...TENANCY_MATTER, isDemo: true, workspaceType: 'demo' },
      { ...SAMPLE_MATTER, isDemo: true, workspaceType: 'demo' }
    ];
  }
}

/**
 * Save a matter to IndexedDB, ensuring workspaceType is set.
 */
export async function saveMatterToDB(matter: Matter): Promise<void> {
  try {
    const prepared: Matter = {
      ...matter,
      workspaceType: matter.workspaceType || (matter.isDemo ? 'demo' : 'personal')
    };
    await db.matters.put(prepared);
    mirrorToNativeStorage('matters', prepared.id, prepared).catch(() => {});
  } catch (err) {
    console.error('Failed to save matter to IndexedDB:', err);
  }
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-default',
  name: '',
  role: 'solicitor',
  firmOrOrg: '',
  primaryJurisdiction: 'England and Wales',
  secondaryJurisdictions: [],
  privacyMode: 'local_only',
  hardwareTier: 'detected',
  detectedHardware: {
    cpuCores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8,
    memoryGb: typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? (navigator as any).deviceMemory || 16 : 16,
    platform: typeof navigator !== 'undefined' ? navigator.platform || 'Windows' : 'Windows'
  },
  modelPreference: {
    preferredModel: 'gemma4:legal',
    contextLimit: 8192
  },
  draftingStyle: 'plain_english',
  citationFormat: 'oscola',
  memoryPolicy: 'strict_matter_isolation',
  activeWorkspace: 'personal',
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * Fetch UserProfile from IndexedDB or local storage.
 */
export async function getUserProfileFromDB(): Promise<UserProfile | null> {
  try {
    const profiles = await db.userProfile.toArray();
    if (profiles && profiles.length > 0) {
      return profiles[0];
    }
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('atkin_user_profile');
      if (stored) return JSON.parse(stored);
    }
    return null;
  } catch {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('atkin_user_profile');
      if (stored) return JSON.parse(stored);
    }
    return null;
  }
}

/**
 * Save UserProfile to IndexedDB and local storage.
 */
export async function saveUserProfileToDB(profile: UserProfile): Promise<void> {
  try {
    await db.userProfile.put(profile);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('atkin_user_profile', JSON.stringify(profile));
    }
    mirrorToNativeStorage('user_profiles', profile.id, profile).catch(() => {});
  } catch (err) {
    console.error('Failed to save user profile to IndexedDB:', err);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('atkin_user_profile', JSON.stringify(profile));
    }
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

    mirrorToNativeStorage('documents', params.document.id, params.document, params.document.matterId).catch(() => {});
    if (params.draft) {
      mirrorToNativeStorage('drafts', params.draft.id, params.draft, params.draft.matterId).catch(() => {});
    }
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
    mirrorToNativeStorage('drafts', draft.id, draft, draft.matterId).catch(() => {});
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

/**
 * Persist chat message to IndexedDB for continuous conversational history across page refreshes.
 */
export async function saveChatMessageToDB(message: ChatMessage): Promise<void> {
  try {
    await db.messages.put(message);
  } catch (err) {
    console.error('Failed to save chat message to IndexedDB:', err);
  }
}

/**
 * Load continuous conversational history for a matter from IndexedDB.
 */
export async function loadChatMessagesFromDB(matterId: string): Promise<ChatMessage[]> {
  try {
    return await db.messages.where('matterId').equals(matterId).sortBy('timestamp');
  } catch (err) {
    console.error('Failed to load chat messages from IndexedDB:', err);
    return [];
  }
}

/**
 * Clear chat history for a matter from IndexedDB.
 */
export async function clearChatMessagesFromDB(matterId: string): Promise<void> {
  try {
    await db.messages.where('matterId').equals(matterId).delete();
  } catch (err) {
    console.error('Failed to clear chat messages from IndexedDB:', err);
  }
}
