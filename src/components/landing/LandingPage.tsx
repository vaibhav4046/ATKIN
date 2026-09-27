import React, { useState } from 'react';
import { LandingHero } from './LandingHero';
import { ProductProof } from './ProductProof';
import { HumanJudgment } from './HumanJudgment';
import { ProductChapters } from './ProductChapters';
import { SecurityMatrix } from './SecurityMatrix';
import { ProductShots } from './ProductShots';
import { LandingFaq } from './LandingFaq';
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
    // bg-atkin-bg, not bg-atkin-ink. The root was painted with the *ink* token,
    // which happens to be the same colour as body text. Anything whose ancestor
    // chain was transparent -- the hero copy over the photograph, most visibly --
    // therefore measured 1:1 against the root. With the hero reading scrim in
    // place, bg is also the colour genuinely sitting behind that copy, so this is
    // the accurate token as well as the correct one.
    <div className="pt-[52px] w-full min-h-screen bg-atkin-bg text-atkin-ink selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-sans">
      {/* Scroll reveals are attached here rather than inside each section, so the
          motion system stays decoupled from section internals. GSAP animates with
          `from()`, so if the script never runs the content is simply already
          visible -- nothing here is hidden by CSS waiting to be revealed. */}
      <div className="atkin-reveal">
        {/* Chapter 01: Hero with anime advocate mark and sovereign positioning */}
        <LandingHero
          onOpenWorkbench={onOpenWorkbench}
          onLoadSample={onLoadSample}
          onNewMatter={onNewMatter}
        />
      </div>

      <div className="atkin-reveal">
        {/* Chapter 02: Real Product Proof (Alder Peak Clause 3.2 37-day notice) */}
        <ProductProof
          onOpenWorkbench={onOpenWorkbench}
          onLoadSample={onLoadSample}
        />
      </div>

      <div className="atkin-reveal">
        {/* Human Judgment. Replaces an earlier explorer that presented invented
            quotations and fabricated digests as verified case law. See the note
            at the top of HumanJudgment.tsx. */}
        <HumanJudgment onOpenWorkbench={onOpenWorkbench} />
      </div>

      <div className="atkin-reveal">
        {/* Chapter 03: Sequential Numbered Chapters (#01 WORK to #06 MOVE) */}
        <ProductChapters />
      </div>

      <div className="atkin-reveal">
        {/* Chapter 04: Privacy & Sovereign Isolation Matrix */}
        <SecurityMatrix />
      </div>

      <div className="atkin-reveal">
        {/* Real product photography, captured from the running application. */}
        <ProductShots />
      </div>

      <div className="atkin-reveal">
        {/* Chapter 05: Download Native Clients (Windows, Android APK, Source) */}
        <DownloadSection />
      </div>

      <div className="atkin-reveal">
        {/* Buyer anxieties, answered with what the audit actually verified. */}
        <LandingFaq />
      </div>

      <div className="atkin-reveal">
        {/* Chapter 06: Minimalist Legal Footer */}
        <LandingFooter
          onOpenPrivacy={() => setActiveLegalModal('privacy')}
          onOpenTerms={() => setActiveLegalModal('terms')}
        />
      </div>

      {/* Legal & Professional Notice Modals */}
      <LegalModal
        isOpen={activeLegalModal !== null}
        initialTab={activeLegalModal || 'privacy'}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
};
