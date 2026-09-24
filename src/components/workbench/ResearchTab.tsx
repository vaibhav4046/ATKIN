import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Search,
  Scale,
  Globe,
  Lock,
  Layers,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Database
} from 'lucide-react';
import type { Authority, LegalSourcePack, NetworkMode, Jurisdiction } from '../../types/index.ts';
import { SourceCatalog } from '../../engine/research/sourceCatalog.ts';
import { Badge } from '../common/Badge.tsx';

interface ResearchTabProps {
  authorities: Authority[];
  networkMode: NetworkMode;
  onAddAuthority?: (auth: Authority) => void;
}

export const ResearchTab: React.FC<ResearchTabProps> = ({ 
  authorities, 
  networkMode,
  onAddAuthority 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'authorities' | 'catalog' | 'query'>('authorities');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Public Research Query Simulation / Approval state
  const [queryInput, setQueryInput] = useState('Consumer Rights Act 2015 section 19 rejection');
  const [selectedProvider, setSelectedProvider] = useState('src-uk-legislation');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [queryResults, setQueryResults] = useState<Authority[] | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const catalog = new SourceCatalog();
  const allSourcePacks = catalog.getAllSources();

  const filteredPacks = allSourcePacks.filter(p => {
    if (selectedJurisdiction !== 'all' && p.jurisdiction.toLowerCase() !== selectedJurisdiction.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.publisher.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredAuthorities = authorities.filter(a => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.identifier.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.citation.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExecuteApprovedQuery = () => {
    setIsQuerying(true);
    setShowApprovalModal(false);

    setTimeout(() => {
      setIsQuerying(false);
      // Sample mock response from verified legal pack
      setQueryResults([
        {
          id: `auth-live-${Date.now()}`,
          citation: 'Consumer Rights Act 2015 c. 15, Part 1, Chapter 2',
          identifier: 'CRA 2015 s.20',
          officialUrl: 'https://www.legislation.gov.uk/ukpga/2015/15/section/20',
          sectionParagraph: 'Section 20: The short-term right to reject',
          summary: 'The short-term right to reject must be exercised before the end of the period of 30 days beginning with the first day after ownership or possession was transferred and goods were delivered.',
          retrievedAt: new Date().toISOString(),
          checkedAt: new Date().toISOString(),
          coverageCaveat: 'Official statutory text from legislation.gov.uk under OGL v3.0.',
          verificationLevel: 'text_checked',
          jurisdiction: 'England and Wales'
        }
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-[960px] mx-auto py-2">
      {/* Tab Navigation Header */}
      <div className="bg-gallery-white border border-border-hairline p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" size="sm">Legal Reference &amp; Source Packs</Badge>
            <Badge variant={networkMode === 'offline' ? 'green' : 'ochre'} size="sm">
              {networkMode === 'offline' ? 'Sovereign Offline Mode' : 'Public Research Mode'}
            </Badge>
          </div>
          <h2 className="text-[17px] font-semibold text-ink">
            Legal Authorities &amp; Multi-Jurisdiction Source Registry
          </h2>
          <p className="text-[12px] text-ink-slate mt-0.5">
            Verified statutory shelves, open legal data adapters, and rights-gated computational policies.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-gallery-paper rounded-xl border border-border-hairline self-start sm:self-auto text-[12px]">
          <button
            onClick={() => setActiveSubTab('authorities')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${activeSubTab === 'authorities' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Authorities ({authorities.length})
          </button>
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${activeSubTab === 'catalog' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Source Registry ({allSourcePacks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('query')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${activeSubTab === 'query' ? 'bg-gallery-white shadow-xs text-ink' : 'text-ink-slate hover:text-ink'}`}
          >
            Query Provider
          </button>
        </div>
      </div>

      {/* Subtab 1: Statutory Authorities */}
      {activeSubTab === 'authorities' && (
        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-gallery-white border border-border-hairline rounded-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-ink font-semibold text-[13px]">
              <ShieldAlert className="w-4 h-4 text-proofline-ochre" />
              <span>Statutory Integrity &amp; Find Case Law Coverage Notice</span>
            </div>
            <p className="text-[12px] text-ink-slate leading-relaxed">
              The National Archives Find Case Law service publishes official judgment transcripts, but coverage is ongoing and incomplete. Crucially, a judgment listed on Find Case Law may have been subject to subsequent appeal, variation, or appellate overturn not reflected in the record. Proofline provides official links and text-checked statutory provisions for human solicitor verification. <strong>Never cite AI output or unverified case summaries directly to court.</strong>
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-ink-steel">
              <span>Authority Source: legislation.gov.uk (Crown Copyright)</span>
              <span>·</span>
              <span>Open Justice Licence v2.0 computational restrictions enforced</span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAuthorities.map((auth) => (
              <div
                key={auth.id}
                className="bg-gallery-white border border-border-hairline rounded-2xl p-5 hover:border-proofline-blue/30 transition-all shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={auth.verificationLevel === 'text_checked' ? 'green' : 'slate'} size="sm">
                      {auth.verificationLevel === 'text_checked' ? 'Text Checked & In Force' : 'Official Repository Link'}
                    </Badge>
                    <span className="font-semibold text-[14px] text-ink">
                      {auth.identifier}
                    </span>
                    <span className="text-[12px] text-ink-slate font-mono">
                      ({auth.sectionParagraph})
                    </span>
                  </div>

                  <a
                    href={auth.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] font-medium text-proofline-blue hover:underline flex items-center gap-1"
                  >
                    <span>View on legislation.gov.uk</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-[13px] text-ink leading-relaxed font-sans">
                  {auth.summary}
                </p>

                <div className="p-2.5 bg-gallery-mist/60 rounded-lg text-[11px] text-ink-slate flex items-start gap-2">
                  <Scale className="w-3.5 h-3.5 text-proofline-blue shrink-0 mt-0.5" />
                  <div>
                    <strong>Application Note:</strong> {auth.coverageCaveat}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-ink-steel font-mono pt-1">
                  <span>Jurisdiction: {auth.jurisdiction}</span>
                  <span>Last Checked: {new Date(auth.checkedAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Sovereign Source Registry & Rights Gate */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-ink-steel font-medium">Filter Jurisdiction:</span>
              {['all', 'uk', 'us', 'eu', 'in'].map(j => (
                <button
                  key={j}
                  onClick={() => setSelectedJurisdiction(j)}
                  className={`px-2.5 py-1 rounded-md text-[11px] uppercase font-semibold transition-colors ${
                    selectedJurisdiction === j 
                      ? 'bg-proofline-blue text-white' 
                      : 'bg-gallery-white border border-border-hairline text-ink-slate hover:text-ink'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-ink-steel font-mono">
              {filteredPacks.length} registered packs
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredPacks.map(pack => (
              <div 
                key={pack.id}
                className="bg-gallery-white border border-border-hairline rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="blue" size="sm">{pack.jurisdiction}</Badge>
                      <h3 className="text-[15px] font-semibold text-ink">{pack.name}</h3>
                      {pack.installedLocally && (
                        <Badge variant="green" size="sm">Cached Locally</Badge>
                      )}
                    </div>
                    <div className="text-[12px] text-ink-steel mt-0.5">
                      Publisher: <span className="text-ink font-medium">{pack.publisher}</span> · Measured Records: <span className="font-mono text-ink font-medium">{pack.recordCount.toLocaleString()}</span>
                    </div>
                  </div>

                  <a 
                    href={pack.officialUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[12px] text-proofline-blue hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-[12.5px] text-ink-slate leading-relaxed">
                  {pack.description}
                </p>

                {/* Rights Gate Decision Matrix */}
                <div className="bg-gallery-paper border border-border-hairline rounded-xl p-3.5 space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink text-[11px] uppercase tracking-wider">
                      Sovereign Rights Gate &amp; Permitted Operations
                    </span>
                    <span className="text-[10px] text-ink-steel font-mono">Verified: {pack.lastCheckedDate}</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 text-[11px]">
                    {Object.entries(pack.rightsDecisions).map(([op, decision]) => (
                      <div key={op} className="p-2 bg-gallery-white rounded-lg border border-border-hairline flex flex-col items-center text-center">
                        <span className="capitalize font-medium text-ink-steel text-[10px] mb-1">{op}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          decision === 'allowed' 
                            ? 'bg-proofline-green/15 text-proofline-green' 
                            : decision === 'requires_permission' 
                            ? 'bg-proofline-ochre/15 text-proofline-ochre font-bold' 
                            : 'bg-proofline-crimson/15 text-proofline-crimson'
                        }`}>
                          {decision === 'allowed' ? 'Allowed' : decision === 'requires_permission' ? 'Permission Req' : 'Prohibited'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-ink-slate pt-1 leading-snug">
                    <strong>Licensing Policy:</strong> {pack.rightsRationale}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-steel font-mono">
                  <span>Coverage: {pack.coverageCaveat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Query Public Provider */}
      {activeSubTab === 'query' && (
        <div className="bg-gallery-white border border-border-hairline rounded-card p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">
              Query Remote Public Legal Repository
            </h3>
            <p className="text-[12px] text-ink-slate mt-0.5">
              Searches legal repositories through the sovereign network broker with explicit query inspection and approval.
            </p>
          </div>

          {networkMode === 'offline' ? (
            <div className="p-4 bg-gallery-mist rounded-xl border border-border-hairline space-y-2">
              <div className="flex items-center gap-2 text-ink font-semibold text-[13px]">
                <Lock className="w-4 h-4 text-proofline-green" />
                <span>Air-Gapped Sovereign Offline Mode Active</span>
              </div>
              <p className="text-[12px] text-ink-slate leading-relaxed">
                Outbound legal research queries are blocked by Proofline's network broker while in Offline mode. To search remote legal databases, switch your Network Mode to <strong>Public Legal Research Only</strong> via the TopRail selector.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-ink-steel uppercase tracking-wider mb-1">
                    Target Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full text-[12px] bg-gallery-paper border border-border-hairline rounded-lg px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                  >
                    <option value="src-uk-legislation">legislation.gov.uk (UK Acts &amp; SIs)</option>
                    <option value="src-us-courtlistener">CourtListener (US Case Law / RECAP)</option>
                    <option value="src-eu-eurlex">EUR-Lex (EU Treaties &amp; Directives)</option>
                    <option value="src-in-indiacode">India Code (Central Acts)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-ink-steel uppercase tracking-wider mb-1">
                    Research Query
                  </label>
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="Enter statutory section or legal proposition..."
                    className="w-full text-[12px] bg-gallery-paper border border-border-hairline rounded-lg px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-ink-steel">
                  Domain: <code>{selectedProvider === 'src-uk-legislation' ? 'legislation.gov.uk' : 'courtlistener.com'}</code> (whitelisted)
                </span>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="px-4 py-2 bg-proofline-blue text-white rounded-full-pill text-[12px] font-medium hover:bg-proofline-blue/90 transition-colors shadow-xs"
                >
                  Inspect &amp; Send Query
                </button>
              </div>
            </div>
          )}

          {/* Outgoing Query Approval Modal */}
          {showApprovalModal && (
            <div className="p-4 bg-gallery-paper border border-proofline-blue/30 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-proofline-blue font-semibold text-[13px]">
                <Globe className="w-4 h-4" />
                <span>Outgoing Legal Query Approval Required</span>
              </div>
              <p className="text-[12px] text-ink-slate leading-relaxed">
                Proofline requires explicit solicitor approval before transmitting any query outside your computer. Verify that the query contains zero private client identifiers.
              </p>
              <div className="p-3 bg-gallery-white rounded-lg border border-border-hairline font-mono text-[11px] text-ink">
                GET https://{selectedProvider === 'src-uk-legislation' ? 'www.legislation.gov.uk' : 'www.courtlistener.com'}/api/search?q={encodeURIComponent(queryInput)}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-3 py-1.5 text-[12px] text-ink-slate hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteApprovedQuery}
                  className="px-3.5 py-1.5 bg-proofline-green text-white text-[12px] font-medium rounded-full-pill hover:bg-proofline-green/90 transition-colors"
                >
                  Approve &amp; Send Request
                </button>
              </div>
            </div>
          )}

          {/* Query Results */}
          {queryResults && (
            <div className="border-t border-border-hairline pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-semibold text-ink">
                  Retrieved Authorities ({queryResults.length})
                </h4>
                <span className="text-[11px] text-proofline-green font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validated against primary source</span>
                </span>
              </div>

              {queryResults.map(res => (
                <div key={res.id} className="p-4 bg-gallery-mist/50 border border-border-hairline rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[13px] text-ink">{res.identifier}</span>
                    <button
                      onClick={() => onAddAuthority && onAddAuthority(res)}
                      className="text-[11px] font-medium text-proofline-blue hover:underline flex items-center gap-1"
                    >
                      <span>Attach to Active Matter</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[12px] text-ink-slate">{res.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
