import React from 'react';
import { Scale, ArrowRight, ShieldCheck } from 'lucide-react';

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
  return (
    <header className="h-[44px] bg-gallery-white/85 backdrop-blur-md border-b border-border-hairline fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 transition-colors">
      <div className="flex items-center gap-6">
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 group text-left focus:outline-none"
          aria-label="Proofline Home"
        >
          <div className="w-5 h-5 rounded-full bg-ink flex items-center justify-center text-white">
            <span className="text-[10px] font-semibold tracking-tighter">P</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-ink group-hover:text-proofline-blue transition-colors">
            Proofline
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-5 text-[13px] text-ink-slate font-medium">
          <a href="#why-it-matters" className="hover:text-ink transition-colors">Why It Matters</a>
          <a href="#how-it-works" className="hover:text-ink transition-colors">How It Works</a>
          <a href="#local-gemma" className="hover:text-ink transition-colors">Local Gemma 4</a>
          <a href="#rules-compliance" className="hover:text-ink transition-colors flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-proofline-green" />
            SRA Compliance
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {activeView === 'landing' ? (
          <>
            <button
              onClick={onLoadSample}
              className="text-[12px] font-medium text-ink-slate hover:text-ink px-3 py-1 rounded-full-pill hover:bg-gallery-mist transition-colors hidden sm:inline-block"
            >
              Load Sample Matter
            </button>
            <button
              onClick={onOpenWorkbench}
              className="text-[12px] font-medium bg-proofline-blue hover:bg-proofline-navy text-white px-3.5 py-1 rounded-full-pill transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Launch Workbench</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </>
        ) : (
          <button
            onClick={onNavigateHome}
            className="text-[12px] font-medium text-ink-slate hover:text-ink px-3 py-1 rounded-full-pill hover:bg-gallery-mist transition-colors"
          >
            ← Back to Overview
          </button>
        )}
      </div>
    </header>
  );
};
