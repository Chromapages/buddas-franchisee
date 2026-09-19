import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const wrapper = fs.readFileSync(path.resolve("src/components/public/franchise-final-cta.tsx"), "utf8");
const mobile = fs.readFileSync(path.resolve("src/components/public/franchise-final-cta-mobile.tsx"), "utf8");
const desktop = fs.readFileSync(path.resolve("src/components/public/franchise-final-cta-desktop.tsx"), "utf8");
const shared = fs.readFileSync(path.resolve("src/components/public/franchise-final-cta-shared.tsx"), "utf8");
const content = fs.readFileSync(path.resolve("src/features/franchise/final-cta-content.ts"), "utf8");
const financialData = fs.readFileSync(path.resolve("src/features/financials/financial-data.ts"), "utf8");
const financialTypes = fs.readFileSync(path.resolve("src/features/financials/types.ts"), "utf8");
const component = wrapper + mobile + desktop + shared + content;

test("global franchise CTA resolves the page with one governed inquiry action", () => {
  assert.match(shared, /bg-bds-cream/);
  assert.match(shared, /text-bds-teal-dark/);
  assert.doesNotMatch(shared, /btn-secondary/);
  assert.match(shared, /before:bg-bds-gold/);
  assert.match(content, /Request Franchise Information/);
  assert.match(content, /See the franchise evaluation process/);
  assert.doesNotMatch(content, /See the franchise evaluation process →/);
  assert.match(mobile, /aria-hidden="true" className="ml-2">→/);
  assert.doesNotMatch(mobile, /after:content/);
  assert.match(content, /href: "\/franchise\/process"/);
  assert.match(content, /Ready to see if we’re a fit\?/);
  assert.match(content, /titleAlternative: "Let’s Build Something Together\."/);
  assert.match(content, /qualificationBenchmark/);
  assert.match(component, /Preliminary candidate benchmark/);
  assert.match(mobile, /text-sm leading-6 text-bds-cream\/75/);
  assert.match(desktop, /text-sm leading-6 text-bds-cream\/75/);
  assert.match(component, /aria-labelledby="franchise-final-cta-mobile-title"/);
  assert.match(component, /aria-labelledby="franchise-final-cta-desktop-title"/);
  assert.match(component, /text-bds-cream/);
  assert.match(shared, /font-heading/);
  assert.match(shared, /font-body/);
  assert.match(mobile, /!px-5/);
  assert.match(mobile, /pt-9 pb-8/);
  assert.match(mobile, /w-full max-w-\[21ch\] \[text-wrap:balance\]/);
  assert.match(mobile, /!text-base leading-6/);
  assert.match(mobile, /max-w-\[34ch\]/);
  assert.match(shared, /min-h-\[52px\].*rounded-xl/);
  assert.match(shared, /active:bg-white/);
  assert.doesNotMatch(component, /PUBLISHED_FINANCIAL_THRESHOLDS|UNAPPROVED_FINANCIAL_THRESHOLDS/);
  assert.doesNotMatch(component, /\$150K|\$400K|Takes 2 minutes|In-House Corporate Review|confidential/i);
  assert.doesNotMatch(component, /aria-expanded|aria-controls|WorkflowReassuranceCarousel/);
  assert.doesNotMatch(component, /Inquiry".*Review".*Diligence".*Onboarding/);
  assert.match(wrapper, /<FranchiseFinalCtaMobile/);
  assert.match(wrapper, /<FranchiseFinalCtaDesktop/);
  assert.match(mobile, /md:hidden/);
  assert.match(desktop, /hidden text-white md:block/);
  assert.match(content, /OPPORTUNITY_DOSSIER_CONTENT\.finalDecision\.boundary\.text/);
});

test("financial benchmarks fail closed when this placement is not approved", () => {
  assert.match(financialData, /approvedPlacements: \[\]/);
  assert.doesNotMatch(financialTypes, /"final-cta"/);
  assert.doesNotMatch(wrapper, /financial-data/);
  assert.doesNotMatch(component, /\$150K|\$400K/);
});

test("closing CTA stays a lightweight text-first component", () => {
  assert.doesNotMatch(component, /next\/image|<Image|<img|<video|canvas|Swiper|Carousel|framer-motion/i);
  assert.doesNotMatch(wrapper, /useState|requestAnimationFrame|ResizeObserver/);
  assert.match(shared, /motion-reduce:transition-none/);
  assert.match(wrapper, /trackFunnelEvent/);
});
