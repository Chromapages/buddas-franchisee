"use server";

import { recordPortalAudit } from "../portal/audit.ts";

const resetAttempts = new Map<string, number[]>();
const RESET_WINDOW_MS = 15 * 60 * 1000;
const MAX_RESET_REQUESTS = 5;

export type ResetRequestState = { status: "idle" | "sent"; message?: string };

export const requestPasswordReset = async (
  _previous: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> => {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const now = Date.now();
  const attempts = (resetAttempts.get(email) || []).filter((time) => now - time < RESET_WINDOW_MS);
  if (email && attempts.length < MAX_RESET_REQUESTS) {
    resetAttempts.set(email, [...attempts, now]);
    await recordPortalAudit({
      actor: { userId: email, email },
      action: "PASSWORD_RESET_REQUESTED",
      outcome: "SUCCESS",
      resourceType: "portal_account",
      resourceId: email,
      metadata: { attemptsCount: attempts.length + 1 },
    });
  } else if (email) {
    await recordPortalAudit({
      actor: { userId: email, email },
      action: "PASSWORD_RESET_REQUESTED",
      outcome: "DENIED",
      resourceType: "portal_account",
      resourceId: email,
      metadata: { reason: "RATE_LIMIT_EXCEEDED" },
    });
  }
  return { status: "sent", message: "If an account exists for this email, you’ll receive password reset instructions shortly." };
};

