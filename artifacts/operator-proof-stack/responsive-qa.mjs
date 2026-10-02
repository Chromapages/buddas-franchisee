import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const url = "http://localhost:3000/franchise";
const viewports = [[320, 568], [360, 800], [375, 812], [390, 844], [393, 852], [430, 932]];
const browser = await chromium.launch({ headless: true });

const inspectViewport = async ([width, height]) => {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);

  const section = page.locator("#operator-proof-mobile:visible");
  const product = page.locator("#operator-proof-trigger-product");
  const system = page.locator("#operator-proof-trigger-system");
  const panels = page.locator("#operator-proof-mobile [role=region]");
  const initialProduct = await product.getAttribute("aria-expanded");
  const waitForState = (predicate) => page.waitForFunction(predicate, undefined, { timeout: 2_000 }).catch(() => undefined);
  const activateUntil = async (control, predicate) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await control.evaluate((element) => (element instanceof HTMLButtonElement ? element.click() : null));
      await waitForState(predicate);
      if (await page.evaluate(predicate)) return true;
    }
    return false;
  };

  await activateUntil(product, () => [...document.querySelectorAll("#operator-proof-mobile [role=region]")].every((panel) => panel.getAttribute("aria-hidden") === "true"));
  const allCollapsed = await panels.evaluateAll((items) => items.every((item) => item.getAttribute("aria-hidden") === "true"));

  await activateUntil(product, () => document.getElementById("operator-proof-trigger-product")?.getAttribute("aria-expanded") === "true");
  const productExpanded = await product.getAttribute("aria-expanded");

  await activateUntil(system, () => document.getElementById("operator-proof-trigger-system")?.getAttribute("aria-expanded") === "true");
  const systemExpanded = await system.getAttribute("aria-expanded");
  const productCollapsedAfterSystem = await product.getAttribute("aria-expanded");
  const expandedCount = await panels.evaluateAll((items) => items.filter((item) => item.getAttribute("aria-hidden") === "false").length);

  await system.focus();
  const focusedBeforeKeyboard = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press("Space");
  await waitForState(() => document.getElementById("operator-proof-trigger-system")?.getAttribute("aria-expanded") === "false");
  const focusedAfterKeyboard = await page.evaluate(() => document.activeElement?.id);
  const systemAfterKeyboard = await system.getAttribute("aria-expanded");

  const metrics = await section.evaluate((element) => {
    const allText = [...element.querySelectorAll("h2, h3, p, dt, dd, a, button")];
    const visibleText = allText.filter((node) => !node.closest("[aria-hidden=true]"));
    const clipped = visibleText.filter((node) => {
      const style = getComputedStyle(node);
      const clipsOverflow = /hidden|clip/.test(`${style.overflowX} ${style.overflowY}`);
      return clipsOverflow && (node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1);
    }).map((node) => node.textContent?.trim());
    const headers = [...element.querySelectorAll(".operator-proof-mobile-stack button")];
    const headerMetrics = headers.map((button) => {
      const box = button.getBoundingClientRect();
      return { height: box.height, fontSize: getComputedStyle(button.querySelector("span > span:last-child") ?? button).fontSize };
    });
    const cta = element.querySelector(".operator-proof-mobile-cta a");
    const ctaBox = cta?.getBoundingClientRect();
    return {
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      clipped,
      headerMetrics,
      ctaVisible: Boolean(ctaBox && ctaBox.width > 0 && ctaBox.height > 0),
      dividerCount: element.querySelectorAll(".operator-proof-mobile-stack > li").length,
      panelOverlap: [...element.querySelectorAll("[role=region][aria-hidden=false]")].some((panel) => {
        const panelBox = panel.getBoundingClientRect();
        const next = panel.parentElement?.nextElementSibling;
        return Boolean(next && panelBox.bottom > next.getBoundingClientRect().top + 1);
      }),
    };
  });

  await page.screenshot({ path: `artifacts/operator-proof-stack/qa-${width}x${height}.png`, fullPage: true });
  await page.close();

  return {
    viewport: `${width}x${height}`,
    noHorizontalOverflow: !metrics.horizontalOverflow,
    noClippedCopy: metrics.clipped.length === 0,
    clippedCopy: metrics.clipped,
    minHeaderHeight: Math.min(...metrics.headerMetrics.map(({ height }) => height)),
    minHeaderFontSize: Math.min(...metrics.headerMetrics.map(({ fontSize }) => Number.parseFloat(fontSize))),
    noTinyHeaderTarget: metrics.headerMetrics.every(({ height }) => height >= 48),
    noPanelOverlap: !metrics.panelOverlap,
    ctaVisible: metrics.ctaVisible,
    structuralDividers: metrics.dividerCount === 4,
    productDefaultExpanded: initialProduct === "true",
    allPanelsCollapsed: allCollapsed,
    productExpanded: productExpanded === "true",
    systemExpanded: systemExpanded === "true",
    multiplePanels: expandedCount > 1 ? "SUPPORTED" : "NOT_SUPPORTED_BY_DESIGN",
    focusPreserved: focusedBeforeKeyboard === focusedAfterKeyboard && focusedAfterKeyboard === "operator-proof-trigger-system",
    systemToggledWithSpace: systemAfterKeyboard === "false",
    errors,
  };
};

