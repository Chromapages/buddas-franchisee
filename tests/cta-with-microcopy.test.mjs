import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const readSource = (file) => fs.readFileSync(path.resolve(file), "utf8");
const sharedCta = readSource("src/components/public/cta-with-microcopy.tsx");
const operatorProof = readSource("src/components/public/operator-proof-rail.tsx");
const mobileOperatorProof = readSource("src/components/public/operator-proof-mobile-disclosure.tsx");
const candidateProfile = readSource("src/components/public/candidate-profile-section.tsx");
const candidateActions = readSource("src/components/public/candidate-profile-actions.tsx");

test("operator proof and candidate profile share CTA microcopy treatment", () => {
  assert.match(sharedCta, /No obligation — takes under 2 minutes\./);
  assert.match(sharedCta, /isNavigating\?: boolean/);
  assert.match(sharedCta, /aria-busy=\{isNavigating \|\| undefined\}/);
  assert.match(sharedCta, /mt-1 text-\[11px\] font-medium text-bds-text-body\/80/);
  assert.match(operatorProof, /<MobileOperatorDisclosureList/);
  assert.match(mobileOperatorProof, /<CtaWithMicrocopy/);
  assert.match(candidateProfile, /<CandidateProfileActions \/>/);
  assert.match(candidateActions, /<CtaWithMicrocopy/);
});
