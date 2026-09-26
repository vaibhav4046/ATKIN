/**
 * ATKIN Ollama Local Model Adapter
 * Implements LegalModel interface for local LLM engines (e.g. Llama 3, Gemma 2, Mistral).
 */

import type { LegalModel, ModelCapabilities, ModelHealth, ModelRequest, ModelResult } from '../legalModel.ts';
import { checkOllamaConnection } from '../../../engine/modelBridge.ts';

export class OllamaLegalModel implements LegalModel {
  public readonly id: string;
  public readonly provider = 'ollama_local';
  private endpoint: string;

  public readonly capabilities: ModelCapabilities = {
    text: true,
    vision: false,
    tools: true,
    structuredOutput: true,
    embeddings: true,
    longContext: true,
    streaming: true,
    local: true,
    maxContextTokens: 32000,
    estimatedMemory: '4.8GB (VRAM / RAM)',
    privacyClass: 'local'
  };

  constructor(modelId: string = 'llama3.2:latest', endpoint: string = 'http://localhost:11434') {
    this.id = modelId;
    this.endpoint = endpoint;
  }

  public async health(): Promise<ModelHealth> {
    try {
      const status = await checkOllamaConnection(this.endpoint);
      if (status.state === 'connected') {
        return { status: 'ready', latencyMs: 25 };
      }
      return { status: 'offline', error: 'Ollama daemon not responding on localhost:11434' };
    } catch (err: any) {
      return { status: 'offline', error: err?.message || 'Connection failed' };
    }
  }

  public async countTokens(input: unknown): Promise<number> {
    const text = typeof input === 'string' ? input : JSON.stringify(input);
    return Math.ceil(text.length / 4);
  }

  public async generate(request: ModelRequest): Promise<ModelResult> {
    const startTime = Date.now();
    const health = await this.health();

    if (health.status === 'offline') {
      throw new Error(`[OllamaLegalModel] Local daemon offline: ${health.error}`);
    }

    try {
      const res = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.id,
          prompt: request.prompt,
          system: request.systemPrompt,
          stream: false,
          options: {
            temperature: request.temperature ?? 0.1
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Ollama HTTP error ${res.status}`);
      }

      const data = await res.json();
      const elapsed = Date.now() - startTime;

      return {
        content: data.response || '',
        modelId: this.id,
        provider: this.provider,
        executionLocation: 'device',
        tokensUsed: {
          prompt: data.prompt_eval_count || Math.ceil(request.prompt.length / 4),
          completion: data.eval_count || Math.ceil((data.response || '').length / 4),
          total: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        finishReason: 'stop',
        latencyMs: elapsed
      };
    } catch (err: any) {
      throw new Error(`[OllamaLegalModel] Generation error: ${err.message}`);
    }
  }
}

export const defaultOllamaModel = new OllamaLegalModel();
