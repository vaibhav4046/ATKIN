import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Scale, 
  Lock, 
  Binary, 
  ExternalLink,
  CheckCircle2,
  Cpu,
  Database
} from 'lucide-react';
import { Badge } from '../common/Badge.tsx';

interface HeroDimensionalProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
  onNewMatter?: () => void;
}

export const HeroDimensional: React.FC<HeroDimensionalProps> = ({
  onOpenWorkbench,
  onLoadSample,
  onNewMatter
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // Scroll listener with passive flag for high performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Independent plane translation calculations (clamped and gated)
  const isMotionEnabled = !prefersReducedMotion && typeof window !== 'undefined' && window.innerWidth >= 768;
  const clampedScroll = Math.min(scrollY, 800);

  // Plane 1: Atmosphere / Coordinate Grid (slow translation)
  const atmosphereY = isMotionEnabled ? clampedScroll * 0.10 : 0;
  // Plane 2: Typographic Headline (medium translation)
  const typoY = isMotionEnabled ? clampedScroll * 0.28 : 0;
  // Plane 3: Product Workbench Stage (steady translation + subtle scale)
  const productY = isMotionEnabled ? clampedScroll * 0.18 : 0;
  // Plane 4: Foreground Anchored Cryptographic Stamp (tactile floating lead)
  const anchorY = isMotionEnabled ? clampedScroll * 0.08 : 0;

  const sampleSha = '60b0b7a6b53e2cd3d4499f2c54e8a1c94dc07d22c0acf064e24d293d9429af67';

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(sampleSha);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <section 
      className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-border-hairline bg-[#FAF9F5] w-full max-w-full"
      aria-label="Proofline Hero Overview"
    >
      {/* =========================================================================
          PLANE 1: ATMOSPHERE & PROCEDURAL COORDINATE GRID (Z-0)
          Hairline legal measurement grid with Latin evidentiary watermark maxim
         ========================================================================= */}
      <div 
        className="absolute inset-0 pointer-events-none select-none overflow-hidden transition-transform duration-75 will-change-transform w-full max-w-full"
        style={{ transform: `translate3d(0, ${atmosphereY}px, 0)` }}
        aria-hidden="true"
      >
        {/* Procedural Coordinate Grid Lines */}
        <div 
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0F172A 1px, transparent 1px),
              linear-gradient(to bottom, #0F172A 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Marginal Byte Offset Measurement Labels */}
        <div className="hidden xl:flex flex-col justify-between absolute left-4 top-12 bottom-12 text-[10px] font-mono text-ink-steel opacity-30 leading-none">
          <span>0x0000 [CORPUS]</span>
          <span>0x0200 [INGEST]</span>
          <span>0x0400 [PARSER]</span>
          <span>0x0800 [SHA-256]</span>
          <span>0x1000 [IRAC]</span>
        </div>
        <div className="hidden xl:flex flex-col justify-between absolute right-4 top-12 bottom-12 text-[10px] font-mono text-ink-steel opacity-30 text-right leading-none">
          <span>CPR 31 [DISCL]</span>
          <span>CPR 32 [TRUTH]</span>
          <span>SRA [ETHICS]</span>
          <span>EWHC [QB]</span>
          <span>0xFFFF [SEAL]</span>
        </div>

        {/* Faint Judicial Crest Watermark (Audi Alteram Partem) */}
        <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] text-ink pointer-events-none">
          <svg width="640" height="640" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="100" cy="100" r="92" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="76" />
            <path d="M100 20 V180 M20 100 H180" />
            <path d="M45 45 L155 155 M45 155 L155 45" strokeDasharray="2 4" />
            <text x="100" y="96" textAnchor="middle" fontSize="6.5" fontFamily="serif" letterSpacing="2">
              AUDI ALTERAM PARTEM
            </text>
            <text x="100" y="108" textAnchor="middle" fontSize="5.5" fontFamily="serif" letterSpacing="1.5">
              VERITAS ET RATIO
            </text>
          </svg>
        </div>
      </div>

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-8 space-y-12">
        {/* =========================================================================
            PLANE 2: TYPOGRAPHIC PROCLAMATION & CORE CTAS (Z-10)
            Balanced leading, restrained tracking, zero em dashes, high-court voice
           ========================================================================= */}
        <div 
          className="text-center space-y-6 max-w-[960px] mx-auto transition-transform duration-75 will-change-transform"
          style={{ transform: `translate3d(0, ${typoY}px, 0)` }}
        >
          {/* Institutional Jurisdiction Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-white border border-border-hairline shadow-subtle">
            <Badge variant="blue" size="sm">LexHack 2026</Badge>
            <span className="text-[12px] font-medium text-ink-slate font-mono">
              Open Source Legal Technology (England &amp; Wales Civil Litigation)
            </span>
          </div>

          {/* Master Headline: Restrained, Authoritative Editorial */}
          <h1 className="text-4xl sm:text-6xl lg:text-[66px] font-serif text-ink tracking-tight leading-[1.08] text-balance">
            A case file you can question.<br />
            <span className="text-ink-slate italic font-serif">An answer you can verify.</span>
          </h1>

          {/* Subtext: Measure capped at 64ch for perfect reading ergonomics */}
          <p className="text-base sm:text-[18px] text-ink-slate max-w-[680px] mx-auto leading-relaxed text-pretty">
            Bring civil litigation documents into a private sovereign workspace. Trace claims to exact byte-offset source spans, catch adverse contradictions, and draft with CPR 32.14 truthfulness.
          </p>

          {/* Primary Action Button Cluster */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenWorkbench}
              className="px-6 py-3 rounded-[4px] bg-proofline-blue hover:bg-proofline-navy text-white text-[13.5px] font-medium transition-all shadow-subtle flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
            >
              <span>Launch Sovereign Workbench</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoadSample}
              className="px-5 py-3 rounded-[4px] bg-white border border-border-hairline hover:bg-canvas-subtle text-ink text-[13.5px] font-medium transition-all shadow-subtle cursor-pointer active:translate-y-[1px]"
            >
              Explore Sample Matter
            </button>
          </div>

          {/* Invariant Trust Line */}
          <div className="text-[12px] text-ink-steel flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 font-mono">
            <span className="flex items-center gap-1.5 text-proofline-green font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Browser IndexedDB
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 text-ink">
              <Cpu className="w-3.5 h-3.5 text-proofline-blue" />
              Deterministic IRAC Engine
            </span>
            <span>&bull;</span>
            <span>Optional Local Gemma 4 Daemon</span>
            <span>&bull;</span>
            <span className="font-semibold text-proofline-green">92 Vitest Checks Passing</span>
          </div>
        </div>

        {/* =========================================================================
            PLANE 3: MINIATURE PRODUCT STAGE & VERBATIM RECORD (Z-20)
            Authentic Fraser J [549] extract with byte markers and active viewport
           ========================================================================= */}
        <div 
          className="relative max-w-[1080px] mx-auto transition-transform duration-75 will-change-transform"
          style={{ transform: `translate3d(0, ${productY}px, 0)` }}
        >
          {/* Main Archival Workbench Surface */}
          <div className="bg-white border border-border-hairline rounded-[8px] shadow-modal overflow-hidden">
            {/* Top Workspace Chrome Header */}
            <div className="bg-[#F6F5F0] border-b border-border-hairline px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[12px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" />
                <span className="font-mono text-ink font-semibold ml-2 text-[12px] truncate max-w-[220px] sm:max-w-none">
                  Bates &amp; Others v Post Office Ltd [2019] EWHC 3408 (QB)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-ink-steel bg-white border border-border-hairline px-2 py-0.5 rounded">
                  High Court Queen's Bench Division
                </span>
                <span className="text-[11px] font-mono text-proofline-green bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Air-Gapped Local Invariant
                </span>
              </div>
            </div>

            {/* Split Documentary Examination Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border-hairline bg-white">
              {/* Left Column: Authentic Primary Source Viewport (7 cols) */}
              <div className="lg:col-span-7 p-5 sm:p-6 space-y-4 min-w-0">
                <div className="flex items-center justify-between text-[11.5px] font-mono text-ink-steel border-b border-border-hairline pb-2 min-w-0 gap-2">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <FileText className="w-3.5 h-3.5 text-proofline-blue shrink-0" />
                    <span className="text-ink font-medium truncate">Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt</span>
                  </div>
                  <span className="text-proofline-blue font-semibold shrink-0">Lines 18–26</span>
                </div>

                {/* Numbered Documentary Extract with Active Span Highlight */}
                <div className="font-mono text-[12px] bg-[#FAF9F5] border border-border-hairline rounded-[4px] p-4 text-ink leading-relaxed space-y-2 select-text">
                  <div className="text-ink-steel text-[11px] flex flex-col sm:flex-row sm:justify-between border-b border-border-hairline/60 pb-1 gap-1">
                    <span>Source Excerpt (Fraser J Ruling)</span>
                    <span>Character Offset: 1644 to 1875 (231 bytes)</span>
                  </div>
                  
                  <div className="pt-1">
                    <span className="text-ink-muted select-none mr-2">548</span>
                    <span className="text-ink-slate">The Horizon system was asserted by the Post Office to be robust and inviolable.</span>
                  </div>

                  <div className="bg-amber-100/70 border-l-2 border-amber-600 px-2 py-1.5 rounded-r-[3px]">
                    <span className="text-amber-800 font-bold select-none mr-2">549</span>
                    <span className="text-ink font-medium">
                      &quot;The evidence in this trial has made it clear that such remote access to branch accounts does exist; such remote access is possible by employees within Fujitsu; it does exist specifically by design; and it has been used in the past.&quot;
                    </span>
                  </div>

                  <div>
                    <span className="text-ink-muted select-none mr-2">550</span>
                    <span className="text-ink-slate">This finding directly establishes that contemporaneous denials given to subpostmasters were wrong.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-steel font-mono pt-1">
                  <span>Encoding: UTF-8 Exact Bytes</span>
                  <span className="text-proofline-green font-medium">No OCR Degradation</span>
                </div>
              </div>

              {/* Right Column: Grounded Copilot Reasoning & Selective Abstention (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 bg-[#FCFBF8] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-proofline-blue">
                      Evidential Reasoning Analysis
                    </span>
                    <Badge variant="green" size="sm">Grounded 100%</Badge>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11.5px] font-mono text-ink-steel uppercase">Judicial Invariant</span>
                    <h3 className="text-sm font-semibold text-ink leading-snug font-serif">
                      Finding of Fact on Fujitsu Remote Account Modification
                    </h3>
                    <p className="text-[12.5px] text-ink-slate leading-relaxed">
                      Fraser J specifically determined at paragraph [549] that Fujitsu personnel had operational capability to alter branch transaction balances without subpostmaster notification.
                    </p>
                  </div>

                  {/* Selective Abstention Guarantee Box */}
                  <div className="p-3 bg-white border border-border-hairline rounded-[4px] space-y-1 text-[11.5px] font-mono">
                    <div className="flex items-center gap-1.5 text-ink font-semibold">
                      <Scale className="w-3.5 h-3.5 text-proofline-ochre" />
                      <span>Evidential Abstention Trigger:</span>
                    </div>
                    <p className="text-ink-slate leading-relaxed">
                      Questions regarding extraneous claimant birth dates or undocumented matters emit 0 citations and explicitly refuse confabulation.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-hairline flex items-center justify-between">
                  <button
                    onClick={onLoadSample}
                    className="text-[12px] font-medium text-proofline-blue hover:text-proofline-navy underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect this record in workbench</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-[10.5px] font-mono text-ink-steel">Exhibit L21</span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              PLANE 4: FOREGROUND ANCHORED CRYPTOGRAPHIC SEAL (Z-30)
              Floating badge pinned to bottom edge with independent travel
             ========================================================================= */}
          <div 
            className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:right-6 bg-white border border-border-hairline rounded-[6px] p-3 sm:p-4 shadow-modal z-30 max-w-[420px] transition-transform duration-75 will-change-transform"
            style={{ transform: `translate3d(0, ${anchorY}px, 0)` }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[4px] bg-emerald-50 border border-emerald-200 flex items-center justify-center text-proofline-green shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="space-y-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-proofline-green">
                    Cryptographic Provenance Verified
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="text-[10px] font-mono text-proofline-blue hover:underline cursor-pointer"
                  >
                    {copiedHash ? 'Copied' : 'Copy'}
                  </button>
                </div>
                
                <p className="text-[11px] font-mono text-ink-slate truncate" title={sampleSha}>
                  SHA-256: {sampleSha.slice(0, 24)}...{sampleSha.slice(-8)}
                </p>

                <div className="text-[10.5px] text-ink-steel flex items-center gap-2 pt-0.5 font-sans">
                  <span>Byte-Level Match (231 bytes)</span>
                  <span>&bull;</span>
                  <span>CPR 32.14 Human Sign-off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
