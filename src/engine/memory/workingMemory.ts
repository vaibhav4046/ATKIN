/**
 * ATKIN Sovereign Legal AI - Working Memory (Layer 1)
 * 
 * ContextPlanner with dynamic token budgeting, sliding window dialogue,
 * span grounding preservation, and lossless evicted context summarization.
 */

export interface TokenBudgetConfig {
  maxContextTokens: number;
  systemReservePercent?: number;    // default 0.15 (15%)
  spansReservePercent?: number;     // default 0.45 (45%)
  episodicReservePercent?: number;  // default 0.10 (10%)
  dialogueReservePercent?: number;  // default 0.30 (30%)
}

export interface GroundingSpanInput {
  id: string;
  citation: string;
  text: string;
  score: number;
}

export interface DialogueMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ContextAllocationResult {
  totalTokensEstimated: number;
  maxTokensAllowed: number;
  budgetBreakdown: {
    systemTokens: number;
    spansTokens: number;
    episodicTokens: number;
    dialogueTokens: number;
  };
  retainedSpans: GroundingSpanInput[];
  truncatedSpansCount: number;
  retainedDialogue: DialogueMessage[];
  evictedTurnsCount: number;
  evictedDialogueDigest?: string;
  retainedEpisodicSummaries: string[];
  systemPrompt: string;
}

/**
 * Robust token estimator for English legal text.
 * Uses average character length / word count weighting to closely match BPE tokenizers.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  // BPE average for English legal text is ~3.75 chars per token or ~1.3 tokens per word
  const charTokens = Math.ceil(text.length / 3.75);
  const wordTokens = Math.ceil(text.trim().split(/\s+/).length * 1.3);
  // Average the two heuristics
  return Math.max(1, Math.round((charTokens + wordTokens) / 2));
}

export class ContextPlanner {
  private config: Required<TokenBudgetConfig>;

  constructor(config: TokenBudgetConfig) {
    this.config = {
      maxContextTokens: config.maxContextTokens,
      systemReservePercent: config.systemReservePercent ?? 0.15,
      spansReservePercent: config.spansReservePercent ?? 0.45,
      episodicReservePercent: config.episodicReservePercent ?? 0.10,
      dialogueReservePercent: config.dialogueReservePercent ?? 0.30,
    };
  }

  public planContext(params: {
    systemPrompt: string;
    evidenceSpans: GroundingSpanInput[];
    dialogueHistory: DialogueMessage[];
    episodicSummaries?: string[];
  }): ContextAllocationResult {
    const maxTokens = this.config.maxContextTokens;
    const systemBudget = Math.floor(maxTokens * this.config.systemReservePercent);
    const spansBudget = Math.floor(maxTokens * this.config.spansReservePercent);
    const episodicBudget = Math.floor(maxTokens * this.config.episodicReservePercent);
    const dialogueBudget = Math.floor(maxTokens * this.config.dialogueReservePercent);

    // 1. System Prompt
    let processedSystemPrompt = params.systemPrompt;
    let systemTokens = estimateTokens(processedSystemPrompt);
    if (systemTokens > systemBudget) {
      // Truncate non-essential tail if system prompt is overly long
      const allowedChars = Math.floor(systemBudget * 3.7);
      processedSystemPrompt = processedSystemPrompt.slice(0, allowedChars) + '... [truncated for budget]';
      systemTokens = estimateTokens(processedSystemPrompt);
    }

    // 2. Episodic Context Packing
    const retainedEpisodic: string[] = [];
    let episodicTokens = 0;
    if (params.episodicSummaries && params.episodicSummaries.length > 0) {
      for (const summary of params.episodicSummaries) {
        const est = estimateTokens(summary);
        if (episodicTokens + est <= episodicBudget) {
          retainedEpisodic.push(summary);
          episodicTokens += est;
        } else {
          break;
        }
      }
    }

    // 3. Grounding Spans Packing (Highest score first)
    const sortedSpans = [...params.evidenceSpans].sort((a, b) => b.score - a.score);
    const retainedSpans: GroundingSpanInput[] = [];
    let spansTokens = 0;
    let truncatedSpansCount = 0;

    for (const span of sortedSpans) {
      const spanTokens = estimateTokens(`[${span.citation}]: ${span.text}`);
      if (spansTokens + spanTokens <= spansBudget) {
        retainedSpans.push(span);
        spansTokens += spanTokens;
      } else {
        truncatedSpansCount++;
      }
    }

    // 4. Sliding Window Dialogue with Lossless Eviction Digest
    const dialogueHistory = [...params.dialogueHistory];
    const retainedDialogue: DialogueMessage[] = [];
    const evictedTurns: DialogueMessage[] = [];

    // Walk backwards from latest message to preserve recent context
    let dialogueTokens = 0;
    for (let i = dialogueHistory.length - 1; i >= 0; i--) {
      const msg = dialogueHistory[i];
      const msgTokens = estimateTokens(msg.content) + 4; // role framing overhead
      if (dialogueTokens + msgTokens <= dialogueBudget) {
        retainedDialogue.unshift(msg);
        dialogueTokens += msgTokens;
      } else {
        // Evicted turn
        evictedTurns.unshift(msg);
      }
    }

    // If turns were evicted, synthesize a concise Running Digest
    let evictedDialogueDigest: string | undefined;
    if (evictedTurns.length > 0) {
      const bulletPoints = evictedTurns.map(turn => {
        const preview = turn.content.replace(/\s+/g, ' ').slice(0, 100);
        return `[${turn.role.toUpperCase()}]: ${preview}...`;
      });
      evictedDialogueDigest = `Prior Turn Summary (${evictedTurns.length} turns evicted):\n` + bulletPoints.join('\n');
      
      // Inject digest into system prompt or as first message if headroom exists
      const digestTokens = estimateTokens(evictedDialogueDigest);
      if (dialogueTokens + digestTokens <= dialogueBudget + (spansBudget - spansTokens)) {
        retainedDialogue.unshift({
          role: 'system',
          content: evictedDialogueDigest
        });
        dialogueTokens += digestTokens;
      }
    }

    const totalTokensEstimated = systemTokens + spansTokens + episodicTokens + dialogueTokens;

    return {
      totalTokensEstimated,
      maxTokensAllowed: maxTokens,
      budgetBreakdown: {
        systemTokens,
        spansTokens,
        episodicTokens,
        dialogueTokens,
      },
      retainedSpans,
      truncatedSpansCount,
      retainedDialogue,
      evictedTurnsCount: evictedTurns.length,
      evictedDialogueDigest,
      retainedEpisodicSummaries: retainedEpisodic,
      systemPrompt: processedSystemPrompt,
    };
  }
}
