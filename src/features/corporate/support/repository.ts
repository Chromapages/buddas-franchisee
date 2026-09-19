import { createHash } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import type { PortalSupportCase, PortalSupportMessage } from "../../portal/types.ts";
import type { CorporateAuditEvent, DeliveryIntent, WorkRecord } from "../types.ts";
import { assertCorporatePermission, parseCorporateMemberships } from "../authorization.ts";
import { applySupportCommand, publicSupportTicket, validateSupportCommand, type SupportActor, type SupportCommand, type SupportDetail, type SupportEvent, type SupportPrivateNote } from "./model.ts";

export type SupportScope = { locationId: string; organizationId?: string; regionId?: string };
export type SupportReceipt = { version: number; replayed: boolean };
export interface SupportRepository {
  locations(): Promise<Array<SupportScope & { name: string }>>;
  detail(unitId: string, caseId: string, includePrivate: boolean): Promise<SupportDetail | null>;
  list(unitId: string): Promise<PortalSupportCase[]>;
  execute(command: SupportCommand, actor: SupportActor): Promise<SupportReceipt>;
}

const commandDigest = (command: SupportCommand, actor: SupportActor) => createHash("sha256").update(JSON.stringify({ userId: actor.userId, corporate: actor.corporate, unitId: command.unitId, caseId: command.caseId, expectedVersion: command.expectedVersion, kind: command.kind, message: command.message?.trim() || "", assigneeId: command.assigneeId || "" })).digest("hex");
const pathPart = (value: string) => { if (!/^[A-Za-z0-9_-]{1,128}$/.test(value)) throw new Error("Invalid support reference."); return value; };

export function supportOperationalRecords(ticket: PortalSupportCase, command: SupportCommand, actor: SupportActor, event: SupportEvent, scope: SupportScope & { name?: string }) {
  const recordId = `support-${ticket.locationId}-${ticket.id}`;
  const eventId = `${recordId}-${command.commandId}`;
  const target = { locationId: ticket.locationId, ...(scope.organizationId ? { organizationId: scope.organizationId } : {}), ...(scope.regionId ? { regionId: scope.regionId } : {}) };
  const workRecord: WorkRecord = {
    id: recordId, reference: ticket.id, type: "support", subject: ticket.subject, ...target, locationName: scope.name || ticket.locationId,
    state: ticket.status, isClosed: ticket.status === "Resolved", teamId: "operations-support", priority: ticket.operationalImpact === "Normal operations are blocked" ? "URGENT" : ticket.operationalImpact === "Operations are slowed" ? "HIGH" : "NORMAL",
    assignedToUserId: ticket.assignedToUserId || "", nextAction: ticket.status === "Resolved" ? "No action required" : ticket.operatorActionRequired ? "Await operator response" : "Review support case",
    createdAt: ticket.createdAt, updatedAt: ticket.updatedAt, version: ticket.version || 0,
    href: `/corporate/support/${encodeURIComponent(ticket.id)}?unitId=${encodeURIComponent(ticket.locationId)}`,
  };
  const auditEvent: CorporateAuditEvent = {
    id: eventId, recordId, recordType: "support", ...target, actorId: actor.userId, actorName: actor.displayName || actor.email,
    action: `SUPPORT_${command.kind}`, occurredAt: event.createdAt, commandId: command.commandId, previousVersion: command.expectedVersion, nextVersion: event.version,
    changes: { state: { before: event.previousStatus, after: event.status }, ...(command.kind === "ASSIGN" ? { assignedToUserId: { before: event.previousAssigneeId || null, after: event.assignedToUserId || null } } : {}) },
  };
  const deliveries: DeliveryIntent[] = ["REPLY", "WAIT", "RESOLVE", "REOPEN"].includes(command.kind) ? [{
    id: `${eventId}-notification`, recordId, eventId, ...target,
    recipientId: actor.corporate ? ticket.submittedByUserId || ticket.userEmail : ticket.assignedToUserId || "operations-support",
    channel: "IN_APP", status: "PENDING", attempts: 0, createdAt: event.createdAt, ownerTeamId: "operations-support",
    summary: `Support case ${ticket.id} has a recorded update.`,
    href: actor.corporate ? `/portal/support?ticketId=${encodeURIComponent(ticket.id)}` : workRecord.href,
  }] : [];
  return { workRecord, auditEvent, deliveries };
}

