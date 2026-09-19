import "server-only";

import { randomUUID } from "node:crypto";
import { firebaseDb } from "@/src/lib/firebase/admin";
import { assertCorporatePermission, hasCorporatePermission } from "@/src/features/corporate/authorization";
import { isCorporateSeedMode } from "@/src/features/corporate/environment";
import { corporateSeedLocations } from "@/src/features/corporate/seed-data";
import type { CorporateLocation, CorporateSession, CorporateTarget } from "@/src/features/corporate/types";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import { assertPortalPermission } from "@/src/features/portal/authorization";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_REQUIRED_ACTIONS,
  type CorporateResourcePublication,
  type ResourceCategory,
  type ResourceDelivery,
  type ResourceDeliveryState,
  type ResourceDocument,
  type ResourcePublicationState,
  type ResourceRequiredAction,
  type ResourceReturn,
} from "./types";

const publications = () => {
  if (!firebaseDb) throw new Error("Resource publication storage is not configured.");
  return firebaseDb.collection("corporateResourcePublications");
};

const text = (value: unknown, max: number) => typeof value === "string" ? value.normalize("NFKC").trim().slice(0, max) : "";
const isCategory = (value: string): value is ResourceCategory => (RESOURCE_CATEGORIES as readonly string[]).includes(value);
const isAction = (value: string): value is ResourceRequiredAction => (RESOURCE_REQUIRED_ACTIONS as readonly string[]).includes(value);
const isPublicationState = (value: unknown): value is ResourcePublicationState => value === "DRAFT" || value === "PUBLISHED" || value === "WITHDRAWN";
const isDeliveryState = (value: unknown): value is ResourceDeliveryState => ["PUBLISHED", "ACKNOWLEDGED", "RETURN_SUBMITTED", "CHANGES_REQUESTED", "ACCEPTED"].includes(String(value));
const validId = (value: string) => /^[A-Za-z0-9_-]{1,128}$/.test(value);
const validDate = (value: string) => Boolean(value) && Number.isFinite(Date.parse(value));

const asTarget = (location: CorporateLocation): CorporateTarget => ({
  locationId: location.id,
  ...(location.organizationId ? { organizationId: location.organizationId } : {}),
  ...(location.regionId ? { regionId: location.regionId } : {}),
});

const asLocation = (id: string, raw: Record<string, unknown>): CorporateLocation => ({
  id,
  name: text(raw.name, 160) || id,
  code: text(raw.code, 64) || id,
  ...(text(raw.organizationId, 128) ? { organizationId: text(raw.organizationId, 128) } : {}),
  ...(text(raw.regionId, 128) ? { regionId: text(raw.regionId, 128) } : {}),
  status: text(raw.operatingStatus, 32) || "UNKNOWN",
});

export const listResourceLocations = async (session: CorporateSession, permission: "VIEW_RESOURCES" | "PUBLISH_RESOURCES" = "VIEW_RESOURCES"): Promise<CorporateLocation[]> => {
  if (isCorporateSeedMode()) {
    return corporateSeedLocations.filter((location) => hasCorporatePermission(session, permission, asTarget(location)));
  }
  if (!firebaseDb) return [];
  const snapshot = await firebaseDb.collection("units").get();
  return snapshot.docs.flatMap((document) => {
    if (document.data().hiddenFromCorporateDirectory === true) return [];
    const location = asLocation(document.id, document.data());
    return hasCorporatePermission(session, permission, asTarget(location)) ? [location] : [];
  }).sort((left, right) => left.name.localeCompare(right.name));
};

const readDocument = (value: unknown): ResourceDocument | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const sanityAssetId = text(raw.sanityAssetId, 256);
  const url = text(raw.url, 2000);
  const mimeType = text(raw.mimeType, 128);
  const filename = text(raw.filename, 256);
  const size = typeof raw.size === "number" && Number.isFinite(raw.size) ? raw.size : 0;
  return sanityAssetId && /^https:\/\/cdn\.sanity\.io\//.test(url) && mimeType && filename && size > 0
    ? { sanityAssetId, url, mimeType, filename, size }
    : undefined;
};

