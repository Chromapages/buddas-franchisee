import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const sharedCta = read("src/components/public/cta-with-microcopy.tsx");
const operatorCta = read("src/components/public/operator-proof-opportunity-cta.tsx");
const candidateActions = read("src/components/public/candidate-profile-actions.tsx");

test("shared CTA requires each placement to provide accurate microcopy", () => {
  assert.match(sharedCta, /microcopy: string/);
  assert.doesNotMatch(sharedCta, /microcopy =/);
  assert.match(sharedCta, /isNavigating\?: boolean/);
  assert.match(sharedCta, /aria-busy=\{isNavigating \|\| undefined\}/);
  assert.match(operatorCta, /microcopy=\{microcopy\}/);
  assert.match(candidateActions, /microcopy="No obligation — review the full candidate criteria\."/);
});
