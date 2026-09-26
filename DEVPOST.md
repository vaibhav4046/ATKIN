# Devpost Submission — ATKIN (Sovereign Legal AI)

**Project Name**: ATKIN  
**Tagline**: Sovereign, air-gapped legal AI for practicing solicitors: verifiable fact mapping, adverse contradiction discovery, 5-layer sovereign memory, statutory citations, and audit-ready drafting with 0% cloud egress.  
**Track**: AI Safety, Ethics & Governance / Legal Automation & Workflow Innovation / Access to Justice & Civic Tech  
**Participant**: Vaibhav Lalwani (Solo Builder, MSc Student at University of Liverpool)  
**Repository**: [github.com/vaibhav4046/proofline](https://github.com/vaibhav4046/proofline)  
**Production Web Demo**: [proofline-ruddy-three.vercel.app](https://proofline-ruddy-three.vercel.app/)  

---

## Inspiration

General-purpose chatbots can summarize a contract or answer a general query, but in real-world civil litigation, that is not what a solicitor, paralegal, or legal-aid advisor needs. 

The practicing lawyer's real questions are:
1. *Which exact document sentence supports this factual allegation?*
2. *What adverse evidence contradicts the client's memory?*
3. *Which statutory provision establishes the legal burden of proof?*
4. *How do we ensure confidential client documents never leak to a third-party cloud server?*

As highlighted by recent **Solicitors Regulation Authority (SRA)** guidance on the misuse of AI, the legal sector is plagued by AI hallucinations, fabricated court citations, and confidentiality risks. I set out to build **ATKIN**: a quiet, premium, local-first legal workstation that enforces strict evidential grounding down to the byte—with zero cloud telemetry, first-class contradiction detection, 5-layer sovereign memory, and native desktop and mobile companion applications.

---

## What It Does

ATKIN is a sovereign, local-first legal evidence and drafting workbench designed for England and Wales civil disputes.

* **Local-First Ingestion & Cryptographic Provenance**: Ingests `.pdf`, `.txt`, `.md`, `.eml` (RFC 822 emails), and case files into local storage. Every document is cryptographically fingerprinted with SHA-256 and mapped to exact byte offsets.
* **Evidential Abstention**: When queried about unrecorded facts (e.g., supplier incorporation dates not present in contract files), ATKIN truthfully abstains rather than inventing plausible answers.
* **Deterministic Citation Gate**: No assertion can be labeled as verified unless it maps to an exact character and line offset with an identical text checksum. Hallucinated citations are rejected immediately.
* **Adverse Contradiction Discovery**: Adverse evidence is elevated rather than suppressed. In our demonstration matter, a client's witness statement asserts that hardware failure occurred on **12 April 2026**; however, contemporary support telephony logs record an initial contact on **8 April 2026**. ATKIN highlights this contradiction side-by-side with neutral litigator queries before formal court letters are dispatched.
* **5-Layer Sovereign Memory Architecture**:
  - **Layer 1 (Working)**: Current matter context, active span selection, and volatile reasoning buffers.
  - **Layer 2 (Episodic)**: Chronological matter timeline, court deadlines, and interview notes.
  - **Layer 3 (Semantic)**: Extracted facts, entity relationships, and cross-document evidentiary links.
  - **Layer 4 (Procedural)**: Reusable legal skills, review checklists, and firm-specific SOPs.
  - **Layer 5 (Meta)**: Practitioner drafting style preferences (OSCOLA citation standard, plain English tone) and model guardrails.
* **Dual-Tier Offline Persistence**:
  - Webview: High-speed reactive Dexie IndexedDB.
  - Native Desktop: Local SQLite database at `%LOCALAPPDATA%\Atkin\atkin_store.db` surviving process restarts and cache clears.
* **Native Desktop & Mobile Companion Apps**:
  - **Windows Desktop**: Installable WiX MSI (`Atkin_1.0.0_x64_en-US.msi`) and NSIS setup.
  - **Android Mobile Companion**: Signed universal APK (`Atkin-1.0.0-universal.apk`) tested on Pixel 9 Pro (API 36).
* **Air-Gapped Cross-Device Sync**: Ephemeral 6-digit SAS pairing over local encrypted LAN, connecting mobile companion to desktop Ollama runtime (`gemma2:2b`, `qwen2.5-coder:3b`, `gemma4:e2b-it-qat`) with local GPU acceleration (NVIDIA RTX 3050).

---

## How We Built It

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide icons.
* **Desktop & Native Backend**: Rust, Tauri v2, SQLite (`rusqlite`), WiX Toolset, NSIS.
* **Mobile Runtime**: Android SDK (API 34/36), Android NDK, Tauri Android bridge.
* **Local AI**: Ollama daemon on loopback `127.0.0.1:11434`, GPU-accelerated on NVIDIA RTX 3050 (6GB VRAM, CUDA 8.6).
* **Testing & Verification**: Vitest test runner with 143 passing tests across 28 test suites, automated PowerShell MSI installer test scripts, and ADB emulator automation.

---

## Accomplishments That We're Proud Of

* **143/143 Automated Tests Passing**: Comprehensive unit, integration, and reality verification tests passing with zero failures.
* **True Device Verification**:
  - Windows MSI silently installed, registry verified, executable launched, SQLite store verified on disk.
  - Android APK signed and installed on Google Pixel 9 Pro emulator, completed 7-step onboarding flow.
  - Real remote inference executed from inside Android emulator shell to desktop Ollama GPU with 200 OK.
* **Section 16 Stale Draft Invalidation**: When a Deed of Variation is ingested altering contract terms (e.g. price change from £18,420 to £17,900), dependent draft blocks are automatically flagged as `needs_review` rather than silently retaining obsolete text.
* **Honest Reality Reporting**: Transparently distinguishing between desktop device verification, mobile companion mode, and roadmap items (local mobile GGUF runtime).
