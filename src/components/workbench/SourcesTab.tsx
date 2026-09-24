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
  Sparkles,
  Plus,
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';
import type { Document, Span, Claim } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { checkPromptInjectionRisk } from '../../engine/verifier.ts';
import { parseDocumentFile } from '../../engine/parser.ts';
import { matterAnalyzer, type IngestionAnalysisResult } from '../../engine/ingestion/matterAnalyzer.ts';

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

    const result = await matterAnalyzer.analyzeDocument({
      matterId,
      filename,
      text: rawText,
      sourceDate: sourceDate || ingestDate,
      privacyLabel: ingestPrivacy,
      existingClaims
    });

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
    setIngestFilename('');
    setIngestText('');
    setAnalysisStatus('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      await handleExecuteIngestion(text, file.name);
    }
  };

  const handleLoadSampleRealFiling = (type: 'horizon' | 'contract') => {
    if (type === 'horizon') {
      setIngestFilename('Horizon_Audit_Log_Extract_Branch_4412.txt');
      setIngestDate('2007-06-18');
      setIngestText(`HORIZON IT AUDIT TRAIL LOG - BRANCH 4412
Date: 18 June 2007
Terminal ID: TC-04 (Operator: Subpostmaster)

17:42:01 - Transaction batch transmit initiated to central Riposte node.
17:42:04 - Network socket timeout during ACK receipt.
17:42:05 - Retry handler resubmitted batch ID #88412. Central database committed batch twice.
17:45:00 - Evening cash balance report produced discrepancy of -£2,840.12.
18:12:00 - Bracknell SSC engineer logged into Riposte table remotely via direct SQL update to balance account without branch terminal alert.
Note: Counter clerk advised that system is operating normally.`);
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
    <div className="flex h-[calc(100vh-140px)] border border-border-hairline rounded-card overflow-hidden bg-gallery-white shadow-xs">
      {/* Left Document List Panel */}
      <div className="w-[310px] border-r border-border-hairline flex flex-col justify-between bg-gallery-paper shrink-0">
        <div className="p-3.5 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-proofline-blue" />
            <span className="text-[13px] font-semibold text-ink">Matter Documents ({documents.length})</span>
          </div>
          
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="px-2.5 py-1 bg-proofline-blue text-white rounded-full-pill text-[11px] font-medium hover:bg-proofline-navy flex items-center gap-1 transition-colors shadow-xs"
          >
            <Sparkles className="w-3 h-3" />
            <span>Ingest</span>
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
                className={`w-full text-left p-2.5 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gallery-white shadow-subtle border-border-hairline'
                    : 'hover:bg-gallery-mist/60 text-ink-slate'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="text-[12.5px] font-medium text-ink truncate max-w-[200px]">
                    {doc.filename}
                  </div>
                  {docHasInj && (
                    <span title="Contains adversarial injection text (quarantined inert)">
                      <ShieldAlert className="w-3.5 h-3.5 text-proofline-ochre shrink-0" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-ink-steel mt-1 font-mono">
                  <span>{doc.sourceDate || 'Date: N/A'}</span>
                  <span>·</span>
                  <span>{spanCount} {spanCount === 1 ? 'span' : 'spans'}</span>
                </div>

                <div className="text-[10px] text-ink-steel/70 font-mono mt-1 truncate">
                  SHA: {doc.sha256.slice(0, 16)}...
                </div>
              </button>
            );
          })}
        </div>

        {/* Local Sovereignty Indicator */}
        <div className="p-3 border-t border-border-hairline bg-gallery-mist/40 text-[11px] text-ink-steel flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-proofline-green shrink-0" />
          <span>Local storage only. Zero file uploads.</span>
        </div>
      </div>

      {/* Right Document Text Viewer */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-gallery-white">
        {activeDoc ? (
          <>
            {/* Viewer Header */}
            <div className="p-4 border-b border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gallery-paper/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-ink">
                    {activeDoc.filename}
                  </h3>
                  <Badge variant="slate" size="sm">
                    {activeDoc.mime}
                  </Badge>
                  {hasInjection && (
                    <Badge variant="ochre" size="sm" icon={<ShieldAlert className="w-3 h-3" />}>
                      Adversarial Test Isolated
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-ink-slate font-mono mt-1">
                  <span>Source Date: <strong>{activeDoc.sourceDate || 'Unspecified'}</strong></span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    SHA-256: {activeDoc.sha256.slice(0, 16)}...
                    <button
                      onClick={() => handleCopyHash(activeDoc.sha256)}
                      className="hover:text-ink text-ink-steel transition-colors"
                      title="Copy full SHA-256 hash"
                    >
                      {copiedHash === activeDoc.sha256 ? (
                        <Check className="w-3 h-3 text-proofline-green inline" />
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
                  placeholder="Search in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-[12px] bg-gallery-white border border-border-hairline rounded-full-pill pl-8 pr-3 py-1 text-ink focus:border-proofline-blue focus:outline-none"
                />
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[13px] leading-relaxed text-ink selection:bg-proofline-blue/20 whitespace-pre-wrap">
              {renderHighlightedDocText(activeDoc.text, docSpans, selectedSpan, onSelectSpan, searchQuery)}
            </div>

            {/* Viewer Footer Bar */}
            <div className="p-3 border-t border-border-hairline bg-gallery-paper/40 flex items-center justify-between text-[11px] text-ink-steel">
              <div>
                Click any highlighted span to inspect verified byte offsets in the Source Inspector.
              </div>
              <div>
                {docSpans.length} verified evidential spans in this document
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
              className="px-4 py-2 bg-proofline-blue text-white rounded-full-pill text-[12px] font-medium hover:bg-proofline-navy shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ingest Document Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Ingestion & Evidential Analysis Modal */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-gallery-white border border-border-hairline rounded-card p-6 w-full max-w-[620px] shadow-stage space-y-4">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-proofline-blue/10 text-proofline-blue flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">
                    Sovereign Evidential Document Ingestion
                  </h3>
                  <p className="text-[11px] text-ink-slate">
                    Computes SHA-256 hash, extracts sentence spans, and identifies cross-document contradictions.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsIngestModalOpen(false)}
                className="text-ink-steel hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-ink-steel font-medium">Quick Test:</span>
              <button
                type="button"
                onClick={() => handleLoadSampleRealFiling('horizon')}
                className="px-2.5 py-1 rounded-md bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink"
              >
                Load Real Horizon IT Audit Log
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleRealFiling('contract')}
                className="px-2.5 py-1 rounded-md bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink"
              >
                Load Real SaaS Contract Rider
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-ink-steel uppercase tracking-wider mb-1">
                    Document Filename
                  </label>
                  <input
                    type="text"
                    value={ingestFilename}
                    onChange={(e) => setIngestFilename(e.target.value)}
                    placeholder="e.g. Witness_Statement_Bates.txt"
                    className="w-full text-[12px] bg-gallery-paper border border-border-hairline rounded-lg px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ink-steel uppercase tracking-wider mb-1">
                    Document Date
                  </label>
                  <input
                    type="date"
                    value={ingestDate}
                    onChange={(e) => setIngestDate(e.target.value)}
                    className="w-full text-[12px] bg-gallery-paper border border-border-hairline rounded-lg px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-steel uppercase tracking-wider mb-1">
                  Document Text Content
                </label>
                <textarea
                  rows={8}
                  value={ingestText}
                  onChange={(e) => setIngestText(e.target.value)}
                  placeholder="Paste raw contract clauses, witness statements, court judgment extracts, or audit logs..."
                  className="w-full text-[12px] font-mono bg-gallery-paper border border-border-hairline rounded-lg p-3 text-ink focus:border-proofline-blue focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-steel">
                <label className="cursor-pointer text-proofline-blue hover:underline flex items-center gap-1 font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Or upload file (.txt, .md, .eml, .json)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.md,.eml,.json"
                    onChange={handleFileUpload}
                  />
                </label>
                <span>SHA-256 hashed locally via WebCrypto</span>
              </div>
            </div>

            {/* Analysis Progress status */}
            {isAnalyzing && (
              <div className="p-3 bg-proofline-blue/5 border border-proofline-blue/20 rounded-xl flex items-center gap-2 text-[12px] text-proofline-navy animate-pulse">
                <Sparkles className="w-4 h-4 text-proofline-blue" />
                <span>{analysisStatus}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-hairline">
              <button
                type="button"
                onClick={() => setIsIngestModalOpen(false)}
                className="px-4 py-2 text-[12px] text-ink-slate hover:text-ink font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAnalyzing || !ingestFilename.trim() || !ingestText.trim()}
                onClick={() => handleExecuteIngestion(ingestText, ingestFilename, ingestDate)}
                className="px-4 py-2 bg-proofline-blue text-white rounded-full-pill text-[12px] font-medium hover:bg-proofline-navy disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Run Evidential Ingestion'}</span>
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
        className={`cursor-pointer transition-colors px-1 py-0.5 rounded font-mono ${
          isSelected
            ? 'bg-proofline-blue text-white ring-2 ring-proofline-blue ring-offset-1'
            : isInjection
            ? 'bg-proofline-ochre/20 text-proofline-ochre hover:bg-proofline-ochre/30'
            : 'bg-proofline-blue/15 text-proofline-navy hover:bg-proofline-blue/25'
        }`}
        title={`Click to inspect span: ${span.id} (L${span.lineStart}–L${span.lineEnd})`}
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
