"use server";

import { firebaseDb } from "@/src/lib/firebase/admin";
import { getCorporateSession } from "./session";
import { assertCorporatePermission } from "./authorization";
import { getCorporateCatalog } from "./catalog";
import { getCorporateStorage } from "./storage";
import { masterCatalogItemFromUnknown } from "../catalog/master-catalog";
import { revalidatePath } from "next/cache";

export async function catalogEditorDraft(payload?: string) {
  const session = await getCorporateSession();
  if (!session || session.isDevelopmentPreview || !firebaseDb) return { error: "Saving drafts is unavailable for this session." };
  try {
    assertCorporatePermission(session, "MANAGE_CATALOG");
    const ref = firebaseDb.collection("corporateCatalogDrafts").doc(session.userId);
    if (payload !== undefined) {
      if (typeof payload !== "string" || payload.length > 50000) throw new Error("This draft is too large to save.");
      const parsed = JSON.parse(payload);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid draft.");
      await ref.set({ payload, updatedAt: new Date().toISOString() });
      return { saved: true };
    }
    const document = await ref.get();
    return { payload: document.exists ? String(document.data()?.payload || "") : "" };
  } catch { return { error: "The draft could not be saved or loaded. Your entries are still here." }; }
}

export async function loadCatalogItems(locationId: string) {
  const session = await getCorporateSession();
  if (!session) return { error: "Sign in again to view this store's items." };
  try { return { items: await getCorporateCatalog(session, locationId) }; }
  catch { return { error: "This store's catalog could not be loaded." }; }
}

export async function saveCatalogStoreOverride(input: { locationId: string; itemId: string; price: number; leadTimeDays: number; isAvailable: boolean }) {
  const session = await getCorporateSession();
  if (!session || session.isDevelopmentPreview || !firebaseDb) return { error: "Store exceptions are unavailable for this session." };
  try {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(input.locationId) || !/^[A-Za-z0-9_-]{1,128}$/.test(input.itemId)
      || !Number.isFinite(input.price) || input.price <= 0 || input.price > 100000
      || !Number.isSafeInteger(input.leadTimeDays) || input.leadTimeDays < 0 || input.leadTimeDays > 365) throw new Error("Review the store price and lead time.");
    const location = (await getCorporateStorage().getLocations(session)).find((candidate) => candidate.id === input.locationId);
    if (!location) throw new Error("This store is outside your current access.");
    assertCorporatePermission(session, "MANAGE_CATALOG", { locationId: location.id, organizationId: location.organizationId, regionId: location.regionId });
    const unitRef = firebaseDb.collection("units").doc(location.id);
    const masterRef = firebaseDb.collection("corporateCatalogItems").doc(input.itemId);
    const occurredAt = new Date().toISOString();
    const overrideRef = unitRef.collection("catalogOverrides").doc(input.itemId);
    const auditRef = firebaseDb.collection("corporateAuditEvents").doc();
    await firebaseDb.runTransaction(async (transaction) => {
      const [unitDocument, masterDocument, previousOverride] = await transaction.getAll(unitRef, masterRef, overrideRef);
      const unit = unitDocument.data() || {};
      const master = masterDocument.exists ? masterCatalogItemFromUnknown(masterDocument.id, masterDocument.data() || {}) : null;
      if (!unitDocument.exists) throw new Error("This store is no longer available.");
      assertCorporatePermission(session, "MANAGE_CATALOG", { locationId: unitDocument.id, organizationId: typeof unit.organizationId === "string" ? unit.organizationId : undefined, regionId: typeof unit.regionId === "string" ? unit.regionId : undefined });
      if (!master || (master.scopeType === "SELECTED" && !master.locationIds.includes(unitDocument.id))) throw new Error("This master item is not available to the selected store.");
      const previous = previousOverride.data() || {};
      transaction.set(overrideRef, { price: input.price, leadTimeDays: input.leadTimeDays, isAvailable: input.isAvailable, updatedAt: occurredAt, updatedBy: session.userId }, { merge: true });
      transaction.create(auditRef, { id: auditRef.id, recordId: master.id, recordType: "catalog", locationId: location.id, organizationId: location.organizationId, regionId: location.regionId, actorId: session.userId, actorName: session.displayName, action: "CATALOG_STORE_OVERRIDE_SAVED", occurredAt, commandId: auditRef.id, previousVersion: null, nextVersion: 1, changes: { price: { before: typeof previous.price === "number" ? previous.price : master.price, after: input.price }, leadTimeDays: { before: typeof previous.leadTimeDays === "number" ? previous.leadTimeDays : master.leadTimeDays, after: input.leadTimeDays }, isAvailable: { before: typeof previous.isAvailable === "boolean" ? previous.isAvailable : master.isAvailable, after: input.isAvailable } } });
    });
    revalidatePath("/corporate/catalog");
    revalidatePath("/portal/supplies");
    return { saved: true, message: `Store exception saved for ${location.name}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The store exception could not be saved." };
  }
}

export async function clearCatalogStoreOverride(input: { locationId: string; itemId: string }) {
  const session = await getCorporateSession();
  if (!session || session.isDevelopmentPreview || !firebaseDb) return { error: "Store exceptions are unavailable for this session." };
  try {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(input.locationId) || !/^[A-Za-z0-9_-]{1,128}$/.test(input.itemId)) throw new Error("This store exception is invalid.");
    const unitRef = firebaseDb.collection("units").doc(input.locationId);
    const masterRef = firebaseDb.collection("corporateCatalogItems").doc(input.itemId);
    const overrideRef = unitRef.collection("catalogOverrides").doc(input.itemId);
    const auditRef = firebaseDb.collection("corporateAuditEvents").doc();
    const occurredAt = new Date().toISOString();
    let locationName = input.locationId;
    await firebaseDb.runTransaction(async (transaction) => {
      const [unitDocument, masterDocument, overrideDocument] = await transaction.getAll(unitRef, masterRef, overrideRef);
      const unit = unitDocument.data() || {};
      const master = masterDocument.exists ? masterCatalogItemFromUnknown(masterDocument.id, masterDocument.data() || {}) : null;
      if (!unitDocument.exists || !master) throw new Error("This store or master item is no longer available.");
      locationName = typeof unit.name === "string" ? unit.name : unitDocument.id;
      assertCorporatePermission(session, "MANAGE_CATALOG", { locationId: unitDocument.id, organizationId: typeof unit.organizationId === "string" ? unit.organizationId : undefined, regionId: typeof unit.regionId === "string" ? unit.regionId : undefined });
      if (!overrideDocument.exists) return;
      transaction.delete(overrideRef);
      transaction.create(auditRef, { id: auditRef.id, recordId: master.id, recordType: "catalog", locationId: unitDocument.id, organizationId: unit.organizationId || null, regionId: unit.regionId || null, actorId: session.userId, actorName: session.displayName, action: "CATALOG_STORE_OVERRIDE_REMOVED", occurredAt, commandId: auditRef.id, previousVersion: 1, nextVersion: 2, changes: { override: { before: true, after: false } } });
    });
    revalidatePath("/corporate/catalog");
    revalidatePath("/portal/supplies");
    return { saved: true, message: `Master defaults restored for ${locationName}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The store exception could not be removed." };
  }
}