export class FirestoreSupportRepository implements SupportRepository {
  private readonly database: Firestore;
  constructor(database: Firestore) { this.database = database; }
  private ticket(unitId: string, caseId: string) { return this.database.collection("units").doc(pathPart(unitId)).collection("supportTickets").doc(pathPart(caseId)); }
  async locations() {
    const snapshot = await this.database.collection("units").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const organizationId = typeof data.organizationId === "string" ? data.organizationId : typeof data.franchiseEntityId === "string" ? data.franchiseEntityId : undefined;
      const regionId = typeof data.regionId === "string" ? data.regionId : undefined;
      return { locationId: doc.id, name: String(data.name || doc.id), ...(organizationId ? { organizationId } : {}), ...(regionId ? { regionId } : {}) };
    });
  }
  async list(unitId: string) {
    const snapshot = await this.database.collection("units").doc(pathPart(unitId)).collection("supportTickets").orderBy("updatedAt", "desc").get();
    return snapshot.docs.map((doc) => publicSupportTicket(doc.id, unitId, doc.data()));
  }
  async detail(unitId: string, caseId: string, includePrivate: boolean): Promise<SupportDetail | null> {
    const ref = this.ticket(unitId, caseId);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const messages = await ref.collection("publicMessages").orderBy("createdAt", "asc").get();
    const notes = includePrivate ? await ref.collection("privateNotes").orderBy("createdAt", "asc").get() : null;
    const events = includePrivate ? await ref.collection("events").orderBy("version", "asc").get() : null;
    return { ticket: publicSupportTicket(caseId, unitId, doc.data()!, messages.docs.map((entry) => ({ ...entry.data(), id: entry.id }) as PortalSupportMessage)), notes: notes?.docs.map((entry) => ({ ...entry.data(), id: entry.id }) as SupportPrivateNote) || [], events: events?.docs.map((entry) => ({ ...entry.data(), id: entry.id }) as SupportEvent) || [] };
  }
  async execute(command: SupportCommand, actor: SupportActor): Promise<SupportReceipt> {
    validateSupportCommand(command);
    const ref = this.ticket(command.unitId, command.caseId);
    const receipt = ref.collection("commandReceipts").doc(command.commandId);
    const digest = commandDigest(command, actor);
    return this.database.runTransaction(async (tx) => {
      const [current, previous, unit, actorRecord] = await Promise.all([tx.get(ref), tx.get(receipt), tx.get(this.database.collection("units").doc(command.unitId)), tx.get(this.database.collection(actor.corporate ? "corporateStaff" : "operators").doc(pathPart(actor.userId)))]);
      const unitData = unit.data() || {};
      const organizationId = typeof unitData.organizationId === "string" ? unitData.organizationId : typeof unitData.franchiseEntityId === "string" ? unitData.franchiseEntityId : undefined;
      const regionId = typeof unitData.regionId === "string" ? unitData.regionId : undefined;
      const scope = { locationId: command.unitId, ...(organizationId ? { organizationId } : {}), ...(regionId ? { regionId } : {}) };
      const actorData = actorRecord.data();
      if (!unit.exists || !actorData) throw new Error("Support access is no longer available.");
      if (actor.corporate) {
        if (actorData.identityClass === "OPERATOR" || actorData.status !== "ACTIVE") throw new Error("Corporate support access is no longer active.");
        const currentSession = { userId: actor.userId, email: actor.email, displayName: actor.displayName || actor.email, identityClass: "CORPORATE" as const, expiresAt: Date.now() + 60000, memberships: parseCorporateMemberships(actorData.memberships), isDevelopmentPreview: false };
        assertCorporatePermission(currentSession, command.kind === "NOTE" ? "WRITE_INTERNAL_NOTES" : command.kind === "ASSIGN" ? "ASSIGN_SUPPORT" : "MANAGE_SUPPORT", scope);
        if (command.kind === "ASSIGN" && command.assigneeId) {
          const assignee = (await tx.get(this.database.collection("corporateStaff").doc(pathPart(command.assigneeId)))).data();
          if (!assignee || assignee.status !== "ACTIVE" || typeof assignee.email !== "string" || !assignee.email) throw new Error("The selected support handler is no longer active.");
          assertCorporatePermission({ ...currentSession, userId: command.assigneeId, email: assignee.email, memberships: parseCorporateMemberships(assignee.memberships) }, "MANAGE_SUPPORT", scope);
        }
      } else if (actorData.status === "SUSPENDED" || actorData.status === "DISABLED" || !Array.isArray(actorData.managedUnitIds) || !actorData.managedUnitIds.includes(command.unitId) || actorData.activeUnitId !== command.unitId) {
        throw new Error("Your working unit or support access changed. Reload before submitting.");
      }
      if (previous.exists) {
        if (previous.data()?.digest !== digest) throw new Error("That command reference was already used for a different update.");
        return { version: Number(previous.data()?.version), replayed: true };
      }
      if (!current.exists) throw new Error("Support ticket was not found.");
      const now = new Date().toISOString();
      const ticket = publicSupportTicket(current.id, command.unitId, current.data()!);
      const effect = applySupportCommand(ticket, command, actor, now);
      const operational = supportOperationalRecords({ ...ticket, ...effect.patch }, command, actor, effect.event, { locationId: command.unitId, name: String(unitData.name || command.unitId), ...(organizationId ? { organizationId } : {}), ...(regionId ? { regionId } : {}) });
      tx.update(ref, effect.patch);
      if (effect.publicMessage) tx.create(ref.collection("publicMessages").doc(command.commandId), effect.publicMessage);
      if (effect.privateNote) tx.create(ref.collection("privateNotes").doc(command.commandId), effect.privateNote);
      tx.create(ref.collection("events").doc(command.commandId), effect.event);
      tx.create(receipt, { digest, actorId: actor.userId, version: effect.event.version, createdAt: now });
      tx.set(this.database.collection("corporateWorkRecords").doc(operational.workRecord.id), operational.workRecord);
      tx.create(this.database.collection("corporateAuditEvents").doc(operational.auditEvent.id), operational.auditEvent);
      for (const delivery of operational.deliveries) tx.create(this.database.collection("corporateDeliveryIntents").doc(delivery.id), delivery);
      return { version: effect.event.version, replayed: false };
    });
  }
}

