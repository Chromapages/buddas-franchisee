"use server";

import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { firebaseDb } from "@/src/lib/firebase/admin";
import { getPortalSession } from "@/src/features/auth/session";
import { assertPortalPermission } from "./authorization";
import { recordPortalAudit } from "./audit";
import { defaultPortalStorage } from "./storage-adapter";
import { expansionApplicationSchema } from "./expansion-schema";
import { canTransitionExpansionStatus, EXPANSION_STATUS, isExpansionStatus, type ExpansionApplicationStatus } from "./expansion-status";
import { getExpansionApplication, hasOpenMarketRequest } from "./expansion-records";

export type ExpansionApplicationActionState =
  | { status: "idle"; message: "" }
  | { status: "error"; message: string }
  | { status: "success"; message: string; applicationId: string };

export type ExpansionStageActionState =
  | { status: "idle"; message: "" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

const ensureFranchiseEntity = async (session: NonNullable<Awaited<ReturnType<typeof getPortalSession>>>): Promise<string> => {
  if (!firebaseDb) throw new Error("Firestore is not configured.");
  const operatorRef = firebaseDb.collection("operators").doc(session.userId);
  const operator = await operatorRef.get();
  const data = operator.data() as Record<string, unknown> | undefined;
  if (!data) throw new Error("Operator profile is unavailable.");
  const existingEntityId = typeof data.franchiseEntityId === "string" && data.franchiseEntityId.trim() ? data.franchiseEntityId.trim() : null;
  if (existingEntityId) return existingEntityId;

  const currentUnit = await defaultPortalStorage.getLocationById(session.locationId);
  const entityId = `entity-${session.userId}`;
  const batch = firebaseDb.batch();
  batch.set(firebaseDb.collection("franchiseEntities").doc(entityId), {
    ...(currentUnit?.franchiseeName ? { legalName: currentUnit.franchiseeName } : {}),
    createdAt: new Date().toISOString(),
    createdByOperatorId: session.userId,
  }, { merge: true });
  batch.update(operatorRef, { franchiseEntityId: entityId, updatedAt: new Date().toISOString() });
  await batch.commit();
  return entityId;
};

export const submitExpansionApplicationAction = async (
  _previousState: ExpansionApplicationActionState,
  formData: FormData,
): Promise<ExpansionApplicationActionState> => {
  const session = await getPortalSession();
  if (!session) return { status: "error", message: "Your session has expired. Please log in again." };
  assertPortalPermission(session, "CREATE_EXPANSION_REQUEST");
  if (formData.get("reviewedUnitId") !== session.locationId) {
    return { status: "error", message: "Your working unit has changed. Reload Growth Requests and review the new unit before submitting." };
  }

  const parsed = expansionApplicationSchema.safeParse({
    targetMarket: formData.get("targetMarket"),
    preferredTimeline: formData.get("preferredTimeline"),
    investmentRange: formData.get("investmentRange"),
    siteReadiness: formData.get("siteReadiness"),
    operatingPlan: formData.get("operatingPlan"),
    territoryAcknowledgement: formData.get("territoryAcknowledgement"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message || "Review the request details before submitting." };

  try {
    if (!firebaseDb) throw new Error("Firestore is not configured.");
    const entityId = await ensureFranchiseEntity(session);
    const normalizedTargetMarket = parsed.data.targetMarket.toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();
    if (await hasOpenMarketRequest(entityId, normalizedTargetMarket)) {
      return { status: "error", message: "An open request already exists for this target market. Review its status before creating another." };
    }
    const applicationId = `EXP-${randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();
    const applicationRef = firebaseDb.collection("franchiseEntities").doc(entityId).collection("expansionApplications").doc(applicationId);
    await firebaseDb.runTransaction(async (transaction) => {
      const operator = await transaction.get(firebaseDb.collection("operators").doc(session.userId));
      const operatorData = operator.data() as Record<string, unknown> | undefined;
      if (!operator.exists || operatorData?.franchiseEntityId !== entityId || !Array.isArray(operatorData.managedUnitIds) || !operatorData.managedUnitIds.includes(session.locationId)) throw new Error("Operator scope changed before submission.");
      transaction.create(applicationRef, {
        applicantOperatorId: session.userId,
        applicantName: session.displayName || session.email,
        applicantEmail: session.email,
        originatingUnitId: session.locationId,
        targetMarket: parsed.data.targetMarket,
        normalizedTargetMarket,
        preferredTimeline: parsed.data.preferredTimeline,
        investmentRange: parsed.data.investmentRange,
        siteReadiness: parsed.data.siteReadiness,
        operatingPlan: parsed.data.operatingPlan,
        status: "SUBMITTED",
        submittedAt: now,
        updatedAt: now,
      });
    });
    await recordPortalAudit({ actor: session, action: "EXPANSION_APPLICATION_SUBMITTED", outcome: "SUCCESS", unitId: session.locationId, resourceType: "expansion_application", resourceId: applicationId, metadata: { entityId } });
    revalidatePath("/portal/expansion");
    return { status: "success", message: "Additional-unit request submitted for Franchise Development review.", applicationId };
  } catch {
    await recordPortalAudit({ actor: session, action: "EXPANSION_APPLICATION_SUBMITTED", outcome: "FAILURE", unitId: session.locationId, resourceType: "expansion_application" });
    return { status: "error", message: "The request could not be submitted. No application was confirmed; try again or contact Operations Support." };
  }
};

export const updateExpansionApplicationStageAction = async (
  _previousState: ExpansionStageActionState,
  formData: FormData,
): Promise<ExpansionStageActionState> => {
  const session = await getPortalSession();
  if (!session) return { status: "error", message: "Your session has expired. Please log in again." };
  assertPortalPermission(session, "MANAGE_EXPANSION_REQUESTS");
  const entityId = String(formData.get("entityId") ?? "").trim();
  const applicationId = String(formData.get("applicationId") ?? "").trim();
  const nextStatusValue = String(formData.get("nextStatus") ?? "").trim();
  const provisionedUnitId = String(formData.get("provisionedUnitId") ?? "").trim();
  if (!entityId || !applicationId || !isExpansionStatus(nextStatusValue) || !firebaseDb) return { status: "error", message: "Select a valid next stage." };

  const application = await getExpansionApplication(entityId, applicationId);
  if (!application || !canTransitionExpansionStatus(application.status, nextStatusValue)) {
    await recordPortalAudit({ actor: session, action: "EXPANSION_APPLICATION_STAGE_CHANGED", outcome: "DENIED", resourceType: "expansion_application", resourceId: applicationId, metadata: { reason: "INVALID_TRANSITION", attemptedStatus: nextStatusValue } });
    return { status: "error", message: "That stage change is not allowed from the current application status." };
  }

  const applicationRef = firebaseDb.collection("franchiseEntities").doc(entityId).collection("expansionApplications").doc(applicationId);
  const now = new Date().toISOString();
  let validatedUnitId = application.provisionedUnitId;
  try {
    if (nextStatusValue === "BUILDOUT") {
      if (!provisionedUnitId) return { status: "error", message: "Enter the existing Firestore unit code before beginning Buildout." };
      const unit = await defaultPortalStorage.getLocationById(provisionedUnitId);
      if (!unit) return { status: "error", message: "That unit does not exist in the authorized unit registry." };
      validatedUnitId = unit.id;
    }
    if (nextStatusValue === "ACTIVE") {
      if (!validatedUnitId) return { status: "error", message: "A validated Buildout unit is required before activation." };
      const unit = await defaultPortalStorage.getLocationById(validatedUnitId);
      if (!unit) return { status: "error", message: "The provisioned unit is no longer available in the unit registry." };
      const operatorRef = firebaseDb.collection("operators").doc(application.applicantOperatorId);
      await firebaseDb.runTransaction(async (transaction) => {
        const [operator, currentApplication] = await Promise.all([transaction.get(operatorRef), transaction.get(applicationRef)]);
        const currentData = currentApplication.data() as Record<string, unknown> | undefined;
        if (!operator.exists || currentData?.status !== "BUILDOUT" || currentData.provisionedUnitId !== unit.id) throw new Error("Application changed before activation.");
        transaction.update(applicationRef, { status: "ACTIVE", updatedAt: now, activatedAt: now });
        transaction.update(operatorRef, { managedUnitIds: FieldValue.arrayUnion(unit.id), updatedAt: now });
      });
      await recordPortalAudit({ actor: session, action: "EXPANSION_UNIT_PROVISIONED", outcome: "SUCCESS", unitId: unit.id, resourceType: "expansion_application", resourceId: applicationId, metadata: { entityId, previousStatus: application.status, newStatus: "ACTIVE" } });
    } else {
      await firebaseDb.runTransaction(async (transaction) => {
        const currentApplication = await transaction.get(applicationRef);
        const currentData = currentApplication.data() as Record<string, unknown> | undefined;
        if (!currentApplication.exists || currentData?.status !== application.status) throw new Error("Application changed before update.");
        transaction.update(applicationRef, { status: nextStatusValue, updatedAt: now, ...(nextStatusValue === "BUILDOUT" ? { provisionedUnitId: validatedUnitId } : {}) });
      });
      await recordPortalAudit({ actor: session, action: "EXPANSION_APPLICATION_STAGE_CHANGED", outcome: "SUCCESS", resourceType: "expansion_application", resourceId: applicationId, metadata: { entityId, previousStatus: application.status, newStatus: nextStatusValue } });
    }
    revalidatePath("/portal/expansion");
    revalidatePath("/portal/account");
    return { status: "success", message: `Application moved to ${EXPANSION_STATUS[nextStatusValue].label}.` };
  } catch {
    await recordPortalAudit({ actor: session, action: "EXPANSION_APPLICATION_STAGE_CHANGED", outcome: "FAILURE", resourceType: "expansion_application", resourceId: applicationId, metadata: { attemptedStatus: nextStatusValue } });
    return { status: "error", message: "The application changed or could not be updated. Reload the queue before trying again." };
  }
};
