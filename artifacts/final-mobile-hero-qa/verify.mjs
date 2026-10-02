import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const baseUrl = "http://localhost:3000/franchise";
const screenshots = [
  [320, 568],
  [360, 800],
  [390, 844],
  [393, 852],
  [430, 932],
  [768, 900],
  [1440, 900],
  [844, 390],
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const [width, height] of screenshots) {
  const page = await browser.newPage({ viewport: { width, height } });
  const consoleMessages = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleMessages.push({ type: message.type(), text: message.text() });
  });
  page.on("pageerror", (error) => consoleMessages.push({ type: "pageerror", text: error.message }));
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `artifacts/final-mobile-hero-qa/current-${width}x${height}.png` });
  results.push(await page.evaluate(() => {
    const contrast = (foreground, background) => {
      const parse = (value) => (value.match(/\d+(?:\.\d+)?/g) || []).slice(0, 3).map(Number);
      const luminance = (rgb) => rgb
        .map((channel) => channel / 255)
        .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
        .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
      const [a, b] = [luminance(parse(foreground)), luminance(parse(background))].sort((left, right) => right - left);
      return (a + 0.05) / (b + 0.05);
    };
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) return null;
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height, top: box.top, left: box.left };
    };
    const heading = document.querySelector(".homepage-mobile-hero-title");
    const primary = document.querySelector(".homepage-mobile-hero a[href='/franchise/the-opportunity']");
    const secondary = document.querySelector(".homepage-mobile-hero a[href*='/franchise/contact']");
    const media = document.querySelector(".homepage-hero-shared-media img");
    const headingStyle = heading instanceof HTMLElement ? getComputedStyle(heading) : null;
    const primaryStyle = primary instanceof HTMLElement ? getComputedStyle(primary) : null;
    const secondaryStyle = secondary instanceof HTMLElement ? getComputedStyle(secondary) : null;
    const cream = "rgb(255, 248, 232)";
    return {
      viewport: { width: innerWidth, height: innerHeight },
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      h1Count: document.querySelectorAll("h1").length,
      heading: headingStyle ? { ...rect(".homepage-mobile-hero-title"), fontSize: headingStyle.fontSize, color: headingStyle.color } : null,
      primary: primaryStyle ? { ...rect(".homepage-mobile-hero a[href='/franchise/the-opportunity']"), color: primaryStyle.color, background: primaryStyle.backgroundColor, contrast: contrast(primaryStyle.color, primaryStyle.backgroundColor) } : null,
      secondary: secondaryStyle ? { ...rect(".homepage-mobile-hero a[href*='/franchise/contact']"), color: secondaryStyle.color, contrast: contrast(secondaryStyle.color, cream) } : null,
      media: media instanceof HTMLElement ? { ...rect(".homepage-hero-shared-media"), objectPosition: getComputedStyle(media).objectPosition, loading: media.getAttribute("loading"), fetchPriority: media.getAttribute("fetchpriority"), sizes: media.getAttribute("sizes") } : null,
      animations: [...document.querySelector(".homepage-hero-shell").querySelectorAll("*")].flatMap((element) => element.getAnimations().map((animation) => animation.animationName)),
    };
  }));
  results.at(-1).consoleMessages = consoleMessages;
  await page.close();
}

const keyboardPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await keyboardPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
const keyboard = [];
for (let index = 0; index < 6; index += 1) {
  await keyboardPage.keyboard.press("Tab");
  keyboard.push(await keyboardPage.evaluate(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return null;
    const box = active.getBoundingClientRect();
    return { text: active.textContent?.trim(), href: active.getAttribute("href"), focusVisible: active.matches(":focus-visible"), top: box.top, bottom: box.bottom };
  }));
}
await keyboardPage.screenshot({ path: "artifacts/final-mobile-hero-qa/current-keyboard-focus.png" });
const screenReaderOrder = await keyboardPage.locator("main").ariaSnapshot();

const zoomPage = await browser.newPage({ viewport: { width: 320, height: 568 } });
await zoomPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
await zoomPage.evaluate(() => {
  const elements = [...document.querySelectorAll(".homepage-hero-shell h1, .homepage-hero-shell p, .homepage-hero-shell dt, .homepage-hero-shell dd, .homepage-hero-shell a")];
  const sizes = elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  elements.forEach((element, index) => { element.style.fontSize = `${sizes[index] * 2}px`; });
});
await zoomPage.screenshot({ path: "artifacts/final-mobile-hero-qa/current-320x568-text-200.png" });
const textZoomOverflow = await zoomPage.evaluate(() => document.documentElement.scrollWidth > innerWidth);

const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await reducedPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
const reducedMotion = await reducedPage.evaluate(() => {
  const hero = document.querySelector(".homepage-hero-shell");
  const sticky = document.querySelector(".mobile-sticky-franchise-cta");
  return {
    runningHeroAnimations: hero ? [...hero.querySelectorAll("*")].flatMap((element) => element.getAnimations().map((animation) => animation.animationName)) : [],
    stickyTransition: sticky instanceof HTMLElement ? getComputedStyle(sticky).transitionProperty : null,
  };
});

const navigationPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await navigationPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
await navigationPage.getByRole("link", { name: "Explore the Opportunity", exact: true }).click();
await navigationPage.waitForTimeout(500);
const opportunityUrl = navigationPage.url();
await navigationPage.goBack({ waitUntil: "domcontentloaded" });
const backUrl = navigationPage.url();

await fs.writeFile("artifacts/final-mobile-hero-qa/results.json", JSON.stringify({ results, keyboard, screenReaderOrder, textZoomOverflow, reducedMotion, opportunityUrl, backUrl }, null, 2));
console.log(JSON.stringify({ results, keyboard, textZoomOverflow, reducedMotion, opportunityUrl, backUrl }, null, 2));

await browser.close();
