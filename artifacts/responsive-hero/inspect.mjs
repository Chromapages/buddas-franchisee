import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const viewports = [
  [320, 568],
  [360, 800],
  [390, 844],
  [393, 852],
  [430, 932],
  [768, 900],
  [1024, 900],
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
  await page.locator(".homepage-hero-shell").screenshot({ path: `artifacts/responsive-hero/${width}x${height}.png` });
  results.push(await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) return null;
      const { width, height, top, left } = element.getBoundingClientRect();
      return { width, height, top, left };
    };
    const title = document.querySelector(".homepage-mobile-hero-title");
    const media = document.querySelector(".homepage-hero-shared-media img");
    return {
      viewport: { width: innerWidth, height: innerHeight },
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      shell: rect(".homepage-hero-shell"),
      title: title instanceof HTMLElement ? { ...rect(".homepage-mobile-hero-title"), fontSize: getComputedStyle(title).fontSize, lines: Math.round(title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight)) } : null,
      primary: rect(".homepage-mobile-hero-actions a:first-child"),
      secondary: rect(".homepage-mobile-hero-actions a:last-child"),
      media: media instanceof HTMLElement ? { ...rect(".homepage-hero-shared-media"), objectPosition: getComputedStyle(media).objectPosition } : null,
      shellDisplay: getComputedStyle(document.querySelector(".homepage-hero-shell")).display,
    };
  }));
  await page.close();
}

await fs.writeFile("artifacts/responsive-hero/results.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
