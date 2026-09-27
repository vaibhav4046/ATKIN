import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ASSET_DIGESTS } from '../content/assetDigests.generated';
import { PRODUCT_PROOF } from '../content/productCopy';

/**
 * ATKIN shows SHA-256 digests to the user as proof that what it displays is the
 * artifact it actually ships. A previous revision displayed a digest that
 * matched no file on disk, next to the word VERIFIED.
 *
 * These tests recompute every surfaced digest from the real bytes, so a
 * fabricated or stale digest fails the build instead of reaching a judge.
 */
const sha256 = (abs: string) => createHash('sha256').update(readFileSync(abs)).digest('hex');

describe('Asset digest integrity (no fabricated verification)', () => {
  for (const [key, entry] of Object.entries(ASSET_DIGESTS)) {
    it(`${key}: committed digest matches the real bytes of ${entry.file}`, () => {
      const abs = join(process.cwd(), entry.file);
      expect(existsSync(abs), `${entry.file} must exist for its digest to mean anything`).toBe(true);

      const actual = sha256(abs);
      expect(
        entry.sha256,
        `${entry.file} digest is stale. Run: node scripts/gen-asset-digests.mjs`
      ).toBe(actual);
    });

    it(`${key}: recorded byte size matches the real file size`, () => {
      const abs = join(process.cwd(), entry.file);
      expect(readFileSync(abs).length).toBe(entry.bytes);
    });

    it(`${key}: digest is a real lowercase 64-char hex SHA-256`, () => {
      expect(entry.sha256).toMatch(/^[0-9a-f]{64}$/);
    });
  }

  it('the demo matter digest is the real digest of the demo contract fixture', () => {
    // The Product Proof panel labels this "DOCUMENT DIGEST" for test-contract-independent.txt.
    expect(PRODUCT_PROOF.contractFixture.sourceDocument).toBe(
      ASSET_DIGESTS.demoContractFixture.file.split('/').pop()
    );
    expect(PRODUCT_PROOF.contractFixture.sha256Digest).toBe(ASSET_DIGESTS.demoContractFixture.sha256);
  });

  it('the canonical mark digest is distinct from the document digest', () => {
    // The old bug was one invented string standing in for two different artifacts.
    expect(ASSET_DIGESTS.canonicalMark.sha256).not.toBe(ASSET_DIGESTS.demoContractFixture.sha256);
  });

  it('no landing or product-copy file contains an invented 64-hex digest literal', () => {
    // A hardcoded 64-hex literal in UI copy is exactly how the false digest shipped.
    const allowed = new Set<string>(
      Object.values(ASSET_DIGESTS).map((d) => d.sha256)
    );
    const files = [
      'src/content/productCopy.ts',
      'src/content/brand.ts',
      'src/components/landing/LandingHero.tsx',
      'src/components/landing/ProductProof.tsx',
    ];

    for (const rel of files) {
      const abs = join(process.cwd(), rel);
      if (!existsSync(abs)) continue;
      const source = readFileSync(abs, 'utf-8');
      const literals = source.match(/['"`][0-9a-fA-F]{64}['"`]/g) ?? [];
      for (const literal of literals) {
        const value = literal.slice(1, -1).toLowerCase();
        expect(
          allowed.has(value),
          `${rel} contains a hardcoded digest ${value} that is not a generated, verified asset digest`
        ).toBe(true);
      }
    }
  });

  it('the product makes no legal admissibility claim on the strength of a technical check', () => {
    const notice: string = PRODUCT_PROOF.contractFixture.admissibilityNotice;

    // Naming the issue in order to defer to the court is fine. Asserting that the
    // evidence IS admissible, on the back of a text-extraction or byte-match check,
    // is the defect. So ban assertions, not the vocabulary.
    expect(notice, 'must not assert the evidence is admissible').not.toMatch(
      /\b(?:is|are|was|were|hereby|therefore)\s+admissible\b/i
    );
    expect(notice, 'must not cite a rule as a compliance guarantee').not.toMatch(
      /admissible\s+under\b/i
    );
    expect(notice, 'must not claim verified admissibility').not.toMatch(/verified\s+admissible/i);

    // It must still be a real, substantive statement rather than an empty placeholder.
    expect(notice.length).toBeGreaterThan(20);
  });
});
