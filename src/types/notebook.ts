export type SourceContextMode = 'full' | 'summary' | 'excluded';

export type NotebookTransformationType = 
  | 'summary' 
  | 'chronology' 
  | 'study_guide' 
  | 'faq' 
  | 'vulnerabilities' 
  | 'entities' 
  | 'custom';

export interface NotebookCitation {
  documentId: string;
  documentTitle: string;
  spanId?: string;
  quote: string;
  startOffset?: number;
  endOffset?: number;
  checksum?: string;
  /**
   * True only when the quoted text was actually located in the source document.
   *
   * This is a text-provenance fact, not a legal conclusion. Whether the evidence
   * is admissible in front of a court is never asserted here.
   */
  quoteLocatedInSource: boolean;
  temporalDate?: string;
}

export interface NotebookNote {
  id: string;
  notebookId: string;
  title: string;
  content: string;
  transformationType: NotebookTransformationType | 'manual';
  tags: string[];
  citations: NotebookCitation[];
  evidentialCoverageRatio: number; // 0 to 1.0 (Fix for uncalibrated open-notebook hallucination)
  temporalConflictsDetected: number; // Fix for open-notebook date blindspots
  createdAt: string;
  updatedAt: string;
}

export type PodcastSpeakerRole = 'judge' | 'claimant_kc' | 'respondent_kc' | 'assessor' | 'custom';

export interface NotebookPodcastSpeaker {
  id: string;
  name: string;
  role: PodcastSpeakerRole;
  voiceProfile: 'male_authoritative' | 'female_analytical' | 'male_adversarial' | 'female_scholarly';
  backstory: string;
  avatarColor: string;
}

export interface NotebookPodcastTurn {
  turnNumber: number;
  speakerId: string;
  speakerName: string;
  speakerRole: PodcastSpeakerRole;
  dialogue: string;
  stageDirection?: string; // e.g. "[skeptical, examining exhibit]"
  citedDocumentId?: string;
  citedDocumentTitle?: string;
  citedSpanQuote?: string;
  latinGlossaryUsed?: string[]; // e.g. ["prima facie", "ultra vires"]
  durationSecEstimate: number;
}

export type PodcastOverviewFormat = 
  | 'judicial_dialectic' 
  | 'strategy_interrogation' 
  | 'oral_argument_moot' 
  | 'executive_briefing';

export interface NotebookPodcast {
  id: string;
  notebookId: string;
  title: string;
  overviewFormat: PodcastOverviewFormat;
  speakers: NotebookPodcastSpeaker[];
  turns: NotebookPodcastTurn[];
  totalDurationSeconds: number;
  billingUnits6Min: number; // 6-minute billing units as defined by the SRA Code of Conduct
  generatedAt: string;
}

export interface NotebookChatMessage {
  id: string;
  notebookId: string;
  sender: 'user' | 'assistant';
  text: string;
  citations: NotebookCitation[];
  evidentialCoverageRatio?: number;
  abstentionNotice?: string;
  timestamp: string;
}

export interface NotebookAskResult {
  question: string;
  synthesizedAnswer: string;
  evidentialCoverageRatio: number;
  isAbstaining: boolean; // arXiv:2411.06037 selective abstention
  abstentionReason?: string;
  relevantChunks: Array<{
    documentId: string;
    documentTitle: string;
    chunkText: string;
    score: number;
    startOffset: number;
    endOffset: number;
  }>;
  missingDiscoveryNeeded: string[];
  temporalContradictions: string[];
  suggestedNextQuestions: string[];
}

export interface Notebook {
  id: string;
  matterId: string;
  title: string;
  description: string;
  activeSourceIds: string[];
  sourceContextModes: Record<string, SourceContextMode>;
  notes: NotebookNote[];
  podcasts: NotebookPodcast[];
  chatMessages: NotebookChatMessage[];
  createdAt: string;
  updatedAt: string;
}
