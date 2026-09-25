import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { BundleExchange } from '../engine/collaboration/bundleExchange.ts';
import { DocxExporter } from '../engine/export/docxExporter.ts';
import { IcsHandler } from '../engine/calendar/icsHandler.ts';
import { NotebookExporter } from '../engine/export/notebookExporter.ts';
import { DictationParser } from '../engine/media/dictationParser.ts';
import { 
  BATES_MATTER, 
  BATES_DOCUMENTS, 
  BATES_SPANS, 
  BATES_CLAIMS, 
  BATES_DRAFT, 
  BATES_REVIEWS 
} from '../db/fixtures/batesPostOfficeMatter.ts';

describe('Generate Physical Synthetic Export Deliverables', () => {
  it('generates real synthetic export files in exports/ directory', async () => {
    const exportsDir = path.resolve(__dirname, '../../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // 1. Markdown Court Brief
    const md = DocxExporter.exportToMarkdown(BATES_DRAFT, BATES_MATTER, BATES_CLAIMS);
    fs.writeFileSync(path.join(exportsDir, 'Bates_v_PostOffice_CourtBrief.md'), md, 'utf-8');

    // 2. Word-Compatible XML Document (.doc)
    const docxHtml = DocxExporter.exportToWordDocument(BATES_DRAFT, BATES_MATTER, BATES_CLAIMS);
    fs.writeFileSync(path.join(exportsDir, 'Bates_v_PostOffice_LegalDraft.doc'), docxHtml, 'utf-8');

    // 3. Encrypted Proofline Bundle
    const plainBundle = await BundleExchange.createPlainBundle({
      matter: BATES_MATTER,
      documents: BATES_DOCUMENTS,
      spans: BATES_SPANS,
      claims: BATES_CLAIMS,
      drafts: [BATES_DRAFT],
      reviews: BATES_REVIEWS,
      memories: []
    });
    const encryptedPkg = await BundleExchange.exportEncryptedPackage(plainBundle, 'SovereignVault2026!');
    fs.writeFileSync(
      path.join(exportsDir, 'Bates_v_PostOffice_EncryptedBundle.proofline'), 
      JSON.stringify(encryptedPkg, null, 2), 
      'utf-8'
    );

    // 4. RFC 5545 Court Calendar (.ics)
    const icsText = IcsHandler.generateIcs([
      {
        id: 'hearing-bates-001',
        matterId: BATES_MATTER.id,
        title: 'High Court Horizon Technical Hearing (Fraser J)',
        description: 'Case management conference and expert evidence directions regarding PIN-188 discrepancy logs.',
        location: 'Rolls Building, Royal Courts of Justice, London',
        startDate: '2026-11-12T10:30:00Z',
        endDate: '2026-11-12T16:30:00Z',
        priority: 'HIGH'
      }
    ]);
    fs.writeFileSync(path.join(exportsDir, 'Bates_v_PostOffice_StatutoryDeadlines.ics'), icsText, 'utf-8');

    // 5. Parsed Dictation Attendance Note
    const rawTranscript = `[00:00:10] [Alan Bates]: Reviewing Post Office internal correspondence regarding Fujitsu Horizon PIN-188.
[00:01:25] [Counsel]: Gareth Jenkins memo confirms remote balance alterations were possible without subpostmaster knowledge.
[00:02:40] [Solicitor]: Action: Draft Application for Third-Party Disclosure against Fujitsu Services Limited under CPR 31.17 by 18 October.`;
    const note = DictationParser.parseToAttendanceNote(BATES_MATTER.id, rawTranscript, 'Conference on Horizon Audit Disclosure');
    fs.writeFileSync(path.join(exportsDir, 'Bates_v_PostOffice_AttendanceNote.txt'), note.formattedNote, 'utf-8');

    // 6. Obsidian Markdown Vault Note
    const obsFiles = NotebookExporter.generateObsidianVault(
      BATES_MATTER,
      BATES_DOCUMENTS,
      BATES_CLAIMS,
      [],
      [],
      [BATES_DRAFT]
    );
    const indexNote = obsFiles.find(f => f.relativePath === 'Index.md')?.content || '# Bates Matter';
    fs.writeFileSync(
      path.join(exportsDir, 'Bates_v_PostOffice_ObsidianNote.md'), 
      indexNote, 
      'utf-8'
    );

    expect(fs.existsSync(path.join(exportsDir, 'Bates_v_PostOffice_CourtBrief.md'))).toBe(true);
    expect(fs.existsSync(path.join(exportsDir, 'Bates_v_PostOffice_LegalDraft.doc'))).toBe(true);
    expect(fs.existsSync(path.join(exportsDir, 'Bates_v_PostOffice_EncryptedBundle.proofline'))).toBe(true);
    expect(fs.existsSync(path.join(exportsDir, 'Bates_v_PostOffice_StatutoryDeadlines.ics'))).toBe(true);
    expect(fs.existsSync(path.join(exportsDir, 'Bates_v_PostOffice_AttendanceNote.txt'))).toBe(true);
    expect(fs.existsSync(path.join(exportsDir, 'Bates_v_PostOffice_ObsidianNote.md'))).toBe(true);
  });
});
