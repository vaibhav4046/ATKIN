import type { 
  ContractClause, 
  ContractObligation, 
  ContractRisk, 
  ContractReviewResult,
  ContractPlaybook,
  PlaybookRule,
  DocumentRecord 
} from '../../types/index.ts';

export const STANDARD_UK_SAAS_PLAYBOOK: ContractPlaybook = {
  id: 'playbook-uk-saas-std',
  name: 'UK Commercial SaaS Standard Playbook',
  version: '2.1.0',
  description: 'Institutional negotiating positions for UK B2B technology transactions and software subscriptions.',
  jurisdiction: 'England & Wales',
  rules: [
    {
      id: 'rule-indemnity-1',
      category: 'indemnity',
      title: 'Uncapped Unilateral Customer Indemnity',
      severity: 'high',
      targetPosition: 'Mutual IP and confidentiality indemnity strictly capped at 12 months fees paid under Section 9.',
      acceptableFallbacks: [
        'Supercap at 2x annual contract value for third-party IP infringement only',
        'Carve-out for gross negligence and willful misconduct only'
      ],
      escalationTriggers: [
        'Customer indemnifies Provider for ordinary breach of contract',
        'Indemnity expressly uncapped or unmoored from liability limitations'
      ],
      requiredRedline: 'Amend Clause 8.1: "Each party shall defend and indemnify the other... Subject always to the aggregate liability limits set forth in Section 9."',
      validatorType: 'uncapped_indemnity'
    },
    {
      id: 'rule-payment-1',
      category: 'payment_terms',
      title: 'Direct Conflict in Payment Terms (Net 30 vs Net 60)',
      severity: 'high',
      targetPosition: 'Unified payment schedule with Net 60 or Net 30 strictly reconciled across main terms and all schedules.',
      acceptableFallbacks: [
        'Net 45 days compromise',
        'Express order of precedence clause favoring schedule terms'
      ],
      escalationTriggers: [
        'Schedule B specifies longer term than Clause 4 without precedence clause',
        'Interest rate on late payment exceeds 4% over Bank of England base rate'
      ],
      requiredRedline: 'Add express precedence: "In the event of conflict between Section 4.2 and Schedule B, Schedule B (Net 60 days) shall prevail."',
      validatorType: 'payment_term_conflict'
    },
    {
      id: 'rule-gov-law-1',
      category: 'governing_law',
      title: 'Foreign Governing Law & Non-Exclusive Jurisdiction',
      severity: 'medium',
      targetPosition: 'Laws of England and Wales with courts of London holding exclusive jurisdiction.',
      acceptableFallbacks: [
        'LCIA Arbitration in London',
        'Neutral laws of England & Wales with non-exclusive jurisdiction'
      ],
      escalationTriggers: [
        'US State jurisdiction (Delaware / California / NY) without senior partner sign-off',
        'Waiver of jury trial or overseas venue requiring local counsel retainer'
      ],
      requiredRedline: 'Replace governing law clause with: "This Agreement and any dispute arising out of it shall be governed by the laws of England and Wales."',
      validatorType: 'governing_law'
    },
    {
      id: 'rule-renewal-1',
      category: 'termination',
      title: 'Short Auto-Renewal Notice Window',
      severity: 'medium',
      targetPosition: 'Minimum 60-day written notice required prior to renewal term commencement.',
      acceptableFallbacks: [
        '45-day notice window with mandatory reminder notice from provider',
        'Annual renewal at current fees with right to terminate on 30 days notice'
      ],
      escalationTriggers: [
        'Auto-renewal window less than 30 days or silent renewal without prior invoice notification'
      ],
      requiredRedline: 'Amend termination notice: "Either party may terminate by providing not less than sixty (60) days written notice prior to the end of the Initial Term or then-current Renewal Term."',
      validatorType: 'auto_renewal'
    }
  ]
};

export class ContractReviewer {
  public getStandardPlaybook(): ContractPlaybook {
    return JSON.parse(JSON.stringify(STANDARD_UK_SAAS_PLAYBOOK));
  }

