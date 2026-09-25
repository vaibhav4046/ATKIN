# Evidentiary Assessment: Software Defect Liability & Relational Contract Bad Faith
**Matter**: Bates & Others v Post Office Ltd [2019] EWHC 3408 (QB) (England and Wales)
**Client Reference**: Alan Bates (Lead Claimant for 550 Subpostmasters)
**Draft Version**: 1 | **Status**: READY FOR REVIEW
**Date Generated**: 25/09/2026
---

## 1. Executive Summary & Factual Matrix
The claimants, comprising Alan Bates and 550 former subpostmasters, were subjected to summary termination, debt recovery, and criminal prosecution by Post Office Ltd arising from alleged cash discrepancies in the Horizon computer system. As established in the judgment of Mr Justice Fraser in Bates v Post Office Ltd [2019] EWHC 3408 (QB) at para 549, Fujitsu engineering staff at Bracknell maintained unnotified remote write access to branch accounts [Doc: Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt § L21]. Furthermore, technical records establish that Horizon Bug 188 (PIN 188) systematically duplicated transaction receipts upon packet timeout, creating phantom shortfalls of £2,000 or greater [Doc: Fujitsu_Services_PIN188_Problem_Investigation_Report.txt § L10].

*Evidential Grounding:*
- **[FACT]** Fujitsu engineers possessed and routinely executed covert remote write access to alter branch accounts and cash balances from Bracknell without subpostmaster notification or consent. *(SUPPORTED — 2 source span links)*
- **[FACT]** Horizon Bug 188 (PIN 188) systematically duplicated transaction batches upon transmission timeout, generating phantom shortfalls of £2,000 or greater on branch balancing statements. *(SUPPORTED — 2 source span links)*

## 2. Adverse Contradiction: Suppression of Remote Access Capability
A fundamental contradiction exists between the Post Office's public defense posture and its contemporaneous internal intelligence. While Post Office Ltd represented to the High Court and to Parliament that remote account modification was impossible, Fraser J found this assertion specifically wrong in fact at para 550 [Doc: Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt § L23], directly contradicting internal Security Division memos cautioning that disclosing Fujitsu Known Error Logs would "fatally undermine" debt recovery actions [Doc: Post_Office_Security_Division_Confidential_Memo_2010.txt § L12]. This constitutes a severe breach of standard disclosure obligations under CPR Part 31.

*Evidential Grounding:*
- **[FACT]** Post Office Ltd falsely represented to subpostmasters, courts, and Parliament that remote access to alter branch accounts was technically impossible. *(CONTESTED — 3 source span links)*

## 3. Statutory Contract Defense: Unfair Contract Terms Act 1977
Post Office Ltd relies upon Clause 12 of the Standard Subpostmaster Contract (SPMC), which purports to impose strict liability on the subpostmaster to make good any deficiency on demand [Doc: Post_Office_Standard_Subpostmaster_Contract_SPMC_Sec12.txt § L9]. Because this was a standard business contract and the relationship was relational, Clause 12 is subject to Section 3 of the Unfair Contract Terms Act 1977. Imposing absolute liability without demonstrating computer integrity fails the test of reasonableness under UCTA s.11.

*Evidential Grounding:*
- **[LEGAL_PROPOSITION]** Subpostmaster Standard Contract Clause 12 is an unreasonable and unenforceable term under UCTA 1977 s.3 by imposing strict accounting liability without proving computer integrity. *(SUPPORTED — 1 source span links)*

---
*Proofline Sovereign Legal Copilot — Verification Hash Verified. No external cloud endpoints accessed.*