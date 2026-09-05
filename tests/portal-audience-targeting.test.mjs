import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAudienceContext,
  evaluateAudienceTargeting,
  formatAudienceBadgeText,
} from "../src/features/portal/targeting.ts";
import {
  explainBulletinForOperator,
  getVisibleBulletins,
} from "../src/features/portal/bulletins.ts";
import {
  defaultPortalStorage,
  InMemoryPortalStorage,
} from "../src/features/portal/storage-adapter.ts";
import type {
  OperationalAudience,
  PortalLocation,
  PortalBulletin,
  PortalResource,
} from "../src/features/portal/types.ts";

const mockLocations: Record<string, PortalLocation> = {
  "HNL-014": {
    id: "HNL-014",
    name: "Honolulu Flagship",
    market: "Hawaii",
    equipmentConfig: ["turbo-deck-oven", "automated-proofer"],
    launchStage: "STABILIZED",
    storeFormat: "in-line",
    address: "1000 Ala Moana Blvd",
    city: "Honolulu",
    state: "HI",
    zip: "96814",
    status: "Active",
    openedDate: "2024-01-15",
  },
  "OAH-207": {
    id: "OAH-207",
    name: "Oahu Drive-Thru",
    market: "Hawaii",
    equipmentConfig: ["turbo-deck-oven", "soft-serve-station", "kiosk-pos"],
    launchStage: "GRAND_OPENING",
    storeFormat: "drive-thru",
    address: "91-5431 Kapolei Pkwy",
    city: "Kapolei",
    state: "HI",
    zip: "96707",
    status: "Active",
    openedDate: "2025-11-01",
  },
  "SLC-302": {
    id: "SLC-302",
    name: "Salt Lake Downtown",
    market: "Utah",
    equipmentConfig: ["standard-deck-oven", "automated-proofer"],
    launchStage: "TRAINING",
    storeFormat: "in-line",
    address: "250 S Main St",
    city: "Salt Lake City",
    state: "UT",
    zip: "84101",
    status: "Active",
    openedDate: "2026-03-01",
  },
};

test("evaluateAudienceTargeting: universal content (undefined or empty) is visible to all units", () => {
  const hnlContext = buildAudienceContext(mockLocations["HNL-014"], "franchisee");
  const slcContext = buildAudienceContext(mockLocations["SLC-302"], "franchisee");

  const evalUndefined = evaluateAudienceTargeting(undefined, hnlContext);
  assert.equal(evalUndefined.isTargeted, true);
  assert.equal(evalUndefined.isUniversal, true);
  assert.equal(evalUndefined.unmatchedRules.length, 0);

  const evalEmpty = evaluateAudienceTargeting({}, slcContext);
  assert.equal(evalEmpty.isTargeted, true);
  assert.equal(evalEmpty.isUniversal, true);
  assert.equal(evalEmpty.unmatchedRules.length, 0);
});

test("evaluateAudienceTargeting: market targeting delivers only to specified territory", () => {
  const hawaiiAudience: OperationalAudience = {
    markets: ["Hawaii"],
  };

  const hnlContext = buildAudienceContext(mockLocations["HNL-014"], "franchisee");
  const slcContext = buildAudienceContext(mockLocations["SLC-302"], "franchisee");

  const hnlResult = evaluateAudienceTargeting(hawaiiAudience, hnlContext);
  assert.equal(hnlResult.isTargeted, true);
  assert.equal(hnlResult.matchedRules.some((r) => r.dimension === "market"), true);

  const slcResult = evaluateAudienceTargeting(hawaiiAudience, slcContext);
  assert.equal(slcResult.isTargeted, false);
  assert.equal(slcResult.unmatchedRules.some((r) => r.dimension === "market"), true);
  assert.ok(slcResult.reasons[0].includes("Utah"));
});

test("evaluateAudienceTargeting: equipment configuration targeting matches hardware packages", () => {
  const turboOvenAudience: OperationalAudience = {
    equipmentConfigs: ["turbo-deck-oven"],
  };

  const hnlContext = buildAudienceContext(mockLocations["HNL-014"], "franchisee");
  const slcContext = buildAudienceContext(mockLocations["SLC-302"], "franchisee");

  const hnlResult = evaluateAudienceTargeting(turboOvenAudience, hnlContext);
  assert.equal(hnlResult.isTargeted, true);
  assert.equal(hnlResult.matchedRules.some((r) => r.dimension === "equipment"), true);

  const slcResult = evaluateAudienceTargeting(turboOvenAudience, slcContext);
  assert.equal(slcResult.isTargeted, false);
  assert.equal(slcResult.unmatchedRules.some((r) => r.dimension === "equipment"), true);
  assert.ok(slcResult.reasons[0].includes("lacks required operational equipment"));
});

