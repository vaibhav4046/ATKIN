/**
 * ATKIN motion system.
 *
 * Built on GSAP + ScrollTrigger for scroll-driven work, and framer-motion for
 * component mount/presence transitions. The split is deliberate:
 *
 * - ScrollTrigger owns anything tied to scroll position: reveals, staggers,
 *   parallax, progress rails. It batches work in a single rAF tick and only
 *   animates elements in view, which matters because the landing page carries
 *   several full-bleed art layers.
 * - framer-motion stays where it already earns its keep: enter/exit presence
 *   for lazy tabs, modals, and dropdowns. Replacing it there would be churn
 *   with no user-visible gain.
 *
 * Accessibility is not optional. Every helper here is a no-op under
 * prefers-reduced-motion: reduce, and the content is simply present. Animations
 * that cannot be turned off are a defect, not a flourish.
 *
 * Also worth knowing: `ScrollTrigger` writes inline transforms. Any element it
 * animates must not also be animated by framer-motion, or the two will fight
 * over the same `transform` property. `.atkin-reveal` elements are therefore
 * left to GSAP alone.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/** The easing used across the site. Deliberately decelerating, never bouncy. */
export const EASE = 'power3.out';

let registered = false;

/**
 * Wire up scroll reveals for every `.atkin-reveal` inside `root`.
 *
 * Each element animates from slightly below its resting position and fades in.
 * Children marked `.atkin-reveal-group` stagger, which is what turns a wall of
 * feature cards into a sequence the eye can follow.
 *
 * `start` is expressed as a fraction of the viewport so the same call works for
 * a full-bleed hero and a dense card grid.
 */
export function initReveals(root: ParentNode = document) {
  if (registered || typeof window === 'undefined') return;
  registered = true;

  if (prefersReducedMotion()) {
    // Make sure anything hidden by CSS is visible in this mode.
    root.querySelectorAll<HTMLElement>('.atkin-reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const targets = Array.from(root.querySelectorAll<HTMLElement>('.atkin-reveal'));
  if (targets.length === 0) return;

  targets.forEach((el) => {
    const group = el.closest<HTMLElement>('[data-reveal-group]');
    const siblings = group
      ? Array.from(group.querySelectorAll<HTMLElement>(':scope > .atkin-reveal'))
      : null;

    // Only the first child of a group animates; the rest are handled by the
    // stagger so they are not animated twice.
    if (siblings && siblings.length > 1 && el !== siblings[0]) return;

    if (siblings && siblings.length > 1) {
      gsap.from(siblings, {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: { trigger: group, start: 'top 82%', once: true },
      });
    } else {
      gsap.from(el, {
        opacity: 0,
        y: 22,
        duration: 0.75,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }
  });

  // Art layers get a much slower drift so the page has depth without moving
  // anything the eye is trying to read.
  const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
  layers.forEach((el) => {
    const depth = Number(el.dataset.parallax || '10');
    gsap.to(el, {
      yPercent: depth,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  ScrollTrigger.refresh();
}

/** Recompute trigger positions. Call after route or layout changes. */
export const refreshMotion = () => ScrollTrigger.refresh();

/**
 * Count a number up when it scrolls into view. Used for the verification
 * figures on the proof section.
 */
export function initCounters(root: ParentNode = document) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-count-to]'));
  nodes.forEach((el) => {
    const to = Number(el.dataset.countTo || '0');
    const decimals = Number(el.dataset.countDecimals || '0');
    const state = { n: 0 };
    gsap.to(state, {
      n: to,
      duration: 1.1,
      ease: EASE,
      onUpdate: () => {
        el.textContent = state.n.toFixed(decimals);
      },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

export { gsap, ScrollTrigger };
