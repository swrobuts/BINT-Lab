// Regressionspruefung fuer Sprachwahl, Speicherung, Kopieren, Quiz und lokale Links.
// Lokalen Server starten, dann: node tools/check_interactions.js [Basis-URL]
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
      // Unbekannte URL- und Speicherwerte fallen sauber auf Deutsch zurueck.
      await page.goto(`${BASE}/${file}?lang=fr`, { waitUntil: 'networkidle' });
      await page.locator('h1').waitFor();
      await page.evaluate(() => localStorage.setItem('bi-lang', 'unsupported'));
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), 'de', file);
      await page.getByRole('button', { name: 'English', exact: true }).click();
      assert.equal(new URL(page.url()).searchParams.get('lang'), 'en', file);
      assert.equal(await page.evaluate(() => localStorage.getItem('bi-lang')), 'en', file);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), 'en', file);
      // Sichtbarer Text ist englisch: kein deutscher Sprachzweig sichtbar
      assert.equal(await page.locator('[lang="de"]:visible').count(), 0, `${file}: deutscher Text im EN-Modus sichtbar`);
      // Eine ausdrueckliche URL geht vor der gespeicherten englischen Wahl.
      await page.goto(`${BASE}/${file}?lang=de`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), 'de', file);
      assert.equal(await page.locator('[lang="en"]:visible').count(), 0, `${file}: englischer Text im DE-Modus sichtbar`);
      if (file !== 'index.html') await page.locator('.uebung').first().waitFor();
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

    // Quiz: falsche Antwort sperrt nicht, richtige Antwort wird vermerkt.
    await page.goto(`${BASE}/lab-01-grundlagen.html?lang=de`, { waitUntil: 'networkidle' });
    const frage = page.locator('.uebung').first();
    await frage.waitFor();
    const richtig = await page.evaluate(async () => {
      const r = await fetch('data/quiz/lab-01.json'); const f = await r.json(); return f[0].richtig;
    });
    const optionen = frage.locator('.optionen button');
    const falsch = richtig === 0 ? 1 : 0;
    await optionen.nth(falsch).click();
    await frage.getByRole('status').filter({ hasText: 'Noch nicht.' }).waitFor();
    assert.equal(await optionen.nth(falsch).getAttribute('class'), 'falsch');
    await frage.getByRole('button', { name: 'Nochmal versuchen' }).click();
    await optionen.nth(richtig).click();
    await frage.getByRole('status').filter({ hasText: 'Richtig.' }).waitFor();
    assert.ok(await frage.locator('.uebung-ok').isVisible());
    const stand = await page.evaluate(() => JSON.parse(localStorage.getItem('bi-quiz:lab-01')));
    assert.deepEqual(Object.keys(stand), ['B01-01']);
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await frage.getByRole('status').filter({ hasText: 'Correct.' }).waitFor();
    console.log('[OK] quiz: retry, mastery and stored progress');

    // Startseite: Erledigt-Marke und Ruecksetzen des Fortschritts.
    await page.goto(`${BASE}/index.html?lang=de`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.setItem('bi-lab-progress', '["01","01","99",null,6]'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.fortschritt-panel').waitFor();
    assert.match(await page.locator('.fortschritt-zahl').innerText(), /^1 \/ \d+/);
    await page.locator('.lab-erledigt').nth(1).click();
    await page.reload({ waitUntil: 'networkidle' });
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('bi-lab-progress'))), ['01', '02']);
    await page.getByRole('button', { name: 'Lernfortschritt zurücksetzen' }).click();
    await page.getByRole('button', { name: 'Ja, löschen' }).click();
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('bi-lab-progress'))), []);
    assert.equal(await page.evaluate(() => localStorage.getItem('bi-quiz:lab-01')), null);
    assert.deepEqual(errors, []);
    await context.close();

    // Browser, die Speicher sperren oder keine Clipboard-API haben.
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
      await limitedPage.locator('h1').waitFor();
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
        await limitedPage.locator('html[lang="en"] h1').waitFor();
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
