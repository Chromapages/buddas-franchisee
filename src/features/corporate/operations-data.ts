import "server-only";

import type { QuerySnapshot } from "firebase-admin/firestore";
import { firebaseDb } from "../../lib/firebase/admin";
import { CORPORATE_BUNDLE_PERMISSIONS, hasCorporatePermission, isActiveCorporateMembership } from "./authorization";
import { isCorporateSeedMode } from "./environment";
import type { CorporateSession, WorkRecord } from "./types";
import type { CorporateOrder } from "./orders/types";
import type { CorporateRequest } from "./requests/types";
import { isExpansionStatus } from "../portal/expansion-status";
import type { PortalOrder } from "../portal/types";

const safeText = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const safeDate = (value: unknown): string => {
  const text = safeText(value);
  return Number.isFinite(Date.parse(text)) ? text : new Date(0).toISOString();
};
const pathPart = (value: string): string => {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(value)) throw new Error("Invalid corporate record reference.");
  return value;
};

type ReadableOrderLocation = { id: string; organizationId?: string; regionId?: string; name: string };

async function getReadableOrderLocations(session: CorporateSession): Promise<ReadableOrderLocation[]> {
  if (!firebaseDb) throw new Error("Corporate order records are not configured.");
  const snapshot = await firebaseDb.collection("units").get();
  return snapshot.docs.flatMap((doc) => {
    const data = doc.data();
    const organizationId = safeText(data.organizationId || data.franchiseEntityId) || undefined;
    const regionId = safeText(data.regionId) || undefined;
    if (!hasCorporatePermission(session, "VIEW_ORDERS", { locationId: doc.id, organizationId, regionId })) return [];
    return [{ id: doc.id, organizationId, regionId, name: safeText(data.name) || doc.id }];
  });
}

const orderFromPortal = (order: PortalOrder, location: ReadableOrderLocation): CorporateOrder => {
  const portalStatus = safeText(order.status);
  const supplier = order.procurement?.supplier;
  const reconciliation = order.procurement?.reconciliation;
  const cancelled = portalStatus === "CANCELLED";
  const cancellationRequested = portalStatus === "CANCELLATION_REQUESTED";
  return {
    id: `${location.id}:${order.id}`,
    sourceOrderId: order.id,
    organizationId: location.organizationId,
    regionId: location.regionId,
    locationId: location.id,
    locationName: location.name,
    createdAt: safeDate(order.createdAt),
    updatedAt: safeDate(reconciliation?.reconciledAt || supplier?.recordedAt || order.createdAt),
    acceptanceState: supplier ? "accepted" : portalStatus === "PENDING" ? "pending_review" : "received",
    fulfillmentState: "unknown",
    paymentState: "unknown",
    integrationState: reconciliation ? "reconciled" : supplier ? "acknowledged" : "unknown_outcome",
    cancellationState: cancelled ? "under_review" : cancellationRequested ? "requested" : "not_requested",
    lines: order.items.map((item) => ({ sku: item.sku, name: item.name, orderedQuantity: item.quantity, acceptedQuantity: supplier?.acceptedQuantities[item.sku], shippedQuantity: 0, deliveredQuantity: 0, cancelledQuantity: 0, unitPrice: item.price })),
    sourceFreshness: ["acceptance", "fulfillment", "payment", "integration", "cancellation"].map((source) => ({ source: source as CorporateOrder["sourceFreshness"][number]["source"], observedAt: source === "acceptance" || source === "integration" ? reconciliation?.reconciledAt || supplier?.acknowledgedAt : undefined, freshness: source === "acceptance" || source === "integration" ? (supplier ? "fresh" as const : "unknown" as const) : "unknown" as const })),
    recoveryActions: reconciliation ? [] : supplier ? [{ label: "Reconcile supplier acknowledgment", description: "Compare the supplier acknowledgment with the submitted order and record the reconciliation outcome." }] : [{ label: "Record supplier acknowledgment", description: `Portal status is ${portalStatus || "unknown"}. Supplier acceptance has not been recorded.` }],
    portalStatus,
    supplierLabel: supplier?.supplierName,
    acceptanceReference: supplier?.acknowledgmentReference,
    integrationReference: supplier?.systemOfRecord,
    procurementVersion: order.procurement?.version || 0,
    supplierAcknowledgedAt: supplier?.acknowledgedAt,
    reconciledAt: reconciliation?.reconciledAt,
    reconciliationStatus: reconciliation?.status,
    reconciliationNote: reconciliation?.note,
  };
};

