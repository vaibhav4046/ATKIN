import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Menu, X, ExternalLink } from 'lucide-react';
import { LegalModal } from '../common/LegalModal.tsx';

interface GlobalNavProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
  activeView: 'landing' | 'workbench';
  onNavigateHome: () => void;
}

export const GlobalNav: React.FC<GlobalNavProps> = ({
  onOpenWorkbench,
  onLoadSample,
  activeView,
  onNavigateHome
}) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-[52px] bg-white border-b border-border-hairline fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 group text-left focus-visible:outline-none cursor-pointer"
            aria-label="Proofline Legal Workbench Home"
          >
            <div className="w-5 h-5 rounded-[3px] bg-ink flex items-center justify-center text-white font-mono font-bold text-[10px]">
              P
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-[15px] tracking-tight text-ink group-hover:text-proofline-blue transition-colors">
                Proofline
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-steel hidden sm:inline">
                Sovereign Counsel
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-5 text-[12.5px] text-ink-slate font-medium" aria-label="Global Navigation">
            <a href="#workflow-evidence" className="hover:text-ink transition-colors">
              Evidential Workflow
            </a>
            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-ink transition-colors flex items-center gap-1 text-left cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-proofline-green" />
              <span>Where Data Goes</span>
            </button>
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-ink transition-colors text-left cursor-pointer"
            >
              Terms &amp; SRA Notice
            </button>
            <a 
              href="https://github.com/vaibhav-lalwani/proofline" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-ink transition-colors flex items-center gap-1"
            >
              <span>Open Source</span>
              <ExternalLink className="w-3 h-3 text-ink-steel" />
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {activeView === 'landing' ? (
            <>
              <button
                onClick={onLoadSample}
                className="text-[12px] font-medium text-ink-slate hover:text-ink px-3 py-1.5 rounded-[4px] border border-border-hairline hover:bg-canvas-subtle transition-colors hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore Sample</span>
              </button>
              <button
                onClick={onOpenWorkbench}
                className="text-[12px] font-medium bg-proofline-blue hover:bg-proofline-navy text-white px-3.5 py-1.5 rounded-[4px] transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer"
              >
                <span>Launch Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onNavigateHome}
              className="text-[12px] font-medium text-ink-slate hover:text-ink px-3 py-1.5 rounded-[4px] border border-border-hairline hover:bg-canvas-subtle transition-colors cursor-pointer"
            >
              &larr; Exit to Documentation
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-ink-slate hover:text-ink rounded focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-[52px] left-0 right-0 bg-white border-b border-border-hairline z-40 p-4 space-y-3 shadow-lg md:hidden text-[13px]">
          <a 
            href="#workflow-evidence" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-ink font-medium py-1"
          >
            Evidential Workflow
          </a>
          <button
            onClick={() => { setActiveLegalModal('privacy'); setMobileMenuOpen(false); }}
            className="block text-left text-ink font-medium py-1"
          >
            Where Data Goes (Privacy)
          </button>
          <button
            onClick={() => { setActiveLegalModal('terms'); setMobileMenuOpen(false); }}
            className="block text-left text-ink font-medium py-1"
          >
            Terms &amp; SRA Notice
          </button>
          <a
            href="https://github.com/vaibhav-lalwani/proofline"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-ink font-medium py-1"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-steel" />
          </a>
        </div>
      )}

      {/* Global Terms & Privacy Notice Modals */}
      <LegalModal
        type={activeLegalModal || 'terms'}
        isOpen={activeLegalModal !== null}
        onClose={() => setActiveLegalModal(null)}
      />
    </>
  );
};
