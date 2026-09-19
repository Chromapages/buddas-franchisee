"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { firebaseDb } from "../../lib/firebase/admin.ts";
import { assertCorporatePermission, CORPORATE_BUNDLE_PERMISSIONS, hasCorporatePermission, isActiveCorporateMembership, parseCorporateMemberships } from "./authorization.ts";
import { digestCommandPayload, getCommandRecordId, assertIdempotencyKey } from "./commands.ts";
import { isCorporateSeedMode } from "./environment.ts";
import { getCorporateSession } from "./session.ts";
import { getCorporateStorage } from "./storage.ts";
import type { CorporateLocation, CorporateSession } from "./types.ts";
import type { PortalProduct } from "../portal/types.ts";
import { getComposedCatalogForLocation, isApprovedCatalogImageUrl, masterCatalogItemFromUnknown, type CatalogScopeType, type MasterCatalogItem } from "../catalog/master-catalog.ts";

export type CorporateCatalogItem = PortalProduct & {
  locationId: string;
  createdAt: string;
  publishedByName: string;
  catalogScope?: CatalogScopeType;
};

export type CatalogActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type CatalogPublicationDraft = {
  name: string;
  sku: string;
  category: PortalProduct["category"];
  packSize: string;
  leadTimeDays: number;
  price: number;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageVerified?: boolean;
};

export type CatalogPublicationEligibility = {
  location: CorporateLocation;
  eligible: boolean;
  reason?: string;
};

export type CatalogPublicationDestination = {
  locationId: string;
  status: "PUBLISHED" | "SCHEDULED" | "PENDING" | "FAILED" | "NOT_ELIGIBLE" | "ROLLED_BACK" | "ROLLBACK_SKIPPED";
  attempts: number;
  reason?: string;
  completedAt?: string;
};

export type CatalogPublicationBatch = {
  id: string;
  draft: CatalogPublicationDraft;
  effectiveAt: string;
  state: "DRAFT" | "SCHEDULED" | "PUBLISHING" | "COMPLETE" | "NEEDS_ATTENTION" | "ROLLED_BACK";
  createdAt: string;
  createdById?: string;
  createdByName: string;
  rollbackUntil?: string;
  destinations: CatalogPublicationDestination[];
  previousItems: Record<string, CorporateCatalogItem | null>;
  scopeType?: CatalogScopeType;
  previousMasterItem?: MasterCatalogItem | null;
  schemaVersion?: 2;
  requestDigest?: string;
  leaseToken?: string;
  leaseUntil?: string;
};

const catalogCategories = new Set<PortalProduct["category"]>([
  "Bakery & Dough",
  "Packaging & Paper",
  "Food Safety & PPE",
  "Uniforms",
  "Brand Materials",
  "Cleaning & Sanitation",
  "Packaging",
  "Signage & Uniforms",
  "Equipment",
]);

const previewCatalog = new Map<string, CorporateCatalogItem[]>();
const previewBatches = new Map<string, CatalogPublicationBatch>();
const previewMasterCatalog = new Map<string, MasterCatalogItem>();

const cleanText = (value: FormDataEntryValue | null, max: number): string =>
  typeof value === "string" ? value.normalize("NFKC").trim().slice(0, max) : "";

const productIdFor = (sku: string): string => `catalog-${sku.toLowerCase()}`;

const eligibleForCatalogPublication = (location: CorporateLocation): CatalogPublicationEligibility => {
  if (location.operatingStatus === "UNKNOWN" || !location.operatingStatus) return { location, eligible: false, reason: "Operating status is not recorded — complete the location record in Directory." };
  if (location.operatingStatus !== "ACTIVE") return { location, eligible: false, reason: `Location is ${location.operatingStatus.toLowerCase()} and cannot receive catalog items yet.` };
  if (location.verificationStatus !== "VERIFIED") return { location, eligible: false, reason: "Location record review required — verify it in Directory before publishing." };
  if (!location.organizationId || !location.regionId || !location.address || !location.timeZone) return { location, eligible: false, reason: "Location details are incomplete — complete the record in Directory before publishing." };
  return { location, eligible: true };
};

const normalizePublicationDraft = (draft: CatalogPublicationDraft): CatalogPublicationDraft | null => {
  const name = typeof draft.name === "string" ? draft.name.normalize("NFKC").trim().slice(0, 128) : "";
  const sku = typeof draft.sku === "string" ? draft.sku.normalize("NFKC").trim().slice(0, 32).toUpperCase() : "";
  const category = draft.category;
  const packSize = typeof draft.packSize === "string" ? draft.packSize.normalize("NFKC").trim().slice(0, 64) : "";
  const description = typeof draft.description === "string" ? draft.description.normalize("NFKC").trim().slice(0, 600) : "";
  const imageUrl = isApprovedCatalogImageUrl(draft.imageUrl) ? draft.imageUrl : undefined;
  const imageAlt = typeof draft.imageAlt === "string" ? draft.imageAlt.normalize("NFKC").trim().slice(0, 160) : "";
  const imageVerified = draft.imageVerified === true;
  if (draft.imageUrl && (!imageUrl || !imageAlt || !imageVerified)) return null;
  if (!name || !/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(sku) || !catalogCategories.has(category) || !packSize || !Number.isSafeInteger(draft.leadTimeDays) || draft.leadTimeDays < 0 || draft.leadTimeDays > 365 || !Number.isFinite(draft.price) || draft.price <= 0 || draft.price > 100000) return null;
  return { name, sku, category, packSize, leadTimeDays: draft.leadTimeDays, price: draft.price, ...(description ? { description } : {}), ...(imageUrl ? { imageUrl, imageAlt, imageVerified: true } : {}) };
};

