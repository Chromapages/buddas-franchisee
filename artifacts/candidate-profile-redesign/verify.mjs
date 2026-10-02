import { chromium } from "file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const results = [];

for (const [width, height] of [[320, 568], [324, 892], [360, 800], [375, 812], [390, 844], [393, 852], [430, 932], [1440, 1000]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const section = page.locator(".candidate-profile-section:visible");
  await section.screenshot({ path: `artifacts/candidate-profile-redesign/${width}.png` });
  const result = await section.evaluate((element) => {
    const mobileRows = [...element.querySelectorAll(".candidate-standard-ledger > li")].filter((row) => row.getBoundingClientRect().height > 0);
    const cta = element.querySelector(".candidate-action-link");
    const ctaBox = cta?.getBoundingClientRect();
    const visibleText = element.innerText;
    return {
      viewport: innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      heading: element.querySelector("h2")?.textContent?.trim(),
      framework: visibleText.toLocaleLowerCase().includes("capability × capital × stewardship"),
      labels: ["operating experience", "financial readiness", "owner stewardship"].filter((label) => visibleText.toLocaleLowerCase().includes(label)),
      mobileRows: mobileRows.length,
      gutter: (() => {
        const ledger = element.querySelector(".candidate-standard-ledger");
        const box = ledger?.getBoundingClientRect();
        return box ? { left: box.left, right: innerWidth - box.right } : null;
      })(),
      headlineLines: (() => {
        const heading = element.querySelector("h2");
        if (!heading) return null;
        const style = getComputedStyle(heading);
        return Math.round(heading.getBoundingClientRect().height / Number.parseFloat(style.lineHeight));
      })(),
      criterionLines: mobileRows.map((row) => {
        const heading = row.querySelector("h3");
        if (!heading) return null;
        const style = getComputedStyle(heading);
        return Math.round(heading.getBoundingClientRect().height / Number.parseFloat(style.lineHeight));
      }),
      rowBodySizes: mobileRows.map((row) => getComputedStyle(row.querySelector("[data-candidate-supporting-expectation]") ?? row.querySelector("h3") ?? row).fontSize),
      unapprovedValuesVisible: /\$150K|\$400K/.test(visibleText),
      cta: ctaBox ? { width: ctaBox.width, height: ctaBox.height, text: cta?.textContent?.trim(), href: cta?.getAttribute("href") } : null,
      financeLink: (() => {
        const link = element.querySelector(".candidate-standard-ledger a");
        const box = link?.getBoundingClientRect();
        return box ? { width: box.width, height: box.height } : null;
      })(),
      image: (() => {
        const image = element.querySelector("img[alt*='baker arranging']");
        const box = image?.getBoundingClientRect();
        return box ? { width: box.width, height: box.height, objectPosition: getComputedStyle(image).objectPosition } : null;
      })(),
    };
  });
  results.push({ ...result, errors });
  await page.close();
}

const zoomPage = await browser.newPage({ viewport: { width: 320, height: 900 } });
await zoomPage.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
await zoomPage.waitForTimeout(400);
await zoomPage.evaluate(() => {
  for (const element of document.querySelectorAll(".candidate-profile-mobile h2, .candidate-profile-mobile h3, .candidate-profile-mobile p, .candidate-profile-mobile dt, .candidate-profile-mobile dd, .candidate-profile-mobile a")) {
    element.style.fontSize = `${Number.parseFloat(getComputedStyle(element).fontSize) * 2}px`;
  }
});
const zoom = await zoomPage.evaluate(() => ({ horizontalOverflow: document.documentElement.scrollWidth > innerWidth }));
await zoomPage.locator(".candidate-profile-mobile:visible").screenshot({ path: "artifacts/candidate-profile-redesign/320-text-200.png" });
await zoomPage.close();

const longCopyPage = await browser.newPage({ viewport: { width: 320, height: 568 } });
await longCopyPage.goto("http://localhost:3000/franchise", { waitUntil: "domcontentloaded" });
await longCopyPage.waitForTimeout(400);
const longCopy = await longCopyPage.locator(".candidate-profile-mobile:visible").evaluate((element) => {
  const financial = element.querySelectorAll(".candidate-standard-ledger > li")[1];
  financial?.querySelector("h3")?.replaceChildren("Have the resources to satisfy published financial qualification and development commitment requirements.");
  financial?.querySelector("[data-candidate-supporting-expectation]")?.replaceChildren("Published liquid capital, net worth, and development commitment details are reviewed through the full qualification information.");
  const link = financial?.querySelector("a");
  if (link) link.textContent = "See full financial qualification and development commitment details →";
  const texts = [...element.querySelectorAll("h2, h3, p, a")];
  return {
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    clipped: texts.filter((node) => {
      const style = getComputedStyle(node);
      return /hidden|clip/.test(`${style.overflowX} ${style.overflowY}`) && (node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1);
    }).map((node) => node.textContent?.trim()),
  };
});
await longCopyPage.screenshot({ path: "artifacts/candidate-profile-redesign/320-long-copy.png", fullPage: true });
await longCopyPage.close();

await fs.writeFile("artifacts/candidate-profile-redesign/results.json", JSON.stringify({ results, zoom, longCopy }, null, 2));
console.log(JSON.stringify({ results, zoom, longCopy }, null, 2));
await browser.close();
