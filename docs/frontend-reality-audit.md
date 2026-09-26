# ATKIN Frontend Reality Audit

Date: 2026-09-26  
Status: Pre-Refoundation Baseline  
Authority: Master Implementation Directive — Section 0 & 39  

## Surface Reality Matrix

| Surface / Component | File Location | Classification | Current State | Refoundation Target |
| :--- | :--- | :--- | :--- | :--- |
| **Marketing Hero** | `src/components/landing/HeroDimensional.tsx` | `LEGACY` | 4-plane parallax with legacy `--proofline-*` tokens and dense text | Hermes-style single-concept hero: 90–100svh, editorial serif headline, approved anime lawyer mark, product rising |
| **Product Proof** | `src/components/landing/LivingSpanAssembler.tsx` | `PARTIAL` | Fraser J [549] extract with synthetic byte markers | Real ATKIN product frame: Alder Peak contract Q&A ("37 calendar days", Clause 3.2), labeled Demo matter |
| **Feature Chapters** | `src/components/landing/FeatureStage.tsx` | `LEGACY` | Card grids with verbose legal jargon and legacy tokens | Sequential numbered chapters (#01 WORK, #02 REMEMBER, #03 RESEARCH, #04 DRAFT, #05 CONNECT, #06 MOVE) |
| **Marketing Nav** | `src/components/layout/GlobalNav.tsx` | `INCONSISTENT` | Mixed branding, fixed 52px top bar | Sticky minimalist nav: ATKIN mark + wordmark, Product, Security, Docs, Download, Open Atkin |
| **Download Section** | `src/components/landing/LandingPage.tsx` | `PARTIAL` | Scattered links and generic CTAs | High-visibility download deck: Windows 10/11 installer, Android companion APK, terminal/build guide |
| **App Shell** | `src/components/layout/Sidebar.tsx`, `TopRail.tsx` | `INCONSISTENT` | 248px sidebar with colorful status badges and mixed legacy variables | Monochrome left rail + main workspace + collapsible contextual right panel |
| **Home Screen** | `src/components/workbench/OverviewTab.tsx` | `PARTIAL` | Matter Master card with mock litigation status | "Good afternoon, [Name]" welcome, Ask composer, Recent matters, Needs review, Upcoming deadlines |
| **Ask (Chat)** | `src/components/workbench/ChatTab.tsx` | `REAL` | Functional 12-stage ASTRA runtime + CitationGate | Dominant conversation typography, compact source chips, quiet model location indicator |
| **Sources** | `src/components/workbench/SourcesTab.tsx` | `REAL` | Document hashing, span extraction, and SQLite storage | Clean list/table hybrid (filename, type, date, status, hash), instant reader slide-over |
| **Facts & Timeline** | `src/components/workbench/FactsTab.tsx`, `TimelineTab.tsx` | `REAL` | Contradiction detection, date chronology | Restrained monochrome fact ledger with verified citation anchors |
| **Research** | `src/components/workbench/ResearchTab.tsx` | `REAL` | Search engine, statutory packs, deep research synthesis | Live vertical activity trace (Planning → Searching → Reading → Verifying → Writing) |
| **Drafting** | `src/components/workbench/DraftTab.tsx` | `REAL` | IRAC drafting, docx export, version diffs | Split screen with source citations linking directly to draft paragraphs |
| **Model Setup** | `src/components/workbench/SettingsTab.tsx` | `REAL` | Ollama connection, VRAM calculation, SQLite migration | Lawyer-first layout: "Where should Atkin run? (This device / My desktop / Remote provider)" |
| **Memory System** | `src/components/workbench/MemoryTab.tsx` | `REAL` | 5-layer persistent memory with isolation checks | Quiet inline confirmations ("Saved to practice memory"), conflict badges |
| **Onboarding** | `src/components/onboarding/OnboardingModal.tsx` | `PARTIAL` | Floating dialog with 7-step wizard | Full-screen editorial setup flow with left stepper, center form, and subtle ATKIN mark background |
| **Companion Pairing**| `src/components/sync/DevicePairingModal.tsx`| `REAL` | Ed25519 pairing engine + QR generator | Clean monochrome modal with centered Atkin mark in QR code |
| **Mobile Experience**| Global responsive layout | `INCONSISTENT` | Shrunk desktop sidebar causing horizontal squish | Native mobile shell: bottom navigation bar (Home, Matters, Ask, Tasks, More), thumb-optimized chat |
| **Theme System** | `src/index.css`, `tailwind.config.js` | `LEGACY` | Hardcoded light mode with `--proofline-*` variables | Dual-mode architecture: Dark (`#0A0A0A` ink, `#111111` surface) and Light (`#F2F0EA` paper) |

## Immediate Elimination Directives

1. **Delete Unsupported Legal Claims**:
   - Strip all instances of `SRA compliant`, `court-admissible`, `100% grounded`, `zero hallucination`, `0 bytes egress`, `military-grade`.
   - Replace with precise technical truth: `Local mode`, `Offline mode`, `Citation verified against source`, `File unchanged since import`.
2. **Purge Legacy Tokens**:
   - Replace all `--proofline-*` color tokens with semantic `--atkin-*` design tokens.
3. **Partition Fixtures**:
   - Ensure personal workspace never auto-seeds Bates v Post Office or consumer laptop fixtures; isolate demo data to Demo workspace with a clear banner.
