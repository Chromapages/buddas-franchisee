import { createHash } from "node:crypto";
import type { InquiryValues } from "./schema";

export type ProtectionResult =
  | { allowed: true; inquiryId: string; reservationKey: string }
  | {
      allowed: false;
      reason:
        | "delivered"
        | "pending"
        | "retry-later"
        | "retry-exhausted"
        | "token-conflict"
        | "rate-limited";
    };

type InquiryEntry = {
  inquiryId: string;
  status: "pending" | "delivered" | "retrying";
  tokenId: string;
  attempts: number;
  lastAttemptAt: number;
};

const deliveredKeys = new Map<string, InquiryEntry>();
const contactRateLimits = new Map<string, number[]>();

export const MAX_RETRY_ATTEMPTS = 3;
export const RATE_LIMIT_WINDOW_MS = 1000 * 60 * 15; // 15 mins
export const MAX_INQUIRIES_PER_WINDOW = 5;

export const generatePayloadHash = (
  inquiry: InquiryValues,
  tokenId: string,
): string => {
  const normalized = [
    inquiry.email.toLowerCase().trim(),
    inquiry.phone.trim(),
    inquiry.marketInterest.toLowerCase().trim(),
    inquiry.investmentRange,
    tokenId,
  ].join("::");

  return createHash("sha256").update(normalized).digest("hex");
};

export const getInquiryProtectionResult = (
  inquiry: InquiryValues,
  sourceIp?: string,
  _submissionToken?: string,
  tokenId?: string,
  now: number = Date.now(),
): ProtectionResult => {
  const actualTokenId = tokenId || "default-token";
  const reservationKey = generatePayloadHash(inquiry, actualTokenId);
  const inquiryId = `INQ-${reservationKey.slice(0, 12).toUpperCase()}`;

  // Check existing entry
  const existing = deliveredKeys.get(reservationKey);
  if (existing) {
    if (existing.status === "delivered") {
      return { allowed: false, reason: "delivered" };
    }
    if (existing.status === "pending") {
      return { allowed: false, reason: "pending" };
    }
    if (existing.status === "retrying") {
      if (existing.attempts >= MAX_RETRY_ATTEMPTS) {
        return { allowed: false, reason: "retry-exhausted" };
      }
      return { allowed: true, inquiryId, reservationKey };
    }
  }

  // Check rate limit by email or IP
  const rateLimitKey = sourceIp ? `${sourceIp}::${inquiry.email.toLowerCase()}` : inquiry.email.toLowerCase();
  const timestamps = contactRateLimits.get(rateLimitKey) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_INQUIRIES_PER_WINDOW) {
    return { allowed: false, reason: "rate-limited" };
  }

  return {
    allowed: true,
    inquiryId,
    reservationKey,
  };
};

export const reserveInquiry = (
  protection: Extract<ProtectionResult, { allowed: true }>,
  tokenId: string = "default-token",
  now: number = Date.now(),
): void => {
  const existing = deliveredKeys.get(protection.reservationKey);
  const attempts = existing ? existing.attempts + 1 : 1;

  deliveredKeys.set(protection.reservationKey, {
    inquiryId: protection.inquiryId,
    status: "pending",
    tokenId,
    attempts,
    lastAttemptAt: now,
  });
};

export const recordDeliveredInquiry = (
  protection: Extract<ProtectionResult, { allowed: true }>,
  now: number = Date.now(),
): void => {
  const entry = deliveredKeys.get(protection.reservationKey);
  if (entry) {
    entry.status = "delivered";
    entry.lastAttemptAt = now;
  }
};

export const markInquiryRetryable = (
  protection: Extract<ProtectionResult, { allowed: true }>,
  now: number = Date.now(),
): void => {
  const entry = deliveredKeys.get(protection.reservationKey);
  if (entry) {
    entry.status = "retrying";
    entry.lastAttemptAt = now;
  }
};

export const releaseInquiryReservation = (
  protection: Extract<ProtectionResult, { allowed: true }>,
): void => {
  deliveredKeys.delete(protection.reservationKey);
};
