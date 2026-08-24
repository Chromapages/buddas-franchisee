"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultPortalStorage } from "./storage-adapter.ts";
import type { PortalOrder } from "./types.ts";
import { getPortalSession } from "../auth/session.ts";

export type SupportActionResult =
  | { status: "success"; caseId: string; message: string }
  | { status: "error"; message: string };

export const checkoutFormAction = async (formData: FormData): Promise<void> => {
  const session = await getPortalSession();
  if (!session) {
    redirect("/franchise/login");
  }

  const locationId = formData.get("locationId") as string;
  const itemsJson = formData.get("items") as string;

  if (!locationId || !itemsJson) {
    return;
  }

  try {
    const items = JSON.parse(itemsJson) as PortalOrder["items"];
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `BD-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: PortalOrder = {
      id: orderId,
      locationId,
      createdAt: new Date().toISOString(),
      status: "Processing",
      eta: "3-5 Business Days",
      total,
      invoiceId,
      items,
    };

    await defaultPortalStorage.createOrder(newOrder);
    revalidatePath("/portal/orders");
    revalidatePath("/portal");
  } catch (error) {
    console.error("Order completion error:", error);
    return;
  }

  redirect("/portal/checkout/confirmation");
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

  const locationId = (formData.get("locationId") as string) || session.locationId;
  const subject = (formData.get("subject") as string)?.trim();
  const topic = (formData.get("topic") as string)?.trim();
  const details = (formData.get("details") as string)?.trim();

  if (!subject || !topic || !details) {
    return {
      status: "error",
      message: "Please complete all required fields before submitting your ticket.",
    };
  }

  const caseId = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    await defaultPortalStorage.createSupportCase({
      id: caseId,
      locationId,
      userEmail: session.email,
      subject,
      topic,
      details,
    });

    revalidatePath("/portal/support");

    return {
      status: "success",
      caseId,
      message: "Your support request has been logged. Our operations team will respond promptly.",
    };
  } catch (error) {
    console.error("Support case submission error:", error);
    return {
      status: "error",
      message: "Could not create support ticket. Please try again or contact operations directly.",
    };
  }
};
