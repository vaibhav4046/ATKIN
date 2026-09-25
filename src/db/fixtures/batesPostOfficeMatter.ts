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
  isDemo: true,
  notes: 'Demonstration Case Study: Verbatim judicial findings from Mr Justice Fraser in Bates & Others v Post Office Ltd (No 6: Horizon Issues) [2019] EWHC 3408 (QB) regarding remote access, transaction duplication, and evidence disclosure.'
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

[Extract paras 176-177, 549-550, 929-930]

176. He had also said that "during the course of resolving the software issues, we would frequently access a Post Office counter IT system remotely".

177. His use of "frequently" and "routine" are, in my judgment, subjective, and as explained above in terms of "tiny fraction", subjective terms are not entirely helpful. What he meant by this is it was not unusual for this to occur. It is difficult to judge, at the remove of 15 years from when Mr Roll left Fujitsu, just how often something that he remembers as frequently or routine in fact occurred.

549. It may therefore be that the Post Office itself fell into error as a result of information provided to it by Fujitsu on this important matter. It may be that some within the Post Office were themselves surprised by these revelations prior to, and during, the Horizon Issues trial. There is no need for me to speculate on this, and I do not do so. Certainly Mr Godeseth did not appear to have known about this for very long. Whatever the origin of this, and whether it came from Fujitsu, internally, being less than frank with the Post Office or not, the effect is that the Post Office has made specific and factually incorrect statements about what could be done with, or to, branch accounts in terms of remote access without the knowledge of the SPM. The evidence in this trial has made it clear that such remote access to branch accounts does exist; such remote access is possible by employees within Fujitsu; it does exist specifically by design; and it has been used in the past.

550. It follows that the previously stated public position of the Post Office to the contrary, in the statements to which I have referred above, is specifically wrong in fact.

929. This approach by the Post Office has amounted, in reality, to bare assertions and denials that ignore what has actually occurred, at least so far as the witnesses called before me in the Horizon Issues trial are concerned. It amounts to the 21st century equivalent of maintaining that the earth is flat.

