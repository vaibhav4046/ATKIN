import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Copy & brand regression gate.
 *
 * The previous version of this suite enumerated 14 hand-picked marketing files.
 * That structural hole let 31 legacy-brand occurrences ship across 20 production
 * files, including a system prompt sent to the model and a footer written into
 * every exported document.
 *
 * This version walks the real production tree instead, so a regression anywhere
 * in shipped code fails the build.
 */

const ROOT = process.cwd();

/** Directories that make up the shipped product. */
const PRODUCTION_DIRS = [
  'src/content',
  'src/components',
  'src/app',
  'src/engine',
  'src/platform',
  'src/db',
  'src/design',
];

/** Never scanned: tests may legitimately name what they assert against. */
const EXCLUDED_DIRS = ['src/tests'];

const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.css']);

/**
 * Patterns that must not appear in shipped code.
 *
 * `proofline` is the retired product name. The GitHub repository slug is still
 * legitimately `vaibhav4046/proofline`, so repository URLs are stripped before
 * matching (see sanitise).
 */
const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /\bproofline\b/i, why: 'retired product name "Proofline"' },
  { pattern: /\bsra compliant\b/i, why: 'unsupported compliance claim' },
  { pattern: /\bcourt-admissible\b/i, why: 'unsupported compliance claim' },
  { pattern: /\b0 bytes network egress\b/i, why: 'unsupported absolute claim' },
  { pattern: /\bzero hallucination\b/i, why: 'unsupported absolute claim' },
  { pattern: /\b100% grounded\b/i, why: 'unsupported absolute claim' },
  { pattern: /\bzero cloud leak\b/i, why: 'unsupported absolute claim' },
  { pattern: /\bzero unverified external egress\b/i, why: 'unsupported absolute claim' },
  { pattern: /\bzero cloud\b/i, why: 'unsupported absolute claim' },
  { pattern: /\b100%\s+(?:air-?gapped|client-side|local|sovereign)\b/i, why: 'unverifiable absolute claim' },
  { pattern: /\bfiles remain 100%\b/i, why: 'unverifiable data-residency claim' },
  { pattern: /\bair-?gapped\b/i, why: 'unverifiable architecture claim' },
  { pattern: /\bfully admissible\b/i, why: 'legal conclusion asserted by the product' },
  { pattern: /\bverified admissible\b/i, why: 'legal conclusion asserted by the product' },
  { pattern: /\b100%\s+accurate\b/i, why: 'unverifiable accuracy claim' },
  { pattern: /\bhallucination-?free\b/i, why: 'unverifiable absolute claim' },
  { pattern: /\bGDPR[- ]compliant\b/i, why: 'unsupported compliance claim' },
  { pattern: /\bzero[- ]leakage\b/i, why: 'unverifiable absolute claim' },
  {
    pattern: /\b(?:Google|Meta|OpenAI|Anthropic)\s+Gemma\s*\d/i,
    why:
      'vendor attribution of a model name that cannot be independently verified. Present the provider model id from the live probe instead.',
  },
  {
    pattern: /\bEmpirical\s+\d*-?[Tt]ask\b|\bEmpirical Evaluation\b/i,
    why:
      'hardcoded reference figures must not be presented as measurements. Label them as reference values and point at the real artifact.',
  },
];

/**
 * Occurrences that must be preserved because changing them would break real user
 * data or previously written files. Each is a deliberate, reviewed decision.
 *
 * Removing an entry here is a product decision with a migration attached.
 */