const readPortalOrder = (id: string, data: Record<string, unknown>, location: ReadableOrderLocation): CorporateOrder | null => {
  const raw = data as Partial<PortalOrder>;
  if (!Array.isArray(raw.items) || typeof raw.total !== "number") return null;
  return orderFromPortal({ ...raw, id, locationId: location.id, status: safeText(raw.status) as PortalOrder["status"] } as PortalOrder, location);
};

export async function listCorporateOrders(session: CorporateSession): Promise<CorporateOrder[]> {
  if (isCorporateSeedMode()) return [];
  if (!firebaseDb) throw new Error("Corporate order records are not configured.");
  const database = firebaseDb;
  const locations = await getReadableOrderLocations(session);
  const lists = await Promise.all(locations.map(async (location) => {
    const snapshot = await database.collection("units").doc(location.id).collection("orders").orderBy("createdAt", "desc").limit(100).get();
    return snapshot.docs.flatMap((doc) => {
      const order = readPortalOrder(doc.id, doc.data(), location);
      return order ? [order] : [];
    });
  }));
  return lists.flat().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getCorporateOrder(session: CorporateSession, compoundId: string): Promise<CorporateOrder | null> {
  if (isCorporateSeedMode()) return null;
  if (!firebaseDb) throw new Error("Corporate order records are not configured.");
  const separator = compoundId.indexOf(":");
  if (separator < 1) return null;
  const locationId = pathPart(compoundId.slice(0, separator));
  const sourceOrderId = pathPart(compoundId.slice(separator + 1));
  const location = (await getReadableOrderLocations(session)).find((item) => item.id === locationId);
  if (!location) return null;
  const document = await firebaseDb.collection("units").doc(locationId).collection("orders").doc(sourceOrderId).get();
  return document.exists ? readPortalOrder(document.id, document.data()!, location) : null;
}

const requestStates = (status: string): Pick<CorporateRequest, "handlingState" | "decisionState"> => {
  if (status === "WITHDRAWN") return { handlingState: "withdrawn", decisionState: "withdrawn" };
  if (status === "DECLINED") return { handlingState: "complete", decisionState: "declined" };
  if (status === "ACTIVE") return { handlingState: "complete", decisionState: "approved" };
  if (status === "SUBMITTED") return { handlingState: "received", decisionState: "pending" };
  if (status === "AGREEMENT_EXECUTION" || status === "BUILDOUT") return { handlingState: "decision_pending", decisionState: "pending" };
  return { handlingState: "under_review", decisionState: "pending" };
};

const requestFromRecord = (id: string, entityId: string, raw: Record<string, unknown>): CorporateRequest | null => {
  const locationId = safeText(raw.originatingUnitId);
  const status = raw.status;
  if (!locationId || !isExpansionStatus(status)) return null;
  const target = safeText(raw.targetMarket) || "Target market unavailable";
  const updatedAt = safeDate(raw.updatedAt || raw.submittedAt);
  return {
    id: `${entityId}:${id}`,
    sourceRequestId: id,
    organizationId: entityId,
    locationId,
    locationName: locationId,
    scopeType: "enterprise",
    scopeLabel: `${entityId} · ${target}`,
    title: `Growth request · ${target}`,
    summary: safeText(raw.operatingPlan) || "Operating plan unavailable.",
    submittedAt: safeDate(raw.submittedAt),
    updatedAt,
    ...requestStates(status),
    evidence: [{ label: "Operator submission", source: "Existing-operator growth request", observedAt: updatedAt, freshness: "unknown", note: `Development milestone: ${status}. This stage is not independent approval evidence.` }],
    conditions: [],
    recoveryActions: [{ label: "Verify decision evidence", description: "Review authority and milestone evidence before advancing the request." }],
  };
};

const requestOrganizationAccess = (session: CorporateSession): { corporate: boolean; organizationIds: string[] } => {
  const relevant = session.memberships.filter((membership) => isActiveCorporateMembership(membership) && CORPORATE_BUNDLE_PERMISSIONS[membership.bundle].includes("VIEW_REQUESTS"));
  return {
    corporate: relevant.some((membership) => membership.scope.type === "corporate"),
    organizationIds: [...new Set(relevant.flatMap((membership) => membership.scope.type === "organizations" ? membership.scope.organizationIds : []))],
  };
};

export async function listCorporateRequests(session: CorporateSession): Promise<CorporateRequest[]> {
  if (isCorporateSeedMode()) return [];
  if (!firebaseDb) throw new Error("Corporate request records are not configured.");
  const database = firebaseDb;
  const access = requestOrganizationAccess(session);
  let snapshots: QuerySnapshot[];
  if (access.corporate) {
    try {
      snapshots = [await database.collectionGroup("expansionApplications").orderBy("submittedAt", "desc").limit(200).get()];
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("COLLECTION_GROUP_DESC index for collection expansionApplications and field submittedAt")) throw error;
      // The declared collection-group index may not be deployed yet; read each entity with its standard field index.
      const entities = await database.collection("franchiseEntities").select().get();
      snapshots = await Promise.all(entities.docs.map((entity) => entity.ref.collection("expansionApplications").orderBy("submittedAt", "desc").limit(200).get()));
    }
  } else {
    snapshots = await Promise.all(access.organizationIds.map((entityId) => database.collection("franchiseEntities").doc(entityId).collection("expansionApplications").orderBy("submittedAt", "desc").limit(100).get()));
  }
  const requests = snapshots.flatMap((snapshot) => snapshot.docs.flatMap((doc) => {
    const entityId = doc.ref.parent.parent?.id;
    if (!entityId || !hasCorporatePermission(session, "VIEW_REQUESTS", { organizationId: entityId })) return [];
    const request = requestFromRecord(doc.id, entityId, doc.data());
    return request ? [request] : [];
  })).sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
  return access.corporate ? requests.slice(0, 200) : requests;
}

