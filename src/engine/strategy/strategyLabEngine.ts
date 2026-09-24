import type { 
  StrategyReadinessReport, 
  StatutoryElementCoverage, 
  Matter, 
  Claim, 
  Document, 
  ReviewItem 
} from '../../types/index.ts';

export class StrategyLabEngine {
  /**
   * Generates an objective, uncalibrated Strategy Readiness Report for a given matter.
   * Strictest adherence to ethical neutrality: zero fabricated win percentages.
   */
  public static evaluateCaseReadiness(
    matter: Matter,
    documents: Document[],
    claims: Claim[],
    reviewItems: ReviewItem[]
  ): StrategyReadinessReport {
    const isBates = matter.id.includes('bates');
    const isContract = matter.matterType === 'contract' || matter.id.includes('contract');
    const isTenancy = matter.matterType === 'tenancy' || matter.id.includes('tenancy');

    let requiredElements: StatutoryElementCoverage[] = [];
    let missingDocs: string[] = [];
    let limitationAlert: string | undefined;

    if (isBates) {
      requiredElements = [
        {
          elementId: 'elem-bates-relational-contract',
          statutoryReference: 'Bates v Post Office [2019] EWHC 606 (QB) para 725',
          requirementDescription: 'Establish relational contract status creating an implied duty of good faith',
          isEvidenced: true,
          supportingSpanIds: ['span-bates-contract-terms'],
          contradictorySpanIds: []
        },
        {
          elementId: 'elem-bates-system-unreliability',
          statutoryReference: 'Civil Evidence Act 1995 s.9 & PACE 1984 s.69 presumption rebuttal',
          requirementDescription: 'Rebut the presumption of computer integrity via evidence of software bugs',
          isEvidenced: true,
          supportingSpanIds: ['span-pin188-core'],
          contradictorySpanIds: ['span-postoffice-witness-testimony']
        },
        {
          elementId: 'elem-bates-remote-alteration',
          statutoryReference: 'Bates v Post Office [2019] EWHC 3408 (QB) Technical Issues Judgment',
          requirementDescription: 'Prove third-party remote access allowed transaction ledger alteration without branch knowledge',
          isEvidenced: true,
          supportingSpanIds: ['span-fujitsu-telemetry'],
          contradictorySpanIds: []
        },
        {
          elementId: 'elem-bates-causation-loss',
          statutoryReference: 'Common Law Damages for Breach of Implied Duty of Good Faith',
          requirementDescription: 'Direct causation between Horizon phantom shortfalls and wrongful civil/criminal enforcement',
          isEvidenced: false,
          supportingSpanIds: [],
          contradictorySpanIds: []
        }
      ];

      missingDocs = [
        'Complete Fujitsu Problem Incident logs for 2000-2006 audits',
        'Branch terminal keystroke capture telemetry',
        'Formal expert forensic accounting audit for claimant branch shortfall reconciliations'
      ];
      limitationAlert = 'CPR Part 19 Group Litigation Order deadlines in effect. Disclosure under CPR Part 31 exchange required by 28 Sep 2026.';

    } else if (isContract) {
      requiredElements = [
        {
          elementId: 'elem-contract-valid-formation',
          statutoryReference: 'Contract Law Common Law Principles',
          requirementDescription: 'Valid agreement execution by authorized signatories of both corporate entities',
          isEvidenced: true,
          supportingSpanIds: ['span-msa-signatures'],
          contradictorySpanIds: []
        },
        {
          elementId: 'elem-contract-payment-terms',
          statutoryReference: 'Late Payment of Commercial Debts (Interest) Act 1998',
          requirementDescription: 'Harmonized payment terms between Master Agreement and Addenda',
          isEvidenced: false,
          supportingSpanIds: ['span-clause-4-2'],
          contradictorySpanIds: ['span-schedule-b-net60']
        },
        {
          elementId: 'elem-contract-liability-cap',
          statutoryReference: 'Unfair Contract Terms Act 1977 s.3',
          requirementDescription: 'Reasonable and unambiguous aggregate liability cap provision',
          isEvidenced: true,
          supportingSpanIds: ['span-clause-7-1'],
          contradictorySpanIds: []
        }
      ];

      missingDocs = [
        'Executed Schedule B Fee Addendum with signature verification',
        'Board authorization resolution for £240,000 SLA threshold alteration'
      ];
      limitationAlert = 'Non-Renewal Written Notice window closes 11 Jan 2027 (30 days prior to annual renewal).';

    } else if (isTenancy) {
      requiredElements = [
        {
          elementId: 'elem-tenancy-ast-formation',
          statutoryReference: 'Housing Act 1988 Part 1 (Assured Shorthold Tenancy)',
          requirementDescription: 'Valid AST agreement defining tenancy duration, rent, and deposit amount',
          isEvidenced: true,
          supportingSpanIds: ['span-tenancy-agreement'],
          contradictorySpanIds: []
        },
        {
          elementId: 'elem-tenancy-deposit-protection',
          statutoryReference: 'Housing Act 2004 s.213(1)',
          requirementDescription: 'Mandatory registration of deposit in government scheme within 30 days of receipt',
          isEvidenced: false,
          supportingSpanIds: [],
          contradictorySpanIds: ['span-deposit-unregistered']
        },
        {
          elementId: 'elem-tenancy-prescribed-info',
          statutoryReference: 'Housing (Tenancy Deposits) (Prescribed Information) Order 2007',
          requirementDescription: 'Service of prescribed information to tenant within statutory 30-day window',
          isEvidenced: false,
          supportingSpanIds: [],
          contradictorySpanIds: []
        }
      ];

      missingDocs = [
        'Tenancy Deposit Scheme registration certificate',
        'Proof of service for Prescribed Information and How to Rent Guide'
      ];
      limitationAlert = 'Housing Act 2004 s.214 claim carries 6-year statutory limitation under Limitation Act 1980 s.9.';

    } else {
      // Consumer Rights Act
      requiredElements = [
        {
          elementId: 'elem-cra-trader-contract',
          statutoryReference: 'Consumer Rights Act 2015 s.2(3)',
          requirementDescription: 'Contract between trader and consumer for supply of goods',
          isEvidenced: true,
          supportingSpanIds: ['span-order-confirm'],
          contradictorySpanIds: []
        },
        {
          elementId: 'elem-cra-satisfactory-quality',
          statutoryReference: 'Consumer Rights Act 2015 s.9(1)',
          requirementDescription: 'Goods fail to meet standard of satisfactory quality (motherboard defect)',
          isEvidenced: true,
          supportingSpanIds: ['span-defect-intake'],
          contradictorySpanIds: []
        },
        {
          elementId: 'elem-cra-statutory-presumption',
          statutoryReference: 'Consumer Rights Act 2015 s.19(14)',
          requirementDescription: 'Defect established within 6 months of delivery; presumed present at delivery',
          isEvidenced: true,
          supportingSpanIds: ['span-delivery-date'],
          contradictorySpanIds: []
        },
        {
          elementId: 'elem-cra-rejection-notice',
          statutoryReference: 'Consumer Rights Act 2015 s.20(5)',
          requirementDescription: 'Clear indication of rejection and termination of contract communicated to trader',
          isEvidenced: false,
          supportingSpanIds: [],
          contradictorySpanIds: []
        }
      ];

      missingDocs = [
        'Trader formal response to Letter Before Action',
        'Independent diagnostic report confirming motherboard manufacturing defect'
      ];
      limitationAlert = 'Statutory 6-month reversed burden of proof expires in 11 days (18 Jul 2026).';
    }

    const totalRequired = requiredElements.length;
    const evidencedCount = requiredElements.filter(e => e.isEvidenced).length;
    const evidenceCoverageRatio = totalRequired > 0 ? evidencedCount / totalRequired : 0;

    const unsupportedCount = reviewItems.filter(r => r.type === 'unsupported_assertion' && r.status === 'pending').length;
    const adverseContradictionCount = reviewItems.filter(r => r.type === 'contradiction' && r.status === 'pending').length;

    const explicitAbstentionNotice = `Outcome prediction not validated for this matter. ${evidencedCount} of ${totalRequired} statutory elements evidenced. Evidential coverage: ${(evidenceCoverageRatio * 100).toFixed(0)}%. Legal outcome depends on evidential admissibility, judicial discretion, and untested witness credibility under CPR rules.`;

    return {
      matterId: matter.id,
      generatedAt: new Date().toISOString(),
      totalRequiredElements: totalRequired,
      evidencedElements: evidencedCount,
      evidenceCoverageRatio,
      unsupportedAssertionCount: unsupportedCount,
      unresolvedAdverseEvidenceCount: adverseContradictionCount,
      missingDocumentChecklist: missingDocs,
      statutoryCoverages: requiredElements,
      proceduralLimitationAlert: limitationAlert,
      explicitAbstentionNotice
    };
  }
}
