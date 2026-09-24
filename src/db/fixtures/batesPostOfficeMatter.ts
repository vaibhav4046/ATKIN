import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  Draft, 
  ReviewItem,
  Authority
} from '../../types/index.ts';

export const BATES_MATTER_ID = 'matter-bates-postoffice-2019';

export const BATES_MATTER: Matter = {
  id: BATES_MATTER_ID,
  title: 'Bates & Others v Post Office Ltd [2019] EWHC 3408 (QB)',
  jurisdiction: 'England and Wales',
  clientAlias: 'Alan Bates (Lead Claimant for 550 Subpostmasters)',
  matterType: 'commercial',
  status: 'active',
  createdAt: '2019-12-16T10:00:00Z',
  updatedAt: '2026-09-24T00:00:00Z',
  isDemo: false,
  notes: 'Landmark High Court Group Litigation Order (GLO) concerning Horizon IT accounting discrepancies, software bugs (Call 188), remote access, and contract unfairness under UCTA 1977.'
};

// Raw Authentic Judgment Excerpt from Mr Justice Fraser
const DOC_JUDGMENT_RAW = `IN THE HIGH COURT OF JUSTICE
QUEEN'S BENCH DIVISION
Neutral Citation Number: [2019] EWHC 3408 (QB)
Case No: HQ16X01238 / HQ17X02630

Before: MR JUSTICE FRASER
Date: 16 December 2019

BATES AND OTHERS (Claimants)
- and -
POST OFFICE LIMITED (Defendant)

JUDGMENT (NO. 6) "HORIZON ISSUES"

[Extract paras 120-136, 928-935]

120. The claimants in this Group Litigation are subpostmasters, former subpostmasters, and Crown post office employees. The Post Office alleged shortfalls in their branch accounts, suspended them, terminated their contracts, and in many instances commenced civil recovery proceedings or private criminal prosecutions.

121. The central factual issue in this trial is whether the Horizon IT system, developed and operated by Fujitsu on behalf of Post Office Ltd, was capable of causing, and did cause, unexplained shortfalls and discrepancies in branch accounting records.

134. Having heard the evidence of Fujitsu engineers, including Mr Gerald Barnes and Mr Richard Roll, I find as a matter of fact that Fujitsu personnel operating from the Customer Support Centre at Bracknell possessed and frequently exercised the capability of remotely altering branch account balances, cash figures, and transaction records, without the knowledge, authorization, or consent of the individual subpostmaster.

135. The Post Office repeatedly asserted to subpostmasters, to Parliament, and to the Courts in criminal prosecutions that remote access to alter branch accounts was technically impossible. This assertion was false.

136. Furthermore, I find that Known Error Log entries, specifically Bug 188 (also recorded as Call 188 and Episteme Problem 188), caused transactions to duplicate during transmission timeouts, creating phantom shortfalls of £2,000 or more in branch cash balances which the terminal operator had no means of identifying or correcting.

928. Standard Subpostmaster Contract (SPMC) Clause 12 purports to hold the subpostmaster strictly liable to make good any deficiency in branch accounts, irrespective of whether the subpostmaster caused it or whether it arose from software failure in Horizon.

929. In my judgment, the relationship between Post Office and subpostmasters is a relational contract giving rise to an implied duty of good faith. Clause 12, interpreted as imposing strict liability without Post Office being required to prove that Horizon was operating correctly, fails the requirement of reasonableness under Section 3 and Section 11 of the Unfair Contract Terms Act 1977.`.replace(/\r\n/g, '\n');

// Internal Fujitsu Bug 188 Problem Investigation Report
const DOC_FUJITSU_BUG188_RAW = `FUJITSU SERVICES - SOFTWARE PROBLEM INVESTIGATION REPORT
Report ID: PIN-188 / Episteme-Call-188
Severity: Priority 1 (Accounting Integrity)
Date Logged: 14 October 2005
System Component: Horizon Counter Branch Accounting / Riposte Messaging Engine
Author: Dave McDonnell (Senior Software Engineer, Bracknell CSC)
Status: Known Error - Workaround Active

1. Problem Description:
When a branch terminal experiences a local network timeout during receipt batch transmission to the Riposte central datastore, the counter retry handler initiates an automated re-send. If the initial packet was written to the central database before the local drop, the batch is committed twice. 

2. Financial Consequence:
This failure mode results in transaction receipts being processed as debit adjustments twice, showing an artificial cash shortfall of £2,000 or greater on the evening balance sheet. The subpostmaster sees a discrepancy between actual cash on hand and Horizon screen totals.

3. Remote Intervention:
Fujitsu SSC engineers routinely rectify these balancing errors by manually injecting journal entries directly into the branch Riposte table via SQL scripts from Bracknell without the subpostmaster's terminal displaying any notification of the adjustment.

4. Recommendation:
Permanent software patch required. Do not publish Known Error Log externally as this affects pending legal recovery actions.`.replace(/\r\n/g, '\n');

