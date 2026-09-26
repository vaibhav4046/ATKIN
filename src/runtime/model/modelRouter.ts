/**
 * ATKIN Model Router
 * Sections 38, 39, 40: Policy Enforcement, Model Routing & Receipt Generation
 *
 * Implements strict model sovereignty:
 * Evaluates privacy policy, task requirements, model health, and hardware.
 * Generates transparent routing receipts and fails closed on LOCAL_ONLY.
 */

import type {
  LegalModel,
  MatterModelPolicy,
  ModelRequest,
  ModelResult,
  RoutingReceipt
} from './legalModel.ts';
import { deterministicLegalModel } from './adapters/deterministicAdapter.ts';
import { defaultOllamaModel } from './adapters/ollamaAdapter.ts';
import { EventBus } from '../events/eventBus.ts';

export class ModelRouter {
  private registeredModels: Map<string, LegalModel> = new Map();
  private defaultPolicy: MatterModelPolicy = 'LOCAL_PREFERRED';

  constructor() {
    this.registerModel(deterministicLegalModel);
    this.registerModel(defaultOllamaModel);
  }

  public registerModel(model: LegalModel): void {
    this.registeredModels.set(model.id, model);
  }

  public getModel(id: string): LegalModel | undefined {
    return this.registeredModels.get(id);
  }

  public listModels(): LegalModel[] {
    return Array.from(this.registeredModels.values());
  }

  /**
   * Routes and executes request according to matter privacy policy.
   * Fails closed if policy is LOCAL_ONLY and no local model is ready.
   */
  public async routeAndExecute(
    request: ModelRequest,
    policy: MatterModelPolicy = this.defaultPolicy,
    preferredModelId?: string
  ): Promise<{ result: ModelResult; receipt: RoutingReceipt }> {
    const selectedModel = await this.selectModel(policy, preferredModelId);

    // Enforce LOCAL_ONLY fail closed
    if (policy === 'LOCAL_ONLY' && selectedModel.capabilities.privacyClass !== 'local') {
      throw new Error(
        `[ModelRouter] Policy Violation: Matter policy is LOCAL_ONLY. Selected model '${selectedModel.id}' violates local execution policy.`
      );
    }

    const health = await selectedModel.health();
    if (health.status === 'offline') {
      if (policy === 'LOCAL_ONLY') {
        // Fallback to embedded deterministic engine if local neural model is offline
        const fallback = deterministicLegalModel;
        return this.executeWithReceipt(fallback, request, policy, 'Local neural engine offline; failing closed to embedded deterministic IRAC engine.');
      }
      throw new Error(`[ModelRouter] Selected model '${selectedModel.id}' is offline: ${health.error}`);
    }

    const reason = preferredModelId === selectedModel.id
      ? `User preferred model '${selectedModel.id}' routed under ${policy} policy.`
      : `Optimal model selected based on ${policy} policy and local execution preference.`;

    return this.executeWithReceipt(selectedModel, request, policy, reason);
  }

  private async selectModel(
    policy: MatterModelPolicy,
    preferredModelId?: string
  ): Promise<LegalModel> {
    if (preferredModelId && this.registeredModels.has(preferredModelId)) {
      const preferred = this.registeredModels.get(preferredModelId)!;
      if (policy === 'LOCAL_ONLY' && preferred.capabilities.privacyClass !== 'local') {
        return deterministicLegalModel;
      }
      return preferred;
    }

    if (policy === 'LOCAL_ONLY' || policy === 'LOCAL_PREFERRED') {
      // Check if Ollama is online
      const ollamaHealth = await defaultOllamaModel.health();
      if (ollamaHealth.status === 'ready') {
        return defaultOllamaModel;
      }
      // Safe local deterministic fallback
      return deterministicLegalModel;
    }

    // For other policies, prefer local if available, else deterministic
    const ollama = await defaultOllamaModel.health();
    if (ollama.status === 'ready') return defaultOllamaModel;
    return deterministicLegalModel;
  }

  private async executeWithReceipt(
    model: LegalModel,
    request: ModelRequest,
    policy: MatterModelPolicy,
    reason: string
  ): Promise<{ result: ModelResult; receipt: RoutingReceipt }> {
    const result = await model.generate(request);

    const locationDisplay = model.capabilities.local
      ? 'Using this device'
      : model.provider.includes('desktop')
      ? 'Using your desktop'
      : `Using ${model.provider}`;

    const receipt: RoutingReceipt = {
      taskId: request.taskId,
      modelId: model.id,
      provider: model.provider,
      executionLocation: result.executionLocation,
      locationDisplay,
      privacyPolicy: policy,
      reason,
      timestamp: new Date().toISOString()
    };

    // Emit ModelRouted domain event
    await EventBus.getInstance().emit({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'ModelRouted',
      matterId: request.matterId,
      workspaceId: 'active',
      timestamp: receipt.timestamp,
      actor: { type: 'system', id: 'model-router' },
      payload: {
        taskId: request.taskId,
        modelId: model.id,
        provider: model.provider,
        executionLocation: result.executionLocation,
        privacyClass: model.capabilities.privacyClass,
        contextTokens: result.tokensUsed.total
      }
    });

    return { result, receipt };
  }
}

export const modelRouter = new ModelRouter();
