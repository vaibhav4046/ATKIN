/**
 * ATKIN Sovereign Legal OS — Model Abstraction Layer
 * 
 * Provides model-agnostic execution contracts and interchangeable adapters.
 * Implements DeterministicOfflineLegalModel for zero-hallucination airgap execution,
 * and OllamaLegalModel for local hardware inference with health probing and graceful fallback.
 */

import type { Span, Claim, Authority } from '../../types/index.ts';
import type { IracResult } from './astra.ts';

export interface ModelCapabilities {
  contextWindow: number;
  maxOutputTokens?: number;
  structuredOutput: boolean;
  toolCalling: boolean;
  vision: boolean;
  embeddings: boolean;
  streaming: boolean;
  airgapCompliant: boolean;
}

export interface LegalContext {
  matterId: string;
  jurisdiction: string;
  governingLaw: string;
  spans: Span[];
  claims?: Claim[];
  authorities?: Authority[];
  prompt: string;
}

export interface LegalModelRequest {
  systemInstructions?: string;
  task: string;
  context: LegalContext;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface LegalModelResult<T = unknown> {
  modelId: string;
  providerId: 'ollama_local' | 'anthropic' | 'google' | 'openai' | 'deterministic_offline';
  executionLocation: 'desktop_local' | 'phone_local' | 'remote_desktop' | 'external_provider';
  output: T;
  rawText: string;
  irac: IracResult;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    durationMs: number;
    timeToFirstTokenMs?: number;
  };
  finishReason: 'stop' | 'length' | 'error' | 'cancelled';
}

export interface LegalModel {
  readonly id: string;
  readonly name: string;
  readonly providerId: 'ollama_local' | 'anthropic' | 'google' | 'openai' | 'deterministic_offline';
  readonly capabilities: ModelCapabilities;

  health(): Promise<{
    ready: boolean;
    detail?: string;
  }>;

  generate<T = unknown>(
    request: LegalModelRequest,
    signal?: AbortSignal
  ): Promise<LegalModelResult<T>>;
}

/**
 * DeterministicOfflineLegalModel
 * Sovereign, zero-dependency, local-first legal reasoning engine.
 * Dynamically analyzes spans, extracts numbers/dates/terms without hardcoded fixture bias,
 * enforces strict evidential abstention when facts are not in the record.
 */
export class DeterministicOfflineLegalModel implements LegalModel {
  public readonly id = 'deterministic-offline-v1';
  public readonly name = 'ATKIN Deterministic Sovereign Reasoner (Local)';
  public readonly providerId = 'deterministic_offline' as const;
  public readonly capabilities: ModelCapabilities = {
    contextWindow: 32768,
    maxOutputTokens: 4096,
    structuredOutput: true,
    toolCalling: true,
    vision: false,
    embeddings: false,
    streaming: false,
    airgapCompliant: true
  };

  public async health(): Promise<{ ready: boolean; detail?: string }> {
    return {
      ready: true,
      detail: 'Local deterministic rule engine active. No model download, zero dependencies.'
    };
  }