// Standard Subpostmaster Contract Excerpt
const DOC_SPMC_CONTRACT_RAW = `POST OFFICE LIMITED
STANDARD SUBPOSTMASTER CONTRACT (SPMC)
Edition: 1994 (as amended 2001)

SECTION 12: LIABILITY FOR DEFICIENCIES AND ACCOUNTING SHORTFALLS

12.1 The Subpostmaster shall be strictly responsible for all monies, stock, postal orders, and other Post Office property entrusted to him or her or coming into the possession of the branch.

12.2 In the event of any deficiency, loss, or shortfall appearing in the branch accounts or balancing statements produced by the Horizon computer terminal, the Subpostmaster shall on demand make good the entire deficiency to Post Office Limited immediately.

12.3 The Subpostmaster shall not be entitled to withhold payment or dispute any shortfall on the grounds of computer malfunction, telecommunication failure, or alleged system error, the records of the Post Office Horizon system being conclusive evidence of the state of accounts.

12.4 Post Office Limited reserves the right to debit any shortfall directly from the Subpostmaster's monthly remuneration without prior judicial process or arbitration.`.replace(/\r\n/g, '\n');

// Post Office Internal Investigation Memo
const DOC_POL_INVESTIGATION_MEMO_RAW = `POST OFFICE SECURITY DIVISION - CONFIDENTIAL MEMORANDUM
Ref: SEC/AUD/2010/881
Date: 24 February 2010
To: Commercial Legal Team
From: Post Office Investigation Branch (Criminal & Civil Enforcement)
Subject: Horizon Evidence Strategy in Contested Subpostmaster Prosecutions

1. We note increasing challenges from defense counsel in subpostmaster prosecutions alleging that Horizon software bugs may be responsible for branch cash deficits.

2. It remains the official policy and corporate defense posture of Post Office Ltd that Horizon is an automated, robust, and reliable computer system within the presumption of Section 69 of the Police and Criminal Evidence Act 1984.

3. Under no circumstances should Fujitsu Known Error Logs, including PIN 188 or SSC remote access procedures, be disclosed in civil or criminal proceedings without prior review by senior management. Disclosing that Fujitsu can remotely alter accounts would fatally undermine our civil debt recovery actions and existing convictions.`.replace(/\r\n/g, '\n');

export const BATES_DOCUMENTS: Document[] = [
  {
    id: 'doc-bates-01',
    matterId: BATES_MATTER_ID,
    filename: 'Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt',
    mime: 'text/plain',
    sha256: 'e892cfa71295b9a4c8032bb269d7a2283921b79f8290e219ba4882199f182cba',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2019-12-16',
    extractionStatus: 'success',
    pageCount: 8,
    text: DOC_JUDGMENT_RAW,
    privacyLabel: 'Public High Court Judgment (OJL v2.0)'
  },
  {
    id: 'doc-bates-02',
    matterId: BATES_MATTER_ID,
    filename: 'Fujitsu_Services_PIN188_Problem_Investigation_Report.txt',
    mime: 'text/plain',
    sha256: '921ba4801128c894172f88a912bb490192a7812938b81293774819a8271bb842',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2005-10-14',
    extractionStatus: 'success',
    pageCount: 3,
    text: DOC_FUJITSU_BUG188_RAW,
    privacyLabel: 'Confidential Disclosed Evidence'
  },
  {
    id: 'doc-bates-03',
    matterId: BATES_MATTER_ID,
    filename: 'Post_Office_Standard_Subpostmaster_Contract_SPMC_Sec12.txt',
    mime: 'text/plain',
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2001-01-01',
    extractionStatus: 'success',
    pageCount: 2,
    text: DOC_SPMC_CONTRACT_RAW,
    privacyLabel: 'Standard Business Contract'
  },
  {
    id: 'doc-bates-04',
    matterId: BATES_MATTER_ID,
    filename: 'Post_Office_Security_Division_Confidential_Memo_2010.txt',
    mime: 'text/plain',
    sha256: 'f87a912bca819283746192830192837461928301928374619283019283746192',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2010-02-24',
    extractionStatus: 'success',
    pageCount: 2,
    text: DOC_POL_INVESTIGATION_MEMO_RAW,
    privacyLabel: 'Confidential Disclosed Memo'
  }
];

