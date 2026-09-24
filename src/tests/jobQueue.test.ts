import { describe, it, expect } from 'vitest';
import { JobQueue } from '../engine/jobs/jobQueue.ts';

describe('Local Job Queue & Work Orchestrator', () => {
  it('enqueues a job with initial state "queued"', () => {
    const queue = JobQueue.getInstance();
    const job = queue.enqueue('ingest_document', 'matter-test', 'Ingest Witness Statement');
    
    expect(job.state).toBe('queued');
    expect(job.progressPercent).toBe(0);
    expect(job.matterId).toBe('matter-test');
  });

  it('updates job progress through execution to completed', () => {
    const queue = JobQueue.getInstance();
    const job = queue.enqueue('transcribe_audio', 'matter-test', 'Transcribe Client Meeting');
    
    queue.updateProgress(job.id, 50, 'Extracting audio frames');
    const runningJobs = queue.getAllJobs().find(j => j.id === job.id);
    expect(runningJobs?.state).toBe('running');
    expect(runningJobs?.progressPercent).toBe(50);

    queue.updateProgress(job.id, 100, 'Attendance note generated');
    const completedJob = queue.getAllJobs().find(j => j.id === job.id);
    expect(completedJob?.state).toBe('completed');
    expect(completedJob?.progressPercent).toBe(100);
  });

  it('handles pause, resume, and cancellation states', () => {
    const queue = JobQueue.getInstance();
    const job = queue.enqueue('reindex_embeddings', 'matter-test', 'Generate Local Embeddings');
    
    queue.updateProgress(job.id, 25, 'Processing chunk 1/4');
    queue.pause(job.id);
    expect(queue.getAllJobs().find(j => j.id === job.id)?.state).toBe('paused');

    queue.resume(job.id);
    expect(queue.getAllJobs().find(j => j.id === job.id)?.state).toBe('running');

    queue.cancel(job.id);
    expect(queue.getAllJobs().find(j => j.id === job.id)?.state).toBe('cancelled');
  });

  it('enforces idempotency keys for repeated jobs', () => {
    const queue = JobQueue.getInstance();
    const key = `idem-${Date.now()}`;
    const job1 = queue.enqueue('draft_synthesis', 'matter-test', 'Synthesize Advice Letter', key);
    const job2 = queue.enqueue('draft_synthesis', 'matter-test', 'Synthesize Advice Letter', key);
    
    expect(job1.id).toBe(job2.id);
  });
});
