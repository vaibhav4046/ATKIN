import React, { useState } from 'react';
import { LandingHero } from './LandingHero';
import { ProductProof } from './ProductProof';
import { LivingSpanAssembler } from './LivingSpanAssembler';
import { ProductChapters } from './ProductChapters';
import { SecurityMatrix } from './SecurityMatrix';
import { DownloadSection } from './DownloadSection';
import { LandingFooter } from './LandingFooter';
import { LegalModal } from '../common/LegalModal';

interface LandingPageProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
  onNewMatter?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWorkbench,
  onLoadSample,
  onNewMatter
}) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  return (
    <div className="pt-[52px] w-full min-h-screen bg-atkin-bg text-atkin-ink selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-sans">
      {/* Chapter 01: Hero with anime advocate mark and sovereign positioning */}
      <LandingHero
        onOpenWorkbench={onOpenWorkbench}
        onLoadSample={onLoadSample}
        onNewMatter={onNewMatter}
      />

      {/* Chapter 02: Real Product Proof (Alder Peak Clause 3.2 37-day notice) */}
      <ProductProof
        onOpenWorkbench={onOpenWorkbench}
        onLoadSample={onLoadSample}
      />

      {/* Interactive Span Grounding & Contradiction Explorer */}
      <div className="py-16 px-4 sm:px-8 border-b border-atkin-border max-w-[1180px] mx-auto w-full">
        <LivingSpanAssembler
          onOpenWorkbench={onOpenWorkbench}
          onLoadSample={onLoadSample}
        />
      </div>

      {/* Chapter 03: Sequential Numbered Chapters (#01 WORK to #06 MOVE) */}
      <ProductChapters />

      {/* Chapter 04: Privacy & Sovereign Isolation Matrix */}
      <SecurityMatrix />

      {/* Chapter 05: Download Native Clients (Windows, Android APK, Source) */}
      <DownloadSection />

      {/* Chapter 06: Minimalist Legal Footer */}
      <LandingFooter
        onOpenPrivacy={() => setActiveLegalModal('privacy')}
        onOpenTerms={() => setActiveLegalModal('terms')}
      />

      {/* Legal & Professional Notice Modals */}
      <LegalModal
        isOpen={activeLegalModal !== null}
        initialTab={activeLegalModal || 'privacy'}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
};