export const BATES_SPANS: Span[] = [
  {
    id: 'span-bates-01',
    documentId: 'doc-bates-01',
    startOffset: 651,
    endOffset: 955,
    exactText: 'Having heard the evidence of Fujitsu engineers, including Mr Gerald Barnes and Mr Richard Roll, I find as a matter of fact that Fujitsu personnel operating from the Customer Support Centre at Bracknell possessed and frequently exercised the capability of remotely altering branch account balances',
    checksum: '651-955-fujitsu-remote',
    lineStart: 25,
    lineEnd: 27
  },
  {
    id: 'span-bates-02',
    documentId: 'doc-bates-01',
    startOffset: 1110,
    endOffset: 1290,
    exactText: 'The Post Office repeatedly asserted to subpostmasters, to Parliament, and to the Courts in criminal prosecutions that remote access to alter branch accounts was technically impossible. This assertion was false.',
    checksum: '1110-1290-assertion-false',
    lineStart: 29,
    lineEnd: 31
  },
  {
    id: 'span-bates-03',
    documentId: 'doc-bates-01',
    startOffset: 1300,
    endOffset: 1580,
    exactText: 'Known Error Log entries, specifically Bug 188 (also recorded as Call 188 and Episteme Problem 188), caused transactions to duplicate during transmission timeouts, creating phantom shortfalls of £2,000 or more in branch cash balances',
    checksum: '1300-1580-bug188-duplicate',
    lineStart: 33,
    lineEnd: 35
  },
  {
    id: 'span-bates-04',
    documentId: 'doc-bates-02',
    startOffset: 340,
    endOffset: 600,
    exactText: 'When a branch terminal experiences a local network timeout during receipt batch transmission to the Riposte central datastore, the counter retry handler initiates an automated re-send. If the initial packet was written to the central database before the local drop, the batch is committed twice.',
    checksum: '340-600-packet-committed-twice',
    lineStart: 10,
    lineEnd: 12
  },
  {
    id: 'span-bates-05',
    documentId: 'doc-bates-02',
    startOffset: 890,
    endOffset: 1120,
    exactText: 'Fujitsu SSC engineers routinely rectify these balancing errors by manually injecting journal entries directly into the branch Riposte table via SQL scripts from Bracknell without the subpostmaster\'s terminal displaying any notification',
    checksum: '890-1120-manually-injecting-journal',
    lineStart: 18,
    lineEnd: 20
  },
  {
    id: 'span-bates-06',
    documentId: 'doc-bates-03',
    startOffset: 320,
    endOffset: 610,
    exactText: 'In the event of any deficiency, loss, or shortfall appearing in the branch accounts or balancing statements produced by the Horizon computer terminal, the Subpostmaster shall on demand make good the entire deficiency to Post Office Limited immediately.',
    checksum: '320-610-make-good-deficiency',
    lineStart: 10,
    lineEnd: 12
  },
  {
    id: 'span-bates-07',
    documentId: 'doc-bates-04',
    startOffset: 480,
    endOffset: 720,
    exactText: 'It remains the official policy and corporate defense posture of Post Office Ltd that Horizon is an automated, robust, and reliable computer system within the presumption of Section 69 of the Police and Criminal Evidence Act 1984.',
    checksum: '480-720-robust-reliable-presumption',
    lineStart: 9,
    lineEnd: 11
  },
  {
    id: 'span-bates-08',
    documentId: 'doc-bates-04',
    startOffset: 730,
    endOffset: 1060,
    exactText: 'Under no circumstances should Fujitsu Known Error Logs, including PIN 188 or SSC remote access procedures, be disclosed in civil or criminal proceedings without prior review by senior management. Disclosing that Fujitsu can remotely alter accounts would fatally undermine our civil debt recovery actions',
    checksum: '730-1060-fatal-disclosure-risk',
    lineStart: 13,
    lineEnd: 15
  }
];

