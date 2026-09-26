/**
 * ATKIN Sovereign Legal AI - 5-Layer Memory Architecture Index
 * 
 * Layer 1: Working Memory (ContextPlanner, dynamic token budget, sliding window, summarization)
 * Layer 2: Episodic Memory (Task episodes, outcome, decisions, errors, feedback)
 * Layer 3: Semantic Memory (Legal ontology: entity/relation graph with strict provenance grounding)
 * Layer 4: Procedural Memory (Versioned declarative skills with review gates and candidate promotion)
 * Layer 5: Memory Governance (TTL retention, compaction, supersession, contradiction radar, matter isolation)
 */

export * from './workingMemory.ts';
export * from './episodicMemory.ts';
export * from './semanticMemory.ts';
export * from './proceduralMemory.ts';
export * from './memoryGovernance.ts';
export * from './memoryEngine.ts';
