# ATKIN Copy Audit

Date: 2026-09-26  
Purpose: Standardize terminology, eliminate unsupported claims, and remove legacy brand references.

| Old String | New String | Reason | Primary Files |
| :--- | :--- | :--- | :--- |
| `Proofline` | `ATKIN` | Canonical brand reset | `src/App.tsx`, `index.html`, `GlobalNav.tsx`, `Sidebar.tsx`, etc. |
| `Launch Workbench` | `Open Atkin` | Standard action verb, removes prototype jargon | `GlobalNav.tsx`, `LandingPage.tsx`, `HeroDimensional.tsx` |
| `Explore Sample` / `Explore Sample Matter` | `Explore demo` | Direct, honest phrasing | `GlobalNav.tsx`, `LandingPage.tsx` |
| `SRA Principle 2 Compliant` / `SRA Compliant` | *(Removed)* | Unsupported regulatory assertion | `LandingPage.tsx`, `GlobalNav.tsx`, `LegalModal.tsx` |
| `Court-Admissible` / `Admissible` | `Citation verified against source` | Avoids legal guarantee; states factual mechanical check | `LandingPage.tsx`, `HeroDimensional.tsx`, `OverviewTab.tsx` |
| `100% Grounded` / `Zero Hallucination` | `Source-linked reasoning` | Radical honesty; models cannot guarantee zero error | `LandingPage.tsx`, `SettingsTab.tsx` |
| `0 Bytes Network Egress` / `Zero Egress` | `Local mode (no remote provider)` | Accurate description of offline compute state | `HeroDimensional.tsx`, `SettingsTab.tsx` |
| `Deterministic IRAC Engine` | `Local analysis` | Accessible terminology for legal practitioners | `HeroDimensional.tsx`, `Sidebar.tsx`, `SettingsTab.tsx` |
| `Cryptographic Provenance Verified` | `File unchanged since import` | Natural language explanation of SHA-256 hash match | `LivingSpanAssembler.tsx`, `SourcesTab.tsx` |
| `Air-Gapped Local Invariant` | `Offline mode` | Honest condition; only true when networking disabled | `HeroDimensional.tsx`, `SettingsTab.tsx` |
| `Why Generic AI Fails the Courtroom` | `A case file you can question` | Eliminates unsupported competitive attacks | `LandingPage.tsx` |
| `Execute sovereign evidential corpus ingestion` | `Add sources` | Human, professional microcopy | `SourcesTab.tsx`, `OverviewTab.tsx` |
| `Commence autonomous jurisprudential investigation` | `Start research` | Human, professional microcopy | `ResearchTab.tsx` |
| `Gemma 4` / `gemma4:e2b-it-qat` | `Local model` / `Selected local model` | Eliminates hardcoded model expectations | `SettingsTab.tsx`, `HeroDimensional.tsx` |
| `Workspace` vs `Matter` vs `Case` | Standardized to `Matter` | Eliminates object confusion | `Sidebar.tsx`, `App.tsx`, `OverviewTab.tsx` |
| `Notebook` | `Notebook Studio` | Retained as distinct exploratory canvas | `NotebookStudioTab.tsx` |
| `Ask Copilot` | `Ask` | Clean, direct navigation verb | `Sidebar.tsx`, `TopRail.tsx` |
| `Authorities & Law` | `Research` | Clean, direct navigation verb | `Sidebar.tsx` |
| `Court Brief & Pleadings` | `Draft` | Clean, direct navigation verb | `Sidebar.tsx` |
