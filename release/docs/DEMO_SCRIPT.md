# Proofline — 3-Minute Video Demo Script

**Submission**: LexHack 2026  
**Project**: Proofline — Sovereign Legal Copilot & Evidential Workbench  
**Presenter**: Vaibhav Lalwani (Solo Builder, MSc Student, University of Liverpool)  
**Total Target Runtime**: 3 minutes (180 seconds)  

---

## Visual & Audio Setup Checklist Before Recording

1. **Resolution**: 1920 × 1080 (16:9), clean browser window in dark/light native theme.
2. **App URL**: `http://localhost:5173` running cleanly.
3. **Preloaded State**: Sample portfolio loaded with three synthetic test matters:
   - *Vance v ZenithTech Retail Ltd* (Consumer Rights Act 2015 laptop dispute)
   - *NovaCorp Solutions v Meridian Cloud Technologies Ltd* (B2B SaaS MSA)
   - *Thorne v Oakridge Estates Ltd* (Tenancy disrepair & canary token)
4. **Local Model (Optional)**: Ollama running `gemma4:e4b` on `127.0.0.1:11434`, or verify deterministic offline fallback is armed.

---

## Timed Walkthrough Script

### Act 1: The Sovereignty Dilemma & Local Vault (0:00 – 0:30)
- **Visual**: Proofline home screen. Point mouse to the TopRail sovereign status bar showing **Offline (Air-Gapped)** mode badge and the **Vault: Unlocked** status.
- **Action**: Click the Network Mode selector to show the three modes (`Offline`, `Public Legal Research Only`, `Connected Imports`). Click "Lock Vault" to demonstrate instant key zeroization and encryption at rest, then enter passphrase `demo-passphrase-2026` to unlock.
- **Spoken Narration**:
  > *"When lawyers use commercial AI assistants, they face a severe dilemma: upload confidential client materials to someone else's cloud, or fall behind. I’m Vaibhav Lalwani, an MSc student at the University of Liverpool, and this is Proofline: an open-source, sovereign legal copilot and evidential workbench that runs 100% on your own computer.*
  > *From the moment you open a case, Proofline enforces an air-gapped network broker. All local documents and notes are secured in a cryptographic vault encrypted at rest with PBKDF2 100,000 rounds and AES-GCM-256. Zero telemetry, zero cloud exposure."*

---

### Act 2: Evidentiary Grounding & Contradiction Discovery (0:30 – 1:05)
- **Visual**: Switch to Matter: *Vance v ZenithTech Retail Ltd*. Navigate to the **Claims Ledger** tab, then the **Contradictions** tab.
- **Action**: Highlight the source document table with SHA-256 provenance hashes. Click into the contradiction card showing the claimant's email asserting failure on 8 April versus ZenithTech's system log claiming 12 April.
- **Spoken Narration**:
  > *"Proofline never treats legal documents as ungrounded text. Every ingested document is hashed with SHA-256. In this Consumer Rights Act 2015 laptop dispute, Proofline extracts precise character and line offsets for every factual assertion.*
  > *Notice this contradiction card: Proofline automatically paired the claimant's notice of mother-board failure on 8 April against the retailer's contradictory claim of first contact on 12 April. Under section 19(14) of the CRA 2015, this four-day discrepancy determines whether the statutory 30-day early right to reject was strictly preserved."*

---

### Act 3: Scoped Memory & Canary-Proven Isolation (1:05 – 1:40)
- **Visual**: Switch to the **Memory Ledger** tab.
- **Action**: Show the 4-tier hierarchy (`firm`, `lawyer`, `matter`, `session`). Highlight the pending human-in-the-loop review queue for learned rules. Then switch to *Thorne v Oakridge Estates* to reveal matter isolation.
- **Spoken Narration**:
  > *"A critical danger in legal AI is memory bleed—where confidential facts from Matter A leak into drafts for Matter B. Proofline solves this with Scoped Memory.*
  > *Firm knowledge and fee-earner preferences are separated from matter-specific facts. Any rule learned by the model requires explicit lawyer sign-off in this approval queue.*
  > *Crucially, we've verified cross-matter isolation mathematically: our automated test suite injects canary secret tokens into Matter B and proves they can never be retrieved or cited when working inside Matter A or C."*

---

### Act 4: Contract Review & Playbook Auditor (1:40 – 2:15)
- **Visual**: Switch to Matter: *NovaCorp Solutions v Meridian Cloud Technologies Ltd*. Click on the **Contract Review** tab.
- **Action**: Show the parsed Master Services Agreement clause matrix. Hover over the red risk card for **Uncapped Indemnities** and the warning for **Payment Term Mismatch**. Click "Generate Counter-Draft" to show balanced fallback language.
- **Spoken Narration**:
  > *"Proofline isn't just for litigation; it's a full contract workstation. Here in this B2B SaaS agreement, Proofline automatically classified key clauses against our firm's risk playbook.*
  > *It instantly flagged two critical hazards: an uncapped intellectual property indemnity and a direct conflict between Section 4's Net 30 payment term and Exhibit B's Net 60 schedule. With one click, Proofline supplies a balanced negotiation counter-clause aligned with commercial market standards."*

---

### Act 5: Sovereign Copilot & Audit-Ready Export (2:15 – 2:45)
- **Visual**: Click on the **Chat Copilot** tab, then open the **Export** menu in the TopRail.
- **Action**: Submit a prompt: *"What are the remedies available to Vance under Section 23 and 24 CRA 2015?"* Show the generated response with clickable source pill citations. Click **Export Word (.doc)** and **Export Court Calendar (.ics)**.
- **Spoken Narration**:
  > *"When drafting or querying, Proofline routes to a local Gemma 4 model via Ollama loopback, or falls back to an audited deterministic rules engine if offline. Every statement in the response links directly back to statutory provisions and evidence.*
  > *Finally, Proofline delivers real work product: exporting Word documents with preserved footnote citations, parsing spoken dictations into SRA-compliant attendance notes, generating RFC 5545 court calendar reminders, and packing encrypted .proofline bundles for secure transfer."*

---

### Act 6: Summary & Submission Note (2:45 – 3:00)
- **Visual**: Return to the main workbench view. Display terminal showing all 32/32 tests passing.
- **Action**: Scroll briefly across the test suite summary and production build metrics.
- **Spoken Narration**:
  > *"Built with React, TypeScript, and native WebCrypto, Proofline compiles to just 104 kilobytes gzipped, with 32 automated tests and zero cloud dependencies. It puts sovereignty, evidence, and professional ethics back in the hands of the lawyer.*
  > *Thank you to the LexHack 2026 organizers and judges."*

---

## Post-Recording Check
- Verify audio is crisp with no background clipping.
- Verify screen capture clearly displays text offset highlights, contradiction badges, and export modals.
- Upload video to YouTube (Unlisted) or Loom and paste the link into the Devpost submission draft.
