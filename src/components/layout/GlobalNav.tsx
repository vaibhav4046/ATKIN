import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, ExternalLink, Sun, Moon } from 'lucide-react';
import { LegalModal } from '../common/LegalModal';
import { AtkinLogo } from '../common/AtkinLogo';
import { BRAND } from '../../content/brand';
import { applyTheme, getStoredTheme, type ThemeMode } from '../../design/theme';

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
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    setCurrentTheme(getStoredTheme());
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    applyTheme(next);
  };

  return (
    <>
      <header className="h-[52px] bg-atkin-bg/85 backdrop-blur border-b border-atkin-border fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 select-none">
        <div className="flex items-center gap-6">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 group text-left focus-visible:outline-none cursor-pointer"
            aria-label="ATKIN Sovereign Legal AI Home"
          >
            <AtkinLogo className="w-7 h-7 rounded-[4px] border border-atkin-border shadow-xs" />
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-[16px] tracking-tight text-atkin-ink">
                {BRAND.name}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-atkin-muted hidden sm:inline">
                Sovereign Ecosystem
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-5 text-[12.5px] text-atkin-muted font-sans font-medium" aria-label="Global Navigation">
            <a href="#proof" className="hover:text-atkin-ink transition-colors">
              Product Proof
            </a>
            <a href="#chapters" className="hover:text-atkin-ink transition-colors">
              Chapters
            </a>
            <a href="#security" className="hover:text-atkin-ink transition-colors">
              Privacy Boundaries
            </a>
            <a href="#download" className="hover:text-atkin-ink transition-colors">
              Download
            </a>
            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-atkin-ink transition-colors text-left cursor-pointer"
            >
              Data Isolation
            </button>
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-atkin-ink transition-colors text-left cursor-pointer"
            >
              Terms
            </button>
            <a 
              href="https://github.com/vaibhav4046/proofline" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-atkin-ink transition-colors flex items-center gap-1"
            >
              <span>Source</span>
              <ExternalLink className="w-3 h-3 text-atkin-muted" />
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-[4px] border border-atkin-border text-atkin-muted hover:text-atkin-ink hover:bg-atkin-surface transition-colors cursor-pointer"
            title="Toggle theme (Light / Dark)"
            aria-label="Toggle theme"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-atkin-ink" />
            )}
          </button>

          {activeView === 'landing' ? (
            <>
              <button
                onClick={onLoadSample}
                className="text-[12px] font-medium text-atkin-muted hover:text-atkin-ink px-3 py-1.5 rounded-[4px] border border-atkin-border hover:bg-atkin-surface transition-colors hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sample Matter</span>
              </button>
              <button
                onClick={onOpenWorkbench}
                className="text-[12px] font-medium bg-atkin-ink hover:opacity-90 text-atkin-bg px-3.5 py-1.5 rounded-[4px] transition-opacity flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onNavigateHome}
              className="text-[12px] font-medium text-atkin-muted hover:text-atkin-ink px-3 py-1.5 rounded-[4px] border border-atkin-border hover:bg-atkin-surface transition-colors cursor-pointer"
            >
              &larr; Exit to Overview
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-atkin-muted hover:text-atkin-ink rounded focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-[52px] left-0 right-0 bg-atkin-surface border-b border-atkin-border z-40 p-4 space-y-3 shadow-lg md:hidden text-[13px]">
          <div className="flex items-center gap-2 pb-2 border-b border-atkin-border">
            <AtkinLogo className="w-6 h-6 rounded-[4px]" />
            <span className="font-semibold text-atkin-ink text-[14px]">ATKIN Mobile Web</span>
          </div>
          <a 
            href="#proof" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-atkin-ink font-medium py-1"
          >
            Product Proof
          </a>
          <a 
            href="#chapters" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-atkin-ink font-medium py-1"
          >
            Chapters
          </a>
          <a 
            href="#security" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-atkin-ink font-medium py-1"
          >
            Privacy Boundaries
          </a>
          <a 
            href="#download" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-atkin-ink font-medium py-1"
          >
            Download
          </a>
          <button
            onClick={() => { setActiveLegalModal('privacy'); setMobileMenuOpen(false); }}
            className="block text-left text-atkin-ink font-medium py-1"
          >
            Data Isolation Policy
          </button>
          <button
            onClick={() => { setActiveLegalModal('terms'); setMobileMenuOpen(false); }}
            className="block text-left text-atkin-ink font-medium py-1"
          >
            Terms &amp; Professional Responsibility
          </button>
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
