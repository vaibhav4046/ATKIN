import { chromium } from 'playwright-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Minimal static file server for dist/
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const distDir = path.resolve('dist');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexPath = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

const PORT = 4188;

server.listen(PORT, async () => {
  console.log(`Static server running on http://localhost:${PORT}`);
  const outDir = path.resolve('lab/shots');
  fs.mkdirSync(outDir, { recursive: true });

  const browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: browserPath,
    headless: true
  });

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'laptop-1024', width: 1024, height: 768 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-320', width: 320, height: 640 }
  ];

  const results = [];

  for (const vp of viewports) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height }
    });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`http://localhost:${PORT}`);
    await page.waitForLoadState('networkidle');

    // 1. Check horizontal scroll overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`ScrollWidth: ${scrollWidth}px vs WindowWidth: ${vp.width}px. Overflow: ${overflow}`);

    if (overflow) {
      const culprits = await page.evaluate(() => {
        const docW = window.innerWidth;
        const els = document.querySelectorAll('*');
        const list = [];
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.right > docW + 2) {
            list.push({
              tag: el.tagName,
              className: (el.className?.slice ? el.className.slice(0, 80) : ''),
              text: el.innerText ? el.innerText.slice(0, 50).replace(/\n/g, ' ') : '',
              width: Math.round(r.width),
              right: Math.round(r.right)
            });
          }
        }
        return list;
      });
      console.log('Top overflow culprits:', culprits.slice(0, 5));
    }

    // Take screenshot of landing
    const landingShot = path.join(outDir, `${vp.name}-landing.png`);
    await page.screenshot({ path: landingShot, fullPage: false });

    // Test signature interaction in desktop/laptop
    if (vp.width >= 768) {
      const novacorpBtn = await page.$('button:has-text("2. NovaCorp Cloud Contract [2026]")');
      if (novacorpBtn) {
        await novacorpBtn.click();
        await page.waitForTimeout(300);
        console.log('Clicked NovaCorp case tab successfully.');
      }

      const abstentionBtn = await page.$('button:has-text("3. Strict Evidential Abstention")');
      if (abstentionBtn) {
        await abstentionBtn.click();
        await page.waitForTimeout(300);
        console.log('Clicked Abstention case tab successfully.');
      }
    }

    // Click Launch Workbench
    const launchBtn = await page.$('button:has-text("Launch Sovereign Workbench")');
    if (launchBtn) {
      await launchBtn.click();
      await page.waitForTimeout(500);

      // Verify workbench loaded
      const hasSidebar = await page.$('aside');
      console.log(`Workbench opened. Has sidebar: ${!!hasSidebar}`);

      const workbenchShot = path.join(outDir, `${vp.name}-workbench.png`);
      await page.screenshot({ path: workbenchShot, fullPage: false });
    }

    results.push({
      viewport: vp.name,
      width: vp.width,
      overflow,
      consoleErrorsCount: consoleErrors.length
    });

    await page.close();
  }

  await browser.close();
  server.close();

  console.log('\n================ VERIFICATION SUMMARY ================');
  console.table(results);
  const allPass = results.every(r => !r.overflow && r.consoleErrorsCount === 0);
  console.log(`\nOVERALL VISUAL & RESPONSIVE CHECK: ${allPass ? 'PASSED (100% CLEAN)' : 'FAILED'}`);
  process.exit(allPass ? 0 : 1);
});
