import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DOWNLOAD_OPTIONS } from '../content/productCopy';

/**
 * The download cards previously advertised `Atkin-Setup.exe` and
 * `Atkin-Companion.apk`, and DownloadSection silently rewrote every local href
 * to the GitHub releases page. Neither filename existed, and no Android asset
 * was ever published there, so the "Get Android" button resolved to a page with
 * no APK on it.
 *
 * These assertions keep the card honest: absolute URLs only, and the displayed
 * filename must be the one the link actually serves.
 */
describe('Download surface honesty', () => {
  it('every download href is an absolute https URL', () => {
    for (const opt of DOWNLOAD_OPTIONS) {
      expect(
        opt.href.startsWith('https://'),
        `${opt.title} must link to a real absolute URL, got ${opt.href}`
      ).toBe(true);
    }
  });

  it('no download href points at an in-app route that does not exist', () => {
    // The old `href: '/download#windows'` was rewritten at render time, which is
    // how a dead destination stayed invisible.
    for (const opt of DOWNLOAD_OPTIONS) {
      expect(opt.href, `${opt.title} must not use a relative app route`).not.toMatch(/^\//);
    }
  });

  it('no download href points at the bare releases index page', () => {
    // Linking the index hides which asset is actually served.
    for (const opt of DOWNLOAD_OPTIONS) {
      expect(
        opt.href,
        `${opt.title} must deep-link to a specific asset, not the releases index`
      ).not.toMatch(/\/releases\/?$/);
    }
  });

  it('a downloadable binary filename is shown for every binary card', () => {
    for (const opt of DOWNLOAD_OPTIONS) {
      if (opt.platform === 'Terminal / Source') continue;
      expect(opt.filename, `${opt.title} must display a real filename`).toMatch(/\.(exe|msi|apk)$/);
    }
  });

  it('the advertised Windows installers match installers in release/windows', () => {
    const releaseDir = join(process.cwd(), 'release', 'windows');
    if (!existsSync(releaseDir)) return; // nothing published from this tree

    const onDisk = readdirSync(releaseDir);
    const windowsCards = DOWNLOAD_OPTIONS.filter((o) => /\.(exe|msi)$/.test(o.filename));

    for (const opt of windowsCards) {
      // The published v1.0.0 release still carries the retired "Proofline" name,
      // so compare on the shared version+arch stem rather than the full name.
      const stem = opt.filename.replace(/^(Proofline|Atkin)[_-]/, '');
      expect(
        onDisk.some((f) => f.endsWith(stem)),
        `${opt.filename} does not correspond to any installer in release/windows (${onDisk.join(', ')})`
      ).toBe(true);
    }
  });

  it('the Android card names an APK that exists in the repository', () => {
    const android = DOWNLOAD_OPTIONS.find((o) => o.platform === 'Android');
    expect(android).toBeDefined();

    const apkName = android!.filename;
    expect(apkName).toMatch(/\.apk$/);

    const apkPath = join(process.cwd(), 'release', 'android', apkName);
    expect(
      existsSync(apkPath),
      `Android card advertises ${apkName} but release/android/${apkName} does not exist`
    ).toBe(true);

    // A real APK is a zip container (PK magic), not a placeholder file.
    const head = readFileSync(apkPath).subarray(0, 2);
    expect(head[0]).toBe(0x50);
    expect(head[1]).toBe(0x4b);
    expect(statSync(apkPath).size).toBeGreaterThan(1_000_000);
  });

  it('the Android card href actually serves the APK it names', () => {
    const android = DOWNLOAD_OPTIONS.find((o) => o.platform === 'Android');
    expect(android!.href).toContain(android!.filename);
  });

  it('the source card points at the repository', () => {
    const source = DOWNLOAD_OPTIONS.find((o) => o.platform === 'Terminal / Source');
    expect(source?.href).toContain('github.com/vaibhav4046/proofline');
  });
});
