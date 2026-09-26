/**
 * ATKIN Sovereign Legal AI - Episodic Memory (Layer 2)
 * 
 * Records discrete task episodes, practitioner feedback, errors, and resolutions.
 * Enables recalling past precedent and synthesizing learned workflow insights.
 */

export interface TaskEpisode {
  id: string;
  matterId: string;
  taskType: 'clause_qa' | 'risk_audit' | 'draft_pleading' | 'disclosure_review' | 'statute_search' | 'advisory_memo';
  queryOrGoal: string;
  approachSummary: string;
  keyDecisions: string[];
  spansReferenced: string[];
  authoritiesReferenced: string[];
  outcome: 'success' | 'clarification_needed' | 'rejected_by_lawyer' | 'amended_by_lawyer';
  errorsEncountered?: string[];
  resolution?: string;
  userFeedback?: {
    rating: 'positive' | 'negative' | 'neutral';
    comment?: string;
    amendmentDelta?: string;
    timestamp: string;
  };
  tokensUsed: number;
  createdAt: string;
}

export class EpisodicMemoryEngine {
  private episodes: Map<string, TaskEpisode> = new Map();

  constructor(initialEpisodes?: TaskEpisode[]) {
    if (initialEpisodes) {
      for (const ep of initialEpisodes) {
        this.episodes.set(ep.id, ep);
      }
    }
  }

  public recordEpisode(params: Omit<TaskEpisode, 'id' | 'createdAt'>): TaskEpisode {
    const id = `ep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const episode: TaskEpisode = {
      ...params,
      id,
      createdAt: new Date().toISOString()
    };
    this.episodes.set(id, episode);
    return episode;
  }

  public recordFeedback(
    episodeId: string, 
    feedback: NonNullable<TaskEpisode['userFeedback']>
  ): boolean {
    const episode = this.episodes.get(episodeId);
    if (!episode) return false;

    episode.userFeedback = feedback;
    if (feedback.rating === 'negative' && episode.outcome === 'success') {
      episode.outcome = 'rejected_by_lawyer';
    } else if (feedback.amendmentDelta && episode.outcome === 'success') {
      episode.outcome = 'amended_by_lawyer';
    }
    return true;
  }

  public getEpisodesForMatter(matterId: string): TaskEpisode[] {
    return Array.from(this.episodes.values())
      .filter(ep => ep.matterId === matterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getEpisodeById(id: string): TaskEpisode | undefined {
    return this.episodes.get(id);
  }

  /**
   * Scoped episode recall: matches query tokens against past goals and approach summaries.
   * Strictly respects matter boundaries.
   */
  public recallRelevantEpisodes(
    matterId: string, 
    query: string, 
    taskType?: TaskEpisode['taskType'],
    limit = 3
  ): TaskEpisode[] {
    const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    const candidates = Array.from(this.episodes.values())
      .filter(ep => ep.matterId === matterId && (!taskType || ep.taskType === taskType));

    const scored = candidates.map(ep => {
      let score = 0;
      const fullText = `${ep.queryOrGoal} ${ep.approachSummary} ${ep.keyDecisions.join(' ')}`.toLowerCase();
      
      for (const tok of queryTokens) {
        if (fullText.includes(tok)) {
          score += 2;
        }
      }

      // Boost successful or positively rated episodes
      if (ep.userFeedback?.rating === 'positive') score += 5;
      if (ep.outcome === 'success') score += 2;
      // Penalize rejected episodes
      if (ep.outcome === 'rejected_by_lawyer') score -= 3;

      return { ep, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.ep);
  }

  /**
   * Extracts actionable insights from lawyer feedback on past episodes
   */
  public summarizeLearnedInsights(matterId: string): string[] {
    const matterEpisodes = this.getEpisodesForMatter(matterId);
    const insights: string[] = [];

    for (const ep of matterEpisodes) {
      if (ep.userFeedback?.rating === 'positive' && ep.userFeedback.comment) {
        insights.push(`Practitioner preference: "${ep.userFeedback.comment}" (Ref: ${ep.taskType})`);
      }
      if (ep.userFeedback?.amendmentDelta) {
        insights.push(`Practitioner amendment note: "${ep.userFeedback.amendmentDelta}"`);
      }
      if (ep.outcome === 'rejected_by_lawyer' && ep.userFeedback?.comment) {
        insights.push(`Avoid: "${ep.userFeedback.comment}" (Failed approach in ${ep.taskType})`);
      }
    }

    return insights;
  }

  public exportEpisodesJSON(): string {
    return JSON.stringify(Array.from(this.episodes.values()), null, 2);
  }

  public importEpisodesJSON(json: string): number {
    try {
      const items = JSON.parse(json);
      if (!Array.isArray(items)) return 0;
      let count = 0;
      for (const item of items) {
        if (item.id && item.matterId && item.taskType) {
          this.episodes.set(item.id, item);
          count++;
        }
      }
      return count;
    } catch {
      return 0;
    }
  }
}
