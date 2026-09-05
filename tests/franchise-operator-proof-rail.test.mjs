import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const railPath = path.resolve("src/components/public/operator-proof-rail.tsx");
const railContent = fs.readFileSync(railPath, "utf8");

test("OperatorProofRail utilizes BDS v2.0 design tokens and compact structure", () => {
  assert.ok(railContent.includes("bg-white"), "Uses white background");
  assert.ok(railContent.includes("text-bds-teal-dark"), "Uses bds-teal-dark base text");
  assert.ok(railContent.includes("#1C5F56"), "Uses canonical Dark Teal #1C5F56");
  assert.ok(railContent.includes("#C47D2B") || railContent.includes("#E9C559"), "Uses Island Gold accent tokens");
  assert.ok(!railContent.includes("arc-form-02.png"), "Does not include arc-form-02 background graphic");
  assert.ok(!railContent.includes("ROOTED IN HAWAI"), "Does not include bottom value line");
});

test("OperatorProofRail implements centered introduction hierarchy", () => {
  assert.ok(railContent.includes("THE BUDDA&apos;S ADVANTAGE") || railContent.includes("THE BUDDA'S ADVANTAGE"), "Contains uppercase eyebrow");
  assert.ok(railContent.includes("Built for operators. Designed to grow."), "Contains large display headline");
  assert.ok(railContent.includes("Four connected strengths that make Budda&apos;s a proven opportunity"), "Contains centered support paragraph");
  assert.ok(railContent.includes("MonsteraIcon"), "Contains decorative botanical motif");
});

test("OperatorProofRail renders 4-part timeline sequence with continuous rail and dots", () => {
  assert.ok(railContent.includes("01"), "Contains sequence number 01");
  assert.ok(railContent.includes("02"), "Contains sequence number 02");
  assert.ok(railContent.includes("03"), "Contains sequence number 03");
  assert.ok(railContent.includes("04"), "Contains sequence number 04");
  assert.ok(railContent.includes("THE PRODUCT"), "Pillar 01 category label");
  assert.ok(railContent.includes("The Roll sets Budda's apart."), "Pillar 01 subheadline");
  assert.ok(railContent.includes("The Budda Roll gives the menu a signature bakery-led identity."), "Pillar 01 description");
  assert.ok(railContent.includes("THE SYSTEM"), "Pillar 02 category label");
  assert.ok(railContent.includes("Consistency teams can follow."), "Pillar 02 subheadline");
  assert.ok(railContent.includes("Training, ordering, and clear standards support consistent execution."), "Pillar 02 description");
  assert.ok(railContent.includes("THE EXPERIENCE"), "Pillar 03 category label");
  assert.ok(railContent.includes("Hospitality teams can learn."), "Pillar 03 subheadline");
  assert.ok(railContent.includes("Clear service behaviors make generous hospitality teachable."), "Pillar 03 description");
  assert.ok(railContent.includes("THE GROWTH"), "Pillar 04 category label");
  assert.ok(railContent.includes("Ready first. Growth second."), "Pillar 04 subheadline");
  assert.ok(railContent.includes("Expansion follows readiness across the whole operation."), "Pillar 04 description");
  assert.ok(railContent.includes("We grow when product, people, operations, supply, and demand are ready."), "Pillar 04 description");
  assert.ok(railContent.includes("h-[2.5px]") || railContent.includes("h-[3px]"), "Continuous horizontal timeline rail line");
  assert.ok(railContent.includes("rounded-full bg-[#E9C559]"), "Accent dots along timeline");
});

test("OperatorProofRail uses photographic crop for Pillar 01 and thin-line icons for 02-04", () => {
  assert.ok(railContent.includes("/roll-icon.svg"), "Pillar 01 uses roll-icon.svg");
  assert.ok(railContent.includes("SystemStoreIcon"), "Pillar 02 uses system/operations icon");
  assert.ok(railContent.includes("ExperienceCareIcon"), "Pillar 03 uses hospitality/experience icon");
  assert.ok(railContent.includes("GrowthChartIcon"), "Pillar 04 uses growth/chart icon");
});
