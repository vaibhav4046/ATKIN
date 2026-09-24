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
  MessageSquare,
  HelpCircle,
  ClipboardList,
  CheckCircle2,
  Table,
  UserCheck,
  Search
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
  const [activeView, setActiveView] = useState<'claims' | 'matrix' | 'case_prep'>('claims');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Case prep checklist state
  const [checklist, setChecklist] = useState<Array<{ id: string; title: string; category: string; status: 'verified' | 'pending'; source: string }>>([
    { id: 'chk-1', title: 'VAT Purchase Invoice INV-8492', category: 'Document', status: 'verified', source: 'doc-receipt-8492' },
    { id: 'chk-2', title: 'Carrier Delivery Confirmation (18 Jan 2026)', category: 'Document', status: 'verified', source: 'doc-receipt-8492' },
    { id: 'chk-3', title: 'Telephony Support Call Audio / Transcript (#CALL-4491)', category: 'Outstanding Evidence', status: 'pending', source: 'Zenith CRM Request' },
    { id: 'chk-4', title: 'Apex Diagnostic Engineering Inspection Report', category: 'Technical Report', status: 'verified', source: 'doc-service-report' },
    { id: 'chk-5', title: 'Written Rejection Notice under CRA 2015 s.20', category: 'Pleading', status: 'pending', source: 'Letter Before Claim Draft' },
    { id: 'chk-6', title: 'Bank Account Statement proving Debit Card Payment (£1,499.00)', category: 'Finance', status: 'verified', source: 'Client Records' }
  ]);

  // Client / Witness inquiries state
  const witnessQuestions = [
    {
      id: 'q-1',
      question: 'Between 8 April and 12 April 2026, did you use the laptop for daily work or leave it powered off?',
      purpose: 'Reconcile adverse telephony log date against recollection of final failure',
      source: 'Contradiction: Defect Onset Date (8 Apr vs 12 Apr)'
    },
    {
      id: 'q-2',
      question: 'Did the merchant support agent explicitly inform you that the manufacturer 1-year guarantee superseded your statutory rights?',
      purpose: 'Establish potential Consumer Protection from Unfair Trading breach under CPR 2008',
      source: 'Merchant Rejection Email (22 Apr 2026)'
    },
    {
      id: 'q-3',
      question: 'Was the £120 diagnostic inspection fee paid under express protest or reservation of rights?',
      purpose: 'Support restitutionary claim for diagnostic expense under CRA 2015 s.23(2)',
      source: 'Apex Service Invoice'
    }
  ];

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

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, status: item.status === 'verified' ? 'pending' : 'verified' } : item
    ));
  };

  return (
    <div className="space-y-5 max-w-[960px] mx-auto py-2">
      {/* Header and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gallery-white border border-border-hairline p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" size="sm">Evidence Ledger &amp; Preparation</Badge>
            <Badge variant="slate" size="sm">{claims.length} Propositions</Badge>
          </div>
          <h2 className="text-[17px] font-semibold text-ink">
            Evidential Claim Ledger &amp; Case Preparation Matrix
          </h2>
          <p className="text-[12px] text-ink-slate mt-0.5">
            Span-grounded assertions, side-by-side evidence matrix, and non-coaching witness inquiries.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-gallery-paper rounded-xl border border-border-hairline self-start sm:self-auto text-[12px]">
          <button
            onClick={() => setActiveView('claims')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${activeView === 'claims' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Claims List
          </button>
          <button
            onClick={() => setActiveView('matrix')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${activeView === 'matrix' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Evidence Matrix
          </button>
          <button
            onClick={() => setActiveView('case_prep')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${activeView === 'case_prep' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Case Prep &amp; Inquiries
          </button>
        </div>
      </div>

      {/* VIEW 1: CLAIMS LIST */}
      {activeView === 'claims' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-gallery-white border border-border-hairline p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider">Filter:</span>
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value)}
                className="text-[12px] bg-gallery-paper border border-border-hairline rounded-lg px-2.5 py-1 text-ink focus:outline-none focus:border-proofline-blue"
              >
                <option value="all">All Kinds</option>
                <option value="fact">Facts Only</option>
                <option value="legal_proposition">Legal Propositions</option>
                <option value="inference">Inferences</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[12px] bg-gallery-paper border border-border-hairline rounded-lg px-2.5 py-1 text-ink focus:outline-none focus:border-proofline-blue"
              >
                <option value="all">All Statuses</option>
                <option value="supported">Supported</option>
                <option value="contested">Contested / Conflict</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div className="text-[11px] text-ink-steel font-mono">
              Showing {filteredClaims.length} of {claims.length} claims
            </div>
          </div>

          <div className="space-y-3">
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

                  <p className="text-[14.5px] font-medium text-ink leading-relaxed">
                    {claim.statement}
                  </p>

                  {/* Connected Spans */}
                  <div className="mt-3 pt-3 border-t border-border-hairline space-y-2">
                    <div className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider">
                      Grounding Evidence Spans:
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {claim.provenanceEdges.map(edge => {
                        const span = spansById.get(edge.spanId);
                        const doc = span ? docsById.get(span.documentId) : undefined;
                        const isAdverse = edge.type === 'contradicts';

                        return (
                          <button
                            key={edge.id}
                            onClick={() => span && onSelectSpan(span)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-colors text-left ${
                              isAdverse 
                                ? 'bg-proofline-ochre/10 border-proofline-ochre/30 text-proofline-ochre hover:bg-proofline-ochre/20' 
                                : 'bg-gallery-paper border-border-hairline text-ink-slate hover:bg-gallery-mist hover:text-ink'
                            }`}
                            title={edge.rationale}
                          >
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[200px]">{doc ? doc.filename : edge.spanId}</span>
                            {span && <span className="text-ink-steel">L{span.lineStart}–{span.lineEnd}</span>}
                            {isAdverse && <span className="font-bold ml-1 text-proofline-ochre">[ADVERSE]</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Editor Notes */}
                  <div className="mt-3 bg-gallery-paper border border-border-hairline rounded-xl p-3 text-[12px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-ink text-[11px]">Solicitor Review Note:</span>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(claim)}
                          className="text-proofline-blue hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Note</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="w-full text-[12px] bg-gallery-white border border-border-hairline rounded-lg p-2 text-ink focus:outline-none focus:border-proofline-blue font-sans"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingClaimId(null)}
                            className="px-2.5 py-1 text-[11px] text-ink-slate hover:text-ink font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNotes(claim.id)}
                            className="px-3 py-1 bg-ink text-white rounded-full-pill text-[11px] font-medium"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-ink-slate italic">
                        {claim.editorNotes || 'No notes added. Click "Edit Note" to annotate evidential weight.'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: EVIDENCE MATRIX */}
      {activeView === 'matrix' && (
        <div className="bg-gallery-white border border-border-hairline rounded-card overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border-hairline bg-gallery-paper/50 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-ink">Reviewable Evidence Matrix</h3>
              <p className="text-[11px] text-ink-steel">Side-by-side analysis of propositions against supporting and contrary records.</p>
            </div>
            <span className="text-[11px] font-mono text-ink-steel">{claims.length} rows</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-gallery-paper border-b border-border-hairline text-ink-steel font-semibold uppercase text-[10px] tracking-wider">
                  <th className="p-3 w-1/4">Factual Proposition</th>
                  <th className="p-3 w-1/5">Supporting Evidence</th>
                  <th className="p-3 w-1/5">Contrary / Adverse Evidence</th>
                  <th className="p-3 w-1/5">Outstanding Inquiry</th>
                  <th className="p-3 w-1/6">Reviewer Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {claims.map((claim) => {
                  const supportingEdges = claim.provenanceEdges.filter(e => e.type === 'supports');
                  const contraryEdges = claim.provenanceEdges.filter(e => e.type === 'contradicts');

                  return (
                    <tr key={claim.id} className="hover:bg-gallery-mist/30 transition-colors">
                      <td className="p-3 align-top">
                        <div className="font-medium text-ink leading-snug">{claim.statement}</div>
                        <div className="text-[10px] text-ink-steel font-mono mt-1">
                          {claim.id} · <span className="capitalize">{claim.polarity}</span>
                        </div>
                      </td>
                      <td className="p-3 align-top space-y-1">
                        {supportingEdges.map(e => {
                          const s = spansById.get(e.spanId);
                          const d = s ? docsById.get(s.documentId) : undefined;
                          return (
                            <button
                              key={e.id}
                              onClick={() => s && onSelectSpan(s)}
                              className="block text-left text-[11px] text-proofline-blue hover:underline font-mono truncate max-w-[180px]"
                              title={e.rationale}
                            >
                              ✓ {d ? d.filename : e.spanId}
                            </button>
                          );
                        })}
                      </td>
                      <td className="p-3 align-top space-y-1">
                        {contraryEdges.length > 0 ? (
                          contraryEdges.map(e => {
                            const s = spansById.get(e.spanId);
                            const d = s ? docsById.get(s.documentId) : undefined;
                            return (
                              <button
                                key={e.id}
                                onClick={() => s && onSelectSpan(s)}
                                className="block text-left text-[11px] text-proofline-ochre font-semibold hover:underline font-mono truncate max-w-[180px]"
                                title={e.rationale}
                              >
                                ⚡ {d ? d.filename : e.spanId}
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-ink-steel text-[11px] italic">None identified</span>
                        )}
                      </td>
                      <td className="p-3 align-top">
                        {claim.status === 'contested' ? (
                          <span className="text-proofline-ochre font-medium text-[11px] block">
                            Reconcile onset date before court claim
                          </span>
                        ) : (
                          <span className="text-ink-steel text-[11px]">Primary documents verified</span>
                        )}
                      </td>
                      <td className="p-3 align-top text-ink-slate text-[11px]">
                        {claim.editorNotes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: CASE PREPARATION & INQUIRIES */}
      {activeView === 'case_prep' && (
        <div className="space-y-5">
          {/* Document & Evidence Checklist */}
          <div className="bg-gallery-white border border-border-hairline rounded-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-ink">
                  Case Preparation Document Checklist
                </h3>
                <p className="text-[11px] text-ink-steel">
                  Pre-Action Protocol evidential audit requirements.
                </p>
              </div>
              <span className="text-[11px] font-mono text-ink-steel">
                {checklist.filter(c => c.status === 'verified').length} / {checklist.length} satisfied
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="p-3 bg-gallery-paper border border-border-hairline rounded-xl flex items-center justify-between cursor-pointer hover:bg-gallery-mist/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.status === 'verified'}
                      onChange={() => {}} // handled by parent onClick
                      className="w-4 h-4 text-proofline-blue rounded cursor-pointer"
                    />
                    <div>
                      <span className={`text-[13px] font-medium block ${item.status === 'verified' ? 'text-ink line-through opacity-70' : 'text-ink'}`}>
                        {item.title}
                      </span>
                      <span className="text-[11px] text-ink-steel font-mono">
                        Category: {item.category} · Source: {item.source}
                      </span>
                    </div>
                  </div>

                  <Badge variant={item.status === 'verified' ? 'green' : 'ochre'} size="sm">
                    {item.status === 'verified' ? 'Verified in Vault' : 'Action Required'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Formulated Witness Questions */}
          <div className="bg-gallery-white border border-border-hairline rounded-card p-5 shadow-xs space-y-4">
            <div className="border-b border-border-hairline/60 pb-3">
              <h3 className="text-[14px] font-semibold text-ink">
                Formulated Evidence-Seeking Witness Inquiries
              </h3>
              <p className="text-[11px] text-ink-steel">
                Non-coaching factual questions derived from detected conflicts and missing evidence.
              </p>
            </div>

            <div className="space-y-3">
              {witnessQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gallery-mist/50 border border-border-hairline rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-[12px] font-bold text-proofline-blue">Q{idx + 1}.</span>
                    <p className="text-[13px] font-medium text-ink leading-snug">
                      "{q.question}"
                    </p>
                  </div>
                  <div className="pl-6 space-y-1 text-[11px]">
                    <div className="text-ink-slate">
                      <strong>Evidential Purpose:</strong> {q.purpose}
                    </div>
                    <div className="text-ink-steel font-mono">
                      Derived From: {q.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
