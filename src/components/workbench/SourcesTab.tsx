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
  Info
} from 'lucide-react';
import type { Document, Span } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { checkPromptInjectionRisk } from '../../engine/verifier.ts';
import { parseDocumentFile } from '../../engine/parser.ts';

interface SourcesTabProps {
  documents: Document[];
  spans: Span[];
  selectedSpan: Span | null;
  onSelectSpan: (span: Span | null) => void;
  onAddDocument: (doc: Document) => void;
}

export const SourcesTab: React.FC<SourcesTabProps> = ({
  documents,
  spans,
  selectedSpan,
  onSelectSpan,
  onAddDocument
}) => {
  const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
  const docSpans = spans.filter(s => s.documentId === activeDoc?.id);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      const parsed = await parseDocumentFile({
        name: file.name,
        type: file.type,
        content: text
      });

      const newDoc: Document = {
        id: `doc-${Date.now()}-${i}`,
        matterId: activeDoc?.matterId || 'matter-user',
        filename: parsed.filename,
        mime: parsed.mime,
        sha256: parsed.sha256,
        importedAt: new Date().toISOString(),
        sourceDate: parsed.sourceDate,
        extractionStatus: 'success',
        pageCount: parsed.pageCount,
        text: parsed.text,
        privacyLabel: 'Browser-local only'
      };

      onAddDocument(newDoc);
      setActiveDocId(newDoc.id);
    }
  };

  const hasInjection = activeDoc ? checkPromptInjectionRisk(activeDoc.text) : false;

  return (
    <div className="flex h-[calc(100vh-140px)] border border-border-hairline rounded-card overflow-hidden bg-gallery-white shadow-xs">
      {/* Left Document List Panel */}
      <div className="w-[300px] border-r border-border-hairline flex flex-col justify-between bg-gallery-paper shrink-0">
        <div className="p-3.5 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-proofline-blue" />
            <span className="text-[13px] font-semibold text-ink">Matter Documents</span>
          </div>
          <label className="cursor-pointer text-[11px] font-medium text-proofline-blue hover:text-proofline-navy flex items-center gap-1">
            <Upload className="w-3 h-3" />
            <span>Add File</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".txt,.md,.eml,.json"
              onChange={handleFileUpload} 
              multiple
            />
          </label>
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
                  <div className="text-[13px] font-medium text-ink truncate max-w-[190px]">
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
                Click any highlighted span to load its verified provenance in the Source Inspector.
              </div>
              <div>
                {docSpans.length} verified evidential spans in this document
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink-steel text-[13px]">
            No document selected.
          </div>
        )}
      </div>
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

  // Sort spans by startOffset
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
