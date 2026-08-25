import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const COMPONENT_PATH = path.join(process.cwd(), "src/components/public/candidate-profile-section.tsx");
const PAGE_PATH = path.join(process.cwd(), "src/app/franchise/page.tsx");

test("CandidateProfileSection utilizes BDS v2.0 design tokens and 60/40 two-column structure", () => {
  assert.ok(fs.existsSync(COMPONENT_PATH), "candidate-profile-section.tsx must exist");
  const content = fs.readFileSync(COMPONENT_PATH, "utf8");

  // 60/40 desktop column distribution
  assert.ok(content.includes("lg:col-span-7"), "Must allocate ~60% to left content column");
  assert.ok(content.includes("lg:col-span-5"), "Must allocate ~40% to right image column");

  // Background and color tokens
  assert.ok(content.includes("bg-bds-cream") || content.includes("#FFF8E8"), "Must use bds-cream background");
  assert.ok(content.includes("#1C5F56") || content.includes("bds-teal-dark"), "Must use dark teal for primary headings/strokes");
  assert.ok(content.includes("#C47D2B"), "Must use warm amber gold for accents");
});

test("CandidateProfileSection renders required introduction elements", () => {
  const content = fs.readFileSync(COMPONENT_PATH, "utf8");

  // Eyebrow with gold accent bar
  assert.ok(content.includes("CANDIDATE PROFILE"), "Must render uppercase eyebrow label");
  assert.ok(content.includes("bg-[#C47D2B]"), "Must render gold underline accent below eyebrow");

  // Display Headline & Description
  assert.ok(content.includes("Built for operators"), "Must render canonical display headline");
  assert.ok(content.includes("who can build with us"), "Must complete canonical headline");
  assert.ok(content.includes("experienced restaurant leaders"), "Must render supporting copy");
});

test("CandidateProfileSection renders 3 vertical pillars with metric and narrative treatments", () => {
  const content = fs.readFileSync(COMPONENT_PATH, "utf8");

  // Sequence numbers
  assert.ok(content.includes("01"), "Must render pillar 01 sequence");
  assert.ok(content.includes("02"), "Must render pillar 02 sequence");
  assert.ok(content.includes("03"), "Must render pillar 03 sequence");

  // Pillar 01: OPERATE
  assert.ok(content.includes("OPERATE"), "Must render OPERATE title");
  assert.ok(content.includes("Multi-unit or high-volume"), "Must render OPERATE statement");

  // Pillar 02: CAPITALIZE with real approved metrics
  assert.ok(content.includes("CAPITALIZE"), "Must render CAPITALIZE title");
  assert.ok(content.includes("$150K"), "Must render $150K liquid capital metric");
  assert.ok(content.includes("LIQUID CAPITAL"), "Must render LIQUID CAPITAL label");
  assert.ok(content.includes("$400K"), "Must render $400K net worth metric");
  assert.ok(content.includes("NET WORTH"), "Must render NET WORTH label");

  // Pillar 03: STEWARD
  assert.ok(content.includes("STEWARD"), "Must render STEWARD title");
  assert.ok(content.includes("Protect the product"), "Must render STEWARD statement");

  // Vertical dividers
  assert.ok(content.includes("md:divide-x") || content.includes("border-r"), "Must include vertical dividers between pillars");
});

test("CandidateProfileSection provides tall photo panel with frosted overlay badge", () => {
  const content = fs.readFileSync(COMPONENT_PATH, "utf8");

  // Image source
  assert.ok(content.includes("stock1.webp") || content.includes("candidate-profile-baker.png"), "Must reference approved photo");

  // Overlay badge
  assert.ok(content.includes("MORE TABLES."), "Must render badge line 1");
  assert.ok(content.includes("SAME STANDARD."), "Must render badge line 2");
  assert.ok(content.includes("backdrop-blur"), "Must use frosted glass blur effect");
});

test("CandidateProfileSection provides bottom partnership callout and action suite", () => {
  const content = fs.readFileSync(COMPONENT_PATH, "utf8");

  // Partnership narrative
  assert.ok(content.includes("THE RIGHT PARTNERSHIP WORKS BOTH WAYS"), "Must render relationship headline");
  assert.ok(content.includes("brings a distinctive product") || content.includes("distinctive product"), "Must render partnership description");

  // Primary & Secondary Actions
  assert.ok(content.includes("VIEW INVESTMENT DETAILS"), "Must render primary CTA button");
  assert.ok(content.includes("/franchise/the-opportunity#financials") || content.includes("/franchise/the-opportunity"), "Must route to financials");
  assert.ok(content.includes("REVIEW QUALIFICATIONS"), "Must render secondary link");
  assert.ok(content.includes("No commitment"), "Must render reassurance microcopy");
});

test("FranchiseHomePage integrates CandidateProfileSection as 3rd section", () => {
  const pageContent = fs.readFileSync(PAGE_PATH, "utf8");
  assert.ok(pageContent.includes("<CandidateProfileSection />"), "Page must mount CandidateProfileSection");
});
