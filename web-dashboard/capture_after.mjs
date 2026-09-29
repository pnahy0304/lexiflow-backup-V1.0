import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

const tabs = [
  { id: 'home', text: 'Trang Chủ' },
  { id: 'dictionary', text: 'Tra Từ Vựng' },
  { id: 'flashcards', text: 'Thẻ Ghi Nhớ' },
  { id: 'ocr', text: 'Camera OCR' },
  { id: 'quiz', text: 'Trắc Nghiệm' },
  { id: 'stats', text: 'Thống Kê' },
  { id: 'friends', text: 'Bè Bạn' },
  { id: 'groups', text: 'Bảng Xếp Hạng' },
  { id: 'admin-events', text: 'Quản Lý Sự Kiện' },
  { id: 'profile', text: 'Cài Đặt Hồ Sơ' }
];

const outputDir = path.resolve('redesign/after');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    const page = await context.newPage();

    // Catch console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    for (const tab of tabs) {
      if (tab.id !== 'home') {
        await page.evaluate((tabItem) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const target = buttons.find(b => 
            b.textContent?.includes(tabItem.text) || 
            b.textContent?.toLowerCase().includes(tabItem.id)
          );
          if (target) target.click();
        }, tab);
        await page.waitForTimeout(600);
      }

      const screenshotPath = path.join(outputDir, `${tab.id}_${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Captured after: ${screenshotPath}`);
    }

    if (consoleErrors.length > 0) {
      console.warn(`[Console Errors detected for ${vp.name}]:`, consoleErrors);
    } else {
      console.log(`[Clean Console]: Zero console errors on ${vp.name}!`);
    }

    await context.close();
  }

  await browser.close();
  console.log('All AFTER screenshots captured successfully!');
}

run().catch(console.error);
