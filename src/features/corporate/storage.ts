import "server-only";
import type { Firestore } from "firebase-admin/firestore";
import { firebaseDb } from "../../lib/firebase/admin";
import { assertCorporatePermission, hasCorporatePermission, isActiveCorporateMembership, parseCorporateMemberships } from "./authorization";
import { assertCommandVersion, assertSameCommand, CorporateCommandError, digestCommandPayload, getCommandRecordId } from "./commands";
import { isCorporateSeedMode } from "./environment";
import { corporateSeedLocations, corporateSeedOrganizations, corporateSeedPeople, corporateSeedRegions, corporateSeedResources, corporateSeedWorkRecords } from "./seed-data";
import type { CorporateAuditEvent, CorporateLocation, CorporateOrganization, CorporatePermission, CorporatePerson, CorporateRegion, CorporateResource, CorporateSession, DeliveryIntent, WorkRecord } from "./types";

export type WorkCommand = {
  recordId: string;
  idempotencyKey: string;
  expectedVersion: number;
  permission: CorporatePermission;
  action: string;
  payload: Record<string, unknown>;
  /** Pure domain transition. The callback must never call an external service. */
  update: (current: WorkRecord) => WorkRecord;
  deliveries?: Array<Pick<DeliveryIntent, "recipientId" | "channel" | "summary" | "href">>;
};

export type WorkCommandResult = { record: WorkRecord; replayed: boolean };

export interface ICorporateStorage {
  readonly mode: "firestore" | "development-preview" | "unavailable";
  getOrganizations(session: CorporateSession): Promise<CorporateOrganization[]>;
  getLocations(session: CorporateSession): Promise<CorporateLocation[]>;
  getRegions(session: CorporateSession): Promise<CorporateRegion[]>;
  getPeople(session: CorporateSession): Promise<CorporatePerson[]>;
  getResources(session: CorporateSession): Promise<CorporateResource[]>;
  listWorkRecords(session: CorporateSession): Promise<WorkRecord[]>;
  getAuditEvents(session: CorporateSession): Promise<CorporateAuditEvent[]>;
  getDeliveryIntents(session: CorporateSession): Promise<DeliveryIntent[]>;
  commitWorkCommand(session: CorporateSession, command: WorkCommand): Promise<WorkCommandResult>;
}

const clean = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const workPermission = (record: WorkRecord): CorporatePermission => ({ support: "VIEW_SUPPORT", request: "VIEW_REQUESTS", order: "VIEW_ORDERS", access: "MANAGE_ACCESS", inquiry: "VIEW_INQUIRIES" } as const)[record.type];
const canReadScopedEvent = (session: CorporateSession, permission: CorporatePermission, record: CorporateAuditEvent | DeliveryIntent) => record.scopeTargets?.length
  ? record.scopeTargets.every((target) => hasCorporatePermission(session, permission, target))
  : hasCorporatePermission(session, permission, record);
const assertPreviewSession = (session: CorporateSession) => {
  if (!isCorporateSeedMode() || !session.isDevelopmentPreview) throw new CorporateCommandError("UNAVAILABLE", "Development preview storage is not enabled for this session.");
};

const supportPreviewProjection = (): { workRecords: WorkRecord[]; events: CorporateAuditEvent[]; deliveries: DeliveryIntent[] } => {
  const preview = (globalThis as typeof globalThis & { corporateSupportPreview?: { getOperationalRecords?: () => { workRecords: WorkRecord[]; events: CorporateAuditEvent[]; deliveries: DeliveryIntent[] } } }).corporateSupportPreview;
  return preview?.getOperationalRecords?.() || { workRecords: [], events: [], deliveries: [] };
};