test("evaluateAudienceTargeting: launch stage targeting isolates lifecycle phases", () => {
  const trainingAudience: OperationalAudience = {
    launchStages: ["PRE_OPENING", "TRAINING"],
  };

  const hnlContext = buildAudienceContext(mockLocations["HNL-014"], "franchisee");
  const slcContext = buildAudienceContext(mockLocations["SLC-302"], "franchisee");

  // HNL is STABILIZED -> should not receive training updates
  const hnlResult = evaluateAudienceTargeting(trainingAudience, hnlContext);
  assert.equal(hnlResult.isTargeted, false);
  assert.equal(hnlResult.unmatchedRules.some((r) => r.dimension === "launchStage"), true);

  // SLC is TRAINING -> should receive training updates
  const slcResult = evaluateAudienceTargeting(trainingAudience, slcContext);
  assert.equal(slcResult.isTargeted, true);
  assert.equal(slcResult.matchedRules.some((r) => r.dimension === "launchStage"), true);
});

test("evaluateAudienceTargeting: multi-criteria conjunction requires all operational rules to match", () => {
  // Target Hawaii units with drive-thru format
  const hawaiiDriveThruAudience: OperationalAudience = {
    markets: ["Hawaii"],
    storeFormats: ["drive-thru"],
  };

  const hnlContext = buildAudienceContext(mockLocations["HNL-014"], "franchisee"); // Hawaii, in-line
  const oahContext = buildAudienceContext(mockLocations["OAH-207"], "franchisee"); // Hawaii, drive-thru
  const slcContext = buildAudienceContext(mockLocations["SLC-302"], "franchisee"); // Utah, in-line

  const hnlResult = evaluateAudienceTargeting(hawaiiDriveThruAudience, hnlContext);
  assert.equal(hnlResult.isTargeted, false, "HNL fails store format criteria");
  assert.equal(hnlResult.matchedRules.some((r) => r.dimension === "market"), true);
  assert.equal(hnlResult.unmatchedRules.some((r) => r.dimension === "storeFormat"), true);

  const oahResult = evaluateAudienceTargeting(hawaiiDriveThruAudience, oahContext);
  assert.equal(oahResult.isTargeted, true, "OAH satisfies both market and store format");
  assert.equal(oahResult.unmatchedRules.length, 0);

  const slcResult = evaluateAudienceTargeting(hawaiiDriveThruAudience, slcContext);
  assert.equal(slcResult.isTargeted, false, "SLC fails both criteria");
  assert.equal(slcResult.unmatchedRules.length, 2);
});

test("evaluateAudienceTargeting: corporate admins bypass unit restrictions but retain audit visibility", () => {
  const targetedAudience: OperationalAudience = {
    unitIds: ["HNL-014"],
    markets: ["Hawaii"],
    equipmentConfigs: ["turbo-deck-oven"],
  };

  const adminContext = buildAudienceContext(mockLocations["SLC-302"], "admin");
  const adminResult = evaluateAudienceTargeting(targetedAudience, adminContext);

  assert.equal(adminResult.isTargeted, true);
  assert.ok(adminResult.reasons.some((r) => r.includes("Bypassed by corporate administrator privilege")));
});

test("formatAudienceBadgeText: generates clear, human-readable operational tags", () => {
  const allAudience: OperationalAudience = {};
  assert.equal(formatAudienceBadgeText(allAudience), null);

  const singleAudience: OperationalAudience = {
    markets: ["Hawaii"],
  };
  assert.equal(formatAudienceBadgeText(singleAudience), "Market: Hawaii");

  const multiAudience: OperationalAudience = {
    markets: ["Hawaii"],
    equipmentConfigs: ["turbo-deck-oven"],
    launchStages: ["STABILIZED"],
  };
  assert.equal(
    formatAudienceBadgeText(multiAudience),
    "Market: Hawaii · Equipment: turbo-deck-oven · Stage: STABILIZED",
  );
});

