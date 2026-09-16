// 把 og.source.html 截成 1200x630 的 og.png。
// 手動執行：npx --yes playwright@latest install chromium && node assets/render-og.mjs
// 產出的 og.png 會進版控，CI 不需要跑這一步。
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const src = pathToFileURL(resolve('assets/og.source.html')).href;
const out = resolve('assets/og.png');

const browser = await chromium.launch({ channel: 'chrome' }); // 用系統上已安裝的 Chrome，不另外下載
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2, // 2x 讓縮圖在高解析螢幕上也清楚
});
await page.goto(src, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
await page.screenshot({ path: out });
await browser.close();

console.log(`寫入 ${out}`);