/** Explicit local preview store; never selected as a production fallback. */
export class MemorySupportRepository implements SupportRepository {
  private tickets = new Map<string, SupportDetail>();
  private receipts = new Map<string, { digest: string; version: number }>();
  private workRecords = new Map<string, WorkRecord>();
  private events: CorporateAuditEvent[] = [];
  private deliveries: DeliveryIntent[] = [];
  private readonly units: Array<SupportScope & { name: string }>;
  constructor(units: Array<SupportScope & { name: string }>, tickets: PortalSupportCase[]) {
    this.units = units;
    for (const ticket of tickets) {
      this.tickets.set(`${ticket.locationId}/${ticket.id}`, { ticket: structuredClone(ticket), notes: [], events: [] });
      const command: SupportCommand = { commandId: "initial", unitId: ticket.locationId, caseId: ticket.id, expectedVersion: ticket.version || 0, kind: "REVIEW" };
      const event: SupportEvent = { id: "initial", kind: "REVIEW", actorId: "", actorName: "", createdAt: ticket.createdAt, version: ticket.version || 0, previousStatus: ticket.status, status: ticket.status };
      const { workRecord } = supportOperationalRecords(ticket, command, { userId: "", email: "", corporate: true }, event, units.find((unit) => unit.locationId === ticket.locationId)!);
      this.workRecords.set(workRecord.id, workRecord);
    }
  }
  async locations() { return structuredClone(this.units); }
  getOperationalRecords() { return structuredClone({ workRecords: [...this.workRecords.values()], events: this.events, deliveries: this.deliveries }); }
  async list(unitId: string) { return [...this.tickets.values()].filter(({ ticket }) => ticket.locationId === unitId).map(({ ticket }) => structuredClone(ticket)); }
  async detail(unitId: string, caseId: string, includePrivate: boolean) {
    const current = this.tickets.get(`${unitId}/${caseId}`);
    return current ? { ticket: structuredClone(current.ticket), notes: includePrivate ? structuredClone(current.notes) : [], events: includePrivate ? structuredClone(current.events) : [] } : null;
  }
  async execute(command: SupportCommand, actor: SupportActor): Promise<SupportReceipt> {
    validateSupportCommand(command);
    const key = `${command.unitId}/${command.caseId}`;
    const receiptKey = `${key}/${command.commandId}`;
    const digest = commandDigest(command, actor);
    const previous = this.receipts.get(receiptKey);
    if (previous) {
      if (previous.digest !== digest) throw new Error("That command reference was already used for a different update.");
      return { version: previous.version, replayed: true };
    }
    const current = this.tickets.get(key);
    if (!current) throw new Error("Support ticket was not found.");
    const effect = applySupportCommand(current.ticket, command, actor, new Date().toISOString());
    current.ticket = { ...current.ticket, ...effect.patch, messages: [...(current.ticket.messages || []), ...(effect.publicMessage ? [effect.publicMessage] : [])] };
    if (effect.privateNote) current.notes.push(effect.privateNote);
    current.events.push(effect.event);
    const operational = supportOperationalRecords(current.ticket, command, actor, effect.event, this.units.find((unit) => unit.locationId === command.unitId)!);
    this.workRecords.set(operational.workRecord.id, operational.workRecord);
    this.events.push(operational.auditEvent);
    this.deliveries.push(...operational.deliveries);
    this.receipts.set(receiptKey, { digest, version: effect.event.version });
    return { version: effect.event.version, replayed: false };
  }
}
