import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const INQUIRY_FORM_TTL_MS = 1000 * 60 * 60; // 1 hour

export type InquiryFormSession = {
  id: string;
  issuedAt: number;
  expiresAt: number;
};

export type VerificationResult =
  | { kind: "valid"; data: InquiryFormSession }
  | { kind: "expired"; data: InquiryFormSession }
  | { kind: "invalid" };

const getSecretKey = (): string => {
  const secret = process.env.INQUIRY_FORM_SECRET || process.env.SESSION_SECRET;
  if (secret && secret.trim().length >= 16) {
    return secret.trim();
  }
  return "buddas-default-dev-form-token-secret-32-chars-long";
};

const createSignature = (payload: string): string => {
  return createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("base64url");
};

export const issueInquiryFormSession = (
  now: number = Date.now(),
): { session: InquiryFormSession; token: string } => {
  const session: InquiryFormSession = {
    id: randomBytes(16).toString("hex"),
    issuedAt: now,
    expiresAt: now + INQUIRY_FORM_TTL_MS,
  };

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createSignature(payload);
  const token = `${payload}.${signature}`;

  return { session, token };
};

export const verifyInquiryFormSession = (
  token?: string | null,
  now: number = Date.now(),
): VerificationResult => {
  if (!token) return { kind: "invalid" };

  const parts = token.split(".");
  if (parts.length !== 2) return { kind: "invalid" };

  const [payload, signature] = parts;
  if (!payload || !signature) return { kind: "invalid" };

  const expectedSignature = createSignature(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return { kind: "invalid" };
  }

  try {
    const raw = Buffer.from(payload, "base64url").toString("utf8");
    const session = JSON.parse(raw) as InquiryFormSession;

    if (
      typeof session.id !== "string" ||
      typeof session.issuedAt !== "number" ||
      typeof session.expiresAt !== "number"
    ) {
      return { kind: "invalid" };
    }

    if (now > session.expiresAt) {
      return { kind: "expired", data: session };
    }

    return { kind: "valid", data: session };
  } catch {
    return { kind: "invalid" };
  }
};
