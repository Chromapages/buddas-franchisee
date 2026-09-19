import { chromium } from 'file:///C:/Users/ericb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const out = 'artifacts/mobile-hero-a11y';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];
for (const [width, height] of [[320,568],[360,800],[390,844],[393,852],[430,932],[667,375]]) {
  await page.setViewportSize({width,height});
  await page.goto('http://localhost:3000/franchise');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.homepage-mobile-hero img').evaluate(img => img.decode());
  const measurements = await page.evaluate(() => {
    const hero = document.querySelector('.homepage-mobile-hero');
    const elements = [...hero.querySelectorAll('h1,p,dd,a')];
    return { overflow: document.documentElement.scrollWidth > innerWidth, heroOverflow: hero.scrollWidth > hero.clientWidth, elements: elements.map(el => { const s=getComputedStyle(el),r=el.getBoundingClientRect(); return {text:el.textContent.trim(),tag:el.tagName,width:r.width,height:r.height,color:s.color,background:s.backgroundColor,font:s.fontFamily,size:s.fontSize}; }) };
  });
  await page.screenshot({path:`${out}/${width}x${height}.png`,fullPage:false});
  results.push({width,height,...measurements});
}
await page.setViewportSize({width:320,height:568});
await page.goto('http://localhost:3000/franchise');
// Apply 200% to each original computed size, avoiding inherited compounding.
await page.reload();
await page.evaluate(() => { const els=[...document.querySelectorAll('.homepage-mobile-hero *')]; const sizes=els.map(el=>parseFloat(getComputedStyle(el).fontSize)); els.forEach((el,i)=>el.style.fontSize=`${sizes[i]*2}px`); });
results.push({condition:'200% text enlargement',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
await page.locator('.homepage-mobile-hero').screenshot({path:`${out}/text-200.png`});
await page.reload();
await page.addStyleTag({content:'.homepage-mobile-hero * { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } .homepage-mobile-hero p {margin-bottom:2em !important;}'});
results.push({condition:'text spacing',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
await page.locator('.homepage-mobile-hero').screenshot({path:`${out}/text-spacing.png`});
await page.reload();
await page.emulateMedia({reducedMotion:'reduce'});
const keyboard=[];
for(let i=0;i<6;i++) {await page.keyboard.press('Tab');keyboard.push(await page.evaluate(()=>{const el=document.activeElement,r=el.getBoundingClientRect(),s=getComputedStyle(el);return {text:el.textContent.trim(),top:r.top,bottom:r.bottom,focusVisible:el.matches(':focus-visible'),shadow:s.boxShadow,scrollMargin:s.scrollMarginTop,transition:s.transitionDuration};}));}
results.push({condition:'keyboard and reduced motion',keyboard});
await page.screenshot({path:`${out}/keyboard.png`});
for (const index of [0,1]) {
  await page.goto('http://localhost:3000/franchise');
  const link=page.locator('.homepage-mobile-hero-actions a').nth(index);
  await link.focus();
  const focus=await link.evaluate(el=>({outline:getComputedStyle(el).outline,color:getComputedStyle(el).outlineColor}));
  await page.screenshot({path:`${out}/focus-${index}.png`});
  await link.hover();
  const hover=await link.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
  await page.mouse.down();
  const press=await link.evaluate(el=>({active:el.matches(':active'),color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
  await page.mouse.move(0,0);await page.mouse.up();
  await link.focus();await page.keyboard.press('Enter');
  await page.waitForURL(index===0?'**/franchise/the-opportunity':'**/franchise/contact?source_page=homepage_hero');
  results.push({condition:'CTA activation',index,focus,hover,press,destination:page.url()});
}
await page.goto('http://localhost:3000/franchise');
await fs.writeFile(`${out}/reading-order.yml`,await page.locator('main').ariaSnapshot());
await fs.writeFile(`${out}/results.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
await browser.close();