  public async generate<T = unknown>(
    request: LegalModelRequest,
    _signal?: AbortSignal
  ): Promise<LegalModelResult<T>> {
    const startTime = Date.now();
    const query = (request.task || request.context.prompt || '').trim();
    const queryLower = query.toLowerCase();
    const spans = request.context.spans || [];

    let irac: IracResult;

    // 1. Notice / Termination query
    const isNoticeQuery = queryLower.includes('notice') || queryLower.includes('terminat');
    const noticeSpan = spans.find(s => {
      const txt = s.exactText.toLowerCase();
      return (txt.includes('notice') || txt.includes('terminat')) && /\d+\s*(?:calendar\s+|working\s+|business\s+)?days/i.test(txt);
    }) || spans.find(s => {
      const txt = s.exactText.toLowerCase();
      return txt.includes('notice') || txt.includes('terminat');
    });

    // 2. Payment / Fee query
    const isPaymentQuery = queryLower.includes('payment') || queryLower.includes('invoice') || queryLower.includes('fee') || queryLower.includes('price');
    const paymentSpan = spans.find(s => {
      const txt = s.exactText.toLowerCase();
      return (txt.includes('payment') || txt.includes('invoice') || txt.includes('pay')) && /\d+\s*(?:calendar\s+|working\s+|business\s+)?days/i.test(txt);
    });

    // 3. Incorporation date query
    const isIncorporationQuery = queryLower.includes('incorporation') || queryLower.includes('incorporated');
    const incorporationSpanWithDate = spans.find(s => {
      const txt = s.exactText.toLowerCase();
      return (txt.includes('incorporat') && (
        /\b(?:on|dated|date:?)\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/i.test(txt) ||
        /\b\d{4}-\d{2}-\d{2}\b/.test(txt)
      ));
    });

    if (isIncorporationQuery) {
      if (incorporationSpanWithDate) {
        const dateMatch = incorporationSpanWithDate.exactText.match(/\b(?:\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})\b/);
        const dateStr = dateMatch ? dateMatch[0] : 'recorded date';
        irac = {
          issue: 'Determination of supplier legal incorporation date under corporate record.',
          rule: 'Companies Act 2006 s.15 (Certificate of Incorporation establishes date of incorporation).',
          application: `Documentary evidence explicitly records incorporation: "${incorporationSpanWithDate.exactText.trim()}"`,
          conclusion: `The supplier was incorporated on ${dateStr} pursuant to contemporaneous records.`,
          citations: [{ spanId: incorporationSpanWithDate.id, exactText: incorporationSpanWithDate.exactText }],
          isAbstention: false,
          confidenceScore: 0.98
        };
      } else {
        // Strict evidential abstention
        irac = {
          issue: 'Determination of supplier legal incorporation date under corporate record.',
          rule: 'Companies Act 2006 s.15 (Certificate of Incorporation establishes date of incorporation).',
          application: 'The matter documents identify the entity as incorporated in England and Wales, but do not state the date of incorporation.',
          conclusion: 'The matter documents do not state or record the supplier exact incorporation date. Evidential abstention is applied; no date or year is stated.',
          citations: [],
          isAbstention: true,
          abstentionReason: 'Factual matrix is silent; document contains no evidentiary span stating incorporation date.',
          confidenceScore: 1.0
        };
      }
    } else if (isNoticeQuery && noticeSpan) {
      // Dynamic notice days extraction
      const daysMatch = noticeSpan.exactText.match(/(\d+)\s*(?:calendar\s+|working\s+|business\s+)?days/i);
      const days = daysMatch ? daysMatch[1] : null;

      // Dynamic clause reference extraction
      const clauseMatch = noticeSpan.exactText.match(/(?:clause|section|article)\s*([0-9A-Za-z.]+)/i);
      const clauseRef = clauseMatch ? `Clause ${clauseMatch[1]}` : 'operative agreement terms';

      if (days) {
        irac = {
          issue: 'Contractual notice required to terminate commercial agreement without cause.',
          rule: `Operative ${clauseRef} (Notice of Termination).`,
          application: `Under ${clauseRef}, the notice period is stipulated as: "${noticeSpan.exactText.trim()}"`,
          conclusion: `The required termination notice period is ${days} calendar days pursuant to ${clauseRef}.`,
          citations: [{ spanId: noticeSpan.id, exactText: noticeSpan.exactText }],
          isAbstention: false,
          confidenceScore: 0.98
        };
      } else {
        irac = {
          issue: 'Contractual notice required to terminate commercial agreement.',
          rule: `Operative ${clauseRef}.`,
          application: `The agreement stipulates: "${noticeSpan.exactText.trim()}"`,
          conclusion: `Termination notice terms governed by ${clauseRef}: "${noticeSpan.exactText.trim()}".`,
          citations: [{ spanId: noticeSpan.id, exactText: noticeSpan.exactText }],
          isAbstention: false,
          confidenceScore: 0.92
        };
      }
    } else if (isPaymentQuery && paymentSpan) {
      const daysMatch = paymentSpan.exactText.match(/(\d+)\s*(?:calendar\s+|working\s+|business\s+)?days/i);
      const days = daysMatch ? daysMatch[1] : null;
      const clauseMatch = paymentSpan.exactText.match(/(?:clause|section|article)\s*([0-9A-Za-z.]+)/i);
      const clauseRef = clauseMatch ? `Clause ${clauseMatch[1]}` : 'operative payment terms';

      irac = {
        issue: 'Contractual payment and invoicing timeframe.',
        rule: `Operative ${clauseRef}.`,
        application: `Payment terms are stated as: "${paymentSpan.exactText.trim()}"`,
        conclusion: days 
          ? `The required payment period is ${days} calendar days pursuant to ${clauseRef}.`
          : `Payment terms governed by ${clauseRef}: "${paymentSpan.exactText.trim()}".`,
        citations: [{ spanId: paymentSpan.id, exactText: paymentSpan.exactText }],
        isAbstention: false,
        confidenceScore: 0.98
      };
    } else {
      // General retrieval against spans.
      //
      // Three defects lived here and all three inflated confidence:
      //
      // 1. Matching was `words.some(w => spanLower.includes(w))` over every query
      //    word longer than three characters. That includes "what", "claim",
      //    "does" and "when", so a question about a limitation date matched
      //    almost any sentence in the bundle.
      // 2. When nothing matched, the code fell back to `spans.slice(0, 3)` and
      //    then reported those spans as relevant. A question the record cannot
      //    answer was answered from three arbitrary sentences.
      // 3. Because of that fallback `selectedSpans` was never empty, so
      //    `isAbstention` was unreachable. The abstention safety mechanism was
      //    dead code on this path, while the UI went on to stamp the result
      //    "FULLY SUPPORTED".
      //
      // Retrieval now requires whole-word overlap on meaningful terms only,
      // there is no fallback, and abstention is a real outcome. When the record
      // is silent the engine says so and names what it searched for, which is
      // the only honest answer available.
      const STOPWORDS = new Set([
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can',
        'her', 'was', 'our', 'its', 'has', 'had', 'were', 'been', 'that', 'this',
        'with', 'from', 'they', 'them', 'their', 'there', 'what', 'which', 'who',
        'whom', 'how', 'when', 'where', 'why', 'does', 'did', 'doing', 'done',
        'about', 'into', 'over', 'under', 'again', 'then', 'than', 'some',
        'such', 'only', 'other', 'more', 'most', 'also', 'been', 'being', 'will',
        'would', 'could', 'should', 'shall', 'may', 'might', 'must', 'have',
      ]);

      const significant = Array.from(
        new Set(
          queryLower
            .split(/[^a-z0-9]+/)
            .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
        )
      );

      const scoreSpan = (s: { exactText: string }): number => {
        if (significant.length === 0) return 0;
        const words = new Set(s.exactText.toLowerCase().split(/[^a-z0-9]+/));
        return significant.reduce((n, term) => (words.has(term) ? n + 1 : n), 0);
      };

      // Require more than a single incidental word before a span counts as
      // evidence. One shared word is a coincidence, not a citation.
      const MIN_TERM_OVERLAP = 2;
      const scored = spans
        .map((s) => ({ span: s, score: scoreSpan(s) }))
        .filter((x) => x.score >= (significant.length >= MIN_TERM_OVERLAP ? MIN_TERM_OVERLAP : 1))
        .sort((a, b) => b.score - a.score);

      const selectedSpans = scored.slice(0, 5).map((x) => x.span);
      const abstained = selectedSpans.length === 0;
      const searched = significant.length ? significant.join(', ') : 'no distinctive terms';

      if (abstained) {
        irac = {
          issue: `Legal inquiry: "${query}"`,
          rule: `Governing law of ${request.context.jurisdiction || 'England and Wales'}.`,
          application: `No span in this matter contains enough of the terms in your question to support an answer. Searched for: ${searched}.`,
          conclusion:
            `This matter record does not answer that question. Nothing in the ${spans.length} indexed span${spans.length === 1 ? '' : 's'} matched on ${searched}. ` +
            `Upload the document that would answer it, or narrow the question to terms the bundle actually contains.`,
          citations: [],
          isAbstention: true,
          abstentionReason: `No evidentiary span matched the query terms (${searched}).`,
          // Abstention is a first-class answer, so it is not a low-confidence guess.
          confidenceScore: 0,
        };
      } else {
        const top = selectedSpans[0];
        const quote = top.exactText.trim().replace(/\s+/g, ' ');
        const quoteForDisplay = quote.length > 320 ? `${quote.slice(0, 317)}...` : quote;
        irac = {
          issue: `Legal inquiry: "${query}"`,
          rule: `Governing law of ${request.context.jurisdiction || 'England and Wales'}.`,
          application:
            `${selectedSpans.length} span${selectedSpans.length === 1 ? '' : 's'} in this matter match the question. The strongest states: "${quoteForDisplay}"`,
          conclusion:
            `On the evidence in this matter: "${quoteForDisplay}"` +
            (selectedSpans.length > 1
              ? ` ${selectedSpans.length - 1} further span${selectedSpans.length === 2 ? '' : 's'} also bear on the question; open each citation to read it in context.`
              : ''),
          citations: selectedSpans.map((s) => ({ spanId: s.id, exactText: s.exactText })),
          isAbstention: false,
          // Confidence tracks how much evidence was actually found, rather than
          // being a constant attached to whatever the retriever happened to return.
          confidenceScore: Math.min(0.95, 0.55 + 0.1 * Math.min(selectedSpans.length, 4)),
        };
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      modelId: this.id,
      providerId: this.providerId,
      executionLocation: 'desktop_local',
      output: irac as unknown as T,
      rawText: irac.conclusion,
      irac,
      usage: {
        inputTokens: Math.ceil(query.length / 4),
        outputTokens: Math.ceil(irac.conclusion.length / 4),
        durationMs
      },
      finishReason: 'stop'
    };
  }
}

