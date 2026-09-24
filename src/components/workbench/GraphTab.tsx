import React, { useState } from 'react';
import { 
  Network, 
  List, 
  Eye, 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  GitBranch,
  RefreshCw,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import type { Claim, Span, Document, Authority } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface GraphTabProps {
  documents: Document[];
  claims: Claim[];
  spans: Span[];
  authorities: Authority[];
  onSelectSpan: (span: Span | null) => void;
}

export const GraphTab: React.FC<GraphTabProps> = ({
  documents,
  claims,
  spans,
  authorities,
  onSelectSpan
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'list' | 'impact'>('visual');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => claims[0]?.id || documents[0]?.id || null);
  const [simulatedDocId, setSimulatedDocId] = useState<string>(() => documents[0]?.id || '');

  const spansById = new Map(spans.map(s => [s.id, s]));
  const docsById = new Map(documents.map(d => [d.id, d]));

  // Selected node details
  const selectedClaim = claims.find(c => c.id === selectedNodeId);
  const selectedDoc = documents.find(d => d.id === selectedNodeId);
  const selectedAuth = authorities.find(a => a.id === selectedNodeId);

  // Compute downstream change impact for simulated document modification
  const affectedSpans = spans.filter(s => s.documentId === simulatedDocId);
  const affectedSpanIds = new Set(affectedSpans.map(s => s.id));
  const affectedClaims = claims.filter(c => c.provenanceEdges.some(e => affectedSpanIds.has(e.spanId)));
  const simulatedDoc = docsById.get(simulatedDocId);

  return (
    <div className="space-y-4 max-w-[960px] mx-auto py-2">
      {/* Header and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gallery-white border border-border-hairline p-5 rounded-[6px] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" size="sm">Evidence Topology</Badge>
            <Badge variant="green" size="sm">Deterministic Tracing</Badge>
          </div>
          <h2 className="text-[17px] font-semibold text-ink">
            Evidence Graph &amp; Change Impact Topology
          </h2>
          <p className="text-[12px] text-ink-slate mt-0.5">
            Typed edges connecting documents, character offsets, factual assertions, and statutory authorities.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gallery-paper p-1 rounded-[4px] border border-border-hairline self-start sm:self-auto text-[12px]">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1 rounded-[4px] font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'visual' ? 'bg-gallery-white text-ink shadow-sm' : 'text-ink-slate hover:text-ink'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-[4px] font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-gallery-white text-ink shadow-sm' : 'text-ink-slate hover:text-ink'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Linear List</span>
          </button>
          <button
            onClick={() => setViewMode('impact')}
            className={`px-3 py-1 rounded-[4px] font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'impact' ? 'bg-gallery-white text-ink shadow-sm' : 'text-ink-slate hover:text-ink'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-proofline-ochre" />
            <span>Change Impact</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: VISUAL CANVAS */}
      {viewMode === 'visual' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Visual Topology Representation */}
          <div className="md:col-span-2 bg-gallery-white border border-border-hairline rounded-[6px] p-5 min-h-[460px] flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-semibold text-ink-steel uppercase tracking-wider">
                <span>Relational Topology Canvas</span>
                <span className="font-mono">Nodes: {documents.length + claims.length + authorities.length}</span>
              </div>

              {/* Graphical Nodes Stage */}
              <div className="p-4 bg-gallery-paper/60 rounded-[4px] border border-border-hairline space-y-4">
                {/* Documents Layer */}
                <div>
                  <span className="text-[10px] font-mono text-ink-steel uppercase tracking-wider block mb-2">
                    Evidence Layer (Primary Documents)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {documents.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedNodeId(doc.id)}
                        className={`px-3 py-1.5 rounded-[4px] border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                          selectedNodeId === doc.id
                            ? 'bg-ink text-white border-ink shadow-sm'
                            : 'bg-gallery-white border-border-hairline text-ink hover:border-ink/40'
                        }`}
                      >
                        <FileText className="w-3 h-3 text-proofline-blue" />
                        <span className="truncate max-w-[150px]">{doc.filename}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Claims Layer */}
                <div>
                  <span className="text-[10px] font-mono text-ink-steel uppercase tracking-wider block mb-2">
                    Assertion Layer (Typed Claims)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {claims.map(claim => {
                      const isContested = claim.status === 'contested';
                      return (
                        <button
                          key={claim.id}
                          onClick={() => setSelectedNodeId(claim.id)}
                          className={`px-3 py-1.5 rounded-[4px] border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                            selectedNodeId === claim.id
                              ? 'bg-proofline-blue text-white border-proofline-blue shadow-sm'
                              : isContested
                              ? 'bg-proofline-ochre/10 border-proofline-ochre/40 text-proofline-ochre'
                              : 'bg-gallery-white border-border-hairline text-ink hover:border-proofline-blue/40'
                          }`}
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{claim.statement.substring(0, 32)}...</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Authorities Layer */}
                <div>
                  <span className="text-[10px] font-mono text-ink-steel uppercase tracking-wider block mb-2">
                    Authority Layer (Statutory Provisions)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {authorities.map(auth => (
                      <button
                        key={auth.id}
                        onClick={() => setSelectedNodeId(auth.id)}
                        className={`px-3 py-1.5 rounded-[4px] border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                          selectedNodeId === auth.id
                            ? 'bg-proofline-green text-white border-proofline-green shadow-sm'
                            : 'bg-gallery-white border-border-hairline text-ink hover:border-proofline-green/40'
                        }`}
                      >
                        <BookOpen className="w-3 h-3 text-proofline-green" />
                        <span>{auth.identifier}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border-hairline flex items-center justify-between text-[11px] text-ink-steel">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-proofline-blue/20 border border-proofline-blue" />
                  <span>Claim</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-proofline-ochre/20 border border-proofline-ochre" />
                  <span>Contested</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-proofline-green/20 border border-proofline-green" />
                  <span>Statute</span>
                </span>
              </div>
              <span className="text-[10px] font-mono">Click node for inspection</span>
            </div>
          </div>

          {/* Node Inspector Panel (Right 1 col) */}
          <div className="bg-gallery-white border border-border-hairline rounded-[6px] p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider mb-2">
                Selected Graph Element
              </div>

              {selectedClaim ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={selectedClaim.status === 'contested' ? 'ochre' : 'green'} size="sm">
                      {selectedClaim.status === 'contested' ? 'Contested' : 'Supported'}
                    </Badge>
                    <Badge variant="slate" size="sm">{selectedClaim.kind}</Badge>
                  </div>
                  <h4 className="text-[14px] font-semibold text-ink">
                    {selectedClaim.statement}
                  </h4>
                  {selectedClaim.editorNotes && (
                    <div className="text-[12px] text-ink-slate bg-gallery-mist p-2.5 rounded-[4px]">
                      {selectedClaim.editorNotes}
                    </div>
                  )}
                  {selectedClaim.provenanceEdges.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-ink-steel mb-1">Grounding Citations:</div>
                      {selectedClaim.provenanceEdges.map(e => {
                        const s = spansById.get(e.spanId);
                        return (
                          <button
                            key={e.id}
                            onClick={() => s && onSelectSpan(s)}
                            className="block w-full text-left text-[12px] text-proofline-blue hover:underline font-mono truncate"
                          >
                            → Inspect span: {e.spanId}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : selectedDoc ? (
                <div className="space-y-2">
                  <Badge variant="slate" size="sm">{selectedDoc.mime}</Badge>
                  <h4 className="text-[14px] font-semibold text-ink">{selectedDoc.filename}</h4>
                  <p className="text-[12px] text-ink-slate font-mono">Date: {selectedDoc.sourceDate}</p>
                  <div className="text-[11px] text-ink-steel font-mono truncate">
                    SHA: {selectedDoc.sha256}
                  </div>
                </div>
              ) : selectedAuth ? (
                <div className="space-y-2">
                  <Badge variant="green" size="sm">{selectedAuth.jurisdiction}</Badge>
                  <h4 className="text-[14px] font-semibold text-ink">{selectedAuth.identifier}</h4>
                  <p className="text-[12px] text-ink-slate">{selectedAuth.summary}</p>
                </div>
              ) : (
                <div className="text-[12px] text-ink-steel">
                  Click any node in the canvas to examine relations.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border-hairline text-[11px] text-ink-steel">
              WCAG 2.2 AA compliant topology
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LINEAR LIST */}
      {viewMode === 'list' && (
        <div className="bg-gallery-white border border-border-hairline rounded-[6px] p-5 space-y-4 shadow-sm" role="region" aria-label="Accessible Evidence Network">
          <div className="text-[13px] font-medium text-ink-steel">
            Linear accessible listing of all evidential nodes and relations:
          </div>

          <div className="space-y-4">
            {claims.map((claim) => (
              <div 
                key={claim.id} 
                className="p-3.5 rounded-[4px] border border-border-hairline bg-gallery-paper space-y-2"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[14px] text-ink">{claim.statement}</span>
                  <Badge variant={claim.status === 'contested' ? 'ochre' : 'green'} size="sm">
                    {claim.status}
                  </Badge>
                </div>

                <div className="text-[12px] text-ink-slate">
                  <strong>Kind:</strong> {claim.kind} · <strong>Polarity:</strong> {claim.polarity} · <strong>Date:</strong> {claim.temporalScope || 'N/A'}
                </div>

                <div className="text-[12px] text-ink-steel space-y-1">
                  <strong>Connected Evidence Spans:</strong>
                  {claim.provenanceEdges.map(e => (
                    <div key={e.id} className="pl-3 font-mono text-[11px]">
                      • {e.type.toUpperCase()}: Span {e.spanId} ({e.rationale})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CHANGE IMPACT SIMULATOR */}
      {viewMode === 'impact' && (
        <div className="bg-gallery-white border border-border-hairline rounded-[6px] p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">
              Evidence Graph Change Impact Analysis
            </h3>
            <p className="text-[12px] text-ink-slate mt-0.5">
              Simulates downstream consequences when a source document is corrected, amended, or invalidated.
            </p>
          </div>

          <div className="p-4 bg-gallery-paper rounded-[4px] border border-border-hairline space-y-3">
            <label className="block text-[11px] font-semibold text-ink-steel uppercase tracking-wider">
              Select Document to Simulate Amendment / Invalidation:
            </label>
            <select
              value={simulatedDocId}
              onChange={(e) => setSimulatedDocId(e.target.value)}
              className="w-full text-[13px] bg-gallery-white border border-border-hairline rounded-[4px] px-3 py-2 text-ink font-medium focus:border-proofline-blue focus:outline-none"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  {d.filename} (Imported: {d.importedAt})
                </option>
              ))}
            </select>
          </div>

          {/* Change Impact Report */}
          <div className="border border-border-hairline rounded-[4px] p-5 space-y-4 bg-gallery-mist/30">
            <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
              <div className="flex items-center gap-2 text-proofline-ochre font-semibold text-[13px]">
                <AlertTriangle className="w-4 h-4" />
                <span>Impact Assessment for {simulatedDoc?.filename}</span>
              </div>
              <Badge variant="ochre" size="sm">{affectedClaims.length} Claims Impacted</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
              <div className="p-3 bg-gallery-white rounded-[4px] border border-border-hairline">
                <span className="text-ink-steel block text-[11px]">Direct Dependent Spans</span>
                <span className="font-mono font-semibold text-ink text-[14px] mt-0.5">{affectedSpans.length} spans</span>
              </div>

              <div className="p-3 bg-gallery-white rounded-[4px] border border-border-hairline">
                <span className="text-ink-steel block text-[11px]">Dependent Assertions</span>
                <span className="font-mono font-semibold text-proofline-ochre text-[14px] mt-0.5">{affectedClaims.length} claims</span>
              </div>

              <div className="p-3 bg-gallery-white rounded-[4px] border border-border-hairline">
                <span className="text-ink-steel block text-[11px]">Downstream Invalidation</span>
                <span className="font-mono font-semibold text-proofline-crimson text-[14px] mt-0.5">Draft Brief Re-check</span>
              </div>
            </div>

            {/* List of Affected Assertions */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider block">
                Impacted Factual Propositions Requiring Fee Earner Re-Verification:
              </span>
              {affectedClaims.map(c => (
                <div key={c.id} className="p-3 bg-gallery-white rounded-[4px] border border-border-hairline flex items-center justify-between text-[12px]">
                  <span className="font-medium text-ink truncate max-w-[500px]">{c.statement}</span>
                  <Badge variant="ochre" size="sm">Requires Re-review</Badge>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gallery-paper rounded-[4px] border border-border-hairline text-[11px] text-ink-slate flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-proofline-green shrink-0 mt-0.5" />
              <div>
                <strong>Sovereign Graph Invariant:</strong> Modifying or deleting this source document triggers cascading invalidation across all dependent scoped memories and draft blocks, preventing stale evidence from appearing in court work product.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
