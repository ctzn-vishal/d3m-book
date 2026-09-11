import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.GALLERY_TEST_URL || 'http://localhost:3100';
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  assert.equal(response.status(), 200);
  const results = await page.locator('main img').evaluateAll(async images => {
    const results = [];
    for (const image of images) {
      image.loading = 'eager';
      await new Promise(resolve => {
        if (image.complete) return resolve();
        const timer = setTimeout(resolve, 15000);
        const done = () => { clearTimeout(timer); resolve(); };
        image.addEventListener('load', done, { once: true });
        image.addEventListener('error', done, { once: true });
      });
      results.push({ src: image.currentSrc || image.src, loaded: image.naturalWidth > 0 });
    }
    return results;
  });
  const broken = results.filter(image => !image.loaded);
  console.log(`Gallery images: ${results.length - broken.length}/${results.length} loaded`);
  for (const image of broken) console.log(`BROKEN ${image.src}`);
  assert.ok(results.length > 0, 'No gallery images found');
  assert.deepEqual(broken, []);
} finally {
  await browser.close();
}
