"use server";

import { createHash, randomUUID } from "node:crypto";
import { FirestoreSupportRepository } from "../corporate/support/repository.ts";
import type { SupportCommandKind } from "../corporate/support/model.ts";
import { FirestorePortalStorage } from "./firestore-storage.ts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultPortalStorage } from "./storage-adapter.ts";
import type { PortalOrder } from "./types.ts";
import { getPortalSession } from "../auth/session.ts";
import { assertSessionLocationAccess, clearPortalCart, getPortalCart } from "./cart.ts";
import { canTransitionOrderStatus, ORDER_STATUS } from "./order-status.ts";
import { assertPortalPermission } from "./authorization.ts";
import { isBulletinActionOutstanding } from "./bulletins.ts";
import { recordPortalAudit } from "./audit.ts";
import { getCheckoutFingerprint } from "./checkout-review";
import { SUPPORT_TOPICS, SUPPORT_SUBJECT_LIMIT, SUPPORT_DETAILS_LIMIT, SUPPORT_IMPACTS, type SupportImpact } from "./support-form-options";
import { firebaseDb } from "@/src/lib/firebase/admin";
import { getBrandSignoffRequirement } from "./compliance-records";

export type SupportActionResult =
  | { status: "success"; caseId: string; message: string }
  | { status: "error"; message: string };

export type CancelOrderResult =
  | { status: "success"; orderId: string; message: string }
  | { status: "error"; message: string };

export type AcknowledgeBulletinResult =
  | { status: "success"; bulletinId: string; message: string }
  | { status: "error"; message: string };

export type UpdateOperatorPermissionsResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export type UpdateAccountResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export type BrandSignoffResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const signBrandStandardAction = async (formData: FormData): Promise<BrandSignoffResult> => {
  const session = await getPortalSession();
  if (!session) return { status: "error", message: "Your session has expired. Please log in again." };
  assertSessionLocationAccess(session);
  assertPortalPermission(session, "ACKNOWLEDGE_BRAND_STANDARDS");

  const unitId = String(formData.get("unitId") ?? "");
  const signoffId = String(formData.get("signoffId") ?? "").trim();
  const legalName = String(formData.get("legalName") ?? "").trim();
  const attestation = formData.get("attestation") === "confirmed";
  if (unitId !== session.locationId || !signoffId || legalName.length < 2 || legalName.length > 128 || !attestation || !firebaseDb) {
    return { status: "error", message: "Review the sign-off details and confirm your authorization before submitting." };
  }

  const requirement = await getBrandSignoffRequirement(session, signoffId);
  if (!requirement) {
    await recordPortalAudit({ actor: session, action: "BRAND_STANDARD_SIGNED", outcome: "DENIED", unitId: session.locationId, resourceType: "brand_signoff", resourceId: signoffId, metadata: { reason: "REQUIREMENT_NOT_AVAILABLE" } });
    return { status: "error", message: "This sign-off is no longer available for your working unit." };
  }

  const now = new Date().toISOString();
  await firebaseDb.collection("units").doc(session.locationId).collection("brandSignoffRequirements").doc(signoffId).collection("acknowledgements").doc(session.userId).set({
    operatorId: session.userId,
    unitId: session.locationId,
    acknowledgedAt: now,
    ...(requirement.mode === "DIGITAL_SIGNATURE" ? { signedAt: now, signerLegalName: legalName } : {}),
    mode: requirement.mode,
    requirementVersion: requirement.version || null,
  }, { merge: true });
  await recordPortalAudit({ actor: session, action: "BRAND_STANDARD_SIGNED", outcome: "SUCCESS", unitId: session.locationId, resourceType: "brand_signoff", resourceId: signoffId, metadata: { mode: requirement.mode, requirementType: requirement.type, version: requirement.version } });
  revalidatePath("/portal/account");
  return { status: "success", message: requirement.mode === "DIGITAL_SIGNATURE" ? "Signature recorded." : "Acknowledgement recorded." };
};

