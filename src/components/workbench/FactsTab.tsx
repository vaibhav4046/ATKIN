import React, { useState } from 'react';
import { 
  CheckSquare, 
  AlertTriangle, 
  ExternalLink, 
  Edit3, 
  Filter, 
  ShieldCheck, 
  FileText,
  Calendar,
  MessageSquare
} from 'lucide-react';
import type { Claim, Span, Document, ClaimKind, ClaimStatus } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface FactsTabProps {
  claims: Claim[];
  spans: Span[];
  documents: Document[];
  onSelectSpan: (span: Span | null) => void;
  onUpdateClaimNotes: (claimId: string, notes: string) => void;
}

export const FactsTab: React.FC<FactsTabProps> = ({
  claims,
  spans,
  documents,
  onSelectSpan,
  onUpdateClaimNotes
}) => {
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const spansById = new Map(spans.map(s => [s.id, s]));
  const docsById = new Map(documents.map(d => [d.id, d]));

  const filteredClaims = claims.filter(c => {
    if (kindFilter !== 'all' && c.kind !== kindFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const handleStartEdit = (claim: Claim) => {
    setEditingClaimId(claim.id);
    setNoteText(claim.editorNotes || '');
  };

  const handleSaveNotes = (claimId: string) => {
    onUpdateClaimNotes(claimId, noteText);
    setEditingClaimId(null);
  };

  return (
    <div className="space-y-5 max-w-[920px] mx-auto py-2">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gallery-white border border-border-hairline p-4 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-[17px] font-semibold text-ink">
            Evidential Claim &amp; Fact Ledger
          </h2>
          <p className="text-[12px] text-ink-slate mt-0.5">
            Every statement is linked to an exact source span or tagged as contested.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="text-[12px] bg-gallery-paper border border-border-hairline rounded-full-pill px-3 py-1 text-ink focus:outline-none focus:border-proofline-blue"
          >
            <option value="all">All Kinds</option>
            <option value="fact">Facts Only</option>
            <option value="legal_proposition">Legal Propositions</option>
            <option value="inference">Inferences</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-[12px] bg-gallery-paper border border-border-hairline rounded-full-pill px-3 py-1 text-ink focus:outline-none focus:border-proofline-blue"
          >
            <option value="all">All Statuses</option>
            <option value="supported">Supported</option>
            <option value="contested">Contested / Conflict</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3.5">
        {filteredClaims.map((claim) => {
          const isContested = claim.status === 'contested';
          const isEditing = editingClaimId === claim.id;

          return (
            <div
              key={claim.id}
              className={`bg-gallery-white border rounded-2xl p-5 transition-all shadow-xs ${
                isContested
                  ? 'border-proofline-ochre/40 ring-1 ring-proofline-ochre/20'
                  : 'border-border-hairline hover:border-proofline-blue/30'
              }`}
            >
              {/* Claim Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={isContested ? 'ochre' : 'green'} size="sm">
                    {isContested ? 'Evidence: Contested' : 'Evidence: Supported'}
                  </Badge>

                  <Badge variant="slate" size="sm">
                    Kind: {claim.kind.replace('_', ' ')}
                  </Badge>

                  {claim.temporalScope && (
                    <Badge variant="slate" size="sm" icon={<Calendar className="w-3 h-3 text-proofline-blue" />}>
                      Date: {claim.temporalScope}
                    </Badge>
                  )}

                  <Badge 
                    variant={claim.polarity === 'favourable' ? 'blue' : claim.polarity === 'adverse' ? 'ochre' : 'slate'}
                    size="sm"
                  >
                    {claim.polarity}
                  </Badge>
                </div>

                <span className="text-[11px] text-ink-steel font-mono">
                  ID: {claim.id}
                </span>
              </div>

              {/* Statement */}
              <p className="text-[15px] font-medium text-ink leading-relaxed">
                {claim.statement}
              </p>

              {/* Provenance Edge Citations */}
              <div className="mt-3.5 pt-3 border-t border-border-hairline/80 space-y-2">
                <div className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider">
                  Source Provenance Spans:
                </div>

                <div className="flex flex-wrap gap-2">
                  {claim.provenanceEdges.map((edge) => {
                    const span = spansById.get(edge.spanId);
                    const doc = span ? docsById.get(span.documentId) : undefined;
                    const isAdverseEdge = edge.type === 'contradicts';

                    return (
                      <button
                        key={edge.id}
                        onClick={() => span && onSelectSpan(span)}
                        className={`text-left text-[12px] px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-2 ${
                          isAdverseEdge
                            ? 'bg-proofline-ochre/10 border-proofline-ochre/30 text-proofline-ochre hover:bg-proofline-ochre/20'
                            : 'bg-gallery-paper border-border-hairline text-ink hover:border-proofline-blue/50 hover:bg-gallery-white'
                        }`}
                        title={edge.rationale}
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="font-medium truncate max-w-[240px]">
                          {doc?.filename || edge.spanId}
                        </span>
                        {span?.lineStart && (
                          <span className="font-mono text-[11px] text-ink-steel">
                            #L{span.lineStart}–L{span.lineEnd}
                          </span>
                        )}
                        <span className={`text-[10px] uppercase font-bold px-1 rounded ${
                          isAdverseEdge ? 'bg-proofline-ochre text-white' : 'bg-proofline-blue/15 text-proofline-blue'
                        }`}>
                          {edge.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Solicitor Notes Section */}
              <div className="mt-3 pt-3 border-t border-border-hairline/60">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add strategic solicitor notes or client instructions..."
                      className="w-full text-[13px] bg-gallery-paper border border-border-hairline rounded-lg p-2.5 text-ink focus:border-proofline-blue focus:outline-none"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingClaimId(null)}
                        className="text-[12px] px-3 py-1 text-ink-slate hover:text-ink"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(claim.id)}
                        className="text-[12px] px-3.5 py-1 bg-ink text-white rounded-full-pill hover:bg-ink/85 font-medium"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 text-[12px] text-ink-slate bg-gallery-mist/50 p-2.5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-ink-steel shrink-0 mt-0.5" />
                      <span>
                        {claim.editorNotes ? (
                          <span>{claim.editorNotes}</span>
                        ) : (
                          <span className="italic text-ink-steel">No solicitor notes attached.</span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => handleStartEdit(claim)}
                      className="text-proofline-blue hover:underline shrink-0 text-[11px] font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