const prepareCommand = (session: CorporateSession, command: WorkCommand, current: WorkRecord) => {
  const allowed: Record<WorkRecord["type"], CorporatePermission[]> = {
    support: ["MANAGE_SUPPORT", "ASSIGN_SUPPORT", "WRITE_INTERNAL_NOTES"],
    request: ["MANAGE_REQUESTS", "APPROVE_REQUESTS"], order: ["COORDINATE_ORDERS"], access: ["MANAGE_ACCESS"],
    inquiry: ["MANAGE_INQUIRIES", "ASSIGN_INQUIRIES", "RECORD_INQUIRY_DECISION"],
  };
  if (!allowed[current.type]?.includes(command.permission)) throw new CorporateCommandError("INVALID_COMMAND", "This capability cannot change the selected workflow.");
  assertCorporatePermission(session, command.permission, current);
  assertCommandVersion(current.version, command.expectedVersion);
  const updated = command.update(clean(current));
  // Domain commands cannot silently move a record across an authorization boundary.
  if (updated.id !== current.id || updated.type !== current.type || updated.organizationId !== current.organizationId || updated.regionId !== current.regionId || updated.locationId !== current.locationId) {
    throw new CorporateCommandError("INVALID_COMMAND", "A workflow change cannot change this record's identity or scope.");
  }
  const occurredAt = new Date().toISOString();
  const commandId = getCommandRecordId(session.userId, command.idempotencyKey);
  const record = clean({ ...updated, version: current.version + 1, createdAt: current.createdAt, updatedAt: occurredAt });
  const changes: CorporateAuditEvent["changes"] = {};
  for (const field of ["state", "assignedToUserId", "teamId", "priority", "followUpAt", "isClosed"] as const) {
    if (current[field] !== record[field]) changes[field] = { before: current[field] ?? null, after: record[field] ?? null };
  }
  const event: CorporateAuditEvent = clean({ id: commandId, recordId: record.id, recordType: record.type,
    organizationId: record.organizationId, regionId: record.regionId, locationId: record.locationId, actorId: session.userId, actorName: session.displayName,
    action: command.action, occurredAt, commandId, previousVersion: current.version, nextVersion: record.version, changes });
  const deliveries = (command.deliveries || []).map((delivery, index): DeliveryIntent => clean({
    ...delivery, id: `${commandId}-${index}`, recordId: record.id, eventId: event.id,
    organizationId: record.organizationId, regionId: record.regionId, locationId: record.locationId, status: "PENDING", attempts: 0,
    createdAt: occurredAt, ownerTeamId: record.teamId,
  }));
  return { record, event, deliveries };
};

const commandDigest = (command: WorkCommand) => digestCommandPayload({ recordId: command.recordId, expectedVersion: command.expectedVersion, action: command.action, permission: command.permission, payload: command.payload, deliveries: command.deliveries || [] });

/** Local preview uses isolated in-process data; it never writes to Firebase. */
export class InMemoryCorporateStorage implements ICorporateStorage {
  readonly mode = "development-preview" as const;
  private records = new Map(corporateSeedWorkRecords.map((record) => [record.id, clean(record)]));
  private commands = new Map<string, { digest: string; record: WorkRecord }>();
  private events: CorporateAuditEvent[] = [];
  private deliveries: DeliveryIntent[] = [];