const viewportResults = [];
for (const viewport of viewports) viewportResults.push(await inspectViewport(viewport));

const reducedMotionPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await reducedMotionPage.goto(url, { waitUntil: "domcontentloaded" });
await reducedMotionPage.waitForTimeout(300);
const reducedMotion = await reducedMotionPage.locator("#operator-proof-panel-product").evaluate((panel) => ({ duration: getComputedStyle(panel).transitionDuration, property: getComputedStyle(panel).transitionProperty }));
await reducedMotionPage.close();

const zoomPage = await browser.newPage({ viewport: { width: 320, height: 568 } });
await zoomPage.goto(url, { waitUntil: "domcontentloaded" });
await zoomPage.waitForTimeout(300);
await zoomPage.evaluate(() => {
  const elements = [...document.querySelectorAll("#operator-proof-mobile h2, #operator-proof-mobile h3, #operator-proof-mobile p, #operator-proof-mobile dt, #operator-proof-mobile dd, #operator-proof-mobile a, #operator-proof-mobile button")];
  for (const element of elements) element.style.fontSize = `${Number.parseFloat(getComputedStyle(element).fontSize) * 2}px`;
});
const textZoom = await zoomPage.evaluate(() => {
  const visibleText = [...document.querySelectorAll("#operator-proof-mobile h2, #operator-proof-mobile h3, #operator-proof-mobile p, #operator-proof-mobile dt, #operator-proof-mobile dd, #operator-proof-mobile a, #operator-proof-mobile button")].filter((element) => !element.closest("[aria-hidden=true]"));
  return {
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    clipped: visibleText.filter((element) => {
      const style = getComputedStyle(element);
      const clipsOverflow = /hidden|clip/.test(`${style.overflowX} ${style.overflowY}`);
      return clipsOverflow && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1);
    }).map((element) => element.textContent?.trim()),
  };
});
await zoomPage.screenshot({ path: "artifacts/operator-proof-stack/qa-text-200.png", fullPage: true });
await zoomPage.close();

const slowImagePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await slowImagePage.route("**/_next/image?**", async (route) => {
  if (route.request().url().includes("buddas-hero-rolls-cover")) await new Promise((resolve) => setTimeout(resolve, 800));
  await route.continue();
});
await slowImagePage.goto(url, { waitUntil: "domcontentloaded" });
await slowImagePage.waitForTimeout(300);
const productImage = slowImagePage.locator("#operator-proof-panel-product figure");
const beforeImage = await productImage.boundingBox();
await slowImagePage.waitForTimeout(1000);
const afterImage = await productImage.boundingBox();
await slowImagePage.close();

const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktopPage.goto(url, { waitUntil: "domcontentloaded" });
await desktopPage.waitForTimeout(300);
const desktop = await desktopPage.evaluate(() => ({
  desktopVisible: Boolean(document.querySelector("#operator-proof-desktop")?.getBoundingClientRect().height),
  mobileVisible: Boolean(document.querySelector("#operator-proof-mobile")?.getBoundingClientRect().height),
  headings: document.querySelectorAll("#operator-proof-desktop h3").length,
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
}));
await desktopPage.close();

const report = {
  viewportResults,
  reducedMotion,
  textZoom,
  slowImageStable: Boolean(beforeImage && afterImage && beforeImage.width === afterImage.width && beforeImage.height === afterImage.height),
  desktop,
};
await fs.writeFile("artifacts/operator-proof-stack/responsive-qa.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
