import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryEngine } from '../engine/memory/memoryEngine.ts';
import { SAMPLE_MATTER_ID } from '../db/fixtures/consumerLaptop.ts';
import { CONTRACT_MATTER_ID } from '../db/fixtures/contractMatter.ts';
import { TENANCY_MATTER_ID, CANARY_SECRET_TENANCY_TOKEN } from '../db/fixtures/tenancyMatter.ts';

describe('Scoped Memory Engine & Cross-Matter Canary Isolation', () => {
  let memoryEngine: MemoryEngine;

  beforeEach(() => {
    memoryEngine = new MemoryEngine();
  });

  it('preserves global user preferences across all matters', () => {
    const memoriesM1 = memoryEngine.getMemoriesForMatter(SAMPLE_MATTER_ID);
    const memoriesM2 = memoryEngine.getMemoriesForMatter(CONTRACT_MATTER_ID);

    expect(memoriesM1.some(m => m.scope === 'user_preferences')).toBe(true);
    expect(memoriesM2.some(m => m.scope === 'user_preferences')).toBe(true);
  });

  it('guarantees strict cross-matter isolation (Canary Test)', () => {
    // 1. Plant canary fact inside Tenancy matter
    const canaryRecord = memoryEngine.suggestMemory({
      vaultId: 'vault-01',
      matterId: TENANCY_MATTER_ID,
      scope: 'matter_facts',
      kind: 'fact',
      text: `Critical confidential witness statement: ${CANARY_SECRET_TENANCY_TOKEN}`,
      createdBy: 'human'
    });
    expect(canaryRecord.reviewState).toBe('accepted');

    // 2. Query memories for Consumer Laptop matter
    const laptopMemories = memoryEngine.getMemoriesForMatter(SAMPLE_MATTER_ID);
    const laptopLeaksCanary = laptopMemories.some(m => m.text.includes(CANARY_SECRET_TENANCY_TOKEN));
    expect(laptopLeaksCanary).toBe(false);

    // 3. Query memories for Contract Review matter
    const contractMemories = memoryEngine.getMemoriesForMatter(CONTRACT_MATTER_ID);
    const contractLeaksCanary = contractMemories.some(m => m.text.includes(CANARY_SECRET_TENANCY_TOKEN));
    expect(contractLeaksCanary).toBe(false);

    // 4. Tenancy matter retrieval DOES contain the canary
    const tenancyMemories = memoryEngine.getMemoriesForMatter(TENANCY_MATTER_ID);
    const tenancyContainsCanary = tenancyMemories.some(m => m.text.includes(CANARY_SECRET_TENANCY_TOKEN));
    expect(tenancyContainsCanary).toBe(true);
  });

  it('executes cascading dependency invalidation when source documents change', () => {
    const docVer1 = 'doc-receipt-v1';
    const docVer2 = 'doc-receipt-v2';

    // Create memory dependent on docVer1
    const depMemory = memoryEngine.suggestMemory({
      vaultId: 'vault-01',
      matterId: SAMPLE_MATTER_ID,
      scope: 'matter_facts',
      kind: 'fact',
      text: 'Invoice shows total £1,499 paid on 15 Jan 2026',
      sourceDocumentVersions: [docVer1],
      createdBy: 'model'
    });
    memoryEngine.approveMemory(depMemory.id);

    expect(memoryEngine.getMemoriesForMatter(SAMPLE_MATTER_ID).find(m => m.id === depMemory.id)?.status).toBe('active');

    // Invalidate document version
    const invalidated = memoryEngine.invalidateDocumentDependencies(docVer1);
    expect(invalidated.length).toBe(1);

    const reloaded = memoryEngine.getMemoriesForMatter(SAMPLE_MATTER_ID).find(m => m.id === depMemory.id);
    expect(reloaded?.status).toBe('invalidated');
  });

  it('enforces human review queue for model-generated memories', () => {
    const modelSuggestion = memoryEngine.suggestMemory({
      vaultId: 'vault-01',
      matterId: CONTRACT_MATTER_ID,
      scope: 'matter_facts',
      kind: 'fact',
      text: 'Model inferred seller agreed to refund in phone conversation.',
      createdBy: 'model'
    });

    expect(modelSuggestion.reviewState).toBe('suggested');

    // Rejecting drops from active
    memoryEngine.rejectMemory(modelSuggestion.id);
    const activeList = memoryEngine.getMemoriesForMatter(CONTRACT_MATTER_ID);
    expect(activeList.some(m => m.id === modelSuggestion.id)).toBe(false);
  });
});