  async getLocations(session: CorporateSession) {
    assertPreviewSession(session);
    assertCorporatePermission(session, "VIEW_DIRECTORY");
    return clean(corporateSeedLocations.filter((record) => hasCorporatePermission(session, "VIEW_DIRECTORY", { locationId: record.id, organizationId: record.organizationId, regionId: record.regionId })));
  }
  async getRegions(session: CorporateSession) {
    assertPreviewSession(session);
    assertCorporatePermission(session, "VIEW_DIRECTORY");
    return clean(corporateSeedRegions.filter((record) => hasCorporatePermission(session, "VIEW_DIRECTORY", { regionId: record.id })));
  }
  async getOrganizations(session: CorporateSession) {
    assertPreviewSession(session);
    assertCorporatePermission(session, "VIEW_DIRECTORY");
    return clean(corporateSeedOrganizations.filter((record) => hasCorporatePermission(session, "VIEW_DIRECTORY", { organizationId: record.id })));
  }
  async getPeople(session: CorporateSession) {
    assertPreviewSession(session);
    assertCorporatePermission(session, "VIEW_DIRECTORY");
    const people = [{ id: session.userId, email: session.email, displayName: session.displayName, identityClass: "CORPORATE" as const, status: "ACTIVE" as const, memberships: session.memberships, version: 1, updatedAt: new Date().toISOString() }, ...corporateSeedPeople];
    const regionalStaffIds = new Set(people.filter((person) => person.memberships.some((membership) => membership.scope.type === "regions"
      && membership.scope.regionIds.some((regionId) => hasCorporatePermission(session, "VIEW_DIRECTORY", { regionId })))).map((person) => person.id));
    return clean(people.filter((person) => person.id === session.userId || regionalStaffIds.has(person.id) || person.memberships.some((membership) => membership.scope.type === "organizations"
      && membership.scope.organizationIds.some((organizationId) => hasCorporatePermission(session, "VIEW_DIRECTORY", { organizationId })))));
  }
  async getResources(session: CorporateSession) {
    assertPreviewSession(session);
    assertCorporatePermission(session, "VIEW_RESOURCES");
    return clean(corporateSeedResources.filter((record) => hasCorporatePermission(session, "VIEW_RESOURCES", record)));
  }
  async listWorkRecords(session: CorporateSession) {
    assertPreviewSession(session);
    return clean([...this.records.values(), ...supportPreviewProjection().workRecords].filter((record) => hasCorporatePermission(session, workPermission(record), record)));
  }
  async getAuditEvents(session: CorporateSession) {
    assertPreviewSession(session);
    assertCorporatePermission(session, "VIEW_AUDIT");
    return clean([...this.events, ...supportPreviewProjection().events].filter((event) => canReadScopedEvent(session, "VIEW_AUDIT", event))).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
  async getDeliveryIntents(session: CorporateSession) {
    assertPreviewSession(session);
    assertCorporatePermission(session, "VIEW_RECOVERY");
    return clean([...this.deliveries, ...supportPreviewProjection().deliveries].filter((delivery) => canReadScopedEvent(session, "VIEW_RECOVERY", delivery)));
  }
  async commitWorkCommand(session: CorporateSession, command: WorkCommand): Promise<WorkCommandResult> {
    assertPreviewSession(session);
    const commandId = getCommandRecordId(session.userId, command.idempotencyKey);
    const digest = commandDigest(command);
    const current = this.records.get(command.recordId);
    if (!current) throw new CorporateCommandError("NOT_FOUND", "This work record is unavailable.");
    assertCorporatePermission(session, command.permission, current);
    const existing = this.commands.get(commandId);
    if (existing) { assertSameCommand(existing.digest, digest); return { record: clean(existing.record), replayed: true }; }
    // This block contains no awaits: the preview mutation is atomic within one JS process.
    const { record, event, deliveries } = prepareCommand(session, command, current);
    this.records.set(record.id, record);
    this.commands.set(commandId, { digest, record });
    this.events.push(event);
    this.deliveries.push(...deliveries);
    return { record: clean(record), replayed: false };
  }
}

export class FirestoreCorporateStorage implements ICorporateStorage {
  readonly mode = "firestore" as const;
  private database: Firestore;
  constructor(database: Firestore) { this.database = database; }

  private assertLive(session: CorporateSession) {
    if (session.isDevelopmentPreview) throw new CorporateCommandError("UNAVAILABLE", "A preview session cannot access live corporate storage.");
  }

  async getLocations(session: CorporateSession): Promise<CorporateLocation[]> {
    this.assertLive(session);
    assertCorporatePermission(session, "VIEW_DIRECTORY");
    const snapshot = await this.database.collection("units").get();
    return snapshot.docs.flatMap((doc) => {
      const data = doc.data();
      if (data.hiddenFromCorporateDirectory === true) return [];
      const organizationId = typeof data.organizationId === "string" ? data.organizationId : typeof data.franchiseEntityId === "string" ? data.franchiseEntityId : undefined;
      const regionId = typeof data.regionId === "string" ? data.regionId : undefined;
      if (!hasCorporatePermission(session, "VIEW_DIRECTORY", { locationId: doc.id, organizationId, regionId })) return [];
      const operatingStatus = ["DRAFT", "PRE_OPENING", "ACTIVE", "SUSPENDED", "CLOSED"].includes(String(data.operatingStatus))
        ? data.operatingStatus as CorporateLocation["operatingStatus"] : typeof data.storeStatus === "string" ? data.storeStatus as CorporateLocation["operatingStatus"] : "UNKNOWN";
      const verificationStatus = ["NOT_REVIEWED", "IN_REVIEW", "VERIFIED", "CHANGES_REQUIRED"].includes(String(data.verification?.status))
        ? data.verification.status as CorporateLocation["verificationStatus"] : "NOT_REVIEWED";
      return [{ id: doc.id, organizationId, regionId, name: typeof data.name === "string" ? data.name : doc.id,
        code: typeof data.code === "string" ? data.code : doc.id, market: typeof data.market === "string" ? data.market : undefined,
        status: operatingStatus || "UNKNOWN", operatingStatus, verificationStatus,
        verificationReason: typeof data.verification?.reason === "string" ? data.verification.reason : undefined,
        address: data.address && typeof data.address === "object" && typeof data.address.line1 === "string" && typeof data.address.city === "string" && typeof data.address.state === "string" && typeof data.address.country === "string" ? data.address as CorporateLocation["address"] : undefined,
        timeZone: typeof data.timeZone === "string" ? data.timeZone : undefined,
        openingDate: typeof data.openingDate === "string" ? data.openingDate : undefined,
        version: Number.isSafeInteger(data.version) ? data.version : 0 }];
    });
  }

