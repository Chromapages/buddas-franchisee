import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const mobile = read("src/components/public/operator-proof-mobile.tsx");
const desktop = read("src/components/public/operator-proof-desktop.tsx");
const content = read("src/features/franchise/operator-proof-content.ts");

test("mobile and desktop proof components keep isolated branded structures", () => {
  assert.match(mobile, /aria-labelledby="operator-proof-mobile-heading"/);
  assert.match(desktop, /aria-labelledby="operator-proof-desktop-heading"/);
  assert.match(mobile, /bg-white text-bds-teal-dark/);
  assert.match(desktop, /operator-blueprint-reference-layout/);
  assert.match(desktop, /operator-blueprint-reference-register/);
  assert.match(desktop, /Why Budda&apos;s\?/);
  assert.match(desktop, /OperatorProofOpportunityCta/);
  assert.doesNotMatch(mobile + desktop, /Monstera|h-\[2\.5px\]|left-\[34%\]|group-hover:scale/);
});

test("one source supplies the complete five-layer operating blueprint", () => {
  assert.match(content, /eyebrow: "The Budda's Advantage"/);
  assert.match(content, /heading: "What makes the Budda's model different\."/);
  for (const index of ["01", "02", "03", "04", "05"]) assert.match(content, new RegExp(`index: "${index}"`));
  for (const category of ["Product", "Production system", "Operator system", "Hospitality standard", "Growth gate"]) assert.match(content, new RegExp(`category: "${category}"`));
  assert.match(content, /The Budda Roll creates distinction\./);
  assert.match(content, /Preparation standards support repeatability\./);
  assert.match(content, /Clear standards make execution teachable\./);
  assert.match(content, /Hospitality is designed into the standard\./);
  assert.match(content, /Repeatability comes before expansion\./);
  assert.match(content, /evidenceItems:/);
  assert.match(content, /href\?: string/);
  assert.match(content, /linkLabel\?: string/);
});

test("desktop imagery supports the framework without financial chart language", () => {
  assert.match(desktop, /buddas-hero-rolls-cover\.png/);
  assert.doesNotMatch(desktop, /operator-blueprint-operations-media|GrowthChartIcon|Top Quartile|revenue|margin|ROI/i);
  assert.match(desktop, /UsersRound/);
  assert.match(desktop, /ChartNoAxesCombined/);
});
