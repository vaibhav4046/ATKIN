/**
 * ATKIN Task Classifier
 * Section 9: Structured Legal Task Classification
 *
 * Classifies user intent into 12 structured legal task types and determines
 * execution requirements (capabilities, network, tools, approval).
 */

export type LegalTaskType =
  | 'conversation'
  | 'source_question'
  | 'legal_research'
  | 'document_review'
  | 'comparison'
  | 'chronology'
  | 'drafting'
  | 'proofreading'
  | 'calculation'
  | 'workflow'
  | 'external_action'
  | 'background_work';

export interface TaskClassification {
  taskType: LegalTaskType;
  confidence: number;
  reason: string;
  requiredCapabilities: {
    structuredOutput: boolean;
    tools: boolean;
    longContext: boolean;
    citationVerification: boolean;
  };
  networkRequirement: 'offline_mandatory' | 'local_optional' | 'internet_required';
  toolRequirement: string[];
  approvalRequirement: 'none' | 'recommended' | 'mandatory';
}

interface PatternRule {
  taskType: LegalTaskType;
  patterns: RegExp[];
  negativePatterns?: RegExp[];
  score: number;
  tools: string[];
  network: 'offline_mandatory' | 'local_optional' | 'internet_required';
  approval: 'none' | 'recommended' | 'mandatory';
}

const CLASSIFICATION_RULES: PatternRule[] = [
  {
    taskType: 'external_action',
    patterns: [
      /\b(email\b|send\s+email|file\s+claim|export\s+to\s+clio|upload\s+to\s+drive|submit\s+court)\b/i
    ],
    score: 0.95,
    tools: ['ExternalConnector', 'ApprovalEngine'],
    network: 'internet_required',
    approval: 'mandatory'
  },
  {
    taskType: 'calculation',
    patterns: [
      /\b(deadline|limitation\s+period|cpr\s+2\.8|clear\s+days|how\s+many\s+days|calculate\s+date|statutory\s+deadline)\b/i
    ],
    score: 0.95,
    tools: ['TimeRuleEngine'],
    network: 'offline_mandatory',
    approval: 'none'
  },
  {
    taskType: 'chronology',
    patterns: [
      /\b(chronolog\w*|timeline|sequence\s+of\s+events|schedule\s+of\s+events|what\s+happened\s+when)\b/i
    ],
    score: 0.90,
    tools: ['MatterAnalyzer'],
    network: 'offline_mandatory',
    approval: 'none'
  },
  {
    taskType: 'comparison',
    patterns: [
      /\b(compare|inconsisten\w*|contradict\w*|difference\s+between|conflict\s+between|reconcile)\b/i
    ],
    score: 0.90,
    tools: ['ContradictionEngine', 'MatterAnalyzer'],
    network: 'offline_mandatory',
    approval: 'none'
  },
  {
    taskType: 'legal_research',
    patterns: [
      /\b(research|case\s+law|precedent|authority|authorities|statute|enforceab\w*|legislation\.gov|ucta|cra\s+2015)\b/i
    ],
    score: 0.85,
    tools: ['LegalAuthorityEngine', 'CitationGate'],
    network: 'local_optional',
    approval: 'none'
  },
  {
    taskType: 'drafting',
    patterns: [
      /\b(draft|prepare\s+advice|advice\s+note|pleading|letter\s+before\s+action|contract\s+clause|redline)\b/i
    ],
    score: 0.85,
    tools: ['DraftingEngine', 'CitationGate'],
    network: 'offline_mandatory',
    approval: 'recommended'
  },
  {
    taskType: 'document_review',
    patterns: [
      /\b(review|audit\s+clause|indemnity|liability\s+cap|termination\s+notice|governing\s+law)\b/i
    ],
    score: 0.80,
    tools: ['CitationGate', 'MatterAnalyzer'],
    network: 'offline_mandatory',
    approval: 'none'
  },
  {
    taskType: 'proofreading',
    patterns: [
      /\b(proofread|typo|grammar|verify\s+citations|check\s+citations)\b/i
    ],
    score: 0.80,
    tools: ['CitationGate'],
    network: 'offline_mandatory',
    approval: 'none'
  },
  {
    taskType: 'source_question',
    patterns: [
      /\b(what\s+does\s+the\s+contract\s+say|what\s+notice|clause\s+\d|according\s+to\s+the\s+agreement|what\s+is\s+the\s+price)\b/i
    ],
    score: 0.75,
    tools: ['MatterAnalyzer', 'CitationGate'],
    network: 'offline_mandatory',
    approval: 'none'
  }
];

export class TaskClassifier {
  public classify(userQuery: string, hasAttachedSources: boolean = false): TaskClassification {
    const trimmed = userQuery.trim();

    for (const rule of CLASSIFICATION_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(trimmed)) {
          return {
            taskType: rule.taskType,
            confidence: rule.score,
            reason: `Matched intent pattern '${pattern.source}'`,
            requiredCapabilities: {
              structuredOutput: rule.taskType === 'drafting' || rule.taskType === 'chronology',
              tools: rule.tools.length > 0,
              longContext: rule.taskType === 'document_review' || rule.taskType === 'comparison',
              citationVerification: rule.tools.includes('CitationGate')
            },
            networkRequirement: rule.network,
            toolRequirement: rule.tools,
            approvalRequirement: rule.approval
          };
        }
      }
    }

    // Fallback: If user asks with attached sources, treat as source_question; otherwise conversational
    if (hasAttachedSources) {
      return {
        taskType: 'source_question',
        confidence: 0.70,
        reason: 'Defaulted to source inquiry based on active matter sources.',
        requiredCapabilities: {
          structuredOutput: false,
          tools: true,
          longContext: false,
          citationVerification: true
        },
        networkRequirement: 'offline_mandatory',
        toolRequirement: ['CitationGate'],
        approvalRequirement: 'none'
      };
    }

    return {
      taskType: 'conversation',
      confidence: 0.60,
      reason: 'General inquiry without specialized procedural patterns.',
      requiredCapabilities: {
        structuredOutput: false,
        tools: false,
        longContext: false,
        citationVerification: false
      },
      networkRequirement: 'offline_mandatory',
      toolRequirement: [],
      approvalRequirement: 'none'
    };
  }
}

export const taskClassifier = new TaskClassifier();
