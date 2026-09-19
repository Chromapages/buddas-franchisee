import test from "node:test";
import assert from "node:assert/strict";
import { applySupportCommand, publicSupportTicket } from "../src/features/corporate/support/model.ts";
import { MemorySupportRepository } from "../src/features/corporate/support/repository.ts";
import { executeCorporateSupportCommand, getCorporateSupportDetail, listCorporateSupport } from "../src/features/corporate/support/service.ts";

const now = "2026-09-06T10:00:00.000Z";
const actor = { userId: "support-1", email: "support@example.invalid", displayName: "Support One", corporate: true };
const ticket = { id: "SUP-1", locationId: "UNIT-1", subject: "Delivery issue", topic: "Supplies", details: "One item missing", userEmail: "operator@example.invalid", status: "Open", version: 0, createdAt: now, updatedAt: now, operatorActionRequired: false, messages: [] };
const command = (kind, overrides = {}) => ({ commandId: "command-1", unitId: "UNIT-1", caseId: "SUP-1", expectedVersion: 0, kind, message: "Confirmed update", ...overrides });
const session = (bundle = "support_handler", unitId = "UNIT-1") => ({ userId: actor.userId, email: actor.email, displayName: actor.displayName, identityClass: "CORPORATE", expiresAt: Date.now() + 60000, isDevelopmentPreview: true, memberships: [{ id: "grant-1", bundle, status: "ACTIVE", scope: { type: "locations", locationIds: [unitId] } }] });
const repository = () => new MemorySupportRepository([{ locationId: "UNIT-1", name: "One" }, { locationId: "UNIT-2", name: "Two" }], [ticket, { ...ticket, id: "SUP-2", locationId: "UNIT-2" }]);

test("private notes never enter public conversation or operator projection", async () => {
  const repo = repository();
  await repo.execute(command("NOTE", { message: "Private investigation detail" }), actor);
  const operator = await repo.detail("UNIT-1", "SUP-1", false);
  assert.equal(operator.ticket.messages.length, 0);
  assert.deepEqual(operator.notes, []);
  assert.deepEqual(operator.events, []);
  const corporate = await repo.detail("UNIT-1", "SUP-1", true);
  assert.equal(corporate.notes[0].message, "Private investigation detail");
  const projection = publicSupportTicket("SUP-1", "UNIT-1", { ...ticket, privateNotes: ["secret"], notes: "secret", messages: [
    { id: "legacy-private", visibility: "INTERNAL", message: "secret" },
    { id: "legacy-private-2", isInternal: true, message: "secret" },
    { id: "legacy-public", message: "public", authorRole: "OPERATOR", createdAt: now, secret: "hidden" },
  ] });
  assert.equal(JSON.stringify(projection).includes("secret"), false);
  assert.equal(projection.messages.length, 1);
});

test("retries are idempotent, payload reuse and stale concurrent updates are rejected", async () => {
  const repo = repository();
  const first = await repo.execute(command("REPLY"), actor);
  const retried = await repo.execute(command("REPLY"), actor);
  assert.equal(first.version, 1);
  assert.equal(retried.replayed, true);
  await assert.rejects(repo.execute(command("REPLY", { message: "Different payload" }), actor), /different update/);
  await assert.rejects(repo.execute(command("REPLY", { commandId: "command-2" }), actor), /ticket changed/);
  assert.equal((await repo.detail("UNIT-1", "SUP-1", false)).ticket.messages.length, 1);
  assert.equal(repo.getOperationalRecords().deliveries.length, 1);
  assert.equal(repo.getOperationalRecords().events.length, 1);
});

test("public changes create a safe owned delivery intent while internal notes never notify", async () => {
  const repo = repository();
  await repo.execute(command("REPLY", { message: "Sensitive conversation body" }), actor);
  const intent = repo.getOperationalRecords().deliveries[0];
  assert.equal(intent.status, "PENDING");
  assert.equal(intent.channel, "IN_APP");
  assert.equal(intent.ownerTeamId, "operations-support");
  assert.equal(intent.summary.includes("Sensitive"), false);
  await repo.execute(command("NOTE", { commandId: "note-2", expectedVersion: 1, message: "Private detail" }), actor);
  assert.equal(repo.getOperationalRecords().deliveries.length, 1);
  assert.equal(JSON.stringify(repo.getOperationalRecords()).includes("Private detail"), false);
});

