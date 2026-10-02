import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const results = [];

for (const [width, height] of [[320, 900], [360, 900], [375, 900], [390, 1000], [393, 1000], [430, 1000], [768, 1000], [1440, 1000]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const messages = [];
  page.on("console", (message) => { if (["warning", "error"].includes(message.type())) messages.push(message.text()); });
  page.on("pageerror", (error) => messages.push(error.message));
  await page.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const section = page.locator(".operator-proof-section:visible");
  await section.screenshot({ path: `artifacts/operator-proof-stack/${width}.png` });
  results.push(await section.evaluate((element) => ({
    viewport: innerWidth,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    mobileRows: [...element.querySelectorAll(".operator-proof-mobile-stack li")].filter((row) => row.getBoundingClientRect().height > 0).length,
    disclosureButtons: [...element.querySelectorAll("button")].filter((button) => button.getBoundingClientRect().height > 0).length,
    visibleHeadings: [...element.querySelectorAll("h2,h3")].filter((heading) => heading.getBoundingClientRect().height > 0).map((heading) => heading.textContent.trim()),
    openPanels: [...element.querySelectorAll(".operator-proof-mobile-stack [role=region]")].filter((panel) => panel.getAttribute("aria-hidden") === "false").map((panel) => panel.id),
    bodySizes: [...element.querySelectorAll(".operator-proof-mobile-stack [role=region][aria-hidden=false] p")].map((paragraph) => getComputedStyle(paragraph).fontSize),
    cta: (() => {
      const link = element.querySelector(".operator-proof-mobile-cta a");
      if (!(link instanceof HTMLElement) || link.getBoundingClientRect().height === 0) return null;
      const box = link.getBoundingClientRect();
      return { width: box.width, height: box.height, href: link.getAttribute("href"), text: link.textContent.trim() };
    })(),
    messages: [],
  })));
  results.at(-1).messages = messages;
  await page.close();
}

const detailPage = await browser.newPage({ viewport: { width: 320, height: 900 }, reducedMotion: "reduce" });
await detailPage.addInitScript(() => { window.dataLayer = []; });
await detailPage.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
await detailPage.waitForTimeout(400);
const dataRequestsDuringExpansion = [];
detailPage.on("request", (request) => {
  if (["fetch", "xhr"].includes(request.resourceType())) dataRequestsDuringExpansion.push(request.url());
});
const section = detailPage.locator(".operator-proof-section:visible");
const product = section.getByRole("button", { name: /Product.*The Budda Roll creates distinction/i });
const system = section.getByRole("button", { name: /System.*Clear standards make execution teachable/i });
const productPanel = section.locator("#operator-proof-panel-product");
const defaultExpanded = await product.getAttribute("aria-expanded");
const reducedMotionTransition = await productPanel.evaluate((panel) => ({ duration: getComputedStyle(panel).transitionDuration, property: getComputedStyle(panel).transitionProperty }));
await detailPage.emulateMedia({ reducedMotion: "no-preference" });
const normalMotionTransition = await productPanel.evaluate((panel) => ({ duration: getComputedStyle(panel).transitionDuration, property: getComputedStyle(panel).transitionProperty }));
await product.focus();
await product.press("Space");
await detailPage.waitForTimeout(50);
const productClosedWithSpace = await product.getAttribute("aria-expanded");
const productPanelInertWhenClosed = await productPanel.getAttribute("inert");
await product.press("Space");
await detailPage.waitForTimeout(50);
const productOpenedWithSpace = await product.getAttribute("aria-expanded");
await system.focus();
const scrollBeforeSystemOpen = await detailPage.evaluate(() => window.scrollY);
const systemInteractionStartedAt = await detailPage.evaluate(() => performance.now());
const dataRequestCountBeforeSystemOpen = dataRequestsDuringExpansion.length;
await system.evaluate((element) => (element instanceof HTMLButtonElement ? element.click() : null));
await detailPage.waitForTimeout(50);
const scrollAfterSystemOpen = await detailPage.evaluate(() => window.scrollY);
const systemInteractionLatencyMs = await detailPage.evaluate((startedAt) => performance.now() - startedAt, systemInteractionStartedAt);
const dataRequestsDuringSystemExpansion = dataRequestsDuringExpansion.slice(dataRequestCountBeforeSystemOpen);
const systemExpandedAfterToggle = await system.getAttribute("aria-expanded");
const productCollapsedAfterSystemOpen = await product.getAttribute("aria-expanded");
const readingOrder = await section.ariaSnapshot();
const cta = section.getByRole("link", { name: "Explore the Opportunity", exact: true });
await cta.focus();
await section.screenshot({ path: "artifacts/operator-proof-stack/320-focus.png" });
await cta.click();
await detailPage.waitForTimeout(300);
const analytics = await detailPage.evaluate(() => window.dataLayer?.filter((event) => typeof event.event === "string" && event.event.startsWith("franchise_advantage_")));

const zoomPage = await browser.newPage({ viewport: { width: 320, height: 900 } });
await zoomPage.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
await zoomPage.evaluate(() => {
  const elements = [...document.querySelectorAll(".operator-proof-section h2, .operator-proof-section h3, .operator-proof-section p, .operator-proof-section dt, .operator-proof-section dd, .operator-proof-section a")];
  const sizes = elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  elements.forEach((element, index) => { element.style.fontSize = `${sizes[index] * 2}px`; });
});
await zoomPage.locator(".operator-proof-section:visible").screenshot({ path: "artifacts/operator-proof-stack/320-text-200.png" });
const textZoomOverflow = await zoomPage.evaluate(() => document.documentElement.scrollWidth > innerWidth);

const output = { results, defaultExpanded, reducedMotionTransition, normalMotionTransition, productClosedWithSpace, productPanelInertWhenClosed, productOpenedWithSpace, systemExpandedAfterToggle, productCollapsedAfterSystemOpen, scrollBeforeSystemOpen, scrollAfterSystemOpen, systemInteractionLatencyMs, dataRequestsDuringSystemExpansion, readingOrder, analytics, textZoomOverflow };
await fs.writeFile("artifacts/operator-proof-stack/results.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
await browser.close();