const itemForPublication = (draft: CatalogPublicationDraft, locationId: string, actorName: string, batchId: string, createdAt: string): CorporateCatalogItem & { publicationBatchId: string } => ({
  id: productIdFor(draft.sku), locationId, sku: draft.sku, name: draft.name, category: draft.category,
  description: draft.description || `${draft.name}. Approved for ${draft.packSize}; allow ${draft.leadTimeDays} day${draft.leadTimeDays === 1 ? "" : "s"} lead time.`,
  packSize: draft.packSize, leadTimeDays: draft.leadTimeDays, isAvailable: true, price: draft.price,
  slug: `${draft.sku.toLowerCase()}-${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`.slice(0, 128),
  ...(draft.imageUrl && draft.imageAlt && draft.imageVerified ? { imageUrl: draft.imageUrl, imageAlt: draft.imageAlt, imageVerified: true } : {}),
  createdAt, publishedByName: actorName, publicationBatchId: batchId,
});

const masterItemForPublication = (batch: CatalogPublicationBatch, actorName: string, locationIds: string[], createdAt: string): MasterCatalogItem => {
  const product = itemForPublication(batch.draft, "MASTER", actorName, batch.id, createdAt);
  const { locationId: _locationId, ...master } = product;
  void _locationId;
  return { ...master, scopeType: batch.scopeType || "SELECTED", locationIds: batch.scopeType === "UNIVERSAL" ? [] : locationIds, updatedAt: createdAt };
};

const commitMasterPublicationBatch = async (batch: CatalogPublicationBatch, actorName: string, locationIds: string[], expectedLeaseToken?: string, allowExistingBatchUpdate = false): Promise<void> => {
  const item = masterItemForPublication(batch, actorName, locationIds, new Date().toISOString());
  if (isCorporateSeedMode()) {
    const previous = previewMasterCatalog.get(item.id) || null;
    if (batch.previousMasterItem === undefined) batch.previousMasterItem = previous;
    previewMasterCatalog.set(item.id, { ...item, createdAt: previous?.createdAt || item.createdAt });
    previewBatches.set(batch.id, batch);
    return;
  }
  if (!firebaseDb) throw new Error("Catalog storage is not configured.");
  const itemRef = firebaseDb.collection("corporateCatalogItems").doc(item.id);
  const batchRef = firebaseDb.collection("catalogPublicationBatches").doc(batch.id);
  await firebaseDb.runTransaction(async (transaction) => {
    const [current, durableBatch] = await transaction.getAll(itemRef, batchRef);
    if (expectedLeaseToken && (!durableBatch.exists || durableBatch.data()?.leaseToken !== expectedLeaseToken)) throw new Error("This scheduled publication lease is no longer owned by this worker.");
    if (durableBatch.exists && !expectedLeaseToken && !allowExistingBatchUpdate) {
      const durable = durableBatch.data() as CatalogPublicationBatch;
      if (!batch.requestDigest || durable.requestDigest !== batch.requestDigest) throw new Error("This publication reference is already in use.");
      Object.assign(batch, durable);
      return;
    }
    if (allowExistingBatchUpdate && current.exists && current.data()?.publicationBatchId !== batch.id) throw new Error("A later catalog publication now owns this SKU. Reload before retrying.");
    const previous = current.exists ? masterCatalogItemFromUnknown(current.id, current.data() || {}) : null;
    if (batch.previousMasterItem === undefined) batch.previousMasterItem = previous;
    transaction.set(itemRef, { ...item, createdAt: previous?.createdAt || item.createdAt });
    transaction.set(batchRef, batch);
  });
};

const persistClaimedPublicationBatch = async (batch: CatalogPublicationBatch, expectedLeaseToken: string): Promise<boolean> => {
  if (!firebaseDb) return false;
  const reference = firebaseDb.collection("catalogPublicationBatches").doc(batch.id);
  return firebaseDb.runTransaction(async (transaction) => {
    const current = await transaction.get(reference);
    if (!current.exists || current.data()?.leaseToken !== expectedLeaseToken) return false;
    transaction.set(reference, batch);
    return true;
  });
};

const getAuthorizedLocation = async (session: CorporateSession, locationId: string): Promise<CorporateLocation | null> => {
  const locations = await getCorporateStorage().getLocations(session);
  const location = locations.find((candidate) => candidate.id === locationId) || null;
  if (!location) return null;
  assertCorporatePermission(session, "MANAGE_CATALOG", {
    locationId: location.id,
    organizationId: location.organizationId,
    regionId: location.regionId,
  });
  return location;
};

const itemFromUnknown = (id: string, locationId: string, raw: Record<string, unknown>): CorporateCatalogItem | null => {
  if (typeof raw.sku !== "string" || typeof raw.name !== "string" || typeof raw.description !== "string" || typeof raw.packSize !== "string" || typeof raw.slug !== "string" || typeof raw.price !== "number" || typeof raw.leadTimeDays !== "number" || !catalogCategories.has(raw.category as PortalProduct["category"])) return null;
  return {
    id,
    locationId,
    sku: raw.sku,
    name: raw.name,
    category: raw.category as PortalProduct["category"],
    description: raw.description,
    packSize: raw.packSize,
    leadTimeDays: raw.leadTimeDays,
    isAvailable: raw.isAvailable !== false,
    price: raw.price,
    slug: raw.slug,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    publishedByName: typeof raw.publishedByName === "string" ? raw.publishedByName : "Corporate catalog",
  };
};

export const getCorporateCatalogLocations = async (session: CorporateSession): Promise<CorporateLocation[]> => {
  const locations = await getCorporateStorage().getLocations(session);
  return locations.filter((location) => {
    try {
      assertCorporatePermission(session, "MANAGE_CATALOG", {
        locationId: location.id,
        organizationId: location.organizationId,
        regionId: location.regionId,
      });
      return true;
    } catch {
      return false;
    }
  });
};

