import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const readSource = (file) => fs.readFileSync(path.resolve(file), "utf8");

const homepage = readSource("src/app/franchise/page.tsx");
const homeAnalytics = readSource("src/components/public/franchise-home-analytics.tsx");
const mobileHero = readSource("src/components/public/homepage-hero-mobile.tsx");
const heroContent = readSource("src/features/franchise/home-hero-content.ts");
const opportunityAnalytics = readSource("src/components/public/opportunity-index-enhancer.tsx");
const opportunity = readSource("src/app/franchise/the-opportunity/page.tsx");
const finalCta = readSource("src/components/public/franchise-final-cta.tsx");
const finalCtaContent = readSource("src/features/franchise/final-cta-content.ts");
const inquiryPublicContent = readSource("src/features/inquiry/public-inquiry-content.ts");
const inquirySubmit = readSource("src/features/inquiry/submit.ts");
const inquiryEmail = readSource("src/features/inquiry/email-service.ts");
const processContent = readSource("src/features/franchise/process-content.ts");
const form = readSource("src/components/public/inquiry-form.tsx");
const analytics = readSource("src/lib/analytics.ts");

test("homepage keeps opportunity primary and inquiry direct for high-intent visitors", () => {
  assert.match(mobileHero, /<HeroInquiryLink[\s\S]*?href=\{content\.inquiry\.href\}/);
  assert.match(heroContent, /Explore the Opportunity/);
  assert.match(opportunity, /<OpportunityAnalyticsLink href="\/franchise\/contact"/);
  assert.match(opportunity, /Request Franchise Information/);
  assert.match(finalCta, /FRANCHISE_FINAL_CTA_CONTENT\.primaryAction\.href/);
  assert.match(finalCtaContent, /Request Franchise Information/);
});

test("funnel analytics emits only non-identifying milestone metadata", () => {
  for (const event of [
    "franchise_home_viewed",
    "franchise_hero_primary_clicked",
    "franchise_hero_inquiry_clicked",
    "franchise_opportunity_viewed",
    "franchise_inquiry_started",
    "franchise_inquiry_step_completed",
    "franchise_inquiry_completed",
    "franchise_cta_viewed",
    "franchise_mutual_evaluation_started",
    "franchise_process_opened",
    "franchise_evaluation_form_completed",
    "franchise_evaluation_form_abandoned",
    "franchise_evaluation_error",
  ]) assert.match(analytics, new RegExp(`"${event}"`));
  assert.match(homepage, /<FranchiseHomeAnalytics \/>/);
  assert.match(homeAnalytics, /trackFranchiseFunnelEvent\("franchise_home_viewed"/);
  assert.match(opportunityAnalytics, /trackFranchiseFunnelEvent\("franchise_opportunity_viewed"/);
  assert.match(form, /trackFranchiseFunnelEvent\("franchise_inquiry_started"/);
  assert.match(form, /trackFranchiseFunnelEvent\("franchise_inquiry_step_completed"/);
  assert.match(form, /trackFranchiseFunnelEvent\("franchise_inquiry_completed"/);
  assert.match(analytics, /safeAttributionToken/);
  assert.match(analytics, /viewport_group/);
  assert.match(analytics, /entry_page/);
  assert.match(analytics, /referrer_category/);
  assert.doesNotMatch(analytics, /franchise_inquiry_started[\s\S]{0,500}(email|phone|net[_-]?worth|liquidity)/i);
  assert.doesNotMatch(analytics, /franchise_evaluation_(?:form_completed|form_abandoned|error)[\s\S]{0,500}(email|phone|net[_-]?worth|liquidity|message|experience)/i);
  assert.match(analytics, /const payload = \{ event, \.\.\.properties \}/);
});

test("CTA and inquiry confirmations share one expectation source", () => {
  assert.match(finalCtaContent, /PUBLIC_INITIAL_INQUIRY_CONTENT\.ctaExpectation\.value/);
  assert.match(inquiryPublicContent, /completionEstimate: governedInquiryFact\("3–5 minutes"\)/);
  assert.match(inquiryPublicContent, /responseTarget: governedInquiryFact\("within 2 business days"\)/);
  assert.match(inquiryPublicContent, /owner: "Franchise Development Leadership"/);
  assert.match(inquiryPublicContent, /lastReviewedAt: null/);
  assert.match(inquiryPublicContent, /effectiveDate: null/);
  assert.match(inquirySubmit, /PUBLIC_INITIAL_INQUIRY_CONTENT\.responseTarget\.value/);
  assert.match(inquiryEmail, /PUBLIC_INITIAL_INQUIRY_CONTENT\.responseTarget\.value/);
  assert.match(processContent, /PUBLIC_INITIAL_INQUIRY_CONTENT\.responseTarget\.value/);
  assert.doesNotMatch(inquiryEmail, /2–3 business days/);
});

test("CTA and form lifecycle events are tracked without applicant values", () => {
  assert.match(finalCta, /trackFranchiseFunnelEvent\("franchise_cta_viewed"/);
  assert.match(finalCta, /trackFranchiseFunnelEvent\("franchise_mutual_evaluation_started"/);
  assert.match(finalCta, /trackFranchiseFunnelEvent\("franchise_process_opened"/);
  assert.match(form, /trackFranchiseFunnelEvent\("franchise_evaluation_form_completed"/);
  assert.match(form, /trackFranchiseFunnelEvent\("franchise_evaluation_form_abandoned"/);
  assert.match(form, /trackFranchiseFunnelEvent\("franchise_evaluation_error"/);
  assert.match(form, /pagehide/);
  assert.match(finalCta, /cta_variant: "mutual_fit_gate"/);
});
