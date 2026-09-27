# ATKIN — Final Product Reality Audit

Audit date: 2026-09-27
Auditor: OpenCode takeover session
Target: `https://github.com/vaibhav4046/proofline` @ `f1124839e6cfba93e4fac7995198c2916a88df4a`
Local working copy: `D:\project\proofline` (clean at audit start)

---

## 0. Takeover record

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD at takeover | `f112483` |
| Working tree | clean (0 modified) |
| Uncommitted Antigravity work found | **NONE on disk** |
| Visual kit | `D:\movies\ATKIN_Website_Visual_Kit_v1.zip` (46 files) |
| Visual kit integrated into repo | **NO** — `public/atkin/` does not exist |

### Correction to the handover brief

The brief stated the previous session had "integrated" the visual kit into `public/atkin/`
and that preview was running on port `5174`. Neither was true on this machine:

- No `public/atkin/` directory. The only imagery in the entire application is
  `public/brand/atkin-mark*.png` (the ATKIN mark). There are exactly **2 `<img>` tags** in
  `src/`, both rendering `/brand/atkin-mark.png`. There are **zero** CSS background images.
- Nothing was listening on 5174. No `atkin.exe` process running.
- No local proofline checkout existed anywhere on `C:` or `D:`; the only ATKIN-named local
  project is `D:\project\atkin`, which is a **different product** (a document-screening
  tool, 4,290 lines, remote `atkin.git`) that merely shares the name.

The prior Antigravity session's visible artifacts are its 8 committed product screenshots
in `C:\Users\lalwa\.geminiantigravity\brain\afbc6a72-.../`. The desktop client **is**
genuinely installed at `C:\Program Files\Atkin\atkin.exe` (13.8 MB).

### Methodology warning (prevents a false P0)

Full-page Playwright screenshots render `position: fixed` elements at the stitched scroll
offset, which makes the fixed 52px `GlobalNav` appear to overlap section content. A
viewport screenshot at `scrollY=820` proved **no overlap exists**. All layout findings in
this audit were confirmed with viewport screenshots, not full-page captures.

---

## 1. Baseline evidence (re-run from scratch, not trusted)

| Gate | Command | Result |
|---|---|---|
| Install | `npm install` | 187 packages, 16s, clean |
| Typecheck | `npx tsc --noEmit` | **0 errors** |
| Unit/integration | `npm test` (vitest) | **45 files, 258 tests, 258 passed, 0 failed**, 11.47s |
| Build | `npm run build` | success, 12.42s |
| Preview | `vite preview --port 5174` | HTTP 200 |

The handover claimed "TypeScript reached zero errors" and "Vitest still running". Both are
now independently confirmed green.

**Build payload**

```
dist/index.html                   1.55 kB │ gzip   0.74 kB
dist/assets/index-*.css          55.10 kB │ gzip  10.12 kB
dist/assets/core-*.js            2.44 kB │ gzip   0.98 kB
dist/assets/index-*.js        1,126.69 kB │ gzip 325.90 kB   <-- single chunk, >500kB warning
```

There is no `typecheck` npm script; `npm run build` runs `tsc && vite build`.
There is no lint configuration in the repo. There is no integration/E2E test runner
configured (Playwright is only a `playwright-core` devDependency, unused by any script).

---

## 2. Confirmed defects

Classification: **P0** = credibility-destroying or blocks the golden demo.
**P1** = real quality defect. All were reproduced against the production build.

### P0-1 — Fabricated SHA-256 presented as "VERIFIED" on the hero

`src/components/landing/LandingHero.tsx` renders, as a cryptographic seal:

```
CANONICAL MARK                                        VERIFIED
SHA-256: 60b0b7a6b53e2cd3d4499f2c54e8a1c94dc07d22c0acf064e24d293d9429af67
```

Actual SHA-256 of the served asset `public/brand/atkin-mark.png`
(= `dist/brand/atkin-mark.png`):

```
15cf2f46b5838c401e1a923b1f6a3661359d36ab58abe829d5da4df362d7d00a
```

