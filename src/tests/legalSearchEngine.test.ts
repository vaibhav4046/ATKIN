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
});
