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

export type WorkspaceType = 'personal' | 'demo';

export type LegalRole = 
  | 'solicitor' 
  | 'barrister' 
  | 'in_house' 
  | 'paralegal' 
  | 'trainee' 
  | 'academic' 
  | 'legal_researcher'
  | 'law_student'
  | 'pro_se' 
  | 'other';

export type DraftingStyle = 
  | 'plain_english' 
  | 'traditional' 
  | 'formal_advocacy' 
  | 'executive_summary';

export type CitationFormat = 
  | 'oscola' 
  | 'bluebook' 
  | 'neutral' 
  | 'inline_statute';

export type MemoryPolicy = 
  | 'strict_matter_isolation' 
  | 'cross_matter_semantic_allowed' 
  | 'ephemeral';

export interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  role: LegalRole;
  firmOrOrg: string;
  organisation?: string;
  primaryJurisdiction: Jurisdiction;
  secondaryJurisdictions: Jurisdiction[];
  preferredLanguage?: string;
  answerDetail?: 'concise' | 'standard' | 'exhaustive';
  draftStyle?: string;
  citationStyle?: string;
  privacyMode: 'local_only' | 'local_research' | 'hybrid';
  hardwareTier: 'detected' | 'manual';
  detectedHardware: {
    cpuCores: number;
    memoryGb: number;
    gpuName?: string;
    platform: string;
  };
  modelPreference: {
    preferredModel: string;
    localModelPath?: string;
    contextLimit: number;
  };
  draftingStyle: DraftingStyle;
  citationFormat: CitationFormat;
  memoryPolicy: MemoryPolicy;
  skillLearningEnabled?: boolean;
  internetResearchEnabled?: boolean;
  externalActionPolicy?: 'always_confirm' | 'autonomous_safe';
  preferredModelPolicy?: string;
  activeWorkspace: WorkspaceType;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Matter {
  id: string;
  title: string;
  jurisdiction: Jurisdiction;
  clientAlias: string;
  matterType?: 'consumer' | 'contract' | 'tenancy' | 'commercial';
  status: 'active' | 'archived' | 'review';
  createdAt: string;
  updatedAt: string;
  workspaceType?: WorkspaceType;
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
  // 4-timestamp temporal provenance (Civil Evidence Act 1995 s.9)
  eventDate?: string;
  sourceDate?: string | null;
  importedAt?: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  stateClass?: StateClass;
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
  /**
   * Why the solicitor closed this item. The UI collects it and ReviewTab passes
   * it, so it must actually be persisted -- an audit trail that accepts a
   * rationale and then discards it is worse than one that never asked.
   */
  resolutionNote?: string;
  /** When the item was closed, and by which decision. */
  resolvedAt?: string;
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

export interface AgenticTraceStep {
  step: number;
  agentName: string;
  action: string;
  durationMs: number;
  status: 'completed' | 'in_progress' | 'flagged';
  outputSnippet?: string;
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
  reasoningSteps?: AgenticTraceStep[];
  suggestedAction?: {
    type: 'insert_draft' | 'add_calendar' | 'add_fact' | 'copy_memo';
    label: string;
    payload?: any;
  };
  generationDetails?: {
    modelTag: string;
    localRuntime: boolean;
    latencyMs: number;
    tokensGenerated?: number;
  };
  claimSupportStatus?: 'FULLY_SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'EVIDENTIALLY_ABSTAINED' | 'UNSUPPORTED';
  auditReceiptHash?: string;
  astraStages?: string[];
  verifications?: Array<{
    spanId: string;
    status: 'VERIFIED' | 'MISSING_SOURCE' | 'WRONG_MATTER' | 'VERSION_MISMATCH' | 'INVALID_SPAN' | 'TEXT_MISMATCH' | 'STALE_VERSION';
    reason: string;
  }>;
}

// -------------------------------------------------------------
// Slice 1: 6-Class State Ledger & Provenance
// -------------------------------------------------------------

export type StateClass =
  | 'original_evidence'
  | 'extracted_observations'
  | 'reviewed_matter_knowledge'
  | 'user_preferences'
  | 'approved_reusable_knowledge'
  | 'public_legal_reference_packs';

export interface StateProvenance {
  eventDate?: string;
  sourceDate?: string | null;
  importedAt: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
}

export interface MorningQueueItem {
  id: string;
  matterId: string;
  matterTitle: string;
  category: 'deadline' | 'changed_evidence' | 'unreviewed_draft' | 'contradiction' | 'task';
  priority: 'urgent' | 'high' | 'normal';
  title: string;
  summary: string;
  dueOrAlertDate?: string;
  targetTab: 'overview' | 'sources' | 'facts' | 'timeline' | 'contract' | 'graph' | 'research' | 'draft' | 'review' | 'memory' | 'settings';
  isResolved: boolean;
}

// -------------------------------------------------------------
// Slice 2: Model Portability & 6 Quality Contracts
// -------------------------------------------------------------

export interface CapabilityProfile {
  modelTag: string;
  vendor: 'gemma' | 'llama' | 'local_gguf' | 'custom';
  maxTestedContextTokens: number;
  structuredJsonReliability: 'certified' | 'experimental' | 'unsupported';
  supportedTasks: Array<'fact_extraction' | 'statutory_reasoning' | 'adverse_evidence_check' | 'contract_redline' | 'citation_verification'>;
  vramRequiredMb: number;
  recommendsQuantization: 'q4_k_m' | 'q8_0' | 'fp16' | 'none';
  testedThroughputTokensPerSec?: number;
}

export interface EvidencePacket {
  matterId: string;
  documentVersionIds: string[];
  literalSpans: Span[];
  provenanceHierarchy: string[];
  keyDates: Array<{ label: string; date: string }>;
  contraryEvidence: string[];
  identifiedGaps: string[];
  prompt: string;
}

export interface TaskPolicy {
  permittedTools: string[];
  tokenBudget: number;
  requiresSolicitorReview: boolean;
  networkMode: NetworkMode;
  allowedSourceScopes: string[];
  abstentionPermitted: boolean;
}

export interface OutputProposition {
  statement: string;
  spanCitationIds: string[];
  confidence: 'high' | 'provisional' | 'abstain';
}

export interface OutputContract {
  typedPropositions: OutputProposition[];
  exactSourceCitations: Array<{ spanId: string; quote: string; byteOffsetStart?: number; byteOffsetEnd?: number }>;
  draftBlocks: DraftBlock[];
  explicitUncertainties: string[];
  suggestedNextSteps: string[];
  abstained: boolean;
  abstentionReason?: string;
}

export interface QualityReport {
  ruleValidationPassed: boolean;
  hallucinatedSpanCount: number;
  contradictoryAssertionsCount: number;
  humanReviewStatus: 'pending' | 'signed_off';
  passedChecks: string[];
  failedChecks: string[];
}

export interface QualificationCheckResult {
  ruleNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  ruleName: string;
  passed: boolean;
  scorePercent: number;
  details: string;
}

export interface QualificationReport {
  modelTag: string;
  testedAt: string;
  overallPassed: boolean;
  passedCount: number;
  totalChecks: number;
  checks: QualificationCheckResult[];
}

// -------------------------------------------------------------
// Slice 3: Local Speech & Audio Transcription
// -------------------------------------------------------------

export interface SpeechTranscriptWord {
  word: string;
  startSec: number;
  endSec: number;
  confidence: number;
}

export interface SpeechTranscriptionResult {
  id: string;
  matterId: string;
  /**
   * Real lowercase SHA-256 of the audio bytes, or `null` when the digest could
   * not be computed. Never a placeholder: an audit field that does not describe
   * the recording is worse than an absent one.
   */
  audioSha256: string | null;
  durationSeconds: number;
  fullText: string;
  words: SpeechTranscriptWord[];
  speakerTag?: string;
  recordedAt: string;
  clientConsentRecorded: boolean;
  billingUnits6Min: number;
}

export interface LatinGlossaryEntry {
  term: string;
  phonetic: string;
  legalMeaning: string;
  usageContext: string;
}

// -------------------------------------------------------------
// Slice 4: Deep Research State Machine & Strategy Lab
// -------------------------------------------------------------

export type DeepResearchStep =
  | 'scope'
  | 'plan'
  | 'local_search'
  | 'sufficiency_check'
  | 'rights_gate'
  | 'fetch_public'
  | 'extract'
  | 'draft_memo'
  | 'adverse_check'
  | 'lawyer_approval';

export interface DeepResearchSession {
  id: string;
  matterId: string;
  query: string;
  currentStep: DeepResearchStep;
  status: 'idle' | 'executing' | 'blocked_offline' | 'abstained_insufficient' | 'completed' | 'failed';
  sufficiencyScore: number; // 0 to 1.0 (arXiv:2411.06037)
  missingElements: string[];
  fetchedSources: Array<{ sourceId: string; title: string; url: string; rightsPassed: boolean }>;
  generatedMemoId?: string;
  logs: string[];
}

export interface StatutoryElementCoverage {
  elementId: string;
  statutoryReference: string; // e.g. "CRA 2015 s.9(1)"
  requirementDescription: string;
  isEvidenced: boolean;
  supportingSpanIds: string[];
  contradictorySpanIds: string[];
}

export interface StrategyReadinessReport {
  matterId: string;
  generatedAt: string;
  totalRequiredElements: number;
  evidencedElements: number;
  evidenceCoverageRatio: number; // evidencedElements / totalRequiredElements
  unsupportedAssertionCount: number;
  unresolvedAdverseEvidenceCount: number;
  missingDocumentChecklist: string[];
  statutoryCoverages: StatutoryElementCoverage[];
  proceduralLimitationAlert?: string;
  explicitAbstentionNotice: string;
}

// -------------------------------------------------------------
// Slice 5: 6,000-Document Corpus Manifest & Adaptation
// -------------------------------------------------------------

export interface CorpusCollectionMetrics {
  collectionId: string;
  name: string;
  jurisdiction: Jurisdiction;
  licence: string;
  documentsCount: number;
  pagesCount: number;
  chunksCount: number;
  annotationsCount: number;
  quarantined: boolean;
  quarantineReason?: string;
}

export interface CorpusManifestSummary {
  updatedAt: string;
  collectionsCount: number;
  totalDocuments: number;
  totalPages: number;
  totalChunks: number;
  totalAnnotations: number;
  targetTargetGoal: number; // 6,000 documents
  percentAchieved: number;
  collections: CorpusCollectionMetrics[];
}

// -------------------------------------------------------------
// Slice 6: Role-Gated Conflict Check
// -------------------------------------------------------------

export interface ConflictEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  entityType: 'individual' | 'corporation' | 'fiduciary';
  associatedMatterIds: string[];
  roles: Array<'client' | 'adverse_party' | 'witness' | 'expert' | 'director'>;
}

