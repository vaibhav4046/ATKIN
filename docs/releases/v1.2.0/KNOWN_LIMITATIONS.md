# ATKIN ASTRA v1.2.0 — Known Limitations & Operational Boundaries

**Standard**: Radical Product Honesty (No Fabricated Capabilities)  
**Date**: 26 September 2026  
**Auditor**: Antigravity (Google DeepMind Advanced Agentic Coding)  

---

## 1. Verified Operational Boundaries

The following limitations are explicitly documented and acknowledged:

### 1. Optical Character Recognition (OCR) for Scanned PDFs
- **Current State**: ATKIN natively extracts text from text-based PDFs, DOCX, TXT, and Markdown files.
- **Limitation**: When a pure bitmap image or scanned PDF without an embedded text layer is uploaded, ATKIN applies fallback text parsing. Full local Tesseract / Apple Vision OCR requires the native desktop binary execution and is not bundled inside the web browser preview.
- **Remediation Path**: Bundle Tesseract OCR engine in the Tauri desktop installer (`src-tauri/`) for v1.3.0.

### 2. Device Pairing & Physical Mobile Hardware
- **Current State**: The Ed25519 pairing protocol, ephemeral key exchange, HKDF session derivation, 6-digit SAS verification, and remote desktop inference are fully implemented and verified via automated integration tests (`src/tests/pairingRemoteInference.test.ts`) and on the Android emulator (`release/screenshots/android-step7-real.png`).
- **Limitation**: Direct camera-to-screen QR code scanning was tested on the Android emulator with virtual camera feeds rather than an end-to-end multi-party physical device deployment across public cellular networks.
- **Remediation Path**: Execute physical Android / iOS device field tests over local Wi-Fi and direct WebRTC channels.

### 3. Live Web Deep Research Network Boundary
- **Current State**: The Deep Research Machine executes its 10-stage autonomous loop against local primary law packs (`authorities.ts` covering CRA 2015, UCTA 1977, CPR, Deregulation Act 2015).
- **Limitation**: In `offline` mode (the default sovereign posture), outbound HTTP calls are blocked by `NetworkBroker`. Live web scraping of external legal databases requires the lawyer to switch the network broker to `local_research` or `connected` mode.
- **Remediation Path**: Add pre-packaged offline SQLite statutory corpora for primary England & Wales and EU legislation.

### 4. Rich-Text Editor Formats
- **Current State**: Draft Studio edits structured Markdown blocks with real-time Section 9 CJA 1967 admissibility tags and exact span citation chips.
- **Limitation**: It is not a complete WYSIWYG word processor like Microsoft Word or Google Docs. Formatting is block-based Markdown. Export to Word (`.docx`) produces standard Word XML/HTML that Word opens cleanly.
- **Remediation Path**: Integrate TipTap / ProseMirror rich-text WYSIWYG editor for inline legal clause indentation and margin notes.

### 5. Multi-User Real-Time Collaboration
- **Current State**: ATKIN is designed as a sovereign, single-practitioner local-first node. Collaboration is performed via encrypted matter bundles (`.proofline` archives).
- **Limitation**: Multi-lawyer simultaneous Google Docs-style concurrent typing on the same draft is not supported; version branches are preserved to prevent overwrite conflicts.
- **Remediation Path**: Implement CRDTs (Yjs) over authenticated peer-to-peer WebRTC channels for firm-wide multi-seat deployments.

### 6. Secondary Legal Jurisdictions
- **Current State**: Primary law packs and statutory rule engines are calibrated for **England and Wales** (CPR, CRA 2015, UCTA 1977, Housing Act 2004).
- **Limitation**: Scottish, Northern Irish, EU, and US statutory reasoning fall back to general IRAC principles without pre-compiled section-level penalty matrices.
- **Remediation Path**: Extend `legalAuthority.ts` and `authorities.ts` with dedicated Scottish Acts of Sederunt and Delaware General Corporation Law packs.