export async function getCorporateRequest(session: CorporateSession, compoundId: string): Promise<CorporateRequest | null> {
  if (isCorporateSeedMode()) return null;
  if (!firebaseDb) throw new Error("Corporate request records are not configured.");
  const separator = compoundId.indexOf(":");
  if (separator < 1) return null;
  const entityId = pathPart(compoundId.slice(0, separator));
  const sourceRequestId = pathPart(compoundId.slice(separator + 1));
  if (!hasCorporatePermission(session, "VIEW_REQUESTS", { organizationId: entityId })) return null;
  const document = await firebaseDb.collection("franchiseEntities").doc(entityId).collection("expansionApplications").doc(sourceRequestId).get();
  return document.exists ? requestFromRecord(document.id, entityId, document.data()!) : null;
}

export const corporateOrdersAsWork = (orders: CorporateOrder[]): WorkRecord[] => orders.map((order) => ({
  id: `order-${order.locationId}-${order.sourceOrderId || order.id}`, reference: order.sourceOrderId || order.id, type: "order", subject: `Supply order · ${order.lines.length} line${order.lines.length === 1 ? "" : "s"}`,
  organizationId: order.organizationId, regionId: order.regionId, locationId: order.locationId, locationName: order.locationName, state: `${order.acceptanceState} · ${order.fulfillmentState}`,
  teamId: "supply-coordination", priority: order.integrationState === "unknown_outcome" ? "HIGH" : order.reconciliationStatus === "EXCEPTION" ? "HIGH" : "NORMAL", nextAction: order.integrationState === "reconciled" ? "No reconciliation action required" : order.integrationState === "acknowledged" ? "Reconcile supplier acknowledgment" : "Record supplier acknowledgment", ...(order.integrationState === "unknown_outcome" ? { waitingReason: "Authoritative supplier acknowledgment unavailable" } : {}),
  isClosed: order.integrationState === "reconciled" && order.reconciliationStatus === "MATCHED",
  createdAt: order.createdAt, updatedAt: order.updatedAt, version: order.procurementVersion, href: `/corporate/orders/${encodeURIComponent(order.id)}`,
}));

export const corporateRequestsAsWork = (requests: CorporateRequest[]): WorkRecord[] => requests.map((request) => ({
  id: `request-${request.organizationId}-${request.sourceRequestId || request.id}`, reference: request.sourceRequestId || request.id, type: "request", subject: request.title,
  organizationId: request.organizationId, locationId: request.locationId, locationName: request.locationName, state: `${request.handlingState} · ${request.decisionState}`, isClosed: request.handlingState === "complete" || request.handlingState === "withdrawn",
  teamId: "franchise-development", priority: request.handlingState === "decision_pending" ? "HIGH" : "NORMAL", nextAction: request.handlingState === "received" ? "Triage request" : "Review milestone evidence",
  createdAt: request.submittedAt, updatedAt: request.updatedAt, version: 0, href: `/corporate/requests/${encodeURIComponent(request.id)}`,
}));
