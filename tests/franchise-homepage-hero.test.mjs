import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const pagePath = path.resolve("src/app/franchise/page.tsx");
const pageContent = fs.readFileSync(pagePath, "utf8");

test("Franchise homepage hero section contains required BDS v2.0 design tokens and structure", () => {
  assert.ok(pageContent.includes("bds-cream"), "Includes bds-cream surface");
  assert.ok(pageContent.includes("bds-text-heading"), "Includes bds-text-heading");
  assert.ok(pageContent.includes("bds-text-body"), "Includes bds-text-body");
  assert.ok(pageContent.includes("bds-action-primary"), "Includes bds-action-primary");
});

test("Hero section displays exact canonical headline, roll icon, and eyebrow from reference", () => {
  assert.ok(pageContent.includes("Build the Home"), "Contains first line of headline");
  assert.ok(pageContent.includes("of the Budda Roll"), "Contains second line of headline");
  assert.ok(pageContent.includes("in Your Market."), "Contains third line of headline");
  assert.ok(pageContent.includes("franchise opportunity"), "Contains franchise opportunity in body copy");
  assert.ok(pageContent.includes("Home of the Budda Roll"), "Contains eyebrow text");
  assert.ok(pageContent.includes("/roll-icon.svg"), "Directly uses roll-icon.svg");
  assert.ok(pageContent.includes("bg-[#C47D2B]"), "Roll icon renders in gold color");
});

test("Hero section provides responsive mobile and desktop optimized background images", () => {
  assert.ok(pageContent.includes("FRANCHISE-HERO-mobile.jpg"), "Includes mobile-optimized hero background image");
  assert.ok(pageContent.includes("franchise-hero.jpg"), "Includes desktop hero background image");
});

test("Hero section provides accessible CTAs with correct destinations", () => {
  assert.ok(pageContent.includes("focus-visible:ring-2"), "Includes focus-visible ring styles");
  assert.ok(pageContent.includes('href="/franchise/the-opportunity"'), "Primary CTA links to /franchise/the-opportunity");
  assert.ok(pageContent.includes("Review the Franchise Opportunity"), "Primary CTA label matches approved evaluation-first CTA copy");
  assert.ok(pageContent.includes('href="/franchise/contact"'), "Secondary CTA links to /franchise/contact");
  assert.ok(pageContent.includes("Start a Franchise Inquiry"), "Secondary CTA label matches approved direct-interest CTA copy");
});

test("Hero section renders 2 Operating Utah Restaurants proof badge and Operator Proof Rail integration", () => {
  assert.ok(pageContent.includes("2 Operating Utah Restaurants"), "Contains Utah restaurants proof title");
  assert.ok(pageContent.includes("Pleasant Grove"), "Contains Pleasant Grove location");
  assert.ok(pageContent.includes("Salt Lake City"), "Contains Salt Lake City location");
  assert.ok(pageContent.includes("<OperatorProofRail"), "Mounts OperatorProofRail as the homepage second section");
});
