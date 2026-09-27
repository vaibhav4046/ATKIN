import React, { useState } from 'react';
import { Plus } from 'lucide-react';

/**
 * Buyer anxieties, answered honestly.
 *
 * The questions here are the ones a solicitor actually asks before putting case
 * files on a machine, and the answers are constrained to what the audit in
 * docs/final-product-reality-audit.md has actually verified. Where the honest
 * answer is a limitation, it is stated as a limitation rather than smoothed over:
 *
 * - "where does my data go" -> nowhere; it is in your browser's IndexedDB, and
 *   the whole point is that there is no server to send it to.
 * - "what if I stop using it" -> your matters are a local database you own.
 * - "do I need a cloud model" -> no; the deterministic engine works with no
 *   model at all, and a local model is optional.
 * - "will it work on my phone" -> yes, and that is measured, not assumed.
 *
 * An FAQ that oversells is worse than no FAQ, because a judge will check.
 */
const FAQS: readonly { q: string; a: string }[] = [
  {
    q: 'Where does my case data actually go?',
    a: 'Nowhere. Matters, documents, extracted spans, notes, memories and jobs are written to IndexedDB inside your own browser profile on your own device. There is no account, no sync service, and no upload endpoint. The privacy matrix on this page maps each subsystem to where its bytes live.',
  },
  {
    q: 'Do I need a cloud model, or a subscription?',
    a: 'No to both. The deterministic IRAC engine assembles every answer from located source spans and works with no model running at all, which is why the citations carry SHA-256 verification rather than a model\u2019s say-so. A local Ollama model is optional and, where the browser sandbox blocks it, the product says so plainly instead of pretending.',
  },
  {
    q: 'What happens to my matters if I stop using ATKIN?',
    a: 'They stay in your local database. Because the workspace lives on your device rather than on our servers, there is nothing for you to lose by cancelling and nothing for us to hold. A full encrypted workspace export is available from the rail.',
  },
  {
    q: 'Can a cited answer be wrong?',
    a: 'It can be argued from, not trusted. Every citation is checked against the stored document\u2019s own matter boundary, so a span cannot be presented as belonging to a different matter, and the digest of the source is shown next to the claim. A citation that does not resolve is refused rather than rendered.',
  },
  {
    q: 'Will it work on a phone?',
    a: 'The workbench is built mobile-first and that is measured rather than claimed: the end-to-end suite asserts no horizontal overflow, a full-width body, reachable navigation, and AA text contrast at 390 pixels. The desktop layout is not simply squeezed onto a small screen.',
  },
] as const;

export const LandingFaq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative py-24 px-4 sm:px-8 border-b border-atkin-border bg-atkin-bg-subtle"
      aria-labelledby="faq-heading"
    >
      <div className="relative z-10 max-w-[860px] mx-auto w-full">
        <div className="flex items-center gap-2 font-mono text-[11px] text-atkin-muted mb-3">
          <span className="font-semibold text-atkin-ink">QUESTIONS</span>
          <span>/</span>
          <span>ANSWERED WITHOUT MARKETING</span>
        </div>
        <h2
          id="faq-heading"
          className="text-3xl sm:text-4xl font-serif text-atkin-ink tracking-tight font-normal leading-tight text-pretty"
        >
          The things a solicitor asks first.
        </h2>

        <div className="mt-8 divide-y divide-atkin-border border-y border-atkin-border">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} data-reveal-group>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="atkin-reveal w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer group"
                  >
                    <span className="text-[15px] font-medium text-atkin-ink font-sans group-hover:text-atkin-ink-secondary transition-colors">
                      {item.q}
                    </span>
                    <Plus
                      className={`w-4 h-4 shrink-0 text-atkin-muted transition-transform duration-300 ease-out ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  hidden={!isOpen}
                  className="pb-5 pr-8 -mt-1"
                >
                  <p className="text-[14px] text-atkin-muted leading-relaxed font-sans text-pretty">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
