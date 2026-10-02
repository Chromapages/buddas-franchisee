import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => { window.dataLayer = []; });
await page.goto("http://localhost:3000/franchise?utm_source=qa&utm_campaign=candidate", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);
await page.evaluate(() => document.addEventListener("click", (event) => {
  const link = (event.target instanceof Element ? event.target.closest("a") : null);
  if (link?.href.includes("/franchise/the-opportunity") || link?.href.includes("/franchise/contact")) event.preventDefault();
}, true));
const section = page.locator(".candidate-profile-mobile:visible");
await section.scrollIntoViewIfNeeded();
await page.waitForTimeout(150);

await section.getByRole("link", { name: /See financial qualifications/i }).evaluate((element) => element.click());
await page.waitForTimeout(50);
await section.getByRole("link", { name: "View Qualifications", exact: true }).evaluate((element) => element.click());
await page.waitForTimeout(50);
await section.getByRole("link", { name: /Start the 3-Step Inquiry/i }).evaluate((element) => element.click());
await page.waitForTimeout(50);

const events = await page.evaluate(() => window.dataLayer?.filter((event) => typeof event.event === "string" && event.event.startsWith("franchise_")));
await fs.writeFile("artifacts/candidate-profile-redesign/analytics-qa.json", JSON.stringify(events, null, 2));
console.log(JSON.stringify(events, null, 2));
await browser.close();