export const checkoutFormAction = async (formData: FormData): Promise<void | { message: string }> => {
  const session = await getPortalSession();
  if (!session) {
    redirect("/franchise/login");
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "CREATE_ORDER");
  assertPortalPermission(session, "VIEW_WHOLESALE_PRICING");

  if (formData.get("destinationConfirmation") !== session.locationId) {
    await recordPortalAudit({
      actor: session,
      includeActorEmail: false,
      action: "SUPPLY_ORDER_ACCEPTED",
      outcome: "DENIED",
      unitId: session.locationId,
      resourceType: "portal_order",
      metadata: { reason: "DESTINATION_CONFIRMATION_MISMATCH" },
    });
    redirect("/portal/checkout?destination=unconfirmed");
  }

  let orderId = "";
  try {
    const cart = await getPortalCart(session);
    if (cart.length === 0) {
      return { message: "Your cart is empty or its items are no longer available. Return to the cart to review your supplies." };
    }
    if (cart.some((item) => !item.product.isAvailable)) {
      return { message: "One or more approved supplies are no longer available for this location. Return to the cart to remove or review those items before placing your order." };
    }

    const items: PortalOrder["items"] = cart.map((item) => ({
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    if (formData.get("reviewFingerprint") !== getCheckoutFingerprint(session.locationId, items)) {
      return { message: "Your cart or product prices changed since this review. Reload the order review and confirm the updated details before placing your order." };
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNonce = randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
    orderId = `BD-${orderNonce}`;
    const invoiceId = `INV-${new Date().getFullYear()}-${orderNonce}`;

    const newOrder: PortalOrder = {
      id: orderId,
      locationId: session.locationId,
      createdAt: new Date().toISOString(),
      status: ORDER_STATUS.PROCESSING.id,
      eta: "3-5 Business Days",
      total,
      invoiceId,
      items,
    };

    await defaultPortalStorage.createOrder(newOrder);
    await recordPortalAudit({
      actor: session,
      includeActorEmail: false,
      action: "SUPPLY_ORDER_ACCEPTED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_order",
      resourceId: newOrder.id,
      metadata: {
        itemCount: items.length,
      },
    });
    await clearPortalCart(session.userId, session.locationId);
    revalidatePath("/portal/orders");
    revalidatePath("/portal");
    revalidatePath("/portal/cart");
    revalidatePath("/portal/checkout");
  } catch {
    console.error("Supply order completion failed.");
    await recordPortalAudit({
      actor: session,
      includeActorEmail: false,
      action: "SUPPLY_ORDER_ACCEPTED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_order",
      metadata: { reason: "ORDER_COMPLETION_FAILED" },
    });
    return { message: "We couldn’t confirm order completion. Check Orders & Shipments before trying again to avoid a duplicate order." };
  }

  redirect(`/portal/checkout/confirmation?orderId=${encodeURIComponent(orderId)}`);
};

export const submitReviewedOrderAction = async (_state: { message: string }, formData: FormData): Promise<{ message: string }> => {
  const result = await checkoutFormAction(formData);
  return result ?? { message: "We couldn’t complete the order. Review your cart before trying again." };
};

export type CancelPortalOrderResult = { status: "success" | "error"; message: string };

export const cancelPortalOrderAction = async (formData: FormData): Promise<CancelPortalOrderResult> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Sign in again before requesting cancellation." };
  }

  try {
    assertSessionLocationAccess(session);
    assertPortalPermission(session, "REQUEST_ORDER_CANCELLATION");
  } catch {
    return { status: "error", message: "You do not have permission to request cancellation for the active unit." };
  }

  const orderId = String(formData.get("orderId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!orderId) {
    return { status: "error", message: "The order could not be identified. Reload Orders & Shipments and try again." };
  }
  if (!reason || reason.length > 500) return { status: "error", message: "Enter a cancellation reason of up to 500 characters." };

  try {
    const order = (await defaultPortalStorage.getOrdersByLocation(session.locationId)).find((item) => item.id === orderId) || null;
    if (!order) {
      await recordPortalAudit({
        actor: session,
        action: "ORDER_CANCELLATION_REQUESTED",
        outcome: "FAILURE",
        resourceType: "portal_order",
        resourceId: orderId,
        metadata: { reason: "ORDER_NOT_FOUND" },
      });
      return { status: "error", message: "This order is not available for the active unit." };
    }

    if (order.locationId !== session.locationId && !session.managedLocationIds.includes(order.locationId)) {
      await recordPortalAudit({
        actor: session,
        action: "ORDER_CANCELLATION_REQUESTED",
        outcome: "DENIED",
        unitId: order.locationId,
        resourceType: "portal_order",
        resourceId: orderId,
        metadata: { reason: "LOCATION_MISMATCH" },
      });
      return { status: "error", message: "The active unit changed. Reload the order before requesting cancellation." };
    }

    if (!canTransitionOrderStatus(order.status, "CANCELLATION_REQUESTED")) {
      await recordPortalAudit({
        actor: session,
        action: "ORDER_CANCELLATION_REQUESTED",
        outcome: "DENIED",
        unitId: order.locationId,
        resourceType: "portal_order",
        resourceId: orderId,
        metadata: {
          currentStatus: order.status,
          reason: "INVALID_STATUS_TRANSITION",
        },
      });
      return { status: "error", message: "This order can no longer accept a cancellation request." };
    }

    await defaultPortalStorage.cancelOrder(orderId, reason, order.locationId);
    await recordPortalAudit({
      actor: session,
      action: "ORDER_CANCELLATION_REQUESTED",
      outcome: "SUCCESS",
      unitId: order.locationId,
      resourceType: "portal_order",
      resourceId: orderId,
      metadata: {
        previousStatus: order.status,
        reasonProvided: true,
        reasonLength: reason.length,
        outcomePending: true,
      },
    });

    revalidatePath("/portal/orders");
    revalidatePath("/portal");
    return { status: "success", message: `The fulfillment owner will review the cancellation request for order ${order.id}. The order is not cancelled until an outcome is recorded.` };
  } catch (error) {
    console.error("Order cancellation error:", error);
    await recordPortalAudit({
      actor: session,
      action: "ORDER_CANCELLATION_REQUESTED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_order",
      resourceId: orderId,
      metadata: { error: String(error) },
    });
    return { status: "error", message: "The cancellation request was not recorded. Check your connection and try again." };
  }
};

export const acknowledgeBulletinAction = async (formData: FormData): Promise<{ status: "success" | "error"; acknowledgedAt?: string; message: string }> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Sign in again before acknowledging this update." };
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "ACKNOWLEDGE_BRAND_STANDARDS");

  const bulletinId = String(formData.get("bulletinId") ?? "").trim();
  if (!bulletinId) {
    return { status: "error", message: "This operations update could not be identified." };
  }

  try {
    const bulletin = (await defaultPortalStorage.getBulletinsForSession(session)).find((candidate) => candidate.id === bulletinId);
    if (!bulletin || (!isBulletinActionOutstanding(bulletin) && !bulletin.currentUserState?.acknowledgedAt)) {
      return { status: "error", message: "This update is no longer available for acknowledgement." };
    }
    const acknowledgedAt = bulletin.currentUserState?.acknowledgedAt || await defaultPortalStorage.acknowledgeBulletin(bulletinId, session.userId);
    await recordPortalAudit({
      actor: session,
      action: "BULLETIN_ACKNOWLEDGED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_bulletin",
      resourceId: bulletinId,
    });

    revalidatePath("/portal");
    revalidatePath("/portal/resources");
    return { status: "success", acknowledgedAt, message: "Operations update acknowledged." };
  } catch (error) {
    console.error("Bulletin acknowledgement error:", error);
    await recordPortalAudit({
      actor: session,
      action: "BULLETIN_ACKNOWLEDGED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_bulletin",
      resourceId: bulletinId,
      metadata: { error: String(error) },
    });
    return { status: "error", message: "The acknowledgement could not be recorded. Try again." };
  }
};

// Every operator update uses the same append-only conversation as Corporate Support.
const operatorSupportCommand = async (formData: FormData, kind: SupportCommandKind): Promise<{ status: "success" | "error"; message: string }> => {
  const session = await getPortalSession();
  if (!session) return { status: "error", message: "Your session has expired. Please log in." };
  assertSessionLocationAccess(session);
  assertPortalPermission(session, "CREATE_SUPPORT");
  const caseId = String(formData.get("caseId") || "").trim();
  const unitId = String(formData.get("locationId") || "");
  if (unitId !== session.locationId) return { status: "error", message: "Your working unit changed. Reload the ticket before submitting." };
  const message = String(formData.get(kind === "RESOLVE" ? "note" : kind === "REOPEN" ? "reason" : "message") || "").trim();
  const expectedVersionText = formData.get("expectedVersion");
  const expectedVersion = typeof expectedVersionText === "string" && /^\d+$/.test(expectedVersionText) ? Number(expectedVersionText) : NaN;
  const commandId = String(formData.get("commandId") || "");
  try {
    const ticket = await defaultPortalStorage.getSupportCaseById(caseId, session.locationId);
    if (!ticket || ticket.locationId !== session.locationId) throw new Error("Ticket not found for this unit.");
    if (defaultPortalStorage instanceof FirestorePortalStorage && firebaseDb) {
      await new FirestoreSupportRepository(firebaseDb).execute({ commandId, unitId, caseId, expectedVersion, kind, message: message || (kind === "RESOLVE" ? "Resolved by the operator." : "") }, {
        userId: session.userId, email: session.email, displayName: session.displayName, corporate: false,
      });
    } else {
      // Retain the explicitly selected legacy development adapter; never fall back after a live failure.
      if (!Number.isSafeInteger(expectedVersion) || expectedVersion !== (ticket.version ?? 0)) throw new Error("This ticket changed. Reload before updating.");
      if (kind === "REPLY") {
        if (!message || message.length > 10000 || ticket.status === "Resolved") throw new Error("Enter a valid reply on an open ticket.");
        await defaultPortalStorage.replySupportCase(caseId, unitId, { authorEmail: session.email, authorName: session.displayName || session.email, authorRole: "OPERATOR", message });
      } else if (kind === "RESOLVE") await defaultPortalStorage.closeSupportCase(caseId, unitId, message);
      else if (kind === "REOPEN") {
        if (!message || ticket.status !== "Resolved") throw new Error("Enter a reason to reopen a resolved ticket.");
        await defaultPortalStorage.reopenSupportCase(caseId, unitId, message);
      }
    }
    revalidatePath("/portal/support");
    revalidatePath("/portal");
    revalidatePath("/corporate/support");
    return { status: "success", message: kind === "RESOLVE" ? "Support ticket resolved." : kind === "REOPEN" ? "Support ticket reopened." : "Reply recorded in Operations Support." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "The update was not confirmed. Reload the ticket before trying again." };
  }
};

export const replySupportCaseAction = async (formData: FormData) => operatorSupportCommand(formData, "REPLY");
export const closeSupportCaseAction = async (formData: FormData) => operatorSupportCommand(formData, "RESOLVE");
export const reopenSupportCaseAction = async (formData: FormData) => operatorSupportCommand(formData, "REOPEN");
export const updateSupportCaseStatusAction = async (_caseId: string, _newStatus: "Open" | "In Review" | "Resolved"): Promise<void> => {
  throw new Error("Use the ticket's versioned resolve or reopen action.");
};
export const updateOperatorPermissionsAction = async (formData: FormData): Promise<UpdateOperatorPermissionsResult> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Please log in." };
  }

  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const targetRole = String(formData.get("role") ?? "").trim();
  if (session.role !== "admin") {
    await recordPortalAudit({
      actor: session,
      action: "ROLE_PERMISSION_CHANGED",
      outcome: "DENIED",
      resourceType: "portal_operator",
      resourceId: targetUserId,
      metadata: { reason: "INSUFFICIENT_PRIVILEGE", attemptedRole: targetRole },
    });
    return { status: "error", message: "Administrative privilege required to update permissions." };
  }

  if (!targetUserId || (targetRole !== "admin" && targetRole !== "franchisee")) {
    return { status: "error", message: "Invalid target user or role specified." };
  }

  return {
    status: "error",
    message: "Operator permission changes are not available from the legacy portal action. Use the reviewed corporate access process; no access was changed.",
  };
};

