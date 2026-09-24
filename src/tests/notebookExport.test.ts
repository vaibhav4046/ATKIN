import { describe, it, expect } from 'vitest';
import { NotebookExporter } from '../engine/export/notebookExporter.ts';
import { 
  SAMPLE_MATTER, 
  SAMPLE_DOCUMENTS, 
  SAMPLE_CLAIMS, 
  SAMPLE_SPANS,
  SAMPLE_DRAFT 
} from '../db/fixtures/consumerLaptop.ts';
import { CRA_2015_AUTHORITIES } from '../db/fixtures/authorities.ts';
import { detectContradictions } from '../engine/contradictionEngine.ts';

describe('Obsidian-Style Markdown Notebook Exporter', () => {
  it('generates interconnected markdown files with bidirectional [[wikilinks]]', () => {
    const spanMap = new Map(SAMPLE_SPANS.map(s => [s.id, s]));
    const { contradictions } = detectContradictions(SAMPLE_CLAIMS, spanMap);

    const files = NotebookExporter.generateObsidianVault(
      SAMPLE_MATTER,
      SAMPLE_DOCUMENTS,
      SAMPLE_CLAIMS,
      contradictions,
      CRA_2015_AUTHORITIES,
      [SAMPLE_DRAFT]
    );

    expect(files.length).toBeGreaterThanOrEqual(5);

    // Verify Index.md
    const index = files.find(f => f.relativePath === 'Index.md');
    expect(index).toBeDefined();
    expect(index?.content).toContain('[[Documents/Index|📁 Evidence & Source Documents]]');
    expect(index?.content).toContain('[[Facts/Index|⚖️ Verified Fact Ledger]]');
    expect(index?.content).toContain('[[Contradictions/Index|⚡ Discovered Contradictions]]');
    expect(index?.content).toContain('[[Authorities/Index|📚 Statutory Authorities]]');

    // Verify Documents index and items
    const docIndex = files.find(f => f.relativePath === 'Documents/Index.md');
    expect(docIndex).toBeDefined();
    expect(docIndex?.content).toContain('SHA-256');

    // Verify Claims with wikilinks
    const claimDoc = files.find(f => f.relativePath.startsWith('Facts/Claim_'));
    expect(claimDoc).toBeDefined();
    expect(claimDoc?.content).toContain('[[Index|Matter Home]]');

    // Verify Contradiction card
    const conflictDoc = files.find(f => f.relativePath.startsWith('Contradictions/Conflict_'));
    expect(conflictDoc).toBeDefined();
    expect(conflictDoc?.content).toContain('Opposing Statements');
    expect(conflictDoc?.content).toContain('[[Facts/Claim_');

    // Verify Authorities card
    const authDoc = files.find(f => f.relativePath.startsWith('Authorities/Auth_'));
    expect(authDoc).toBeDefined();
    expect(authDoc?.content).toContain('Section / Paragraph');
  });
});
