import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const componentPath = path.resolve("src/components/public/franchise-page-header.tsx");
const standardHeaderPages = [
  "about",
  "contact",
  "faq",
  "process",
  "the-opportunity",
  "why-buddas",
];

test("FranchisePageHeader provides the shared header anatomy", () => {
  const content = fs.readFileSync(componentPath, "utf8");

  assert.ok(content.includes("type FranchisePageHeaderProps"), "Defines shared header props");
  assert.ok(content.includes("<h1"), "Renders a single page heading");
  assert.ok(content.includes("eyebrow"), "Supports an optional eyebrow");
  assert.ok(content.includes("actions"), "Supports optional header actions");
  assert.ok(content.includes("min-h-[44px]"), "Provides a mobile-friendly action target");
  assert.ok(content.includes("bg-bds-cream/60"), "Uses the shared cream header surface");
  assert.ok(content.includes("text-bds-text-heading"), "Uses the shared teal heading style");
  assert.ok(content.includes("text-bds-text-body/80"), "Uses the shared body-text treatment");
});

test("Franchise navigation pages use FranchisePageHeader", () => {
  for (const page of standardHeaderPages) {
    const pagePath = path.resolve(`src/app/franchise/${page}/page.tsx`);
    const content = fs.readFileSync(pagePath, "utf8");

    assert.ok(
      content.includes("FranchisePageHeader"),
      `${page} uses the shared franchise page header`
    );
  }
});
