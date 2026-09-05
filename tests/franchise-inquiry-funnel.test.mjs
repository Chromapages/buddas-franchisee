import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const readSource = (file) => fs.readFileSync(path.resolve(file), "utf8");

const homepage = readSource("src/app/franchise/page.tsx");
const opportunity = readSource("src/app/franchise/the-opportunity/page.tsx");
const finalCta = readSource("src/components/public/franchise-final-cta.tsx");
const form = readSource("src/components/public/inquiry-form.tsx");
const analytics = readSource("src/lib/analytics.ts");

test("homepage keeps opportunity review primary and inquiry direct for high-intent visitors", () => {
  assert.match(homepage, /<HeroInquiryLink[\s\S]*?href="\/franchise\/contact\?source_page=homepage_hero"/);
  assert.match(homepage, /Review the Franchise Opportunity/);
  assert.match(opportunity, /<OpportunityAnalyticsLink href="\/franchise\/contact"/);
  assert.match(opportunity, /Request Franchise Information/);
  assert.match(finalCta, /contactHref = "\/franchise\/contact"/);
  assert.match(finalCta, /Request a Mutual Evaluation/);
});

test("funnel analytics emits only non-identifying milestone metadata", () => {
  assert.match(analytics, /"hero_inquiry_link_click"/);
  assert.match(analytics, /"hero_opportunity_cta_click"/);
  assert.match(analytics, /"franchise_inquiry_form_submitted"/);
  assert.match(form, /trackFunnelEvent\("franchise_inquiry_form_submitted"/);
  assert.match(analytics, /const payload = \{ event, \.\.\.properties \}/);
});
