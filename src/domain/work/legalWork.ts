/**
 * ATKIN Legal Work Subsystem
 * Sections 10, 11, 12, 13: Long-running Work Jobs, Work Plans, and Task Ledger
 */

export type JobStatus =
  | 'planning'
  | 'waiting_for_approval'
  | 'running'
  | 'paused'
  | 'blocked'
  | 'failed'
  | 'completed'
  | 'cancelled';

export type StepStatus =
  | 'pending'
  | 'running'
  | 'waiting_for_approval'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface WorkStep {
  id: string;
  index: number;
  title: string;
  description: string;
  status: StepStatus;
  requiresApproval: boolean;
  toolName?: string;
  outputRef?: string;
  error?: string;
  completedAt?: string;
}

export interface TaskLedgerItem {
  id: string;
  jobId: string;
  owner: string; // Worker identifier (e.g. 'worker_sources', 'worker_authorities')
  dependencyIds: string[];
  inputRefs: string[];
  outputRefs: string[];
  status: 'queued' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface WorkCheckpoint {
  jobId: string;
  completedStepIndices: number[];
  artifactIds: string[];
  sourceRefs: string[];
  toolResults: Record<string, unknown>;
  timestamp: string;
}

export interface LegalWorkJob {
  id: string;
  matterId: string;
  workspaceId: string;
  objective: string;
  status: JobStatus;
  steps: WorkStep[];
  artifacts: string[]; // WorkProduct IDs
  checkpoints: WorkCheckpoint[];
  taskLedger: TaskLedgerItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Creates a structured legal work job with an initial visible plan.
 */
export function createLegalWorkJob(params: {
  matterId: string;
  workspaceId: string;
  objective: string;
  steps: Array<{ title: string; description: string; requiresApproval?: boolean; toolName?: string }>;
}): LegalWorkJob {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const steps: WorkStep[] = params.steps.map((s, idx) => ({
    id: `${jobId}-step-${idx + 1}`,
    index: idx + 1,
    title: s.title,
    description: s.description,
    status: 'pending',
    requiresApproval: s.requiresApproval ?? false,
    toolName: s.toolName
  }));

  return {
    id: jobId,
    matterId: params.matterId,
    workspaceId: params.workspaceId,
    objective: params.objective,
    status: 'planning',
    steps,
    artifacts: [],
    checkpoints: [],
    taskLedger: [],
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Updates a job step and generates an execution checkpoint for restart survival.
 */
export function recordStepProgress(
  job: LegalWorkJob,
  stepId: string,
  progress: {
    status: StepStatus;
    outputRef?: string;
    error?: string;
    artifactCreated?: string;
  }
): LegalWorkJob {
  const now = new Date().toISOString();
  let allDone = true;
  let hasPendingApproval = false;
  let hasFailed = false;

  const updatedSteps = job.steps.map(step => {
    if (step.id === stepId) {
      const updated = {
        ...step,
        status: progress.status,
        outputRef: progress.outputRef || step.outputRef,
        error: progress.error || step.error,
        completedAt: progress.status === 'completed' ? now : undefined
      };
      return updated;
    }
    return step;
  });

  for (const s of updatedSteps) {
    if (s.status === 'failed') hasFailed = true;
    if (s.status === 'waiting_for_approval') hasPendingApproval = true;
    if (s.status !== 'completed' && s.status !== 'skipped') allDone = false;
  }

  let jobStatus: JobStatus = job.status;
  if (hasFailed) jobStatus = 'failed';
  else if (hasPendingApproval) jobStatus = 'waiting_for_approval';
  else if (allDone) jobStatus = 'completed';
  else jobStatus = 'running';

  const newArtifacts = progress.artifactCreated
    ? Array.from(new Set([...job.artifacts, progress.artifactCreated]))
    : job.artifacts;

  const checkpoint: WorkCheckpoint = {
    jobId: job.id,
    completedStepIndices: updatedSteps.filter(s => s.status === 'completed').map(s => s.index),
    artifactIds: newArtifacts,
    sourceRefs: [],
    toolResults: {},
    timestamp: now
  };

  return {
    ...job,
    status: jobStatus,
    steps: updatedSteps,
    artifacts: newArtifacts,
    checkpoints: [...job.checkpoints, checkpoint],
    updatedAt: now,
    completedAt: allDone ? now : undefined
  };
}
