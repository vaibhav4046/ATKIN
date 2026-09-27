import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  Copy, 
  Check, 
  ShieldAlert,
  Info,
  Plus,
  AlertCircle,
  X,
  FileCheck,
  Binary
} from 'lucide-react';
import type { Document, Span, Claim } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { DocumentSkeletonLoader } from '../common/Skeleton.tsx';
import { checkPromptInjectionRisk } from '../../engine/verifier.ts';
import { matterAnalyzer, type IngestionAnalysisResult } from '../../engine/ingestion/matterAnalyzer.ts';
import { offlineConnectorImporter } from '../../engine/connectors/offlineConnectorImporter.ts';

interface SourcesTabProps {
  documents: Document[];
  spans: Span[];
  selectedSpan: Span | null;
  onSelectSpan: (span: Span | null) => void;
  onAddDocument: (doc: Document) => void;
  onIngestAnalysis?: (result: IngestionAnalysisResult) => void;
  existingClaims?: Claim[];
  matterId?: string;
}

export const SourcesTab: React.FC<SourcesTabProps> = ({
  documents,
  spans,
  selectedSpan,
  onSelectSpan,
  onAddDocument,
  onIngestAnalysis,
  existingClaims = [],
  matterId = 'matter-active'
}) => {
  const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Ingestion Modal State
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [ingestFilename, setIngestFilename] = useState('');
  const [ingestDate, setIngestDate] = useState(new Date().toISOString().slice(0, 10));
  const [ingestText, setIngestText] = useState('');
  const [ingestPrivacy, setIngestPrivacy] = useState('Strict Solicitor-Client Privilege');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
  const docSpans = spans.filter(s => s.documentId === activeDoc?.id);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExecuteIngestion = async (rawText: string, filename: string, sourceDate?: string) => {
    if (!rawText.trim() || !filename.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStatus('Computing WebCrypto SHA-256 hash...');

    await new Promise(r => setTimeout(r, 200));
    setAnalysisStatus('Segmenting character spans & verifying byte offsets...');

    await new Promise(r => setTimeout(r, 200));
    setAnalysisStatus('Mining factual assertions and legal propositions...');

    let result: IngestionAnalysisResult;
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.eml') || lowerName.endsWith('.mbox')) {
      result = await offlineConnectorImporter.ingestConnectorPayload({
        matterId,
        payload: {
          sourceType: 'gmail_eml',
          filename,
          rawContent: rawText
        },
        existingClaims
      });
    } else if (lowerName.endsWith('.json') && (lowerName.includes('slack') || rawText.includes('"ts"'))) {
      result = await offlineConnectorImporter.ingestConnectorPayload({
        matterId,
        payload: {
          sourceType: 'slack_json',
          filename,
          rawContent: rawText
        },
        existingClaims
      });
    } else if (lowerName.includes('linear') || rawText.includes('LINEAR')) {
      result = await offlineConnectorImporter.ingestConnectorPayload({
        matterId,
        payload: {
          sourceType: 'linear_export',
          filename,
          rawContent: rawText
        },
        existingClaims
      });
    } else {
      result = await matterAnalyzer.analyzeDocument({
        matterId,
        filename,
        text: rawText,
        sourceDate: sourceDate || ingestDate,
        privacyLabel: ingestPrivacy,
        existingClaims
      });
    }

    setAnalysisStatus(`Extracted ${result.spans.length} spans, ${result.claims.length} claims, ${result.reviewItems.length} contradictions!`);
    await new Promise(r => setTimeout(r, 300));

    if (onIngestAnalysis) {
      onIngestAnalysis(result);
    } else {
      onAddDocument(result.document);
    }

    setActiveDocId(result.document.id);
    setIsAnalyzing(false);
    setIsIngestModalOpen(false);
    setIngestText('');
    setIngestFilename('');
  };

  const handleLoadSampleRealFiling = (type: 'horizon' | 'contract' | 'email' | 'slack' | 'linear') => {
    if (type === 'horizon') {
      setIngestFilename('FUJITSU_HORIZON_PIN188_BUG_REPORT.txt');
      setIngestDate('2000-11-14');
      setIngestText(`FUJITSU SERVICES - HORIZON EPOS SOFTWARE PROBLEM REPORT
Ref: PIN-188 / PEAK Bug Call 188
Date: 14 November 2000
Product: Horizon Post Office Terminal Software v1.2.4

Incident Description:
Branch reported discrepancy of £4,180.20 appearing on counter balancing screen following communications dropout during weekly rollover.
Investigation:
Fujitsu software engineering review confirms Bug 188. When network packets are interrupted during balance roll, the local database initiates auto-balancing transactions without terminal user initiation.
Technical Action:
Bracknell engineering team performed remote database balancing patch directly on branch node.
Note: Post Office management advised of discrepancy.`);
    } else if (type === 'email') {
      setIngestFilename('Gmail_Thread_PostOffice_Escalation.eml');
      setIngestDate('2026-04-14');
      setIngestText(`From: alistair.powell@postoffice.co.uk
To: alan.bates@subpostmasters.org.uk
Date: Tue, 14 Apr 2026 14:15:00 +0100
Subject: Horizon Balancing Discrepancies - Audit Response

Dear Mr Bates,
In response to your query regarding the £4,200 branch account adjustment on terminal 2:
Post Office Limited maintains that Horizon records are legally presumed reliable under the Police and Criminal Evidence Act 1984 s.69.
However, we acknowledge receipt of your notice regarding Fujitsu third-party support ticket PIN-188.
We require all documentation to be submitted through formal CPR 31 disclosure channels.
Regards,
Alistair Powell
Legal & Governance Department, Post Office Limited`);
    } else if (type === 'slack') {
      setIngestFilename('slack_dev_channel_horizon_audit.json');
      setIngestDate('2026-04-15');
      setIngestText(JSON.stringify([
        {
          user: 'Gareth_Jenkins_Architect',
          text: 'The rollback routine in v1.2.4 does not reverse database ledger lines if connection fails mid-stream.',
          ts: '1776250800.000100'
        },
        {
          user: 'Bracknell_Support_Lead',
          text: 'Understood. We manually injected debit correction lines into 47 branch accounts from headquarters yesterday.',
          ts: '1776251400.000200'
        }
      ], null, 2));
    } else if (type === 'linear') {
      setIngestFilename('linear_defects_export.json');
      setIngestDate('2026-04-16');
      setIngestText(JSON.stringify({
        issues: [
          {
            identifier: 'PIN-188',
            title: 'Automatic ledger debit on interrupted batch rollover',
            state: 'Confirmed Defect',
            priority: 'Critical',
            description: 'Database transaction commits without subpostmaster authorization during comms dropout.'
          }
        ]
      }, null, 2));
    } else {
      setIngestFilename('SaaS_Customer_Data_Protection_Rider.txt');
      setIngestDate('2026-03-01');
      setIngestText(`ENTERPRISE SAAS DATA PROTECTION & INDEMNITY RIDER
Section 8: Indemnification Obligations.
Customer warrants that all data transmitted to Provider shall be obtained with valid statutory consent under GDPR Article 6.
Customer agrees to defend and indemnify Provider against any and all regulatory fines or civil damages arising from alleged data privacy violations.
Provider warrants that system uptime shall be 99.9% excluding planned maintenance.`);
    }
  };

  const hasInjection = activeDoc ? checkPromptInjectionRisk(activeDoc.text) : false;

  return (
    // Stacks on mobile. Three side-by-side panels (a 300px document list, the
    // reader, and the inspector) cannot fit a 390px screen, and the inspector
    // cannot be position:fixed here because a transformed framer-motion ancestor
    // becomes its containing block, which put it in the wrong place entirely.
    // Normal flow is both simpler and immune to that.
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] border border-border-hairline rounded-[6px] overflow-hidden bg-white shadow-card">
      {/* Left Document List Panel */}
      <div className="w-full lg:w-[300px] max-h-[30vh] lg:max-h-none border-b lg:border-b-0 lg:border-r border-border-hairline flex flex-col justify-between bg-canvas-subtle shrink-0">
        <div className="p-3 border-b border-border-hairline flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-atkin-ink" />
            <span className="text-[12.5px] font-semibold text-ink">Matter Documents ({documents.length})</span>
          </div>
          
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="px-2.5 py-1 bg-atkin-ink text-white rounded-[3px] text-[11px] font-medium hover:bg-blue-700 flex items-center gap-1 transition-colors shadow-subtle"
          >
            <Plus className="w-3 h-3" />
            <span>Ingest File</span>
          </button>
        </div>

        {/* Scrollable Doc List */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {documents.map((doc) => {
            const isSelected = doc.id === activeDoc?.id;
            const spanCount = spans.filter(s => s.documentId === doc.id).length;
            const docHasInj = checkPromptInjectionRisk(doc.text);

            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`w-full text-left p-2.5 rounded-[4px] transition-colors border ${
                  isSelected
                    ? 'bg-white border-border-hairline shadow-subtle'
                    : 'border-transparent hover:bg-white/70 text-ink-slate'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="text-[12px] font-medium text-ink truncate max-w-[190px] font-mono">
                    {doc.filename}
                  </div>
                  {docHasInj && (
                    <span title="Contains adversarial injection text (quarantined inert)">
                      <ShieldAlert className="w-3.5 h-3.5 text-atkin-warning shrink-0" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10.5px] text-ink-steel mt-1 font-mono">
                  <span>{doc.sourceDate || 'N/A'}</span>
                  <span>&bull;</span>
                  <span>{spanCount} {spanCount === 1 ? 'span' : 'spans'}</span>
                </div>

                <div className="text-[10px] text-ink-steel/70 font-mono mt-0.5 truncate">
                  SHA: {doc.sha256.slice(0, 14)}...
                </div>
              </button>
            );
          })}
        </div>

        {/* Local Sovereignty Indicator */}
        <div className="p-2.5 border-t border-border-hairline bg-white text-[10.5px] text-ink-steel flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-atkin-success shrink-0" />
          <span>Local IndexedDB · No Cloud Uploads</span>
        </div>
      </div>

      {/* Right Document Text Viewer */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
        {isAnalyzing ? (
          <DocumentSkeletonLoader />
        ) : activeDoc ? (
          <>
            {/* Viewer Header */}
            <div className="px-5 py-3 border-b border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-canvas-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-ink font-mono">
                    {activeDoc.filename}
                  </h3>
                  <Badge variant="slate" size="sm">
                    {activeDoc.mime}
                  </Badge>
                  {hasInjection && (
                    <Badge variant="ochre" size="sm" icon={<ShieldAlert className="w-3 h-3" />}>
                      Adversarial Test Quarantined
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-ink-slate font-mono mt-0.5">
                  <span>Source Date: <strong>{activeDoc.sourceDate || 'Unspecified'}</strong></span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    SHA-256: {activeDoc.sha256.slice(0, 16)}...
                    <button
                      onClick={() => handleCopyHash(activeDoc.sha256)}
                      className="hover:text-ink text-ink-steel transition-colors"
                      title="Copy full SHA-256 hash"
                    >
                      {copiedHash === activeDoc.sha256 ? (
                        <Check className="w-3 h-3 text-atkin-success inline" />
                      ) : (
                        <Copy className="w-3 h-3 inline" />
                      )}
                    </button>
                  </span>
                </div>
              </div>

              {/* In-doc search */}
              <div className="relative w-full sm:w-[220px]">
                <Search className="w-3.5 h-3.5 text-ink-steel absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-[11.5px] bg-white border border-border-hairline rounded-[4px] pl-8 pr-3 py-1 text-ink focus-visible:outline-none focus:border-atkin-ink"
                />
              </div>
            </div>

            {/* Document Content with Exact Spans */}
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[12.5px] leading-relaxed text-ink selection:bg-blue-100 whitespace-pre-wrap">
              {renderHighlightedDocText(activeDoc.text, docSpans, selectedSpan, onSelectSpan, searchQuery)}
            </div>

            {/* Viewer Footer Bar */}
            <div className="px-5 py-2.5 border-t border-border-hairline bg-canvas-subtle flex items-center justify-between text-[11px] text-ink-steel font-mono">
              <div>
                Click highlighted text to inspect byte coordinates and verify SHA-256 integrity.
              </div>
              <div className="text-atkin-success font-medium">
                {docSpans.length} verified evidential spans indexed
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-ink-slate space-y-3">
            <FileText className="w-8 h-8 text-ink-steel" />
            <p className="text-[14px] font-semibold text-ink">No Documents in Matter</p>
            <p className="text-[12px] max-w-[360px]">
              Ingest a court pleading, contract, or witness statement to automatically extract byte-accurate spans, facts, and contradictions.
            </p>
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="px-3.5 py-1.5 bg-atkin-ink text-white rounded-[4px] text-[12px] font-medium hover:bg-blue-700 shadow-subtle flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Document Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Ingestion & Evidential Analysis Modal */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 w-full max-w-[620px] shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-atkin-ink" />
                <div>
                  <h3 className="text-[14px] font-semibold text-ink">
                    Sovereign Evidential Document Ingestion
                  </h3>
                  <p className="text-[11px] text-ink-slate">
                    Computes SHA-256 hash, extracts sentence spans, and identifies cross-document contradictions.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsIngestModalOpen(false)}
                className="text-ink-steel hover:text-ink p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Real Test Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-ink-steel font-medium">Quick Exhibit:</span>
              <button
                type="button"
                onClick={() => handleLoadSampleRealFiling('horizon')}
                className="px-2 py-0.5 rounded-[3px] bg-canvas-subtle hover:bg-slate-200 border border-border-hairline text-ink font-mono"
              >
                Horizon Bug (PIN-188)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleRealFiling('email')}
                className="px-2 py-0.5 rounded-[3px] bg-canvas-subtle hover:bg-slate-200 border border-border-hairline text-ink font-mono"
              >
                Gmail / EML Thread
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleRealFiling('slack')}
                className="px-2 py-0.5 rounded-[3px] bg-canvas-subtle hover:bg-slate-200 border border-border-hairline text-ink font-mono"
              >
                Slack Chat (JSON)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleRealFiling('linear')}
                className="px-2 py-0.5 rounded-[3px] bg-canvas-subtle hover:bg-slate-200 border border-border-hairline text-ink font-mono"
              >
                Linear Issues (JSON)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleRealFiling('contract')}
                className="px-2 py-0.5 rounded-[3px] bg-canvas-subtle hover:bg-slate-200 border border-border-hairline text-ink font-mono"
              >
                SaaS Rider
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-semibold text-ink-steel uppercase tracking-wider mb-1 font-mono">
                    Document Filename
                  </label>
                  <input
                    type="text"
                    value={ingestFilename}
                    onChange={(e) => setIngestFilename(e.target.value)}
                    placeholder="e.g. Witness_Statement_Bates.txt"
                    className="w-full text-[12px] bg-canvas-subtle border border-border-hairline rounded-[4px] px-3 py-1.5 text-ink focus-visible:outline-none focus:border-atkin-ink font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-semibold text-ink-steel uppercase tracking-wider mb-1 font-mono">
                    Document Date
                  </label>
                  <input
                    type="date"
                    value={ingestDate}
                    onChange={(e) => setIngestDate(e.target.value)}
                    className="w-full text-[12px] bg-canvas-subtle border border-border-hairline rounded-[4px] px-3 py-1.5 text-ink focus-visible:outline-none focus:border-atkin-ink font-mono"
                  />
                </div>
              </div>

              {/* Local File Picker */}
              <div className="flex items-center gap-2 p-2.5 bg-canvas-subtle border border-dashed border-border-hairline rounded-[4px]">
                <Upload className="w-4 h-4 text-atkin-ink shrink-0" />
                <label className="text-[11.5px] text-ink-steel cursor-pointer flex-1 flex items-center justify-between">
                  <span>
                    <strong className="text-atkin-ink hover:underline">Choose local file from disk</strong> (.txt, .md, .json, .eml, .csv, .log)
                  </span>
                  <span className="text-[10px] text-ink-muted uppercase font-mono">Client-Side</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.eml,.csv,.log,.text"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIngestFilename(file.name);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          if (content) setIngestText(content);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-ink-steel uppercase tracking-wider mb-1 font-mono">
                  Document Text Content (Paste or Auto-Filled from File)
                </label>
                <textarea
                  rows={7}
                  value={ingestText}
                  onChange={(e) => setIngestText(e.target.value)}
                  placeholder="Paste raw contract clauses, witness statements, court judgment extracts, or audit logs..."
                  className="w-full text-[12px] bg-canvas-subtle border border-border-hairline rounded-[4px] p-3 text-ink focus-visible:outline-none focus:border-atkin-ink font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-ink-steel uppercase tracking-wider mb-1 font-mono">
                  Confidentiality &amp; Privilege Classification
                </label>
                <input
                  type="text"
                  value={ingestPrivacy}
                  onChange={(e) => setIngestPrivacy(e.target.value)}
                  className="w-full text-[12px] bg-canvas-subtle border border-border-hairline rounded-[4px] px-3 py-1.5 text-ink focus-visible:outline-none focus:border-atkin-ink"
                />
              </div>
            </div>

            {/* Analysis Progress status */}
            {isAnalyzing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-[4px] flex items-center gap-2 text-[12px] text-blue-900 animate-pulse font-mono">
                <Binary className="w-4 h-4 text-atkin-ink" />
                <span>{analysisStatus}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-hairline">
              <button
                type="button"
                onClick={() => setIsIngestModalOpen(false)}
                className="px-3 py-1.5 text-[12px] text-ink-slate hover:text-ink font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAnalyzing || !ingestFilename.trim() || !ingestText.trim()}
                onClick={() => handleExecuteIngestion(ingestText, ingestFilename, ingestDate)}
                className="px-4 py-1.5 bg-atkin-ink text-white rounded-[4px] text-[12px] font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-subtle flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Execute Ingestion'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function renderHighlightedDocText(
  fullText: string,
  spans: Span[],
  selectedSpan: Span | null,
  onSelectSpan: (span: Span | null) => void,
  searchQuery: string
) {
  if (spans.length === 0 && !searchQuery) {
    return fullText;
  }

  const sortedSpans = [...spans].sort((a, b) => a.startOffset - b.startOffset);
  const elements: React.ReactNode[] = [];
  let currentIndex = 0;

  sortedSpans.forEach((span) => {
    if (span.startOffset > currentIndex) {
      elements.push(fullText.slice(currentIndex, span.startOffset));
    }

    const isSelected = selectedSpan?.id === span.id;
    const isInjection = checkPromptInjectionRisk(span.exactText);

    elements.push(
      <mark
        key={span.id}
        onClick={() => onSelectSpan(span)}
        className={`cursor-pointer transition-colors px-1 py-0.5 rounded-[2px] font-mono ${
          isSelected
            ? 'bg-atkin-ink text-white ring-1 ring-blue-700'
            : isInjection
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
        }`}
        title={`Span: ${span.id} (L${span.lineStart}–L${span.lineEnd})`}
      >
        {fullText.slice(span.startOffset, span.endOffset)}
      </mark>
    );

    currentIndex = Math.max(currentIndex, span.endOffset);
  });

  if (currentIndex < fullText.length) {
    elements.push(fullText.slice(currentIndex));
  }

  return <>{elements}</>;
}
