"use server";

import { revalidatePath } from "next/cache";
import { firebaseAdminAuth, firebaseDb } from "../../lib/firebase/admin";
import { assertCorporatePermission, hasCorporatePermission, isActiveCorporateMembership, parseCorporateMemberships } from "./authorization";
import { assertCommandVersion, assertSameCommand, CorporateCommandError, digestCommandPayload, getCommandRecordId } from "./commands";
import { getCorporateSession } from "./session";
import type { CorporateMembership, CorporateSession, WorkRecord } from "./types";

export type CorporateAccessActionResult = { status: "success" | "error"; message: string; version?: number };

const targetsFor = (membership: CorporateMembership) => membership.scope.type === "corporate" ? [{}]
  : membership.scope.type === "organizations" ? membership.scope.organizationIds.map((organizationId) => ({ organizationId }))
    : membership.scope.type === "regions" ? membership.scope.regionIds.map((regionId) => ({ regionId }))
    : membership.scope.locationIds.map((locationId) => ({ locationId }));

/** Existing identities only. Grants and invitations require a separate reviewed provisioning process. */
export const changeCorporateAccessStatusAction = async (formData: FormData): Promise<CorporateAccessActionResult> => {
  const session = await getCorporateSession();
  if (!session) return { status: "error", message: "Sign in with authorized corporate access to continue." };
  if (session.isDevelopmentPreview) return { status: "error", message: "Access changes are unavailable in the fictional preview. No identity was changed." };
  if (!firebaseDb || !firebaseAdminAuth) return { status: "error", message: "Corporate identity administration is not configured." };
  const targetId = String(formData.get("targetUserId") || "");
  const nextStatus = String(formData.get("status") || "");
  const reason = String(formData.get("reason") || "").trim();
  const expectedVersion = Number(formData.get("expectedVersion"));
  const idempotencyKey = String(formData.get("idempotencyKey") || "");
  const confirmed = formData.get("confirmation") === "confirmed";
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(targetId) || targetId === session.userId || !["ACTIVE", "SUSPENDED"].includes(nextStatus) || reason.length < 8 || reason.length > 500) {
    return { status: "error", message: "Choose another existing colleague, a valid status, and a reason of 8–500 characters. Self-suspension and self-reinstatement are not supported." };
  }
  if (!confirmed) return { status: "error", message: "Review the access and assigned-work impact before confirming this change." };
  try {
    assertCorporatePermission(session, "MANAGE_ACCESS");
    const providerUser = await firebaseAdminAuth.getUser(targetId);
    if (nextStatus === "ACTIVE" && (providerUser.disabled || !providerUser.emailVerified)) throw new CorporateCommandError("INVALID_COMMAND", "Reinstatement requires an enabled identity with verified email.");
    const commandId = getCommandRecordId(session.userId, idempotencyKey);
    const digest = digestCommandPayload({ targetId, nextStatus, reason, expectedVersion });
    const targetRef = firebaseDb.collection("corporateStaff").doc(targetId);
    const commandRef = firebaseDb.collection("corporateCommands").doc(commandId);
    const occurredAt = new Date().toISOString();
    const database = firebaseDb;
    const result = await database.runTransaction(async (tx) => {
      const [actorDoc, targetDoc, priorCommand] = await tx.getAll(database.collection("corporateStaff").doc(session.userId), targetRef, commandRef);
      const actor = actorDoc.data();
      const target = targetDoc.data();
      if (!actor || actor.status !== "ACTIVE" || !target) throw new CorporateCommandError("NOT_FOUND", "The identity or its current administrative access is unavailable.");
      const currentActor: CorporateSession = { ...session, memberships: parseCorporateMemberships(actor.memberships) };
      const memberships = parseCorporateMemberships(target.memberships);
      if (!memberships.length) throw new CorporateCommandError("INVALID_COMMAND", "This identity has no reviewed memberships. Use the provisioning process.");
      for (const membership of memberships) for (const scope of targetsFor(membership)) assertCorporatePermission(currentActor, "MANAGE_ACCESS", scope);
      if (priorCommand.exists) {
        const prior = priorCommand.data()!;
        assertSameCommand(String(prior.digest), digest);
        return { version: Number(prior.version), reassigned: Number(prior.reassigned), replayed: true, scopeTargets: memberships.flatMap(targetsFor) };
      }
      const version = Number.isSafeInteger(target.version) ? target.version as number : 1;
      assertCommandVersion(version, expectedVersion);
      if (target.status === nextStatus || !["ACTIVE", "SUSPENDED"].includes(String(target.status))) throw new CorporateCommandError("INVALID_COMMAND", "This transition is not available for the identity's current state.");
      if (nextStatus === "ACTIVE" && !memberships.some((membership) => isActiveCorporateMembership(membership))) throw new CorporateCommandError("INVALID_COMMAND", "No active unexpired memberships remain. A reviewed grant is required before reinstatement.");
      const assignedSnapshot = nextStatus === "SUSPENDED"
        ? await tx.get(database.collection("corporateWorkRecords").where("assignedToUserId", "==", targetId).limit(100)) : null;
      if (assignedSnapshot && assignedSnapshot.size >= 100) throw new CorporateCommandError("INVALID_COMMAND", "This identity owns too much work for one safe change. Arrange a reviewed reassignment before suspension.");
      const work = (assignedSnapshot?.docs || []).map((doc) => ({ ref: doc.ref, record: { ...doc.data(), id: doc.id } as WorkRecord })).filter(({ record }) => !record.isClosed);
      for (const item of work) assertCorporatePermission(currentActor, "MANAGE_ACCESS", item.record);
      const stewardGrants = memberships.filter((membership) => membership.bundle === "access_steward" && isActiveCorporateMembership(membership));
      if (nextStatus === "SUSPENDED" && stewardGrants.length) {
        const staff = await tx.get(database.collection("corporateStaff").where("status", "==", "ACTIVE"));
        for (const grant of stewardGrants) for (const scope of targetsFor(grant)) {
          const covered = staff.docs.some((doc) => doc.id !== targetId && hasCorporatePermission({ ...currentActor, userId: doc.id, memberships: parseCorporateMemberships(doc.data().memberships) }, "MANAGE_ACCESS", scope));
          if (!covered) throw new CorporateCommandError("INVALID_COMMAND", "This would remove the last active access steward for part of the scope. Establish an approved replacement first.");
        }
      }
      const support = work.filter(({ record }) => record.type === "support" && record.locationId);
      const supportRefs = support.map(({ record }) => database.collection("units").doc(record.locationId!).collection("supportTickets").doc(record.reference));
      const supportDocs = supportRefs.length ? await tx.getAll(...supportRefs) : [];
      // All transaction reads finish before writes. Membership denial is effective immediately.
      tx.update(targetRef, { status: nextStatus, version: version + 1, updatedAt: occurredAt });
      for (const item of work) {
        const { assignedToUserId: _oldOwner, assignedToName: _oldName, ...record } = item.record;
        tx.set(item.ref, { ...record, version: record.version + 1, updatedAt: occurredAt, nextAction: "Intake team to assign a new owner" });
      }
      supportDocs.forEach((doc) => {
        if (!doc.exists || doc.data()?.assignedToUserId !== targetId) return;
        const { assignedToUserId: _oldOwner, ...data } = doc.data()!;
        tx.set(doc.ref, { ...data, version: (Number.isSafeInteger(data.version) ? Number(data.version) : 0) + 1, updatedAt: occurredAt });
      });
      tx.create(commandRef, { digest, actorId: session.userId, version: version + 1, reassigned: work.length, createdAt: occurredAt });
      tx.create(database.collection("corporateAuditEvents").doc(commandId), {
        id: commandId, recordId: targetId, recordType: "membership", actorId: session.userId, actorName: session.displayName,
        action: nextStatus === "SUSPENDED" ? "CORPORATE_ACCESS_SUSPENDED" : "CORPORATE_ACCESS_REINSTATED", occurredAt, commandId,
        previousVersion: version, nextVersion: version + 1, changes: { status: { before: target.status, after: nextStatus } },
        reason, reassignedRecordIds: work.map(({ record }) => record.id), scopeTargets: memberships.flatMap(targetsFor),
      });
      tx.create(database.collection("corporateDeliveryIntents").doc(commandId), {
        id: commandId, recordId: targetId, eventId: commandId, recipientId: targetId, channel: "IN_APP", status: "PENDING", attempts: 0,
        createdAt: occurredAt, ownerTeamId: "access-administration", summary: nextStatus === "SUSPENDED" ? "Corporate access was suspended." : "Corporate access was reinstated.", href: "/corporate/directory", scopeTargets: memberships.flatMap(targetsFor),
      });
      return { version: version + 1, reassigned: work.length, replayed: false, scopeTargets: memberships.flatMap(targetsFor) };
    });
    if (result.replayed) return { status: "success", version: result.version, message: "This access change was already recorded. Review the current person record and any session-revocation recovery item; the change was not repeated." };
    let revoked = false;
    try { await firebaseAdminAuth.revokeRefreshTokens(targetId); revoked = true; } catch {
      await database.collection("corporateDeliveryIntents").doc(`${commandId}-revocation`).set({
        id: `${commandId}-revocation`, recordId: targetId, eventId: commandId, recipientId: targetId, channel: "EXTERNAL", status: "NEEDS_REVIEW", attempts: 1,
        createdAt: occurredAt, ownerTeamId: "access-administration", summary: "Access changed; provider session revocation requires follow-up.", href: "/corporate/directory", lastError: "Provider revocation was not confirmed.", scopeTargets: result.scopeTargets,
      });
    }
    revalidatePath("/corporate", "layout");
    return { status: "success", version: result.version, message: `${nextStatus === "SUSPENDED" ? "Access suspended" : "Access reinstated"}. ${result.reassigned} assigned work records returned to their accountable teams. ${revoked ? "Provider sessions revoked; sign-in required." : "Provider revocation requires follow-up; stored access is already effective."}` };
  } catch (error) {
    return { status: "error", message: error instanceof CorporateCommandError ? error.message : "The access change could not be confirmed. Reload the person and review the audit before retrying with the same submission reference." };
  }
};
