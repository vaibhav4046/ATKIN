/**
 * ATKIN Typed Domain Events
 * Section 79 & RFC 8785 Audit Architecture
 *
 * All state mutations and asynchronous workflows emit typed domain events.
 * Events update audit logs, memory layers, UI state, and background work.
 */

export type DomainEventType =
  | 'MatterCreated'
  | 'MatterUpdated'
  | 'SourceImported'
  | 'SourceUpdated'
  | 'FactCorrected'
  | 'ResearchCompleted'
  | 'WorkProductCreated'
  | 'WorkProductUpdated'
  | 'MemoryWritten'
  | 'ModelRouted'
  | 'ActionApproved'
  | 'ActionRejected'
  | 'DevicePaired'
  | 'JobStepCompleted'
  | 'CitationVerified';

export interface BaseDomainEvent {
  id: string;
  type: DomainEventType;
  matterId?: string;
  workspaceId: string;
  timestamp: string;
  actor: {
    type: 'user' | 'lawyer' | 'ai' | 'system';
    id: string;
  };
}

export interface MatterCreatedEvent extends BaseDomainEvent {
  type: 'MatterCreated';
  payload: {
    matterId: string;
    title: string;
    client: string;
    jurisdiction: string;
    memoryMode: 'STRICT_MATTER_ONLY' | 'PRACTICE_PLUS_MATTER' | 'TEMPORARY';
  };
}

export interface MatterUpdatedEvent extends BaseDomainEvent {
  type: 'MatterUpdated';
  payload: {
    matterId: string;
    changes: Record<string, unknown>;
  };
}

export interface SourceImportedEvent extends BaseDomainEvent {
  type: 'SourceImported';
  payload: {
    sourceId: string;
    filename: string;
    sha256: string;
    byteLength: number;
    spanCount: number;
  };
}

export interface SourceUpdatedEvent extends BaseDomainEvent {
  type: 'SourceUpdated';
  payload: {
    sourceId: string;
    previousSha256: string;
    newSha256: string;
    affectedSpanIds: string[];
  };
}

export interface FactCorrectedEvent extends BaseDomainEvent {
  type: 'FactCorrected';
  payload: {
    claimId: string;
    previousValue: string;
    correctedValue: string;
    reason: string;
    supersededMemoryIds?: string[];
  };
}

export interface ResearchCompletedEvent extends BaseDomainEvent {
  type: 'ResearchCompleted';
  payload: {
    researchJobId: string;
    question: string;
    jurisdiction: string;
    primaryAuthorityIds: string[];
    adverseAuthorityIds: string[];
  };
}

export interface WorkProductCreatedEvent extends BaseDomainEvent {
  type: 'WorkProductCreated';
  payload: {
    productId: string;
    type: string;
    title: string;
    initialVersionId: string;
  };
}

export interface WorkProductUpdatedEvent extends BaseDomainEvent {
  type: 'WorkProductUpdated';
  payload: {
    productId: string;
    versionId: string;
    versionNumber: number;
    createdBy: 'ai' | 'user' | 'lawyer_approved';
    sourceChanged: boolean;
  };
}

export interface MemoryWrittenEvent extends BaseDomainEvent {
  type: 'MemoryWritten';
  payload: {
    layer: 'working' | 'episodic' | 'semantic' | 'procedural' | 'governance';
    memoryId: string;
    key: string;
    provenance: string;
  };
}

export interface ModelRoutedEvent extends BaseDomainEvent {
  type: 'ModelRouted';
  payload: {
    taskId: string;
    modelId: string;
    provider: string;
    executionLocation: 'device' | 'desktop' | 'remote_approved';
    privacyClass: 'local' | 'hybrid' | 'remote';
    contextTokens: number;
  };
}

export interface ActionApprovedEvent extends BaseDomainEvent {
  type: 'ActionApproved';
  payload: {
    requestId: string;
    actionType: string;
    approverId: string;
    permissionTier: 'READ_LOCAL' | 'READ_EXTERNAL' | 'WRITE_LOCAL' | 'WRITE_EXTERNAL' | 'DESTRUCTIVE';
  };
}

export interface ActionRejectedEvent extends BaseDomainEvent {
  type: 'ActionRejected';
  payload: {
    requestId: string;
    actionType: string;
    rejectorId: string;
    reason: string;
  };
}

export interface DevicePairedEvent extends BaseDomainEvent {
  type: 'DevicePaired';
  payload: {
    deviceId: string;
    deviceName: string;
    deviceRole: 'desktop_primary' | 'mobile_companion' | 'tablet_reader';
    fingerprint: string;
  };
}

export interface JobStepCompletedEvent extends BaseDomainEvent {
  type: 'JobStepCompleted';
  payload: {
    jobId: string;
    stepIndex: number;
    stepTitle: string;
    success: boolean;
    artifactIds?: string[];
  };
}

export interface CitationVerifiedEvent extends BaseDomainEvent {
  type: 'CitationVerified';
  payload: {
    spanId: string;
    sourceSha256: string;
    status: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED' | 'CONFLICTING' | 'STALE' | 'UNVERIFIED';
  };
}

export type DomainEvent =
  | MatterCreatedEvent
  | MatterUpdatedEvent
  | SourceImportedEvent
  | SourceUpdatedEvent
  | FactCorrectedEvent
  | ResearchCompletedEvent
  | WorkProductCreatedEvent
  | WorkProductUpdatedEvent
  | MemoryWrittenEvent
  | ModelRoutedEvent
  | ActionApprovedEvent
  | ActionRejectedEvent
  | DevicePairedEvent
  | JobStepCompletedEvent
  | CitationVerifiedEvent;
