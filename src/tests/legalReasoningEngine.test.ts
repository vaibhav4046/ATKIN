import { describe, it, expect } from 'vitest';
import { LegalReasoningEngine } from '../engine/reasoning/legalReasoningEngine.ts';
import { 
  BATES_MATTER, 
  BATES_DOCUMENTS as BATES_DOCS, 
  BATES_SPANS, 
  BATES_CLAIMS, 
  BATES_AUTHORITIES, 
  BATES_REVIEWS as BATES_REVIEW_ITEMS 
} from '../db/fixtures/batesPostOfficeMatter.ts';

describe('LegalReasoningEngine — Sovereign IRAC Legal Reasoning', () => {
  const engine = new LegalReasoningEngine();

  it('performs 5-stage IRAC analysis on Bates v Post Office Horizon defect', () => {
    const output = engine.reason({
      query: 'Audit Fujitsu Problem Report PIN-188 and Post Office Clause 12 under UCTA 1977 s.3 and s.11 reasonableness',
      matterId: BATES_MATTER.id,
      matterTitle: BATES_MATTER.title,
      matterJurisdiction: BATES_MATTER.jurisdiction,
      documents: BATES_DOCS,
      spans: BATES_SPANS,
      claims: BATES_CLAIMS,
      authorities: BATES_AUTHORITIES,
      reviewItems: BATES_REVIEW_ITEMS,
      memories: []
    });

    expect(output).toBeDefined();
    expect(output.formattedResponse).toContain('Contractual Clause & Risk Audit');
    expect(output.formattedResponse).toContain('Clause Extraction & Risk Matrix');
    expect(output.formattedResponse).toContain('Playbook Deviation & Enforceability');
    expect(output.formattedResponse).toContain('Negotiation Strategy & Redlines');

    // Verify statutory grounding
    expect(output.formattedResponse).toMatch(/UCTA|Unfair Contract Terms Act|1977/i);

    // Verify reasoning steps generated for auditability
    expect(output.reasoningSteps.length).toBeGreaterThanOrEqual(4);
    expect(output.reasoningSteps[0].step).toBe(1);
    expect(output.reasoningSteps[0].agentName).toBe('Matter Evidence Retriever');
    expect(output.reasoningSteps[1].step).toBe(2);
    expect(output.reasoningSteps[2].step).toBe(3);
    expect(output.reasoningSteps[2].agentName).toBe('Statutory & Precedent Reasoner');

    // Verify confidence score
    expect(output.confidenceScore).toBeGreaterThanOrEqual(0.7);
    expect(output.sourcesUsed.length).toBeGreaterThan(0);
  });

  it('detects adverse contradictions when analyzing witness credibility and error logs', () => {
    const output = engine.reason({
      query: 'Evaluate contradiction between witness statements and Fujitsu remote access and error log suppression',
      matterId: BATES_MATTER.id,
      matterTitle: BATES_MATTER.title,
      matterJurisdiction: BATES_MATTER.jurisdiction,
      documents: BATES_DOCS,
      spans: BATES_SPANS,
      claims: BATES_CLAIMS,
      authorities: BATES_AUTHORITIES,
      reviewItems: BATES_REVIEW_ITEMS,
      memories: []
    });

    expect(output.formattedResponse).toContain('Contradiction');
  });

  it('recommends procedural court calendar action when deadline keywords appear in query', () => {
    const output = engine.reason({
      query: 'What is the CPR deadline to file the letter of claim and response under Practice Direction?',
      matterId: BATES_MATTER.id,
      matterTitle: BATES_MATTER.title,
      matterJurisdiction: BATES_MATTER.jurisdiction,
      documents: BATES_DOCS,
      spans: BATES_SPANS,
      claims: BATES_CLAIMS,
      authorities: BATES_AUTHORITIES,
      reviewItems: BATES_REVIEW_ITEMS,
      memories: []
    });

    expect(output.suggestedAction).toBeDefined();
    expect(output.suggestedAction?.type).toBe('add_calendar');
  });

  it('recommends insert_draft action when user asks to draft legal submission', () => {
    const output = engine.reason({
      query: 'Draft a compliant Pre-Action Letter of Claim pursuant to CPR Practice Direction Annex B',
      matterId: BATES_MATTER.id,
      matterTitle: BATES_MATTER.title,
      matterJurisdiction: BATES_MATTER.jurisdiction,
      documents: BATES_DOCS,
      spans: BATES_SPANS,
      claims: BATES_CLAIMS,
      authorities: BATES_AUTHORITIES,
      reviewItems: BATES_REVIEW_ITEMS,
      memories: []
    });

    expect(output.suggestedAction).toBeDefined();
    expect(output.suggestedAction?.type).toBe('insert_draft');
  });
});