export const updateOperatorAccountAction = async (formData: FormData): Promise<UpdateAccountResult> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Please log in." };
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "VIEW_ACCOUNT");

  void formData;
  return {
    status: "error",
    message: "Account corrections are handled through Operations Support until an authoritative profile source is configured. No account data was changed.",
  };
};

export const submitSupportRequestAction = async (
  _prevState: SupportActionResult,
  formData: FormData,
): Promise<SupportActionResult> => {
  const session = await getPortalSession();
  if (!session) {
    return {
      status: "error",
      message: "Your session has expired. Please log in to submit a support request.",
    };
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "CREATE_SUPPORT");
  const locationId = session.locationId;
  if (formData.get("locationId") !== locationId) {
    return { status: "error", message: "Your working unit has changed. Reload Operations Support before submitting this ticket." };
  }
  const readText = (key: string) => typeof formData.get(key) === "string" ? String(formData.get(key)).trim() : "";
  const subject = readText("subject");
  const topic = readText("topic");
  const details = readText("details");
  const operationalImpact = readText("impact");
  const relatedOrderId = readText("relatedOrderId");

  if (!subject || !topic || !details) {
    return {
      status: "error",
      message: "Please complete all required fields before submitting your ticket.",
    };
  }

  if (!SUPPORT_TOPICS.some((option) => option.value === topic) || !SUPPORT_IMPACTS.some((option) => option === operationalImpact) || subject.length > SUPPORT_SUBJECT_LIMIT || details.length > SUPPORT_DETAILS_LIMIT) {
    return { status: "error", message: `Choose a listed topic and keep the subject under ${SUPPORT_SUBJECT_LIMIT + 1} characters and description under ${SUPPORT_DETAILS_LIMIT + 1} characters.` };
  }

  if (relatedOrderId) {
    if (!/^[A-Za-z0-9-]{1,64}$/.test(relatedOrderId) || !(await defaultPortalStorage.getOrderById(relatedOrderId, locationId))) {
      return { status: "error", message: "The related order is not available for this unit. Reload the order before requesting support." };
    }
  }

  const requestId = readText("requestId");
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(requestId)) return { status: "error", message: "Reload the support form before submitting this request." };
  const caseId = `SUP-${createHash("sha256").update(`${session.userId}:${requestId}`).digest("hex").slice(0, 32)}`;

  try {
    await defaultPortalStorage.createSupportCase({
      id: caseId,
      locationId,
      userEmail: session.email,
      submittedByUserId: session.userId,
      subject,
      topic,
      details,
      operationalImpact: operationalImpact as SupportImpact,
      ...(relatedOrderId ? { relatedOrderId } : {}),
    });
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_CREATED",
      outcome: "SUCCESS",
      unitId: locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: {
        topic,
        operationalImpact,
        ...(relatedOrderId ? { relatedOrderId } : {}),
      },
    });

    revalidatePath("/portal/support");

    return {
      status: "success",
      caseId,
      message: "Your support request has been created. Open the ticket to follow the conversation.",
    };
  } catch (error) {
    console.error("Support case submission error:", error);
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_CREATED",
      outcome: "FAILURE",
      unitId: locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { error: String(error) },
    });
    return {
      status: "error",
      message: "Could not create support ticket. Please try again or contact operations directly.",
    };
  }
};
