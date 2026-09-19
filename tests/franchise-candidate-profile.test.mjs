import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const desktop = read("src/components/public/candidate-profile-desktop.tsx");
const mobile = read("src/components/public/candidate-profile-mobile.tsx");
const content = read("src/features/franchise/candidate-criteria.ts");
const homepage = read("src/app/franchise/page.tsx");

test("homepage replaces the duplicate equation with governed operator support", () => {
  for (const value of ["Support built for operators.", "Opening + training", "Operating standards", "Brand + marketing", "Supply + procurement", "Ongoing operations"]) assert.match(content, new RegExp(value.replace("+", "\\+")));
  assert.match(desktop, /OPERATOR_SUPPORT_CONTENT\.areas\.map/);
  assert.match(mobile, /OPERATOR_SUPPORT_CONTENT\.areas\.map/);
  assert.doesNotMatch(desktop + mobile, /BUDDAS_EQUATION_CONTENT|candidate-equation/);
  assert.match(content, /href: "\/franchise\/process"/);
});

test("homepage inserts real-business proof before the operating blueprint", () => {
  assert.match(homepage, /<BusinessProofBand \/>[\s\S]*<OperatorProofMobile/);
  assert.match(homepage, /<CandidateProfileSection content=\{content\.candidateProfile\} \/>/);
});
