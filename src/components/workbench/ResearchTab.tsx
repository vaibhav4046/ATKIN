import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Search,
  Scale
} from 'lucide-react';
import type { Authority } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface ResearchTabProps {
  authorities: Authority[];
}

export const ResearchTab: React.FC<ResearchTabProps> = ({ authorities }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAuthorities = authorities.filter(a => 
    a.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.citation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[920px] mx-auto py-2">
      {/* Tab Header & Jurisdiction Lock */}
      <div className="bg-gallery-white border border-border-hairline p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" size="sm">Primary Legislation</Badge>
            <Badge variant="green" size="sm">England &amp; Wales Jurisdiction</Badge>
          </div>
          <h2 className="text-[17px] font-semibold text-ink">
            Official Legal Shelf &amp; Statutory Authorities
          </h2>
          <p className="text-[12px] text-ink-slate mt-0.5">
            Curated statutory provisions from legislation.gov.uk verified in force.
          </p>
        </div>

        <div className="relative w-full sm:w-[240px]">
          <Search className="w-3.5 h-3.5 text-ink-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search statutes & sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[12px] bg-gallery-paper border border-border-hairline rounded-full-pill pl-8 pr-3 py-1.5 text-ink focus:border-proofline-blue focus:outline-none"
          />
        </div>
      </div>

      {/* SRA & The National Archives Official Warning Banner */}
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
          <span>Open Justice Licence v1.0</span>
        </div>
      </div>

      {/* Authorities List */}
      <div className="space-y-3.5">
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
  );
};