test("explainBulletinForOperator: provides transparent diagnostic breakdown for support staff", () => {
  const bulletin: PortalBulletin = {
    id: "blt-test-1",
    title: "Turbo Deck Firmware Update",
    date: "2026-03-01",
    effectiveDate: "2026-03-01",
    category: "Equipment",
    summary: "Firmware v2.4 roll-out",
    audience: {
      equipmentConfigs: ["turbo-deck-oven"],
    },
    publishedAt: "2026-03-01T00:00:00Z",
    requiresAction: true,
  };

  // Unit with turbo oven (HNL-014)
  const hnlContext = buildAudienceContext(mockLocations["HNL-014"], "franchisee");
  const hnlExpl = explainBulletinForOperator(bulletin, hnlContext);
  assert.equal(hnlExpl.isTargeted, true);
  assert.ok(hnlExpl.summary.includes("Targeted match"));
  assert.equal(hnlExpl.unmatchedRules.length, 0);

  // Unit without turbo oven (SLC-302)
  const slcContext = buildAudienceContext(mockLocations["SLC-302"], "franchisee");
  const slcExpl = explainBulletinForOperator(bulletin, slcContext);
  assert.equal(slcExpl.isTargeted, false);
  assert.ok(slcExpl.summary.includes("Excluded"));
  assert.equal(slcExpl.unmatchedRules.some((r) => r.dimension === "equipment"), true);
  assert.ok(slcExpl.reasons[0].includes("lacks required operational equipment [turbo-deck-oven]"));
});

test("storage adapter: explainBulletinForUnit and explainResourceForUnit support queries", async () => {
  const storage = new InMemoryPortalStorage();

  // Test bulletin explanation via storage adapter
  const hnlBulletinExpl = await storage.explainBulletinForUnit("blt-003", "HNL-014");
  assert.ok(hnlBulletinExpl);
  assert.equal(hnlBulletinExpl.isTargeted, true, "HNL has turbo oven so blt-003 is targeted");

  const slcBulletinExpl = await storage.explainBulletinForUnit("blt-003", "SLC-302");
  assert.ok(slcBulletinExpl);
  assert.equal(slcBulletinExpl.isTargeted, false, "SLC lacks turbo oven so blt-003 is NOT targeted");
  assert.ok(slcBulletinExpl.reasons[0].includes("turbo-deck-oven"));

  // Test resource explanation via storage adapter
  const slcResourceExpl = await storage.explainResourceForUnit("res-004", "SLC-302");
  assert.ok(slcResourceExpl);
  assert.equal(slcResourceExpl.isTargeted, true, "SLC is in TRAINING stage so res-004 is targeted");

  const hnlResourceExpl = await storage.explainResourceForUnit("res-004", "HNL-014");
  assert.ok(hnlResourceExpl);
  assert.equal(hnlResourceExpl.isTargeted, false, "HNL is in STABILIZED stage so res-004 is NOT targeted");
});

test("storage adapter: getResourcesByLocation filters targeted resources by unit operational context", async () => {
  const storage = new InMemoryPortalStorage();

  const hnlResources = await storage.getResourcesByLocation("HNL-014", "franchisee");
  const slcResources = await storage.getResourcesByLocation("SLC-302", "franchisee");

  // res-003 is targeted to Hawaii market -> HNL should have it, SLC should not
  assert.ok(hnlResources.some((r) => r.id === "res-003"), "HNL should have Hawaii resource");
  assert.ok(!slcResources.some((r) => r.id === "res-003"), "SLC should NOT have Hawaii resource");

  // res-004 is targeted to PRE_OPENING / TRAINING -> SLC should have it, HNL should not
  assert.ok(slcResources.some((r) => r.id === "res-004"), "SLC should have training checklist");
  assert.ok(!hnlResources.some((r) => r.id === "res-004"), "HNL should NOT have training checklist");

  // Universal resources (res-001) should be visible to both
  assert.ok(hnlResources.some((r) => r.id === "res-001"), "HNL should have universal resource");
  assert.ok(slcResources.some((r) => r.id === "res-001"), "SLC should have universal resource");
});

test("security & privacy: audience targeting strictly prohibits behavioral or sensitive profiling attributes", () => {
  const validContext = buildAudienceContext(mockLocations["HNL-014"], "franchisee");

  // Verify only authorized operational keys exist in context
  const allowedContextKeys = new Set([
    "unitId",
    "market",
    "role",
    "equipmentConfig",
    "launchStage",
    "storeFormat",
  ]);

  for (const key of Object.keys(validContext)) {
    assert.ok(
      allowedContextKeys.has(key),
      `Unauthorized key found in AudienceContext: ${key}. No behavioral profiling permitted.`,
    );
  }

  // Ensure prohibited behavioral tracking keys are completely absent
  const forbiddenPatterns = [
    "dwell",
    "engagement",
    "click",
    "sentiment",
    "propensity",
    "score",
    "behavior",
    "tracker",
    "profile",
    "demographic",
  ];

  const serializedContext = JSON.stringify(validContext).toLowerCase();
  for (const pattern of forbiddenPatterns) {
    assert.equal(
      serializedContext.includes(`"${pattern}"`),
      false,
      `Forbidden behavioral attribute "${pattern}" detected in operational context`,
    );
  }
});
