/**
 * ATKIN Deterministic IRAC Model Adapter
 * Implements LegalModel interface using ATKIN's deterministic rule & reasoning engine.
 * Always available locally. No network calls, no model weights to download.
 */

import type { LegalModel, ModelCapabilities, ModelHealth, ModelRequest, ModelResult } from '../legalModel.ts';
import { LegalReasoningEngine } from '../../../engine/reasoning/legalReasoningEngine.ts';

export class DeterministicLegalModel implements LegalModel {
  public readonly id = 'atkin-irac-deterministic';
  public readonly provider = 'atkin_embedded';

  public readonly capabilities: ModelCapabilities = {
    text: true,
    vision: false,
    tools: true,
    structuredOutput: true,
    embeddings: false,
    longContext: true,
    streaming: false,
    local: true,
    maxContextTokens: 64000,
    estimatedMemory: '12MB (In-Memory TS Engine)',
    privacyClass: 'local'
  };

  private engine: LegalReasoningEngine;

  constructor() {
    this.engine = new LegalReasoningEngine();
  }

  public async health(): Promise<ModelHealth> {
    return {
      status: 'ready',
      latencyMs: 1
    };
  }

  public async countTokens(input: unknown): Promise<number> {
    const text = typeof input === 'string' ? input : JSON.stringify(input);
    return Math.ceil(text.length / 4);
  }

  public async generate(request: ModelRequest): Promise<ModelResult> {
    const startTime = Date.now();

    // Deterministic IRAC pass
    const reasoning = this.engine.reason({
      matterId: request.matterId || 'general',
      matterTitle: 'Grounded Matter Request',
      matterJurisdiction: 'England and Wales',
      query: request.prompt,
      documents: [],
      spans: [],
      claims: [],
      authorities: [],
      reviewItems: [],
      memories: []
    });

    const elapsed = Date.now() - startTime;
    const tokens = await this.countTokens(reasoning.formattedResponse);

    return {
      content: reasoning.formattedResponse,
      modelId: this.id,
      provider: this.provider,
      executionLocation: 'device',
      tokensUsed: {
        prompt: Math.ceil(request.prompt.length / 4),
        completion: tokens,
        total: Math.ceil(request.prompt.length / 4) + tokens
      },
      finishReason: 'stop',
      latencyMs: elapsed
    };
  }
}

export const deterministicLegalModel = new DeterministicLegalModel();