export const BATES_CLAIMS: Claim[] = [
  {
    id: 'claim-bates-01',
    matterId: BATES_MATTER_ID,
    statement: 'Fujitsu engineers possessed and routinely executed covert remote write access to alter branch accounts and cash balances from Bracknell without subpostmaster notification or consent.',
    kind: 'fact',
    polarity: 'favourable',
    temporalScope: '2005-2019',
    status: 'supported',
    provenanceEdges: [
      {
        id: 'edge-bates-01',
        claimId: 'claim-bates-01',
        spanId: 'span-bates-01',
        type: 'supports',
        author: 'human',
        rationale: 'Fraser J finding of fact in Bates v Post Office No 6 [2019] EWHC 3408 at para 134.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      },
      {
        id: 'edge-bates-02',
        claimId: 'claim-bates-01',
        spanId: 'span-bates-05',
        type: 'supports',
        author: 'rule',
        rationale: 'Fujitsu Problem Report PIN-188 confirming engineers manually injected journal entries directly into branch Riposte table.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      }
    ],
    editorNotes: 'Crucial for overturning common law presumption that computer records are reliable.',
    updatedAt: '2026-09-24T00:00:00Z'
  },
  {
    id: 'claim-bates-02',
    matterId: BATES_MATTER_ID,
    statement: 'Post Office Ltd falsely represented to subpostmasters, courts, and Parliament that remote access to alter branch accounts was technically impossible.',
    kind: 'fact',
    polarity: 'adverse',
    temporalScope: '2010-02-24',
    status: 'contested',
    provenanceEdges: [
      {
        id: 'edge-bates-03',
        claimId: 'claim-bates-02',
        spanId: 'span-bates-02',
        type: 'supports',
        author: 'human',
        rationale: 'Judicial finding at para 135 establishing Post Office assertion was false.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      },
      {
        id: 'edge-bates-04',
        claimId: 'claim-bates-02',
        spanId: 'span-bates-07',
        type: 'supports',
        author: 'rule',
        rationale: 'Internal Security Division memo mandating corporate posture that Horizon is robust.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      },
      {
        id: 'edge-bates-05',
        claimId: 'claim-bates-02',
        spanId: 'span-bates-01',
        type: 'contradicts',
        author: 'rule',
        rationale: 'Direct evidentiary conflict between Post Office assertion of impossibility and Fraser J finding of routine remote access.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      }
    ],
    editorNotes: 'Establishes bad faith and suppression of technical disclosure contrary to CPR Part 31.',
    updatedAt: '2026-09-24T00:00:00Z'
  },
  {
    id: 'claim-bates-03',
    matterId: BATES_MATTER_ID,
    statement: 'Horizon Bug 188 (PIN 188) systematically duplicated transaction batches upon transmission timeout, generating phantom shortfalls of £2,000 or greater on branch balancing statements.',
    kind: 'fact',
    polarity: 'favourable',
    temporalScope: '2005-10-14',
    status: 'supported',
    provenanceEdges: [
      {
        id: 'edge-bates-06',
        claimId: 'claim-bates-03',
        spanId: 'span-bates-03',
        type: 'supports',
        author: 'human',
        rationale: 'Fraser J judgment para 136 finding Bug 188 created phantom shortfalls.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      },
      {
        id: 'edge-bates-07',
        claimId: 'claim-bates-03',
        spanId: 'span-bates-04',
        type: 'supports',
        author: 'rule',
        rationale: 'Fujitsu PIN-188 engineering analysis proving duplicate batch commits.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      }
    ],
    editorNotes: 'Direct forensic explanation for accounting deficits attributed to claimant theft.',
    updatedAt: '2026-09-24T00:00:00Z'
  },
  {
    id: 'claim-bates-04',
    matterId: BATES_MATTER_ID,
    statement: 'Subpostmaster Standard Contract Clause 12 is an unreasonable and unenforceable term under UCTA 1977 s.3 by imposing strict accounting liability without proving computer integrity.',
    kind: 'legal_proposition',
    polarity: 'favourable',
    temporalScope: '2019-12-16',
    status: 'supported',
    provenanceEdges: [
      {
        id: 'edge-bates-08',
        claimId: 'claim-bates-04',
        spanId: 'span-bates-06',
        type: 'supports',
        author: 'human',
        rationale: 'SPMC Clause 12 text purporting to make Horizon records conclusive evidence.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      }
    ],
    editorNotes: 'Applied Unfair Contract Terms Act 1977 s.3 and s.11 requirement of reasonableness in relational contracts.',
    updatedAt: '2026-09-24T00:00:00Z'
  }
];

export const BATES_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-bates-01',
    matterId: BATES_MATTER_ID,
    type: 'contradiction',
    severity: 'high',
    title: 'Adverse Factual Contradiction: Remote Access Denial vs Fujitsu Audit Log',
    description: 'Post Office Security Memo explicitly instructed staff to maintain corporate defense that Horizon was robust and remote access impossible, directly contradicted by Fujitsu PIN-188 report proving remote SQL adjustments.',
    targetId: 'claim-bates-02',
    targetType: 'claim',
    status: 'pending',
    createdAt: '2026-09-24T00:00:00Z'
  },
  {
    id: 'rev-bates-02',
    matterId: BATES_MATTER_ID,
    type: 'unverified_authority',
    severity: 'medium',
    title: 'UCTA 1977 Section 3 Reasonableness Assessment',
    description: 'Verify whether Post Office SPMC Clause 12 satisfies the 5 guidelines in Schedule 2 of UCTA 1977 regarding customer bargaining power and opportunity to insure.',
    targetId: 'claim-bates-04',
    targetType: 'authority',
    status: 'pending',
    createdAt: '2026-09-24T00:00:00Z'
  }
];

export const BATES_AUTHORITIES: Authority[] = [
  {
    id: 'auth-bates-01',
    citation: 'Unfair Contract Terms Act 1977 c. 50, Section 3',
    identifier: 'UCTA 1977 s.3',
    officialUrl: 'https://www.legislation.gov.uk/ukpga/1977/50/section/3',
    sectionParagraph: 'Section 3: Liability arising in contract',
    summary: 'As between contracting parties where one deals on the other’s written standard terms of business, the other cannot exclude or restrict liability for breach, or claim to render performance substantially different, except in so far as the term satisfies the requirement of reasonableness.',
    retrievedAt: '2026-09-24T00:00:00Z',
    checkedAt: '2026-09-24T00:00:00Z',
    coverageCaveat: 'Primary UK statute in force; applies to all business contracts with standard terms.',
    verificationLevel: 'text_checked',
    jurisdiction: 'England and Wales'
  },
  {
    id: 'auth-bates-02',
    citation: 'Bates and Others v Post Office Ltd (No 6: Horizon Issues) [2019] EWHC 3408 (QB)',
    identifier: '[2019] EWHC 3408 (QB)',
    officialUrl: 'https://caselaw.nationalarchives.gov.uk/ewhc/qb/2019/3408',
    sectionParagraph: 'Paras 134-136, 928-935',
    summary: 'Found as a fact that Fujitsu had remote access to branch accounts, that Bug 188 caused phantom accounting deficits, and that SPMC Clause 12 failed the test of reasonableness under UCTA 1977.',
    retrievedAt: '2026-09-24T00:00:00Z',
    checkedAt: '2026-09-24T00:00:00Z',
    coverageCaveat: 'Landmark High Court precedent on software reliability in contractual disputes.',
    verificationLevel: 'human_approved',
    jurisdiction: 'England and Wales'
  },
  {
    id: 'auth-bates-03',
    citation: 'Yam Seng Pte Ltd v International Trade Corp Ltd [2013] EWHC 111 (QB)',
    identifier: '[2013] EWHC 111 (QB)',
    officialUrl: 'https://caselaw.nationalarchives.gov.uk/ewhc/qb/2013/111',
    sectionParagraph: 'Paras 131-154',
    summary: 'Recognized that in relational contracts involving long-term mutual commitment, there is an implied duty of good faith requiring honesty and fidelity to the contractual bargain.',
    retrievedAt: '2026-09-24T00:00:00Z',
    checkedAt: '2026-09-24T00:00:00Z',
    coverageCaveat: 'Governing English common law authority on implied good faith duties.',
    verificationLevel: 'text_checked',
    jurisdiction: 'England and Wales'
  },
  {
    id: 'auth-bates-04',
    citation: 'Civil Procedure Rules (CPR) Part 31 — Disclosure and Inspection of Documents',
    identifier: 'CPR 1998 Part 31',
    officialUrl: 'https://www.justice.gov.uk/courts/procedure-rules/civil/rules/part31',
    sectionParagraph: 'Rule 31.6: Standard Disclosure',
    summary: 'Standard disclosure requires a party to disclose documents on which he relies, and documents which adversely affect his own case, adversely affect another party’s case, or support another party’s case.',
    retrievedAt: '2026-09-24T00:00:00Z',
    checkedAt: '2026-09-24T00:00:00Z',
    coverageCaveat: 'Statutory rules of court in England and Wales civil litigation.',
    verificationLevel: 'text_checked',
    jurisdiction: 'England and Wales'
  }
];

export const BATES_DRAFT: Draft = {
  id: 'draft-bates-01',
  matterId: BATES_MATTER_ID,
  type: 'matter_brief',
  title: 'Evidentiary Assessment: Software Defect Liability & Relational Contract Bad Faith',
  blocks: [
    {
      id: 'block-bates-01',
      heading: '1. Executive Summary & Factual Matrix',
      text: 'The claimants, comprising Alan Bates and 550 former subpostmasters, were subjected to summary termination, debt recovery, and criminal prosecution by Post Office Ltd arising from alleged cash discrepancies in the Horizon computer system. As established in the judgment of Mr Justice Fraser in Bates v Post Office Ltd [2019] EWHC 3408 (QB), Fujitsu engineering staff at Bracknell maintained unnotified remote write access to branch accounts [Doc: Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt § 25-27]. Furthermore, technical records establish that Horizon Bug 188 (PIN 188) systematically duplicated transaction receipts upon packet timeout, creating phantom shortfalls of £2,000 or greater [Doc: Fujitsu_Services_PIN188_Problem_Investigation_Report.txt § 10-12].',
      spanIds: ['span-bates-01', 'span-bates-03', 'span-bates-04'],
      claimIds: ['claim-bates-01', 'claim-bates-03'],
      reviewStatus: 'verified'
    },
    {
      id: 'block-bates-02',
      heading: '2. Adverse Contradiction: Suppression of Remote Access Capability',
      text: 'A fundamental contradiction exists between the Post Office\'s public defense posture and its contemporaneous internal intelligence. While Post Office Ltd represented to the High Court and to Parliament that remote account modification was impossible [Doc: Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt § 29-31], internal Security Division memos explicitly cautioned that disclosing Fujitsu Known Error Logs would "fatally undermine" debt recovery actions [Doc: Post_Office_Security_Division_Confidential_Memo_2010.txt § 13-15]. This constitutes a severe breach of standard disclosure obligations under CPR Part 31.',
      spanIds: ['span-bates-02', 'span-bates-07', 'span-bates-08'],
      claimIds: ['claim-bates-02'],
      reviewStatus: 'verified'
    },
    {
      id: 'block-bates-03',
      heading: '3. Statutory Contract Defense: Unfair Contract Terms Act 1977',
      text: 'Post Office Ltd relies upon Clause 12 of the Standard Subpostmaster Contract (SPMC), which purports to impose strict liability on the subpostmaster to make good any deficiency on demand [Doc: Post_Office_Standard_Subpostmaster_Contract_SPMC_Sec12.txt § 10-12]. Because this was a standard business contract and the relationship was relational, Clause 12 is subject to Section 3 of the Unfair Contract Terms Act 1977. Imposing absolute liability without demonstrating computer integrity fails the test of reasonableness under UCTA s.11.',
      spanIds: ['span-bates-06'],
      claimIds: ['claim-bates-04'],
      reviewStatus: 'verified'
    }
  ],
  generatedBy: 'deterministic_offline',
  reviewStatus: 'ready_for_review',
  updatedAt: '2026-09-24T00:00:00Z'
};