export const getCorporateCatalog = async (session: CorporateSession, locationId: string): Promise<CorporateCatalogItem[]> => {
  await getAuthorizedLocation(session, locationId);
  if (isCorporateSeedMode()) {
    const masters = [...previewMasterCatalog.values()].filter((item) => item.scopeType === "UNIVERSAL" || item.locationIds.includes(locationId));
    const masterSkus = new Set(masters.map((item) => item.sku));
    return [...masters.map((item) => ({ ...item, locationId })), ...(previewCatalog.get(locationId) || []).filter((item) => !masterSkus.has(item.sku))];
  }
  if (!firebaseDb) throw new Error("Catalog storage is not configured.");
  const products = await getComposedCatalogForLocation(firebaseDb, locationId, { includeUnavailable: true });
  return products.map((product) => ({ ...product, locationId, createdAt: "", publishedByName: "Corporate catalog", ...((product as PortalProduct & { scopeType?: CatalogScopeType }).scopeType ? { catalogScope: (product as PortalProduct & { scopeType: CatalogScopeType }).scopeType } : {}) }));
};

const sessionCanManageUniversalCatalog = (session: CorporateSession): boolean => session.memberships.some((membership) =>
  isActiveCorporateMembership(membership)
  && membership.scope.type === "corporate"
  && CORPORATE_BUNDLE_PERMISSIONS[membership.bundle].includes("MANAGE_CATALOG"),
);

export const canManageUniversalCatalog = async (session: CorporateSession): Promise<boolean> =>
  sessionCanManageUniversalCatalog(session);

export const removeCorporateCatalogItem = async (input: { locationId: string; itemId: string }): Promise<{ status: "success" | "error"; message: string }> => {
  const session = await getCorporateSession();
  if (!session) return { status: "error", message: "Corporate access has expired. Sign in again." };
  if (session.isDevelopmentPreview) return { status: "error", message: "Catalog removal is unavailable in this preview session." };
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(input.locationId) || !/^[A-Za-z0-9_-]{1,128}$/.test(input.itemId)) return { status: "error", message: "This catalog item is invalid." };
  try {
    const permittedLocations = await getCorporateCatalogLocations(session);
    const permittedLocationIds = new Set(permittedLocations.map((location) => location.id));
    if (!permittedLocationIds.has(input.locationId)) throw new Error("This store is outside your current catalog access.");
    const occurredAt = new Date().toISOString();

    if (isCorporateSeedMode()) {
      const master = previewMasterCatalog.get(input.itemId);
      if (master) {
        if (master.scopeType === "UNIVERSAL" && !sessionCanManageUniversalCatalog(session)) throw new Error("Corporate-wide catalog access is required to remove this item.");
        if (master.scopeType === "SELECTED" && master.locationIds.some((locationId) => !permittedLocationIds.has(locationId))) throw new Error("You no longer have access to every store that receives this item.");
        if (!master.isAvailable) return { status: "success", message: `${master.name} is already removed from the catalog.` };
        previewMasterCatalog.set(master.id, { ...master, isAvailable: false, updatedAt: occurredAt });
        revalidatePath("/corporate/catalog");
        revalidatePath("/portal/supplies");
        return { status: "success", message: `${master.name} is no longer available to order.` };
      }
      const items = previewCatalog.get(input.locationId) || [];
      const item = items.find((candidate) => candidate.id === input.itemId);
      if (!item) throw new Error("This catalog item is no longer available.");
      if (!item.isAvailable) return { status: "success", message: `${item.name} is already removed from the catalog.` };
      previewCatalog.set(input.locationId, items.map((candidate) => candidate.id === input.itemId ? { ...candidate, isAvailable: false } : candidate));
      revalidatePath("/corporate/catalog");
      revalidatePath("/portal/supplies");
      return { status: "success", message: `${item.name} is no longer available to order.` };
    }

    if (!firebaseDb) throw new Error("Catalog storage is not configured.");
    const masterRef = firebaseDb.collection("corporateCatalogItems").doc(input.itemId);
    const legacyRef = firebaseDb.collection("units").doc(input.locationId).collection("products").doc(input.itemId);
    const auditRef = firebaseDb.collection("corporateAuditEvents").doc();
    const result = await firebaseDb.runTransaction(async (transaction) => {
      const [masterDocument, legacyDocument] = await transaction.getAll(masterRef, legacyRef);
      const masterData = masterDocument.data() || {};
      const legacyData = legacyDocument.data() || {};
      const master = masterDocument.exists ? masterCatalogItemFromUnknown(masterDocument.id, masterData) : null;
      if (master) {
        if (master.scopeType === "UNIVERSAL" && !sessionCanManageUniversalCatalog(session)) throw new Error("Corporate-wide catalog access is required to remove this item.");
        if (master.scopeType === "SELECTED" && master.locationIds.some((locationId) => !permittedLocationIds.has(locationId))) throw new Error("You no longer have access to every store that receives this item.");
        if (!master.isAvailable) return { name: master.name, alreadyRemoved: true };
        transaction.set(masterRef, { ...masterData, isAvailable: false, updatedAt: occurredAt, removedAt: occurredAt, removedBy: session.userId });
        transaction.create(auditRef, { id: auditRef.id, recordId: master.id, recordType: "catalog", locationId: null, organizationId: null, regionId: null, actorId: session.userId, actorName: session.displayName, action: "CATALOG_ITEM_REMOVED", occurredAt, commandId: auditRef.id, previousVersion: 1, nextVersion: 2, changes: { isAvailable: { before: true, after: false }, scope: { before: master.scopeType, after: master.scopeType } } });
        return { name: master.name, alreadyRemoved: false };
      }
      const legacy = legacyDocument.exists ? itemFromUnknown(legacyDocument.id, input.locationId, legacyData) : null;
      if (!legacy) throw new Error("This catalog item is no longer available.");
      if (!legacy.isAvailable) return { name: legacy.name, alreadyRemoved: true };
      transaction.set(legacyRef, { ...legacyData, isAvailable: false, updatedAt: occurredAt, removedAt: occurredAt, removedBy: session.userId });
      transaction.create(auditRef, { id: auditRef.id, recordId: legacy.id, recordType: "catalog", locationId: input.locationId, organizationId: null, regionId: null, actorId: session.userId, actorName: session.displayName, action: "CATALOG_ITEM_REMOVED", occurredAt, commandId: auditRef.id, previousVersion: 1, nextVersion: 2, changes: { isAvailable: { before: true, after: false }, scope: { before: "LEGACY_STORE", after: "LEGACY_STORE" } } });
      return { name: legacy.name, alreadyRemoved: false };
    });
    revalidatePath("/corporate/catalog");
    revalidatePath("/portal/supplies");
    return { status: "success", message: result.alreadyRemoved ? `${result.name} is already removed from the catalog.` : `${result.name} is no longer available to order.` };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "This catalog item could not be removed." };
  }
};

