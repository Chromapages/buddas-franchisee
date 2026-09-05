import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import {
  isSupabaseConfigured,
  verifySupabaseAccessToken,
} from "@/src/lib/auth/supabase";
import { firebaseAdminAuth, firebaseDb, isFirebaseAdminConfigured } from "@/src/lib/firebase/admin";

export const PORTAL_SESSION_COOKIE = "buddas_portal_session";
export const SUPABASE_ACCESS_TOKEN_COOKIE = "sb-access-token";
export const FIREBASE_SESSION_COOKIE = "buddas_firebase_session";
const revokedSessionIds = new Set<string>();

export const invalidatePortalSession = (sessionId: string) => {
  if (sessionId) revokedSessionIds.add(sessionId);
};

const getSecretKey = (): string => {
  const secret = process.env.SESSION_SECRET || process.env.PORTAL_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      return "local-development-portal-session-secret";
    }
    throw new Error("Portal session signing secret is not configured.");
  }
  return secret;
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

    if (
      Date.now() > session.expiresAt
      || (session.role !== "admin" && session.role !== "franchisee")
      || !session.userId
      || !session.sessionId
      || revokedSessionIds.has(session.sessionId)
      || !session.email
      || !session.locationId
      || !session.locationName
      || !Array.isArray(session.managedLocationIds)
      || !session.managedLocationIds.includes(session.locationId)
    ) return null;
    if (process.env.NODE_ENV === "production" && session.email.endsWith("@local.invalid")) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const getPortalSession = async (): Promise<PortalSession | null> => {
  const cookieStore = await cookies();
  const firebaseCookie = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value;
  if (firebaseCookie && firebaseAdminAuth && firebaseDb) {
    try {
      const token = await firebaseAdminAuth.verifySessionCookie(firebaseCookie, true);
      const operator = await firebaseDb.collection("operators").doc(token.uid).get();
      const data = operator.data();
      if (!data || (data.role !== "admin" && data.role !== "franchisee") || !Array.isArray(data.managedUnitIds) || !data.activeUnitId || !data.managedUnitIds.includes(data.activeUnitId)) return null;
      return { sessionId: token.session_id || token.uid, userId: token.uid, email: token.email || "", displayName: data.displayName, role: data.role, locationId: data.activeUnitId, locationName: data.activeUnitName || data.activeUnitId, managedLocationIds: data.managedUnitIds, expiresAt: (token.exp || 0) * 1000 };
    } catch { return null; }
  }
  if (isFirebaseAdminConfigured()) return null;

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