const readPublication = (id: string, raw: Record<string, unknown>): CorporateResourcePublication | null => {
  const title = text(raw.title, 160);
  const category = text(raw.category, 64);
  const version = text(raw.version, 32);
  const state = raw.state;
  const ownerId = text(raw.ownerId, 128);
  const ownerName = text(raw.ownerName, 160);
  const createdAt = text(raw.createdAt, 64);
  const updatedAt = text(raw.updatedAt, 64);
  const requiredAction = text(raw.requiredAction, 32);
  if (!title || !isCategory(category) || !version || !isPublicationState(state) || !ownerId || !ownerName || !validDate(createdAt) || !validDate(updatedAt) || !isAction(requiredAction)) return null;
  const locationIds = Array.isArray(raw.locationIds) ? [...new Set(raw.locationIds.filter((value): value is string => typeof value === "string" && validId(value)))].slice(0, 200) : [];
  const scopeTargets = Array.isArray(raw.scopeTargets) ? raw.scopeTargets.flatMap((target): CorporateTarget[] => {
    if (!target || typeof target !== "object") return [];
    const item = target as Record<string, unknown>;
    const locationId = text(item.locationId, 128);
    return validId(locationId) ? [{ locationId, ...(text(item.organizationId, 128) ? { organizationId: text(item.organizationId, 128) } : {}), ...(text(item.regionId, 128) ? { regionId: text(item.regionId, 128) } : {}) }] : [];
  }) : [];
  return {
    id, title, category, version, state, ownerId, ownerName, createdAt, updatedAt, requiredAction,
    ...(text(raw.instructions, 1000) ? { instructions: text(raw.instructions, 1000) } : {}),
    ...(validDate(text(raw.dueAt, 64)) ? { dueAt: text(raw.dueAt, 64) } : {}),
    locationIds,
    scopeTargets,
    recipientCount: typeof raw.recipientCount === "number" && Number.isSafeInteger(raw.recipientCount) ? raw.recipientCount : locationIds.length,
    ...(readDocument(raw.document) ? { document: readDocument(raw.document) } : {}),
  };
};

const canViewPublication = (session: CorporateSession, publication: CorporateResourcePublication) => {
  if (!hasCorporatePermission(session, "VIEW_RESOURCES")) return false;
  return publication.scopeTargets.length === 0
    ? hasCorporatePermission(session, "PUBLISH_RESOURCES")
    : publication.scopeTargets.some((target) => hasCorporatePermission(session, "VIEW_RESOURCES", target));
};

export const listCorporateResourcePublications = async (session: CorporateSession): Promise<CorporateResourcePublication[]> => {
  if (isCorporateSeedMode()) return [];
  const snapshot = await publications().orderBy("updatedAt", "desc").get();
  return snapshot.docs.flatMap((document) => {
    const publication = readPublication(document.id, document.data());
    return publication && canViewPublication(session, publication) ? [publication] : [];
  });
};

export const getCorporateResourcePublication = async (session: CorporateSession, resourceId: string): Promise<CorporateResourcePublication | null> => {
  if (!validId(resourceId) || isCorporateSeedMode()) return null;
  const document = await publications().doc(resourceId).get();
  const publication = document.exists ? readPublication(document.id, document.data() || {}) : null;
  return publication && canViewPublication(session, publication) ? publication : null;
};

const readDelivery = (raw: Record<string, unknown>): ResourceDelivery | null => {
  const locationId = text(raw.locationId, 128);
  const locationName = text(raw.locationName, 160);
  const locationCode = text(raw.locationCode, 64);
  const state = raw.state;
  const publishedAt = text(raw.publishedAt, 64);
  if (!validId(locationId) || !locationName || !locationCode || !isDeliveryState(state) || !validDate(publishedAt)) return null;
  return {
    locationId, locationName, locationCode, state, publishedAt,
    ...(text(raw.organizationId, 128) ? { organizationId: text(raw.organizationId, 128) } : {}),
    ...(text(raw.regionId, 128) ? { regionId: text(raw.regionId, 128) } : {}),
    ...(validDate(text(raw.acknowledgedAt, 64)) ? { acknowledgedAt: text(raw.acknowledgedAt, 64) } : {}),
    ...(validDate(text(raw.returnedAt, 64)) ? { returnedAt: text(raw.returnedAt, 64) } : {}),
    ...(validDate(text(raw.reviewedAt, 64)) ? { reviewedAt: text(raw.reviewedAt, 64) } : {}),
    ...(text(raw.reviewedByName, 160) ? { reviewedByName: text(raw.reviewedByName, 160) } : {}),
    ...(text(raw.reviewNote, 1000) ? { reviewNote: text(raw.reviewNote, 1000) } : {}),
  };
};