export const addCorporateCatalogItem = async (_previous: CatalogActionState, formData: FormData): Promise<CatalogActionState> => {
  const locationId = cleanText(formData.get("locationId"), 128);
  const name = cleanText(formData.get("name"), 128);
  const sku = cleanText(formData.get("sku"), 32).toUpperCase();
  const category = cleanText(formData.get("category"), 64) as PortalProduct["category"];
  const description = cleanText(formData.get("description"), 600);
  const packSize = cleanText(formData.get("packSize"), 64);
  const leadTimeDays = Number(cleanText(formData.get("leadTimeDays"), 3));
  const price = Number(cleanText(formData.get("price"), 16).replace(/[$,\s]/g, ""));
  const requestId = cleanText(formData.get("requestId"), 128);
  const result = await publishCatalogBatch({ name, sku, category, description, packSize, leadTimeDays, price }, [locationId], undefined, "SELECTED", requestId);
  return result.status === "success" ? { status: "success", message: `${name} is now managed from the corporate catalog for this store.` } : { status: "error", message: result.message || "The catalog item could not be published." };
};

export const getCatalogPublicationEligibility = async (): Promise<{ status: "success" | "error"; stores: CatalogPublicationEligibility[]; message?: string }> => {
  const session = await getCorporateSession();
  if (!session) return { status: "error", stores: [], message: "Corporate access has expired. Sign in again." };
  try {
    return { status: "success", stores: (await getCorporateCatalogLocations(session)).map(eligibleForCatalogPublication) };
  } catch (error) {
    return { status: "error", stores: [], message: error instanceof Error ? error.message : "Stores could not be loaded." };
  }
};

const persistPublicationBatch = async (batch: CatalogPublicationBatch): Promise<void> => {
  if (isCorporateSeedMode()) {
    previewBatches.set(batch.id, batch);
    return;
  }
  if (!firebaseDb) throw new Error("Catalog publication storage is not configured.");
  await firebaseDb.collection("catalogPublicationBatches").doc(batch.id).set(batch);
};

const persistNewScheduledBatch = async (batch: CatalogPublicationBatch): Promise<void> => {
  if (isCorporateSeedMode()) {
    const existing = previewBatches.get(batch.id);
    if (existing && existing.requestDigest !== batch.requestDigest) throw new Error("This publication reference is already in use.");
    if (existing) Object.assign(batch, existing); else previewBatches.set(batch.id, batch);
    return;
  }
  if (!firebaseDb) throw new Error("Catalog publication storage is not configured.");
  const reference = firebaseDb.collection("catalogPublicationBatches").doc(batch.id);
  await firebaseDb.runTransaction(async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists) {
      const durable = existing.data() as CatalogPublicationBatch;
      if (durable.requestDigest !== batch.requestDigest) throw new Error("This publication reference is already in use.");
      Object.assign(batch, durable);
      return;
    }
    transaction.create(reference, batch);
  });
};

const loadPublicationBatch = async (id: string): Promise<CatalogPublicationBatch | null> => {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  if (isCorporateSeedMode()) return previewBatches.get(id) || null;
  if (!firebaseDb) throw new Error("Catalog publication storage is not configured.");
  const document = await firebaseDb.collection("catalogPublicationBatches").doc(id).get();
  return document.exists ? document.data() as CatalogPublicationBatch : null;
};

/** Compatibility path for schema-v1 batches created before the master catalog. */
const applyLegacyPublicationToLocation = async (batch: CatalogPublicationBatch, location: CorporateLocation, actorName: string): Promise<{ destination: CatalogPublicationDestination; previous: CorporateCatalogItem | null }> => {
  const now = new Date().toISOString();
  const item = itemForPublication(batch.draft, location.id, actorName, batch.id, now);
  if (isCorporateSeedMode()) {
    const products = previewCatalog.get(location.id) || [];
    const previous = products.find((product) => product.id === item.id) || null;
    previewCatalog.set(location.id, [...products.filter((product) => product.id !== item.id), item]);
    return { destination: { locationId: location.id, status: "PUBLISHED", attempts: 1, completedAt: now }, previous };
  }
  if (!firebaseDb) throw new Error("Catalog storage is not configured.");
  const ref = firebaseDb.collection("units").doc(location.id).collection("products").doc(item.id);
  const existing = await ref.get();
  const previous = existing.exists ? itemFromUnknown(existing.id, location.id, existing.data()) : null;
  await ref.set(item);
  return { destination: { locationId: location.id, status: "PUBLISHED", attempts: 1, completedAt: now }, previous };
};

