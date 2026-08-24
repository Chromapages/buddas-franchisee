import assert from "node:assert/strict";
import test from "node:test";

import { WHY_BUDDAS_PILLARS } from "../src/features/why-buddas/pillars-config.ts";

test("WHY_BUDDAS_PILLARS contains exactly 4 comprehensive pillars", () => {
  assert.equal(WHY_BUDDAS_PILLARS.length, 4);

  assert.deepEqual(
    WHY_BUDDAS_PILLARS.map((p) => p.number),
    ["01", "02", "03", "04"]
  );

  assert.deepEqual(
    WHY_BUDDAS_PILLARS.map((p) => p.id),
    [
      "proprietary-icon",
      "daypart-engine",
      "speed-simplicity",
      "generosity-baked-in",
    ]
  );
});

test("Each pillar provides complete evidence, operational metrics, and author quotes", () => {
  for (const pillar of WHY_BUDDAS_PILLARS) {
    assert.ok(pillar.shortTitle.length > 0, `${pillar.id} has shortTitle`);
    assert.ok(pillar.tagline.length > 0, `${pillar.id} has tagline`);
    assert.ok(pillar.headline.length > 0, `${pillar.id} has headline`);
    assert.ok(pillar.narrative.length > 50, `${pillar.id} narrative is comprehensive`);
    assert.ok(pillar.quote.length > 0, `${pillar.id} has quote`);
    assert.ok(pillar.quoteAuthor.length > 0, `${pillar.id} has quoteAuthor`);
    assert.ok(Array.isArray(pillar.metrics) && pillar.metrics.length >= 2, `${pillar.id} has metrics`);
    assert.ok(Array.isArray(pillar.badges) && pillar.badges.length >= 2, `${pillar.id} has badges`);
  }
});

test("Pillars respect Mode-A non-Item-19 safety boundaries", () => {
  for (const pillar of WHY_BUDDAS_PILLARS) {
    const text = (pillar.narrative + " " + pillar.headline + " " + pillar.quote).toLowerCase();
    assert.ok(!text.includes("guaranteed profit"), "Must not guarantee profits");
    assert.ok(!text.includes("annual net return"), "Must not make net return promises");
  }
});
