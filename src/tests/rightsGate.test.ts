import { describe, it, expect } from 'vitest';
import { SourceCatalog } from '../engine/research/sourceCatalog.ts';

describe('Sovereign Legal Rights Gate & Source Compliance Evaluator', () => {
  const catalog = new SourceCatalog();

  it('permits computational indexing and embedding for Open Government Licence (OGL v3) sources', () => {
    const fetchDec = catalog.evaluateRights('src-uk-legislation', 'fetch');
    expect(fetchDec.isPermitted).toBe(true);
    expect(fetchDec.decision).toBe('allowed');

    const indexDec = catalog.evaluateRights('src-uk-legislation', 'index');
    expect(indexDec.isPermitted).toBe(true);
    expect(indexDec.decision).toBe('allowed');

    const embedDec = catalog.evaluateRights('src-uk-legislation', 'embed');
    expect(embedDec.isPermitted).toBe(true);
    expect(embedDec.decision).toBe('allowed');
  });

  it('strictly blocks unauthorized bulk indexing and AI training under Open Justice Licence (OJL v2.0)', () => {
    // Single case fetch / view is allowed
    const fetchDec = catalog.evaluateRights('src-uk-find-case-law', 'fetch');
    expect(fetchDec.isPermitted).toBe(true);
    expect(fetchDec.decision).toBe('allowed');

    // Computational indexing requires bespoke permission under OJL v2.0
    const indexDec = catalog.evaluateRights('src-uk-find-case-law', 'index');
    expect(indexDec.isPermitted).toBe(false);
    expect(indexDec.decision).toBe('requires_permission');
    expect(indexDec.rationale).toContain('PERMISSION REQUIRED');

    // Vector embedding requires bespoke permission
    const embedDec = catalog.evaluateRights('src-uk-find-case-law', 'embed');
    expect(embedDec.isPermitted).toBe(false);
    expect(embedDec.decision).toBe('requires_permission');

    // AI model training is strictly not allowed under default terms
    const trainDec = catalog.evaluateRights('src-uk-find-case-law', 'train');
    expect(trainDec.isPermitted).toBe(false);
    expect(trainDec.decision).toBe('not_allowed');
    expect(trainDec.rationale).toContain('PROHIBITED');
  });

  it('correctly categorises sources across multiple jurisdictions', () => {
    const ukSources = catalog.getSourcesByJurisdiction('UK');
    const usSources = catalog.getSourcesByJurisdiction('US');
    const euSources = catalog.getSourcesByJurisdiction('EU');
    const inSources = catalog.getSourcesByJurisdiction('IN');

    expect(ukSources.length).toBeGreaterThanOrEqual(2);
    expect(usSources.length).toBeGreaterThanOrEqual(1);
    expect(euSources.length).toBeGreaterThanOrEqual(1);
    expect(inSources.length).toBeGreaterThanOrEqual(1);
  });
});
