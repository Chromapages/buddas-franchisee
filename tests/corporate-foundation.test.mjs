import assert from "node:assert/strict";
import test from "node:test";
import {
  CORPORATE_BUNDLE_PERMISSIONS,
  hasCorporatePermission,
  isActiveCorporateMembership,
  membershipCoversTarget,
  parseCorporateMemberships,
} from "../src/features/corporate/authorization.ts";
import {
  assertCommandVersion,
  assertIdempotencyKey,
  assertSameCommand,
  digestCommandPayload,
  getCommandRecordId,
} from "../src/features/corporate/commands.ts";
import { isCorporateSeedMode, getCorporateEnvironmentNotice } from "../src/features/corporate/environment.ts";

const now = Date.parse("2026-09-06T12:00:00.000Z");
const grant = (bundle = "support_handler", scope = { type: "locations", locationIds: ["HNL-014"] }, changes = {}) => ({
  id: "grant-1", bundle, status: "ACTIVE", scope, ...changes,
});
const session = (memberships = [grant()], changes = {}) => ({
  userId: "staff-1", email: "staff@example.test", displayName: "Test handler",
  identityClass: "CORPORATE", expiresAt: now + 3600000, memberships, isDevelopmentPreview: false, ...changes,
});

test("corporate scope permits an assigned location and denies a different location or entity-only target", () => {
  const identity = session();
  assert.equal(hasCorporatePermission(identity, "MANAGE_SUPPORT", { locationId: "HNL-014", organizationId: "entity-1" }, now), true);
  assert.equal(hasCorporatePermission(identity, "MANAGE_SUPPORT", { locationId: "OAH-207", organizationId: "entity-1" }, now), false);
  assert.equal(hasCorporatePermission(identity, "MANAGE_SUPPORT", { organizationId: "entity-1" }, now), false);
  assert.equal(hasCorporatePermission(identity, "MANAGE_SUPPORT", {}, now), false);
});

test("organization access applies to its records without becoming corporate-wide access", () => {
  const identity = session([grant("request_approver", { type: "organizations", organizationIds: ["entity-1"] })]);
  assert.equal(hasCorporatePermission(identity, "APPROVE_REQUESTS", { organizationId: "entity-1" }, now), true);
  assert.equal(hasCorporatePermission(identity, "APPROVE_REQUESTS", { organizationId: "entity-2", locationId: "HNL-014" }, now), false);
  assert.equal(hasCorporatePermission(identity, "APPROVE_REQUESTS", { locationId: "HNL-014" }, now), false);
});

test("regional access is constrained by a server-resolved region and never by a display market", () => {
  const identity = session([grant("support_handler", { type: "regions", regionIds: ["islands"] })]);
  assert.equal(hasCorporatePermission(identity, "VIEW_SUPPORT", { regionId: "islands", locationId: "HNL-014" }, now), true);
  assert.equal(hasCorporatePermission(identity, "VIEW_SUPPORT", { regionId: "mainland", locationId: "SLC-302" }, now), false);
  assert.equal(hasCorporatePermission(identity, "VIEW_SUPPORT", { locationId: "HNL-014" }, now), false,
    "A location must carry its resolved region before a regional membership can authorize access");
  assert.equal(hasCorporatePermission(identity, "VIEW_REQUESTS", { organizationId: "entity-1" }, now), false);
});

test("a capability and its scope must come from the same membership", () => {
  const identity = session([
    grant("support_handler", { type: "locations", locationIds: ["HNL-014"] }),
    grant("leadership", { type: "corporate" }, { id: "read-all" }),
  ]);
  assert.equal(hasCorporatePermission(identity, "VIEW_SUPPORT", { locationId: "OAH-207" }, now), true);
  assert.equal(hasCorporatePermission(identity, "MANAGE_SUPPORT", { locationId: "OAH-207" }, now), false,
    "A corporate-wide read grant must not broaden a separate local mutation grant");
});

