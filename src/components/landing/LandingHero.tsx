import React from 'react';
import { ArrowRight, Shield, Download, FileText, CheckCircle2 } from 'lucide-react';
import { BRAND } from '../../content/brand';
import { ASSET_DIGESTS } from '../../content/assetDigests.generated';
import { ATKIN_MARK_INTRINSIC, ATKIN_MARK_SRCSET } from '../../content/brandAssets';
import { ART_ASPECT, ArtLayer } from './ArtLayer';
import { motion } from 'framer-motion';

interface LandingHeroProps {
  onOpenWorkbench: () => void;
  onLoadSample: () => void;
  onNewMatter?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenWorkbench,
  onLoadSample,
  onNewMatter
}) => {
  return (
    <section className="relative min-h-[90svh] flex flex-col justify-between pt-12 pb-16 px-4 sm:px-8 border-b border-atkin-border overflow-hidden select-none">
      {/* Cinematic courtroom field. Sits in its own stacking context behind all
          live copy, masked so the headline column always lands on quiet paper. */}
      <ArtLayer
        name="hero-courtroom-atkin"
        placement="hero"
        aspect={ART_ASPECT.courtroom}
        objectPosition="center 38%"
      />
      {/* Subtle background ambient line */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" aria-hidden="true">
        <div className="w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]" />
      </div>

      {/* Top Banner Tag */}
      <div className="relative z-10 max-w-[1180px] mx-auto w-full pt-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] border border-atkin-border bg-atkin-surface text-[11px] font-mono text-atkin-muted"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-atkin-ink animate-pulse" />
          <span>{BRAND.name} 1.2 · Sovereign Legal AI Ecosystem</span>
          <span className="text-atkin-border font-light">|</span>
          <span>Local-first · Offline ready</span>
        </motion.div>
      </div>

      {/* Center Narrative & Hero Stage */}
      <div className="relative z-10 max-w-[1180px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
        {/* Left Column: Typography & Intent */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-atkin-ink tracking-tight leading-[1.08] text-balance">
              The legal AI platform. Models are replaceable compute engines.
            </h1>
            <p className="text-base sm:text-lg text-atkin-muted font-sans font-normal leading-relaxed max-w-[580px] text-pretty">
              {BRAND.heroSubtext}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onNewMatter || onOpenWorkbench}
              className="px-5 py-2.5 rounded-[4px] bg-atkin-ink text-atkin-bg hover:opacity-90 transition-opacity font-medium text-[13px] flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{BRAND.primaryCta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLoadSample}
              className="px-4 py-2.5 rounded-[4px] border border-atkin-border bg-atkin-surface hover:bg-atkin-bg-subtle text-atkin-ink transition-colors font-medium text-[13px] flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-atkin-muted" />
              <span>Explore demo matter</span>
            </button>
            <a
              href="#download"
              className="px-3.5 py-2.5 text-atkin-muted hover:text-atkin-ink transition-colors text-[13px] font-sans flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Desktop apps</span>
            </a>
          </div>

          {/* Platform Capability Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] font-mono text-atkin-muted border-t border-atkin-border/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-atkin-ink" />
              Direct local SQLite &amp; IndexedDB
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-atkin-ink" />
              Local Ollama &amp; on-device compute
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-atkin-ink" />
              CPR 32 citation verification
            </span>
          </div>
        </motion.div>

        {/* Right Column: Approved Anime Advocate Mark Card & Cryptographic Seal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 flex flex-col items-center justify-center"
        >
          <div className="relative w-full max-w-[380px] p-5 rounded-[8px] bg-atkin-surface border border-atkin-border shadow-md space-y-4">
            {/* Window chrome header */}
            <div className="flex items-center justify-between border-b border-atkin-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-atkin-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-atkin-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-atkin-border" />
                <span className="text-[11px] font-mono text-atkin-muted ml-1">atkin://sovereign-advocate</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-atkin-border text-atkin-muted">
                EDITION 1.2
              </span>
            </div>

            {/* Canonical Mark Artwork Container */}
            <div className="relative aspect-square w-full rounded-[6px] overflow-hidden bg-atkin-bg-subtle border border-atkin-border/80 flex items-center justify-center p-2">
              <img
                src="/brand/atkin-mark-512.png"
                srcSet={ATKIN_MARK_SRCSET}
                sizes="(max-width: 1024px) 90vw, 380px"
                width={ATKIN_MARK_INTRINSIC.width}
                height={ATKIN_MARK_INTRINSIC.height}
                alt="ATKIN Sovereign Legal AI Advocate Mark"
                className="w-full h-full object-contain rounded-[4px]"
                decoding="async"
              />
            </div>

            {/* Cryptographic Grounding Metadata */}
            <div className="space-y-1.5 pt-1 text-[11px] font-mono">
              <div className="flex items-center justify-between text-atkin-muted">
                <span>CANONICAL MARK</span>
                <span className="text-atkin-ink font-semibold">DIGEST VERIFIED</span>
              </div>
              <div className="p-2 rounded bg-atkin-bg text-[10px] text-atkin-muted break-all border border-atkin-border">
                SHA-256: {ASSET_DIGESTS.canonicalMark.sha256}
              </div>
              <div className="flex items-center justify-between text-atkin-muted text-[10px]">
                <span>{(ASSET_DIGESTS.canonicalMark.bytes / 1024).toFixed(0)} KB PNG</span>
                <span>Recomputable from the shipped file</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Hint to Scroll */}
      <div className="relative z-10 max-w-[1180px] mx-auto w-full pt-4 flex items-center justify-between text-[11px] font-mono text-atkin-muted">
        <span>01 REAL PRODUCT PROOF</span>
        <span>SCROLL FOR ARCHITECTURE &darr;</span>
      </div>
    </section>
  );
};