const ALLOWLIST: { file: string; contains: string; reason: string }[] = [
  {
    file: 'src/engine/vault/vaultService.ts',
    contains: 'PROOFLINE_VAULT_KEY_VERIFICATION_SENTINEL_2026',
    reason:
      'Vault key-derivation sentinel. Changing the value invalidates every existing encrypted vault, so the literal must stay. It is never displayed to a user.',
  },
  {
    file: 'src/db/index.ts',
    contains: 'ProoflineLocalDB',
    reason:
      'The IndexedDB database name. Renaming it orphans every user\'s locally stored matters, sources, drafts and memory. The exported class was renamed to AtkinDatabase; the stored name is intentionally unchanged.',
  },
  {
    file: 'src/engine/collaboration/bundleExchange.ts',
    contains: 'proofline-encrypted-bundle-v1',
    reason:
      'Legacy bundle format id retained in the type union so bundles exported by earlier builds still import. ATKIN writes atkin-encrypted-bundle-v1.',
  },
  {
    file: 'src/components/workbench/SettingsTab.tsx',
    contains: '%LOCALAPPDATA%\\Proofline',
    reason:
      'Documents the real on-disk vault path implemented in src-tauri/src/vault.rs. It is an accurate filesystem path, not branding copy, and moving it would orphan existing vaults.',
  },
  {
    file: 'src/engine/calendar/icsHandler.ts',
    contains: '@(?:proofline|atkin)\\.local',
    reason:
      'UID suffix regex that must keep matching @proofline.local so calendars exported by earlier builds still import. ATKIN writes @atkin.local.',
  },
];

function collect(dir: string, acc: string[] = []): string[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return acc;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).split('\\').join('/');
    if (EXCLUDED_DIRS.some((excluded) => rel.startsWith(excluded))) continue;
    if (entry.isDirectory()) collect(rel, acc);
    else if (SCANNED_EXTENSIONS.has(path.extname(entry.name))) acc.push(rel);
  }
  return acc;
}

/** Strip legitimate repository URLs, which are slugs, not product copy. */
function sanitise(content: string): string {
  return content
    .replace(/github\.com\/vaibhav4046\/proofline/gi, 'REPO_SLUG')
    .replace(/vaibhav4046\/proofline/gi, 'REPO_SLUG');
}

function allowedFor(relFile: string, raw: string): boolean {
  return ALLOWLIST.some((a) => relFile.endsWith(a.file) && raw.includes(a.contains));
}

const PRODUCTION_FILES = PRODUCTION_DIRS.flatMap((d) => collect(d));

describe('Copy & brand regression (whole production tree)', () => {
  it('actually scans a meaningful number of files', () => {
    // Guards against the gate silently passing because the walk found nothing.
    expect(PRODUCTION_FILES.length).toBeGreaterThan(60);
  });

  for (const rel of PRODUCTION_FILES) {
    it(`${rel} is free of banned legacy copy and unsupported claims`, () => {
      const raw = fs.readFileSync(path.join(ROOT, rel), 'utf-8');
      if (allowedFor(rel, raw)) return;

      const content = sanitise(raw);
      const lines = content.split('\n');

      for (const { pattern, why } of BANNED) {
        lines.forEach((line, i) => {
          if (pattern.test(line)) {
            throw new Error(
              `${rel}:${i + 1} contains ${why}.\n  matched: ${pattern}\n  line: ${line.trim()}`
            );
          }
        });
      }
    });
  }

  it('every allowlist entry still points at a file that exists', () => {
    for (const entry of ALLOWLIST) {
      const candidates = PRODUCTION_FILES.filter((f) => f.endsWith(entry.file));
      expect(
        candidates.length,
        `allowlist entry "${entry.file}" no longer matches any scanned file — remove or update it`
      ).toBeGreaterThan(0);
    }
  });
});

describe('Canonical legal terminology', () => {
  it('uses the approved user-facing vocabulary', async () => {
    const { TERMINOLOGY } = await import('../content/brand');
    expect(TERMINOLOGY.matter).toBe('Matter');
    expect(TERMINOLOGY.source).toBe('Source');
    expect(TERMINOLOGY.ask).toBe('Ask');
    expect(TERMINOLOGY.research).toBe('Research');
    expect(TERMINOLOGY.draft).toBe('Draft');
    expect(TERMINOLOGY.needsReview).toBe('Needs review');
  });
});
