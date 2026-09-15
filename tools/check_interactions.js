// Regression checks for language selection, storage, copying and local links.
// Start a local server, then: node tools/check_interactions.js [base URL]
const assert = require('node:assert/strict');
const { launch } = require('./check_responsive');
const BASE = (process.argv[2] || 'http://127.0.0.1:8765').replace(/\/$/, '');
const PAGES = ['index.html', 'lab-01-grundlagen.html', 'lab-02-daten.html',
  'lab-03-kpis.html', 'lab-04-dashboards.html', 'lab-05-fallstudie.html',
  'lab-06-souveraenitaet.html'];

async function main() {
  const browser = await launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const paths = new Set();
    for (const file of PAGES) {
      // Unsupported URL and stored values used to crash translations[lang].
      await page.goto(`${BASE}/${file}?lang=fr`, { waitUntil: 'networkidle' });
      await page.locator('#root h1').waitFor();
      await page.evaluate(() => localStorage.setItem('bi-lang', 'unsupported'));
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), 'de', file);
      await page.getByRole('button', { name: 'English', exact: true }).click();
      assert.equal(new URL(page.url()).searchParams.get('lang'), 'en', file);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), 'en', file);
      // An explicit URL takes precedence over the stored English preference.
      await page.goto(`${BASE}/${file}?lang=de`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), 'de', file);
      const links = await page.locator('a[href]').evaluateAll((anchors) =>
        anchors.map((a) => ({ href: a.href, download: a.hasAttribute('download') })));
      for (const link of links) {
        const url = new URL(link.href);
        if (!url.href.startsWith(BASE + '/')) continue;
        paths.add(url.pathname);
        if (url.pathname === new URL(page.url()).pathname && url.hash && !link.download) {
          assert.ok(await page.locator(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).count(),
            `${file}: missing anchor ${url.hash}`);
        }
      }
      assert.doesNotMatch(await page.locator('body').innerText(), /Sommersemester|Summer Semester|20\.08\.2026|sp_bi/);
      console.log(`[OK] ${file}: language, reload, links and timeless branding`);
    }
    for (const path of paths) {
      const response = await context.request.get(new URL(path, BASE).href);
      assert.equal(response.status(), 200, path);
    }
    await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.setItem('bi-lab-progress', '["01","01","99",null,6]'));
    await page.reload({ waitUntil: 'networkidle' });
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('bi-lab-progress'))), ['01']);
    await page.locator('.lab-done-btn').nth(1).click();
    await page.reload({ waitUntil: 'networkidle' });
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('bi-lab-progress'))), ['01', '02']);
    await page.locator('.progress-reset').click();
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('bi-lab-progress'))), []);
    assert.deepEqual(errors, []);
    await context.close();

    // Simulate browsers which block storage or do not expose the Clipboard API.
    const restricted = await browser.newContext();
    await restricted.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
      Object.defineProperty(navigator, 'clipboard', { get() { return undefined; } });
      document.execCommand = () => false;
    });
    const limitedPage = await restricted.newPage();
    const limitedErrors = [];
    limitedPage.on('pageerror', (error) => limitedErrors.push(error.message));
    for (const file of PAGES) {
      await limitedPage.goto(`${BASE}/${file}?lang=invalid`, { waitUntil: 'networkidle' });
      await limitedPage.locator('#root h1').waitFor();
      await limitedPage.getByRole('button', { name: 'English', exact: true }).click();
      await limitedPage.reload({ waitUntil: 'networkidle' });
      assert.equal(await limitedPage.locator('html').getAttribute('lang'), 'en', file);
      if (file !== 'index.html') {
        await limitedPage.getByRole('button', { name: 'Copy', exact: true }).first().click();
        await limitedPage.getByRole('status').filter({ hasText: 'Copy failed' }).waitFor();
        await limitedPage.evaluate(() => { document.execCommand = () => true; });
        await limitedPage.getByRole('button', { name: 'Copy', exact: true }).first().click();
        await limitedPage.getByRole('button', { name: '✓ Copied', exact: true }).waitFor();
        assert.equal(await limitedPage.locator('textarea').count(), 0);
        await limitedPage.locator('.header-logo').click();
        await limitedPage.locator('html[lang="en"] #root h1').waitFor();
      }
      console.log(`[OK] ${file}: blocked storage and clipboard fallback`);
    }
    assert.deepEqual(limitedErrors, []);
    await restricted.close();
    console.log(`All interactions passed; ${paths.size} local link targets return HTTP 200.`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
