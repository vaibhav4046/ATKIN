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
      // The advocate artwork the hero verification card now presents. Its
      // displayed digest must be recomputable from these exact bytes, same as
      // every other seal the product shows.
      'atkin/characters/atkin-character-files.webp',
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
    // A lazy image that has not loaded yet is not a broken image. This check used
    // to treat `complete === false` as broken, which flagged every image below the
    // fold and only passed by luck of how tall the page happened to be. Changing
    // the hero artwork shifted the page height and turned that latent flakiness
    // into a real failure. Force the lazy images to load first, then assert on the
    // images that genuinely failed to decode.
    await page.evaluate(() => {
      for (const img of document.images) img.loading = 'eager';
    });
    await page
      .waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, {
        timeout: 20000,
      })
      .catch(() => {});
    const imgStats = await page.evaluate(() =>
      Array.from(document.images).map((i) => ({
        src: i.currentSrc || i.src,
        complete: i.complete,
        w: i.naturalWidth,
        h: i.naturalHeight,
      }))
    );
    const brokenImgs = imgStats.filter((i) => i.w === 0);
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

    section('11b. Every lazily-loaded workbench tab actually loads and renders');
    // The tabs are code-split. A chunk that fails to resolve renders an empty
    // region with no error, so this must be asserted by clicking each one and
    // waiting for real content, not by trusting the build output.
    //
    // Uses the Demo workspace because the personal workspace is deliberately
    // empty, and an empty matter cannot prove a tab rendered.
    const demo = page.locator('aside button:has-text("Sample Workspace")').first();
    if (await demo.count()) {
      await demo.click();
      await page.waitForTimeout(1500);
    }

    // Guard against the false pass this check previously had: an empty personal
    // workspace renders the same empty state for every tab, so a length check
    // passes without the tab ever mounting. Require a real matter first.
    const demoMatterLoaded = await page.evaluate(() => {
      const t = document.querySelector('main')?.innerText || '';
      return !/Your Practice is Clean/i.test(t);
    });
    check(
      'Demo workspace actually contains a matter after switching',
      demoMatterLoaded,
      demoMatterLoaded ? 'matter present' : 'still showing the empty personal state'
    );
    if (!demoMatterLoaded) {
      check('lazy tab journey', false, 'skipped: no matter to render tabs against');
    } else {

    // Sidebar sub-items are collapsed under group headers.
    const expand = async (group) => {
      const g = page.locator(`aside button:has-text("${group}")`).first();
      if (await g.count()) {
        await g.click();
        await page.waitForTimeout(200);
      }
    };

    const openTab = async (label) => {
      const control = page.locator(`aside button:has-text("${label}")`).first();
      if ((await control.count()) === 0) return false;
      await control.click();
      await page
        .waitForSelector('[data-testid="tab-loading"]', { state: 'detached', timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(300);
      return true;
    };

    const mainText = async () => {
      const t = await page.locator('main').first().innerText().catch(() => '');
      return t.trim();
    };

    await expand('Matter Intelligence');
    const exploreTabs = [
      'Ask',
      'Fact Ledger',
      'Timeline & Conflicts',
      'Evidence Graph',
      'Research',
      'Notebook Studio',
      'Matter Memory',
    ];
    // Collect a fingerprint per tab so we can prove they are actually different
    // surfaces. Identical text across every tab means the tabs are not mounting,
    // and a length check alone would have passed anyway.
    const tabFingerprints = [];
    const recordFingerprint = (label, text) => {
      tabFingerprints.push({ label, length: text.length, head: text.slice(0, 120) });
    };

    for (const label of exploreTabs) {
      const found = await openTab(label);
      if (!found) {
        check(`tab "${label}" has a control`, false, 'control not found after expanding group');
        continue;
      }
      const text = await mainText();
      recordFingerprint(label, text);
      check(
        `tab "${label}" loaded and rendered content`,
        text.length > 40,
        `${text.length} chars`
      );
    }

    await expand('Drafting');
    for (const label of ['Court Briefs & Pleadings', 'Contract Playbooks']) {
      const found = await openTab(label);
      if (!found) {
        check(`tab "${label}" has a control`, false, 'control not found after expanding group');
        continue;
      }
      const text = await mainText();
      recordFingerprint(label, text);
      check(`tab "${label}" loaded and rendered content`, text.length > 40, `${text.length} chars`);
    }

    for (const [name, locator] of [
      ['Needs review', 'aside button:has-text("Needs review")'],
      ['Settings & Connectors', 'aside button:has-text("Settings & Connectors")'],
      ['Sources', 'aside button:has-text("Sources")'],
      ['Home', 'aside button:has-text("Home")'],
    ]) {
      const control = page.locator(locator).first();
      if ((await control.count()) === 0) {
        check(`tab "${name}" has a control`, false, 'control not found');
        continue;
      }
      await control.click();
      await page
        .waitForSelector('[data-testid="tab-loading"]', { state: 'detached', timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(300);
      const text = await mainText();
      recordFingerprint(name, text);
      check(`tab "${name}" loaded and rendered content`, text.length > 40, `${text.length} chars`);
    }

    section('11c. Application chrome geometry is measured, not assumed');
    // GlobalNav is `fixed` and the TopRail is `sticky top-[52px]`. A sticky box
    // whose static position is above its own threshold is painted lower without
    // reserving layout space, so the rail silently covered the top 52px of the
    // workbench body: the Overview greeting was invisible and the first line of
    // the "Active Matter" block was clipped. No text-length or visibility check
    // can catch that, because the content is present in the DOM, so the geometry
    // itself has to be asserted.
    //
    // Measure only at scrollY 0. A sticky rail stays pinned while the body scrolls
    // beneath it, so comparing the two in viewport coordinates at any other scroll
    // position reports the scroll offset as if it were an overlap.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const chrome = await page.evaluate(() => {
      const rail = document.querySelector('.sticky');
      const main = document.querySelector('main');
      if (!rail || !main) return { error: 'rail or main not found' };
      const rr = rail.getBoundingClientRect();
      const mr = main.getBoundingClientRect();
      const greeting = [...document.querySelectorAll('h2')].find((e) =>
        /Practitioner/.test(e.textContent || '')
      );
      let greetingPainted = 'no greeting element found';
      if (greeting) {
        const gb = greeting.getBoundingClientRect();
        const hit = document.elementFromPoint(
          Math.round(gb.left + 20),
          Math.round(gb.top + gb.height / 2)
        );
        greetingPainted =
          hit && (hit === greeting || greeting.contains(hit))
            ? 'painted'
            : `covered by ${hit ? hit.tagName : 'nothing'}`;
      }
      return {
        railTop: Math.round(rr.top),
        railBottom: Math.round(rr.bottom),
        mainTop: Math.round(mr.top),
        overlapPx: Math.round(rr.bottom - mr.top),
        scrollY: Math.round(window.scrollY),
        greetingPainted,
      };
    });
    check(
      'top rail does not overlap the workbench body',
      !chrome.error && chrome.scrollY === 0 && chrome.overlapPx <= 0,
      chrome.error ||
        `at scrollY ${chrome.scrollY}: rail ends at ${chrome.railBottom}, body starts at ${chrome.mainTop} (overlap ${chrome.overlapPx}px)`
    );
    check(
      'overview greeting is actually painted, not covered by the rail',
      chrome.greetingPainted === 'painted',
      chrome.greetingPainted
    );

    // The provenance panel pins itself below the chrome with a hardcoded offset
    // that drifted to 108px while the real chrome is 110px, hiding its top edge
    // on scroll. Only asserted when the panel is actually mounted.
    const sourcesControl = page.locator('aside button:has-text("Sources")').first();
    if (await sourcesControl.count()) {
      await sourcesControl.click();
      await page
        .waitForSelector('[data-testid="tab-loading"]', { state: 'detached', timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(400);
      const panel = await page.evaluate(() => {
        const rail = document.querySelector('.sticky');
        const aside = [...document.querySelectorAll('aside')].find((a) =>
          (a.className || '').toString().includes('320px')
        );
        if (!rail || !aside) return { notMounted: true };
        const rr = rail.getBoundingClientRect();
        const pr = aside.getBoundingClientRect();
        return {
          railBottom: Math.round(rr.bottom),
          panelTop: Math.round(pr.top),
          hiddenPx: Math.round(rr.bottom - pr.top),
        };
      });
      if (!panel.notMounted) {
        check(
          'source provenance panel is not tucked under the top rail',
          panel.hiddenPx <= 0,
          `rail ends at ${panel.railBottom}, panel starts at ${panel.panelTop} (hidden ${panel.hiddenPx}px)`
        );
      }
      await page.locator('aside button:has-text("Home")').first().click().catch(() => {});
      await page.waitForTimeout(300);
    }

    section('11d. The workbench is usable on a phone, not just on a desktop');
    // Found by running the real APK on an Android 16 emulator: the app launched
    // and IndexedDB worked, but the workbench was unreadable. Three separate
    // width failures, all invisible at 1440px:
    //   1. the rail's control cluster was shrink-0 and 722px wide, stretching the
    //      document to 762px inside a 390px viewport
    //   2. the sidebar was a permanent 248px column, leaving <main> zero width
    //   3. the source inspector's empty state was a fixed 300px sibling
    // A judge opening this on a phone would have seen none of the product.
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
    try {
      await phone.goto(`${base}#/workbench`, { waitUntil: 'domcontentloaded' });
      await phone.waitForSelector("[data-durable-ready='true']", { timeout: 30000 });
      await phone.waitForTimeout(1200);
      const mob = await phone.evaluate(() => {
        const de = document.documentElement;
        const main = document.querySelector('main');
        const rail = document.querySelector('.sticky');
        const mr = main ? main.getBoundingClientRect() : null;
        const rr = rail ? rail.getBoundingClientRect() : null;
        return {
          overflow: de.scrollWidth - window.innerWidth,
          viewportW: window.innerWidth,
          mainW: mr ? Math.round(mr.width) : 0,
          railOverlapsMain: rr && mr ? Math.round(rr.bottom - mr.top) : 0,
          navBtn: !!document.querySelector('button[aria-label="Open navigation"]'),
        };
      });
      check(
        'no horizontal overflow at 390px',
        mob.overflow <= 0,
        `document overflows viewport by ${mob.overflow}px`
      );
      check(
        'workbench body is usable width on a phone',
        mob.mainW >= mob.viewportW - 8,
        `main is ${mob.mainW}px of a ${mob.viewportW}px viewport`
      );
      check(
        'top rail still does not overlap the body at 390px',
        mob.railOverlapsMain <= 0,
        `overlap ${mob.railOverlapsMain}px`
      );
      check(
        'navigation is reachable on a phone',
        mob.navBtn,
        mob.navBtn ? 'drawer toggle present' : 'no way to open the sidebar'
      );

      // The drawer must actually open and must not push the body around.
      if (mob.navBtn) {
        await phone.click('button[aria-label="Open navigation"]');
        await phone.waitForTimeout(450);
        const opened = await phone.evaluate(() => {
          const main = document.querySelector('main');
          const drawer = document.querySelector('[data-testid="nav-drawer"]');
          return {
            flag: drawer ? drawer.getAttribute('data-open') : 'missing',
            onScreen: drawer
              ? Math.round(drawer.getBoundingClientRect().left) >= 0
              : false,
            mainW: main ? Math.round(main.getBoundingClientRect().width) : 0,
          };
        });
        check(
          'navigation drawer opens on a phone',
          opened.flag === 'true' && opened.onScreen,
          `data-open=${opened.flag}, onScreen=${opened.onScreen}`
        );
        check(
          'opening the drawer does not squeeze the body',
          opened.mainW >= mob.viewportW - 8,
          `main is ${opened.mainW}px while the drawer is open`
        );
        await phone.screenshot({ path: path.join(SHOTS, 'workbench-phone-390.png') });
      }
    } finally {
      await phone.close();
    }

    section('11e. Text contrast passes AA in BOTH themes, on real content');
    // The earlier dark-mode check sampled a handful of selectors on the landing
    // page only, so 20 unreadable elements across the workbench sailed through it.
    // Two root causes were behind them and neither is visible to a sampling check:
    // `darkMode` was never set, so Tailwind keyed its `dark:` variants off the OS
    // while the product's own toggle set a class; and roughly 400 class usages
    // named stock Tailwind colours that never flip.
    //
    // This walks every leaf text element on real content and resolves the
    // effective background through the ancestor chain, in both themes.
    const contrastAudit = () => {
      const parse = (s) => {
        const m = String(s).match(/[\d.]+/g);
        if (!m) return null;
        return { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] };
      };
      const over = (f, g) => ({
        r: f.r * f.a + g.r * (1 - f.a),
        g: f.g * f.a + g.g * (1 - f.a),
        b: f.b * f.a + g.b * (1 - f.a),
        a: 1,
      });
      const lum = (c) => {
        const f = (v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
      };
      const effBg = (el) => {
        let n = el;
        let acc = null;
        while (n && n !== document.documentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c && c.a > 0) {
            acc = acc ? over(acc, c) : c;
            if (acc.a >= 0.999) return acc;
          }
          n = n.parentElement;
        }
        const r = parse(getComputedStyle(document.body).backgroundColor);
        const fb = r && r.a > 0 ? r : { r: 10, g: 10, b: 10, a: 1 };
        return acc ? over(acc, fb) : fb;
      };
      const out = [];
      const sel = 'p,span,h1,h2,h3,h4,li,td,th,a,button,label,div,mark';
      for (const el of document.querySelectorAll(sel)) {
        const t = (el.textContent || '').trim();
        if (!t || t.length < 2) continue;
        if ([...el.children].some((c) => (c.textContent || '').trim().length > 1)) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const fg = parse(cs.color);
        if (!fg) continue;
        const bg = effBg(el);
        const l1 = lum(over(fg, bg));
        const l2 = lum(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const size = parseFloat(cs.fontSize);
        const need =
          size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
        if (ratio < need) {
          out.push({ t: t.slice(0, 28), ratio: Math.round(ratio * 100) / 100, need, color: cs.color });
        }
      }
      const seen = new Set();
      return out.filter((x) => {
        const k = x.t + x.color;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    };

    for (const theme of ['dark', 'light']) {
      const cp = await context.newPage();
      try {
        await cp.goto(`${base}#/workbench`, { waitUntil: 'domcontentloaded' });
        await cp.waitForSelector("[data-durable-ready='true']", { timeout: 30000 });
        await cp.waitForTimeout(700);
        await cp.evaluate((m) => {
          const r = document.documentElement;
          r.setAttribute('data-theme', m);
          r.classList.toggle('dark', m === 'dark');
        }, theme);
        // Real content, not the empty state.
        await cp.click('button[aria-label="Open navigation"]').catch(() => {});
        await cp.waitForTimeout(300);
        await cp.getByRole('button', { name: /reload sample matter/i }).first().click().catch(() => {});
        await cp.waitForTimeout(2200);

        for (const [label, re] of [
          ['Home', /^home$/i],
          ['Sources', /sources/i],
          ['Settings', /settings/i],
        ]) {
          await cp.click('button[aria-label="Open navigation"]').catch(() => {});
          await cp.waitForTimeout(200);
          await cp.getByRole('button', { name: re }).first().click().catch(() => {});
          await cp.waitForTimeout(900);
          const bad = await cp.evaluate(contrastAudit);
          check(
            `${theme} mode: every text on ${label} meets AA contrast`,
            bad.length === 0,
            bad.length
              ? bad
                  .slice(0, 4)
                  .map((x) => `${x.ratio}:1 (need ${x.need}) "${x.t}" ${x.color}`)
                  .join(' | ')
              : 'all text >= 4.5:1'
          );
        }
      } finally {
        await cp.close();
      }
    }

    const distinctHeads = new Set(tabFingerprints.map((t) => t.head));
    check(
      'tabs render distinct surfaces, not one repeated panel',
      distinctHeads.size >= Math.min(5, tabFingerprints.length),
      `${distinctHeads.size} distinct of ${tabFingerprints.length} tabs`
    );
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
      (r) => !(/net::ERR_ABORTED/.test(r) && /\.(png|webp|jpg|jpeg|gif|svg|avif)\b/i.test(r))
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
