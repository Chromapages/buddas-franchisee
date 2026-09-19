import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import * as authorization from "../src/features/corporate/authorization.ts";
import * as commands from "../src/features/corporate/commands.ts";
import * as environment from "../src/features/corporate/environment.ts";
import * as seeds from "../src/features/corporate/seed-data.ts";

// Exercise the real server storage with an isolated transaction double. No Firebase
// credentials are loaded and no network is used. This does not certify Firestore.
const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/features/corporate/storage.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const module = { exports: {} };
const localModules = {
  "server-only": {}, "../../lib/firebase/admin": { firebaseDb: null },
  "./authorization": authorization, "./commands": commands,
  "./environment": environment, "./seed-data": seeds,
};
new Function("require", "module", "exports", compiled)(
  (name) => Object.hasOwn(localModules, name) ? localModules[name] : require(name), module, module.exports,
);
const { FirestoreCorporateStorage, getCorporateStorage } = module.exports;

class TransactionDatabase {
  constructor(records) { this.records = new Map(Object.entries(structuredClone(records))); this.failCommit = false; this.queue = Promise.resolve(); }
  collection(name) { return { doc: (id) => ({ path: `${name}/${id}`, id }) }; }
  runTransaction(callback) {
    const work = this.queue.then(async () => {
      const snapshot = new Map(structuredClone([...this.records]));
      const transaction = {
        getAll: async (...references) => references.map((ref) => ({
          id: ref.id, exists: snapshot.has(ref.path), data: () => structuredClone(snapshot.get(ref.path)),
        })),
        set: (ref, value) => snapshot.set(ref.path, structuredClone(value)),
        create: (ref, value) => {
          if (snapshot.has(ref.path)) throw new Error("Already exists");
          snapshot.set(ref.path, structuredClone(value));
        },
      };
      const result = await callback(transaction);
      if (this.failCommit) throw new Error("Simulated durable commit failure");
      this.records = snapshot;
      return result;
    });
    this.queue = work.catch(() => {});
    return work;
  }
  entries(collection) { return [...this.records].filter(([path]) => path.startsWith(`${collection}/`)); }
}

const membership = (locationId = "HNL-014", bundle = "operations_lead") => ({
  id: "grant-1", bundle, status: "ACTIVE", scope: { type: "locations", locationIds: [locationId] },
});
const identity = () => ({ userId: "staff-1", email: "staff@example.test", displayName: "Handler", identityClass: "CORPORATE", expiresAt: Date.now() + 3600000, memberships: [membership()], isDevelopmentPreview: false });
const original = () => ({
  id: "SUP-1", reference: "SUP-1", type: "support", subject: "Receiving question", locationId: "HNL-014", organizationId: "entity-1",
  state: "Open", isClosed: false, teamId: "support-intake", priority: "NORMAL", nextAction: "Assign handler",
  createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z", version: 0, href: "/corporate/support/SUP-1",
});
const command = (changes = {}) => ({
  recordId: "SUP-1", idempotencyKey: "support_operation_001", expectedVersion: 0,
  permission: "MANAGE_SUPPORT", action: "SUPPORT_REVIEWED", payload: { state: "In Review" },
  update: (current) => ({ ...current, state: "In Review", nextAction: "Reply to operator" }),
  deliveries: [{ recipientId: "operator-1", channel: "IN_APP", summary: "Support review started", href: "/portal/support" }],
  ...changes,
});
function fixture() {
  const database = new TransactionDatabase({
    "corporateWorkRecords/SUP-1": original(),
    "corporateStaff/staff-1": { status: "ACTIVE", memberships: [membership()] },
  });
  return { database, storage: new FirestoreCorporateStorage(database), session: identity() };
}

test("corporate commit records work, audit, delivery intent and replay receipt together", async () => {
  const { database, storage, session } = fixture();
  const result = await storage.commitWorkCommand(session, command());
  assert.equal(result.replayed, false);
  assert.equal(result.record.state, "In Review");
  assert.equal(result.record.version, 1);
  assert.equal(result.record.createdAt, original().createdAt);
  assert.equal(database.entries("corporateAuditEvents").length, 1);
  assert.equal(database.entries("corporateCommands").length, 1);
  const [[, delivery]] = database.entries("corporateDeliveryIntents");
  assert.equal(delivery.status, "PENDING");
  assert.equal(delivery.ownerTeamId, "support-intake");
  assert.equal(delivery.locationId, "HNL-014");
  const [[, event]] = database.entries("corporateAuditEvents");
  assert.equal(event.actorId, session.userId);
  assert.deepEqual(event.changes.state, { before: "Open", after: "In Review" });
});

