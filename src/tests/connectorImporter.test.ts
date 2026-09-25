import { describe, it, expect } from 'vitest';
import { offlineConnectorImporter } from '../engine/connectors/offlineConnectorImporter.ts';

describe('Offline Connector Importer Suite (Gmail, Slack, Linear)', () => {
  it('parses and ingests an EML email thread with extracted spans and claims', async () => {
    const rawEml = `From: legal@subpostmasters.org.uk
To: solicitor@proofline.internal
Date: Mon, 14 Apr 2026 11:20:00 +0100
Subject: Horizon PIN-188 Bug Confirmation

Dear Solicitor,
Following our telephone conference, please find confirmed that Fujitsu internal bug ticket PIN-188 resulted in automatic balance discrepancy additions of £4,200 to branch accounts during transaction rollbacks.
Yours sincerely,
Alan Bates`;

    const result = await offlineConnectorImporter.ingestConnectorPayload({
      matterId: 'matter-connector-test',
      payload: {
        sourceType: 'gmail_eml',
        filename: 'Horizon_PIN188_Confirmation.eml',
        rawContent: rawEml
      }
    });

    expect(result.document.filename).toBe('Horizon_PIN188_Confirmation.eml');
    expect(result.document.text).toContain('EMAIL CORRESPONDENCE DISCLOSURE RECORD');
    expect(result.document.text).toContain('PIN-188');
    expect(result.spans.length).toBeGreaterThan(0);
    expect(result.document.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('parses and ingests Slack channel JSON export', async () => {
    const rawSlackJson = JSON.stringify([
      {
        user: 'U01_DEV_LEAD',
        text: 'Deploying Horizon branch release v3.4. Rollback mechanism failed in test environment.',
        ts: '1776164400.000100'
      },
      {
        user: 'U02_QA_AUDITOR',
        text: 'Do not deploy to production. Discrepancies will corrupt branch cash balances.',
        ts: '1776164520.000200'
      }
    ]);

    const result = await offlineConnectorImporter.ingestConnectorPayload({
      matterId: 'matter-connector-test',
      payload: {
        sourceType: 'slack_json',
        filename: 'slack_horizon_release_channel.json',
        rawContent: rawSlackJson
      }
    });

    expect(result.document.filename).toBe('slack_horizon_release_channel.json');
    expect(result.document.text).toContain('INTERNAL SLACK MESSAGING AUDIT RECORD');
    expect(result.document.text).toContain('U01_DEV_LEAD');
    expect(result.spans.length).toBeGreaterThan(0);
  });

  it('parses and ingests Linear defect export', async () => {
    const rawLinear = JSON.stringify({
      issues: [
        {
          identifier: 'HORIZON-402',
          title: 'Remote terminal balance injection without user authorization',
          state: 'Triaged',
          priority: 'Urgent',
          description: 'Fujitsu second-line engineers can alter subpostmaster ledgers directly.'
        }
      ]
    });

    const result = await offlineConnectorImporter.ingestConnectorPayload({
      matterId: 'matter-connector-test',
      payload: {
        sourceType: 'linear_export',
        filename: 'linear_defects_export.json',
        rawContent: rawLinear
      }
    });

    expect(result.document.filename).toBe('linear_defects_export.json');
    expect(result.document.text).toContain('LINEAR DEFECT & ENGINEERING ISSUE DISCLOSURE');
    expect(result.document.text).toContain('HORIZON-402');
    expect(result.spans.length).toBeGreaterThan(0);
  });
});
