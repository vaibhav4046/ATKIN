import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The audit trail must not be able to lie.
 *
 * A persona audit of the app as a litigation solicitor found two defects that
 * are uniquely damaging for THIS product, because an honest evidential record is
 * the entire thing being sold:
 *
 * 1. `handleResolveReviewItem` had the signature `(id: string)`. ReviewTab
 *    called it as `onResolveItem(id, resolutionText || 'Resolved by solicitor
 *    audit.')`, so the rationale the UI collected under the heading "Solicitor
 *    Audit / Resolution Rationale" was passed in and then dropped on the floor.
 *    The item was marked resolved with no record of why. ReviewItem already had
 *    a `resolutionNote` field and the trail already rendered it, so the only
 *    thing missing was persisting it.
 *
 * 2. `resolvedItems` was `status === 'resolved' || status === 'dismissed'`, and
 *    every row rendered a green "Resolved" badge. So clearing a UCTA s.3
 *    reasonableness assessment from the queue was recorded, in a panel headed
 *    "Resolution Audit Trail", as though the solicitor had verified it.
 *
 * These are asserted against the source because they are wiring defects across
 * three files, not a pure function. Asserting on behaviour would need a DOM
 * harness for a panel that is otherwise covered end to end.
 */
const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

describe('review audit trail integrity', () => {
  const appShell = read('src/app/AppShell.tsx');
  const reviewTab = read('src/components/workbench/ReviewTab.tsx');

  it('the resolve handler accepts and persists the rationale', () => {
    expect(appShell).toMatch(/handleResolveReviewItem\s*=\s*async\s*\(\s*id:\s*string\s*,\s*note\??:\s*string\s*\)/);
    expect(appShell).toMatch(/status:\s*'resolved'[\s\S]{0,220}resolutionNote:/);
  });

  it('the dismiss handler records its own reason and timestamp', () => {
    expect(appShell).toMatch(/handleDismissReviewItem\s*=\s*async\s*\(\s*id:\s*string\s*,\s*note\??:\s*string\s*\)/);
    expect(appShell).toMatch(/status:\s*'dismissed'[\s\S]{0,220}resolutionNote:/);
  });

  it('both decisions record when they happened', () => {
    // Two decisions, two timestamps.
    expect(appShell.match(/resolvedAt:\s*new Date\(\)\.toISOString\(\)/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('a dismissal is never presented as a verification', () => {
    // The two statuses must not share one badge.
    expect(reviewTab).not.toMatch(/<Badge variant="green" size="sm">Resolved<\/Badge>/);
    expect(reviewTab).toMatch(/Dismissed\s*&mdash;\s*not verified/i);
    expect(reviewTab).toMatch(/item\.status === 'dismissed'/);
  });

  it('the trail displays the rationale it now stores', () => {
    expect(reviewTab).toMatch(/item\.resolutionNote/);
    expect(reviewTab).toMatch(/item\.resolvedAt/);
  });
});