**The displayed digest is false.** It is a hardcoded JSX literal. Any judge who runs
`sha256sum` on the shipped asset — a five-second check — sees that the product's headline
trust claim does not hold. Violates "Model Ready means an actual health check succeeded"
and "hardcoded verified" in the fake-state audit.

### P0-2 — The same fabricated string is reused as a source-document digest

`src/content/productCopy.ts:87`
`sha256Digest: '60b0b7a6b53e2cd3d4499f2c54e8a1c94dc07d22c0acf064e24d293d9429af67'`

This is displayed in the live "SOURCE PROVENANCE LEDGER" as the `DOCUMENT DIGEST` for
`test-contract-independent.txt`, and is also copied into the user's clipboard as
`[Alder Peak MSA, Clause 3.2 #L20; SHA-256: 60b0b7a6b53e2cd3d4499f2c54...#67]`.

Real digests of the actual fixtures:

| Fixture | Real SHA-256 |
|---|---|
| `fixtures/test-contract-independent.txt` | `fc6742904d4ef08dfdc03d2434a4cf7d8877d7d03d44958de9f24f9bf4f97ceb` |
| `fixtures/test-contract-independent-v2.txt` | `3660882fa1926250429a963a0e8f3e9278aeb86646e2194e7da327d1067f44c2` |
| `fixtures/AlderPeak-Independent-Contract.pdf` | `d98c550bb8e61e6eb266482069e5811c41dde721a6863c79ec7d415fc2bbdee6` |

None match. The "verification" chain presented to the user is therefore decorative.

### P0-3 — Unsupported legal claim in visible UI, and the gate that should have caught it is blind to it

`src/content/productCopy.ts:91`
`admissibilityNotice: 'Admissible under CPR Part 32 — Strict selective abstention active'`

Rendered on the landing page directly beneath "Verified grounded (exact byte match)".

`src/tests/copyRegression.test.ts` bans `/court-admissible/i` — a pattern that matches the
hyphenated phrase "court-admissible" and **does not match** the string actually used. The
gate passes while the claim ships. The directive's banned list includes bare "Admissible".

### P0-4 — "Admissible" is derived from text-extraction success

`src/engine/notebook/notebookStudioEngine.ts:139` and `:355`

```ts
verifiedAdmissible: doc.extractionStatus === 'success',
```

`src/components/workbench/NotebookStudioTab.tsx:259` hardcodes `verifiedAdmissible: true`.

A document whose text layer extracted is **not thereby admissible**. This converts a
technical fact (extraction worked) into a legal conclusion (evidence is admissible), which
is exactly the fabricated-credibility class a legal judge will attack hardest.

### P0-5 — Primary download CTA ships deprecated branding and a missing asset

The landing advertises (from `DOWNLOAD_OPTIONS`):

| Card | Advertised filename | Advertised href |
|---|---|---|
| Windows | `Atkin-Setup.exe` | `/download#windows` |
| Android | `Atkin-Companion.apk` | `/download#android` |
| Source | `git clone + npm run tauri` | GitHub repo |

`src/components/landing/DownloadSection.tsx:58` silently rewrites every non-`http` href to
`https://github.com/vaibhav4046/proofline/releases`. So the real destination is the
releases page, which actually contains:

```
v1.0.0  assets=2
  Proofline_1.0.0_x64-setup.exe        2,636,394 bytes
  Proofline_1.0.0_x64_en-US.msi        3,919,872 bytes
```

Consequences:

1. The only published installers are branded **"Proofline"** — the deprecated brand, in the
   exact artifact a judge would download. Stale branding survives in the shipped binary.
2. **No Android asset is published at all.** The "Get Android" CTA and the displayed
   filename `Atkin-Companion.apk` are both false. An APK exists in the repo working tree
   (`release/android/Atkin-1.0.0-universal.apk`, 17,188,290 bytes) but was never published
   to the release the site points at.
3. Neither advertised filename matches a real asset name.

This is a dead/misleading primary CTA plus stale branding in a distributed artifact.

### P1-6 — Hardcoded perfect confidence score

