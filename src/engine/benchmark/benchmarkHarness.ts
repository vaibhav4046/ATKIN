import type { 
  BenchmarkTask, 
  BenchmarkRunScore, 
  BenchmarkCategory 
} from '../../types/index.ts';

export class BenchmarkHarness {
  private tasks: BenchmarkTask[] = [];

  constructor() {
    this.seed120HeldOutTasks();
  }

  private seed120HeldOutTasks() {
    // Category 1: 40 Statutory & Citation Verification Tasks
    for (let i = 1; i <= 40; i++) {
      this.tasks.push({
        taskId: `bench-statutory-${i}`,
        category: 'statutory_citation_preservation',
        title: `Statutory Citation Preservation Task ${i} (CRA 2015 / UCTA 1977 / Housing Act 2004)`,
        jurisdiction: 'England and Wales',
        inputPrompt: `Identify the statutory limitation period under CRA 2015 s.19(14) with exact character-span citations.`,
        expectedSpans: [`span-statutory-${i}`],
        expectedAbstention: false,
        groundTruthKeywords: ['Consumer Rights Act 2015', 's.19(14)', 'reversed burden', '6 months']
      });
    }

    // Category 2: 30 Contradiction & Adverse Evidence Detection Tasks
    for (let i = 1; i <= 30; i++) {
      this.tasks.push({
        taskId: `bench-contradiction-${i}`,
        category: 'adverse_evidence_identification',
        title: `Adverse Contradiction Detection Task ${i} (Fujitsu Telemetry vs Witness Statements)`,
        jurisdiction: 'England and Wales',
        inputPrompt: `Audit contemporary accounting logs against sworn witness statement asserting terminal infallibility.`,
        expectedSpans: [`span-log-${i}`, `span-testimony-${i}`],
        expectedAbstention: false,
        groundTruthKeywords: ['PIN-188', 'contradiction', 'remote access', 'discrepancy']
      });
    }

    // Category 3: 25 Sufficiency & Missing Evidence Abstention Tasks (arXiv:2411.06037)
    for (let i = 1; i <= 25; i++) {
      this.tasks.push({
        taskId: `bench-abstention-${i}`,
        category: 'missing_evidence_abstention',
        title: `Evidential Sufficiency Abstention Task ${i} (Unsubstantiated Loss Claim)`,
        jurisdiction: 'England and Wales',
        inputPrompt: `Calculate damages for breach of contract where claimant has produced no invoices or bank statements.`,
        expectedSpans: [],
        expectedAbstention: true,
        groundTruthKeywords: ['ABSTAIN', 'insufficient evidence', 'Schedule of Loss missing']
      });
    }

    // Category 4: 25 Contract Playbook & Redline Generation Tasks
    for (let i = 1; i <= 25; i++) {
      this.tasks.push({
        taskId: `bench-contract-${i}`,
        category: 'contract_playbook_redline',
        title: `Contract Playbook Redline Task ${i} (Uncapped Indemnity & Auto-Renewal)`,
        jurisdiction: 'England and Wales',
        inputPrompt: `Review Clause 7.2 indemnity provision against institutional SaaS playbook rules.`,
        expectedSpans: [`span-indemnity-${i}`],
        expectedAbstention: false,
        groundTruthKeywords: ['gross negligence', 'cap on liability', 'mutual indemnity', 'redline']
      });
    }
  }

  public getTasks(): BenchmarkTask[] {
    return this.tasks;
  }

  /**
   * Reference shape for a three-tier grounding evaluation.
   *
   * IMPORTANT: the numbers below are NOT measurements. They are hardcoded expected
   * outputs that describe the shape of the report, which is why the UI labels this
   * panel "Reference values" and tells the reader to run the harness for real
   * figures. A test asserts 87.5 here, which only proves the constant was not
   * edited — it proves nothing about model quality.
   *
   * Real results for a specific machine are written by an actual run to
   * release/benchmark/hardware-benchmark.json. That file is the only place a
   * measured number should come from.
   *
   *   1. Base model alone, ungrounded vanilla baseline
   *   2. Local quantized model on a laptop GPU
   *   3. Sovereign core: deterministic rule engine with exact span bounds
   */
  public evaluateTiers(): BenchmarkRunScore[] {
    return [
      {
        evaluatedTier: 'base_model',
        totalTasks: 8,
        passedTasks: 5,
        accuracyPercent: 62.5,
        citationFidelityPercent: 50.0,
        adverseRecallPercent: 50.0,
        abstentionPrecisionPercent: 50.0,
        latencyAvgMs: 380
      },
      {
        evaluatedTier: 'local_gemma4',
        totalTasks: 8,
        passedTasks: 7,
        accuracyPercent: 87.5,
        citationFidelityPercent: 87.5,
        adverseRecallPercent: 100.0,
        abstentionPrecisionPercent: 75.0,
        latencyAvgMs: 14500
      },
      {
        evaluatedTier: 'sovereign_core',
        totalTasks: 8,
        passedTasks: 8,
        accuracyPercent: 100.0,
        citationFidelityPercent: 100.0,
        adverseRecallPercent: 100.0,
        abstentionPrecisionPercent: 100.0,
        latencyAvgMs: 1
      }
    ];
  }
}

export const benchmarkHarness = new BenchmarkHarness();
