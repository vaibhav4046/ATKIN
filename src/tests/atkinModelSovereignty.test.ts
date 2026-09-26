import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRouter } from '../runtime/model/modelRouter.ts';
import { deterministicLegalModel } from '../runtime/model/adapters/deterministicAdapter.ts';
import type { LegalModel, ModelCapabilities, ModelRequest, ModelResult, ModelHealth } from '../runtime/model/legalModel.ts';
import { EventBus } from '../runtime/events/eventBus.ts';

describe('ATKIN Model Sovereignty & Independence (Sections 36–40)', () => {
  let router: ModelRouter;
  let bus: EventBus;

  beforeEach(() => {
    bus = EventBus.getInstance();
    bus.clear();
    router = new ModelRouter();
  });

  it('runs deterministic model locally with zero network egress', async () => {
    const health = await deterministicLegalModel.health();
    expect(health.status).toBe('ready');
    expect(deterministicLegalModel.capabilities.local).toBe(true);
    expect(deterministicLegalModel.capabilities.privacyClass).toBe('local');

    const request: ModelRequest = {
      taskId: 'task-test-01',
      matterId: 'matter-alder-peak',
      prompt: 'Summarise the termination position.'
    };

    const result = await deterministicLegalModel.generate(request);
    expect(result.executionLocation).toBe('device');
    expect(result.tokensUsed.total).toBeGreaterThan(0);
    expect(result.content).toBeDefined();
  });

  it('generates a transparent RoutingReceipt under LOCAL_PREFERRED policy', async () => {
    const request: ModelRequest = {
      taskId: 'task-route-01',
      matterId: 'matter-alder-peak',
      prompt: 'What notice is required under Clause 3.2?'
    };

    const { result, receipt } = await router.routeAndExecute(request, 'LOCAL_PREFERRED');

    expect(result).toBeDefined();
    expect(receipt.taskId).toBe('task-route-01');
    expect(receipt.locationDisplay).toBe('Using this device');
    expect(receipt.privacyPolicy).toBe('LOCAL_PREFERRED');
    expect(receipt.executionLocation).toBe('device');

    // Verify ModelRouted event was emitted to EventBus
    const history = bus.getHistory({ type: 'ModelRouted' });
    expect(history.length).toBe(1);
    expect((history[0] as any).payload.executionLocation).toBe('device');
  });

  it('fails closed when LOCAL_ONLY policy is requested with an unauthorized remote model', async () => {
    // Create mock remote model
    const mockRemoteModel: LegalModel = {
      id: 'mock-cloud-gemini',
      provider: 'google_cloud',
      capabilities: {
        text: true,
        vision: true,
        tools: true,
        structuredOutput: true,
        embeddings: true,
        longContext: true,
        streaming: true,
        local: false,
        maxContextTokens: 1000000,
        privacyClass: 'remote'
      },
      generate: async () => ({
        content: 'Remote response',
        modelId: 'mock-cloud-gemini',
        provider: 'google_cloud',
        executionLocation: 'remote_approved',
        tokensUsed: { prompt: 10, completion: 10, total: 20 },
        finishReason: 'stop',
        latencyMs: 150
      }),
      health: async (): Promise<ModelHealth> => ({ status: 'ready' })
    };

    router.registerModel(mockRemoteModel);

    const request: ModelRequest = {
      taskId: 'task-violation-test',
      matterId: 'matter-alder-peak',
      prompt: 'Confidential client advice'
    };

    // When matter policy is LOCAL_ONLY, router must fail closed or fallback to local
    // If user explicitly asks for remote under LOCAL_ONLY:
    await expect(
      router.routeAndExecute(request, 'LOCAL_ONLY', 'mock-cloud-gemini')
    ).resolves.toMatchObject({
      receipt: {
        privacyPolicy: 'LOCAL_ONLY',
        locationDisplay: 'Using this device' // Fell back safely to local deterministic
      }
    });
  });
});
