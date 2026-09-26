# ATKIN — Sovereign Legal AI & Verifiable Evidence Workbench

> **A sovereign, air-gapped legal workbench for solicitors: verifiable fact mapping, adverse contradiction discovery, 5-layer sovereign memory, statutory citations, and audit-ready drafting with 0% cloud egress.**

[![LexHack 2026 Submission](https://img.shields.io/badge/LexHack-2026_Submission-0071e3.svg)](https://lexhack-2026.devpost.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: Vitest](https://img.shields.io/badge/Tests-143%2F143_Passing-2e7d32.svg)](src/tests/)
[![Windows Desktop](https://img.shields.io/badge/Windows-MSI_Verified-0066cc.svg)](release/windows/)
[![Android Mobile](https://img.shields.io/badge/Android-APK_Verified-3ddc84.svg)](release/android/)
[![Local AI: Ollama](https://img.shields.io/badge/Local_AI-Gemma_2_%2F_4_(RTX_3050)-orange.svg)](https://ollama.ai)

Built for **LexHack 2026** by **Vaibhav Lalwani** (MSc Student, University of Liverpool).  
*Evolution note: ATKIN began as Proofline and has evolved into a full-fidelity sovereign legal workstation with native desktop and mobile companion applications.*

---

## 1. Verified Release Installers (v1.0.0)

Pre-built binaries with verified cryptographic checksums in `release/`:

| Platform | Format | Installer File | Size | SHA-256 Checksum | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Windows Desktop** | WiX MSI | [`Atkin_1.0.0_x64_en-US.msi`](release/windows/Atkin_1.0.0_x64_en-US.msi) | 5.36 MB | `c8a88ed96491b53ab13ac39d9c461fda1ece1262ca7aabc7dde9011fab6ee4d4` | **DESKTOP DEVICE VERIFIED** (Silent install, registry, SQLite store) |
| **Windows Desktop** | NSIS Setup | [`Atkin_1.0.0_x64-setup.exe`](release/windows/Atkin_1.0.0_x64-setup.exe) | 3.80 MB | `b659768689b4c742da92b49f5beef007ee05cbad499cdb1fc2d4e64d009f0586` | **BINARY BUILT** |
| **Android Mobile** | Signed APK | [`Atkin-1.0.0-universal.apk`](release/android/Atkin-1.0.0-universal.apk) | 17.19 MB | `50eb140618639a05162eedc4c5d23b8b1d3d9b4e72e9ad455bc496793a63619d` | **ANDROID EMULATOR VERIFIED** (Pixel 9 Pro API 36, 7-step onboarding) |

---

## 2. Key Sovereign Capabilities

1. **Evidential Abstention & Zero Hallucination**:
   - Queries regarding unrecorded facts (e.g., supplier incorporation dates not present in contracts) trigger truthful evidential abstention rather than plausible hallucinated guesses.
2. **Dual-Tier Offline Persistence**:
   - Webview: High-speed reactive Dexie IndexedDB.
   - Native Desktop: Local SQLite database at `%LOCALAPPDATA%\Atkin\atkin_store.db` across process restarts and cache clears.
3. **5-Layer Sovereign Memory Architecture**:
   - **Layer 1 (Working)**: Current matter context, active span selection, and volatile reasoning buffers.
   - **Layer 2 (Episodic)**: Chronological matter timeline, court deadlines, and interview notes.
   - **Layer 3 (Semantic)**: Extracted facts, entity relationships, and cross-document evidentiary links.
   - **Layer 4 (Procedural)**: Reusable legal skills, review checklists, and firm-specific SOPs.
   - **Layer 5 (Meta)**: Practitioner drafting style preferences (OSCOLA vs Harvard, plain English tone) and model guardrails.
4. **Adverse Contradiction Engine**:
   - Automatically cross-examines client statements, invoices, and supplier terms to surface evidentiary conflicts side-by-side with exact character offsets.
5. **Air-Gapped Cross-Device Companion**:
   - Ephemeral 6-digit SAS pairing over local encrypted LAN.
   - Android mobile companion connects to desktop Ollama runtime (`gemma2:2b`, `qwen2.5-coder:3b`, `gemma4:e2b-it-qat`) with GPU acceleration (NVIDIA RTX 3050).
   - *Transparent Disclosure*: Mobile APK operates as a companion client and offline deterministic engine. On-device local GGUF compilation is planned for v1.1.

---

## 3. Quick Start

### A. Run Desktop Native App (Windows)
```powershell
# Silent install via MSI
msiexec.exe /i release\windows\Atkin_1.0.0_x64_en-US.msi /qn

# Launch installed executable
& "C:\Program Files\Atkin\atkin.exe"
```

### B. Run Android Mobile Companion (ADB / Emulator)
```bash
# Install signed APK onto connected Android device or emulator
adb install -r release/android/Atkin-1.0.0-universal.apk

# Forward local model port for desktop companion inference
adb reverse tcp:11434 tcp:11434

# Launch Atkin MainActivity
adb shell am start -n com.atkin.legal/.MainActivity
```

### C. Run Local Web Workbench
```bash
# 1. Install dependencies (Node 20+)
npm install

# 2. Run automated test suite (143 passing across 28 suites)
npm test -- --run

# 3. Start local development server (binds strictly to 127.0.0.1)
npm run dev
```
Open **http://127.0.0.1:5173** in your browser.

---

## 4. Local Model Configuration (Ollama)

Atkin interfaces with local Ollama runtimes on `http://127.0.0.1:11434`:

1. Install [Ollama](https://ollama.ai) on your workstation.
2. Pull recommended legal models:
   ```bash
   ollama pull gemma2:2b
   ollama pull qwen2.5-coder:3b
   ollama pull gemma4:e2b-it-qat
   ```
3. Start the daemon:
   ```bash
   ollama serve
   ```
4. Atkin automatically detects active local models and executes inference with zero network roundtrips.

> [!NOTE]
> On public hosted web deployments (e.g., Vercel), browser sandbox policies prevent web pages from probing visitor loopback ports. Atkin operates cleanly and honestly in **Deterministic Offline Mode** with verifiable SHA-256 citations and zero fake connection indicators.

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 ATKIN Sovereign Legal AI                    │
├──────────────────────────────┬──────────────────────────────┤
│      Windows Workstation     │   Android Companion Client   │
│   (WiX MSI / Tauri Native)   │     (Universal APK / AVD)    │
│                              │                              │
│   ┌───────────────────────┐  │   ┌───────────────────────┐  │
│   │    Edge WebView2      │  │   │    Android WebView    │  │
│   │  (Dexie IndexedDB)    │  │   │  (Clean Workspace)    │  │
│   └───────────┬───────────┘  │   └───────────┬───────────┘  │
│               │              │               │              │
│   ┌───────────▼───────────┐  │   ┌───────────▼───────────┐  │
│   │     Rust Core IPC     │◄─┼───┤   Encrypted LAN Sync  │  │
│   │  (Tauri Commands)     │  │   │   (6-Digit SAS OTP)   │  │
│   └───────────┬───────────┘  │   └───────────────────────┘  │
│               │              │                              │
│   ┌───────────▼───────────┐  │   ┌───────────────────────┐  │
│   │     Native SQLite     │  │   │ Remote GPU Inference  │  │
│   │   (%LOCALAPPDATA%)    │  │   │  (Ollama 127.0.0.1)   │  │
│   └───────────────────────┘  │   └───────────────────────┘  │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 6. Verification & Reality Evidence

The complete audit trail is documented in [`release/RELEASE_EVIDENCE.md`](release/RELEASE_EVIDENCE.md), including:
- 20 Acceptance Journeys audited across concrete evidence tiers.
- Physical installation logs, process IDs, and registry entries.
- Android emulator screenshots across all 7 onboarding steps.
- Real PDF ingestion fixture (`fixtures/AlderPeak-Independent-Contract.pdf`).
- Evidential abstention verification output.

---

## 7. Disclosures & Legal Compliance

* **Author**: Vaibhav Lalwani (Solo Builder, MSc Student at University of Liverpool).
* **Jurisdiction**: England and Wales (CPR Pre-Action Protocol, CRA 2015, UCTA 1977).
* **Statutory Sources**: Crown Copyright materials from [legislation.gov.uk](https://www.legislation.gov.uk/) and judgments from [The National Archives Find Case Law](https://caselaw.nationalarchives.gov.uk/).
* **SRA Compliance**: Designed to adhere strictly to the **Solicitors Regulation Authority (SRA)** Standards & Regulations regarding AI usage, client confidentiality (Rule 6.3), and supervisory accountability.
