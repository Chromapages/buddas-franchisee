"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { firebaseDb } from "../../../lib/firebase/admin.ts";
import { assertCorporatePermission } from "../authorization.ts";
import { getCorporateSession } from "../session.ts";

export type LocationActionState = { status: "idle" | "success" | "error"; message: string; locationId?: string; version?: number; nextStep?: "VERIFY" | "ACTIVATE" | "COMPLETE" };

const text = (formData: FormData, key: string, max = 128) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.normalize("NFKC").trim().slice(0, max) : "";
};

const normalizeCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const validTimeZone = (value: string) => {
  try { Intl.DateTimeFormat(undefined, { timeZone: value }); return true; } catch { return false; }
};

const sameAddress = (current: unknown, next: { line1: string; line2?: string; city: string; state: string; postalCode?: string; country: string }): boolean => {
  if (!current || typeof current !== "object") return false;
  const stored = current as Record<string, unknown>;
  return String(stored.line1 || "") === next.line1
    && String(stored.line2 || "") === (next.line2 || "")
    && String(stored.city || "") === next.city
    && String(stored.state || "") === next.state
    && String(stored.postalCode || "") === (next.postalCode || "")
    && String(stored.country || "") === next.country;
};

export async function runLocationAction(_previous: LocationActionState, formData: FormData): Promise<LocationActionState> {
  const session = await getCorporateSession();
  if (!session || !firebaseDb) return { status: "error", message: "Corporate store management is unavailable. Sign in again and retry." };
  const action = text(formData, "action", 32);
  const id = text(formData, "locationId", 128);
  const expectedVersion = Number(text(formData, "expectedVersion", 16));
  const name = text(formData, "name");
  const code = normalizeCode(text(formData, "code", 32));
  const organizationId = text(formData, "organizationId", 128);
  const regionId = text(formData, "regionId", 128);
  const market = text(formData, "market", 128);
  const line1 = text(formData, "line1", 160);
  const line2 = text(formData, "line2", 160);
  const city = text(formData, "city", 100);
  const state = text(formData, "state", 64);
  const postalCode = text(formData, "postalCode", 24);
  const country = text(formData, "country", 2).toUpperCase();
  const timeZone = text(formData, "timeZone", 64);
  const reason = text(formData, "reason", 500);
  const operatorId = text(formData, "operatorId", 128);
  const target = { ...(organizationId ? { organizationId } : {}), ...(regionId ? { regionId } : {}), ...(id ? { locationId: id } : {}) };
  try {
    if (action === "CREATE_DRAFT") assertCorporatePermission(session, "MANAGE_LOCATIONS", target);
    else if (action === "VERIFY") assertCorporatePermission(session, "VERIFY_LOCATIONS", target);
    else if (action === "ASSIGN_OPERATOR") assertCorporatePermission(session, "MANAGE_LOCATION_ASSIGNMENTS", target);
    else assertCorporatePermission(session, "MANAGE_LOCATIONS", target);
    if (!name || !code || !organizationId || !regionId || !line1 || !city || !state || !country || !validTimeZone(timeZone) || (["US", "CA"].includes(country) && !postalCode)) throw new Error("Complete the required store, ownership, address, postal code, and time-zone fields.");
    const newId = id || `LOC-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
    const unitRef = firebaseDb.collection("units").doc(newId);
    const codeRef = firebaseDb.collection("locationCodes").doc(code);
    const auditRef = firebaseDb.collection("corporateAuditEvents").doc();
    const occurredAt = new Date().toISOString();
    let nextVersion = 1;
    await firebaseDb.runTransaction(async (transaction) => {
      const [unit, codeRecord, organization, region] = await transaction.getAll(unitRef, codeRef, firebaseDb.collection("franchiseEntities").doc(organizationId), firebaseDb.collection("corporateRegions").doc(regionId));
      if (!organization.exists || !region.exists) throw new Error("Choose an existing organization and operating region.");
      const current = unit.data();
      if (action === "CREATE_DRAFT") {
        if (unit.exists || codeRecord.exists) throw new Error("A store already uses this code. Choose a different code.");
      } else {
        if (!unit.exists) throw new Error("This location is no longer available.");
        if (!Number.isSafeInteger(expectedVersion) || current?.version !== expectedVersion) throw new Error("This location changed. Reload it before saving.");
        assertCorporatePermission(session, action === "VERIFY" ? "VERIFY_LOCATIONS" : action === "ASSIGN_OPERATOR" ? "MANAGE_LOCATION_ASSIGNMENTS" : "MANAGE_LOCATIONS", { locationId: newId, organizationId: current?.organizationId, regionId: current?.regionId });
        if (current?.organizationId !== organizationId || current?.regionId !== regionId) assertCorporatePermission(session, "MANAGE_LOCATIONS", { organizationId, regionId });
        if (codeRecord.exists && codeRecord.data()?.locationId !== newId) throw new Error("A store already uses this code. Choose a different code.");
      }
      const address = { line1, ...(line2 ? { line2 } : {}), city, state, ...(postalCode ? { postalCode } : {}), country };
      const materialChanged = current && (current.organizationId !== organizationId || current.regionId !== regionId || !sameAddress(current.address, address));
      const priorVersion = Number.isSafeInteger(current?.version) ? current.version : 0;
      nextVersion = priorVersion + 1;
      const operatingStatus = action === "ACTIVATE" ? "ACTIVE" : action === "SUSPEND" ? "SUSPENDED" : action === "CLOSE" ? "CLOSED" : current?.operatingStatus || "DRAFT";
      const verification = action === "VERIFY" ? { status: "VERIFIED", reviewedAt: occurredAt, reviewerId: session.userId, ...(reason ? { reason } : {}) } : materialChanged ? { status: "NOT_REVIEWED" } : current?.verification || { status: "NOT_REVIEWED" };
      if (action === "ACTIVATE" && verification.status !== "VERIFIED") throw new Error("Verify the current store record before activating it.");
      if (action === "ASSIGN_OPERATOR" && current?.operatingStatus !== "ACTIVE") throw new Error("Confirm and activate this store before assigning its active operator.");
      let assignedOperatorIds = Array.isArray(current?.assignedOperatorIds) ? current.assignedOperatorIds.filter((value: unknown): value is string => typeof value === "string") : [];
      if (action === "ACTIVATE" || action === "ASSIGN_OPERATOR") {
        assertCorporatePermission(session, "MANAGE_LOCATION_ASSIGNMENTS", { locationId: newId, organizationId: current?.organizationId, regionId: current?.regionId });
        if (!operatorId) throw new Error("Choose an enabled operator before activating this store.");
        const operatorRef = firebaseDb.collection("operators").doc(operatorId);
        const [operator, corporateIdentity] = await transaction.getAll(operatorRef, firebaseDb.collection("corporateStaff").doc(operatorId)); const operatorData = operator.data();
        if (!operator.exists || operatorData?.status !== "ACTIVE" || corporateIdentity.data()?.status === "ACTIVE") throw new Error("The selected operator is no longer available.");
        assignedOperatorIds = [...new Set([...assignedOperatorIds, operatorId])];
        const managedUnitIds = [...new Set([...(Array.isArray(operatorData?.managedUnitIds) ? operatorData.managedUnitIds : []), newId])];
        transaction.update(operatorRef, { managedUnitIds, activeUnitId: operatorData?.activeUnitId || newId, activeUnitName: operatorData?.activeUnitName || name, updatedAt: occurredAt });
      }
      const record = { id: newId, name, code, organizationId, regionId, market, address, timeZone, operatingStatus, storeStatus: operatingStatus, verification, assignedOperatorIds, schemaVersion: 1, version: priorVersion + 1, createdAt: current?.createdAt || occurredAt, createdBy: current?.createdBy || session.userId, updatedAt: occurredAt, updatedBy: session.userId };
      if (current?.code && current.code !== code) transaction.delete(firebaseDb.collection("locationCodes").doc(String(current.code)));
      transaction.set(unitRef, record, { merge: true });
      transaction.set(codeRef, { locationId: newId, code, updatedAt: occurredAt });
      transaction.create(auditRef, { id: auditRef.id, recordId: newId, recordType: "location", actorId: session.userId, actorName: session.displayName, action, occurredAt, commandId: auditRef.id, previousVersion: current ? priorVersion : null, nextVersion: priorVersion + 1, organizationId, regionId, locationId: newId, changes: { operatingStatus: { before: current?.operatingStatus || null, after: operatingStatus }, verificationStatus: { before: current?.verification?.status || null, after: verification.status } } });
    });
    revalidatePath("/corporate/directory");
    revalidatePath(`/corporate/directory/locations/${newId}`);
    revalidatePath("/corporate/catalog");
    return { status: "success", message: action === "CREATE_DRAFT" || action === "SAVE_DETAILS" ? "Store setup saved. Continue to confirm details." : action === "VERIFY" ? "Store details confirmed. Continue to assignment and activation." : action === "ACTIVATE" ? "Store activated." : action === "ASSIGN_OPERATOR" ? "Store operator assigned." : "Location updated.", locationId: newId, version: nextVersion, nextStep: action === "CREATE_DRAFT" || action === "SAVE_DETAILS" ? "VERIFY" : action === "VERIFY" ? "ACTIVATE" : action === "ACTIVATE" || action === "ASSIGN_OPERATOR" ? "COMPLETE" : undefined };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "The location change could not be saved." };
  }
}

export async function assignLocationOperator(_previous: LocationActionState, formData: FormData): Promise<LocationActionState> {
  const session = await getCorporateSession();
  if (!session || !firebaseDb) return { status: "error", message: "Corporate store management is unavailable." };
  const locationId = text(formData, "locationId", 128); const operatorId = text(formData, "operatorId", 128);
  try {
    const unitRef = firebaseDb.collection("units").doc(locationId); const operatorRef = firebaseDb.collection("operators").doc(operatorId); const auditRef = firebaseDb.collection("corporateAuditEvents").doc(); const occurredAt = new Date().toISOString();
    await firebaseDb.runTransaction(async (transaction) => {
      const [unit, operator] = await transaction.getAll(unitRef, operatorRef); const unitData = unit.data(); const operatorData = operator.data();
      if (!unit.exists || !operator.exists || operatorData?.status !== "ACTIVE") throw new Error("Choose an enabled existing operator.");
      assertCorporatePermission(session, "MANAGE_LOCATION_ASSIGNMENTS", { locationId, organizationId: unitData?.organizationId, regionId: unitData?.regionId });
      const assigned = [...new Set([...(Array.isArray(unitData?.assignedOperatorIds) ? unitData.assignedOperatorIds : []), operatorId])];
      const managed = [...new Set([...(Array.isArray(operatorData?.managedUnitIds) ? operatorData.managedUnitIds : []), locationId])];
      transaction.update(unitRef, { assignedOperatorIds: assigned, updatedAt: occurredAt, updatedBy: session.userId, version: (Number.isSafeInteger(unitData?.version) ? unitData.version : 0) + 1 });
      transaction.update(operatorRef, { managedUnitIds: managed, activeUnitId: operatorData?.activeUnitId || locationId, activeUnitName: operatorData?.activeUnitName || unitData?.name || locationId, updatedAt: occurredAt });
      transaction.create(auditRef, { id: auditRef.id, recordId: locationId, recordType: "location", actorId: session.userId, actorName: session.displayName, action: "OPERATOR_ASSIGNED", occurredAt, commandId: auditRef.id, previousVersion: Number.isSafeInteger(unitData?.version) ? unitData.version : null, nextVersion: (Number.isSafeInteger(unitData?.version) ? unitData.version : 0) + 1, locationId, organizationId: unitData?.organizationId, regionId: unitData?.regionId, changes: { operatorId: { before: null, after: operatorId } } });
    });
    revalidatePath(`/corporate/directory/locations/${locationId}`); return { status: "success", message: "Operator assigned to this store." };
  } catch (error) { return { status: "error", message: error instanceof Error ? error.message : "The operator could not be assigned." }; }
}
