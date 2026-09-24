export type JobType = 
  | 'ingest_document' 
  | 'transcribe_audio' 
  | 'research_query' 
  | 'reindex_embeddings' 
  | 'draft_synthesis' 
  | 'contract_audit';

export type JobState = 
  | 'queued' 
  | 'running' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface WorkJob {
  id: string;
  type: JobType;
  matterId: string;
  title: string;
  state: JobState;
  progressPercent: number;
  currentStep: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  idempotencyKey?: string;
  checkpointData?: Record<string, unknown>;
}

export class JobQueue {
  private static instance: JobQueue;
  private jobs: Map<string, WorkJob> = new Map();
  private subscribers: Array<(jobs: WorkJob[]) => void> = [];

  private constructor() {
    this.seedInitialJobs();
  }

  public static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  private seedInitialJobs() {
    const initialJobs: WorkJob[] = [
      {
        id: 'job-init-01',
        type: 'ingest_document',
        matterId: 'matter-vance-zenith',
        title: 'Ingest Customer Purchase Receipt & Notice of Defect',
        state: 'completed',
        progressPercent: 100,
        currentStep: 'Span extraction & SHA-256 hashing verified',
        createdAt: '2026-09-23T14:30:00Z',
        startedAt: '2026-09-23T14:30:01Z',
        completedAt: '2026-09-23T14:30:02Z',
      },
      {
        id: 'job-init-02',
        type: 'contract_audit',
        matterId: 'matter-novacorp-saas',
        title: 'Playbook Risk Audit on Master Services Agreement',
        state: 'completed',
        progressPercent: 100,
        currentStep: 'Uncapped indemnity & Net 30/60 conflict detected',
        createdAt: '2026-09-23T14:31:00Z',
        startedAt: '2026-09-23T14:31:01Z',
        completedAt: '2026-09-23T14:31:03Z',
      }
    ];

    for (const j of initialJobs) {
      this.jobs.set(j.id, j);
    }
  }

  public enqueue(
    type: JobType,
    matterId: string,
    title: string,
    idempotencyKey?: string
  ): WorkJob {
    if (idempotencyKey) {
      for (const existing of this.jobs.values()) {
        if (existing.idempotencyKey === idempotencyKey && existing.state !== 'failed') {
          return existing;
        }
      }
    }

    const job: WorkJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      matterId,
      title,
      state: 'queued',
      progressPercent: 0,
      currentStep: 'Queued in local memory',
      createdAt: new Date().toISOString(),
      idempotencyKey
    };

    this.jobs.set(job.id, job);
    this.notify();
    return job;
  }

  public updateProgress(jobId: string, progress: number, step: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.state = 'running';
    job.progressPercent = Math.min(100, Math.max(0, progress));
    job.currentStep = step;
    if (!job.startedAt) job.startedAt = new Date().toISOString();

    if (progress >= 100) {
      job.state = 'completed';
      job.completedAt = new Date().toISOString();
    }

    this.notify();
  }

  public fail(jobId: string, error: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.state = 'failed';
    job.errorMessage = error;
    job.completedAt = new Date().toISOString();
    this.notify();
  }

  public cancel(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.state = 'cancelled';
    job.currentStep = 'Cancelled by user';
    job.completedAt = new Date().toISOString();
    this.notify();
  }

  public pause(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job || job.state !== 'running') return;

    job.state = 'paused';
    job.currentStep = 'Paused by user';
    this.notify();
  }

  public resume(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job || job.state !== 'paused') return;

    job.state = 'running';
    job.currentStep = 'Resumed execution';
    this.notify();
  }

  public getAllJobs(): WorkJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public subscribe(fn: (jobs: WorkJob[]) => void): () => void {
    this.subscribers.push(fn);
    fn(this.getAllJobs());
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== fn);
    };
  }

  private notify() {
    const list = this.getAllJobs();
    for (const sub of this.subscribers) {
      sub(list);
    }
  }
}
