import React, { useState } from 'react';
import { LandingHero } from './LandingHero';
import { ProductProof } from './ProductProof';
import { HumanJudgment } from './HumanJudgment';
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

      {/* Human Judgment. Replaces an earlier explorer that presented invented
          quotations and fabricated digests as verified case law. See the note
          at the top of HumanJudgment.tsx. */}
      <HumanJudgment onOpenWorkbench={onOpenWorkbench} />

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