export const listResourceDeliveries = async (session: CorporateSession, resourceId: string): Promise<ResourceDelivery[]> => {
  const publication = await getCorporateResourcePublication(session, resourceId);
  if (!publication) return [];
  const snapshot = await publications().doc(resourceId).collection("deliveries").get();
  return snapshot.docs.flatMap((document) => {
    const delivery = readDelivery(document.data());
    return delivery && hasCorporatePermission(session, "VIEW_RESOURCES", delivery) ? [delivery] : [];
  }).sort((left, right) => left.locationName.localeCompare(right.locationName));
};

const readReturn = (id: string, raw: Record<string, unknown>): ResourceReturn | null => {
  const submittedAt = text(raw.submittedAt, 64);
  const submittedByName = text(raw.submittedByName, 160);
  const submittedByUserId = text(raw.submittedByUserId, 128);
  const state = raw.state;
  const document = readDocument(raw.document);
  if (!validDate(submittedAt) || !submittedByName || !submittedByUserId || !document || (state !== "SUBMITTED" && state !== "ACCEPTED" && state !== "CHANGES_REQUESTED")) return null;
  return {
    id, submittedAt, submittedByName, submittedByUserId, document, state,
    ...(validDate(text(raw.reviewedAt, 64)) ? { reviewedAt: text(raw.reviewedAt, 64) } : {}),
    ...(text(raw.reviewedByName, 160) ? { reviewedByName: text(raw.reviewedByName, 160) } : {}),
    ...(text(raw.reviewNote, 1000) ? { reviewNote: text(raw.reviewNote, 1000) } : {}),
  };
};

export const listResourceReturns = async (session: CorporateSession, resourceId: string, locationId: string): Promise<ResourceReturn[]> => {
  const publication = await getCorporateResourcePublication(session, resourceId);
  if (!publication || !validId(locationId)) return [];
  const deliveryRef = publications().doc(resourceId).collection("deliveries").doc(locationId);
  const deliveryDoc = await deliveryRef.get();
  const delivery = deliveryDoc.exists ? readDelivery(deliveryDoc.data() || {}) : null;
  if (!delivery || !hasCorporatePermission(session, "VIEW_RESOURCES", delivery)) return [];
  const snapshot = await deliveryRef.collection("returns").orderBy("submittedAt", "desc").get();
  return snapshot.docs.flatMap((document) => {
    const item = readReturn(document.id, document.data());
    return item ? [item] : [];
  });
};

export type ResourcePublicationInput = {
  resourceId?: string;
  intent: "DRAFT" | "PUBLISH";
  title: string;
  category: string;
  version: string;
  requiredAction: string;
  instructions: string;
  dueAt: string;
  locationIds: string[];
  document?: ResourceDocument;
};

const normalizeInput = (input: ResourcePublicationInput) => {
  const resourceId = input.resourceId && validId(input.resourceId) ? input.resourceId : undefined;
  const title = text(input.title, 160);
  const category = text(input.category, 64);
  const version = text(input.version, 32);
  const requiredAction = text(input.requiredAction, 32);
  const instructions = text(input.instructions, 1000);
  const dueAt = text(input.dueAt, 64);
  const locationIds = [...new Set(input.locationIds.filter(validId))].slice(0, 201);
  if (!title || !isCategory(category) || !version || !isAction(requiredAction) || locationIds.length > 200 || (dueAt && !validDate(dueAt))) throw new Error("Review the title, category, version, action, recipient locations, and due date.");
  return { resourceId, title, category, version, requiredAction, instructions, dueAt, locationIds, document: input.document };
};