test("legacy admin claims and assignment metadata confer no corporate capability", () => {
  const identity = session([], { role: "admin", assignedToUserId: "staff-1", managedLocationIds: ["HNL-014"] });
  assert.equal(hasCorporatePermission(identity, "VIEW_SUPPORT", { locationId: "HNL-014" }, now), false);
  assert.equal(hasCorporatePermission(identity, "MANAGE_ACCESS", undefined, now), false);
});

test("identity expiry and missing identity fields fail closed", () => {
  for (const change of [{ expiresAt: now }, { expiresAt: now - 1 }, { expiresAt: Number.NaN }, { userId: "" }, { email: "" }]) {
    assert.equal(hasCorporatePermission(session([grant()], change), "VIEW_SUPPORT", { locationId: "HNL-014" }, now), false);
  }
});

test("suspended, future, expired and malformed timed memberships cannot authorize work", () => {
  for (const change of [
    { status: "SUSPENDED" }, { startsAt: "2026-09-07T00:00:00Z" },
    { expiresAt: "2026-09-06T12:00:00Z" }, { startsAt: "invalid date" }, { expiresAt: "invalid date" },
  ]) {
    const membership = grant("support_handler", undefined, change);
    assert.equal(isActiveCorporateMembership(membership, now), false);
    assert.equal(hasCorporatePermission(session([membership]), "MANAGE_SUPPORT", { locationId: "HNL-014" }, now), false);
  }
  assert.equal(isActiveCorporateMembership(grant("support_handler", undefined, { startsAt: "2026-09-06T12:00:00Z" }), now), true);
});

test("only an explicit corporate scope can cover arbitrary records", () => {
  assert.equal(membershipCoversTarget(grant("leadership", { type: "corporate" }), { organizationId: "entity-2", locationId: "OAH-207" }), true);
  assert.equal(membershipCoversTarget({ ...grant(), scope: undefined }, { locationId: "HNL-014" }), false);
  assert.equal(membershipCoversTarget(grant("leadership", { type: "unknown" }), {}), false);
});

test("server membership parsing rejects malformed and prototype-name privilege claims", () => {
  assert.deepEqual(parseCorporateMemberships(null), []);
  assert.deepEqual(parseCorporateMemberships({ bundle: "operations_lead" }), []);
  const invalid = [
    null, {}, { ...grant(), id: "" }, { ...grant(), bundle: "administrator" },
    { ...grant(), bundle: "constructor" }, { ...grant(), bundle: "__proto__" },
    { ...grant(), status: "INVITED" }, { ...grant(), scope: {} },
    { ...grant(), scope: { type: "locations", locationIds: [] } },
    { ...grant(), scope: { type: "locations", locationIds: ["units/HNL-014"] } },
    { ...grant(), scope: { type: "regions", regionIds: [] } },
    { ...grant(), scope: { type: "regions", regionIds: ["regions/islands"] } },
    { ...grant(), scope: { type: "organizations", organizationIds: [42] } },
    { ...grant(), expiresAt: 1234 },
  ];
  assert.deepEqual(parseCorporateMemberships(invalid), []);
  assert.deepEqual(parseCorporateMemberships([grant(), ...invalid]), [grant()]);
});

test("leadership and specialist bundles do not receive unrelated administrative powers", () => {
  const readOnly = session([grant("leadership", { type: "corporate" })]);
  for (const permission of ["MANAGE_SUPPORT", "ASSIGN_SUPPORT", "WRITE_INTERNAL_NOTES", "VIEW_INTERNAL_NOTES", "APPROVE_REQUESTS", "COORDINATE_ORDERS", "MANAGE_ACCESS", "PUBLISH_RESOURCES"]) {
    assert.equal(hasCorporatePermission(readOnly, permission, { locationId: "HNL-014" }, now), false, permission);
  }
  assert.equal(CORPORATE_BUNDLE_PERMISSIONS.support_handler.includes("MANAGE_ACCESS"), false);
  assert.equal(CORPORATE_BUNDLE_PERMISSIONS.operations_lead.includes("APPROVE_REQUESTS"), false);
  assert.equal(CORPORATE_BUNDLE_PERMISSIONS.access_steward.includes("VIEW_INTERNAL_NOTES"), false);
  assert.equal(CORPORATE_BUNDLE_PERMISSIONS.order_coordinator.includes("VIEW_FINANCIAL_REFERENCES"), false);
});

