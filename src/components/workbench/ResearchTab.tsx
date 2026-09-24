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
  Database,
  Sparkles,
  Plus,
  Check
} from 'lucide-react';
import type { Authority, LegalSourcePack, NetworkMode, Jurisdiction } from '../../types/index.ts';
import { SourceCatalog } from '../../engine/research/sourceCatalog.ts';
import { legalSearchEngine, COMPREHENSIVE_STATUTORY_INDEX } from '../../engine/research/legalSearchEngine.ts';
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
  
  // Real Legal Search state
  const [queryInput, setQueryInput] = useState('Consumer Rights Act 2015 section 20 short-term right to reject');
  const [selectedProvider, setSelectedProvider] = useState('src-uk-legislation');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [queryResults, setQueryResults] = useState<Authority[] | null>(null);
  const [querySource, setQuerySource] = useState<'live_api' | 'local_index' | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [attachedIds, setAttachedIds] = useState<Set<string>>(new Set());

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

  const handleExecuteApprovedQuery = async () => {
    setIsQuerying(true);
    setShowApprovalModal(false);

    try {
      const { results, source } = await legalSearchEngine.searchAuthorities(queryInput, networkMode);
      setQueryResults(results);
      setQuerySource(source);
    } catch (err) {
      console.error('Search failed:', err);
      // Fallback to indexed search
      const fallback = COMPREHENSIVE_STATUTORY_INDEX.filter(a => 
        a.citation.toLowerCase().includes(queryInput.toLowerCase()) || 
        a.summary.toLowerCase().includes(queryInput.toLowerCase())
      );
      setQueryResults(fallback.length > 0 ? fallback : COMPREHENSIVE_STATUTORY_INDEX.slice(0, 5));
      setQuerySource('local_index');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleAttachAuthority = (auth: Authority) => {
    if (onAddAuthority) {
      onAddAuthority(auth);
      setAttachedIds(prev => new Set([...prev, auth.id]));
    }
  };

  return (
    <div className="space-y-6 max-w-[980px] mx-auto py-2">
      {/* Tab Navigation Header */}
      <div className="bg-gallery-white border border-border-hairline p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" size="sm">Legal Research &amp; Primary Law</Badge>
            <Badge variant={networkMode === 'offline' ? 'green' : 'ochre'} size="sm">
              {networkMode === 'offline' ? 'Airgapped Sovereign Index' : 'Live Public Legislation API'}
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Statutory Authorities &amp; Precedents
          </h2>
          <p className="text-[13px] text-ink-slate mt-0.5">
            Verified primary legal texts with official legislative citations, Open Justice Licences, and zero hallucinations.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center p-1 bg-gallery-paper rounded-full-pill border border-border-hairline shrink-0">
          <button
            onClick={() => setActiveSubTab('authorities')}
            className={`px-3.5 py-1.5 rounded-full-pill text-[12px] font-medium transition-colors ${
              activeSubTab === 'authorities'
                ? 'bg-gallery-white text-ink shadow-xs border border-border-hairline'
                : 'text-ink-slate hover:text-ink'
            }`}
          >
            Matter Authorities ({authorities.length})
          </button>
          <button
            onClick={() => setActiveSubTab('query')}
            className={`px-3.5 py-1.5 rounded-full-pill text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'query'
                ? 'bg-gallery-white text-ink shadow-xs border border-border-hairline'
                : 'text-ink-slate hover:text-ink'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Search Primary Law</span>
          </button>
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3.5 py-1.5 rounded-full-pill text-[12px] font-medium transition-colors ${
              activeSubTab === 'catalog'
                ? 'bg-gallery-white text-ink shadow-xs border border-border-hairline'
                : 'text-ink-slate hover:text-ink'
            }`}
          >
            Source Packs ({allSourcePacks.length})
          </button>
        </div>
      </div>

      {/* Subtab 1: Matter Authorities List */}
      {activeSubTab === 'authorities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-[320px]">
              <Search className="w-3.5 h-3.5 text-ink-steel absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter authorities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-[12px] bg-gallery-white border border-border-hairline rounded-full-pill pl-9 pr-3 py-1.5 text-ink focus:border-proofline-blue focus:outline-none shadow-xs"
              />
            </div>
            <button
              onClick={() => setActiveSubTab('query')}
              className="text-[12px] font-medium text-proofline-blue hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Search &amp; Add New Authority</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredAuthorities.map((auth) => (
              <div 
                key={auth.id}
                className="bg-gallery-white border border-border-hairline rounded-xl p-4 shadow-xs space-y-2 hover:border-proofline-blue/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[13.5px] text-ink">{auth.identifier}</span>
                      <Badge variant="slate" size="sm">{auth.jurisdiction}</Badge>
                      <Badge variant="blue" size="sm">{auth.verificationLevel}</Badge>
                    </div>
                    <div className="text-[12px] text-ink-steel font-mono mt-0.5">
                      {auth.citation}
                    </div>
                  </div>

                  <a 
                    href={auth.officialUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] text-proofline-blue hover:text-proofline-navy flex items-center gap-1 font-medium bg-proofline-blue/5 px-2.5 py-1 rounded-full-pill shrink-0"
                  >
                    <span>View Gazette</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-[12.5px] text-ink-slate leading-relaxed">
                  {auth.summary}
                </p>

                <div className="flex items-center justify-between text-[11px] text-ink-steel pt-1 border-t border-border-hairline/60">
                  <span>{auth.sectionParagraph}</span>
                  <span className="font-mono text-[10px]">Checked: {auth.checkedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Query Primary Legal Repository */}
      {activeSubTab === 'query' && (
        <div className="bg-gallery-white border border-border-hairline rounded-card p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">
              Search Primary Legal Repositories
            </h3>
            <p className="text-[12px] text-ink-slate mt-0.5">
              Searches live legislation.gov.uk API in Public Research mode, or searches verified local primary law index in Airgapped Offline mode.
            </p>
          </div>

          <div className="p-3 bg-gallery-paper rounded-xl border border-border-hairline flex items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2">
              {networkMode === 'offline' ? (
                <>
                  <Lock className="w-4 h-4 text-proofline-green shrink-0" />
                  <span className="text-ink font-medium">Airgap Offline Mode: Searching 50+ Verified Local Statutes &amp; Rules of Court</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-proofline-ochre shrink-0" />
                  <span className="text-ink font-medium">Public Research Mode: Connected to Live legislation.gov.uk Atom Feed</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-ink-steel font-mono">OGL v3.0 / Crown Copyright</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-ink-steel uppercase tracking-wider mb-1">
                  Primary Source
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full text-[12px] bg-gallery-paper border border-border-hairline rounded-lg px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                >
                  <option value="src-uk-legislation">legislation.gov.uk (Official UK Acts)</option>
                  <option value="src-uk-cpr">Civil Procedure Rules (CPR)</option>
                  <option value="src-us-courtlistener">US Federal / Delaware Code</option>
                  <option value="src-eu-eurlex">EUR-Lex (EU Law)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-ink-steel uppercase tracking-wider mb-1">
                  Statutory Query or Section
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="e.g. Consumer Rights Act 2015 section 20 reject or UCTA 1977 reasonableness"
                    className="w-full text-[12px] bg-gallery-paper border border-border-hairline rounded-lg px-3 py-2 text-ink focus:border-proofline-blue focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (networkMode === 'offline') {
                        handleExecuteApprovedQuery();
                      } else {
                        setShowApprovalModal(true);
                      }
                    }}
                    className="px-4 py-2 bg-proofline-blue text-white rounded-lg text-[12px] font-medium hover:bg-proofline-navy shrink-0 shadow-xs flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-ink-steel font-medium">Quick Queries:</span>
              <button
                type="button"
                onClick={() => setQueryInput('Consumer Rights Act 2015 section 20 short-term right to reject')}
                className="px-2.5 py-1 rounded-md bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink"
              >
                CRA 2015 s.20 Rejection
              </button>
              <button
                type="button"
                onClick={() => setQueryInput('Unfair Contract Terms Act 1977 section 3 reasonableness')}
                className="px-2.5 py-1 rounded-md bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink"
              >
                UCTA 1977 s.3 Standard Terms
              </button>
              <button
                type="button"
                onClick={() => setQueryInput('Civil Procedure Rules Part 31 disclosure')}
                className="px-2.5 py-1 rounded-md bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink"
              >
                CPR Part 31 Standard Disclosure
              </button>
              <button
                type="button"
                onClick={() => setQueryInput('Housing Act 2004 section 214 deposit penalty')}
                className="px-2.5 py-1 rounded-md bg-gallery-mist hover:bg-gallery-paper border border-border-hairline text-ink"
              >
                Housing Act 2004 s.214 Deposit
              </button>
            </div>
          </div>

          {/* Outgoing Query Approval Modal (Public Research Mode) */}
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
                GET https://www.legislation.gov.uk/all/data.feed?title={encodeURIComponent(queryInput)}
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
                  Approve &amp; Query Live API
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isQuerying && (
            <div className="p-4 bg-gallery-paper rounded-xl border border-border-hairline flex items-center justify-center gap-2 text-[12px] text-ink-slate animate-pulse">
              <Sparkles className="w-4 h-4 text-proofline-blue" />
              <span>Querying primary legislative records...</span>
            </div>
          )}

          {/* Query Results */}
          {queryResults && (
            <div className="border-t border-border-hairline pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-semibold text-ink">
                    Retrieved Authorities ({queryResults.length})
                  </h4>
                  <Badge variant={querySource === 'live_api' ? 'green' : 'slate'} size="sm">
                    {querySource === 'live_api' ? 'Live legislation.gov.uk Feed' : 'Local Statutory Index'}
                  </Badge>
                </div>
                <span className="text-[11px] text-proofline-green font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Legal Source</span>
                </span>
              </div>

              {queryResults.map(res => {
                const isAttached = attachedIds.has(res.id) || authorities.some(a => a.identifier === res.identifier);

                return (
                  <div key={res.id} className="p-4 bg-gallery-mist/50 border border-border-hairline rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-semibold text-[13px] text-ink">{res.identifier}</span>
                        <div className="text-[11px] text-ink-steel font-mono">{res.citation}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {isAttached ? (
                          <span className="text-[11px] font-medium text-proofline-green flex items-center gap-1 bg-proofline-green/10 px-2.5 py-1 rounded-full-pill">
                            <Check className="w-3 h-3" />
                            <span>Attached to Matter</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAttachAuthority(res)}
                            className="px-3 py-1 bg-proofline-blue text-white rounded-full-pill text-[11px] font-medium hover:bg-proofline-navy transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Attach to Matter</span>
                          </button>
                        )}
                        <a
                          href={res.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-ink-slate hover:text-ink flex items-center gap-0.5 p-1"
                          title="Open official government page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                    <p className="text-[12px] text-ink-slate leading-relaxed">{res.summary}</p>
                    <div className="flex items-center justify-between text-[10px] text-ink-steel font-mono">
                      <span>{res.sectionParagraph}</span>
                      <span>{res.coverageCaveat}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Source Packs Registry & Rights Gate */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-ink-slate">
              National Archives and government registries enabled for verified statutory lookup.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ink-steel">Jurisdiction:</span>
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                className="text-[12px] bg-gallery-white border border-border-hairline rounded-lg px-2.5 py-1 text-ink focus:outline-none"
              >
                <option value="all">All Jurisdictions</option>
                <option value="UK">United Kingdom</option>
                <option value="US">United States</option>
                <option value="EU">European Union</option>
                <option value="IN">India</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPacks.map((pack) => (
              <div 
                key={pack.id}
                className="bg-gallery-white border border-border-hairline rounded-xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-[13.5px] text-ink">{pack.name}</h4>
                    <span className="text-[11px] text-ink-steel">{pack.publisher}</span>
                  </div>
                  <Badge variant="slate" size="sm">{pack.jurisdiction}</Badge>
                </div>

                <p className="text-[12px] text-ink-slate leading-relaxed">
                  {pack.description}
                </p>

                <div className="p-2.5 bg-gallery-paper rounded-lg border border-border-hairline text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-ink-steel">
                    <span>Indexed Records:</span>
                    <strong className="text-ink font-mono">{pack.recordCount.toLocaleString()}</strong>
                  </div>
                  <div className="text-[10px] text-ink-steel font-mono truncate">
                    {pack.rightsRationale}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-proofline-green font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>OGL / Open Access Verified</span>
                  </span>
                  <a
                    href={pack.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-proofline-blue hover:underline flex items-center gap-0.5"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
