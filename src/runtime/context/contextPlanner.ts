/**
 * ATKIN Context Planner
 * Sections 5, 8: Unified Context Planning & Policy-Enforced Prompt Assembly
 *
 * No component manually assembles giant prompts.
 * All model and execution passes route through ContextPlanner.
 * Enforces memory modes (STRICT_MATTER_ONLY, PRACTICE_PLUS_MATTER, TEMPORARY).
 */

import type { Matter, Document, Span, MemoryRecord } from '../../types/index.ts';
import type { LegalTaskType } from '../classifier/taskClassifier.ts';
import { taskClassifier } from '../classifier/taskClassifier.ts';
import { skillRouter, type LegalSkill } from '../../domain/skills/legalSkill.ts';
import type { MatterModelPolicy } from '../model/legalModel.ts';

export type MemoryMode = 'STRICT_MATTER_ONLY' | 'PRACTICE_PLUS_MATTER' | 'TEMPORARY';

export interface ContextPlan {
  matterId: string;
  taskType: LegalTaskType;
  sourceScope: string[]; // Document IDs
  sourceSpans: Span[];
  semanticMemories: MemoryRecord[];
  episodes: MemoryRecord[];
  activeSkills: LegalSkill[];
  applicablePolicies: string[];
  tools: string[];
  memoryMode: MemoryMode;
  modelPolicy: MatterModelPolicy;
  estimatedContextTokens: number;
  assembledSystemPrompt: string;
}

export class ContextPlanner {
  public planContext(params: {
    userQuery: string;
    matter: Matter;
    sources: Document[];
    spans: Span[];
    memories: MemoryRecord[];
    memoryMode?: MemoryMode;
    modelPolicy?: MatterModelPolicy;
  }): ContextPlan {
    const memoryMode: MemoryMode = params.memoryMode || 'STRICT_MATTER_ONLY';
    const modelPolicy: MatterModelPolicy = params.modelPolicy || 'LOCAL_PREFERRED';

    // 1. Classify Task
    const classification = taskClassifier.classify(params.userQuery, params.sources.length > 0);

    // 2. Route Skill
    const matchedSkill = skillRouter.routeSkill(params.userQuery, classification.taskType);
    const activeSkills: LegalSkill[] = matchedSkill ? [matchedSkill] : [];

    // 3. Enforce Memory Isolation Mode
    let allowedSemanticMemories: MemoryRecord[] = [];
    const allowedEpisodes: MemoryRecord[] = [];

    if (memoryMode === 'STRICT_MATTER_ONLY') {
      // Strictly current matter only — no cross-matter or practice-wide memories
      allowedSemanticMemories = params.memories.filter(
        m => m.matterId === params.matter.id
      );
    } else if (memoryMode === 'PRACTICE_PLUS_MATTER') {
      // Matter + practice-wide preferences & skills
      allowedSemanticMemories = params.memories.filter(
        m => m.matterId === params.matter.id || m.scope === 'user_preferences' || m.scope === 'workspace_playbooks'
      );
    } else if (memoryMode === 'TEMPORARY') {
      // Ephemeral only: zero persistent semantic memory included
      allowedSemanticMemories = [];
    }

    // 4. Assemble applicable policies
    const policies: string[] = [
      `Memory Mode: ${memoryMode}`,
      `Model Policy: ${modelPolicy}`,
      `Jurisdiction: ${params.matter.jurisdiction}`
    ];
    if (classification.networkRequirement === 'offline_mandatory') {
      policies.push('Network: 0 Bytes Egress Required (Strict Offline Execution)');
    }

    // 5. Estimate Tokens
    const queryTokens = Math.ceil(params.userQuery.length / 4);
    const spansTokens = params.spans.reduce((acc, s) => acc + Math.ceil(s.exactText.length / 4), 0);
    const memoriesTokens = allowedSemanticMemories.reduce(
      (acc, m) => acc + Math.ceil((m.text || '').length / 4),
      0
    );
    const estimatedContextTokens = queryTokens + spansTokens + memoriesTokens + 300;

    // 6. Build Assembled System Prompt
    let systemPrompt = `You are ATKIN, a sovereign legal AI workspace operating in ${params.matter.jurisdiction}.\n`;
    systemPrompt += `Matter: ${params.matter.title} (${params.matter.clientAlias || 'Private Client'}).\n`;
    systemPrompt += `Execution Constraints: Ground all factual assertions in exact source character spans.\n`;
    systemPrompt += `Evidentiary Rule: If an unrecorded fact is requested, apply truthful evidential abstention.\n`;

    if (matchedSkill) {
      systemPrompt += `\n[Active Legal Skill: ${matchedSkill.name}]\n${matchedSkill.systemInstructions}\n`;
    }

    return {
      matterId: params.matter.id,
      taskType: classification.taskType,
      sourceScope: params.sources.map(s => s.id),
      sourceSpans: params.spans,
      semanticMemories: allowedSemanticMemories,
      episodes: allowedEpisodes,
      activeSkills,
      applicablePolicies: policies,
      tools: classification.toolRequirement,
      memoryMode,
      modelPolicy,
      estimatedContextTokens,
      assembledSystemPrompt: systemPrompt
    };
  }
}

export const contextPlanner = new ContextPlanner();