test("canonical command digest preserves values while ignoring object key order", () => {
  const first = { target: { unit: "HNL-014", entity: "entity-1" }, quantities: [1, 2], comment: undefined };
  const reordered = { quantities: [1, 2], target: { entity: "entity-1", unit: "HNL-014" } };
  assert.equal(digestCommandPayload(first), digestCommandPayload(reordered));
  assert.notEqual(digestCommandPayload(first), digestCommandPayload({ ...first, quantities: [2, 1] }));
  assert.notEqual(digestCommandPayload({ amount: 10 }), digestCommandPayload({ amount: "10" }));
  assert.notEqual(digestCommandPayload({ note: null }), digestCommandPayload({}));
});

test("unsupported command values cannot be coerced into an accepted digest", () => {
  for (const invalid of [Number.NaN, Infinity, 1n, () => {}, new Date(now), new Map([["key", "value"]])]) {
    assert.throws(() => digestCommandPayload({ value: invalid }), { code: "INVALID_COMMAND" });
  }
});

test("record versions reject stale and malformed writes instead of silently overwriting", () => {
  assert.doesNotThrow(() => assertCommandVersion(2, 2));
  assert.throws(() => assertCommandVersion(2, 1), { code: "CONFLICT" });
  for (const version of [-1, 1.5, Number.NaN, Infinity, "2", Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => assertCommandVersion(2, version), { code: "INVALID_COMMAND" });
  }
});

test("idempotency references are bounded path-safe keys and isolated per actor", () => {
  const key = "operation_0123456789";
  assert.doesNotThrow(() => assertIdempotencyKey(key));
  for (const invalid of ["", "short", "a".repeat(129), "a".repeat(15) + "/", "a".repeat(15) + " ", null]) {
    assert.throws(() => assertIdempotencyKey(invalid), { code: "INVALID_COMMAND" });
  }
  assert.equal(getCommandRecordId("staff-1", key), getCommandRecordId("staff-1", key));
  assert.notEqual(getCommandRecordId("staff-1", key), getCommandRecordId("staff-2", key));
  assert.match(getCommandRecordId("staff-1", key), /^[a-f0-9]{64}$/);
});

test("a replay with changed payload conflicts while an identical digest succeeds", () => {
  const digest = digestCommandPayload({ state: "Approved", version: 2 });
  assert.doesNotThrow(() => assertSameCommand(digest, digest));
  assert.throws(() => assertSameCommand(digest, digestCommandPayload({ state: "Rejected", version: 2 })), { code: "CONFLICT" });
});

test("fictional corporate data requires explicit development opt-in and cannot be a production fallback", () => {
  const previous = { NODE_ENV: process.env.NODE_ENV, CORPORATE_USE_SEED_DATA: process.env.CORPORATE_USE_SEED_DATA };
  try {
    for (const [environment, flag, expected] of [
      ["production", "true", false], ["test", "true", false], ["development", "false", false],
      ["development", undefined, false], ["development", "true", true],
    ]) {
      process.env.NODE_ENV = environment;
      if (flag === undefined) delete process.env.CORPORATE_USE_SEED_DATA;
      else process.env.CORPORATE_USE_SEED_DATA = flag;
      assert.equal(isCorporateSeedMode(), expected, `${environment}/${flag}`);
      assert.equal(Boolean(getCorporateEnvironmentNotice()), expected);
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
