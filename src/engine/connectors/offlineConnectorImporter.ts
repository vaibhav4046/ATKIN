import { MatterAnalyzer, type IngestionAnalysisResult } from '../ingestion/matterAnalyzer.ts';
import type { Claim } from '../../types/index.ts';

export interface ConnectorImportPayload {
  sourceType: 'gmail_eml' | 'slack_json' | 'linear_export';
  filename: string;
  rawContent: string;
}

export class OfflineConnectorImporter {
  private analyzer: MatterAnalyzer;

  constructor() {
    this.analyzer = new MatterAnalyzer();
  }

  /**
   * Parses an EML or MBOX email text dump into structured legal disclosure text.
   */
  public parseEmailThread(rawEml: string): { formattedText: string; subject: string; date: string } {
    const lines = rawEml.split(/\r?\n/);
    let from = 'Unknown Sender';
    let to = 'Unknown Recipient';
    let subject = 'Email Correspondence';
    let date = new Date().toISOString().split('T')[0];
    let bodyStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().startsWith('from:')) {
        from = line.substring(5).trim();
      } else if (line.toLowerCase().startsWith('to:')) {
        to = line.substring(3).trim();
      } else if (line.toLowerCase().startsWith('subject:')) {
        subject = line.substring(8).trim();
      } else if (line.toLowerCase().startsWith('date:')) {
        const parsedDate = new Date(line.substring(5).trim());
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
        }
      } else if (line.trim() === '' && bodyStartIndex === -1) {
        bodyStartIndex = i + 1;
        break;
      }
    }

    const bodyText = bodyStartIndex !== -1 ? lines.slice(bodyStartIndex).join('\n').trim() : rawEml;

    const formattedText = `EMAIL CORRESPONDENCE DISCLOSURE RECORD (CPR PART 31 COMPLIANT)
====================================================================
Subject: ${subject}
Date Sent: ${date}
From: ${from}
To: ${to}
Integrity Protocol: Local Offline EML Ingestion

--- MESSAGE BODY ---
${bodyText}
====================================================================`;

    return { formattedText, subject, date };
  }

  /**
   * Parses Slack channel export JSON into a chronological chat disclosure.
   */
  public parseSlackExport(rawJson: string): { formattedText: string; messageCount: number } {
    let messages: Array<{ user?: string; text?: string; ts?: string }> = [];
    try {
      const parsed = JSON.parse(rawJson);
      messages = Array.isArray(parsed) ? parsed : parsed.messages || [];
    } catch {
      // Fallback: parse newline-delimited or plain text
      return {
        formattedText: `SLACK CHANNEL DISCLOSURE\n========================\n${rawJson}`,
        messageCount: 1
      };
    }

    const formattedLines: string[] = [
      'INTERNAL SLACK MESSAGING AUDIT RECORD',
      '=====================================',
      `Total Logged Messages: ${messages.length}`,
      'Evidence Format: Exported Channel JSON',
      '-------------------------------------'
    ];

    messages.forEach((msg, idx) => {
      const timeStr = msg.ts ? new Date(parseFloat(msg.ts) * 1000).toISOString() : `Msg #${idx + 1}`;
      const userStr = msg.user || 'Participant';
      const textStr = msg.text || '';
      formattedLines.push(`[${timeStr}] <${userStr}>: ${textStr}`);
    });

    formattedLines.push('=====================================');
    return {
      formattedText: formattedLines.join('\n'),
      messageCount: messages.length
    };
  }

  /**
   * Parses Linear issue export (JSON or CSV) into an engineering issue ledger.
   */
  public parseLinearExport(rawContent: string): { formattedText: string; issueCount: number } {
    let issues: Array<{ identifier?: string; title?: string; state?: string; description?: string; priority?: string }> = [];
    
    try {
      const parsed = JSON.parse(rawContent);
      issues = Array.isArray(parsed) ? parsed : parsed.issues || [];
    } catch {
      // Fallback CSV parsing
      const rows = rawContent.split(/\r?\n/).filter(r => r.trim());
      if (rows.length > 1) {
        issues = rows.slice(1).map((row, idx) => {
          const cols = row.split(',');
          return {
            identifier: cols[0] || `ISSUE-${idx + 1}`,
            title: cols[1] || 'Bug/Task',
            state: cols[2] || 'In Progress',
            description: cols.slice(3).join(', ') || ''
          };
        });
      }
    }

    const formattedLines: string[] = [
      'LINEAR DEFECT & ENGINEERING ISSUE DISCLOSURE',
      '=============================================',
      `Total Tracked Issues: ${issues.length}`,
      '---------------------------------------------'
    ];

    issues.forEach(iss => {
      formattedLines.push(`[${iss.identifier || 'ISSUE'}] ${iss.title || 'Untitled'}`);
      if (iss.state) formattedLines.push(`Status: ${iss.state} | Priority: ${iss.priority || 'Normal'}`);
      if (iss.description) formattedLines.push(`Description: ${iss.description}`);
      formattedLines.push('');
    });

    formattedLines.push('=============================================');
    return {
      formattedText: formattedLines.join('\n'),
      issueCount: issues.length
    };
  }

  /**
   * Ingests any supported connector payload directly into a matter.
   */
  public async ingestConnectorPayload(params: {
    matterId: string;
    payload: ConnectorImportPayload;
    existingClaims?: Claim[];
  }): Promise<IngestionAnalysisResult> {
    const { matterId, payload, existingClaims = [] } = params;
    let textToAnalyze = payload.rawContent;
    let sourceDate: string | null = null;
    let privacyLabel = 'Connector Local Offline Import';

    if (payload.sourceType === 'gmail_eml') {
      const parsed = this.parseEmailThread(payload.rawContent);
      textToAnalyze = parsed.formattedText;
      sourceDate = parsed.date;
      privacyLabel = 'Gmail/EML Sovereign Import';
    } else if (payload.sourceType === 'slack_json') {
      const parsed = this.parseSlackExport(payload.rawContent);
      textToAnalyze = parsed.formattedText;
      privacyLabel = 'Slack Channel JSON Sovereign Import';
    } else if (payload.sourceType === 'linear_export') {
      const parsed = this.parseLinearExport(payload.rawContent);
      textToAnalyze = parsed.formattedText;
      privacyLabel = 'Linear Defect Ledger Sovereign Import';
    }

    return await this.analyzer.analyzeDocument({
      matterId,
      filename: payload.filename,
      text: textToAnalyze,
      mime: payload.sourceType === 'gmail_eml' ? 'message/rfc822' : 'application/json',
      sourceDate,
      privacyLabel,
      existingClaims
    });
  }
}

export const offlineConnectorImporter = new OfflineConnectorImporter();
