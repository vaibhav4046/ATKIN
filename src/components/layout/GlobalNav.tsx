import React, { useState } from 'react';
import { Scale, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
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

  return (
    <>
      <header className="h-[48px] bg-white border-b border-border-hairline fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 group text-left focus-visible:outline-none"
            aria-label="Proofline Sovereign Workbench Home"
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
            <a href="#landmark-matter" className="hover:text-ink transition-colors">
              Landmark Litigation
            </a>
            <a href="#court-admissibility" className="hover:text-ink transition-colors">
              Evidence Integrity
            </a>
            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-ink transition-colors flex items-center gap-1 text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-proofline-green" />
              <span>Zero-Egress Architecture</span>
            </button>
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-ink transition-colors text-left"
            >
              Terms &amp; SRA Compliance
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {activeView === 'landing' ? (
            <>
              <button
                onClick={onLoadSample}
                className="text-[12px] font-medium text-ink-slate hover:text-ink px-3 py-1.5 rounded-[4px] border border-border-hairline hover:bg-canvas-subtle transition-colors hidden sm:inline-flex items-center gap-1.5"
              >
                <span>Bates v Post Office [2019]</span>
              </button>
              <button
                onClick={onOpenWorkbench}
                className="text-[12px] font-medium bg-proofline-blue hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-[4px] transition-colors flex items-center gap-1.5 shadow-subtle"
              >
                <span>Open Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onNavigateHome}
              className="text-[12px] font-medium text-ink-slate hover:text-ink px-3 py-1.5 rounded-[4px] border border-border-hairline hover:bg-canvas-subtle transition-colors"
            >
              &larr; Exit to Documentation
            </button>
          )}
        </div>
      </header>

      {/* Global Terms & Privacy Notice Modals */}
      <LegalModal
        type={activeLegalModal || 'terms'}
        isOpen={activeLegalModal !== null}
        onClose={() => setActiveLegalModal(null)}
      />
    </>
  );
};