export const publishCatalogBatch = async (draftInput: CatalogPublicationDraft, locationIds: string[], scheduledAt?: string, scopeType: CatalogScopeType = "SELECTED", requestId?: string): Promise<{ status: "success" | "error"; batch?: CatalogPublicationBatch; message?: string }> => {
  const session = await getCorporateSession();
  if (!session) return { status: "error", message: "Corporate access has expired. Sign in again." };
  if (scopeType !== "UNIVERSAL" && scopeType !== "SELECTED") return { status: "error", message: "Choose a valid catalog audience." };
  if (scopeType === "UNIVERSAL" && !sessionCanManageUniversalCatalog(session)) return { status: "error", message: "Corporate-wide catalog access is required to publish to every active store." };
  const draft = normalizePublicationDraft(draftInput);
  const selectedIds = [...new Set(locationIds.filter((id): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(id)))].sort();
  if (!draft || !selectedIds.length || selectedIds.length > 500) return { status: "error", message: "Provide a complete item and select between 1 and 500 stores." };
  try {
    if (requestId) assertIdempotencyKey(requestId);
    const permitted = await getCorporateCatalogLocations(session);
    const byId = new Map(permitted.map((location) => [location.id, location]));
    const selected = scopeType === "UNIVERSAL" ? permitted : selectedIds.flatMap((id) => byId.get(id) ? [byId.get(id)!] : []);
    if (selected.length > 500) return { status: "error", message: "This catalog audience exceeds the current 500-store publication limit." };
    if (scopeType === "SELECTED" && selected.length !== selectedIds.length) return { status: "error", message: "One or more selected stores are outside your current access." };
    const scheduledTime = scheduledAt ? Date.parse(scheduledAt) : NaN;
    if (scheduledAt && (!Number.isFinite(scheduledTime) || scheduledTime <= Date.now())) return { status: "error", message: "Choose a future publication date and time." };
    const createdAt = new Date().toISOString();
    const resolvedLocationIds = selected.map((location) => location.id).sort();
    const requestDigest = digestCommandPayload({ draft, selectedIds: resolvedLocationIds, scheduledAt: scheduledAt || null, scopeType });
    const batchId = requestId ? getCommandRecordId(session.userId, requestId) : randomUUID().replaceAll("-", "");
    const existingBatch = requestId ? await loadPublicationBatch(batchId) : null;
    if (existingBatch) return existingBatch.requestDigest === requestDigest ? { status: "success", batch: existingBatch } : { status: "error", message: "This publication request was already used for different catalog changes." };
    const batch: CatalogPublicationBatch = {
      id: batchId, draft, effectiveAt: scheduledAt || createdAt,
      state: scheduledAt ? "SCHEDULED" : "PUBLISHING", createdAt, createdById: session.userId, createdByName: session.displayName,
      scopeType, schemaVersion: 2, requestDigest,
      destinations: selected.map((location) => {
        const eligibility = eligibleForCatalogPublication(location);
        return eligibility.eligible ? { locationId: location.id, status: scheduledAt ? "SCHEDULED" : "PENDING", attempts: 0 } : { locationId: location.id, status: "NOT_ELIGIBLE", attempts: 0, reason: eligibility.reason };
      }), previousItems: {},
    };
    if (scheduledAt) {
      await persistNewScheduledBatch(batch);
      return { status: "success", batch };
    }
    const eligibleLocations = selected.filter((location) => eligibleForCatalogPublication(location).eligible);
    let committed = false;
    if (eligibleLocations.length) {
      try {
        const completedAt = new Date().toISOString();
        batch.destinations = batch.destinations.map((destination) => destination.status === "PENDING" ? { ...destination, status: "PUBLISHED", attempts: 1, completedAt } : destination);
        batch.state = "COMPLETE";
        batch.rollbackUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        await commitMasterPublicationBatch(batch, session.displayName, eligibleLocations.map((location) => location.id));
        committed = true;
      } catch (error) {
        const durable = await loadPublicationBatch(batch.id).catch(() => null);
        if (durable?.requestDigest === batch.requestDigest && (durable.state === "COMPLETE" || durable.state === "NEEDS_ATTENTION")) {
          Object.assign(batch, durable);
          committed = true;
        } else {
          const reason = error instanceof Error ? error.message : "Publishing could not be confirmed.";
          batch.destinations = batch.destinations.map((destination) => {
            if (destination.status !== "PUBLISHED") return destination;
            const { completedAt: _completedAt, ...pendingDestination } = destination;
            void _completedAt;
            return { ...pendingDestination, status: "FAILED", attempts: 1, reason };
          });
          delete batch.rollbackUntil;
        }
      }
    }
    const published = batch.destinations.filter((destination) => destination.status === "PUBLISHED").length;
    const failed = batch.destinations.filter((destination) => destination.status === "FAILED").length;
    batch.state = failed || published === 0 ? "NEEDS_ATTENTION" : "COMPLETE";
    if (published) batch.rollbackUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    if (!committed) await persistPublicationBatch(batch);
    revalidatePath("/corporate/catalog");
    revalidatePath("/portal/supplies");
    return { status: "success", batch };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "The catalog batch could not be published." };
  }
};

