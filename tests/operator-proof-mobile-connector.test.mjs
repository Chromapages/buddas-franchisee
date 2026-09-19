import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const component = read("src/components/public/operator-proof-mobile.tsx");
const desktop = read("src/components/public/operator-proof-desktop.tsx");
const mobileStack = read("src/components/public/operator-proof-mobile-stack.tsx");
const content = read("src/features/franchise/operator-proof-content.ts");
const cta = read("src/components/public/operator-proof-opportunity-cta.tsx");
const tracker = read("src/components/public/operator-proof-view-tracker.tsx");
const analytics = read("src/lib/analytics.ts");
const styles = read("src/app/globals.css");

test("mobile operator proof keeps the business case visible while Product begins expanded", () => {
  assert.match(component, /<OperatorProofMobileStack pillars=\{pillars\}/);
  assert.match(component, /operator-proof-mobile/);
  assert.match(desktop, /operator-proof-desktop/);
  assert.doesNotMatch(component, /OperatorProofDesktop/);
  assert.doesNotMatch(desktop, /OperatorProofMobileStack/);
  assert.match(mobileStack, /"use client"/);
  assert.match(mobileStack, /useState<OperatorProofPillar\["id"\] \| null>\("product"\)/);
  assert.match(mobileStack, /memo\(/);
  assert.match(mobileStack, /useCallback/);
  assert.match(mobileStack, /aria-expanded=\{isOpen\}/);
  assert.match(mobileStack, /aria-controls=\{panelId\}/);
  assert.match(mobileStack, /role="region"[\s\S]*?aria-labelledby=\{triggerId\}/);
  assert.match(mobileStack, /operator-proof-mobile-stack border-y/);
  assert.match(mobileStack, /grid-cols-\[2\.5rem_minmax\(0,1fr\)\]/);
  assert.match(mobileStack, /\{pillar\.index\}/);
  assert.match(mobileStack, /\{pillar\.category\}/);
  assert.match(mobileStack, /\{pillar\.headline\}/);
  assert.match(mobileStack, /\{pillar\.body\}/);
  assert.match(mobileStack, /pillar\.evidenceItems\.map/);
  assert.match(mobileStack, /pillar\.media/);
  assert.match(mobileStack, /loading="lazy"/);
  assert.match(mobileStack, /objectPosition: pillar\.media\.objectPosition/);
  assert.match(mobileStack, /pillar\.href && pillar\.linkLabel/);
  assert.doesNotMatch(mobileStack, /rounded-2xl|shadow|carousel|autoplay|setInterval|requestAnimationFrame/);
  assert.doesNotMatch(styles, /operator-proof-mobile-disclosure|operator-proof-disclosure-enter/);
  assert.match(styles, /\.operator-proof-stack-layout \{\s*margin-top: var\(--space-7\);/);
});

test("operator proof content has stable IDs and honest review metadata", () => {
  for (const id of ["product", "production", "operator", "hospitality", "growth"]) assert.match(content, new RegExp(`id: "${id}"`));
  assert.match(content, /reviewStatus: "REQUIRES_OWNER_REVIEW"/);
  assert.match(content, /evidenceStatus: "REQUIRES_SOURCE_VALIDATION"/);
  assert.match(content, /reviewStatus: "REQUIRES_BRAND_REVIEW"/);
  assert.match(content, /\/images\/franchise-hero-signature-roll\.png/);
  assert.match(content, /sourceReference: null/);
  assert.match(content, /reviewedAt: null/);
  assert.doesNotMatch(content, /proven opportunity|product demand|takes under 2 minutes/i);
});

test("section conclusion uses the real opportunity route and existing analytics stack", () => {
  assert.match(content, /href: "\/franchise\/the-opportunity"/);
  assert.match(content, /label: "Explore the Opportunity"/);
  assert.match(content, /microcopy: "Review the full franchise opportunity\."/);
  assert.match(cta, /trackFunnelEvent\("franchise_advantage_primary_cta_clicked"/);
  assert.match(cta, /min-h-\[52px\] w-full/);
});

test("advantage analytics is limited to meaningful exposure, expansion, link, and CTA events", () => {
  for (const event of ["franchise_advantage_viewed", "franchise_advantage_item_opened", "franchise_advantage_deep_link_clicked", "franchise_advantage_primary_cta_clicked"]) assert.match(analytics, new RegExp(`"${event}"`));
  assert.match(tracker, /IntersectionObserver/);
  assert.match(tracker, /threshold: 0\.35/);
  assert.match(mobileStack, /item: id/);
  assert.match(mobileStack, /index: pillarIndex\[id\]/);
  assert.doesNotMatch(mobileStack + tracker + cta, /email|phone|liquid|net.?worth|financial/i);
});
