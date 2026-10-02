import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const viewports = [[320, 568], [360, 800], [390, 844], [393, 852], [430, 932]];
const contrast = (foreground, background) => {
  const values = (color) => color.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
  const luminance = (rgb) => rgb.map((value) => value / 255).map((value) => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  const [light, dark] = [luminance(values(foreground)), luminance(values(background))].sort((a, b) => b - a);
  return (light + .05) / (dark + .05);
};

const reports = [];
for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const section = page.locator(".candidate-profile-mobile:visible");
  const financeLink = section.getByRole("link", { name: /See financial qualifications/i });
  await financeLink.focus();
  const report = await section.evaluate((element) => {
    const rootBackground = getComputedStyle(element).backgroundColor;
    const controls = [...element.querySelectorAll("a, button")].map((control) => {
      const box = control.getBoundingClientRect();
      const style = getComputedStyle(control);
      return { name: control.textContent?.trim(), tag: control.tagName, width: box.width, height: box.height, outline: style.outlineStyle, outlineWidth: style.outlineWidth };
    });
    const criteria = [...element.querySelectorAll(".candidate-standard-ledger > li")];
    const image = element.querySelector("img[alt]");
    return {
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      h2Count: element.querySelectorAll("h2").length,
      h3Count: element.querySelectorAll("h3").length,
      criteriaCount: criteria.length,
      listCount: element.querySelectorAll("ol, ul").length,
      controls,
      imageAlt: image?.getAttribute("alt"),
      rootBackground,
      text: [...element.querySelectorAll("h2, h3, p, dt, dd, a")].map((node) => ({ text: node.textContent?.trim(), color: getComputedStyle(node).color, size: getComputedStyle(node).fontSize })),
    };
  });
  const focus = await financeLink.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const header = document.querySelector("header[role=banner]")?.getBoundingClientRect();
    return { active: document.activeElement === element, top: box.top, bottom: box.bottom, headerBottom: header?.bottom ?? 0, outline: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  const readingOrder = await section.ariaSnapshot();
  reports.push({ viewport: `${width}x${height}`, ...report, focus, readingOrder });
  await page.close();
}

const zoomPage = await browser.newPage({ viewport: { width: 320, height: 568 } });
await zoomPage.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
await zoomPage.waitForTimeout(400);
await zoomPage.evaluate(() => {
  for (const node of document.querySelectorAll(".candidate-profile-mobile h2, .candidate-profile-mobile h3, .candidate-profile-mobile p, .candidate-profile-mobile dt, .candidate-profile-mobile dd, .candidate-profile-mobile a")) node.style.fontSize = `${Number.parseFloat(getComputedStyle(node).fontSize) * 2}px`;
});
const zoom = await zoomPage.evaluate(() => ({ horizontalOverflow: document.documentElement.scrollWidth > innerWidth }));
await zoomPage.close();

const motionPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await motionPage.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
await motionPage.waitForTimeout(400);
const motion = await motionPage.locator(".candidate-profile-mobile:visible .candidate-action-link").evaluate((element) => ({ duration: getComputedStyle(element).transitionDuration, property: getComputedStyle(element).transitionProperty }));
await motionPage.close();

await fs.writeFile("artifacts/candidate-profile-redesign/a11y-qa.json", JSON.stringify({ reports, zoom, motion }, null, 2));
console.log(JSON.stringify({ reports, zoom, motion }, null, 2));
await browser.close();
