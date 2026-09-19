"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import {
  PORTAL_SESSION_COOKIE,
  createSignedPortalSession,
  getPortalSession,
  invalidatePortalSession,
  OPERATOR_FIREBASE_SESSION_COOKIE,
  CORPORATE_FIREBASE_SESSION_COOKIE,
  LEGACY_FIREBASE_SESSION_COOKIE,
} from "./session";
import { canAccessLocation, type PortalSession } from "@/src/lib/auth/auth-provider";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { assertPortalPermission } from "@/src/features/portal/authorization";
import { recordPortalAudit } from "@/src/features/portal/audit";
import { firebaseAdminAuth, firebaseDb } from "@/src/lib/firebase/admin";
import { getPortalCart, rememberPortalCartLocationSwitch } from "@/src/features/portal/cart";

export type LoginActionResult = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const loginAction = async (
  _prevState: LoginActionResult,
  formData: FormData,
): Promise<LoginActionResult> => {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const rememberDevice = formData.get("rememberDevice") === "on";

  // Local-only convenience path for site development. This is server-enforced
  // and cannot be enabled in a production build or deployment.
  const localDevelopmentBypass = process.env.NODE_ENV === "development";
  let session: PortalSession | null = localDevelopmentBypass
    ? {
      sessionId: randomUUID(),
      userId: "local-development-user",
      email: email || "developer@local.invalid",
      role: "admin",
      locationId: "HNL-014",
      locationName: "La'ie Origin Grill",
      managedLocationIds: ["HNL-014", "OAH-207", "SLC-302"],
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    }
    : null;

  if (!localDevelopmentBypass && (!email || !password)) {
    return {
      status: "error",
      message: "Please enter your operator email and password.",
    };
  }

  // Demo accounts are only permitted in explicit non-production environments.
  // Credentials must be supplied by environment configuration, never source code.
  const demoAuthEnabled =
    process.env.NODE_ENV !== "production" &&
    process.env.PORTAL_DEMO_AUTH_ENABLED === "true";
  const demoOperatorEmail = process.env.PORTAL_DEMO_OPERATOR_EMAIL?.toLowerCase();
  const demoOperatorPassword = process.env.PORTAL_DEMO_OPERATOR_PASSWORD;
  const demoAdminEmail = process.env.PORTAL_DEMO_ADMIN_EMAIL?.toLowerCase();
  const demoAdminPassword = process.env.PORTAL_DEMO_ADMIN_PASSWORD;

  if (
    !session && demoAuthEnabled &&
    demoOperatorEmail &&
    demoOperatorPassword &&
    email === demoOperatorEmail &&
    password === demoOperatorPassword
  ) {
    session = {
      sessionId: randomUUID(),
      userId: "demo-operator-1",
      email: demoOperatorEmail,
      role: "franchisee",
      locationId: "HNL-014",
      locationName: "La'ie Origin Grill",
      managedLocationIds: ["HNL-014"],
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };
  } else if (
    !session &&
    demoAuthEnabled &&
    demoAdminEmail &&
    demoAdminPassword &&
    email === demoAdminEmail &&
    password === demoAdminPassword
  ) {
    session = {
      sessionId: randomUUID(),
      userId: "demo-admin-1",
      email: demoAdminEmail,
      role: "admin",
      locationId: "HNL-014",
      locationName: "La'ie Origin Grill",
      managedLocationIds: ["HNL-014", "OAH-207", "SLC-302"],
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };
  }

  if (!session) {
    await recordPortalAudit({
      actor: { userId: email || "unknown", email: email || "unknown" },
      action: "OPERATOR_LOGGED_IN",
      outcome: "DENIED",
      metadata: { reason: "INVALID_CREDENTIALS" },
    });
    return {
      status: "error",
      message: "Invalid operator credentials. Please check your email and password.",
    };
  }

  await recordPortalAudit({
    actor: session,
    action: "OPERATOR_LOGGED_IN",
    outcome: "SUCCESS",
    unitId: session.locationId,
  });

  const token = createSignedPortalSession(session);
  const cookieStore = await cookies();
  // Local/demo portal sign-in is the authoritative source for this session.
  // Clear a stale provider cookie so it cannot override the new identity.
  cookieStore.delete("sb-access-token");
  cookieStore.set(PORTAL_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberDevice ? { maxAge: 60 * 60 * 24 } : {}),
  });

  redirect("/portal");
};