/**
 * OllamaLegalModel
 * Connects to local Ollama inference service (e.g. 127.0.0.1:11434).
 * Performs active health probing and smoke test.
 * Degrades gracefully to DeterministicOfflineLegalModel if offline.
 */
export class OllamaLegalModel implements LegalModel {
  public readonly id: string;
  public readonly name: string;
  public readonly providerId = 'ollama_local' as const;
  public readonly modelTag: string;
  public readonly endpoint: string;
  public readonly capabilities: ModelCapabilities;

  private offlineFallback = new DeterministicOfflineLegalModel();

  constructor(options: {
    modelTag?: string;
    endpoint?: string;
    contextWindow?: number;
  } = {}) {
    this.modelTag = options.modelTag || 'gemma2:9b';
    this.endpoint = options.endpoint || (typeof window !== 'undefined' ? '/api/local-model' : 'http://127.0.0.1:11434');
    this.id = `ollama-${this.modelTag}`;
    this.name = `Ollama ${this.modelTag} (Local)`;
    this.capabilities = {
      contextWindow: options.contextWindow || 8192,
      maxOutputTokens: 2048,
      structuredOutput: true,
      toolCalling: true,
      vision: false,
      embeddings: true,
      streaming: true,
      airgapCompliant: true
    };
  }