export interface ConflictCheckMatch {
  matchedEntityId: string;
  canonicalName: string;
  queryTerm: string;
  conflictType: 'direct_adverse' | 'former_client' | 'corporate_affiliate' | 'witness';
  matterId: string;
  severity: 'blocking' | 'flagged' | 'informational';
  explanation: string;
}

// -------------------------------------------------------------
// Slice 7: Controlled 120-Task Benchmark Suite
// -------------------------------------------------------------

export type BenchmarkCategory =
  | 'statutory_citation_preservation'
  | 'adverse_evidence_identification'
  | 'missing_evidence_abstention'
  | 'contract_playbook_redline';

export interface BenchmarkTask {
  taskId: string;
  category: BenchmarkCategory;
  title: string;
  jurisdiction: Jurisdiction;
  inputPrompt: string;
  expectedSpans: string[];
  expectedAbstention: boolean;
  groundTruthKeywords: string[];
}

export interface BenchmarkRunScore {
  evaluatedTier: 'base_model' | 'harness_rag' | 'adapter_engine' | 'local_gemma4' | 'sovereign_core';
  totalTasks: number;
  passedTasks: number;
  accuracyPercent: number;
  citationFidelityPercent: number;
  adverseRecallPercent: number;
  abstentionPrecisionPercent: number;
  latencyAvgMs: number;
}
