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
  ArrowRight,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  X,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import type { 
  Document, 
  ContractReviewResult, 
  ContractClause,
  ContractRisk,
  ContractPlaybook 
} from '../../types/index.ts';
import { ContractReviewer, STANDARD_UK_SAAS_PLAYBOOK } from '../../engine/contract/contractReviewer.ts';
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

  const [activePlaybook, setActivePlaybook] = useState<ContractPlaybook>(() => contractReviewer.getStandardPlaybook());
  const [isPlaybookModalOpen, setIsPlaybookModalOpen] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
    return contractReviewer.reviewDocument(matterId, contractDoc, contractReviewer.getStandardPlaybook());
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

  const handleExportPlaybook = () => {
    const jsonStr = JSON.stringify(activePlaybook, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proofline-playbook-${activePlaybook.id || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportPlaybook = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const check = contractReviewer.validatePlaybookSchema(parsed);
        if (!check.valid || !check.playbook) {
          setImportFeedback({
            type: 'error',
            message: check.error || 'Failed schema validation for custom contract playbook.'
          });
          return;
        }

        const newPlaybook = check.playbook;
        setActivePlaybook(newPlaybook);
        if (contractDoc) {
          const newResult = contractReviewer.reviewDocument(matterId, contractDoc, newPlaybook);
          setReviewResult(newResult);
        }
        setImportFeedback({
          type: 'success',
          message: `Loaded custom firm playbook: "${newPlaybook.name}" (v${newPlaybook.version}) with ${newPlaybook.rules.length} institutional rules.`
        });
      } catch (err: any) {
        setImportFeedback({
          type: 'error',
          message: `JSON syntax error in playbook file: ${err.message}`
        });
      }
    };
    reader.readAsText(file);
    // Reset file input value so re-uploading same file triggers change
    event.target.value = '';
  };

  const handleResetStandardPlaybook = () => {
    const standard = contractReviewer.getStandardPlaybook();
    setActivePlaybook(standard);
    if (contractDoc) {
      setReviewResult(contractReviewer.reviewDocument(matterId, contractDoc, standard));
    }
    setImportFeedback({
      type: 'success',
      message: 'Restored standard institutional UK SaaS playbook.'
    });
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

      {/* Playbook Configuration & Sovereign Compliance Bar */}
      <div className="bg-gallery-white border border-border-hairline rounded-card p-4 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-proofline-blue/10 text-proofline-blue">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">{activePlaybook.name}</span>
              <span className="text-[11px] font-mono text-ink-steel px-1.5 py-0.5 rounded bg-gallery-mist">v{activePlaybook.version}</span>
              <span className="text-[11px] text-ink-slate font-medium">&bull; {activePlaybook.jurisdiction}</span>
            </div>
            <p className="text-[11.5px] text-ink-slate mt-0.5">
              {activePlaybook.description} ({activePlaybook.rules.length} institutional rules active)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setIsPlaybookModalOpen(true)}
            className="px-2.5 py-1.5 rounded text-[11.5px] font-medium bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-proofline-blue" />
            Inspect Rules ({activePlaybook.rules.length})
          </button>

          <button
            onClick={handleExportPlaybook}
            className="px-2.5 py-1.5 rounded text-[11.5px] font-medium bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink flex items-center gap-1.5 transition-colors"
            title="Export active rules as declarative JSON"
          >
            <Download className="w-3.5 h-3.5 text-ink-steel" />
            Export (.json)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportPlaybook}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded text-[11.5px] font-medium bg-proofline-blue hover:bg-proofline-blue/90 text-white flex items-center gap-1.5 transition-colors shadow-subtle"
            title="Import custom firm playbook JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Playbook
          </button>

          {activePlaybook.id !== STANDARD_UK_SAAS_PLAYBOOK.id && (
            <button
              onClick={handleResetStandardPlaybook}
              className="p-1.5 rounded text-ink-steel hover:text-ink hover:bg-gallery-mist transition-colors"
              title="Reset to default UK SaaS playbook"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Import Feedback Banner */}
      {importFeedback && (
        <div className={`p-3 rounded-card-sm border flex items-center justify-between text-[12px] ${
          importFeedback.type === 'success' 
            ? 'bg-proofline-green/10 border-proofline-green/30 text-proofline-green' 
            : 'bg-proofline-crimson/10 border-proofline-crimson/30 text-proofline-crimson'
        }`}>
          <div className="flex items-center gap-2">
            {importFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{importFeedback.message}</span>
          </div>
          <button onClick={() => setImportFeedback(null)} className="hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Playbook Risk Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-ink flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-proofline-crimson" />
            Playbook Deviations &amp; Risk Findings ({reviewResult.risks.length})
          </h3>
          <span className="text-[12px] text-ink-steel">Evaluated against {activePlaybook.name}</span>
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

      {/* Rules Inspector Modal */}
      {isPlaybookModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gallery-white border border-border-hairline rounded-card shadow-modal max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-border-hairline flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-proofline-blue" />
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">{activePlaybook.name}</h3>
                  <span className="text-[11.5px] text-ink-slate font-mono">v{activePlaybook.version} &bull; Jurisdiction: {activePlaybook.jurisdiction}</span>
                </div>
              </div>
              <button
                onClick={() => setIsPlaybookModalOpen(false)}
                className="p-1 rounded text-ink-steel hover:text-ink hover:bg-gallery-mist transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-[12.5px] text-ink-slate leading-relaxed">
                {activePlaybook.description}
              </p>

              <div className="space-y-3 pt-2">
                {activePlaybook.rules.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-card-sm border border-border-hairline bg-gallery-paper space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.severity === 'high' ? 'red' : 'ochre'} size="sm">
                          {rule.severity.toUpperCase()}
                        </Badge>
                        <h4 className="text-[13px] font-semibold text-ink">{rule.title}</h4>
                      </div>
                      <span className="text-[10.5px] font-mono text-ink-steel uppercase">{rule.category}</span>
                    </div>

                    <div className="text-[12px] space-y-1.5 text-ink-slate">
                      <div>
                        <strong className="text-ink font-medium">Target Position: </strong>
                        <span>{rule.targetPosition}</span>
                      </div>
                      {rule.acceptableFallbacks?.length > 0 && (
                        <div>
                          <strong className="text-ink font-medium">Acceptable Fallbacks: </strong>
                          <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                            {rule.acceptableFallbacks.map((fb, i) => (
                              <li key={i}>{fb}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rule.escalationTriggers?.length > 0 && (
                        <div>
                          <strong className="text-proofline-crimson font-medium">Escalation Triggers: </strong>
                          <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-proofline-crimson/90">
                            {rule.escalationTriggers.map((trig, i) => (
                              <li key={i}>{trig}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rule.requiredRedline && (
                        <div className="pt-1.5">
                          <strong className="text-proofline-blue font-medium">Standard Redline: </strong>
                          <pre className="mt-1 p-2 bg-gallery-white border border-border-hairline rounded text-[11px] font-mono text-ink overflow-x-auto whitespace-pre-wrap">
                            {rule.requiredRedline}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border-hairline flex items-center justify-between bg-gallery-mist/40">
              <span className="text-[11px] text-ink-steel font-mono">
                Proofline Sovereign Playbook Engine &bull; Zero External Network Calls
              </span>
              <button
                onClick={() => setIsPlaybookModalOpen(false)}
                className="px-3 py-1.5 rounded text-[12px] font-medium bg-ink text-white hover:bg-ink-slate transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
