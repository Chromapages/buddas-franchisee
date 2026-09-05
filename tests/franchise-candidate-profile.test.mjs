import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const component = fs.readFileSync(path.resolve("src/components/public/candidate-profile-section.tsx"), "utf8");
const mobileGate = fs.readFileSync(path.resolve("src/components/public/candidate-profile-mobile-fit-gate.tsx"), "utf8");
const investmentLink = fs.readFileSync(path.resolve("src/components/public/candidate-profile-investment-link.tsx"), "utf8");
const actions = fs.readFileSync(path.resolve("src/components/public/candidate-profile-actions.tsx"), "utf8");
const criteria = fs.readFileSync(path.resolve("src/features/franchise/candidate-criteria.ts"), "utf8");
const financialDisclosure = fs.readFileSync(path.resolve("src/components/public/financial-disclosure.tsx"), "utf8");
const candidateActions = fs.readFileSync(path.resolve("src/components/public/candidate-profile-actions.tsx"), "utf8");
const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");
const styles = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");

test("candidate profile provides three qualification criteria with approved financial labels", () => {
  for (const value of ["CANDIDATE PROFILE", "OPERATE", "CAPITALIZE", "STEWARD"]) {
    assert.ok(component.includes(value));
  }
  for (const value of ["Restaurant leadership", "Financial requirement", "Owner responsibility"]) {
    assert.ok(criteria.includes(value));
  }
  assert.ok(component.includes("candidate-profile-layout"));
  assert.ok(component.includes("candidate-profile-section"));
  assert.ok(component.includes("candidate-profile-heading"));
  assert.ok(component.includes("Built for operators who can build with us."));
  assert.ok(component.includes("The gate reviews restaurant leadership, financial readiness, and owner responsibility."));
  assert.ok(component.includes("candidate-profile-content min-w-0"));
  assert.ok(component.includes("space-y-6 lg:space-y-10"));
  assert.ok(component.includes("mt-3 homepage-section-heading"));
  assert.ok(component.includes("homepage-section-eyebrow"));
  assert.ok(component.includes("homepage-section-description"));
  assert.ok(component.includes("candidate-action-suite flex flex-col justify-between gap-6"));
  assert.ok(component.includes("mt-4 divide-y divide-[#1C5F56]/15 border-y"));
  assert.ok(component.includes("CandidateProfileMobileFitGate"));
  assert.ok(component.includes("getCandidatePillars"));
  assert.ok(component.includes("candidatePillars.map"));
  assert.ok(!component.includes("$150K"));
  assert.ok(!component.includes("FDD Item 7"));
  assert.ok(mobileGate.includes("Operator standards"));
  assert.ok(mobileGate.includes("grid-cols-[2rem_minmax(0,1fr)]"));
  assert.ok(!mobileGate.includes("aria-expanded"));
  assert.ok(!mobileGate.includes("FDD Item 7"));
  assert.ok(criteria.includes("CANDIDATE_FINANCIAL_QUALIFICATION"));
  assert.ok(!criteria.includes("PUBLISHED_FINANCIAL_THRESHOLDS"));
  assert.ok(component.includes("getApprovedCandidateProfileFinancialQualification"));
  assert.ok(component.includes("hasApprovedFinancialQualification"));
  assert.ok(component.includes("Review financial qualification and disclosure status"));
  assert.ok(component.includes("financial.investmentDetailsHref"));
  assert.ok(mobileGate.includes("CandidateProfileInvestmentLink"));
  assert.ok(investmentLink.includes("candidate_profile_investment_click"));
  assert.ok(investmentLink.includes("candidate_destination: \"investment\""));
  assert.ok(component.includes("THE PARTNERSHIP WORKS BOTH WAYS."));
  assert.ok(component.includes("What you bring"));
  assert.ok(component.includes("What Budda&apos;s brings"));
  assert.ok(component.includes("Operate · Capitalize · Steward"));
  assert.ok(component.includes("Signature product · Bakery standards · Operating systems · Support"));
  assert.ok(component.includes("divide-y divide-[#1C5F56]/15 border-y"));
  assert.ok(component.includes("md:divide-x"));
  assert.match(styles, /\.candidate-profile-layout \{\s*grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(styles, /\.candidate-profile-section \{\s*padding-block: var\(--space-8\);/);
});

test("candidate profile keeps the current image, accessibility text, and actions", () => {
  assert.ok(component.includes("buddas-about-storefront.png"));
  assert.ok(component.includes('alt="A baker arranging freshly baked rolls at a sunlit bakery counter"'));
  assert.ok(component.includes('loading="lazy"'));
  assert.ok(component.includes('sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1024px) 45vw, 368px"'));
  assert.ok(component.includes("object-[100%_50%] md:object-[92%_50%] lg:object-[85%_50%]"));
  assert.ok(component.includes("<figure className="));
  assert.ok(component.includes("OPERATING DISCIPLINE"));
  assert.ok(component.includes("absolute left-4 top-4"));
  assert.ok(component.includes("MORE TABLES."));
  assert.ok(actions.includes("REVIEW QUALIFICATIONS"));
  assert.ok(actions.includes("dataStickyCtaHide"));
  assert.ok(actions.includes("No obligation — review the full candidate criteria."));
  assert.ok(actions.includes("qualificationActivation"));
  assert.ok(actions.includes("OPENING QUALIFICATIONS…"));
  assert.ok(actions.includes("destination: \"/franchise/the-opportunity#qualifications\""));
  assert.ok(candidateActions.includes("source_page=homepage_candidate_profile#qualifications"));
  assert.ok(component.includes("w-full min-w-0 aspect-[4/3] min-h-0"));
  assert.ok(!actions.includes("VIEW INVESTMENT DETAILS"));
  assert.ok(!actions.includes("candidate_profile_investment_click"));
  assert.ok(financialDisclosure.includes('id="financials"'));
  assert.ok(financialDisclosure.includes('id="financial-requirements"'));
  assert.ok(financialDisclosure.includes("getApprovedCandidateProfileFinancialQualification"));
  assert.ok(financialDisclosure.includes("approvedCandidateFinancialQualification ?"));
});

test("homepage renders the candidate-profile section", () => {
  assert.ok(homepage.includes("<CandidateProfileSection />"));
});