  async getOrganizations(session: CorporateSession): Promise<CorporateOrganization[]> {
    this.assertLive(session);
    assertCorporatePermission(session, "VIEW_DIRECTORY");
    const [snapshot, locations] = await Promise.all([this.database.collection("franchiseEntities").get(), this.getLocations(session)]);
    return snapshot.docs.flatMap((doc) => {
      if (!hasCorporatePermission(session, "VIEW_DIRECTORY", { organizationId: doc.id })) return [];
      const data = doc.data();
      return [{ id: doc.id, name: typeof data.legalName === "string" ? data.legalName : doc.id,
        verificationStatus: data.verificationStatus === "VERIFIED" ? "VERIFIED" as const : "UNVERIFIED" as const,
        locationIds: locations.filter((location) => location.organizationId === doc.id).map((location) => location.id) }];
    });
  }

  async getRegions(session: CorporateSession): Promise<CorporateRegion[]> {
    this.assertLive(session);
    assertCorporatePermission(session, "VIEW_DIRECTORY");
    const snapshot = await this.database.collection("corporateRegions").get();
    return snapshot.docs.flatMap((doc) => {
      if (!hasCorporatePermission(session, "VIEW_DIRECTORY", { regionId: doc.id })) return [];
      const data = doc.data();
      return [{
        id: doc.id,
        name: typeof data.name === "string" ? data.name : doc.id,
        locationIds: Array.isArray(data.locationIds) ? data.locationIds.filter((id): id is string => typeof id === "string") : [],
        status: data.status === "INACTIVE" ? "INACTIVE" as const : "ACTIVE" as const,
      }];
    });
  }

  async getPeople(session: CorporateSession): Promise<CorporatePerson[]> {
    this.assertLive(session);
    assertCorporatePermission(session, "VIEW_DIRECTORY");
    const snapshot = await this.database.collection("corporateStaff").get();
    return snapshot.docs.flatMap((doc) => {
      const data = doc.data();
      if (data.identityClass === "OPERATOR") return [];
      const memberships = parseCorporateMemberships(data.memberships);
      // Do not expose broad staff grants to a reader whose only overlap is one location.
      const visibleMemberships = memberships.filter((membership) => membership.scope.type === "corporate"
        ? hasCorporatePermission(session, "MANAGE_ACCESS", {})
        : membership.scope.type === "organizations"
          ? membership.scope.organizationIds.every((organizationId) => hasCorporatePermission(session, "VIEW_DIRECTORY", { organizationId }))
          : membership.scope.type === "regions"
            ? membership.scope.regionIds.every((regionId) => hasCorporatePermission(session, "VIEW_DIRECTORY", { regionId }))
            : membership.scope.locationIds.every((locationId) => hasCorporatePermission(session, "VIEW_DIRECTORY", { locationId })));
      if (doc.id !== session.userId && !visibleMemberships.length) return [];
      return [{ id: doc.id, email: typeof data.email === "string" ? data.email : "", displayName: typeof data.displayName === "string" ? data.displayName : "Corporate colleague", identityClass: "CORPORATE",
        status: data.status === "SUSPENDED" ? "SUSPENDED" as const : data.status === "INVITED" ? "INVITED" as const : "ACTIVE" as const,
        memberships: doc.id === session.userId ? memberships : visibleMemberships, version: Number.isSafeInteger(data.version) ? data.version : 1,
        updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : "" }];
    });
  }

  async getResources(session: CorporateSession): Promise<CorporateResource[]> {
    this.assertLive(session);
    assertCorporatePermission(session, "VIEW_RESOURCES");
    const snapshot = await this.database.collection("corporateResources").get();
    return snapshot.docs.flatMap((doc) => {
      const data = doc.data();
      const record = { ...data, id: doc.id } as CorporateResource;
      if (!hasCorporatePermission(session, "VIEW_RESOURCES", record) || typeof record.title !== "string") return [];
      return [{ id: doc.id, organizationId: record.organizationId, regionId: record.regionId, locationId: record.locationId, title: record.title,
        category: record.category || "Resources", version: record.version || "", state: record.state,
        ownerName: record.ownerName || "Unassigned", updatedAt: record.updatedAt || "" }];
    });
  }

