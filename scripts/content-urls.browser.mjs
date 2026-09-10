import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { publicContentHtml } from '../lib/content-html.mjs';

const base = process.env.CONTENT_TEST_URL || 'http://localhost:3100';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const colorScheme of ['light', 'dark']) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ colorScheme, viewport: { width, height: 900 } });
      await context.addInitScript(theme => localStorage.setItem('theme', theme), colorScheme);
      for (const path of ['/read/scientific-publishing', '/studios/religious-composition', '/', '/teaching', '/teaching/part/I', '/ch01-reading-data']) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle', timeout: 60000 });
        assert.equal(response.status(), 200, path);
        assert.equal(new URL(page.url()).pathname, path);
        assert.ok(await page.locator('body').innerText(), path);
        if (path.startsWith('/read/') || path.startsWith('/studios/')) {
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://vishalsingh.org${path}`);
          assert.ok(await page.locator('svg, canvas').count() > 0, `No charts rendered: ${path}`);
        }
        if (path === '/') {
          assert.ok(await page.locator('a[href^="/read/"], a[href^="/studios/"]').count() > 0);
          assert.equal(await page.locator('a[href^="https://content.vishalsingh.org/"][href$=".html"]').count(), 0);
        }
        assert.deepEqual(errors, [], `${path} (${colorScheme}, ${width})`);
        console.log(`OK ${colorScheme} ${width} ${path}`);
        await page.close();
      }
      await context.close();
    }
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  const item = { id: 'url-test', type: 'Blog', status: 'published', title: 'URL test', description: '', tags: [], href: 'https://content.vishalsingh.org/articles/url-test.html' };
  const html = publicContentHtml('<html><head><meta charset="utf-8"></head><body style="padding-top:100px"><a id="jump" href="#result">Jump</a><div id="result"></div><script>fetch("./fixture.json").then(r=>r.json()).then(d=>document.getElementById("result").textContent=d.message)</script></body></html>', item, [item], '/read/url-test?from=test');
  await page.route('**/read/url-test?from=test', route => route.fulfill({ contentType: 'text/html', body: html }));
  await page.route('**/_content/articles/fixture.json', route => route.fulfill({ contentType: 'application/json', body: '{"message":"relative-fetch-ok"}' }));
  await page.goto(`${base}/read/url-test?from=test`);
  await page.locator('#result').filter({ hasText: 'relative-fetch-ok' }).waitFor();
  await page.locator('#jump').click();
  assert.equal(new URL(page.url()).pathname, '/read/url-test');
  assert.equal(new URL(page.url()).hash, '#result');
  assert.equal(new URL(page.url()).search, '?from=test');
  const alias = await context.request.get(`${base}/studios/religious-composition-dashboard?from=test`, { maxRedirects: 0 });
  assert.equal(alias.status(), 308);
  assert.equal(alias.headers().location, '/studios/religious-composition?from=test');
  const asset = await context.request.get(`${base}/_content/studios/religious-composition-dashboard/preview.jpg`);
  assert.equal(asset.status(), 200);
  assert.match(asset.headers()['content-type'], /image\/jpeg/);
  await context.close();
  console.log('OK relative fetch, anchor navigation, alias redirect, and proxied asset');
} finally {
  await browser.close();
}
