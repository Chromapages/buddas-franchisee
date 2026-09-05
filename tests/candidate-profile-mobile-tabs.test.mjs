import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const component = fs.readFileSync(path.resolve("src/components/public/candidate-profile-section.tsx"), "utf8");
const mobileGate = fs.readFileSync(path.resolve("src/components/public/candidate-profile-mobile-fit-gate.tsx"), "utf8");
const investmentLink = fs.readFileSync(path.resolve("src/components/public/candidate-profile-investment-link.tsx"), "utf8");
const actions = fs.readFileSync(path.resolve("src/components/public/candidate-profile-actions.tsx"), "utf8");
const analytics = fs.readFileSync(path.resolve("src/lib/analytics.ts"), "utf8");
const styles = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");

test("mobile candidate profile uses a visible static Operator Standard Ledger", () => {
  assert.match(component, /<CandidateProfileMobileFitGate pillars=\{mobileFitPillars\} \/>/);
  assert.doesNotMatch(component, /"use client"|useState|useRef|trackFunnelEvent/);
  assert.match(mobileGate, /aria-label="Operator standards"/);
  assert.match(mobileGate, /<ol/);
  assert.match(mobileGate, /md:hidden divide-y divide-\[#1C5F56\]\/15 border-y/);
  assert.match(mobileGate, /grid-cols-\[2rem_minmax\(0,1fr\)\]/);
  assert.match(mobileGate, /tabular-nums/);
  assert.match(mobileGate, /\{pillar\.standard\}/);
  assert.match(mobileGate, /\{pillar\.supportingExpectation\}/);
  assert.match(mobileGate, /data-candidate-supporting-expectation/);
  assert.doesNotMatch(mobileGate, /useState|aria-expanded|aria-controls|candidate-detail-reveal|FDD Item 7|trackFunnelEvent|role="tablist"|onTouchStart|onTouchEnd|CandidateProfileVariant/);
  assert.doesNotMatch(mobileGate, /setInterval|requestAnimationFrame|scrollIntoView|\+/);
  assert.match(actions, /qualificationActivation = useRef\(false\)/);
  assert.match(actions, /candidate_destination: "qualifications"/);
  assert.match(actions, /motion-reduce:transition-none motion-reduce:transform-none/);
  assert.match(investmentLink, /trackFunnelEvent\("candidate_profile_investment_click"/);
  assert.match(investmentLink, /candidate_criterion: "capitalize"/);
  assert.match(investmentLink, /candidate_destination: "investment"/);
  assert.doesNotMatch(component + mobileGate, /candidate_profile_criterion_expand|candidate_profile_image/);
  assert.match(actions, /focus-visible:ring-4 focus-visible:ring-\[#1C5F56\] focus-visible:ring-offset-2/);
  assert.doesNotMatch(actions, /candidate_profile_investment_click|VIEW INVESTMENT DETAILS/);
});

test("candidate-profile removes randomized variants and observer-driven layout work", () => {
  assert.doesNotMatch(component + mobileGate, /NEXT_PUBLIC_CANDIDATE_PROFILE_VARIANT|localStorage|Math\.random|IntersectionObserver|useEffect|useMemo|useCallback|memo/);
  assert.match(analytics, /"candidate_profile_inquiry_progression"/);
});