export const logoutAction = async (): Promise<void> => {
  const session = await getPortalSession();
  const cookieStore = await cookies();
  const firebaseCookie = cookieStore.get(OPERATOR_FIREBASE_SESSION_COOKIE)?.value || cookieStore.get(CORPORATE_FIREBASE_SESSION_COOKIE)?.value || cookieStore.get(LEGACY_FIREBASE_SESSION_COOKIE)?.value;
  // Clear local authority first, including corporate-only Firebase sessions.
  cookieStore.delete(PORTAL_SESSION_COOKIE);
  cookieStore.delete("sb-access-token");
  cookieStore.delete(OPERATOR_FIREBASE_SESSION_COOKIE);
  cookieStore.delete(CORPORATE_FIREBASE_SESSION_COOKIE);
  cookieStore.delete(LEGACY_FIREBASE_SESSION_COOKIE);
  let providerRevoked = true;
  if (firebaseCookie && firebaseAdminAuth) {
    try {
      const token = await firebaseAdminAuth.verifySessionCookie(firebaseCookie);
      await firebaseAdminAuth.revokeRefreshTokens(token.uid);
    } catch {
      providerRevoked = false;
      console.error("Signed out locally; Firebase session revocation needs follow-up.");
    }
  }
  if (session) {
    invalidatePortalSession(session.sessionId);
    await recordPortalAudit({
      actor: session,
      action: "OPERATOR_LOGGED_OUT",
      outcome: providerRevoked ? "SUCCESS" : "FAILURE",
      unitId: session.locationId,
      metadata: { localSessionCleared: true, providerRevoked },
    });
  }
  redirect("/franchise/login");
};

export const switchPortalLocationAction = async (formData: FormData): Promise<void> => {
  const session = await getPortalSession();
  if (!session) redirect("/franchise/login");
  assertPortalPermission(session, "ACCESS_WORKSPACE");

  const locationId = formData.get("locationId");
  const requestedReturnTo = formData.get("returnTo");
  const returnTo = typeof requestedReturnTo === "string" && requestedReturnTo.startsWith("/portal") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : "/portal";
  if (typeof locationId !== "string" || !canAccessLocation(session, locationId)) {
    await recordPortalAudit({
      actor: session,
      action: "UNIT_CHANGED",
      outcome: "DENIED",
      unitId: typeof locationId === "string" ? locationId : undefined,
      metadata: { reason: "LOCATION_ACCESS_DENIED" },
    });
    redirect(returnTo);
  }

  const location = await defaultPortalStorage.getLocationById(locationId);
  if (!location) redirect(returnTo);
  assertPortalPermission(session, "ACCESS_WORKSPACE", location.id);
  const existingCartCount = (await getPortalCart(session).catch(() => [])).reduce((total, item) => total + item.quantity, 0);
  await rememberPortalCartLocationSwitch(session, location.id, existingCartCount);
  await recordPortalAudit({
    actor: session,
    action: "UNIT_CHANGED",
    outcome: "SUCCESS",
    unitId: location.id,
    resourceType: "portal_location",
    resourceId: location.id,
    metadata: {
      previousUnitId: session.locationId,
      newUnitId: location.id,
    },
  });

  // Firebase-backed sessions read the active unit from the authorized operator
  // record on every request. Persist the selected, already-authorized unit there
  // instead of issuing a legacy session cookie that Firebase will ignore.
  if (firebaseDb) {
    await firebaseDb.collection("operators").doc(session.userId).update({
      activeUnitId: location.id,
      activeUnitName: location.name,
      updatedAt: new Date().toISOString(),
    });
    revalidatePath("/portal", "layout");
    revalidatePath(returnTo);
    redirect(returnTo);
  }

  const token = createSignedPortalSession({
    ...session,
    sessionId: randomUUID(),
    locationId: location.id,
    locationName: location.name,
  });

  (await cookies()).set(PORTAL_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)),
  });

  revalidatePath("/portal", "layout");
  revalidatePath(returnTo);
  redirect(returnTo);
};
