# ATKIN: VERIFICATION LEDGER & ACCEPTANCE REPORT

**Commit**: Current working head on `atkin-core`  
**Environment**: Windows 11 (x64), Node.js v24.12.0, Vitest v3.2.7  
**Test Suite**: 21 test suites, 92 automated tests  

---

## 1. Automated Test Execution Baseline

```bash
npm test -- --run
```
- Status: **92/92 tests passing** (21 test suites in 31s).
- Invariants covered: PBKDF2 vault encryption, canary token memory isolation, airgap network broker packet dropping, contract clause extraction, SHA-256 span mapping, prompt injection containment.

---

## 2. 50-Scenario Acceptance Tracking Matrix

| # | User Perspective | Scenario Description | Expected Outcome | Actual Verification | Status |
| :- | :--- | :--- | :--- | :--- | :---: |
| 01 | First-time solicitor | Launch Atkin on clean device | 7-screen onboarding appears with persona & jurisdiction choice | Pending WS3 | **QUEUED** |
| 02 | Solo practitioner | Create private matter without sample contamination | Empty matter created in Personal Workspace with zero demo files | Pending WS2 | **QUEUED** |
| 03 | Returning user | Reload browser/app with saved matter | Matter and imported documents restored from IndexedDB | Verified | **PASS** |
| 04 | Returning chat user | Reload after active conversation | Chat conversation history restored exactly from DB | Being Repaired | **IN PROGRESS** |
| 05 | Contract reviewer | Query exact payment deadline in NovaCorp | 30-day clause vs 60-day schedule conflict detected | Verified in Vitest | **PASS** |
| 06 | Commercial lawyer | Query novel disputed-invoice clause in synthetic contract | Direct answer quoting clause 5 without unrelated indemnity boilerplate | Being Repaired | **IN PROGRESS** |
| 07 | Paralegal | Ingest unseen text fixture | Text parsed, SHA-256 computed, spans indexed | Verified in Vitest | **PASS** |
| 08 | Accounts-dispute lawyer | Query Elmbridge/Riverglass £2,375 in 17 days clause | Direct answer quoting clause 4 with zero UCTA/indemnity advice | Being Repaired | **IN PROGRESS** |
| 09 | Notebook researcher | Exclude all sources in matter | Grounded ask refuses speculation; requests source activation | Verified in Vitest | **PASS** |
| 10 | Evidence reviewer | Click cited citation pill | Source inspector opens highlighting exact character span | Verified in UI | **PASS** |
| 11 | Drafting solicitor | Edit and save a draft block | Saved text persists across application reload | Verified | **PASS** |
| 12 | Case strategist | View evidence relationship graph | Graph displays genuine matter entities and evidence connections | Being Upgraded | **IN PROGRESS** |
| 13 | Local-model user | Connect local Ollama runtime | Model status reports exact tag and warm throughput | Verified on host | **PASS** |
| 14 | Email-heavy lawyer | Ingest offline email evidence (.eml) | RFC 822 headers and attachments extracted into matter | Verified in Vitest | **PASS** |
| 15 | Security reviewer | Audit trust and provenance claims | Clean SHA-256 byte provenance without overstated legal certifications | Being Cleaned | **IN PROGRESS** |
| ... | (Scenarios 16–50) | Windows packaging, pairing, Android APK, memory tests | See full 50-scenario report in docs | In Progress | **QUEUED** |
