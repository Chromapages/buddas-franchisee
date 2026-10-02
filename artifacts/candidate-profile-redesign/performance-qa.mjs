import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const reports = [];

for (const width of [320, 390, 430]) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  const imageResponses = [];
  await page.addInitScript(() => {
    window.__candidateLayoutShift = 0;
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) if (!entry.hadRecentInput) window.__candidateLayoutShift += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  page.on("response", async (response) => {
    if (response.url().includes("buddas-about-storefront")) imageResponses.push({ url: response.url(), type: response.headers()["content-type"], length: response.headers()["content-length"] ?? null });
  });
  await page.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  const section = page.locator(".candidate-profile-mobile:visible");
  const image = section.locator("img[alt*='baker arranging']");
  const before = await image.boundingBox();
  await section.scrollIntoViewIfNeeded();
  await image.waitFor({ state: "visible" });
  await page.waitForTimeout(800);
  const after = await image.boundingBox();
  reports.push({ width, lazy: await image.getAttribute("loading"), before, after, imageResponses, horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), cls: await page.evaluate(() => window.__candidateLayoutShift) });
  await page.close();
}

await fs.writeFile("artifacts/candidate-profile-redesign/performance-qa.json", JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports, null, 2));
await browser.close();