  async listWorkRecords(session: CorporateSession): Promise<WorkRecord[]> {
    this.assertLive(session);
    const snapshot = await this.database.collection("corporateWorkRecords").get();
    return snapshot.docs.flatMap((doc) => {
      const record = { ...doc.data(), id: doc.id } as WorkRecord;
      return ["support", "request", "order", "access", "inquiry"].includes(record.type) && hasCorporatePermission(session, workPermission(record), record) ? [record] : [];
    });
  }

  async getAuditEvents(session: CorporateSession): Promise<CorporateAuditEvent[]> {
    this.assertLive(session);
    assertCorporatePermission(session, "VIEW_AUDIT");
    const snapshot = await this.database.collection("corporateAuditEvents").orderBy("occurredAt", "desc").get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as CorporateAuditEvent).filter((event) => canReadScopedEvent(session, "VIEW_AUDIT", event));
  }

  async getDeliveryIntents(session: CorporateSession): Promise<DeliveryIntent[]> {
    this.assertLive(session);
    assertCorporatePermission(session, "VIEW_RECOVERY");
    const snapshot = await this.database.collection("corporateDeliveryIntents").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as DeliveryIntent).filter((delivery) => canReadScopedEvent(session, "VIEW_RECOVERY", delivery));
  }

  async commitWorkCommand(session: CorporateSession, command: WorkCommand): Promise<WorkCommandResult> {
    this.assertLive(session);
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(command.recordId)) throw new CorporateCommandError("INVALID_COMMAND", "Invalid work record reference.");
    const commandId = getCommandRecordId(session.userId, command.idempotencyKey);
    const digest = commandDigest(command);
    const recordRef = this.database.collection("corporateWorkRecords").doc(command.recordId);
    const commandRef = this.database.collection("corporateCommands").doc(commandId);
    return this.database.runTransaction(async (transaction) => {
      const [recordDoc, commandDoc, staffDoc] = await transaction.getAll(recordRef, commandRef, this.database.collection("corporateStaff").doc(session.userId));
      const staff = staffDoc.data();
      if (!staff || staff.status !== "ACTIVE") throw new CorporateCommandError("UNAVAILABLE", "Corporate access changed. Sign in again to continue.");
      const currentSession = { ...session, memberships: parseCorporateMemberships(staff.memberships).filter((membership) => isActiveCorporateMembership(membership)) };
      if (!recordDoc.exists) throw new CorporateCommandError("NOT_FOUND", "This work record is unavailable.");
      const current = { ...recordDoc.data(), id: recordDoc.id } as WorkRecord;
      assertCorporatePermission(currentSession, command.permission, current);
      if (commandDoc.exists) {
        const previous = commandDoc.data() as { digest: string; record: WorkRecord };
        assertSameCommand(previous.digest, digest);
        return { record: previous.record, replayed: true };
      }
      const { record, event, deliveries } = prepareCommand(currentSession, command, current);
      transaction.set(recordRef, record);
      transaction.create(commandRef, { digest, record, actorId: session.userId, createdAt: event.occurredAt });
      transaction.create(this.database.collection("corporateAuditEvents").doc(event.id), event);
      for (const delivery of deliveries) transaction.create(this.database.collection("corporateDeliveryIntents").doc(delivery.id), delivery);
      return { record, replayed: false };
    });
  }
}

class UnavailableCorporateStorage implements ICorporateStorage {
  readonly mode = "unavailable" as const;
  private fail(): never { throw new CorporateCommandError("UNAVAILABLE", "Corporate storage is not configured. No operating records were loaded or changed."); }
  async getOrganizations(): Promise<CorporateOrganization[]> { return this.fail(); }
  async getLocations(): Promise<CorporateLocation[]> { return this.fail(); }
  async getRegions(): Promise<CorporateRegion[]> { return this.fail(); }
  async getPeople(): Promise<CorporatePerson[]> { return this.fail(); }
  async getResources(): Promise<CorporateResource[]> { return this.fail(); }
  async listWorkRecords(): Promise<WorkRecord[]> { return this.fail(); }
  async getAuditEvents(): Promise<CorporateAuditEvent[]> { return this.fail(); }
  async getDeliveryIntents(): Promise<DeliveryIntent[]> { return this.fail(); }
  async commitWorkCommand(): Promise<WorkCommandResult> { return this.fail(); }
}

const previewStorage = new InMemoryCorporateStorage();
const unavailableStorage = new UnavailableCorporateStorage();
export const getCorporateStorage = (): ICorporateStorage => isCorporateSeedMode() ? previewStorage
  : firebaseDb ? new FirestoreCorporateStorage(firebaseDb) : unavailableStorage;
