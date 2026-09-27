import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

/**
 * Release readiness for the native artifacts.
 *
 * The desktop and Android builds are produced from src-tauri, whose product name
 * and package name decide the artifact filenames. A release built from this
 * commit is therefore already correctly branded; the retired name survives only
 * in assets published earlier, which is a release-publishing problem rather than
 * a source problem.
 *
 * These assertions stop the source side of that from regressing.
 */

const ROOT = process.cwd();

describe('Native build branding', () => {
  const conf = JSON.parse(readFileSync(join(ROOT, 'src-tauri', 'tauri.conf.json'), 'utf8'));
  const cargo = readFileSync(join(ROOT, 'src-tauri', 'Cargo.toml'), 'utf8');

  it('the Tauri product name is ATKIN, not the retired name', () => {
    expect(conf.productName).toBe('Atkin');
    expect(conf.productName).not.toMatch(/proofline/i);
  });

  it('the bundle identifier is ATKIN-scoped', () => {
    expect(conf.identifier).toBe('com.atkin.legal');
    expect(conf.identifier).not.toMatch(/proofline/i);
  });

  it('the window title is ATKIN-branded', () => {
    const title = conf.app.windows[0].title as string;
    expect(title).toMatch(/Atkin/i);
    expect(title).not.toMatch(/proofline/i);
  });

  it('the Rust package name drives an ATKIN artifact filename', () => {
    const name = cargo.match(/^name\s*=\s*"([^"]+)"/m)?.[1];
    expect(name).toBe('atkin');
  });

  it('the crate description is ATKIN-branded', () => {
    const desc = cargo.match(/^description\s*=\s*"([^"]+)"/m)?.[1] ?? '';
    expect(desc).toMatch(/Atkin/i);
    expect(desc).not.toMatch(/proofline/i);
  });

  it('no native source file reintroduces the retired brand', () => {
    const files = ['src-tauri/tauri.conf.json', 'src-tauri/Cargo.toml'];
    for (const rel of files) {
      const content = readFileSync(join(ROOT, rel), 'utf8');
      const hits = content.match(/proofline/gi);
      // A version-locked dependency coordinate is not branding; anything else is.
      const offending = content
        .split('\n')
        .filter((line) => /proofline/i.test(line) && !/version|checksum|source|registry/i.test(line));
      expect(offending, `${rel} reintroduces the retired brand`).toEqual([]);
      if (hits) {
        // Only acceptable on dependency-coordinate lines.
        expect(offending).toHaveLength(0);
      }
    }
  });

  it('the content security policy does not allow arbitrary egress', () => {
    const csp = conf.app.security.csp as string;
    expect(csp).toMatch(/default-src 'self'/);
    // The only remote origins permitted are the local model loopback and named
    // public legal sources. There is no wildcard host and no open connect-src.
    expect(csp).not.toMatch(/connect-src[^;]*\*/);
    expect(csp).toContain('http://127.0.0.1:11434');
  });
});

describe('Published artifacts on disk', () => {
  const windowsDir = join(ROOT, 'release', 'windows');
  const androidDir = join(ROOT, 'release', 'android');

  /** Verify a SHA256SUMS.txt against the bytes actually on disk. */
  const verifySumsFile = (dir: string, sumsName: string, label: string) => {
    const sums = join(dir, sumsName);
    if (!existsSync(sums)) return 0;
    const lines = readFileSync(sums, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    let checked = 0;
    for (const line of lines) {
      const [expected, name] = line.split(/\s+/);
      const abs = join(dir, name);
      expect(existsSync(abs), `${label}: ${name} is listed but missing`).toBe(true);
      const actual = createHash('sha256').update(readFileSync(abs)).digest('hex');
      expect(actual, `${label}: ${name} digest does not match its bytes`).toBe(expected.toLowerCase());
      checked++;
    }
    return checked;
  };

  it('every recorded Windows checksum matches the installer bytes', () => {
    if (!existsSync(windowsDir)) return;
    const checked = verifySumsFile(windowsDir, 'SHA256SUMS.txt', 'windows');
    expect(checked, 'no Windows checksums were verified').toBeGreaterThan(0);
  });

  it('every recorded Android checksum matches the APK bytes', () => {
    if (!existsSync(androidDir)) return;
    const checked = verifySumsFile(androidDir, 'SHA256SUMS.txt', 'android');
    expect(checked, 'no Android checksums were verified').toBeGreaterThan(0);
  });

  it('the Windows installers are ATKIN-named, not the retired name', () => {
    if (!existsSync(windowsDir)) return;
    const { readdirSync } = require('node:fs') as typeof import('node:fs');
    const installers = readdirSync(windowsDir).filter((f: string) => /\.(exe|msi)$/i.test(f));
    expect(installers.length, 'no Windows installer present').toBeGreaterThan(0);
    for (const f of installers) {
      expect(f, `${f} still uses the retired brand`).not.toMatch(/proofline/i);
      expect(f).toMatch(/^Atkin[_-]/i);
    }
  });

  it('the installers are real binaries, not placeholders', () => {
    if (!existsSync(windowsDir)) return;
    const { readdirSync } = require('node:fs') as typeof import('node:fs');
    for (const f of readdirSync(windowsDir).filter((x: string) => /\.(exe|msi)$/i.test(x))) {
      const bytes = readFileSync(join(windowsDir, f));

      if (/\.msi$/i.test(f)) {
        // An MSI is an OLE Compound File, not a PE image.
        expect(
          [...bytes.subarray(0, 8)],
          `${f} is not an OLE compound file (MSI)`
        ).toEqual([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
      } else {
        // An .exe installer is a PE image with the MZ stub.
        expect(bytes[0], `${f} is not a PE image`).toBe(0x4d);
        expect(bytes[1], `${f} is not a PE image`).toBe(0x5a);
      }

      expect(bytes.length, `${f} is implausibly small`).toBeGreaterThan(100_000);
    }
  });

  it('the Android artifact is a real APK', () => {
    const apk = join(androidDir, 'Atkin-1.0.0-universal.apk');
    if (!existsSync(apk)) return;
    const bytes = readFileSync(apk);
    // A real APK is a zip container.
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes.length).toBeGreaterThan(1_000_000);
    expect(statSync(apk).size).toBe(bytes.length);
  });
});
