import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const pagePath = path.resolve("src/app/franchise/the-opportunity/page.tsx");

test("Opportunity header uses a framed image while the dossier keeps the chapter rail", () => {
  const page = fs.readFileSync(pagePath, "utf8");

  assert.match(page, /import Image from "next\/image";/);
  assert.match(page, /src="\/images\/buddas-contact-service\.png"/);
  assert.match(page, /alt="A Budda's team member greeting a guest at a bakery counter"/);
  assert.match(page, /sectionClassName="border-b border-bds-teal-dark\/10 bg-bds-cream\/60 py-12 xl:py-12"/);
  assert.match(page, /<figure className="relative aspect-video[^"]*dossier-spine:aspect-\[2\/1\][^"]*">/);
  assert.doesNotMatch(page, /opportunity-index-hero-/);
  assert.match(page, /content-wide pb-8 pt-6 dossier-spine:hidden[\s\S]*?<OpportunityIndex layout="inline"/);
  assert.match(page, /<aside className="hidden dossier-spine:mt-6 dossier-spine:block">/);
  assert.match(page, /opportunity-dossier-spine sticky[\s\S]*?<OpportunityIndex labelId="opportunity-index-dossier-spine-heading"/);
});
