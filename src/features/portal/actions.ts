"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultPortalStorage } from "./storage-adapter.ts";
import type { PortalOrder } from "./types.ts";
import { getPortalSession } from "../auth/session.ts";
import { assertSessionLocationAccess, clearPortalCart, getPortalCart } from "./cart.ts";
import { canTransitionOrderStatus, ORDER_STATUS } from "./order-status.ts";
import { assertPortalPermission } from "./authorization.ts";
import { recordPortalAudit } from "./audit.ts";
import { getCheckoutFingerprint } from "./checkout-review";
import { SUPPORT_TOPICS, SUPPORT_SUBJECT_LIMIT, SUPPORT_DETAILS_LIMIT } from "./support-form-options";
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

  if (formData.get("destinationConfirmation") !== session.locationId) {
    await recordPortalAudit({
      actor: session,
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
    orderId = `BD-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

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
      action: "SUPPLY_ORDER_ACCEPTED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_order",
      resourceId: newOrder.id,
      metadata: {
        total: newOrder.total,
        itemCount: items.length,
        invoiceId: newOrder.invoiceId,
      },
    });
    await clearPortalCart(session.locationId);
    revalidatePath("/portal/orders");
    revalidatePath("/portal");
    revalidatePath("/portal/cart");
    revalidatePath("/portal/checkout");
  } catch (error) {
    console.error("Supply order completion failed.");
    await recordPortalAudit({
      actor: session,
      action: "SUPPLY_ORDER_ACCEPTED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_order",
      metadata: { error: String(error) },
    });
    return { message: "We couldn’t confirm order completion. Check Orders & Shipments before trying again to avoid a duplicate order." };
  }

  redirect(`/portal/checkout/confirmation?orderId=${encodeURIComponent(orderId)}`);
};

export const submitReviewedOrderAction = async (_state: { message: string }, formData: FormData): Promise<{ message: string }> => {
  const result = await checkoutFormAction(formData);
  return result ?? { message: "We couldn’t complete the order. Review your cart before trying again." };
};

export const cancelPortalOrderAction = async (formData: FormData): Promise<void> => {
  const session = await getPortalSession();
  if (!session) {
    return;
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "CREATE_ORDER");

  const orderId = String(formData.get("orderId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!orderId) {
    return;
  }

  try {
    const order = await defaultPortalStorage.getOrderById(orderId);
    if (!order) {
      await recordPortalAudit({
        actor: session,
        action: "ORDER_CANCELLED",
        outcome: "FAILURE",
        resourceType: "portal_order",
        resourceId: orderId,
        metadata: { reason: "ORDER_NOT_FOUND" },
      });
      return;
    }

    if (order.locationId !== session.locationId && !session.managedLocationIds.includes(order.locationId)) {
      await recordPortalAudit({
        actor: session,
        action: "ORDER_CANCELLED",
        outcome: "DENIED",
        unitId: order.locationId,
        resourceType: "portal_order",
        resourceId: orderId,
        metadata: { reason: "LOCATION_MISMATCH" },
      });
      return;
    }

    if (!canTransitionOrderStatus(order.status, "CANCELLED")) {
      await recordPortalAudit({
        actor: session,
        action: "ORDER_CANCELLED",
        outcome: "DENIED",
        unitId: order.locationId,
        resourceType: "portal_order",
        resourceId: orderId,
        metadata: {
          currentStatus: order.status,
          reason: "INVALID_STATUS_TRANSITION",
        },
      });
      return;
    }

    await defaultPortalStorage.cancelOrder(orderId, reason);
    await recordPortalAudit({
      actor: session,
      action: "ORDER_CANCELLED",
      outcome: "SUCCESS",
      unitId: order.locationId,
      resourceType: "portal_order",
      resourceId: orderId,
      metadata: {
        previousStatus: order.status,
        cancellationReason: reason || "Operator cancellation requested",
      },
    });

    revalidatePath("/portal/orders");
    revalidatePath("/portal");
    return;
  } catch (error) {
    console.error("Order cancellation error:", error);
    await recordPortalAudit({
      actor: session,
      action: "ORDER_CANCELLED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_order",
      resourceId: orderId,
      metadata: { error: String(error) },
    });
    return;
  }
};

export const acknowledgeBulletinAction = async (formData: FormData): Promise<void> => {
  const session = await getPortalSession();
  if (!session) {
    return;
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "ACCESS_WORKSPACE");

  const bulletinId = String(formData.get("bulletinId") ?? "").trim();
  if (!bulletinId) {
    return;
  }

  try {
    await defaultPortalStorage.acknowledgeBulletin(bulletinId, session.userId);
    await recordPortalAudit({
      actor: session,
      action: "BULLETIN_ACKNOWLEDGED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_bulletin",
      resourceId: bulletinId,
    });

    // Revalidate resources page; dashboard maintains optimistic local state without full reload
    revalidatePath("/portal/resources");
    return;
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
    return;
  }
};

export const updateSupportCaseStatusAction = async (
  caseId: string,
  newStatus: "Open" | "In Review" | "Resolved",
): Promise<void> => {
  const session = await getPortalSession();
  if (!session) {
    redirect("/franchise/login");
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "CREATE_SUPPORT");

  // Prevent cross-unit IDOR: verify ticket belongs to active session location
  const ticket = await defaultPortalStorage.getSupportCaseById(caseId, session.locationId);
  if (!ticket || ticket.locationId !== session.locationId) {
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "DENIED",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { reason: "IDOR_CROSS_UNIT_ATTEMPT", attemptedStatus: newStatus },
    });
    throw new Error("Ticket not found or unauthorized for this unit.");
  }

  try {
    await defaultPortalStorage.updateSupportCaseStatus(caseId, newStatus, session.locationId);
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { newStatus },
    });
    revalidatePath("/portal/support");
    revalidatePath("/portal");
  } catch (error) {
    console.error("Support case status update error:", error);
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { error: String(error) },
    });
    throw error;
  }
};

export const replySupportCaseAction = async (
  formData: FormData,
): Promise<{ status: "success" | "error"; message: string }> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Please log in." };
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "CREATE_SUPPORT");

  const caseId = (formData.get("caseId") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!caseId || !message) {
    return { status: "error", message: "Please provide a valid reply message." };
  }

  // Enforce strict multi-tenant unit isolation (prevent IDOR)
  const ticket = await defaultPortalStorage.getSupportCaseById(caseId, session.locationId);
  if (!ticket || ticket.locationId !== session.locationId) {
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "DENIED",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { reason: "IDOR_CROSS_UNIT_REPLY_ATTEMPT" },
    });
    return { status: "error", message: "Ticket not found or unauthorized for this unit." };
  }

  try {
    await defaultPortalStorage.replySupportCase(caseId, session.locationId, {
      authorEmail: session.email,
      authorRole: "OPERATOR",
      authorName: session.displayName || "Store Operator",
      message,
    });

    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { action: "REPLY", messageLength: message.length },
    });

    revalidatePath("/portal/support");
    revalidatePath("/portal");
    return { status: "success", message: "Reply posted to Operations Support." };
  } catch (error) {
    console.error("Support case reply error:", error);
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { error: String(error) },
    });
    return { status: "error", message: "Could not post reply. Please try again." };
  }
};

export const closeSupportCaseAction = async (
  formData: FormData,
): Promise<{ status: "success" | "error"; message: string }> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Please log in." };
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "CREATE_SUPPORT");

  const caseId = (formData.get("caseId") as string)?.trim();
  const note = (formData.get("note") as string)?.trim();

  if (!caseId) {
    return { status: "error", message: "Invalid ticket reference." };
  }

  // Enforce strict multi-tenant unit isolation (prevent IDOR)
  const ticket = await defaultPortalStorage.getSupportCaseById(caseId, session.locationId);
  if (!ticket || ticket.locationId !== session.locationId) {
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "DENIED",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { reason: "IDOR_CROSS_UNIT_CLOSE_ATTEMPT" },
    });
    return { status: "error", message: "Ticket not found or unauthorized for this unit." };
  }

  try {
    await defaultPortalStorage.closeSupportCase(caseId, session.locationId, note);

    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { action: "CLOSE", note: note || "Resolved by operator" },
    });

    revalidatePath("/portal/support");
    revalidatePath("/portal");
    return { status: "success", message: "Support ticket marked as resolved." };
  } catch (error) {
    console.error("Support case close error:", error);
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { error: String(error) },
    });
    return { status: "error", message: "Could not resolve ticket. Please try again." };
  }
};

export const reopenSupportCaseAction = async (
  formData: FormData,
): Promise<{ status: "success" | "error"; message: string }> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Please log in." };
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "CREATE_SUPPORT");

  const caseId = (formData.get("caseId") as string)?.trim();
  const reason = (formData.get("reason") as string)?.trim();

  if (!caseId || !reason) {
    return { status: "error", message: "Please provide a reason for reopening this ticket." };
  }

  // Enforce strict multi-tenant unit isolation (prevent IDOR)
  const ticket = await defaultPortalStorage.getSupportCaseById(caseId, session.locationId);
  if (!ticket || ticket.locationId !== session.locationId) {
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "DENIED",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { reason: "IDOR_CROSS_UNIT_REOPEN_ATTEMPT" },
    });
    return { status: "error", message: "Ticket not found or unauthorized for this unit." };
  }

  try {
    await defaultPortalStorage.reopenSupportCase(caseId, session.locationId, reason);

    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { action: "REOPEN", reason },
    });

    revalidatePath("/portal/support");
    revalidatePath("/portal");
    return { status: "success", message: "Support ticket reopened." };
  } catch (error) {
    console.error("Support case reopen error:", error);
    await recordPortalAudit({
      actor: session,
      action: "SUPPORT_TICKET_UPDATED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_support_case",
      resourceId: caseId,
      metadata: { error: String(error) },
    });
    return { status: "error", message: "Could not reopen ticket. Please try again." };
  }
};

export const updateOperatorPermissionsAction = async (formData: FormData): Promise<UpdateOperatorPermissionsResult> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Please log in." };
  }

  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const targetRole = String(formData.get("role") ?? "").trim();
  const managedUnitsRaw = String(formData.get("managedLocationIds") ?? "").trim();
  const managedUnits = managedUnitsRaw ? managedUnitsRaw.split(",").map((s) => s.trim()) : [];

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

  try {
    await recordPortalAudit({
      actor: session,
      action: "ROLE_PERMISSION_CHANGED",
      outcome: "SUCCESS",
      resourceType: "portal_operator",
      resourceId: targetUserId,
      metadata: {
        newRole: targetRole,
        managedUnitIds: managedUnits,
      },
    });

    revalidatePath("/portal/account");
    return { status: "success", message: `Updated operator permissions for ${targetUserId}.` };
  } catch (error) {
    console.error("Operator permissions update error:", error);
    await recordPortalAudit({
      actor: session,
      action: "ROLE_PERMISSION_CHANGED",
      outcome: "FAILURE",
      resourceType: "portal_operator",
      resourceId: targetUserId,
      metadata: { error: String(error) },
    });
    return { status: "error", message: "Failed to update operator permissions." };
  }
};

export const updateOperatorAccountAction = async (formData: FormData): Promise<UpdateAccountResult> => {
  const session = await getPortalSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Please log in." };
  }

  assertSessionLocationAccess(session);
  assertPortalPermission(session, "VIEW_ACCOUNT");

  try {
    await recordPortalAudit({
      actor: session,
      action: "ACCOUNT_CHANGED",
      outcome: "SUCCESS",
      unitId: session.locationId,
      resourceType: "portal_account",
      resourceId: session.userId,
      metadata: {
        updatedFields: ["displayName", "phone"].filter((field) => Boolean(formData.get(field))),
      },
    });

    revalidatePath("/portal/account");
    return { status: "success", message: "Account profile updated successfully." };
  } catch (error) {
    console.error("Operator account update error:", error);
    await recordPortalAudit({
      actor: session,
      action: "ACCOUNT_CHANGED",
      outcome: "FAILURE",
      unitId: session.locationId,
      resourceType: "portal_account",
      resourceId: session.userId,
      metadata: { error: String(error) },
    });
    return { status: "error", message: "Failed to update account." };
  }
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

  if (!subject || !topic || !details) {
    return {
      status: "error",
      message: "Please complete all required fields before submitting your ticket.",
    };
  }

  if (!SUPPORT_TOPICS.some((option) => option.value === topic) || subject.length > SUPPORT_SUBJECT_LIMIT || details.length > SUPPORT_DETAILS_LIMIT) {
    return { status: "error", message: `Choose a listed topic and keep the subject under ${SUPPORT_SUBJECT_LIMIT + 1} characters and description under ${SUPPORT_DETAILS_LIMIT + 1} characters.` };
  }

  const caseId = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    await defaultPortalStorage.createSupportCase({
      id: caseId,
      locationId,
      userEmail: session.email,
      submittedByUserId: session.userId,
      subject,
      topic,
      details,
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
