import React from 'react';
import { PRODUCT_CHAPTERS } from '../../content/productCopy';
import { Check, ArrowRight, ShieldCheck, Database, FileText, Cpu, Network, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

const CHAPTER_ICONS = [
  <Database key="1" className="w-5 h-5 text-atkin-ink" />,
  <ShieldCheck key="2" className="w-5 h-5 text-atkin-ink" />,
  <FileText key="3" className="w-5 h-5 text-atkin-ink" />,
  <FileText key="4" className="w-5 h-5 text-atkin-ink" />,
  <Network key="5" className="w-5 h-5 text-atkin-ink" />,
  <Laptop key="6" className="w-5 h-5 text-atkin-ink" />
];

export const ProductChapters: React.FC = () => {
  return (
    <section id="chapters" className="py-24 px-4 sm:px-8 border-b border-atkin-border max-w-[1180px] mx-auto w-full select-none">
      {/* Section Header */}
      <div className="space-y-3 max-w-[720px] pb-16">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] text-atkin-muted">
          <span className="font-semibold text-atkin-ink">03 ARCHITECTURE</span>
          <span>/</span>
          <span>PRODUCT CHAPTERS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-atkin-ink tracking-tight font-normal leading-tight">
          Deliberate software built for sovereign legal reasoning.
        </h2>
        <p className="text-[15px] text-atkin-muted leading-relaxed font-sans">
          Six foundational chapters structure ATKIN from evidentiary ingestion to cross-device peer inference.
        </p>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCT_CHAPTERS.map((chapter, index) => (
          <div
            key={chapter.number}
            className="group rounded-[8px] bg-atkin-surface border border-atkin-border p-7 flex flex-col justify-between space-y-6 hover:border-atkin-ink/40 transition-colors shadow-2xs"
          >
            {/* Chapter Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-semibold text-atkin-ink px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border">
                    {chapter.number}
                  </span>
                  <span className="font-mono text-[11px] text-atkin-muted uppercase tracking-wider">
                    {chapter.tag}
                  </span>
                </div>
                <div className="p-2 rounded bg-atkin-bg border border-atkin-border/80">
                  {CHAPTER_ICONS[index]}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-serif text-atkin-ink font-normal tracking-tight">
                  {chapter.title}
                </h3>
                <p className="text-[12.5px] font-sans font-medium text-atkin-muted">
                  {chapter.subtitle}
                </p>
              </div>

              <p className="text-[13px] text-atkin-muted leading-relaxed font-sans">
                {chapter.description}
              </p>
            </div>

            {/* Highlights List */}
            <div className="pt-4 border-t border-atkin-border/70 space-y-2">
              <div className="text-[10px] font-mono text-atkin-muted uppercase tracking-wider">
                CORE CAPABILITIES
              </div>
              <ul className="space-y-1.5 text-[12px] font-sans text-atkin-ink">
                {chapter.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-atkin-ink" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
