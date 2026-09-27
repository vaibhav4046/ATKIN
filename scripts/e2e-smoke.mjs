#!/usr/bin/env node
/**
 * ATKIN production smoke + golden-journey E2E.
 *
 * Runs against the real production build (dist/), served over HTTP, in a real
 * browser. This is the layer that catches the class of defect the unit suite
 * structurally cannot see: fabricated claims reaching the screen, dead assets,
 * console exceptions, unreadable themes, and lost state.
 *
 * Usage:
 *   npm run build
 *   node scripts/e2e-smoke.mjs
 *
 * Exits non-zero on any failure. Screenshots land in release/ui/e2e/.
 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SHOTS = path.join(ROOT, 'release', 'ui', 'e2e');
const PORT = 4189;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const results = [];
let failures = 0;

function check(name, passed, detail = '') {
  results.push({ name, passed, detail });
  if (!passed) failures++;
  const mark = passed ? 'PASS' : 'FAIL';
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ''}`);
}

function section(title) {
  console.log(`\n${title}`);
}

function serve() {
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    let filePath = path.join(DIST, url === '/' ? 'index.html' : url);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      filePath = path.join(DIST, 'index.html'); // SPA fallback
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

function launchBrowser() {
  // Prefer the bundled Chromium; fall back to a system Chrome if absent.
  const candidates = [
    undefined,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  let lastErr;
  for (const executablePath of candidates) {
    try {
      return chromium.launch(executablePath ? { executablePath } : {});
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

const IGNORABLE_REQUEST_FAILURES = [];

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }
  fs.mkdirSync(SHOTS, { recursive: true });

  const server = await serve();
  const browser = await launchBrowser();
  const base = `http://127.0.0.1:${PORT}`;

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('requestfailed', (r) => {
    failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) failedRequests.push(`${r.url()} :: HTTP ${r.status()}`);
  });

  try {
    section('1. Landing loads and the title is right');
    await page.goto(base, { waitUntil: 'networkidle' });
    const title = await page.title();
    check('page title identifies ATKIN', /ATKIN/i.test(title), title);

    section('2. The displayed digests are real digests of real shipped files');
    // Every digest the product shows must be recomputable from a file that
    // actually ships. The previous bug was an invented string shown next to the
    // word VERIFIED, so this compares against the real bytes rather than a
    // hardcoded expectation.
    const realDigests = new Map();
    for (const rel of [
      'brand/atkin-mark.png',
      'brand/atkin-mark-512.png',
      'fixtures-does-not-exist',
    ]) {
      const abs = path.join(DIST, rel);
      if (!fs.existsSync(abs)) continue;
      realDigests.set(createHash('sha256').update(fs.readFileSync(abs)).digest('hex'), rel);
    }
    // Fixtures are not shipped in dist, so include their real digests too.
    const fixtureAbs = path.join(ROOT, 'fixtures', 'test-contract-independent.txt');
    if (fs.existsSync(fixtureAbs)) {
      realDigests.set(
        createHash('sha256').update(fs.readFileSync(fixtureAbs)).digest('hex'),
        'fixtures/test-contract-independent.txt'
      );
    }

    const bodyText = await page.locator('body').innerText();
    const shownHashes = [...new Set(bodyText.match(/\b[0-9a-f]{64}\b/g) || [])];
    check('a digest is displayed on the landing page', shownHashes.length > 0, `${shownHashes.length} unique`);
    const unknown = shownHashes.filter((h) => !realDigests.has(h));
    check(
      'every displayed digest matches a real shipped file',
      unknown.length === 0,
      unknown.length
        ? `unverifiable: ${unknown.map((u) => u.slice(0, 16) + '…').join(', ')}`
        : shownHashes.map((h) => `${h.slice(0, 8)}…=${realDigests.get(h)}`).join(', ')
    );

    section('3. Every image on the page actually decoded');
    const imgStats = await page.evaluate(() =>
      Array.from(document.images).map((i) => ({
        src: i.currentSrc || i.src,
        complete: i.complete,
        w: i.naturalWidth,
        h: i.naturalHeight,
      }))
    );
    const brokenImgs = imgStats.filter((i) => !i.complete || i.w === 0);
    check('no broken images', brokenImgs.length === 0, brokenImgs.map((b) => b.src).join(', '));

    section('4. Visual kit art is present and served');
    const artCount = await page.evaluate(
      () => document.querySelectorAll('picture source[srcset*="/atkin/"]').length
    );
    check('visual kit art layer is mounted', artCount > 0, `${artCount} kit source(s)`);
    const heroArt = await page.evaluate(() => {
      const img = document.querySelector('picture source[srcset*="/atkin/"]')
        ?.closest('picture')
        ?.querySelector('img');
      return img ? { w: img.naturalWidth, h: img.naturalHeight, loading: img.loading } : null;
    });
    check(
      'hero art decoded at real dimensions',
      !!heroArt && heroArt.w > 0,
      heroArt ? `${heroArt.w}x${heroArt.h} loading=${heroArt.loading}` : 'not found'
    );

    section('5. No banned absolute claims reached the screen');
    const bannedVisible = [
      /air-?gapped/i,
      /zero hallucination/i,
      /100%\s*grounded/i,
      /sra compliant/i,
      /\bfully admissible\b/i,
      /\bverified admissible\b/i,
      /admissible under/i,
    ].filter((re) => re.test(bodyText));
    check(
      'no banned claim in rendered copy',
      bannedVisible.length === 0,
      bannedVisible.map(String).join(', ')
    );
    check('no retired brand name in rendered copy', !/\bproofline\b/i.test(bodyText));

    section('6. Download targets are absolute and not the releases index');
    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href') || '')
    );
    const downloadSection = await page.locator('#download').count();
    check('download section exists', downloadSection > 0);
    if (downloadSection > 0) {
      const dlHrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#download a[href]')).map((a) => a.getAttribute('href') || '')
      );
      check(
        'download links are absolute https',
        dlHrefs.length > 0 && dlHrefs.every((h) => h.startsWith('https://')),
        dlHrefs.join(' | ')
      );
      check(
        'no download link points at the releases index',
        dlHrefs.every((h) => !/\/releases\/?$/.test(h))
      );
    }
    check(
      'no placeholder hrefs on the page',
      !hrefs.some((h) => h === '#' || h === 'javascript:void' || h === 'javascript:void(0)')
    );

    section('7. Theme toggle changes and persists across a reload');
    const beforeTheme = await page.evaluate(() => document.documentElement.className);
    await page.locator('button[aria-label="Toggle theme"]').first().click();
    await page.waitForTimeout(350);
    const afterTheme = await page.evaluate(() => document.documentElement.className);
    check('theme class changes on toggle', beforeTheme !== afterTheme, `${beforeTheme} -> ${afterTheme}`);
    await page.reload({ waitUntil: 'networkidle' });
    const afterReload = await page.evaluate(() => document.documentElement.className);
    check('theme survives reload', afterReload === afterTheme, `${afterReload}`);

    section('8. Dark mode readability of primary surfaces');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('atkin-theme', 'dark');
    });
    await page.waitForTimeout(250);
    const contrast = await page.evaluate(() => {
      const lum = (c) => {
        const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
        const f = (v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const out = [];
      for (const sel of ['h1', 'p', 'button']) {
        const el = document.querySelector(sel);
        if (!el) continue;
        let bgNode = el;
        let bg = getComputedStyle(bgNode).backgroundColor;
        while (bg === 'rgba(0, 0, 0, 0)' && bgNode.parentElement) {
          bgNode = bgNode.parentElement;
          bg = getComputedStyle(bgNode).backgroundColor;
        }
        const fg = getComputedStyle(el).color;
        const l1 = lum(fg);
        const l2 = lum(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        out.push({ sel, ratio: Math.round(ratio * 100) / 100 });
      }
      return out;
    });
    for (const c of contrast) {
      // 4.5 is the AA threshold for body text; large display text needs 3.0
      const threshold = c.sel === 'h1' ? 3 : 4.5;
      check(
        `dark mode ${c.sel} contrast >= ${threshold}:1`,
        c.ratio >= threshold,
        `${c.ratio}:1`
      );
    }
    await page.screenshot({ path: path.join(SHOTS, 'landing-dark-1440.png') });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));

    section('9. No horizontal overflow across required breakpoints');
    for (const w of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1728, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(180);
      const res = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      check(
        `no horizontal scroll at ${w}px`,
        res.scrollW <= res.clientW + 1,
        `scrollW=${res.scrollW} clientW=${res.clientW}`
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOTS, 'landing-mobile-390.png'), fullPage: false });
    await page.setViewportSize({ width: 1440, height: 900 });

    section('10. Enter the workbench and confirm the shell renders');
    const launch = page.locator('button:has-text("Launch Workspace")').first();
    if (await launch.count()) {
      await launch.click();
      await page.waitForTimeout(1200);
      const hasShell = await page.locator('button:has-text("Exit to Overview")').count();
      check('workbench shell renders', hasShell > 0);
      await page.screenshot({ path: path.join(SHOTS, 'workbench-1440.png') });

      section('11. State survives a reload (real navigation, not in-process)');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      const stillInShell = await page.locator('button:has-text("Exit to Overview")').count();
      check('workbench still mounted after reload', stillInShell > 0);
    } else {
      check('Launch Workspace control present', false, 'not found');
    }

    section('12. Console and network hygiene');
    const realConsoleErrors = consoleErrors.filter(
      (e) => !/favicon|Download the React DevTools/i.test(e)
    );
    check('no uncaught page exceptions', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
    check(
      'no console errors',
      realConsoleErrors.length === 0,
      realConsoleErrors.slice(0, 3).join(' | ')
    );
    // ERR_ABORTED on an image is normal: when an <img> has both `src` and
    // `srcset`, the browser starts the `src` request and aborts it once it picks
    // a srcset candidate. It is not a missing asset. Every image is separately
    // asserted to have decoded in section 3, and a real 404 still fails here.
    const realFailed = failedRequests.filter(
      (r) => !IGNORABLE_REQUEST_FAILURES.some((p) => r.includes(p))
    );
    const genuineFailures = realFailed.filter(
      (r) => !(/net::ERR_ABORTED/.test(r) && /\.(png|webp|jpg|jpeg|gif|svg|avif)(\?|$)/i.test(r))
    );
    check(
      'no failed or 4xx/5xx requests',
      genuineFailures.length === 0,
      genuineFailures.length
        ? genuineFailures.slice(0, 4).join(' | ')
        : realFailed.length
          ? `benign srcset aborts ignored: ${realFailed.length}`
          : ''
    );
  } finally {
    await browser.close();
    server.close();
  }

  section('SUMMARY');
  const passed = results.filter((r) => r.passed).length;
  console.log(`  ${passed}/${results.length} checks passed`);
  console.log(`  screenshots: ${path.relative(ROOT, SHOTS)}`);
  fs.writeFileSync(
    path.join(SHOTS, 'e2e-report.json'),
    JSON.stringify({ total: results.length, passed, failures, results }, null, 2),
    'utf8'
  );
  if (failures > 0) {
    console.error(`\n${failures} check(s) FAILED`);
    process.exit(1);
  }
  console.log('\nAll checks passed.');
}

main().catch((err) => {
  console.error('E2E harness crashed:', err);
  process.exit(1);
});
