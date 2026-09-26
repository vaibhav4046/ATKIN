import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { BRAND } from '../content/brand';
import { PRODUCT_CHAPTERS, PRODUCT_PROOF } from '../content/productCopy';

describe('Brand & Design System Integrity Suite', () => {
  it('verifies canonical brand assets exist in public/brand', () => {
    const markPath = path.resolve(process.cwd(), 'public/brand/atkin-mark.png');
    expect(fs.existsSync(markPath), 'Canonical atkin-mark.png must exist').toBe(true);

    const stat = fs.statSync(markPath);
    expect(stat.size, 'Canonical mark must be non-empty').toBeGreaterThan(10000);

    const sizes = [32, 64, 128, 256, 512];
    for (const s of sizes) {
      const iconPath = path.resolve(process.cwd(), `public/brand/atkin-mark-${s}.png`);
      expect(fs.existsSync(iconPath), `Derived icon atkin-mark-${s}.png must exist`).toBe(true);
    }
  });

  it('verifies BRAND constants enforce ATKIN identity', () => {
    expect(BRAND.name).toBe('ATKIN');
    expect(BRAND.assets.mark).toBe('/brand/atkin-mark.png');
  });

  it('verifies sequential product chapters #01 to #06', () => {
    expect(PRODUCT_CHAPTERS.length).toBe(6);
    expect(PRODUCT_CHAPTERS[0].number).toBe('#01');
    expect(PRODUCT_CHAPTERS[0].tag).toBe('WORK');
    expect(PRODUCT_CHAPTERS[1].tag).toBe('REMEMBER');
    expect(PRODUCT_CHAPTERS[2].tag).toBe('RESEARCH');
    expect(PRODUCT_CHAPTERS[3].tag).toBe('DRAFT');
    expect(PRODUCT_CHAPTERS[4].tag).toBe('CONNECT');
    expect(PRODUCT_CHAPTERS[5].tag).toBe('MOVE');
  });

  it('verifies real product proof contract fixture against Alder Peak clause 3.2', () => {
    expect(PRODUCT_PROOF.contractFixture.clauseReference).toBe('Clause 3.2');
    expect(PRODUCT_PROOF.contractFixture.verbatimQuote).toContain('37 days prior written notice');
  });

  it('verifies design tokens define strict monochrome legal palette', () => {
    const tokensPath = path.resolve(process.cwd(), 'src/design/tokens.css');
    expect(fs.existsSync(tokensPath)).toBe(true);
    const css = fs.readFileSync(tokensPath, 'utf-8');

    expect(css).toContain('--atkin-bg: #F2F0EA;');
    expect(css).toContain('--atkin-ink: #0A0A0A;');
    expect(css).toContain('--atkin-surface:');
    expect(css).toContain('--atkin-border:');
  });
});
