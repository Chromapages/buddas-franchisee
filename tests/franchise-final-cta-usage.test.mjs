import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

for (const route of [
  "src/app/franchise/page.tsx",
  "src/app/franchise/why-buddas/page.tsx",
]) {
  test(`${route} renders the shared franchise final CTA`, () => {
    const source = fs.readFileSync(path.resolve(route), "utf8");
    assert.match(source, /import \{ FranchiseFinalCta \}/);
    assert.match(source, /<FranchiseFinalCta \/>/);
  });
}

test("FAQ and Opportunity use their page-specific resolution actions", () => {
  const faq = fs.readFileSync(path.resolve("src/app/franchise/faq/page.tsx"), "utf8");
  const opportunity = fs.readFileSync(path.resolve("src/app/franchise/the-opportunity/page.tsx"), "utf8");
  assert.doesNotMatch(faq, /FranchiseFinalCta/);
  assert.match(opportunity, /OpportunityAnalyticsLink href="\/franchise\/contact"/);
  assert.match(opportunity, /Request Franchise Information/);
});

test("Process uses its stage-specific Initial Inquiry closing action", () => {
  const process = fs.readFileSync(path.resolve("src/app/franchise/process/page.tsx"), "utf8");
  assert.doesNotMatch(process, /FranchiseFinalCta/);
  assert.match(process, /<ProcessClosingCta content=\{processContent\.closing\} \/>/);
});