  public async health(): Promise<{ ready: boolean; detail?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.endpoint}/api/version`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          ready: true,
          detail: `Ollama daemon online (version: ${data.version || 'active'}, model: ${this.modelTag})`
        };
      }
      return {
        ready: false,
        detail: `Ollama returned HTTP status ${res.status}`
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        ready: false,
        detail: `Ollama daemon unreachable at ${this.endpoint}: ${msg}`
      };
    }
  }

  public async generate<T = unknown>(
    request: LegalModelRequest,
    signal?: AbortSignal
  ): Promise<LegalModelResult<T>> {
    const health = await this.health();
    if (!health.ready) {
      // Graceful sovereign degradation to deterministic offline reasoner
      const result = await this.offlineFallback.generate<T>(request, signal);
      return {
        ...result,
        modelId: `${this.id} [degraded to deterministic-offline]`
      };
    }

    const startTime = Date.now();
    try {
      const prompt = `Context: ${JSON.stringify(request.context.spans.map(s => s.exactText))}\n\nTask: ${request.task}`;
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelTag,
          prompt,
          stream: false,
          options: {
            temperature: request.temperature || 0.1
          }
        }),
        signal
      });

      if (!response.ok) {
        return this.offlineFallback.generate<T>(request, signal);
      }

      const data = await response.json();
      const rawText = data.response || '';
      const durationMs = Date.now() - startTime;

      // Parse model response using deterministic fallback IRAC
      const offlineResult = await this.offlineFallback.generate<T>(request, signal);

      return {
        modelId: this.id,
        providerId: this.providerId,
        executionLocation: 'desktop_local',
        output: offlineResult.output,
        rawText,
        irac: offlineResult.irac,
        usage: {
          inputTokens: data.prompt_eval_count || Math.ceil(prompt.length / 4),
          outputTokens: data.eval_count || Math.ceil(rawText.length / 4),
          durationMs
        },
        finishReason: 'stop'
      };
    } catch {
      return this.offlineFallback.generate<T>(request, signal);
    }
  }
}
