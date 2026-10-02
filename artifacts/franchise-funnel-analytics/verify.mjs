import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => {
  window.dataLayer = [];
});

const readEvents = () => page.evaluate(() => window.dataLayer);
await page.goto("http://localhost:3000/franchise?utm_source=google&utm_campaign=next_buddas", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
const homepageEvents = await readEvents();

await page.getByRole("link", { name: "Explore the Opportunity", exact: true }).click();
await page.waitForTimeout(2000);
const opportunityEvents = await readEvents();

await page.goBack({ waitUntil: "domcontentloaded" });
await page.getByRole("link", { name: "Start the 3-Step Inquiry", exact: true }).click();
await page.waitForTimeout(500);
await page.locator("#firstName").fill("Test");
await page.locator("#lastName").fill("Candidate");
await page.locator("#email").fill("test@example.test");
await page.locator("#phone").fill("555-555-5555");
await page.getByRole("button", { name: "Continue", exact: true }).click();
await page.waitForTimeout(500);
const inquiryEvents = await readEvents();

const result = {
  homepageEvents,
  opportunityEvents,
  inquiryEvents,
  inquiryStep: await page.locator("[aria-label='Franchise inquiry progress'] h3").textContent(),
};
await fs.writeFile("artifacts/franchise-funnel-analytics/events.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
