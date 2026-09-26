/**
 * ATKIN Model-Independent Core
 * Sections 36, 37, 38: Model Abstraction & Sovereign Intelligence Interface
 *
 * Models are replaceable compute engines used by ATKIN.
 * ATKIN is the legal platform. The lawyer's matters, sources, drafts,
 * and memory belong to ATKIN, never to a single model vendor.
 */

export type ModelPrivacyClass = 'local' | 'hybrid' | 'remote';

export type ModelExecutionLocation = 'device' | 'desktop' | 'remote_approved';

export type MatterModelPolicy =
  | 'LOCAL_ONLY'
  | 'LOCAL_PREFERRED'
  | 'HYBRID_APPROVAL'
  | 'APPROVED_REMOTE';

export interface ModelCapabilities {
  text: boolean;
  vision: boolean;
  tools: boolean;
  structuredOutput: boolean;
  embeddings: boolean;
  longContext: boolean;
  streaming: boolean;
  local: boolean;
  maxContextTokens: number;
  estimatedMemory?: string;
  privacyClass: ModelPrivacyClass;
}

export interface ModelRequest {
  taskId: string;
  matterId?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: unknown[];
}

export interface ModelResult {
  content: string;
  modelId: string;
  provider: string;
  executionLocation: ModelExecutionLocation;
  tokensUsed: { prompt: number; completion: number; total: number };
  finishReason: string;
  latencyMs: number;
}

export interface ModelEvent {
  type: 'token' | 'tool_call' | 'done' | 'error';
  chunk?: string;
  error?: string;
}

export interface ModelHealth {
  status: 'ready' | 'degraded' | 'offline';
  latencyMs?: number;
  error?: string;
}

export interface LegalModel {
  id: string;
  provider: string;
  capabilities: ModelCapabilities;

  generate(request: ModelRequest): Promise<ModelResult>;

  stream?(request: ModelRequest): AsyncIterable<ModelEvent>;

  health(): Promise<ModelHealth>;

  countTokens?(input: unknown): Promise<number>;
}

export interface RoutingReceipt {
  taskId: string;
  modelId: string;
  provider: string;
  executionLocation: ModelExecutionLocation;
  locationDisplay: string;
  privacyPolicy: MatterModelPolicy;
  reason: string;
  timestamp: string;
}
