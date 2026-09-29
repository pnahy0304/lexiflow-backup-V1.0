import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

const tabs = [
  'home',
  'dictionary',
  'flashcards',
  'ocr',
  'quiz',
  'stats',
  'friends',
  'groups',
  'admin-events',
  'profile'
];

const outputDir = path.resolve('redesign/before');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e) {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch (e2) {
      browser = await chromium.launch({ headless: true });
    }
  }

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    const page = await context.newPage();

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    for (const tab of tabs) {
      if (tab !== 'home') {
        await page.evaluate((t) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent?.toLowerCase().includes(t) || b.getAttribute('data-tab') === t);
          if (btn) btn.click();
        }, tab);
        await page.waitForTimeout(400);
      }

      const screenshotPath = path.join(outputDir, `${tab}_${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Captured: ${screenshotPath}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(console.error);
