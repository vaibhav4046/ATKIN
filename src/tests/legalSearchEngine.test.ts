import { describe, it, expect } from 'vitest';
import { LegalSearchEngine, COMPREHENSIVE_STATUTORY_INDEX } from '../engine/research/legalSearchEngine.ts';

describe('LegalSearchEngine — Real Statutory Authorities Search', () => {
  const engine = new LegalSearchEngine();

  it('searches indexed primary law offline for Consumer Rights Act 2015', async () => {
    const { results, source } = await engine.searchAuthorities('Consumer Rights Act s.20 reject', 'offline');
    expect(source).toBe('local_index');
    expect(results.length).toBeGreaterThan(0);
    const s20 = results.find(r => r.identifier.includes('s.20'));
    expect(s20).toBeDefined();
    expect(s20?.summary).toContain('short-term right to reject');
  });

  it('searches indexed law for UCTA 1977 reasonableness', async () => {
    const { results } = await engine.searchAuthorities('Unfair Contract Terms reasonableness', 'offline');
    expect(results.length).toBeGreaterThan(0);
    const ucta = results.find(r => r.identifier.includes('UCTA'));
    expect(ucta).toBeDefined();
    expect(ucta?.summary).toContain('reasonableness');
  });

  it('searches Civil Procedure Rules (CPR)', async () => {
    const { results } = await engine.searchAuthorities('CPR Part 31 disclosure', 'offline');
    expect(results.length).toBeGreaterThan(0);
    const cpr = results.find(r => r.identifier.includes('Part 31'));
    expect(cpr).toBeDefined();
    expect(cpr?.summary).toContain('Standard disclosure');
  });

  it('searches European Union AI Act and GDPR', async () => {
    const { results: aiResults } = await engine.searchAuthorities('EU AI Act Human Oversight Art. 14', 'offline');
    expect(aiResults.length).toBeGreaterThan(0);
    const art14 = aiResults.find(r => r.identifier.includes('Art. 14'));
    expect(art14).toBeDefined();
    expect(art14?.summary).toContain('High-risk AI');

    const { results: gdprResults } = await engine.searchAuthorities('GDPR Art 28 Processor', 'offline');
    expect(gdprResults.length).toBeGreaterThan(0);
    const gdpr = gdprResults.find(r => r.identifier.includes('GDPR'));
    expect(gdpr).toBeDefined();
  });

  it('searches Delaware corporate law and Indian electronic evidence statute', async () => {
    const { results: deResults } = await engine.searchAuthorities('Delaware 102(b)(7) Exculpation', 'offline');
    expect(deResults.length).toBeGreaterThan(0);
    const dgcl = deResults.find(r => r.identifier.includes('102(b)(7)'));
    expect(dgcl).toBeDefined();

    const { results: inResults } = await engine.searchAuthorities('BSA 2023 s.63 electronic records certificate', 'offline');
    expect(inResults.length).toBeGreaterThan(0);
    const bsa = inResults.find(r => r.identifier.includes('BSA'));
    expect(bsa).toBeDefined();
  });
});
