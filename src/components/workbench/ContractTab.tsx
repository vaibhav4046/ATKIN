import React, { useState } from 'react';
import { 
  FileCheck2, 
  AlertTriangle, 
  Scale, 
  ShieldAlert, 
  CheckCircle, 
  Copy, 
  Check, 
  ChevronRight, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import type { 
  Document, 
  ContractReviewResult, 
  ContractClause,
  ContractRisk 
} from '../../types/index.ts';
import { ContractReviewer } from '../../engine/contract/contractReviewer.ts';
import { Badge } from '../common/Badge.tsx';

interface ContractTabProps {
  matterId: string;
  documents: Document[];
}

const contractReviewer = new ContractReviewer();

export const ContractTab: React.FC<ContractTabProps> = ({
  matterId,
  documents
}) => {
  // Find contract document if any, or default to first document
  const contractDoc = documents.find(d => d.filename.toLowerCase().includes('agreement') || d.filename.toLowerCase().includes('contract') || d.filename.toLowerCase().includes('msa')) || documents[0];

  const [reviewResult, setReviewResult] = useState<ContractReviewResult>(() => {
    if (!contractDoc) {
      return {
        matterId,
        documentId: 'none',
        parties: [],
        governingLaw: 'Unspecified',
        clauses: [],
        obligations: [],
        risks: [],
        missingClauses: []
      };
    }
    return contractReviewer.reviewDocument(matterId, contractDoc);
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedRiskId, setCopiedRiskId] = useState<string | null>(null);

  const categories = ['all', 'indemnity', 'liability_cap', 'payment_terms', 'governing_law', 'confidentiality', 'termination'];

  const filteredClauses = selectedCategory === 'all' 
    ? reviewResult.clauses 
    : reviewResult.clauses.filter(c => c.category === selectedCategory);

  const handleCopyRedline = (risk: ContractRisk) => {
    if (risk.suggestedRevision) {
      navigator.clipboard.writeText(risk.suggestedRevision);
      setCopiedRiskId(risk.id);
      setTimeout(() => setCopiedRiskId(null), 2000);
    }
  };

  return (
    <div className="p-8 max-w-[1140px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border-hairline">
        <div>
          <h2 className="text-[22px] font-semibold text-ink tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-proofline-blue" />
            Contract Review &amp; Playbook Audit
          </h2>
          <p className="text-[13px] text-ink-slate mt-1">
            Automated clause extraction, cross-schedule contradiction checking, and institutional playbook risk analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="slate" size="md">
            Doc: {contractDoc?.filename || 'No contract document'}
          </Badge>
          <Badge variant={reviewResult.risks.some(r => r.severity === 'high') ? 'red' : 'green'} size="md">
            {reviewResult.risks.filter(r => r.severity === 'high').length} High Severity Risks Flagged
          </Badge>
        </div>
      </div>

      {/* Contract Metadata Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gallery-white border border-border-hairline rounded-card shadow-subtle">
          <span className="text-[11px] font-medium text-ink-steel block">Contracting Parties</span>
          <span className="text-[13.5px] font-semibold text-ink mt-1 block">
            {reviewResult.parties.join(' · ') || 'Unspecified'}
          </span>
        </div>
        <div className="p-4 bg-gallery-white border border-border-hairline rounded-card shadow-subtle">
          <span className="text-[11px] font-medium text-ink-steel block">Governing Law</span>
          <span className="text-[13.5px] font-semibold text-ink mt-1 block">
            {reviewResult.governingLaw.length > 50 ? `${reviewResult.governingLaw.slice(0, 50)}...` : reviewResult.governingLaw}
          </span>
        </div>
        <div className="p-4 bg-gallery-white border border-border-hairline rounded-card shadow-subtle">
          <span className="text-[11px] font-medium text-ink-steel block">Indexed Provisions</span>
          <span className="text-[13.5px] font-semibold text-ink mt-1 block">
            {reviewResult.clauses.length} Clauses Extracted · {reviewResult.obligations.length} Obligations
          </span>
        </div>
      </div>

      {/* Playbook Risk Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-ink flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-proofline-crimson" />
            Playbook Deviations &amp; Risk Findings ({reviewResult.risks.length})
          </h3>
          <span className="text-[12px] text-ink-steel">Evaluated against UK Commercial SaaS Standard Playbook</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {reviewResult.risks.map((risk) => (
            <div
              key={risk.id}
              className={`p-5 rounded-card border shadow-subtle space-y-3 ${
                risk.severity === 'high' 
                  ? 'bg-proofline-crimson/5 border-proofline-crimson/30' 
                  : 'bg-proofline-ochre/5 border-proofline-ochre/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Badge variant={risk.severity === 'high' ? 'red' : 'ochre'} size="sm">
                    {risk.severity.toUpperCase()} RISK
                  </Badge>
                  <h4 className="text-[14px] font-semibold text-ink">
                    {risk.title}
                  </h4>
                </div>
                <span className="text-[11px] text-ink-steel font-mono">
                  {risk.playbookReference.split(':')[0]}
                </span>
              </div>

              <p className="text-[13px] text-ink-slate leading-relaxed">
                {risk.explanation}
              </p>

              <div className="bg-gallery-white/80 p-3 rounded-card-sm border border-border-hairline space-y-1.5">
                <span className="text-[11px] font-medium text-ink-steel flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-proofline-blue" />
                  Institutional Rule Reference:
                </span>
                <p className="text-[12px] text-ink font-sans">
                  {risk.playbookReference}
                </p>
              </div>

              {risk.suggestedRevision && (
                <div className="p-3 bg-gallery-paper rounded-card-sm border border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-proofline-blue flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Recommended Redline Revision:
                    </span>
                    <button
                      onClick={() => handleCopyRedline(risk)}
                      className="px-2 py-0.5 rounded text-[11px] bg-gallery-white border border-border-hairline hover:bg-gallery-mist flex items-center gap-1 text-ink transition-colors"
                    >
                      {copiedRiskId === risk.id ? <Check className="w-3 h-3 text-proofline-green" /> : <Copy className="w-3 h-3 text-ink-steel" />}
                      <span>{copiedRiskId === risk.id ? 'Copied' : 'Copy Markup'}</span>
                    </button>
                  </div>
                  <p className="text-[12.5px] font-mono text-ink bg-gallery-white p-2 rounded border border-border-hairline/60">
                    {risk.suggestedRevision}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Clause Matrix */}
      <div className="space-y-4 pt-4 border-t border-border-hairline">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-ink flex items-center gap-2">
            <Scale className="w-4 h-4 text-proofline-blue" />
            Clause Matrix &amp; Obligation Audit
          </h3>

          <div className="flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full-pill text-[11px] font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-ink text-white'
                    : 'text-ink-slate hover:bg-gallery-mist'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredClauses.map((clause) => (
            <div
              key={clause.id}
              className="p-4 bg-gallery-white border border-border-hairline rounded-card shadow-subtle space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">
                    {clause.category.toUpperCase().replace(/_/g, ' ')}
                  </Badge>
                  <h4 className="text-[13.5px] font-semibold text-ink">
                    {clause.clauseTitle}
                  </h4>
                </div>
                <span className="text-[11px] text-ink-steel">
                  Offset {clause.startOffset}–{clause.endOffset}
                </span>
              </div>

              <blockquote className="text-[12.5px] text-ink-slate italic border-l-2 border-proofline-blue/40 pl-3 my-2 leading-relaxed">
                "{clause.exactText}"
              </blockquote>

              {/* Obligations under this clause */}
              {reviewResult.obligations.filter(o => o.clauseId === clause.id).map(ob => (
                <div key={ob.id} className="pt-2 border-t border-border-hairline/60 flex items-center justify-between text-[11.5px] text-ink-steel">
                  <span><strong>Obligor:</strong> {ob.obligorParty} &bull; {ob.action}</span>
                  {ob.amountOrCap && <span className="font-semibold text-proofline-crimson">{ob.amountOrCap}</span>}
                  {ob.deadlineOrPeriod && <span>Deadline: {ob.deadlineOrPeriod}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
