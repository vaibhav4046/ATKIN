import React from 'react';
import { ArrowRight, ShieldCheck, Quote } from 'lucide-react';
import { ART_ASPECT, ArtLayer } from './ArtLayer';

/**
 * Human Judgment — the moment the product hands control back to the lawyer.
 *
 * This section deliberately shows no case law.
 *
 * It previously hosted an interactive explorer built on invented material:
 * quotations attributed to a named High Court judge in a real reported case,
 * paragraph numbers that were never checked, five fabricated SHA-256 digests
 * presented as document integrity, and a "Verified under CPR 31.6" notice. On a
 * marketing page that is the single most dangerous thing the product could ship,
 * because anyone who knows the case can disprove it in a minute.
 *
 * The claim ATKIN can actually defend is structural, so that is what this
 * section makes: the workspace is yours, the model is replaceable, and the
 * decision is not automated.
 */
interface HumanJudgmentProps {
  onOpenWorkbench: () => void;
}

export const HumanJudgment: React.FC<HumanJudgmentProps> = ({ onOpenWorkbench }) => {
  return (
    <section
      id="judgment"
      className="relative py-24 px-4 sm:px-8 border-b border-atkin-border overflow-hidden select-none"
    >
      <ArtLayer
        name="courtroom-quiet-judgment"
        placement="section"
        aspect={ART_ASPECT.courtroom}
        objectPosition="center 45%"
      />

      <div className="relative z-10 max-w-[1180px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[11px] text-atkin-muted">
              <span className="font-semibold text-atkin-ink">03 HUMAN JUDGMENT</span>
              <span>/</span>
              <span>THE DECISION STAYS WITH YOU</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-atkin-ink tracking-tight font-normal leading-tight">
              ATKIN prepares the work. The lawyer decides.
            </h2>
            <p className="text-[15px] text-atkin-muted leading-relaxed font-sans max-w-[560px] text-pretty">
              Every draft lands marked for review. Every citation can be opened at the
              exact span it came from. Nothing is filed, sent, or published without a
              person pressing the button &mdash; and the record of what was approved is
              kept with the matter.
            </p>
          </div>

          <ul className="space-y-3 pt-2">
            {[
              {
                title: 'Provenance you can open',
                body: 'A citation is a pointer, not a decoration. Click it and the source opens at the exact character range, with the quoted words highlighted.',
              },
              {
                title: 'Abstention is a real answer',
                body: 'When the selected sources do not establish a proposition, ATKIN says so instead of inventing support for it.',
              },
              {
                title: 'Consequences stay human-controlled',
                body: 'Preparation is automated. Service, filing, and any external action are not, and are gated behind explicit approval.',
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-atkin-success" />
                <div className="space-y-0.5">
                  <div className="text-[13px] font-medium text-atkin-ink">{item.title}</div>
                  <div className="text-[12.5px] text-atkin-muted leading-relaxed">
                    {item.body}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <button
              onClick={onOpenWorkbench}
              className="px-5 py-2.5 rounded-[4px] bg-atkin-ink text-atkin-bg hover:opacity-90 transition-opacity font-medium text-[13px] flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Open the workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center">
          <figure className="relative w-full max-w-[340px] space-y-4">
            <div className="relative aspect-[1122/1402] w-full overflow-hidden rounded-[8px] border border-atkin-border bg-atkin-surface">
              <img
                src="/atkin/characters/atkin-character-reviewing.webp"
                alt="ATKIN advocate character reviewing a document"
                width={900}
                height={1125}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <figcaption className="flex gap-2.5 text-[11.5px] text-atkin-muted leading-relaxed">
              <Quote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-atkin-ink" />
              <span>
                The model can change. The legal workspace remains yours.
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};