test("identical retries do not append duplicate audit or delivery records", async () => {
  const { database, storage, session } = fixture();
  const first = await storage.commitWorkCommand(session, command());
  const retry = await storage.commitWorkCommand(session, command());
  assert.equal(retry.replayed, true);
  assert.deepEqual(retry.record, first.record);
  assert.equal(database.entries("corporateAuditEvents").length, 1);
  assert.equal(database.entries("corporateDeliveryIntents").length, 1);
  await assert.rejects(storage.commitWorkCommand(session, command({ payload: { state: "Resolved" } })), { code: "CONFLICT" });
});

test("concurrent decisions from one version produce one winner and an explicit conflict", async () => {
  const { database, storage, session } = fixture();
  const results = await Promise.allSettled([
    storage.commitWorkCommand(session, command()),
    storage.commitWorkCommand(session, command({ idempotencyKey: "support_operation_002" })),
  ]);
  assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
  const rejected = results.find(({ status }) => status === "rejected");
  assert.equal(rejected.reason.code, "CONFLICT");
  assert.equal(database.records.get("corporateWorkRecords/SUP-1").version, 1);
  assert.equal(database.entries("corporateAuditEvents").length, 1);
});

test("membership is revalidated inside the transaction, including receipt replay", async () => {
  const { database, storage, session } = fixture();
  await storage.commitWorkCommand(session, command());
  database.records.set("corporateStaff/staff-1", { status: "ACTIVE", memberships: [membership("OAH-207")] });
  await assert.rejects(storage.commitWorkCommand(session, command()), { code: "FORBIDDEN" });
  database.records.set("corporateStaff/staff-1", { status: "SUSPENDED", memberships: [membership()] });
  await assert.rejects(storage.commitWorkCommand(session, command()), { code: "UNAVAILABLE" });
  assert.equal(database.entries("corporateAuditEvents").length, 1);
});

test("domain updates cannot move work across location, organization, type or record identity", async () => {
  for (const change of [{ locationId: "OAH-207" }, { organizationId: "entity-2" }, { id: "SUP-2" }, { type: "access" }]) {
    const { database, storage, session } = fixture();
    await assert.rejects(storage.commitWorkCommand(session, command({ update: (current) => ({ ...current, ...change }) })), { code: "INVALID_COMMAND" });
    assert.deepEqual(database.records.get("corporateWorkRecords/SUP-1"), original());
    assert.equal(database.entries("corporateAuditEvents").length, 0);
  }
});

test("durable failures never return success or leave a false audit, receipt or delivery", async () => {
  const { database, storage, session } = fixture();
  database.failCommit = true;
  await assert.rejects(storage.commitWorkCommand(session, command()), /durable commit failure/);
  assert.deepEqual(database.records.get("corporateWorkRecords/SUP-1"), original());
  for (const collection of ["corporateAuditEvents", "corporateCommands", "corporateDeliveryIntents"]) {
    assert.equal(database.entries(collection).length, 0);
  }
  database.failCommit = false;
  assert.equal((await storage.commitWorkCommand(session, command())).replayed, false);
});

test("preview identities cannot enter the live storage command path", async () => {
  const { database, storage, session } = fixture();
  await assert.rejects(storage.commitWorkCommand({ ...session, isDevelopmentPreview: true }, command()), { code: "UNAVAILABLE" });
  assert.equal(database.entries("corporateCommands").length, 0);
});

test("unconfigured production storage rejects reads and writes rather than claiming empty success", async () => {
  const previous = { NODE_ENV: process.env.NODE_ENV, CORPORATE_USE_SEED_DATA: process.env.CORPORATE_USE_SEED_DATA };
  try {
    process.env.NODE_ENV = "production";
    process.env.CORPORATE_USE_SEED_DATA = "true";
    const storage = getCorporateStorage();
    assert.equal(storage.mode, "unavailable");
    for (const method of ["getOrganizations", "getLocations", "getPeople", "getResources", "listWorkRecords", "getAuditEvents", "getDeliveryIntents"]) {
      await assert.rejects(storage[method](identity()), { code: "UNAVAILABLE" });
    }
    await assert.rejects(storage.commitWorkCommand(identity(), command()), { code: "UNAVAILABLE" });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
