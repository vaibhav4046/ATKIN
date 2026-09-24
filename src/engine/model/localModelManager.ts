import type { ModelStatus } from '../../types/index.ts';

export interface OllamaModelDetail {
  name: string;
  model: string;
  size: number;
  digest: string;
  modifiedAt: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
  percent?: number;
}

export class LocalModelManager {
  private endpoint = '/api/local-model';
  private customOpenAIEndpoint = 'http://127.0.0.1:1234/v1';

  public setEndpoint(url: string) {
    this.endpoint = url;
  }

  public getEndpoint() {
    return this.endpoint;
  }

  public async getInstalledModels(): Promise<OllamaModelDetail[]> {
    try {
      const res = await fetch(`${this.endpoint}/tags`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.models) ? data.models : [];
    } catch {
      return [];
    }
  }

  public async checkHealth(): Promise<ModelStatus> {
    const isLocalOrigin = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isLocalOrigin && this.endpoint.startsWith('/api/local-model')) {
      return {
        state: 'offline',
        endpoint: this.endpoint,
        modelTag: 'None (Hosted Demo)',
        detectedTags: [],
        errorMessage: 'Hosted Web Demo: Cross-origin sandbox restricts direct loopback queries. Operating in Deterministic Offline Mode.',
        lastChecked: new Date().toISOString(),
        cloudRoutesDisabled: true
      };
    }

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${this.endpoint}/tags`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          state: 'offline',
          endpoint: this.endpoint,
          modelTag: 'Unavailable',
          detectedTags: [],
          errorMessage: `Ollama returned HTTP ${res.status}. Verify 'ollama serve' is running.`,
          lastChecked: new Date().toISOString()
        };
      }

      const data = await res.json();
      const models: OllamaModelDetail[] = Array.isArray(data.models) ? data.models : [];
      const tags = models.map(m => m.name || m.model);
      const latencyMs = Date.now() - startTime;

      const gemmaTag = tags.find(t => t.toLowerCase().includes('gemma')) || tags[0] || 'gemma4:e4b';

      return {
        state: models.length > 0 ? 'connected' : 'offline',
        endpoint: this.endpoint,
        modelTag: gemmaTag,
        detectedTags: tags,
        latencyMs,
        lastChecked: new Date().toISOString(),
        vramUsedEstimateMb: gemmaTag.includes('e2b') ? 2100 : 3800,
        cloudRoutesDisabled: true
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        state: 'offline',
        endpoint: this.endpoint,
        modelTag: 'None detected',
        detectedTags: [],
        errorMessage: `Cannot contact local Ollama on 127.0.0.1:11434 (${msg}). Start runtime with 'ollama serve'.`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  public async pullModelWithProgress(
    modelTag: string, 
    onProgress: (progress: PullProgress) => void
  ): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelTag, stream: true })
      });

      if (!res.ok || !res.body) {
        throw new Error(`Failed to initiate pull: HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            let percent: number | undefined;
            if (parsed.total && parsed.completed) {
              percent = Math.round((parsed.completed / parsed.total) * 100);
            }
            onProgress({
              status: parsed.status || 'pulling',
              digest: parsed.digest,
              total: parsed.total,
              completed: parsed.completed,
              percent
            });
          } catch {
            // Ignore partial JSON
          }
        }
      }

      return true;
    } catch (err) {
      onProgress({ status: `Error: ${err instanceof Error ? err.message : String(err)}` });
      return false;
    }
  }

  public async deleteModel(modelTag: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelTag })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async generateCompletion(
    prompt: string, 
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    const status = await this.checkHealth();
    const tag = status.modelTag || 'gemma4:e4b';

    const res = await fetch(`${this.endpoint}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: tag,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.1,
          num_predict: options.maxTokens ?? 1024
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama generation failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.response || '';
  }

  public async testOpenAIEndpoint(url = this.customOpenAIEndpoint): Promise<{ reachable: boolean; models: string[] }> {
    try {
      const res = await fetch(`${url}/models`, {
        headers: { 'Authorization': 'Bearer local-dev' }
      });
      if (!res.ok) return { reachable: false, models: [] };
      const data = await res.json();
      const models = Array.isArray(data.data) ? data.data.map((m: { id: string }) => m.id) : [];
      return { reachable: true, models };
    } catch {
      return { reachable: false, models: [] };
    }
  }
}

export const localModelManager = new LocalModelManager();
