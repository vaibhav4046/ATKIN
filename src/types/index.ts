export type Jurisdiction = 'England and Wales' | 'Scotland' | 'Northern Ireland';

export type ClaimKind = 'fact' | 'legal_proposition' | 'inference' | 'question';
export type ClaimStatus = 'supported' | 'contested' | 'unverified' | 'rejected';
export type ClaimPolarity = 'favourable' | 'adverse' | 'neutral';

export type EdgeType = 'supports' | 'contradicts' | 'mentions';
export type EdgeAuthor = 'human' | 'rule' | 'model';
export type EdgeReviewState = 'pending' | 'approved' | 'rejected';

export type AuthorityVerificationLevel = 'linked' | 'text_checked' | 'human_approved';

export type DraftType = 'matter_brief' | 'client_letter';
export type DraftReviewStatus = 'needs_review' | 'ready_for_review' | 'approved';

export type ReviewItemType = 
  | 'unsupported_assertion'
  | 'contradiction'
  | 'unverified_authority'
  | 'date_ambiguity'
  | 'source_unavailable';

export type ReviewSeverity = 'high' | 'medium' | 'low';
export type ReviewStatus = 'pending' | 'resolved' | 'dismissed';

export interface Matter {
  id: string;
  title: string;
  jurisdiction: Jurisdiction;
  clientAlias: string;
  status: 'active' | 'archived' | 'review';
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
  notes?: string;
}

export interface Document {
  id: string;
  matterId: string;
  filename: string;
  mime: string;
  sha256: string;
  importedAt: string;
  sourceDate: string | null;
  extractionStatus: 'success' | 'partial' | 'failed';
  pageCount: number;
  text: string;
  privacyLabel: string;
}

export interface Span {
  id: string;
  documentId: string;
  page?: number;
  startOffset: number;
  endOffset: number;
  exactText: string;
  checksum: string;
  lineStart?: number;
  lineEnd?: number;
}

export interface EvidenceEdge {
  id: string;
  claimId: string;
  spanId: string;
  type: EdgeType;
  author: EdgeAuthor;
  rationale: string;
  reviewState: EdgeReviewState;
  createdAt: string;
}

export interface Claim {
  id: string;
  matterId: string;
  statement: string;
  kind: ClaimKind;
  polarity: ClaimPolarity;
  temporalScope?: string; // e.g. "2026-04-12" or "2026-01-15"
  status: ClaimStatus;
  provenanceEdges: EvidenceEdge[];
  editorNotes?: string;
  updatedAt: string;
}

export interface Authority {
  id: string;
  citation: string;
  officialUrl: string;
  identifier: string; // e.g. "CRA 2015 s.9"
  sectionParagraph: string;
  summary: string;
  retrievedAt: string;
  checkedAt: string;
  coverageCaveat: string;
  verificationLevel: AuthorityVerificationLevel;
  jurisdiction: Jurisdiction;
}

export interface DraftBlock {
  id: string;
  heading?: string;
  text: string;
  claimIds: string[];
  spanIds: string[];
  reviewStatus: 'verified' | 'needs_review' | 'unverified';
  reviewReason?: string;
}

export interface Draft {
  id: string;
  matterId: string;
  type: DraftType;
  title: string;
  blocks: DraftBlock[];
  generatedBy: 'deterministic_offline' | string;
  modelTag?: string;
  reviewStatus: DraftReviewStatus;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  matterId: string;
  type: ReviewItemType;
  severity: ReviewSeverity;
  title: string;
  description: string;
  targetId: string;
  targetType: 'claim' | 'edge' | 'authority' | 'document' | 'draft_block';
  status: ReviewStatus;
  createdAt: string;
  resolutionNote?: string;
}

export interface ModelStatus {
  state: 'offline' | 'checking' | 'connected' | 'error';
  endpoint: string;
  modelTag: string;
  latencyMs?: number;
  detectedTags: string[];
  errorMessage?: string;
  lastChecked?: string;
}