`src/content/productCopy.ts:89` `confidenceScore: 100`. A constant 100% is a fabricated
metric, explicitly banned by the brief ("No fake accuracy scores", "do not use decorative
confidence percentages").

### P1-7 — Deprecated brand in generated legal correspondence

`src/lib/draftingEngine.ts:213` writes user-visible letter text:
`"Thank you for instructing Proofline Legal Clinic regarding the ZenithBook Pro 15 laptop purchase"`

`src/lib/draftingEngine.ts:408` appends an export footer:
`"Generated by Proofline Sovereign Legal Copilot · Local-First Architecture · Zero Unverified External Egress"`

The "Zero Unverified External Egress" phrase is an unsupported absolute compliance claim.

### P1-8 — Deprecated brand in the user's exported bundle filename

`src/app/AppShell.tsx:479`
`` `${matter}_Sovereign_Bundle.proofline` `` — the file the user downloads is named after
the old brand.

### P1-9 — The copy regression gate has a structural coverage hole

`src/tests/copyRegression.test.ts` enumerates **14 hand-picked files**, all of them
marketing/landing/nav components. It never scans `src/lib/`, `src/engine/`, `src/app/`,
`src/db/`, or `src/styles/`. That is precisely why P0-3, P1-7 and P1-8 shipped green.
Its banned list is also missing `admissible`, `air-gapped`, `gemma 4`, and `workbench`.

### P1-10 — Hero ships a 593 KB PNG where a 54 KB variant exists

`LandingHero.tsx:123` and `AtkinLogo.tsx:19` both render
`/brand/atkin-mark.png` = 593,018 bytes, `loading="eager"`.
`public/brand/` already contains `atkin-mark-512.png` (192,935 B),
`atkin-mark-256.png` (54,616 B) and `atkin-mark-128.png` (16,649 B). A 256px asset is
~11x smaller than the 512px one for a rendered card capped at `max-w-[380px]`.

### P1-11 — Single 1,126 kB JS chunk

All application code ships in one chunk, tripping Vite's 500 kB warning. No manual
chunking, no route-level dynamic import.

### P1-12 — Visual kit is 100% unintegrated

The 46-asset kit sits in `D:\movies\`. Nothing from it is in the repository. The landing
has no cinematic art; the hero's only visual is the mark inside a fake browser-chrome card.
The brief's placement map (hero courtroom, matter, sources, research, draft, sovereignty,
footer) is entirely unrealised. All kit background PNGs are 2.3–2.8 MB and the character
PNGs are 0.6–1.7 MB, so integration must ship WebP (335–517 KB available) not PNG.

### P1-13 — Legacy brand tokens still in the design system

`src/styles/tokens.css:48-52` defines `--proofline-blue/navy/green/ochre/crimson`, aliased
onto ATKIN tokens. Dead legacy naming in the token layer.

---

## 3. Classification of major features (evidence-based)

Classification reflects what I could verify, not what documentation asserts.

| Feature | Class | Evidence |
|---|---|---|
| Groundings/citation engine | **REAL** | `citationGate.test.ts` (8), `legalAuthority.test.ts` (6), `regressionIntegrity.test.ts` (9) pass; exact-span match demonstrated live in the UI |
| ASTRA protocol/runtime | **REAL (engine)** | `astraProtocol.test.ts` (10), `astraRuntime.test.ts` (5), `astraRandomizedEval.test.ts` (15) pass |
| Legal reasoning | **REAL (engine)** | `legalReasoningEngine.test.ts` (4), `contractReview.test.ts` (7), `contradiction.test.ts` (1) |
| Matter isolation | **REAL (unit-level)** | `memoryIsolation.test.ts` (4) pass. No E2E proof across two real matters. |
| Prompt-injection defence | **REAL (unit-level)** | `injection.test.ts` (3) pass. No test for malicious MCP/tool/email output paths. |
| Persistence (IndexedDB) | **REAL (in-process)** | `persistence.test.ts` (6) pass. **No process-restart test exists.** |
| Research engine | **PARTIAL** | `legalSearchEngine.test.ts` (5) pass, but no live network research and no job-state E2E |
| Audit ledger | **UNVERIFIED** | No tamper-detection test found; `release/audit/audit-chain.jsonl` is committed but untested |
| Work Products / Draft | **PARTIAL** | `atkinWorkProductsAndApprovals.test.ts` (4); export functions exist, no E2E |
| Model sovereignty / routing | **REAL (receipt-level)** | `atkinModelSovereignty.test.ts` (3) incl. `LOCAL_PREFERRED` RoutingReceipt |
| Notebook Studio | **PARTIAL / at risk** | Engine works but emits legal conclusions from extraction status (P0-4) and duplicates Draft+Sources (brief §18) |
| Desktop (Tauri) | **REAL, installed** | `C:\Program Files\Atkin\atkin.exe` present; `src-tauri/` present |
| Android | **PARTIAL** | APK built and committed (17.2 MB) but never published to the release the site links |
| Device pairing | **REAL (unit-level)** | `atkinDevicePairing.test.ts` (5), `pairingRemoteInference.test.ts` (5) |
| Cross-device sync | **UNVERIFIED** | No end-to-end evidence; no two-device test |
| Backup / restore | **UNVERIFIED** | `vault.test.ts` (4) exists; no restore round-trip test found |
| Connectors | **UNVERIFIED** | `connectorImporter.test.ts` (3) covers import parsing only |
| Offline mode | **UNVERIFIED** | No offline test found |
| Landing marketing surface | **REAL but degraded** | Renders; carries P0-1/2/3 |
| UI automation | **ABSENT** | No Playwright script, no E2E suite, no axe |
| Visual regression | **ABSENT** | No baselines, no capture script |
| Lint | **ABSENT** | No eslint config in repo |

---

## 4. Stop-condition status

| Stop condition | Status |
|---|---|
| critical TypeScript failure | CLEARED (0 errors) |
| failing critical tests | CLEARED (258/258) |
| broken core navigation | CLEARED (verified in preview) |
| unreadable dark/light content | NOT YET AUDITED |
| primary buttons without states | NOT YET AUDITED |
| major image overlaps | CLEARED — no kit art is placed at all; see §0 |
| personal/demo fixture leakage | NOT YET AUDITED |
| **fake citations** | **P0-1, P0-2 OPEN** |
| **stale Proofline branding** | **P0-5, P1-7, P1-8 OPEN** |
| **unsupported compliance claims** | **P0-3, P0-4, P1-6, P1-7 OPEN** |
| **dead primary controls** | **P0-5 OPEN** |
| asset 404s | NOT YET AUDITED |

---

## 5. Fix plan (ordered by credibility risk)

1. **Make the digests real.** Generate real SHA-256 values from the shipped assets and the
   real fixture; add a test that recomputes from disk and fails on drift, so the displayed
   hash can never again silently diverge from the artifact.
2. **Remove the fabricated `confidenceScore: 100`.**
3. **Replace "Admissible under CPR Part 32"** with observable language, and stop deriving
   admissibility from extraction status.
4. **Fix the download surface**: publish correctly branded, correctly named assets, or
   stop advertising an Android download that does not exist.
5. **Purge `Proofline` from user-visible output** (drafting engine, export filename).
6. **Close the copy-gate hole** by scanning real production directories and extending the
   banned list, so regressions fail the build instead of passing.
7. **Image performance**: ship the 256px mark, lazy-load below the fold.
8. **Integrate the visual kit** with WebP, deliberate placement, and theme-aware treatment.
9. **Code-split** the 1,126 kB chunk.
10. **Add UI automation**: golden journey E2E, axe, visual baselines, offline, restart.

---

## 6. Evidence levels used in this document

`UNIT VERIFIED` · `INTEGRATION VERIFIED` · `UI AUTOMATION VERIFIED` ·
`DESKTOP DEVICE VERIFIED` · `ANDROID EMULATOR VERIFIED` · `PHYSICAL DEVICE VERIFIED` ·
`CROSS-DEVICE VERIFIED` · `BLOCKED` · `UNVERIFIED`

Nothing in this document is labelled with a level above what was actually executed.
