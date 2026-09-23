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
