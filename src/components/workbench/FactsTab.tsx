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
  matterId?: string;
  claims: Claim[];
  spans: Span[];
  documents: Document[];
  onSelectSpan: (span: Span | null) => void;
  onUpdateClaimNotes: (claimId: string, notes: string) => void;
}

export const FactsTab: React.FC<FactsTabProps> = ({
  matterId = '',
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

  // Dynamically compute case prep checklist based on active matter
  const isBates = matterId === 'matter-bates-postoffice-2019' || claims.some(c => c.id.includes('bates'));
  const isNova = matterId === 'matter-novacorp-meridian-2026' || claims.some(c => c.id.includes('msa'));
  const isThorne = matterId === 'matter-thorne-tenancy-2026' || claims.some(c => c.id.includes('tenancy'));

  const initialChecklist = React.useMemo(() => {
    if (isBates) {
      return [
        { id: 'chk-b-1', title: 'Standard Subpostmaster Contract (SPMC) Clause 12 text', category: 'Document', status: 'verified' as const, source: 'doc-bates-03' },
        { id: 'chk-b-2', title: 'Fujitsu Episteme Problem Investigation Report (PIN-188)', category: 'Technical Report', status: 'verified' as const, source: 'doc-bates-02' },
        { id: 'chk-b-3', title: 'Post Office Security Division Policy Directive Memo (2010)', category: 'Document', status: 'verified' as const, source: 'doc-bates-04' },
        { id: 'chk-b-4', title: 'High Court Judgment (No. 6) Horizon Issues [2019] EWHC 3408', category: 'Pleading', status: 'verified' as const, source: 'doc-bates-01' },
        { id: 'chk-b-5', title: 'Fujitsu Bracknell SSC Remote SQL Journal Modification Audit Logs', category: 'Outstanding Evidence', status: 'pending' as const, source: 'Fujitsu GLO Discovery' },
        { id: 'chk-b-6', title: 'Subpostmaster Branch Cash Shortfall Accounting Ledgers', category: 'Finance', status: 'verified' as const, source: 'Client Branch Records' }
      ];
    }
    if (isNova) {
      return [
        { id: 'chk-n-1', title: 'Master Cloud Services Agreement (Executed Copy)', category: 'Document', status: 'verified' as const, source: 'doc-msa-meridian-001' },
        { id: 'chk-n-2', title: 'Schedule B Order Form & Payment Schedule', category: 'Document', status: 'verified' as const, source: 'doc-msa-meridian-001' },
        { id: 'chk-n-3', title: 'Provider Monthly Invoices INV-2026-01 through 03', category: 'Finance', status: 'verified' as const, source: 'Billing Department' },
        { id: 'chk-n-4', title: 'Written Discrepancy Notice regarding Net 60 Terms', category: 'Pleading', status: 'pending' as const, source: 'Legal Notice Draft' }
      ];
    }
    if (isThorne) {
      return [
        { id: 'chk-t-1', title: 'Assured Shorthold Tenancy Agreement (Flat 4B)', category: 'Document', status: 'verified' as const, source: 'Tenancy Agreement' },
        { id: 'chk-t-2', title: 'Tenancy Deposit Bank Transfer Receipt (£1,650)', category: 'Finance', status: 'verified' as const, source: 'Bank Statement' },
        { id: 'chk-t-3', title: 'Tenancy Deposit Scheme Search Certificate (No Scheme Protection)', category: 'Outstanding Evidence', status: 'verified' as const, source: 'TDS Registry' },
        { id: 'chk-t-4', title: 'MRICS Chartered Surveyor Damp & Mould Inspection Report', category: 'Technical Report', status: 'verified' as const, source: 'Survey Report' },
        { id: 'chk-t-5', title: 'Managing Agent Written Refusal of Remedial Works', category: 'Document', status: 'verified' as const, source: 'Agent Emails' }
      ];
    }
    return [
      { id: 'chk-1', title: 'VAT Purchase Invoice INV-8492', category: 'Document', status: 'verified' as const, source: 'doc-receipt-8492' },
      { id: 'chk-2', title: 'Carrier Delivery Confirmation (18 Jan 2026)', category: 'Document', status: 'verified' as const, source: 'doc-receipt-8492' },
      { id: 'chk-3', title: 'Telephony Support Call Audio / Transcript (#CALL-4491)', category: 'Outstanding Evidence', status: 'pending' as const, source: 'Zenith CRM Request' },
      { id: 'chk-4', title: 'Apex Diagnostic Engineering Inspection Report', category: 'Technical Report', status: 'verified' as const, source: 'doc-service-report' },
      { id: 'chk-5', title: 'Written Rejection Notice under CRA 2015 s.20', category: 'Pleading', status: 'pending' as const, source: 'Letter Before Claim Draft' },
      { id: 'chk-6', title: 'Bank Account Statement proving Debit Card Payment (£1,499.00)', category: 'Finance', status: 'verified' as const, source: 'Client Records' }
    ];
  }, [isBates, isNova, isThorne]);

  const [checklist, setChecklist] = useState(initialChecklist);

  React.useEffect(() => {
    setChecklist(initialChecklist);
  }, [initialChecklist]);

  // Client / Witness inquiries state (SRA Non-Coaching Compliant)
  const witnessQuestions = React.useMemo(() => {
    if (isBates) {
      return [
        {
          id: 'q-b-1',
          question: 'Did Post Office auditors or helpline staff ever inform you that Fujitsu personnel could remotely adjust branch Riposte balances from Bracknell?',
          purpose: 'Rebut presumption of mechanical computer reliability under Police and Criminal Evidence Act 1984 s.69',
          source: 'Bates v Post Office [2019] EWHC 3408 § 134'
        },
        {
          id: 'q-b-2',
          question: 'When you contacted the Horizon helpline regarding unexplained cash discrepancies, were you told that no other branch had reported similar deficits?',
          purpose: 'Establish institutional bad faith and deceptive inducement under Yam Seng [2013] EWHC 111',
          source: 'Post Office Security Division Policy Directive Memo 2010'
        },
        {
          id: 'q-b-3',
          question: 'Did you personally authorize any adjusting journal entries that appeared on your balancing statements without local counter receipts?',
          purpose: 'Prove lack of consent and invalidity of strict indemnity under UCTA 1977 s.3/s.11',
          source: 'Fujitsu Episteme PIN-188 Audit Report'
        }
      ];
    }
    if (isNova) {
      return [
        {
          id: 'q-n-1',
          question: 'During contract negotiations, did Provider represent that Schedule B payment terms (Net 60) governed invoicing for compute services?',
          purpose: 'Resolve ambiguity between Section 4.2 and Schedule B in favor of Customer',
          source: 'MSA Section 4.2 vs Schedule B'
        },
        {
          id: 'q-n-2',
          question: 'Did Provider ever accept payment on 60-day terms without reservation or notice of breach?',
          purpose: 'Establish course of dealing and waiver of strict Net 30 enforcement',
          source: 'Invoicing History INV-2026'
        }
      ];
    }
    if (isThorne) {
      return [
        {
          id: 'q-t-1',
          question: 'On what specific dates did you communicate penetrating damp and mould issues to the landlord or managing agent?',
          purpose: 'Establish landlord notice and breach period under Landlord and Tenant Act 1985 s.11',
          source: 'Client Disrepair Log'
        },
        {
          id: 'q-t-2',
          question: 'Were you ever served with prescribed deposit information or scheme leaflets within 30 days of paying the deposit?',
          purpose: 'Confirm statutory penalty entitlement under Housing Act 2004 s.214(4)',
          source: 'TDS Verification Certificate'
        }
      ];
    }
    return [
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
  }, [isBates, isNova, isThorne]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gallery-white border border-border-hairline p-5 rounded-[6px] shadow-xs">
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
        <div className="flex items-center p-1 bg-gallery-paper rounded-[4px] border border-border-hairline self-start sm:self-auto text-[12px]">
          <button
            onClick={() => setActiveView('claims')}
            className={`px-3 py-1 rounded-[4px] font-medium transition-colors ${activeView === 'claims' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Claims List
          </button>
          <button
            onClick={() => setActiveView('matrix')}
            className={`px-3 py-1 rounded-[4px] font-medium transition-colors ${activeView === 'matrix' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Evidence Matrix
          </button>
          <button
            onClick={() => setActiveView('case_prep')}
            className={`px-3 py-1 rounded-[4px] font-medium transition-colors ${activeView === 'case_prep' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Case Prep &amp; Inquiries
          </button>
        </div>
      </div>

      {/* VIEW 1: CLAIMS LIST */}
      {activeView === 'claims' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-gallery-white border border-border-hairline p-3.5 rounded-[4px] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider">Filter:</span>
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value)}
                className="text-[12px] bg-gallery-paper border border-border-hairline rounded-[4px] px-2.5 py-1 text-ink focus:outline-none focus:border-proofline-blue"
              >
                <option value="all">All Kinds</option>
                <option value="fact">Facts Only</option>
                <option value="legal_proposition">Legal Propositions</option>
                <option value="inference">Inferences</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[12px] bg-gallery-paper border border-border-hairline rounded-[4px] px-2.5 py-1 text-ink focus:outline-none focus:border-proofline-blue"
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
                  className={`bg-gallery-white border rounded-[6px] p-5 transition-all shadow-xs ${
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
                            className="px-3 py-1 bg-ink text-white rounded-[4px] text-[11px] font-medium hover:bg-ink-slate transition-colors"
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
        <div className="bg-white border border-border-hairline rounded-[6px] overflow-hidden shadow-subtle">
          <div className="p-4 border-b border-border-hairline bg-canvas-subtle flex items-center justify-between">
            <div>
              <h3 className="text-[13.5px] font-semibold text-ink">Reviewable Evidence Matrix</h3>
              <p className="text-[11px] text-ink-steel">Side-by-side analysis of propositions against supporting and contrary records.</p>
            </div>
            <span className="text-[11px] font-mono text-ink-steel">{claims.length} propositions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-canvas-subtle border-b border-border-hairline text-ink-steel font-semibold uppercase text-[10px] tracking-wider font-mono">
                  <th className="p-3 w-1/4">Factual Proposition</th>
                  <th className="p-3 w-1/5">Supporting Evidence</th>
                  <th className="p-3 w-1/5">Contrary / Adverse Record</th>
                  <th className="p-3 w-1/5">Outstanding Inquiry</th>
                  <th className="p-3 w-1/6">Reviewer Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {claims.map((claim) => {
                  const supportingEdges = claim.provenanceEdges.filter(e => e.type === 'supports');
                  const contraryEdges = claim.provenanceEdges.filter(e => e.type === 'contradicts');

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 align-top">
                        <div className="font-medium text-ink leading-snug">{claim.statement}</div>
                        <div className="text-[10px] text-ink-steel font-mono mt-1">
                          {claim.id} &bull; <span className="capitalize">{claim.polarity}</span>
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
                              className="flex items-center gap-1 text-left text-[11px] text-proofline-blue hover:underline font-mono truncate max-w-[180px]"
                              title={e.rationale}
                            >
                              <ShieldCheck className="w-3 h-3 text-proofline-green shrink-0" />
                              <span className="truncate">{d ? d.filename : e.spanId}</span>
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
                                className="flex items-center gap-1 text-left text-[11px] text-amber-900 font-semibold hover:underline font-mono truncate max-w-[180px]"
                                title={e.rationale}
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                                <span className="truncate">{d ? d.filename : e.spanId}</span>
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-ink-steel text-[11px] italic">None identified</span>
                        )}
                      </td>
                      <td className="p-3 align-top">
                        {claim.status === 'contested' ? (
                          <span className="text-amber-900 font-medium text-[11px] block bg-amber-50 px-2 py-0.5 rounded-[2px] border border-amber-200">
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
        <div className="space-y-4">
          {/* Document & Evidence Checklist */}
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div>
                <h3 className="text-[13.5px] font-semibold text-ink">
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
                  className="p-3 bg-canvas-subtle border border-border-hairline rounded-[4px] flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.status === 'verified'}
                      onChange={() => {}} // handled by parent onClick
                      className="w-4 h-4 text-proofline-blue rounded-[2px] cursor-pointer"
                    />
                    <div>
                      <span className={`text-[12.5px] font-medium block ${item.status === 'verified' ? 'text-ink line-through opacity-70' : 'text-ink'}`}>
                        {item.title}
                      </span>
                      <span className="text-[10.5px] text-ink-steel font-mono">
                        Category: {item.category} &bull; Source: {item.source}
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
          <div className="bg-white border border-border-hairline rounded-[6px] p-5 shadow-subtle space-y-4">
            <div className="border-b border-border-hairline pb-3">
              <h3 className="text-[13.5px] font-semibold text-ink">
                Formulated Evidence-Seeking Witness Inquiries
              </h3>
              <p className="text-[11px] text-ink-steel">
                Non-coaching factual questions derived from detected conflicts and missing evidence.
              </p>
            </div>

            <div className="space-y-2.5">
              {witnessQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 bg-canvas-subtle border border-border-hairline rounded-[4px] space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-[11.5px] font-bold text-proofline-blue">Q{idx + 1}.</span>
                    <p className="text-[12.5px] font-medium text-ink leading-snug">
                      "{q.question}"
                    </p>
                  </div>
                  <div className="pl-6 space-y-0.5 text-[11px]">
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
