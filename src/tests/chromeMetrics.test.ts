import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  GLOBAL_NAV_H,
  TOP_RAIL_H,
  APP_CHROME_H,
  INNER_CHROME_NOTES,
} from '../app/chromeMetrics';

/**
 * The chrome offsets are duplicated as literal Tailwind classes because Tailwind's
 * scanner cannot see interpolated class names. This test is what stops that
 * duplication from drifting again.
 *
 * The bug it guards is real and already happened once: SourceInspector pinned at
 * 108px while the chrome was 110px, hiding the panel's top edge. Nothing failed
 * at build or test time, because a duplicated literal is still a valid literal.
 *
 * If you change a height in chromeMetrics.ts, this test names every call site
 * that must be updated with it.
 */
const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

/** Finds every `100vh-<n>px` offset in a source file. */
const viewportOffsets = (rel: string) => {
  const out: number[] = [];
  const re = /100vh-(\d+)px/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(read(rel))) !== null) out.push(Number(m[1]));
  return out;
};

/** Finds every `top-[<n>px]` sticky/fixed offset in a source file. */
const topOffsets = (rel: string) => {
  const out: number[] = [];
  const re = /top-\[(\d+)px\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(read(rel))) !== null) out.push(Number(m[1]));
  return out;
};

describe('application chrome geometry', () => {
  it('derives chrome from the nav and rail rather than restating it', () => {
    expect(GLOBAL_NAV_H).toBe(52);
    expect(TOP_RAIL_H).toBe(58);
    expect(APP_CHROME_H).toBe(GLOBAL_NAV_H + TOP_RAIL_H);
    expect(APP_CHROME_H).toBe(110);
  });

  it('the fixed GlobalNav really is GLOBAL_NAV_H tall', () => {
    expect(read('src/components/layout/GlobalNav.tsx')).toContain(`h-[${GLOBAL_NAV_H}px]`);
  });

  it('the TopRail reserves the nav in flow and sticks below it', () => {
    const src = read('src/components/layout/TopRail.tsx');
    // Reserves the fixed nav's height in flow, otherwise a sticky box whose
    // static position is above its own threshold paints lower with no space
    // reserved and covers the body.
    expect(src).toContain(`mt-[${GLOBAL_NAV_H}px]`);
    // Every sticky/fixed top offset in the rail must be the nav height. Asserted
    // as a set because the explanatory comments legitimately repeat the value.
    expect(new Set(topOffsets('src/components/layout/TopRail.tsx'))).toEqual(
      new Set([GLOBAL_NAV_H])
    );
    expect(src).toContain(`min-h-[${TOP_RAIL_H}px]`);
  });

  it('the landing page reserves the same nav height as the workbench', () => {
    expect(read('src/components/landing/LandingPage.tsx')).toContain(`pt-[${GLOBAL_NAV_H}px]`);
  });

  it('SourceInspector pins below the full chrome, not a stale rail height', () => {
    const src = read('src/components/common/SourceInspector.tsx');
    expect(topOffsets('src/components/common/SourceInspector.tsx')).toContain(APP_CHROME_H);
    expect(src).toContain(`100vh-${APP_CHROME_H}px`);
  });

  it('NotebookStudio sizes itself to the real chrome height', () => {
    expect(
      viewportOffsets('src/components/workbench/NotebookStudioTab.tsx')
    ).toContain(APP_CHROME_H);
  });

  it('panels that subtract their own inner chrome are not silently equal to chrome', () => {
    // These are allowed to differ from APP_CHROME_H, but only by a positive
    // inner-chrome amount, and the amount must be recorded in chromeMetrics.
    for (const rel of [
      'src/components/workbench/SourcesTab.tsx',
      'src/components/workbench/ChatTab.tsx',
    ]) {
      for (const offset of viewportOffsets(rel)) {
        expect(offset).toBeGreaterThan(APP_CHROME_H);
        expect(Object.values(INNER_CHROME_NOTES)).toContain(offset);
      }
    }
  });

  it('no component retypes a chrome-only 100vh offset', () => {
    // Any 100vh-Npx equal to or below the chrome height must be one of the two
    // sanctioned values. Catches a new panel quietly reintroducing 100 or 108.
    const sanctioned = new Set<number>([APP_CHROME_H, ...Object.values(INNER_CHROME_NOTES)]);
    const files = [
      'src/components/common/SourceInspector.tsx',
      'src/components/workbench/NotebookStudioTab.tsx',
      'src/components/workbench/SourcesTab.tsx',
      'src/components/workbench/ChatTab.tsx',
    ];
    for (const rel of files) {
      for (const offset of viewportOffsets(rel)) {
        expect(sanctioned.has(offset), `${rel} uses unsanctioned offset ${offset}px`).toBe(true);
      }
    }
  });
});