export const retryCatalogPublicationDestinations = async (batchId: string, locationIds: string[]): Promise<{ status: "success" | "error"; batch?: CatalogPublicationBatch; message?: string }> => {
  const session = await getCorporateSession();
  if (!session) return { status: "error", message: "Corporate access has expired. Sign in again." };
  try {
    const batch = await loadPublicationBatch(batchId);
    if (!batch) return { status: "error", message: "This publication batch is unavailable." };
    const permitted = await getCorporateCatalogLocations(session);
    const byId = new Map(permitted.map((location) => [location.id, location]));
    if (batch.schemaVersion === 2) {
      if (batch.scopeType === "UNIVERSAL" && !sessionCanManageUniversalCatalog(session)) return { status: "error", message: "Corporate-wide catalog access is required to retry this publication." };
      const retryLocations = locationIds.flatMap((locationId) => {
        const destination = batch.destinations.find((candidate) => candidate.locationId === locationId && candidate.status === "FAILED");
        const location = byId.get(locationId);
        if (!destination || !location) return [];
        const eligibility = eligibleForCatalogPublication(location);
        if (!eligibility.eligible) {
          destination.status = "NOT_ELIGIBLE";
          destination.reason = eligibility.reason;
          return [];
        }
        return [location];
      });
      let committed = false;
      if (retryLocations.length) {
        try {
          const selectedLocationIds = [...new Set([...batch.destinations.filter((destination) => destination.status === "PUBLISHED").map((destination) => destination.locationId), ...retryLocations.map((location) => location.id)])];
          const completedAt = new Date().toISOString();
          for (const location of retryLocations) {
            const destination = batch.destinations.find((candidate) => candidate.locationId === location.id)!;
            destination.status = "PUBLISHED";
            destination.attempts += 1;
            destination.completedAt = completedAt;
            delete destination.reason;
          }
          batch.state = batch.destinations.some((destination) => destination.status === "FAILED") ? "NEEDS_ATTENTION" : "COMPLETE";
          batch.rollbackUntil = batch.rollbackUntil || new Date(Date.now() + 10 * 60 * 1000).toISOString();
          await commitMasterPublicationBatch(batch, session.displayName, selectedLocationIds, undefined, true);
          committed = true;
        } catch (error) {
          const durable = await loadPublicationBatch(batch.id).catch(() => null);
          if (durable?.requestDigest === batch.requestDigest && (durable.state === "COMPLETE" || durable.state === "NEEDS_ATTENTION")) {
            Object.assign(batch, durable);
            committed = true;
          } else {
            for (const location of retryLocations) {
              const destination = batch.destinations.find((candidate) => candidate.locationId === location.id)!;
              destination.status = "FAILED";
              delete destination.completedAt;
              destination.reason = error instanceof Error ? error.message : "Publishing could not be confirmed.";
            }
          }
        }
      }
      batch.state = batch.destinations.some((destination) => destination.status === "FAILED") || !batch.destinations.some((destination) => destination.status === "PUBLISHED") ? "NEEDS_ATTENTION" : "COMPLETE";
      if (!committed) await persistPublicationBatch(batch);
      revalidatePath("/corporate/catalog");
      revalidatePath("/portal/supplies");
      return { status: "success", batch };
    }
    for (const locationId of locationIds) {
      const destination = batch.destinations.find((candidate) => candidate.locationId === locationId);
      const location = byId.get(locationId);
      if (!destination || !location || destination.status !== "FAILED") continue;
      try {
        const result = await applyLegacyPublicationToLocation(batch, location, session.displayName);
        const index = batch.destinations.indexOf(destination);
        batch.destinations[index] = { ...result.destination, attempts: destination.attempts + 1 };
        batch.previousItems[locationId] = result.previous;
      } catch (error) {
        destination.attempts += 1;
        destination.reason = error instanceof Error ? error.message : "Publishing could not be confirmed.";
      }
    }
    batch.state = batch.destinations.some((destination) => destination.status === "FAILED") ? "NEEDS_ATTENTION" : "COMPLETE";
    await persistPublicationBatch(batch);
    return { status: "success", batch };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Failed stores could not be retried." };
  }
};

export const rollbackCatalogPublicationBatch = async (batchId: string): Promise<{ status: "success" | "error"; batch?: CatalogPublicationBatch; message?: string }> => {
  const session = await getCorporateSession();
  if (!session) return { status: "error", message: "Corporate access has expired. Sign in again." };
  try {
    const batch = await loadPublicationBatch(batchId);
    if (!batch || !batch.rollbackUntil || Date.parse(batch.rollbackUntil) <= Date.now()) return { status: "error", message: "The rollback window for this publication has ended." };
    const permitted = new Set((await getCorporateCatalogLocations(session)).map((location) => location.id));
    if (batch.schemaVersion === 2) {
      if (batch.scopeType === "UNIVERSAL" && !sessionCanManageUniversalCatalog(session)) return { status: "error", message: "Corporate-wide catalog access is required to restore this universal item." };
      const publishedDestinations = batch.destinations.filter((destination) => destination.status === "PUBLISHED");
      if (batch.scopeType !== "UNIVERSAL" && publishedDestinations.some((destination) => !permitted.has(destination.locationId))) return { status: "error", message: "You no longer have access to every store in this publication." };
      const itemId = productIdFor(batch.draft.sku);
      if (isCorporateSeedMode()) {
        const current = previewMasterCatalog.get(itemId);
        if (!current || current.publicationBatchId !== batch.id) {
          publishedDestinations.forEach((destination) => { destination.status = "ROLLBACK_SKIPPED"; destination.reason = "A later catalog change owns this item."; });
        } else {
          if (batch.previousMasterItem) previewMasterCatalog.set(itemId, batch.previousMasterItem);
          else previewMasterCatalog.delete(itemId);
          const completedAt = new Date().toISOString();
          publishedDestinations.forEach((destination) => { destination.status = "ROLLED_BACK"; destination.completedAt = completedAt; });
        }
        batch.state = "ROLLED_BACK";
        previewBatches.set(batch.id, batch);
      } else {
        if (!firebaseDb) throw new Error("Catalog storage is not configured.");
        const reference = firebaseDb.collection("corporateCatalogItems").doc(itemId);
        const batchReference = firebaseDb.collection("catalogPublicationBatches").doc(batch.id);
        const nextBatch = await firebaseDb.runTransaction(async (transaction) => {
          const [current, durableBatch] = await transaction.getAll(reference, batchReference);
          if (!durableBatch.exists) throw new Error("This publication batch is no longer available.");
          const next = structuredClone(batch);
          const nextPublished = next.destinations.filter((destination) => destination.status === "PUBLISHED");
          if (!current.exists || current.data()?.publicationBatchId !== batch.id) {
            nextPublished.forEach((destination) => { destination.status = "ROLLBACK_SKIPPED"; destination.reason = "A later catalog change owns this item."; });
          } else {
            if (batch.previousMasterItem) transaction.set(reference, batch.previousMasterItem);
            else transaction.delete(reference);
            const completedAt = new Date().toISOString();
            nextPublished.forEach((destination) => { destination.status = "ROLLED_BACK"; destination.completedAt = completedAt; });
          }
          next.state = "ROLLED_BACK";
          transaction.set(batchReference, next);
          return next;
        });
        Object.assign(batch, nextBatch);
      }
      revalidatePath("/corporate/catalog");
      revalidatePath("/portal/supplies");
      return { status: "success", batch };
    }
    for (const destination of batch.destinations.filter((candidate) => candidate.status === "PUBLISHED" && permitted.has(candidate.locationId))) {
      const previous = batch.previousItems[destination.locationId] || null;
      const itemId = productIdFor(batch.draft.sku);
      if (isCorporateSeedMode()) {
        const products = previewCatalog.get(destination.locationId) || [];
        previewCatalog.set(destination.locationId, previous ? [...products.filter((product) => product.id !== itemId), previous] : products.filter((product) => product.id !== itemId));
        destination.status = "ROLLED_BACK";
        continue;
      }
      if (!firebaseDb) throw new Error("Catalog storage is not configured.");
      const ref = firebaseDb.collection("units").doc(destination.locationId).collection("products").doc(itemId);
      const current = await ref.get();
      if (!current.exists || current.data()?.publicationBatchId !== batch.id) {
        destination.status = "ROLLBACK_SKIPPED";
        destination.reason = "A later catalog change owns this item.";
        continue;
      }
      if (previous) await ref.set(previous);
      else await ref.delete();
      destination.status = "ROLLED_BACK";
      destination.completedAt = new Date().toISOString();
    }
    batch.state = "ROLLED_BACK";
    await persistPublicationBatch(batch);
    revalidatePath("/corporate/catalog");
    revalidatePath("/portal/supplies");
    return { status: "success", batch };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "This publication could not be rolled back." };
  }
};