export const saveResourcePublication = async (session: CorporateSession, input: ResourcePublicationInput): Promise<CorporateResourcePublication> => {
  if (session.isDevelopmentPreview || isCorporateSeedMode()) throw new Error("Resource publishing is unavailable in the fictional preview.");
  assertCorporatePermission(session, "PUBLISH_RESOURCES");
  const normalized = normalizeInput(input);
  const locations = await listResourceLocations(session, "PUBLISH_RESOURCES");
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  const selectedLocations = normalized.locationIds.map((id) => locationsById.get(id)).filter((location): location is CorporateLocation => Boolean(location));
  if (selectedLocations.length !== normalized.locationIds.length) throw new Error("One or more selected stores are no longer in your publishing scope.");

  const now = new Date().toISOString();
  const resourceId = normalized.resourceId || `RES-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
  const recordRef = publications().doc(resourceId);
  const existing = await recordRef.get();
  const prior = existing.exists ? readPublication(existing.id, existing.data() || {}) : null;
  if (existing.exists && (!prior || prior.state !== "DRAFT" || prior.ownerId !== session.userId)) throw new Error("Only your current draft can be changed from this screen.");

  const document = normalized.document || prior?.document;
  if (input.intent === "PUBLISH" && (!selectedLocations.length || !document)) throw new Error("Choose a document and at least one store before sending.");
  const state: ResourcePublicationState = input.intent === "PUBLISH" ? "PUBLISHED" : "DRAFT";
  const publication: CorporateResourcePublication = {
    id: resourceId,
    title: normalized.title,
    category: normalized.category,
    version: normalized.version,
    state,
    ownerId: session.userId,
    ownerName: session.displayName,
    createdAt: prior?.createdAt || now,
    updatedAt: now,
    requiredAction: normalized.requiredAction,
    ...(normalized.instructions ? { instructions: normalized.instructions } : {}),
    ...(normalized.dueAt ? { dueAt: new Date(normalized.dueAt).toISOString() } : {}),
    locationIds: normalized.locationIds,
    scopeTargets: selectedLocations.map(asTarget),
    recipientCount: selectedLocations.length,
    ...(document ? { document } : {}),
  };

  if (input.intent === "DRAFT") {
    await recordRef.set(publication, { merge: false });
    return publication;
  }

  const batch = firebaseDb!.batch();
  batch.set(recordRef, publication, { merge: false });
  for (const location of selectedLocations) {
    const delivery: ResourceDelivery = {
      ...asTarget(location),
      locationId: location.id,
      locationName: location.name,
      locationCode: location.code,
      state: "PUBLISHED",
      publishedAt: now,
    };
    batch.set(recordRef.collection("deliveries").doc(location.id), delivery, { merge: false });
    batch.set(firebaseDb!.collection("units").doc(location.id).collection("resources").doc(resourceId), {
      id: resourceId,
      resourcePublicationId: resourceId,
      title: publication.title,
      category: publication.category,
      version: publication.version,
      updatedAt: publication.updatedAt,
      fileSize: `${Math.max(0.1, (document!.size / 1024 / 1024)).toFixed(1)} MB`,
      downloadUrl: `/resources/published/${resourceId}`,
      locationScope: [location.id],
      requiredAction: publication.requiredAction,
      ...(publication.instructions ? { instructions: publication.instructions } : {}),
      ...(publication.dueAt ? { dueAt: publication.dueAt } : {}),
      responseState: "PUBLISHED",
      publishedAt: now,
    }, { merge: false });
  }
  const audit = firebaseDb!.collection("corporateAuditEvents").doc();
  batch.set(audit, {
    id: audit.id,
    recordId: resourceId,
    recordType: "resource",
    actorId: session.userId,
    actorName: session.displayName,
    action: "RESOURCE_PUBLISHED",
    occurredAt: now,
    commandId: audit.id,
    previousVersion: null,
    nextVersion: 1,
    scopeTargets: publication.scopeTargets,
    changes: { state: { before: prior?.state || null, after: "PUBLISHED" }, recipientCount: { before: prior?.recipientCount || 0, after: publication.recipientCount } },
  });
  await batch.commit();
  return publication;
};

export const withdrawResourcePublication = async (session: CorporateSession, resourceId: string): Promise<void> => {
  if (session.isDevelopmentPreview || isCorporateSeedMode() || !validId(resourceId)) throw new Error("This resource is unavailable.");
  const publication = await getCorporateResourcePublication(session, resourceId);
  if (!publication || publication.state !== "PUBLISHED" || !publication.scopeTargets.every((target) => hasCorporatePermission(session, "PUBLISH_RESOURCES", target))) {
    throw new Error("You do not have authority to withdraw this publication for every recipient store.");
  }
  const now = new Date().toISOString();
  const batch = firebaseDb!.batch();
  batch.update(publications().doc(resourceId), { state: "WITHDRAWN", updatedAt: now, withdrawnAt: now, withdrawnByName: session.displayName });
  for (const locationId of publication.locationIds) batch.delete(firebaseDb!.collection("units").doc(locationId).collection("resources").doc(resourceId));
  const audit = firebaseDb!.collection("corporateAuditEvents").doc();
  batch.set(audit, { id: audit.id, recordId: resourceId, recordType: "resource", actorId: session.userId, actorName: session.displayName, action: "RESOURCE_WITHDRAWN", occurredAt: now, commandId: audit.id, previousVersion: 1, nextVersion: 2, scopeTargets: publication.scopeTargets, changes: { state: { before: "PUBLISHED", after: "WITHDRAWN" } } });
  await batch.commit();
};

export const getOperatorResourcePublication = async (session: PortalSession, resourceId: string) => {
  assertPortalPermission(session, "VIEW_RESOURCES");
  if (!validId(resourceId) || !firebaseDb) return null;
  const projection = await firebaseDb.collection("units").doc(session.locationId).collection("resources").doc(resourceId).get();
  const resource = projection.data();
  if (!projection.exists || resource?.resourcePublicationId !== resourceId) return null;
  const publicationDoc = await publications().doc(resourceId).get();
  const publication = publicationDoc.exists ? readPublication(publicationDoc.id, publicationDoc.data() || {}) : null;
  return publication?.state === "PUBLISHED" && publication.document ? publication : null;
};

const assertOperatorDelivery = async (session: PortalSession, resourceId: string, action: ResourceRequiredAction) => {
  assertPortalPermission(session, "VIEW_RESOURCES");
  if (!validId(resourceId) || !firebaseDb) throw new Error("This resource is unavailable.");
  const unitResourceRef = firebaseDb.collection("units").doc(session.locationId).collection("resources").doc(resourceId);
  const publicationRef = publications().doc(resourceId);
  const deliveryRef = publicationRef.collection("deliveries").doc(session.locationId);
  const [unitResource, publicationDoc, deliveryDoc] = await Promise.all([unitResourceRef.get(), publicationRef.get(), deliveryRef.get()]);
  const publication = publicationDoc.exists ? readPublication(publicationDoc.id, publicationDoc.data() || {}) : null;
  if (!unitResource.exists || unitResource.data()?.resourcePublicationId !== resourceId || !publication || publication.state !== "PUBLISHED" || publication.requiredAction !== action || !deliveryDoc.exists) throw new Error("This resource action is no longer available for your store.");
  return { unitResourceRef, publicationRef, deliveryRef, publication };
};

export const assertOperatorResourceReturnAvailable = async (session: PortalSession, resourceId: string): Promise<void> => {
  await assertOperatorDelivery(session, resourceId, "RETURN_DOCUMENT");
};

export const acknowledgeResource = async (session: PortalSession, resourceId: string): Promise<void> => {
  const { unitResourceRef, publicationRef, deliveryRef } = await assertOperatorDelivery(session, resourceId, "ACKNOWLEDGE");
  const now = new Date().toISOString();
  await firebaseDb!.runTransaction(async (transaction) => {
    const [resourceDoc, publicationDoc, deliveryDoc] = await transaction.getAll(unitResourceRef, publicationRef, deliveryRef);
    if (!resourceDoc.exists || resourceDoc.data()?.resourcePublicationId !== resourceId || !publicationDoc.exists || publicationDoc.data()?.state !== "PUBLISHED" || publicationDoc.data()?.requiredAction !== "ACKNOWLEDGE" || !deliveryDoc.exists) throw new Error("This acknowledgement is no longer available.");
    transaction.update(deliveryRef, { state: "ACKNOWLEDGED", acknowledgedAt: now });
    transaction.update(unitResourceRef, { responseState: "ACKNOWLEDGED", acknowledgedAt: now });
  });
};

export const submitResourceReturn = async (session: PortalSession, resourceId: string, document: ResourceDocument): Promise<void> => {
  const { unitResourceRef, publicationRef, deliveryRef } = await assertOperatorDelivery(session, resourceId, "RETURN_DOCUMENT");
  const now = new Date().toISOString();
  const returnRef = deliveryRef.collection("returns").doc(`RET-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`);
  await firebaseDb!.runTransaction(async (transaction) => {
    const [resourceDoc, publicationDoc, deliveryDoc] = await transaction.getAll(unitResourceRef, publicationRef, deliveryRef);
    if (!resourceDoc.exists || resourceDoc.data()?.resourcePublicationId !== resourceId || !publicationDoc.exists || publicationDoc.data()?.state !== "PUBLISHED" || publicationDoc.data()?.requiredAction !== "RETURN_DOCUMENT" || !deliveryDoc.exists) throw new Error("This return request is no longer available.");
    transaction.create(returnRef, { id: returnRef.id, submittedAt: now, submittedByName: session.displayName || session.email, submittedByUserId: session.userId, document, state: "SUBMITTED" });
    transaction.update(deliveryRef, { state: "RETURN_SUBMITTED", returnedAt: now });
    transaction.update(unitResourceRef, { responseState: "RETURN_SUBMITTED", returnedAt: now });
  });
};

export const reviewResourceReturn = async (session: CorporateSession, resourceId: string, locationId: string, returnId: string, decision: "ACCEPT" | "REQUEST_CHANGES", reviewNote: string): Promise<void> => {
  if (session.isDevelopmentPreview || isCorporateSeedMode() || !validId(resourceId) || !validId(locationId) || !validId(returnId)) throw new Error("This return is unavailable.");
  const note = text(reviewNote, 1000);
  const publication = await getCorporateResourcePublication(session, resourceId);
  if (!publication || publication.requiredAction !== "RETURN_DOCUMENT") throw new Error("This return request is unavailable.");
  const deliveryRef = publications().doc(resourceId).collection("deliveries").doc(locationId);
  const returnRef = deliveryRef.collection("returns").doc(returnId);
  const unitResourceRef = firebaseDb!.collection("units").doc(locationId).collection("resources").doc(resourceId);
  const auditRef = firebaseDb!.collection("corporateAuditEvents").doc();
  const now = new Date().toISOString();
  await firebaseDb!.runTransaction(async (transaction) => {
    const [deliveryDoc, returnDoc, unitResource] = await transaction.getAll(deliveryRef, returnRef, unitResourceRef);
    const delivery = deliveryDoc.exists ? readDelivery(deliveryDoc.data() || {}) : null;
    const submitted = returnDoc.exists ? readReturn(returnDoc.id, returnDoc.data() || {}) : null;
    if (!delivery || !submitted || submitted.state !== "SUBMITTED" || !unitResource.exists || unitResource.data()?.resourcePublicationId !== resourceId) throw new Error("This returned document changed. Reload before reviewing it.");
    assertCorporatePermission(session, "PUBLISH_RESOURCES", delivery);
    const accepted = decision === "ACCEPT";
    transaction.update(returnRef, { state: accepted ? "ACCEPTED" : "CHANGES_REQUESTED", reviewedAt: now, reviewedByName: session.displayName, ...(note ? { reviewNote: note } : {}) });
    transaction.update(deliveryRef, { state: accepted ? "ACCEPTED" : "CHANGES_REQUESTED", reviewedAt: now, reviewedByName: session.displayName, ...(note ? { reviewNote: note } : {}) });
    transaction.update(unitResourceRef, { responseState: accepted ? "ACCEPTED" : "CHANGES_REQUESTED", reviewedAt: now, ...(note ? { reviewNote: note } : {}) });
    transaction.create(auditRef, { id: auditRef.id, recordId: resourceId, recordType: "resource", actorId: session.userId, actorName: session.displayName, action: accepted ? "RESOURCE_RETURN_ACCEPTED" : "RESOURCE_RETURN_CHANGES_REQUESTED", occurredAt: now, commandId: auditRef.id, previousVersion: null, nextVersion: 1, locationId, organizationId: delivery.organizationId || null, regionId: delivery.regionId || null, changes: { returnState: { before: "SUBMITTED", after: accepted ? "ACCEPTED" : "CHANGES_REQUESTED" } } });
  });
};
