import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const readSource = (file) => fs.readFileSync(path.resolve(file), "utf8");

const homepage = readSource("src/app/franchise/page.tsx");
const navbar = readSource("src/components/public/navbar.tsx");
const opportunityLink = readSource("src/components/public/hero-opportunity-link.tsx");

test("the mobile homepage hero keeps education primary and inquiry secondary", () => {
  assert.match(homepage, /<HeroOpportunityLink[\s\S]*?href="\/franchise\/the-opportunity"[\s\S]*?Review the Franchise Opportunity/);
  assert.match(homepage, /<HeroInquiryLink[\s\S]*?href="\/franchise\/contact\?source_page=homepage_hero"[\s\S]*?Start a Franchise Inquiry/);
  assert.match(homepage, /3-step initial inquiry/);
  assert.match(homepage, /HeroInquiryLink[\s\S]*?min-h-\[48px\] w-full[\s\S]*?border-bds-teal-dark\/30/);
  assert.match(opportunityLink, /hero_opportunity_cta_click/);
  assert.doesNotMatch(homepage, /Review the opportunity overview/);
});

test("the shared header keeps request info visually secondary", () => {
  const requestInfoLinks = navbar.match(/className="[^"]*btn-outline[^"]*"[\s\S]{0,350}?Request Franchise Info/g) || [];

  assert.equal(requestInfoLinks.length, 2, "Desktop and mobile header Request Info links use the outlined treatment");
  assert.doesNotMatch(
    navbar,
    /className="[^"]*btn-primary[^"]*"[\s\S]{0,350}?Request Franchise Info/,
    "No header Request Info link uses the filled primary treatment",
  );
});