const scheduledLocation = async (locationId: string): Promise<CorporateLocation | null> => {
  if (!firebaseDb) return null;
  const document = await firebaseDb.collection("units").doc(locationId).get();
  if (!document.exists) return null;
  const data = document.data() || {};
  return {
    id: document.id,
    organizationId: typeof data.organizationId === "string" ? data.organizationId : typeof data.franchiseEntityId === "string" ? data.franchiseEntityId : undefined,
    regionId: typeof data.regionId === "string" ? data.regionId : undefined,
    name: typeof data.name === "string" ? data.name : document.id,
    code: typeof data.code === "string" ? data.code : document.id,
    market: typeof data.market === "string" ? data.market : undefined,
    status: typeof data.operatingStatus === "string" ? data.operatingStatus : typeof data.storeStatus === "string" ? data.storeStatus : "UNKNOWN",
    operatingStatus: typeof data.operatingStatus === "string" ? data.operatingStatus as CorporateLocation["operatingStatus"] : typeof data.storeStatus === "string" ? data.storeStatus as CorporateLocation["operatingStatus"] : "UNKNOWN",
    verificationStatus: typeof data.verification?.status === "string" ? data.verification.status as CorporateLocation["verificationStatus"] : "NOT_REVIEWED",
    verificationReason: typeof data.verification?.reason === "string" ? data.verification.reason : undefined,
    address: data.address && typeof data.address === "object" ? data.address as CorporateLocation["address"] : undefined,
    timeZone: typeof data.timeZone === "string" ? data.timeZone : undefined,
  };
};

const scheduledPublisherSession = async (batch: CatalogPublicationBatch): Promise<CorporateSession | null> => {
  if (!firebaseDb || !batch.createdById) return null;
  const document = await firebaseDb.collection("corporateStaff").doc(batch.createdById).get();
  const data = document.data();
  if (!document.exists || data?.status !== "ACTIVE" || typeof data.email !== "string") return null;
  return {
    userId: document.id,
    email: data.email,
    displayName: typeof data.displayName === "string" ? data.displayName : batch.createdByName,
    identityClass: "CORPORATE",
    expiresAt: Date.now() + 60_000,
    memberships: parseCorporateMemberships(data.memberships).filter((membership) => isActiveCorporateMembership(membership)),
    isDevelopmentPreview: false,
  };
};

const claimScheduledBatch = async (batchId: string, leaseToken: string): Promise<CatalogPublicationBatch | null> => {
  if (!firebaseDb) return null;
  const reference = firebaseDb.collection("catalogPublicationBatches").doc(batchId);
  return firebaseDb.runTransaction(async (transaction) => {
    const document = await transaction.get(reference);
    if (!document.exists) return null;
    const current = document.data() as CatalogPublicationBatch;
    const now = Date.now();
    const leaseExpired = !current.leaseUntil || Date.parse(current.leaseUntil) <= now;
    if (Date.parse(current.effectiveAt) > now || (current.state !== "SCHEDULED" && !(current.state === "PUBLISHING" && leaseExpired))) return null;
    const claimed = { ...current, state: "PUBLISHING" as const, leaseToken, leaseUntil: new Date(now + 5 * 60 * 1000).toISOString() };
    transaction.set(reference, claimed);
    return claimed;
  });
};

