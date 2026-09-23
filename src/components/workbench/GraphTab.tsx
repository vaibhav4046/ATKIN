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
  ShieldCheck
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
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('claim-client-failure-date');

  const spansById = new Map(spans.map(s => [s.id, s]));
  const docsById = new Map(documents.map(d => [d.id, d]));

  // Selected node details
  const selectedClaim = claims.find(c => c.id === selectedNodeId);
  const selectedDoc = documents.find(d => d.id === selectedNodeId);
  const selectedAuth = authorities.find(a => a.id === selectedNodeId);

  return (
    <div className="space-y-4 max-w-[920px] mx-auto py-2">
      {/* Header and View Mode Switcher */}
      <div className="flex items-center justify-between bg-gallery-white border border-border-hairline p-4 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-[17px] font-semibold text-ink">
            Evidence Graph &amp; Relation Map
          </h2>
          <p className="text-[12px] text-ink-slate mt-0.5">
            Topology connecting documents, extracted spans, claims, contradictions, and statutory authorities.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gallery-paper p-1 rounded-full-pill border border-border-hairline">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1 rounded-full-pill text-[12px] font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'visual' ? 'bg-gallery-white text-ink shadow-xs' : 'text-ink-slate hover:text-ink'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Graph</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-full-pill text-[12px] font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-gallery-white text-ink shadow-xs' : 'text-ink-slate hover:text-ink'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Accessible List View</span>
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        /* Visual Graph View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* SVG Canvas (2 cols) */}
          <div className="lg:col-span-2 bg-gallery-white border border-border-hairline rounded-card p-4 relative min-h-[460px] flex flex-col justify-between shadow-xs">
            {/* SVG Interactive Canvas */}
            <div className="relative w-full h-[400px]">
              <svg className="w-full h-full" viewBox="0 0 540 380">
                {/* Edge lines */}
                {/* Document to Claim edges */}
                <line x1="80" y1="80" x2="270" y2="70" stroke="#d6d6d6" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="80" y1="180" x2="270" y2="160" stroke="#d6d6d6" strokeWidth="2" />
                <line x1="80" y1="280" x2="270" y2="230" stroke="#d6d6d6" strokeWidth="2" />
                <line x1="80" y1="340" x2="270" y2="320" stroke="#d6d6d6" strokeWidth="2" />

                {/* Contradiction Edge (Warm Ochre) between Claim 2 and Claim 3 */}
                <path 
                  d="M 270 160 C 220 195, 220 195, 270 230" 
                  fill="none" 
                  stroke="#b64400" 
                  strokeWidth="2.5" 
                  strokeDasharray="4 2" 
                />
                <text x="210" y="200" fill="#b64400" fontSize="10" fontWeight="bold">CONTRADICTS</text>

                {/* Claim to Authority edges */}
                <line x1="270" y1="70" x2="450" y2="120" stroke="#2e7d32" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="270" y1="320" x2="450" y2="280" stroke="#2e7d32" strokeWidth="1.5" strokeOpacity="0.6" />

                {/* Document Nodes (Left column, Ink outline) */}
                <g 
                  onClick={() => setSelectedNodeId('doc-receipt-8492')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Document Receipt INV-8492"
                >
                  <circle cx="80" cy="80" r="22" fill="#ffffff" stroke="#1d1d1f" strokeWidth="2" />
                  <text x="80" y="84" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1d1d1f">RCPT</text>
                  <text x="80" y="112" textAnchor="middle" fontSize="9" fill="#707070">INV-8492.txt</text>
                </g>

                <g 
                  onClick={() => setSelectedNodeId('doc-client-statement')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Document Client Statement"
                >
                  <circle cx="80" cy="180" r="22" fill="#ffffff" stroke="#1d1d1f" strokeWidth="2" />
                  <text x="80" y="184" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1d1d1f">STMT</text>
                  <text x="80" y="212" textAnchor="middle" fontSize="9" fill="#707070">ClientStmt.md</text>
                </g>

                <g 
                  onClick={() => setSelectedNodeId('doc-intake-email')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Document Contradictory Intake Email"
                >
                  <circle cx="80" cy="280" r="22" fill="#ffffff" stroke="#b64400" strokeWidth="2.5" />
                  <text x="80" y="284" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#b64400">INTK</text>
                  <text x="80" y="312" textAnchor="middle" fontSize="9" fill="#b64400">IntakeCRM.eml</text>
                </g>

                <g 
                  onClick={() => setSelectedNodeId('doc-service-report')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Document Apex Service Report"
                >
                  <circle cx="80" cy="340" r="20" fill="#ffffff" stroke="#1d1d1f" strokeWidth="2" />
                  <text x="80" y="344" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1d1d1f">APEX</text>
                </g>

                {/* Claim Nodes (Center column, Soft blue fill) */}
                <g 
                  onClick={() => setSelectedNodeId('claim-purchase-delivery')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Claim Purchase and Delivery Date"
                >
                  <rect x="235" y="52" width="70" height="34" rx="10" fill="#0071e3" fillOpacity="0.12" stroke="#0071e3" strokeWidth="1.5" />
                  <text x="270" y="73" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0071e3">18 Jan Deliv</text>
                </g>

                <g 
                  onClick={() => setSelectedNodeId('claim-client-failure-date')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Claim Client Stated Failure 12 April"
                >
                  <rect x="225" y="142" width="90" height="36" rx="10" fill="#b64400" fillOpacity="0.12" stroke="#b64400" strokeWidth="2" />
                  <text x="270" y="164" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#b64400">12 Apr (Client)</text>
                </g>

                <g 
                  onClick={() => setSelectedNodeId('claim-intake-earlier-date')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Claim Support Intake Log 8 April"
                >
                  <rect x="225" y="212" width="90" height="36" rx="10" fill="#b64400" fillOpacity="0.12" stroke="#b64400" strokeWidth="2" />
                  <text x="270" y="234" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#b64400">08 Apr (Intake)</text>
                </g>

                <g 
                  onClick={() => setSelectedNodeId('claim-inherent-defect')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Claim Inherent Solder Defect"
                >
                  <rect x="225" y="302" width="90" height="36" rx="10" fill="#0071e3" fillOpacity="0.12" stroke="#0071e3" strokeWidth="1.5" />
                  <text x="270" y="324" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0071e3">Inherent Defect</text>
                </g>

                {/* Authority Nodes (Right column, Emerald) */}
                <g 
                  onClick={() => setSelectedNodeId('auth-cra-s19-14')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Authority CRA 2015 s.19(14)"
                >
                  <rect x="420" y="102" width="95" height="36" rx="8" fill="#2e7d32" fillOpacity="0.1" stroke="#2e7d32" strokeWidth="1.5" />
                  <text x="467" y="124" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2e7d32">CRA s.19(14)</text>
                </g>

                <g 
                  onClick={() => setSelectedNodeId('auth-cra-s9')}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Authority CRA 2015 s.9"
                >
                  <rect x="420" y="262" width="95" height="36" rx="8" fill="#2e7d32" fillOpacity="0.1" stroke="#2e7d32" strokeWidth="1.5" />
                  <text x="467" y="284" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2e7d32">CRA s.9 Quality</text>
                </g>
              </svg>
            </div>

            {/* Graph Legend */}
            <div className="pt-3 border-t border-border-hairline flex flex-wrap items-center justify-between text-[11px] text-ink-steel">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-ink bg-white" />
                  <span>Document</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-proofline-blue/20 border border-proofline-blue" />
                  <span>Claim / Fact</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-proofline-ochre/20 border border-proofline-ochre" />
                  <span>Contradiction</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-proofline-green/20 border border-proofline-green" />
                  <span>Statutory Authority</span>
                </span>
              </div>
              <span className="text-[10px] font-mono">Click node for inspection</span>
            </div>
          </div>

          {/* Node Inspector Panel (Right 1 col) */}
          <div className="bg-gallery-white border border-border-hairline rounded-card p-4 flex flex-col justify-between shadow-xs">
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
                    <div className="text-[12px] text-ink-slate bg-gallery-mist p-2.5 rounded-lg">
                      {selectedClaim.editorNotes}
                    </div>
                  )}
                  {selectedClaim.provenanceEdges.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-ink-steel mb-1">Citations:</div>
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
      ) : (
        /* Accessible Linear List View */
        <div className="bg-gallery-white border border-border-hairline rounded-card p-5 space-y-4 shadow-xs" role="region" aria-label="Accessible Evidence Network">
          <div className="text-[13px] font-medium text-ink-steel">
            Linear accessible listing of all evidential nodes and relations:
          </div>

          <div className="space-y-4">
            {claims.map((claim) => (
              <div 
                key={claim.id} 
                className="p-3.5 rounded-xl border border-border-hairline bg-gallery-paper space-y-2"
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
    </div>
  );
};