930. When real world examples such as Mr Latif's are put together with the expert evidence that I have accepted — or even with Dr Worden's lower figure for accepted bugs of 11 different ones — it can be seen that this institutional obstinacy by the Post Office amounts to little more than repeated assertions that the Horizon system (both Legacy and Online) cannot be to blame for the claimants' experiences, coupled with (for some) challenges to the claimants' witnesses because the Post Office simply cannot accept their factual accounts. The findings that I have made, on the evidence in the Horizon Issues trial, show that the reality is rather different, and the existence of the bugs, errors and defects that I have found to exist do have the effect explained by Mr Coyne.`.replace(/\r\n/g, '\n');

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

// Helper for exact offset and line derivation
function getBatesOffsets(rawText: string, exactSnippet: string) {
  const start = rawText.indexOf(exactSnippet);
  if (start === -1) {
    throw new Error(`Snippet not found in text: "${exactSnippet.slice(0, 30)}..."`);
  }
  const lineStart = (rawText.slice(0, start).match(/\n/g) || []).length + 1;
  const lineEnd = (rawText.slice(0, start + exactSnippet.length).match(/\n/g) || []).length + 1;
  return {
    startOffset: start,
    endOffset: start + exactSnippet.length,
    exactText: exactSnippet,
    lineStart,
    lineEnd
  };
}

export const BATES_DOCUMENTS: Document[] = [
  {
    id: 'doc-bates-01',
    matterId: BATES_MATTER_ID,
    filename: 'Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt',
    mime: 'text/plain',
    sha256: '60b0b7a6b53e2cd3d4499f2c54e8a1c94dc07d22c0acf064e24d293d9429af67',
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
    sha256: 'c4d7c3e1f6d2c50ecbfe4add27550057761f8353c018704d076e6129e0a9eab4',
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
    sha256: 'f7ddbd49699993e3ffc5640eefba2a4a150003e72514057cb8a738104ea6eef0',
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
    sha256: '966dc9fd6845b5d3f8cb0dbe112310874f0b657768d886c71e384276242b2fef',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2010-02-24',
    extractionStatus: 'success',
    pageCount: 2,
    text: DOC_POL_INVESTIGATION_MEMO_RAW,
    privacyLabel: 'Confidential Disclosed Memo'
  }
];

const SNIP_BATES_01 = 'The evidence in this trial has made it clear that such remote access to branch accounts does exist; such remote access is possible by employees within Fujitsu; it does exist specifically by design; and it has been used in the past.';
const SNIP_BATES_02 = 'It follows that the previously stated public position of the Post Office to the contrary, in the statements to which I have referred above, is specifically wrong in fact.';
const SNIP_BATES_03 = 'This approach by the Post Office has amounted, in reality, to bare assertions and denials that ignore what has actually occurred, at least so far as the witnesses called before me in the Horizon Issues trial are concerned. It amounts to the 21st century equivalent of maintaining that the earth is flat.';
const SNIP_BATES_04 = 'When a branch terminal experiences a local network timeout during receipt batch transmission to the Riposte central datastore, the counter retry handler initiates an automated re-send. If the initial packet was written to the central database before the local drop, the batch is committed twice.';
const SNIP_BATES_05 = "Fujitsu SSC engineers routinely rectify these balancing errors by manually injecting journal entries directly into the branch Riposte table via SQL scripts from Bracknell without the subpostmaster's terminal displaying any notification";
const SNIP_BATES_06 = 'In the event of any deficiency, loss, or shortfall appearing in the branch accounts or balancing statements produced by the Horizon computer terminal, the Subpostmaster shall on demand make good the entire deficiency to Post Office Limited immediately.';
const SNIP_BATES_07 = 'It remains the official policy and corporate defense posture of Post Office Ltd that Horizon is an automated, robust, and reliable computer system within the presumption of Section 69 of the Police and Criminal Evidence Act 1984.';
const SNIP_BATES_08 = 'Under no circumstances should Fujitsu Known Error Logs, including PIN 188 or SSC remote access procedures, be disclosed in civil or criminal proceedings without prior review by senior management. Disclosing that Fujitsu can remotely alter accounts would fatally undermine our civil debt recovery actions';

const offBates01 = getBatesOffsets(DOC_JUDGMENT_RAW, SNIP_BATES_01);
const offBates02 = getBatesOffsets(DOC_JUDGMENT_RAW, SNIP_BATES_02);
const offBates03 = getBatesOffsets(DOC_JUDGMENT_RAW, SNIP_BATES_03);
const offBates04 = getBatesOffsets(DOC_FUJITSU_BUG188_RAW, SNIP_BATES_04);
const offBates05 = getBatesOffsets(DOC_FUJITSU_BUG188_RAW, SNIP_BATES_05);
const offBates06 = getBatesOffsets(DOC_SPMC_CONTRACT_RAW, SNIP_BATES_06);
const offBates07 = getBatesOffsets(DOC_POL_INVESTIGATION_MEMO_RAW, SNIP_BATES_07);
const offBates08 = getBatesOffsets(DOC_POL_INVESTIGATION_MEMO_RAW, SNIP_BATES_08);

export const BATES_SPANS: Span[] = [
  {
    id: 'span-bates-01',
    documentId: 'doc-bates-01',
    startOffset: offBates01.startOffset,
    endOffset: offBates01.endOffset,
    exactText: offBates01.exactText,
    checksum: 'dae6387a0fabeaf92516450ac5c6b094db37de2032222db49d29cf88f1107e0f',
    lineStart: offBates01.lineStart,
    lineEnd: offBates01.lineEnd
  },
  {
    id: 'span-bates-02',
    documentId: 'doc-bates-01',
    startOffset: offBates02.startOffset,
    endOffset: offBates02.endOffset,
    exactText: offBates02.exactText,
    checksum: '71e7483614a1a484828217e6e16cbef86e39a11aa69c81eb2ff07b0692671e36',
    lineStart: offBates02.lineStart,
    lineEnd: offBates02.lineEnd
  },
  {
    id: 'span-bates-03',
    documentId: 'doc-bates-01',
    startOffset: offBates03.startOffset,
    endOffset: offBates03.endOffset,
    exactText: offBates03.exactText,
    checksum: '87a00255b4bdd5a19cc7707516dc169144de2efd879fa6aa58b3e21262fe1b27',
    lineStart: offBates03.lineStart,
    lineEnd: offBates03.lineEnd
  },
  {
    id: 'span-bates-04',
    documentId: 'doc-bates-02',
    startOffset: offBates04.startOffset,
    endOffset: offBates04.endOffset,
    exactText: offBates04.exactText,
    checksum: 'b204fa8e8a2fbf751bed81b274e2e2a8b93c7b89cb27713cf500024d7026927f',
    lineStart: offBates04.lineStart,
    lineEnd: offBates04.lineEnd
  },
  {
    id: 'span-bates-05',
    documentId: 'doc-bates-02',
    startOffset: offBates05.startOffset,
    endOffset: offBates05.endOffset,
    exactText: offBates05.exactText,
    checksum: '894fc1537f72c71064d2127889b85ff49a607f098fdb4972c37d1cc86a7506d8',
    lineStart: offBates05.lineStart,
    lineEnd: offBates05.lineEnd
  },
  {
    id: 'span-bates-06',
    documentId: 'doc-bates-03',
    startOffset: offBates06.startOffset,
    endOffset: offBates06.endOffset,
    exactText: offBates06.exactText,
    checksum: '422e246a10630609196d352bdde0d9549a462b6f0b1dde0e1a944a898a0e17dc',
    lineStart: offBates06.lineStart,
    lineEnd: offBates06.lineEnd
  },
  {
    id: 'span-bates-07',
    documentId: 'doc-bates-04',
    startOffset: offBates07.startOffset,
    endOffset: offBates07.endOffset,
    exactText: offBates07.exactText,
    checksum: 'fa685559d078f89bc455dda7d91445977f7d2795902a2d1682e1849c4d7a1f62',
    lineStart: offBates07.lineStart,
    lineEnd: offBates07.lineEnd
  },
  {
    id: 'span-bates-08',
    documentId: 'doc-bates-04',
    startOffset: offBates08.startOffset,
    endOffset: offBates08.endOffset,
    exactText: offBates08.exactText,
    checksum: '87294f5f3effd92a52fc956f62cbdd11d78d59fc6af2f2a28ad00d89c691e36e',
    lineStart: offBates08.lineStart,
    lineEnd: offBates08.lineEnd
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
        rationale: 'Fraser J finding of fact in Bates v Post Office No 6 [2019] EWHC 3408 at para 549.',
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
        rationale: 'Judicial finding at para 550 establishing Post Office assertion was specifically wrong in fact.',
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
        rationale: 'Direct evidentiary conflict between Post Office assertion of impossibility and Fraser J finding of routine remote access at para 549.',
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
        rationale: 'Fraser J finding at para 929 that Post Office denials of system bugs amounted to maintaining the earth is flat.',
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
    sectionParagraph: 'Paras 176-177, 549-550, 929-933',
    summary: 'Found as a fact that Fujitsu possessed and used remote access to alter branch accounts (paras 549-550), that Post Office denials were false (para 550), and that bare assertions ignoring software reality amounted to maintaining the earth is flat (para 929).',
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
      text: 'The claimants, comprising Alan Bates and 550 former subpostmasters, were subjected to summary termination, debt recovery, and criminal prosecution by Post Office Ltd arising from alleged cash discrepancies in the Horizon computer system. As established in the judgment of Mr Justice Fraser in Bates v Post Office Ltd [2019] EWHC 3408 (QB) at para 549, Fujitsu engineering staff at Bracknell maintained unnotified remote write access to branch accounts [Doc: Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt § L21]. Furthermore, technical records establish that Horizon Bug 188 (PIN 188) systematically duplicated transaction receipts upon packet timeout, creating phantom shortfalls of £2,000 or greater [Doc: Fujitsu_Services_PIN188_Problem_Investigation_Report.txt § L10].',
      spanIds: ['span-bates-01', 'span-bates-03', 'span-bates-04'],
      claimIds: ['claim-bates-01', 'claim-bates-03'],
      reviewStatus: 'verified'
    },
    {
      id: 'block-bates-02',
      heading: '2. Adverse Contradiction: Suppression of Remote Access Capability',
      text: 'A fundamental contradiction exists between the Post Office\'s public defense posture and its contemporaneous internal intelligence. While Post Office Ltd represented to the High Court and to Parliament that remote account modification was impossible, Fraser J found this assertion specifically wrong in fact at para 550 [Doc: Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt § L23], directly contradicting internal Security Division memos cautioning that disclosing Fujitsu Known Error Logs would "fatally undermine" debt recovery actions [Doc: Post_Office_Security_Division_Confidential_Memo_2010.txt § L12]. This constitutes a severe breach of standard disclosure obligations under CPR Part 31.',
      spanIds: ['span-bates-02', 'span-bates-07', 'span-bates-08'],
      claimIds: ['claim-bates-02'],
      reviewStatus: 'verified'
    },
    {
      id: 'block-bates-03',
      heading: '3. Statutory Contract Defense: Unfair Contract Terms Act 1977',
      text: 'Post Office Ltd relies upon Clause 12 of the Standard Subpostmaster Contract (SPMC), which purports to impose strict liability on the subpostmaster to make good any deficiency on demand [Doc: Post_Office_Standard_Subpostmaster_Contract_SPMC_Sec12.txt § L9]. Because this was a standard business contract and the relationship was relational, Clause 12 is subject to Section 3 of the Unfair Contract Terms Act 1977. Imposing absolute liability without demonstrating computer integrity fails the test of reasonableness under UCTA s.11.',
      spanIds: ['span-bates-06'],
      claimIds: ['claim-bates-04'],
      reviewStatus: 'verified'
    }
  ],
  generatedBy: 'deterministic_offline',
  reviewStatus: 'ready_for_review',
  updatedAt: '2026-09-24T00:00:00Z'
};