export const executeDueCatalogPublicationBatches = async (schedulerSecret: string): Promise<{ processed: number; published: number; failed: number }> => {
  const expectedSecret = process.env.CATALOG_PUBLICATION_CRON_SECRET || process.env.CRON_SECRET;
  if (!expectedSecret || schedulerSecret !== expectedSecret) throw new Error("Catalog publication scheduler is not authorized.");
  if (!firebaseDb || isCorporateSeedMode()) return { processed: 0, published: 0, failed: 0 };
  const snapshot = await firebaseDb.collection("catalogPublicationBatches").where("state", "in", ["SCHEDULED", "PUBLISHING"]).get();
  const candidates = snapshot.docs.map((document) => ({ id: document.id, batch: document.data() as CatalogPublicationBatch })).filter(({ batch }) => Date.parse(batch.effectiveAt) <= Date.now() && (batch.state === "SCHEDULED" || !batch.leaseUntil || Date.parse(batch.leaseUntil) <= Date.now()));
  let processed = 0;
  let published = 0;
  let failed = 0;
  for (const candidate of candidates) {
    const batch = await claimScheduledBatch(candidate.id, randomUUID());
    if (!batch) continue;
    const claimedLeaseToken = batch.leaseToken!;
    processed += 1;
    if (batch.schemaVersion === 2) {
      const actor = await scheduledPublisherSession(batch);
      const readyLocations: CorporateLocation[] = [];
      for (const destination of batch.destinations.filter((candidate) => candidate.status === "SCHEDULED" || batch.scopeType === "UNIVERSAL" && candidate.status === "NOT_ELIGIBLE")) {
        const location = await scheduledLocation(destination.locationId);
        if (!location) {
          destination.status = "FAILED";
          destination.attempts += 1;
          destination.reason = "Location record is no longer available.";
          failed += 1;
          continue;
        }
        const target = { locationId: location.id, organizationId: location.organizationId, regionId: location.regionId };
        const authorized = Boolean(actor && (batch.scopeType === "UNIVERSAL" ? sessionCanManageUniversalCatalog(actor) : hasCorporatePermission(actor, "MANAGE_CATALOG", target)));
        if (!authorized) {
          destination.status = "FAILED";
          destination.attempts += 1;
          destination.reason = "The original publisher no longer has access to this catalog audience.";
          failed += 1;
          continue;
        }
        const eligibility = eligibleForCatalogPublication(location);
        if (!eligibility.eligible) {
          destination.status = "NOT_ELIGIBLE";
          destination.reason = eligibility.reason;
          continue;
        }
        readyLocations.push(location);
      }
      let committed = false;
      if (readyLocations.length) {
        try {
          const completedAt = new Date().toISOString();
          for (const location of readyLocations) {
            const destination = batch.destinations.find((candidate) => candidate.locationId === location.id)!;
            destination.status = "PUBLISHED";
            destination.attempts += 1;
            destination.completedAt = completedAt;
          }
          batch.state = batch.destinations.some((destination) => destination.status === "FAILED") ? "NEEDS_ATTENTION" : "COMPLETE";
          batch.rollbackUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
          delete batch.leaseToken;
          delete batch.leaseUntil;
          await commitMasterPublicationBatch(batch, actor?.displayName || batch.createdByName, readyLocations.map((location) => location.id), claimedLeaseToken);
          published += readyLocations.length;
          committed = true;
        } catch (error) {
          const durable = await loadPublicationBatch(batch.id).catch(() => null);
          if (durable?.requestDigest === batch.requestDigest && (durable.state === "COMPLETE" || durable.state === "NEEDS_ATTENTION") && !durable.leaseToken) {
            Object.assign(batch, durable);
            published += readyLocations.length;
            committed = true;
          } else {
            for (const location of readyLocations) {
              const destination = batch.destinations.find((candidate) => candidate.locationId === location.id)!;
              destination.status = "FAILED";
              delete destination.completedAt;
              destination.reason = error instanceof Error ? error.message : "Publishing could not be confirmed.";
              failed += 1;
            }
            delete batch.rollbackUntil;
          }
        }
      }
      batch.state = batch.destinations.some((destination) => destination.status === "FAILED") || !batch.destinations.some((destination) => destination.status === "PUBLISHED") ? "NEEDS_ATTENTION" : "COMPLETE";
      if (batch.destinations.some((destination) => destination.status === "PUBLISHED")) batch.rollbackUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      delete batch.leaseToken;
      delete batch.leaseUntil;
      if (!committed) await persistClaimedPublicationBatch(batch, claimedLeaseToken);
      continue;
    }
    for (const destination of batch.destinations.filter((candidate) => candidate.status === "SCHEDULED")) {
      const location = await scheduledLocation(destination.locationId);
      if (!location) {
        destination.status = "FAILED";
        destination.attempts += 1;
        destination.reason = "Location record is no longer available.";
        failed += 1;
        continue;
      }
      const eligibility = eligibleForCatalogPublication(location);
      if (!eligibility.eligible) {
        destination.status = "NOT_ELIGIBLE";
        destination.reason = eligibility.reason;
        continue;
      }
      try {
        const result = await applyLegacyPublicationToLocation(batch, location, batch.createdByName);
        destination.status = result.destination.status;
        destination.attempts += 1;
        destination.completedAt = result.destination.completedAt;
        batch.previousItems[location.id] = result.previous;
        published += 1;
      } catch (error) {
        destination.status = "FAILED";
        destination.attempts += 1;
        destination.reason = error instanceof Error ? error.message : "Publishing could not be confirmed.";
        failed += 1;
      }
    }
    batch.state = batch.destinations.some((destination) => destination.status === "FAILED") ? "NEEDS_ATTENTION" : "COMPLETE";
    if (batch.destinations.some((destination) => destination.status === "PUBLISHED")) batch.rollbackUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    delete batch.leaseToken;
    delete batch.leaseUntil;
    await persistClaimedPublicationBatch(batch, claimedLeaseToken);
  }
  return { processed, published, failed };
};
