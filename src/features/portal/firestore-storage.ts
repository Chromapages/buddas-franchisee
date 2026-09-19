import { FirestoreSupportRepository, supportOperationalRecords } from "../corporate/support/repository.ts";
import { firebaseDb } from "../../lib/firebase/admin.ts";
import type { IPortalStorage } from "./storage-adapter.ts";
import type {
  PortalBulletin,
  PortalLocation,
  PortalOrder,
  PortalProduct,
  PortalResource,
  PortalRole,
  PortalSupportCase,
  TargetingEvaluation,
} from "./types.ts";
import { getVisibleBulletins } from "./bulletins.ts";
import { buildAudienceContext, evaluateAudienceTargeting } from "./targeting.ts";
import type { PortalSession } from "../../lib/auth/auth-provider.ts";
import { canTransitionOrderStatus, normalizeOrderStatus } from "./order-status.ts";
import { getComposedCatalogForLocation } from "../catalog/master-catalog.ts";

const db = () => { if (!firebaseDb) throw new Error("Firestore is not configured."); return firebaseDb; };
const records = <T>(snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }): T[] => snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as T);

export class FirestorePortalStorage implements IPortalStorage {
  async getLocations(): Promise<PortalLocation[]> { return records<PortalLocation>(await db().collection("units").get()); }
  async getLocationById(id: string): Promise<PortalLocation | null> { const document = await db().collection("units").doc(id).get(); return document.exists ? ({ id: document.id, ...document.data() } as PortalLocation) : null; }
  async getProductsByLocation(locationId: string): Promise<PortalProduct[]> { return getComposedCatalogForLocation(db(), locationId, { includeUnavailable: true }); }
  async getOrdersByLocation(locationId: string): Promise<PortalOrder[]> {
    return records<Omit<PortalOrder, "status"> & { status: unknown }>(await db().collection("units").doc(locationId).collection("orders").orderBy("createdAt", "desc").get())
      .map((order) => ({ ...order, status: normalizeOrderStatus(order.status) }));
  }
  async getOrderById(orderId: string, locationId: string): Promise<PortalOrder | null> {
    const doc = await db().collection("units").doc(locationId).collection("orders").doc(orderId).get();
    if (!doc.exists) return null;
    const order = { id: doc.id, ...doc.data() } as Omit<PortalOrder, "status"> & { status: unknown };
    return order.locationId === locationId ? { ...order, status: normalizeOrderStatus(order.status) } : null;
  }
  async createOrder(order: PortalOrder): Promise<void> {
    const database = db();
    const orderRef = database.collection("units").doc(order.locationId).collection("orders").doc(order.id);
    const deliveryRef = database.collection("supplierOrderDeliveries").doc(`${order.locationId}__${order.id}`);
    const auditRef = database.collection("corporateAuditEvents").doc(`order-submitted-${order.locationId}-${order.id}`);
    await database.runTransaction(async (transaction) => {
      const existing = await transaction.get(orderRef);
      if (existing.exists) throw new Error("Order reference already exists.");
      transaction.create(orderRef, { ...order, procurement: { version: 0 }, updatedAt: order.createdAt });
      transaction.create(deliveryRef, { locationId: order.locationId, orderId: order.id, state: "QUEUED", attempts: 0, createdAt: order.createdAt, idempotencyKey: `${order.locationId}:${order.id}` });
      transaction.create(auditRef, { actorId: "operator", action: "SUPPLY_ORDER_SUBMITTED", outcome: "SUCCESS", targetType: "portal_order", targetId: order.id, locationId: order.locationId, occurredAt: order.createdAt, changedFields: ["status", "items", "procurement.version"] });
    });
  }
  async cancelOrder(orderId: string, _reason: string | undefined, locationId: string): Promise<PortalOrder | null> {
    const order = await this.getOrderById(orderId, locationId);
    if (!order) return null;
    const reference = db().collection("units").doc(order.locationId).collection("orders").doc(orderId);
    await db().runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (!current.exists || !canTransitionOrderStatus(normalizeOrderStatus(current.data()?.status), "CANCELLATION_REQUESTED")) {
        throw new Error("The order changed before the cancellation request was recorded.");
      }
      transaction.update(reference, { status: "CANCELLATION_REQUESTED", cancellationRequestedAt: new Date().toISOString(), cancellationReason: _reason || "Operator cancellation requested" });
    });
    return { ...order, status: "CANCELLATION_REQUESTED" };
  }
  async getResourcesByLocation(locationId: string, role: PortalRole = "franchisee"): Promise<PortalResource[]> {
    const [raw, location] = await Promise.all([
      records<PortalResource>(await db().collection("units").doc(locationId).collection("resources").get()),
      this.getLocationById(locationId),
    ]);
    const context = location ? buildAudienceContext(location, role) : { unitId: locationId, role };
    return raw.filter((resource) =>
      (!resource.locationScope || resource.locationScope.includes(locationId))
      && evaluateAudienceTargeting(resource.audience, context).isTargeted,
    );
  }
  async getSupportCasesByLocation(locationId: string): Promise<PortalSupportCase[]> {
    const repository = new FirestoreSupportRepository(db());
    const tickets = await repository.list(locationId);
    return Promise.all(tickets.map(async (ticket) => (await repository.detail(locationId, ticket.id, false))!.ticket));
  }
  async getSupportCaseById(caseId: string, locationId: string): Promise<PortalSupportCase | null> {
    return (await new FirestoreSupportRepository(db()).detail(locationId, caseId, false))?.ticket || null;
  }
  async createSupportCase(ticket: { id: string; locationId: string; userEmail: string; submittedByUserId?: string; subject: string; topic: string; details: string; operationalImpact?: PortalSupportCase["operationalImpact"]; relatedOrderId?: string }): Promise<void> {
    const ref = db().collection("units").doc(ticket.locationId).collection("supportTickets").doc(ticket.id);
    await db().runTransaction(async (transaction) => {
      if (!ticket.submittedByUserId) throw new Error("A verified operator is required to create a support ticket.");
      const [existing, unit, operator] = await Promise.all([
        transaction.get(ref),
        transaction.get(db().collection("units").doc(ticket.locationId)),
        transaction.get(db().collection("operators").doc(ticket.submittedByUserId)),
      ]);
      const operatorData = operator.data();
      if (!unit.exists || !operator.exists || operatorData?.status === "SUSPENDED" || operatorData?.status === "DISABLED"
        || !Array.isArray(operatorData?.managedUnitIds) || !operatorData.managedUnitIds.includes(ticket.locationId)
        || operatorData.activeUnitId !== ticket.locationId) {
        throw new Error("Operator scope changed before the support request was recorded.");
      }
      if (existing.exists) {
        const recorded = existing.data()!;
        if (recorded.submittedByUserId !== ticket.submittedByUserId || recorded.subject !== ticket.subject || recorded.topic !== ticket.topic || recorded.details !== ticket.details || recorded.operationalImpact !== ticket.operationalImpact || recorded.relatedOrderId !== ticket.relatedOrderId) throw new Error("This ticket reference was already used for a different request.");
        return;
      }
      const now = new Date().toISOString();
      const record: PortalSupportCase = { ...ticket, status: "Open", version: 0, operatorActionRequired: false, createdAt: now, updatedAt: now };
      const unitData = unit.data() || {};
      const organizationId = typeof unitData.organizationId === "string" ? unitData.organizationId : typeof unitData.franchiseEntityId === "string" ? unitData.franchiseEntityId : undefined;
      const regionId = typeof unitData.regionId === "string" ? unitData.regionId : undefined;
      const operational = supportOperationalRecords(record, { commandId: "created", unitId: ticket.locationId, caseId: ticket.id, expectedVersion: 0, kind: "REVIEW" }, { userId: ticket.submittedByUserId || "", email: ticket.userEmail, corporate: false }, { id: "created", kind: "REVIEW", actorId: ticket.submittedByUserId || "", actorName: ticket.userEmail, createdAt: now, version: 0, previousStatus: "", status: "Open" }, { locationId: ticket.locationId, name: String(unitData.name || ticket.locationId), ...(organizationId ? { organizationId } : {}), ...(regionId ? { regionId } : {}) });
      transaction.create(ref, record);
      transaction.create(ref.collection("publicMessages").doc("initial"), { id: "initial", caseId: ticket.id, locationId: ticket.locationId, authorId: ticket.submittedByUserId || "", authorEmail: ticket.userEmail, authorRole: "OPERATOR", message: ticket.details, createdAt: now });
      transaction.create(db().collection("corporateWorkRecords").doc(operational.workRecord.id), operational.workRecord);
      transaction.create(db().collection("corporateAuditEvents").doc(operational.auditEvent.id), { ...operational.auditEvent, action: "SUPPORT_CREATED", previousVersion: null });
      const deliveryId = `${operational.auditEvent.id}-notification`;
      transaction.create(db().collection("corporateDeliveryIntents").doc(deliveryId), { id: deliveryId, recordId: operational.workRecord.id, eventId: operational.auditEvent.id, locationId: ticket.locationId, ...(organizationId ? { organizationId } : {}), ...(regionId ? { regionId } : {}), recipientId: "operations-support", channel: "IN_APP", status: "PENDING", attempts: 0, createdAt: now, ownerTeamId: "operations-support", summary: `Support case ${ticket.id} has been created.`, href: operational.workRecord.href });
    });
  }
  async updateSupportCaseStatus(): Promise<void> { throw new Error("Use an authenticated, versioned support command."); }
  async replySupportCase(): Promise<PortalSupportCase | null> { throw new Error("Use an authenticated, versioned support command."); }
  async closeSupportCase(): Promise<PortalSupportCase | null> { throw new Error("Use an authenticated, versioned support command."); }
  async reopenSupportCase(): Promise<PortalSupportCase | null> { throw new Error("Use an authenticated, versioned support command."); }
  async getBulletinsForSession(session: PortalSession): Promise<PortalBulletin[]> {
    const raw = await records<PortalBulletin>(await db().collection("bulletins").get());
    const locDoc = await db().collection("units").doc(session.locationId).get();
    const location = locDoc.exists ? ({ id: locDoc.id, ...locDoc.data() } as PortalLocation) : undefined;
    const context = location
      ? buildAudienceContext(location, session.role)
      : { unitId: session.locationId, role: session.role };
    const visible = getVisibleBulletins(raw, context);
    const acknowledgements = await Promise.all(visible.map(async (bulletin) => {
      const acknowledgement = await db().collection("bulletins").doc(bulletin.id).collection("acknowledgements").doc(session.userId).get();
      const acknowledgedAt = acknowledgement.data()?.acknowledgedAt;
      return typeof acknowledgedAt === "string" ? [bulletin.id, acknowledgedAt] as const : null;
    }));
    const acknowledgedById = new Map(acknowledgements.flatMap((entry) => entry ? [entry] : []));
    return visible.map((bulletin) => {
      const acknowledgedAt = acknowledgedById.get(bulletin.id);
      return acknowledgedAt ? { ...bulletin, currentUserState: { ...bulletin.currentUserState, acknowledgedAt } } : bulletin;
    });
  }
  async acknowledgeBulletin(bulletinId: string, userId: string): Promise<string> {
    const acknowledgedAt = new Date().toISOString();
    await db().collection("bulletins").doc(bulletinId).collection("acknowledgements").doc(userId).set({ acknowledgedAt });
    return acknowledgedAt;
  }
  async explainBulletinForUnit(bulletinId: string, locationId: string, role: PortalRole = "franchisee"): Promise<TargetingEvaluation | null> {
    const doc = await db().collection("bulletins").doc(bulletinId).get();
    if (!doc.exists) return null;
    const bulletin = { id: doc.id, ...doc.data() } as PortalBulletin;
    const locDoc = await db().collection("units").doc(locationId).get();
    const location = locDoc.exists ? ({ id: locDoc.id, ...locDoc.data() } as PortalLocation) : undefined;
    const context = location ? buildAudienceContext(location, role) : { unitId: locationId, role };
    return evaluateAudienceTargeting(bulletin.audience, context);
  }
  async explainResourceForUnit(resourceId: string, locationId: string, role: PortalRole = "franchisee"): Promise<TargetingEvaluation | null> {
    const doc = await db().collection("units").doc(locationId).collection("resources").doc(resourceId).get();
    if (!doc.exists) return null;
    const resource = { id: doc.id, ...doc.data() } as PortalResource;
    const locDoc = await db().collection("units").doc(locationId).get();
    const location = locDoc.exists ? ({ id: locDoc.id, ...locDoc.data() } as PortalLocation) : undefined;
    const context = location ? buildAudienceContext(location, role) : { unitId: locationId, role };
    return evaluateAudienceTargeting(resource.audience, context);
  }
}
