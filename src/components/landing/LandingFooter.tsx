import React from 'react';
import { AtkinLogo } from '../common/AtkinLogo';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { BRAND } from '../../content/brand';

interface LandingFooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenPrivacy,
  onOpenTerms
}) => {
  return (
    <footer className="py-16 px-4 sm:px-8 border-t border-atkin-border max-w-[1180px] mx-auto w-full select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-atkin-border/60">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <AtkinLogo className="w-7 h-7 rounded-[4px] border border-atkin-border" />
            <span className="font-serif text-lg tracking-tight text-atkin-ink font-semibold">
              {BRAND.name}
            </span>
            <span className="text-[11px] font-mono text-atkin-muted px-2 py-0.5 rounded bg-atkin-surface border border-atkin-border">
              v1.2.0
            </span>
          </div>
          <p className="text-[13px] text-atkin-muted max-w-[420px] font-sans leading-relaxed">
            Sovereign legal intelligence platform. Private matter computation, verified citation provenance, and model independence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[12.5px] font-sans text-atkin-muted">
          <button
            onClick={onOpenPrivacy}
            className="hover:text-atkin-ink transition-colors cursor-pointer text-left"
          >
            Privacy &amp; Data Isolation
          </button>
          <button
            onClick={onOpenTerms}
            className="hover:text-atkin-ink transition-colors cursor-pointer text-left"
          >
            Terms &amp; Professional Responsibility
          </button>
          <a
            href="https://github.com/vaibhav4046/proofline"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-atkin-ink transition-colors flex items-center gap-1"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] font-mono text-atkin-muted">
        <div>
          © {new Date().getFullYear()} ATKIN Ecosystem. Published under MIT License.
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-atkin-ink" />
          <span>Local-first architecture · Client data never used for model training</span>
        </div>
      </div>
    </footer>
  );
};
