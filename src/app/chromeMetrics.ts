/**
 * Application chrome geometry — the single source of truth.
 *
 * The workbench stacks three fixed layers above the scrolling body:
 *
 *   GlobalNav   52px  position:fixed   (GlobalNav.tsx)
 *   TopRail     58px  position:sticky  (TopRail.tsx)
 *   --------------------------
 *   chrome     110px
 *
 * These numbers used to be hardcoded independently in seven files and had
 * already drifted once: SourceInspector pinned itself at 108px, a leftover from
 * when the rail was 56px, which tucked its top edge under the rail.
 *
 * Why the call sites keep literal Tailwind classes instead of interpolating
 * these constants: Tailwind's scanner only sees complete class names in the
 * source. Writing `mt-[${GLOBAL_NAV_H}px]` produces no CSS at all and the
 * layout silently breaks, which is a worse failure than a duplicated literal.
 *
 * So the literals stay, and src/tests/chromeMetrics.test.ts asserts they still
 * equal these constants. Change a height here and that test tells you every
 * call site that must be updated.
 */

/** Height of the fixed GlobalNav bar. */
export const GLOBAL_NAV_H = 52;

/** Resting height of the TopRail. It is min-h, so a long title can grow it. */
export const TOP_RAIL_H = 58;

/**
 * Total fixed chrome above the scrolling workbench body.
 *
 * The rail can grow past TOP_RAIL_H for very long matter titles, so anything
 * that must stay clear of a grown rail has to measure at runtime instead of
 * trusting this. The e2e chrome-geometry check does exactly that.
 */
export const APP_CHROME_H = GLOBAL_NAV_H + TOP_RAIL_H;

/**
 * Chrome offsets that legitimately subtract more than APP_CHROME_H, because the
 * element also sits inside a panel with its own header. Recorded so nobody
 * "corrects" them to 110 and breaks the layout:
 *
 *   SourcesTab        140px = 110 chrome + 30px of its own tab chrome
 *   ChatTab           164px = 110 chrome + 54px of its own composer chrome
 *   NotebookStudio    100px was simply wrong; corrected to APP_CHROME_H
 */
export const INNER_CHROME_NOTES = {
  sourcesTab: APP_CHROME_H + 30,
  chatTab: APP_CHROME_H + 54,
} as const;
