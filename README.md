# Proofline — Grounded Legal Evidence & Drafting Workbench

> **Turn a disorderly civil legal matter into a source-linked map of facts, contradictions, questions, authorities, and a draft that a lawyer can actually audit.**

[![LexHack 2026 Submission](https://img.shields.io/badge/LexHack-2026_Submission-0071e3.svg)](https://lexhack-2026.devpost.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: Vitest](https://img.shields.io/badge/Tests-8%2F8_Passing-2e7d32.svg)](src/tests/)
[![Local AI: Gemma 4](https://img.shields.io/badge/Model-Gemma_4_(Ollama)-orange.svg)](https://ai.google.dev/gemma/docs/core/model_card_4)

Built for **LexHack 2026** by **Vaibhav Lalwani** (MSc Student, University of Liverpool).

---

## 30-Second Quick Start

```bash
# 1. Clone repository
git clone https://github.com/vaibhav-lalwani/proofline.git
cd proofline

# 2. Install dependencies (Node 18+)
npm install

# 3. Run automated tests (8/8 passing in <1s)
npm test

# 4. Start local development server (binds strictly to 127.0.0.1)
npm run dev
```

Open **http://127.0.0.1:5173** in your browser. Click **"Load Sample Consumer Matter"** to immediately explore the synthetic *Vance v ZenithTech Retail Ltd* case file.

---

## What Makes Proofline Different?

| Feature | Generic Chatbots (ChatGPT / Claude) | Proofline Legal Workbench |
|---|---|---|
| **Evidential Grounding** | Text summaries with unverified hallucinated quotes | **Exact character and line offsets** verified against underlying document text |
| **Contradiction Handling** | Silently averages or ignores contradictory evidence | **First-class adverse conflict cards** displaying conflicting records side-by-side |
| **Client Confidentiality** | Uploads sensitive client documents to third-party cloud | **100% browser-local IndexedDB storage**; zero external file transmission |
| **Hostile Prompt Injections** | Vulnerable to directives embedded in emails | **Treats document content as inert data**; hostile instructions are quarantined |
| **Legal Authorities** | Hallucinates nonexistent judgments (SRA warning risk) | **Curated statutory provisions** (CRA 2015) with The National Archives appeal caveats |
| **Drafting Output** | Authoritative-sounding unverified prose | **Audit-ready drafts** with sentence-by-sentence clickable citation anchors |

---

## The Demonstration Matter: *Vance v ZenithTech Retail Ltd*

The built-in synthetic matter models a realistic England & Wales consumer dispute under the **Consumer Rights Act 2015**:
1. `Receipt_Invoice_INV-8492.txt`: Laptop purchased 15 Jan 2026, delivered 18 Jan 2026 for £1,499.00 (triggers the 6-month statutory presumption under CRA 2015 s.19(14)).
2. `Client_Statement_Chronology.md`: Witness chronology recalling hardware power collapse on **12 April 2026**.
3. `Merchant_Correspondence_ZenithTech.eml`: Unlawful refusal asserting a 30-day return policy, demanding a £120 fee, and containing an adversarial prompt injection payload.
4. `Service_Report_ApexRepair.txt`: Independent engineering forensics confirming latent solder fatigue micro-fractures present at delivery.
5. `Contradictory_Intake_Email_ZenithSupport.eml` *(Planted Contradiction)*: Defendant telephony log recording an initial customer call reporting power anomalies on **8 April 2026**.

---

## System Architecture

```
[Imported Files (TXT, MD, EML)]
              │
              ▼
   [Client-Side Parser] ─── Computes SHA-256 Fingerprint
              │
              ▼
   [IndexedDB (Dexie.js)] ─── 100% Local Storage
              │
              ▼
    [Positional Extractor] ─── Byte Slices & Checksums
              │
              ▼
    [Claim & Fact Ledger] ─── Supported / Contested / Unverified
              │
    ┌─────────┴─────────┐
    ▼                   ▼
[Citation Verifier]   [Local Gemma 4 (Ollama 127.0.0.1)]
    │                   │
    └─────────┬─────────┘
              ▼
[Drafting Studio & Export Manifest]
```

---

## Local Gemma 4 Setup Guide (Ollama)

To use Google's **Gemma 4** open-weights model locally:

1. Install [Ollama](https://ollama.ai) on your computer.
2. In terminal, pull the recommended model variant:
   ```bash
   ollama pull gemma4:e4b
   ```
   *(Or `gemma4:e2b` for laptops with lower VRAM).*
3. Start the Ollama background daemon:
   ```bash
   ollama serve
   ```
4. In Proofline, click **Settings & Diagnostics** → **Test Connection**. The workbench will automatically detect the model on `127.0.0.1:11434`.

> [!NOTE]
> When visited on a public web URL, browser security prevents remote scripts from directly probing a visitor's loopback ports. Proofline operates cleanly and honestly in **Deterministic Offline Mode** with zero fake status indicators.

---

## Project Structure

```
proofline/
├── index.html                   # HTML entry point with WCAG 2.2 AA meta
├── package.json                 # Dependencies & scripts
├── vite.config.ts               # Vite configuration with loopback proxy
├── src/
│   ├── types/index.ts           # Core evidential data contract
│   ├── db/                      # Dexie IndexedDB & synthetic matter fixtures
│   ├── engine/
│   │   ├── parser.ts            # SHA-256 hashing & RFC 822 EML parser
│   │   ├── spanExtractor.ts     # Positional byte slice & line mapper
│   │   ├── verifier.ts          # Deterministic citation gate
│   │   ├── contradictionEngine.ts # Adverse contradiction discovery
│   │   ├── draftingEngine.ts    # Audit-ready draft builder & markdown exporter
│   │   └── modelBridge.ts       # Loopback Ollama adapter
│   ├── components/              # Scandinavian editorial UI components
│   └── tests/                   # Vitest unit test suite
├── docs/
│   ├── architecture.md          # Trust boundaries & data flow
│   ├── evaluation.md            # Benchmark evaluation report
│   ├── security.md              # Threat model & prompt injection isolation
│   └── roadmap.md               # P0, P1, and P2 capabilities
├── DEVPOST.md                   # Complete Devpost hackathon writeup
├── DEMO_SCRIPT.md               # 2:45 timed video recording script
└── PROGRESS.md                  # Milestone log & build clock
```

---

## Evaluation & Verification Commands

```bash
# Run unit tests
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Disclosures & Legal Disclaimer

* **Author**: Vaibhav Lalwani (Solo Builder, MSc Student at University of Liverpool).
* **Statutory Sources**: Crown Copyright materials from [legislation.gov.uk](https://www.legislation.gov.uk/) and notices from [The National Archives Find Case Law](https://caselaw.nationalarchives.gov.uk/).
* **Regulatory Compliance**: Built in accordance with the **Solicitors Regulation Authority (SRA)** guidance on the misuse of AI in legal practice.
* **Disclaimer**: Proofline is an evidential organization and drafting prototype for qualified solicitors; it does not provide legal advice or replace solicitor oversight.
