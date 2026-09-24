export type Jurisdiction = 'England and Wales' | 'Scotland' | 'Northern Ireland' | 'United States' | 'European Union' | 'India' | 'UK' | 'US' | 'EU' | 'IN';

export type ClaimKind = 'fact' | 'legal_proposition' | 'inference' | 'question';
export type ClaimStatus = 'supported' | 'contested' | 'unverified' | 'rejected';
export type ClaimPolarity = 'favourable' | 'adverse' | 'neutral';

export type EdgeType = 'supports' | 'contradicts' | 'mentions';
export type EdgeAuthor = 'human' | 'rule' | 'model';
export type EdgeReviewState = 'pending' | 'approved' | 'rejected';

export type AuthorityVerificationLevel = 'linked' | 'text_checked' | 'human_approved';

export type DraftType = 'matter_brief' | 'client_letter' | 'research_memo' | 'response_letter' | 'attendance_note' | 'contract_redline';
export type DraftReviewStatus = 'needs_review' | 'ready_for_review' | 'approved';

export type ReviewItemType = 
  | 'unsupported_assertion'
  | 'contradiction'
  | 'unverified_authority'
  | 'date_ambiguity'
  | 'source_unavailable'
  | 'invalidated_dependency'
  | 'contract_risk';

export type ReviewSeverity = 'high' | 'medium' | 'low';
export type ReviewStatus = 'pending' | 'resolved' | 'dismissed';

export interface Matter {
  id: string;
  title: string;
  jurisdiction: Jurisdiction;
  clientAlias: string;
  matterType?: 'consumer' | 'contract' | 'tenancy' | 'commercial';
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
  content?: string;
  privacyLabel: string;
  isEncrypted?: boolean;
}

export type DocumentRecord = Document;

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
  text?: string;
}

export type EvidenceSpan = Span;

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
  status?: string;
  version?: number;
  createdAt?: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  matterId: string;
  type: ReviewItemType;
  severity: ReviewSeverity;
  title: string;
  description: string;
  targetId?: string;
  targetType?: 'claim' | 'edge' | 'authority' | 'document' | 'draft_block' | 'memory' | 'contract_clause';
  claimId?: string;
  status: ReviewStatus;
  createdAt: string;
  resolutionNote?: string;
}

// -------------------------------------------------------------
// Wave 1: Vault & Network Broker Contracts
// -------------------------------------------------------------

export interface VaultMetadata {
  vaultId: string;
  vaultName: string;
  storagePath: string;
  createdAt: string;
  lastUnlockedAt: string;
  isEncrypted: boolean;
  kdfRounds: number; // 100000
  saltBase64: string;
  autoLockMinutes: number;
}

export interface VaultLockState {
  isLocked: boolean;
  vaultId: string;
  unlockedAt: string | null;
  idleTimerMs: number;
}

export interface EncryptedBlobRecord {
  id: string;
  vaultId: string;
  entityType: 'document' | 'memory' | 'claim' | 'draft' | 'audit_log';
  entityId: string;
  ivBase64: string;
  cipherTextBase64: string;
  authTagBase64: string;
  updatedAt: string;
}

export type NetworkMode = 'offline' | 'public_research' | 'connected_imports';

export interface NetworkAuditEntry {
  id: string;
  timestamp: string;
  destinationUrl: string;
  destinationProvider: string;
  purpose: string;
  approvedByUser: boolean;
  requestHash: string;
  bytesSent: number;
  bytesReceived: number;
  status: 'allowed' | 'blocked' | 'error';
  modeAtCall: NetworkMode;
}

// -------------------------------------------------------------
// Wave 2: Scoped Memory Contracts
// -------------------------------------------------------------

export type MemoryScope = 
  | 'user_preferences' 
  | 'workspace_playbooks' 
  | 'matter_facts' 
  | 'legal_research_notes' 
  | 'work_progress' 
  | 'conversation_memory';

export type MemoryKind = 'preference' | 'playbook' | 'fact' | 'authority_note' | 'progress' | 'conversation_summary';
export type MemoryReviewState = 'suggested' | 'accepted' | 'rejected';
export type MemoryStatus = 'active' | 'superseded' | 'invalidated' | 'deleted';

export interface MemoryRecord {
  id: string;
  vaultId: string;
  matterId?: string; // Optional if global scope like user_preferences
  scope: MemoryScope;
  kind: MemoryKind;
  text: string;
  sourceDocumentVersions: string[];
  sourceSpanIds: string[];
  sourceMessageIds: string[];
  createdBy: 'human' | 'model' | 'rule';
  createdAt: string;
  reviewState: MemoryReviewState;
  validFrom?: string;
  validUntil?: string;
  supersedesId?: string;
  lastUsedAt?: string;
  status: MemoryStatus;
  dependencyIds: string[];
}

