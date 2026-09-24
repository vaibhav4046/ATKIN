import { describe, it, expect } from 'vitest';
import { notebookStudioEngine } from '../engine/notebook/notebookStudioEngine.ts';
import { BATES_MATTER, BATES_DOCUMENTS, BATES_SPANS, BATES_CLAIMS, BATES_AUTHORITIES } from '../db/fixtures/batesPostOfficeMatter.ts';

describe('NotebookStudioEngine - Open Notebook Reverse-Engineered Legal Studio', () => {
  it('initializes a scoped notebook container with active sources and token estimation', () => {
    const notebook = notebookStudioEngine.createNotebook(
      BATES_MATTER.id,
      'Horizon System Audit & Admissibility',
      'Investigating computerized audit logs and witness statements for Fujitsu discrepancies',
      BATES_DOCUMENTS
    );

    expect(notebook.id).toBeDefined();
    expect(notebook.title).toBe('Horizon System Audit & Admissibility');
    expect(notebook.activeSourceIds.length).toBe(BATES_DOCUMENTS.length);
    expect(notebook.chatMessages.length).toBe(1);

    // Test token estimation
    const tokenInfo = notebookStudioEngine.estimateContextTokens(notebook, BATES_DOCUMENTS);
    expect(tokenInfo.totalTokens).toBeGreaterThan(0);
    expect(tokenInfo.percentUsed).toBeLessThanOrEqual(100);

    // Switch one doc to 'excluded' and another to 'summary'
    notebook.sourceContextModes[BATES_DOCUMENTS[0].id] = 'excluded';
    notebook.sourceContextModes[BATES_DOCUMENTS[1].id] = 'summary';

    const adjustedTokens = notebookStudioEngine.estimateContextTokens(notebook, BATES_DOCUMENTS);
    expect(adjustedTokens.perDocTokens[BATES_DOCUMENTS[0].id]).toBe(0);
    expect(adjustedTokens.perDocTokens[BATES_DOCUMENTS[1].id]).toBe(180);
    expect(adjustedTokens.totalTokens).toBeLessThan(tokenInfo.totalTokens);
  });

  it('runs conversational chat with grounded character citations from active sources', () => {
    const notebook = notebookStudioEngine.createNotebook(
      BATES_MATTER.id,
      'Horizon Audit Notebook',
      'Test notebook',
      BATES_DOCUMENTS
    );

    const reply = notebookStudioEngine.chatWithNotebook(
      notebook,
      'PIN-188 balance discrepancy defect',
      BATES_DOCUMENTS,
      BATES_SPANS
    );

    expect(reply.sender).toBe('assistant');
    expect(reply.citations.length).toBeGreaterThan(0);
    expect(reply.citations[0].startOffset).toBeDefined();
    expect(reply.citations[0].endOffset).toBeDefined();
    expect(reply.citations[0].verifiedAdmissible).toBe(true);
    expect(reply.evidentialCoverageRatio).toBeGreaterThan(0.2);
  });

  it('enforces selective abstention in Ask RAG mode when evidence is insufficient', () => {
    const notebook = notebookStudioEngine.createNotebook(
      BATES_MATTER.id,
      'Horizon Audit Notebook',
      'Test notebook',
      BATES_DOCUMENTS
    );

    // Ask about something completely absent from Post Office documents (e.g. quantum particle accelerators)
    const outOfScopeResult = notebookStudioEngine.askNotebook(
      notebook,
      'What is the particle accelerator coolant temperature in the reactor core?',
      BATES_DOCUMENTS,
      BATES_CLAIMS
    );

    expect(outOfScopeResult.isAbstaining).toBe(true);
    expect(outOfScopeResult.abstentionReason).toContain('Evidential deficit detected');
    expect(outOfScopeResult.synthesizedAnswer).toContain('Selective Abstention Triggered');
    expect(outOfScopeResult.missingDiscoveryNeeded.length).toBeGreaterThan(0);

    // Ask about an actual evidenced issue in the Post Office documents
    const inScopeResult = notebookStudioEngine.askNotebook(
      notebook,
      'Fujitsu PIN-188 transaction logs and discrepancies',
      BATES_DOCUMENTS,
      BATES_CLAIMS
    );

    expect(inScopeResult.isAbstaining).toBe(false);
    expect(inScopeResult.relevantChunks.length).toBeGreaterThan(0);
    expect(inScopeResult.evidentialCoverageRatio).toBeGreaterThanOrEqual(0.40);
    expect(inScopeResult.synthesizedAnswer).toContain('Synthesized Evidentiary Briefing');
  });

  it('generates all legal studio transformations with 4-timestamp provenance and contradiction checks', () => {
    const notebook = notebookStudioEngine.createNotebook(
      BATES_MATTER.id,
      'Horizon Investigation',
      'Discrepancy review',
      BATES_DOCUMENTS
    );

    // 1. Executive Summary
    const summaryNote = notebookStudioEngine.generateTransformation(
      notebook,
      'summary',
      BATES_DOCUMENTS,
      BATES_CLAIMS,
      BATES_AUTHORITIES
    );
    expect(summaryNote.title).toContain('Executive Case Brief');
    expect(summaryNote.citations.length).toBeGreaterThan(0);
    expect(summaryNote.content).toContain('Civil Evidence Act 1995 s.9');

    // 2. Chronology with 4-timestamp provenance
    const chronoNote = notebookStudioEngine.generateTransformation(
      notebook,
      'chronology',
      BATES_DOCUMENTS,
      BATES_CLAIMS,
      BATES_AUTHORITIES
    );
    expect(chronoNote.title).toContain('Chronology');
    expect(chronoNote.content).toContain('4-Timestamp Provenance: Active');

    // 3. Adversarial Vulnerability Memo
    const vulnNote = notebookStudioEngine.generateTransformation(
      notebook,
      'vulnerabilities',
      BATES_DOCUMENTS,
      BATES_CLAIMS,
      BATES_AUTHORITIES
    );
    expect(vulnNote.title).toContain('Adversarial Vulnerability');
    expect(vulnNote.content).toContain('Anticipated Opponent Attack Vectors');

    // 4. Key Entities
    const entityNote = notebookStudioEngine.generateTransformation(
      notebook,
      'study_guide',
      BATES_DOCUMENTS,
      BATES_CLAIMS,
      BATES_AUTHORITIES
    );
    expect(entityNote.title).toContain('Key Entities');

    // 5. Deposition / Examination FAQ
    const faqNote = notebookStudioEngine.generateTransformation(
      notebook,
      'faq',
      BATES_DOCUMENTS,
      BATES_CLAIMS,
      BATES_AUTHORITIES
    );
    expect(faqNote.title).toContain('Witness Examination');
  });

  it('generates a 4-speaker judicial dialectic oral argument podcast with Latin phonetics & SRA billing', () => {
    const notebook = notebookStudioEngine.createNotebook(
      BATES_MATTER.id,
      'Bates Post Office Moot',
      'Oral argument prep',
      BATES_DOCUMENTS
    );

    const podcast = notebookStudioEngine.generateAudioOverview(
      notebook,
      BATES_DOCUMENTS,
      BATES_AUTHORITIES,
      'judicial_dialectic'
    );

    expect(podcast.id).toBeDefined();
    expect(podcast.speakers.length).toBe(4);
    expect(podcast.speakers.map(s => s.role)).toContain('judge');
    expect(podcast.speakers.map(s => s.role)).toContain('claimant_kc');
    expect(podcast.speakers.map(s => s.role)).toContain('respondent_kc');
    expect(podcast.speakers.map(s => s.role)).toContain('assessor');

    expect(podcast.turns.length).toBeGreaterThanOrEqual(4);
    expect(podcast.totalDurationSeconds).toBeGreaterThan(30);
    expect(podcast.billingUnits6Min).toBeGreaterThanOrEqual(1);

    // Check Latin terms used
    const latinTermsUsed = podcast.turns.flatMap(t => t.latinGlossaryUsed || []);
    expect(latinTermsUsed.length).toBeGreaterThan(0);
    expect(latinTermsUsed).toContain('prima facie');

    // Check stage directions
    expect(podcast.turns[0].stageDirection).toBeDefined();
  });

  it('exports full notebook with notes, citations, and podcast transcript to Obsidian Markdown format', () => {
    const notebook = notebookStudioEngine.createNotebook(
      BATES_MATTER.id,
      'Horizon Discovery Vault',
      'Vault for court',
      BATES_DOCUMENTS
    );

    const note = notebookStudioEngine.generateTransformation(
      notebook,
      'summary',
      BATES_DOCUMENTS,
      BATES_CLAIMS,
      BATES_AUTHORITIES
    );
    notebook.notes.push(note);

    const podcast = notebookStudioEngine.generateAudioOverview(
      notebook,
      BATES_DOCUMENTS,
      BATES_AUTHORITIES
    );
    notebook.podcasts.push(podcast);

    const markdown = notebookStudioEngine.exportNotebookToMarkdown(notebook, BATES_DOCUMENTS);

    expect(markdown).toContain('---');
    expect(markdown).toContain('generator: "Proofline Sovereign Notebook Studio"');
    expect(markdown).toContain('[[Documents/');
    expect(markdown).toContain('Executive Case Brief');
    expect(markdown).toContain('Audio Overviews & Judicial Dialectics');
    expect(markdown).toContain('Judge Vance DBE');
  });
});
