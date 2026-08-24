import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import {
  isSupabaseConfigured,
  verifySupabaseAccessToken,
} from "@/src/lib/auth/supabase";

export const PORTAL_SESSION_COOKIE = "buddas_portal_session";
export const SUPABASE_ACCESS_TOKEN_COOKIE = "sb-access-token";

const getSecretKey = (): string => {
  return (
    process.env.SESSION_SECRET ||
    process.env.PORTAL_SESSION_SECRET ||
    "buddas-portal-demo-session-secret-key-32-chars-long"
  );
};

export const createSignedPortalSession = (session: PortalSession): string => {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
};

export const verifySignedPortalSession = (
  token?: string | null,
): PortalSession | null => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expectedSignature = createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const raw = Buffer.from(payload, "base64url").toString("utf8");
    const session = JSON.parse(raw) as PortalSession;

    if (Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
};

export const getPortalSession = async (): Promise<PortalSession | null> => {
  const cookieStore = await cookies();

  // 1. Check for Supabase Access Token if configured
  if (isSupabaseConfigured()) {
    const supabaseToken = cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value;
    if (supabaseToken) {
      const verified = await verifySupabaseAccessToken(supabaseToken);
      if (verified) return verified;
    }
  }

  // 2. Fall back to signed HMAC session cookie
  const token = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;
  return verifySignedPortalSession(token);
};
