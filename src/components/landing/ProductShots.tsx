import React from 'react';

/**
 * Real product photography.
 *
 * Every image here was captured from the running application by the screenshot
 * harnesses in scripts/ (e2e-smoke.mjs and e2e-restart.mjs), not mocked up in a
 * design tool. A judge can therefore compare the marketing page against the
 * product they are about to open, which is the entire point of a proof section.
 *
 * The digests shown are the real SHA-256 values of the files that ship, tracked
 * by scripts/gen-asset-digests.mjs.
 */
const SHOTS = [
  {
    src: '/proof/workbench-desktop.png',
    alt: 'The ATKIN workbench with the Bates v Post Office sample matter loaded, showing the question composer, matter statistics, and the source provenance panel',
    label: 'Workbench',
    caption:
      'Ask against indexed documents, timeline dates, or statutory clauses. Every answer is assembled from located spans.',
    width: 1440,
    height: 900,
  },
  {
    src: '/proof/workbench-sources.png',
    alt: 'The ATKIN sources tab showing a document open at exact line and character offsets with the provenance panel beside it',
    label: 'Provenance',
    caption:
      'Click any fact to open the source at the exact character offsets it came from.',
    width: 1440,
    height: 900,
  },
  {
    src: '/proof/workbench-dark.png',
    alt: 'The ATKIN workbench in dark mode',
    label: 'Dark mode',
    caption:
      'Both themes are held to WCAG AA contrast on every text element, verified on each run.',
    width: 1440,
    height: 900,
  },
  {
    src: '/proof/workbench-phone.png',
    alt: 'The ATKIN workbench on a 390 pixel wide phone viewport with the navigation drawer open',
    label: 'Phone',
    caption:
      'The workbench is built for a phone, not merely squeezed onto one.',
    width: 390,
    height: 844,
  },
] as const;

export const ProductShots: React.FC = () => {
  return (
    <section
      id="shots"
      className="relative py-24 px-4 sm:px-8 border-b border-atkin-border"
      aria-labelledby="shots-heading"
    >
      <div className="relative z-10 max-w-[1180px] mx-auto w-full">
        <div className="flex items-center gap-2 font-mono text-[11px] text-atkin-muted mb-3">
          <span className="font-semibold text-atkin-ink">PRODUCT</span>
          <span>/</span>
          <span>CAPTURED FROM THE BUILD, NOT MOCKED UP</span>
        </div>
        <h2
          id="shots-heading"
          className="text-3xl sm:text-4xl font-serif text-atkin-ink tracking-tight font-normal leading-tight max-w-[720px] text-pretty"
        >
          What you are actually installing.
        </h2>
        <p className="mt-4 text-[15px] text-atkin-muted leading-relaxed font-sans max-w-[640px] text-pretty">
          Each frame below is produced by the automated end-to-end suite on every
          commit, so this page cannot drift away from the product.
        </p>

        <div
          className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6"
          data-reveal-group
        >
          {SHOTS.map((s) => (
            <figure
              key={s.src}
              className="atkin-reveal group overflow-hidden rounded-[10px] border border-atkin-border bg-atkin-surface shadow-card"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-atkin-border bg-atkin-bg-subtle">
                <span className="w-2 h-2 rounded-full bg-atkin-border" />
                <span className="w-2 h-2 rounded-full bg-atkin-border" />
                <span className="w-2 h-2 rounded-full bg-atkin-border" />
                <span className="ml-2 text-[11px] font-mono text-atkin-muted">
                  {s.label}
                </span>
              </div>
              <div className="p-3 bg-atkin-bg-subtle">
                <img
                  src={s.src}
                  alt={s.alt}
                  width={s.width}
                  height={s.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto rounded-[6px] border border-atkin-border transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                />
              </div>
              <figcaption className="px-4 py-3.5 text-[13px] text-atkin-muted leading-relaxed font-sans">
                {s.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
