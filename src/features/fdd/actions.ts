"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { defaultFddStorage } from "./storage-adapter.ts";
import type { FddReceipt } from "./types.ts";

export type FddSignActionResult =
  | { status: "success"; receipt: FddReceipt; message: string }
  | { status: "error"; message: string };

export const signFddReceiptAction = async (
  _prevState: FddSignActionResult,
  formData: FormData,
): Promise<FddSignActionResult> => {
  const token = (formData.get("token") as string)?.trim();
  const legalName = (formData.get("legalName") as string)?.trim();
  const acknowledgeEsign = formData.get("acknowledgeEsign");
  const acknowledgeHoldPeriod = formData.get("acknowledgeHoldPeriod");

  if (!token || !legalName) {
    return {
      status: "error",
      message: "Please provide your full legal name to sign the Item 23 Receipt.",
    };
  }

  if (acknowledgeEsign !== "on" || acknowledgeHoldPeriod !== "on") {
    return {
      status: "error",
      message:
        "You must acknowledge electronic signature consent and the 14-day disclosure hold period.",
    };
  }

  const existingReceipt = await defaultFddStorage.getReceiptByToken(token);
  if (!existingReceipt) {
    return {
      status: "error",
      message: "The requested FDD access token is invalid or has expired.",
    };
  }

  if (existingReceipt.status === "SIGNED") {
    return {
      status: "success",
      receipt: existingReceipt,
      message: "This Item 23 Receipt was already signed and recorded.",
    };
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = requestHeaders.get("user-agent") || undefined;

  const updatedReceipt = await defaultFddStorage.recordSignature(
    token,
    legalName,
    ipAddress,
    userAgent,
  );

  if (!updatedReceipt) {
    return {
      status: "error",
      message: "Failed to record your signature. Please try again.",
    };
  }

  revalidatePath(`/franchise/fdd/${token}`);

  return {
    status: "success",
    receipt: updatedReceipt,
    message: "Thank you. Your Item 23 Receipt has been executed and filed.",
  };
};
