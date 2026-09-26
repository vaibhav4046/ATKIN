# ATKIN 3-MINUTE LEGAL WORKBENCH DEMO SCRIPT

## Target Duration: 2 minutes 50 seconds
## Audience: LexHack Grand Prize Judges & Practicing Solicitors

| Timestamp | Screen / Action | On-Screen Visual | Audio / Narration |
|---|---|---|---|
| **0:00 – 0:15** | App Launch | Clean Windows Desktop app (`Atkin.exe`). Initial empty workspace view with "Create Matter". Local status indicator shows: "Local-First • Airgapped". | "Welcome to Atkin. A sovereign AI workspace designed specifically for legal practitioners. Everything runs locally on your device with zero cloud leakage." |
| **0:15 – 0:25** | Create Matter | Solicitor enters: "Highfield Logistics v Alder Peak Systems", selects "England and Wales", clicks Create. Matter dashboard initializes. | "We create a new matter for an urgent commercial contract dispute under English law." |
| **0:25 – 0:40** | Import Contract | Drag and drop `test-contract-independent.txt`. Instant client-side SHA-256 computation and sentence span parsing. | "We import the operative Master Services Agreement. Atkin calculates immutable cryptographic hashes and indexes exact character spans offline in milliseconds." |
| **0:40 – 0:55** | Ask Question | Type: *"What is the termination notice period under the contract? Quote the operative clause."* | "We ask for the termination notice period. Notice how Atkin extracts exactly 37 calendar days, quotes Clause 3.2 verbatim, and avoids irrelevant boilerplate." |
| **0:55 – 1:05** | Inspect Source | Click on the citation span badge. Document viewer scrolls and highlights Clause 3.2 with exact start/end offsets. | "Clicking the citation instantly highlights the precise clause in the source contract with verified byte provenance." |
| **1:05 – 1:20** | Draft Pleading | Navigate to Draft Studio. Generate Notice of Termination citing Clause 3.2. Paragraph links directly to evidence edge. | "In Draft Studio, we generate a formal Notice of Termination. Every factual assertion links back to our verified evidentiary record." |
| **1:20 – 1:30** | Source Variation | Import `test-contract-independent-v2.txt` (Deed of Variation). | "Now the counterparty delivers a Deed of Variation amending terms." |
| **1:30 – 1:40** | Stale Draft Alert | In Draft Studio, Paragraph 2 is highlighted in amber: *"Source drift: Clause 2.1 price £18,420 superseded by Deed of Variation Clause 1.1 (£17,900)."* | "Atkin immediately flags our existing draft as stale due to source drift, without silently overwriting the solicitor's text." |
| **1:40 – 1:55** | User Preference & Memory | Show 5-layer memory tab. Atkin respects OSCOLA citation format and Partner-level drafting style set in Onboarding. | "Atkin's five-layer memory retains drafting preferences and firm standards, completely isolated to this matter hierarchy." |
| **1:55 – 2:20** | Mobile Companion | Show Android phone app (`Atkin-1.0.0-universal.apk`). Companion connects to desktop host over local Wi-Fi pairing token. | "On the go, the solicitor opens the Atkin Android companion. It securely pairs with the desktop brain over airgapped local transport." |
| **2:20 – 2:35** | Offline Verification | Disconnect external Wi-Fi. Ask legal reasoning query. Engine responds with full local evidence and zero latency penalty. | "Even with the network severed, Atkin continues functioning with full local inference and dual-tier SQLite persistence." |
| **2:35 – 2:50** | Conclusion | Display release artifacts, verified SHA-256 digests, and closing card: *"Atkin: Private AI for Legal Work."* | "Atkin: Sovereign, verified, audit-ready AI for modern solicitors. Thank you." |