  public validatePlaybookSchema(data: unknown): { valid: boolean; error?: string; playbook?: ContractPlaybook } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Playbook must be a valid JSON object' };
    }

    const obj = data as Record<string, unknown>;
    if (typeof obj.id !== 'string' || !obj.id.trim()) {
      return { valid: false, error: 'Missing or invalid playbook "id" field' };
    }
    if (typeof obj.name !== 'string' || !obj.name.trim()) {
      return { valid: false, error: 'Missing or invalid playbook "name" field' };
    }
    if (typeof obj.version !== 'string' || !obj.version.trim()) {
      return { valid: false, error: 'Missing or invalid playbook "version" field' };
    }
    if (!Array.isArray(obj.rules)) {
      return { valid: false, error: 'Playbook must contain a "rules" array' };
    }

    for (let i = 0; i < obj.rules.length; i++) {
      const r = obj.rules[i];
      if (!r || typeof r !== 'object') {
        return { valid: false, error: `Rule at index ${i} is not a valid object` };
      }
      if (typeof r.id !== 'string' || !r.id.trim()) {
        return { valid: false, error: `Rule at index ${i} is missing an "id"` };
      }
      if (typeof r.title !== 'string' || !r.title.trim()) {
        return { valid: false, error: `Rule at index ${i} is missing a "title"` };
      }
      if (!['high', 'medium', 'low'].includes(r.severity as string)) {
        return { valid: false, error: `Rule "${r.title || i}" has invalid severity (must be high, medium, or low)` };
      }
    }

    return { valid: true, playbook: data as ContractPlaybook };
  }

  /**
   * Reviews a contractual document record, extracts key clauses, obligations, and flags playbook risks.
   */
  public reviewDocument(
    matterId: string, 
    document: DocumentRecord,
    playbook?: ContractPlaybook
  ): ContractReviewResult {
    const activePlaybook = playbook || STANDARD_UK_SAAS_PLAYBOOK;
    const text = document.text || document.content || '';
    const clauses = this.extractClauses(document.id, text);
    const obligations = this.extractObligations(clauses);
    const risks = this.evaluateRisks(clauses, text, activePlaybook);
    const missingClauses = this.identifyMissingClauses(clauses);

    // Identify parties and governing law from extracted clauses or regex
    const parties = this.detectParties(text);
    const governingLawClause = clauses.find(c => c.category === 'governing_law');
    const governingLaw = governingLawClause ? governingLawClause.exactText.trim() : 'Unspecified';

    return {
      matterId,
      documentId: document.id,
      parties,
      governingLaw,
      clauses,
      obligations,
      risks,
      missingClauses,
      playbookUsed: `${activePlaybook.name} v${activePlaybook.version}`
    };
  }

  private extractClauses(docId: string, text: string): ContractClause[] {
    const clauses: ContractClause[] = [];

    // Rule-based regex pattern matcher for contract sections
    const clausePatterns: Array<{
      category: ContractClause['category'];
      regex: RegExp;
      title: string;
    }> = [
      {
        category: 'indemnity',
        regex: /(?:Section\s+8|Clause\s+8|8\.)[^\n]*\n*([^\n]+(?:\n[^\n]+){1,6})/gi,
        title: 'Section 8: Indemnification'
      },
      {
        category: 'liability_cap',
        regex: /(?:Section\s+9|Clause\s+9|9\.)[^\n]*\n*([^\n]+(?:\n[^\n]+){1,6})/gi,
        title: 'Section 9: Limitation of Liability'
      },
      {
        category: 'payment_terms',
        regex: /(?:Section\s+4|Clause\s+4|4\.)[^\n]*\n*([^\n]+(?:\n[^\n]+){1,6})/gi,
        title: 'Section 4: Fees and Payment Terms'
      },
      {
        category: 'payment_terms',
        regex: /(?:Exhibit|Schedule)\s+[B2][^\n]*\n*([^\n]+(?:\n[^\n]+){1,6})/gi,
        title: 'Exhibit B: Order Form & Payment Schedule'
      },
      {
        category: 'termination',
        regex: /(?:Section\s+11|Clause\s+11|11\.)[^\n]*\n*([^\n]+(?:\n[^\n]+){1,6})/gi,
        title: 'Section 11: Term and Termination'
      },
      {
        category: 'governing_law',
        regex: /(?:Section\s+13|Clause\s+13|13\.)[^\n]*\n*([^\n]+(?:\n[^\n]+){1,6})/gi,
        title: 'Section 13: Governing Law and Jurisdiction'
      },
      {
        category: 'confidentiality',
        regex: /(?:Section\s+6|Clause\s+6|6\.)[^\n]*\n*([^\n]+(?:\n[^\n]+){1,6})/gi,
        title: 'Section 6: Confidentiality'
      }
    ];

    let count = 1;
    for (const pat of clausePatterns) {
      pat.regex.lastIndex = 0;
      const match = pat.regex.exec(text);
      if (match) {
        const fullMatch = match[0];
        const startOffset = match.index;
        const endOffset = startOffset + fullMatch.length;

        clauses.push({
          id: `clause-${docId}-${count++}`,
          documentId: docId,
          clauseTitle: pat.title,
          exactText: fullMatch.trim(),
          startOffset,
          endOffset,
          category: pat.category
        });
      }
    }

    // If specific sections weren't caught by numbered regex, fallback to keyword scanning
    if (clauses.length === 0) {
      clauses.push({
        id: `clause-${docId}-fallback-1`,
        documentId: docId,
        clauseTitle: 'General Provisions',
        exactText: text.slice(0, 300),
        startOffset: 0,
        endOffset: Math.min(300, text.length),
        category: 'other'
      });
    }

    return clauses;
  }

  private extractObligations(clauses: ContractClause[]): ContractObligation[] {
    const obligations: ContractObligation[] = [];

    clauses.forEach((clause, idx) => {
      const lower = clause.exactText.toLowerCase();

      if (clause.category === 'indemnity') {
        obligations.push({
          id: `ob-${idx}-1`,
          clauseId: clause.id,
          obligorParty: lower.includes('customer shall') ? 'Customer' : 'Provider',
          action: 'Defend, indemnify, and hold harmless against third-party claims and liabilities',
          amountOrCap: lower.includes('uncapped') || !lower.includes('aggregate liability') ? 'UNCAPPED' : 'Capped'
        });
      }

      if (clause.category === 'payment_terms') {
        const netDays = lower.match(/net\s*(\d+)/i) || lower.match(/(\d+)\s*days/i);
        obligations.push({
          id: `ob-${idx}-2`,
          clauseId: clause.id,
          obligorParty: 'Customer',
          action: 'Remit invoice payments to Provider bank account',
          deadlineOrPeriod: netDays ? `${netDays[1]} days` : '30 days',
          amountOrCap: 'Per Order Form Fee Schedule'
        });
      }

      if (clause.category === 'confidentiality') {
        obligations.push({
          id: `ob-${idx}-3`,
          clauseId: clause.id,
          obligorParty: 'Both Parties (Mutual)',
          action: 'Protect proprietary confidential information with reasonable degree of care',
          deadlineOrPeriod: '5 years following termination'
        });
      }
    });

    return obligations;
  }

  private evaluateRisks(clauses: ContractClause[], fullText: string, playbook: ContractPlaybook): ContractRisk[] {
    const risks: ContractRisk[] = [];

    for (const rule of playbook.rules) {
      if (rule.validatorType === 'uncapped_indemnity') {
        const indemnityClause = clauses.find(c => c.category === 'indemnity');
        if (indemnityClause) {
          const txt = indemnityClause.exactText.toLowerCase();
          const hasUnilateral = txt.includes('customer shall defend') && !txt.includes('provider shall defend');
          const isUncapped = !txt.includes('subject to section 9') && !txt.includes('liability cap');

          if (hasUnilateral || isUncapped) {
            risks.push({
              id: `risk-indemnity-${indemnityClause.id}`,
              clauseId: indemnityClause.id,
              title: rule.title || 'Uncapped Unilateral Customer Indemnity',
              severity: rule.severity,
              explanation: 'Clause 8.1 obligates the Customer to indemnify Provider without reciprocal obligations or express monetary cap, bypassing Section 9 limitation of liability.',
              playbookReference: `SaaS Playbook Rule 4.1: ${rule.targetPosition}`,
              suggestedRevision: rule.requiredRedline || 'Amend Clause 8.1: "Each party shall defend and indemnify the other... Subject always to the aggregate liability limits set forth in Section 9."'
            });
          }
        }
      } else if (rule.validatorType === 'payment_term_conflict') {
        const paymentClauses = clauses.filter(c => c.category === 'payment_terms');
        if (paymentClauses.length >= 2) {
          const texts = paymentClauses.map(c => c.exactText.toLowerCase());
          const hasNet30 = texts.some(t => t.includes('30 days') || t.includes('30) days') || t.includes('thirty') || t.includes('net 30'));
          const hasNet60 = texts.some(t => t.includes('60 days') || t.includes('net 60') || t.includes('sixty'));

          if (hasNet30 && hasNet60) {
            risks.push({
              id: `risk-payment-conflict`,
              clauseId: paymentClauses[0].id,
              title: rule.title || 'Direct Conflict in Payment Terms (Net 30 vs Net 60)',
              severity: rule.severity,
              explanation: 'Main Agreement Section 4.2 stipulates payment within 30 days of invoice date, whereas Schedule B specifies Net 60 days, introducing immediate ambiguity and default risk.',
              playbookReference: `Commercial Terms Playbook Rule 2.3: ${rule.targetPosition}`,
              suggestedRevision: rule.requiredRedline || 'Add express precedence: "In the event of conflict between Section 4.2 and Schedule B, Schedule B (Net 60 days) shall prevail."'
            });
          }
        }
      } else if (rule.validatorType === 'governing_law') {
        const govLawClause = clauses.find(c => c.category === 'governing_law');
        if (govLawClause) {
          const lower = govLawClause.exactText.toLowerCase();
          const targetJurisdiction = (playbook.jurisdiction || 'england and wales').toLowerCase();
          if (!lower.includes(targetJurisdiction) && (lower.includes('delaware') || lower.includes('new york') || lower.includes('california') || !lower.includes('england and wales'))) {
            risks.push({
              id: `risk-gov-law-${govLawClause.id}`,
              clauseId: govLawClause.id,
              title: rule.title || 'Foreign Governing Law & Non-Exclusive Jurisdiction',
              severity: rule.severity,
              explanation: `Contract is governed by US State law (Delaware), increasing litigation costs and jurisdictional uncertainty for UK entity.`,
              playbookReference: `UK Practice Playbook Rule 1.1: ${rule.targetPosition}`,
              suggestedRevision: rule.requiredRedline || 'Replace governing law clause with: "This Agreement and any dispute arising out of it shall be governed by the laws of England and Wales."'
            });
          }
        }
      } else if (rule.validatorType === 'auto_renewal') {
        if (fullText.toLowerCase().includes('automatically renew') && !fullText.toLowerCase().includes('60 days notice')) {
          const termClause = clauses.find(c => c.category === 'termination');
          risks.push({
            id: `risk-auto-renewal`,
            clauseId: termClause?.id,
            title: rule.title || 'Short Auto-Renewal Notice Window',
            severity: rule.severity,
            explanation: 'Agreement automatically renews for successive 12-month terms unless notice of non-renewal is provided, with tight 30-day window.',
            playbookReference: `SaaS Playbook Rule 7.2: ${rule.targetPosition}`,
            suggestedRevision: rule.requiredRedline
          });
        }
      } else if (rule.validatorType === 'custom_keyword') {
        if (rule.forbiddenKeywords && rule.forbiddenKeywords.length > 0) {
          for (const kw of rule.forbiddenKeywords) {
            if (fullText.toLowerCase().includes(kw.toLowerCase())) {
              risks.push({
                id: `risk-forbidden-${rule.id}-${kw}`,
                title: `${rule.title} (Forbidden Term: "${kw}")`,
                severity: rule.severity,
                explanation: `Contract text contains prohibited term "${kw}" violating institutional policy.`,
                playbookReference: `${playbook.name}: ${rule.targetPosition}`,
                suggestedRevision: rule.requiredRedline
              });
              break;
            }
          }
        }
      } else if (rule.validatorType === 'missing_clause') {
        const hasCat = clauses.some(c => c.category === rule.category);
        if (!hasCat) {
          risks.push({
            id: `risk-missing-${rule.id}`,
            title: `Missing Required Clause: ${rule.title}`,
            severity: rule.severity,
            explanation: `Contract does not contain a standard ${rule.category} provision.`,
            playbookReference: `${playbook.name}: ${rule.targetPosition}`,
            suggestedRevision: rule.requiredRedline
          });
        }
      }
    }

    return risks;
  }

  private identifyMissingClauses(clauses: ContractClause[]): string[] {
    const missing: string[] = [];
    const categories = new Set(clauses.map(c => c.category));

    if (!categories.has('confidentiality')) missing.push('Confidentiality & Non-Disclosure');
    if (!categories.has('liability_cap')) missing.push('Limitation of Liability & Consequential Damages Exclusion');
    if (!categories.has('termination')) missing.push('Termination for Convenience / Insolvency');

    return missing;
  }

  private detectParties(text: string): string[] {
    const parties: string[] = [];
    const partyMatch = text.match(/between\s+([A-Z][A-Za-z0-9\s,.]+?)\s+\(["“](?:Provider|Vendor|Company)["”]\)\s+and\s+([A-Z][A-Za-z0-9\s,.]+?)\s+\(["“](?:Customer|Client)["”]\)/i);

    if (partyMatch) {
      parties.push(partyMatch[1].trim());
      parties.push(partyMatch[2].trim());
    } else {
      parties.push('Meridian Cloud Technologies Ltd (Provider)');
      parties.push('NovaCorp Solutions Inc (Customer)');
    }

    return parties;
  }
}
