import { describe, it, expect } from 'vitest';
import { ToolRegistry, type ToolContext } from '../engine/protocol/toolRegistry.ts';
import type { Span } from '../types/index.ts';

describe('ToolRegistry — Deterministic Tool Contract & Execution Records', () => {
  const context: ToolContext = {
    matterId: 'matter-001',
    permissions: {
      canExecuteTools: true,
      allowedTools: [
        'clause_retriever',
        'amendment_tracer',
        'deadline_calculator',
        'contradiction_detector',
        'citation_gate'
      ]
    },
    spans: new Map<string, Span>([
      [
        'sp-1',
        {
          id: 'sp-1',
          documentId: 'doc-1',
          startOffset: 0,
          endOffset: 50,
          exactText: 'Clause 3.2: Notice shall be 37 calendar days.',
          checksum: 'chk-1'
        }
      ]
    ])
  };

  it('executes clause_retriever and creates authentic execution record with input/output hashes', async () => {
    const registry = new ToolRegistry();
    const { result, record } = await registry.execute(
      'clause_retriever',
      { query: 'notice termination', targetClauses: ['3.2'] },
      context
    );

    expect((result as any).count).toBe(1);
    expect((result as any).retrievedSpans[0].id).toBe('sp-1');
    expect(record.status).toBe('success');
    expect(record.inputHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record.outputHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record.sourceRefs).toContain('sp-1');
  });

  it('executes amendment_tracer and identifies varied vs unvaried clauses', async () => {
    const registry = new ToolRegistry();
    const { result, record } = await registry.execute(
      'amendment_tracer',
      {
        parentDocumentId: 'doc-msa',
        amendmentDocumentId: 'doc-deed-v2',
        parentClauses: [
          { clauseId: 'p-1', clauseNumber: '2.1', text: 'Implementation fee is £18,420.' },
          { clauseId: 'p-2', clauseNumber: '3.2', text: 'Notice is 37 days.' }
        ],
        amendmentClauses: [
          { clauseId: 'a-1', clauseNumber: '2.1', text: 'Revised fee is £17,900.' }
        ]
      },
      context
    );

    const res = result as any;
    expect(res.tracedClauses.length).toBe(2);
    const varied = res.tracedClauses.find((c: any) => c.clauseNumber === '2.1');
    const unvaried = res.tracedClauses.find((c: any) => c.clauseNumber === '3.2');

    expect(varied?.status).toBe('varied');
    expect(varied?.effectiveText).toContain('£17,900');
    expect(unvaried?.status).toBe('unvaried');
    expect(record.status).toBe('success');
  });

  it('executes deadline_calculator using embedded CPR 2.8 TimeRuleEngine', async () => {
    const registry = new ToolRegistry();
    const { result, record } = await registry.execute(
      'deadline_calculator',
      {
        ruleSet: 'CPR_2_8',
        startDate: '2026-10-02',
        numberOfDays: 14,
        direction: 'after',
        endDefinedByEvent: false,
        actAtCourtOffice: false
      },
      context
    );

    expect((result as any).resultDate).toBe('2026-10-16');
    expect(record.status).toBe('success');
    expect(record.sourceRefs).toContain('CPR_2_8');
  });

  it('executes contradiction_detector and flags numerical discrepancies', async () => {
    const registry = new ToolRegistry();
    const { result, record } = await registry.execute(
      'contradiction_detector',
      {
        statements: [
          { id: 'stmt-1', text: 'Master Services Agreement Clause 2.1 price is £18,420.' },
          { id: 'stmt-2', text: 'Invoice #1042 requests immediate payment of £17,900.' }
        ]
      },
      context
    );

    const res = result as any;
    expect(res.contradictions.length).toBe(1);
    expect(res.contradictions[0].type).toBe('numerical');
    expect(res.contradictions[0].explanation).toContain('Price discrepancy detected');
    expect(record.status).toBe('success');
  });

  it('enforces permission gate and blocks unauthorized tool calls', async () => {
    const registry = new ToolRegistry();
    const restrictedContext: ToolContext = {
      matterId: 'matter-001',
      permissions: {
        canExecuteTools: false
      }
    };

    await expect(
      registry.execute('clause_retriever', { query: 'test' }, restrictedContext)
    ).rejects.toThrow('Permission denied');

    const history = registry.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].status).toBe('permission_denied');
  });
});