// -------------------------------------------------------------
// Wave 3: Legal Sources & Rights Gate Contracts
// -------------------------------------------------------------

export type RightsOperation = 'fetch' | 'store' | 'index' | 'embed' | 'redistribute' | 'train';
export type RightsDecision = 'allowed' | 'requires_permission' | 'not_allowed' | 'unknown';

export interface SourceCapabilities {
  search: boolean;
  fetchById: boolean;
  localImport: boolean;
  incrementalUpdates: boolean;
  requiresCredentials: boolean;
}

export interface LegalSourcePack {
  id: string;
  name: string;
  jurisdiction: Jurisdiction;
  publisher: string;
  officialUrl: string;
  description: string;
  capabilities: SourceCapabilities;
  rightsDecisions: Record<RightsOperation, RightsDecision>;
  rightsRationale: string;
  lastCheckedDate: string;
  installedLocally: boolean;
  recordCount: number;
  coverageCaveat: string;
}

// -------------------------------------------------------------
// Wave 3: Contract Review Contracts
// -------------------------------------------------------------

export interface ContractClause {
  id: string;
  documentId: string;
  clauseTitle: string;
  clauseNumber?: string;
  exactText: string;
  startOffset: number;
  endOffset: number;
  category: 'indemnity' | 'liability_cap' | 'payment_terms' | 'termination' | 'governing_law' | 'confidentiality' | 'warranties' | 'other';
  standardDeviation?: string;
}

export interface ContractObligation {
  id: string;
  clauseId: string;
  obligorParty: string;
  action: string;
  deadlineOrPeriod?: string;
  amountOrCap?: string;
}

export interface ContractRisk {
  id: string;
  clauseId?: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
  playbookReference: string;
  suggestedRevision?: string;
}

export interface PlaybookRule {
  id: string;
  category: ContractClause['category'];
  title: string;
  severity: 'high' | 'medium' | 'low';
  targetPosition: string;
  acceptableFallbacks: string[];
  escalationTriggers: string[];
  requiredRedline?: string;
  validatorType: 'uncapped_indemnity' | 'payment_term_conflict' | 'governing_law' | 'auto_renewal' | 'custom_keyword' | 'missing_clause';
  forbiddenKeywords?: string[];
  requiredKeywords?: string[];
}

export interface ContractPlaybook {
  id: string;
  name: string;
  version: string;
  description: string;
  jurisdiction: string;
  rules: PlaybookRule[];
}

export interface ContractReviewResult {
  matterId: string;
  documentId: string;
  parties: string[];
  governingLaw: string;
  clauses: ContractClause[];
  obligations: ContractObligation[];
  risks: ContractRisk[];
  missingClauses: string[];
  playbookUsed?: string;
}

// -------------------------------------------------------------
// Wave 4: Connectors & Jobs
// -------------------------------------------------------------

export type ConnectorState = 'implemented_and_tested' | 'implemented_needs_credentials' | 'blocked_provider_review' | 'import_fallback_available' | 'not_implemented';

export interface ConnectorTruthTableEntry {
  providerId: string;
  name: string;
  status: ConnectorState;
  readSupported: boolean;
  writeSupported: boolean;
  requiredScopes: string[];
  offlineFallback: string;
  notes: string;
}

export type JobState = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'ingestion' | 'research_sync' | 'transcription' | 'reindex' | 'draft_synthesis';

export interface LocalJob {
  id: string;
  type: JobType;
  matterId?: string;
  state: JobState;
  progressPercent: number;
  currentStep: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

// -------------------------------------------------------------
// Model & Chat Contracts
// -------------------------------------------------------------

export interface ModelStatus {
  state: 'offline' | 'checking' | 'connected' | 'error';
  endpoint: string;
  modelTag: string;
  latencyMs?: number;
  detectedTags: string[];
  errorMessage?: string;
  lastChecked?: string;
  vramUsedEstimateMb?: number;
  cloudRoutesDisabled?: boolean;
}

export interface ChatMessage {
  id: string;
  matterId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sourcesUsed?: Array<{ docId: string; filename: string; spanId: string; lineRange?: string }>;
  memoriesUsed?: Array<{ memoryId: string; text: string; scope: MemoryScope }>;
  needsReviewItems?: string[];
  generationDetails?: {
    modelTag: string;
    localRuntime: boolean;
    latencyMs: number;
    tokensGenerated?: number;
  };
}
