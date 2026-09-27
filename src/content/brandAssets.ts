/**
 * Canonical brand image sources.
 *
 * Single source of truth for the ATKIN mark so the header logo and the hero
 * card cannot drift apart, and so nobody re-introduces the 593 KB full-size PNG
 * for a 24px render.
 *
 * The full-size `atkin-mark.png` (579 KB) is only reachable via the `full`
 * entry, which exists for the digest seal and for high-DPR hero rendering.
 */
export const ATKIN_MARK_SRCSET = [
  '/brand/atkin-mark-32.png 32w',
  '/brand/atkin-mark-64.png 64w',
  '/brand/atkin-mark-128.png 128w',
  '/brand/atkin-mark-256.png 256w',
  '/brand/atkin-mark-512.png 512w',
].join(', ');

/** Intrinsic size of the largest variant, used to reserve layout space. */
export const ATKIN_MARK_INTRINSIC = { width: 512, height: 512 };
