import { describe, it, expect } from 'vitest';
import { DeterministicOfflineLegalModel } from '../engine/protocol/models';
import { BATES_SPANS, BATES_MATTER } from '../db/fixtures/batesPostOfficeMatter';
import type { LegalModelRequest } from '../engine/protocol/models';

/**
 * Retrieval must do two opposite things correctly.
 *
 * The bug this exists to prevent came in two forms, and both are fatal for a
 * product whose whole claim is that you can check its work:
 *
 * 1. Answering a question the record cannot support, while stamping the result
 *    "FULLY SUPPORTED". That shipped. Retrieval matched any single query word
 *    longer than three characters -- including "what" and "claim" -- and when
 *    nothing matched it fell back to three arbitrary spans and reported them as
 *    relevant, which also made isAbstention unreachable.
 *
 * 2. Abstaining on a question the record plainly answers. That shipped too, on
 *    the first attempt at the fix: the threshold was set from theory rather than
 *    from the real corpus, and a live browser check of "What did Fujitsu say
 *    about remote access to branch accounts?" -- text that is verbatim in
 *    BATES_SPANS -- returned "this record does not answer that".
 *
 * So both directions are asserted here, against the real fixture, with no
 * browser involved. A test that only checks the happy path would have passed
 * through both of those regressions.
 */

const request = (question: string): LegalModelRequest =>
  ({
    // The engine reads the question from `task` (falling back to
    // context.prompt) -- see DeterministicOfflineLegalModel.generate. Passing
    // `query` here, as this test originally did, hands the engine an empty
    // question, which it then quite correctly abstains on. That produced a
    // convincing false bug report during development.
    task: question,
    context: {
      matterId: BATES_MATTER.id,
      matterTitle: BATES_MATTER.title,
      jurisdiction: BATES_MATTER.jurisdiction,
      spans: BATES_SPANS,
    },
    documents: [],
    claims: [],
    authorities: [],
  }) as unknown as LegalModelRequest;

const model = new DeterministicOfflineLegalModel();

describe('deterministic retrieval over the real Bates corpus', () => {
  it('the corpus really does contain the Fujitsu remote-access passage', () => {
    // Guards the guard: if this ever stops being true, the "should answer" case
    // below is no longer testing what it claims to test.
    const joined = BATES_SPANS.map((s) => s.exactText).join(' ');
    expect(joined).toMatch(/remote access to branch accounts/i);
    expect(joined).toMatch(/Fujitsu/i);
  });

  it('answers a question the record supports, quoting the span', async () => {
    const res = await model.generate<{ conclusion: string; citations: unknown[]; isAbstention: boolean }>(
      request('What did Fujitsu say about remote access to branch accounts?')
    );
    const irac = res.irac as never as {
      conclusion: string;
      citations: unknown[];
      isAbstention: boolean;
    };

    expect(irac.isAbstention).toBe(false);
    expect(irac.citations.length).toBeGreaterThan(0);
    // The conclusion must carry substance, not a count. "Analysis concluded with
    // N verified citation references" is what this replaced.
    expect(irac.conclusion).not.toMatch(/verified citation references/i);
    expect(irac.conclusion).toMatch(/fujitsu|remote access/i);
    expect(irac.conclusion.length).toBeGreaterThan(60);
  });

  it('abstains on a question the record cannot support', async () => {
    // The Bates bundle contains no limitation period and no quantum of
    // compensation. Saying so is the correct and safe answer.
    const res = await model.generate<{ isAbstention: boolean; abstentionReason?: string }>(
      request('What is the limitation deadline for the claim?')
    );
    expect(res.irac.isAbstention).toBe(true);
    expect(res.irac.abstentionReason).toBeTruthy();
  });

  it('does not let filler words alone constitute a match', async () => {
    // "what", "the", "does", "claim" must never be enough on their own. This is
    // the specific mechanism that made the original bug so bad.
    const res = await model.generate<{ isAbstention: boolean }>(
      request('What does the claim say?')
    );
    expect(res.irac.isAbstention).toBe(true);
  });
});
