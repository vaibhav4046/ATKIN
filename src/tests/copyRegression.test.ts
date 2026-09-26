import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Copy & Product Veracity Regression Suite', () => {
  const bannedPhrases = [
    /proofline/i,
    /sra compliant/i,
    /court-admissible/i,
    /0 bytes network egress/i,
    /zero hallucination/i,
    /100% grounded/i
  ];

  // Specific user-facing marketing and presentation components that must have zero banned phrases
  const targetFiles = [
    'src/content/brand.ts',
    'src/content/productCopy.ts',
    'src/components/landing/LandingPage.tsx',
    'src/components/landing/LandingHero.tsx',
    'src/components/landing/ProductProof.tsx',
    'src/components/landing/ProductChapters.tsx',
    'src/components/landing/SecurityMatrix.tsx',
    'src/components/landing/LandingFooter.tsx',
    'src/components/landing/LivingSpanAssembler.tsx',
    'src/components/layout/GlobalNav.tsx',
    'src/components/layout/Sidebar.tsx',
    'src/components/layout/TopRail.tsx',
    'src/components/workbench/OverviewTab.tsx',
    'src/components/common/LegalModal.tsx'
  ];

  for (const relPath of targetFiles) {
    it(`verifies ${relPath} contains zero banned marketing claims or legacy Proofline text`, () => {
      const fullPath = path.resolve(process.cwd(), relPath);
      expect(fs.existsSync(fullPath), `File ${relPath} should exist`).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Filter out GitHub repo links which legitimately point to https://github.com/vaibhav4046/proofline
      const sanitizedContent = content.replace(/github\.com\/vaibhav4046\/proofline/gi, '');

      for (const pattern of bannedPhrases) {
        const matches = sanitizedContent.match(pattern);
        expect(
          matches,
          `File ${relPath} should not contain pattern ${pattern.toString()}`
        ).toBeNull();
      }
    });
  }

  it('verifies standard legal terminology dictionary contains expected keys', async () => {
    const { TERMINOLOGY } = await import('../content/brand');
    expect(TERMINOLOGY.matter).toBe('Matter');
    expect(TERMINOLOGY.source).toBe('Source');
    expect(TERMINOLOGY.ask).toBe('Ask');
    expect(TERMINOLOGY.research).toBe('Research');
    expect(TERMINOLOGY.draft).toBe('Draft');
    expect(TERMINOLOGY.needsReview).toBe('Needs review');
  });
});