test("waiting requests an operator response and their reply returns the case to review", () => {
  const waiting = applySupportCommand(ticket, command("WAIT"), actor, now);
  assert.equal(waiting.patch.status, "Waiting");
  assert.equal(waiting.patch.operatorActionRequired, true);
  assert.equal(waiting.publicMessage.authorRole, "SUPPORT");
  const replied = applySupportCommand({ ...ticket, ...waiting.patch }, command("REPLY", { expectedVersion: 1 }), { ...actor, corporate: false, userId: "operator-2", email: "second@example.invalid" }, now);
  assert.equal(replied.patch.status, "In Review");
  assert.equal(replied.patch.operatorActionRequired, false);
  assert.equal(replied.publicMessage.authorId, "operator-2");
  assert.equal(replied.publicMessage.authorEmail, "second@example.invalid");
});

test("resolution and reopening preserve append-only reasons and enforce transition rules", async () => {
  const repo = repository();
  await repo.execute(command("RESOLVE", { message: "Replacement received" }), actor);
  await assert.rejects(repo.execute(command("REPLY", { commandId: "command-2", expectedVersion: 1 }), actor), /Reopen/);
  await repo.execute(command("REOPEN", { commandId: "command-3", expectedVersion: 1, message: "Replacement also damaged" }), actor);
  const detail = await repo.detail("UNIT-1", "SUP-1", true);
  assert.equal(detail.ticket.status, "Open");
  assert.equal(detail.ticket.messages.length, 2);
  assert.equal(detail.events.length, 2);
  assert.match(detail.ticket.messages[0].message, /Replacement received/);
  assert.throws(() => applySupportCommand(ticket, command("REOPEN"), actor, now), /Only resolved/);
});

test("corporate queues filter scope, reject cross-unit commands and keep leadership read-only", async () => {
  const repo = repository();
  assert.deepEqual((await listCorporateSupport(session(), repo)).map((item) => item.id), ["SUP-1"]);
  await assert.rejects(getCorporateSupportDetail(session(), repo, "UNIT-2", "SUP-2"), /access/);
  await assert.rejects(executeCorporateSupportCommand(session(), repo, command("REPLY", { unitId: "UNIT-2", caseId: "SUP-2" })), /access/);
  await assert.rejects(executeCorporateSupportCommand(session("leadership"), repo, command("REPLY")), /access/);
  await repo.execute(command("NOTE"), actor);
  assert.deepEqual((await getCorporateSupportDetail(session("leadership"), repo, "UNIT-1", "SUP-1")).notes, []);
});

test("assignment requires an authorized active handler and distinct assignment permission", async () => {
  const repo = repository();
  await assert.rejects(executeCorporateSupportCommand(session(), repo, command("ASSIGN", { assigneeId: actor.userId })), /access/);
  await assert.rejects(executeCorporateSupportCommand(session("operations_lead"), repo, command("ASSIGN", { assigneeId: "unknown-user" })), /active support handler/);
  await executeCorporateSupportCommand(session("operations_lead"), repo, command("ASSIGN", { assigneeId: actor.userId }));
  assert.equal((await repo.detail("UNIT-1", "SUP-1", false)).ticket.assignedToUserId, actor.userId);
});

test("operators cannot make internal notes, unknown states fail closed, and invalid commands cannot write", () => {
  assert.throws(() => applySupportCommand(ticket, command("NOTE"), { ...actor, corporate: false }, now), /Corporate support/);
  assert.throws(() => applySupportCommand({ ...ticket, status: "Unsupported" }, command("REPLY"), actor, now), /unsupported status/);
  assert.throws(() => applySupportCommand(ticket, command("REPLY", { message: "" }), actor, now), /Enter a message/);
  assert.throws(() => applySupportCommand(ticket, command("NOTE", { unitId: "OTHER" }), actor, now), /scope/);
  assert.throws(() => applySupportCommand(ticket, command("REPLY", { expectedVersion: NaN }), actor, now), /current version/);
});
