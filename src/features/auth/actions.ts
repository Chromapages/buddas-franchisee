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
} from "./session";
import { canAccessLocation, type PortalSession } from "@/src/lib/auth/auth-provider";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { assertPortalPermission } from "@/src/features/portal/authorization";
import { recordPortalAudit } from "@/src/features/portal/audit";
import { firebaseDb } from "@/src/lib/firebase/admin";

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
  if (session) {
    invalidatePortalSession(session.sessionId);
    await recordPortalAudit({
      actor: session,
      action: "OPERATOR_LOGGED_OUT",
      outcome: "SUCCESS",
      unitId: session.locationId,
    });
  }
  const cookieStore = await cookies();
  cookieStore.delete(PORTAL_SESSION_COOKIE);
  cookieStore.delete("sb-access-token");
  redirect("/franchise/login");
};

export const switchPortalLocationAction = async (formData: FormData): Promise<void> => {
  const session = await getPortalSession();
  if (!session) redirect("/franchise/login");
  assertPortalPermission(session, "ACCESS_WORKSPACE");

  const locationId = formData.get("locationId");
  if (typeof locationId !== "string" || !canAccessLocation(session, locationId)) {
    await recordPortalAudit({
      actor: session,
      action: "UNIT_CHANGED",
      outcome: "DENIED",
      unitId: typeof locationId === "string" ? locationId : undefined,
      metadata: { reason: "LOCATION_ACCESS_DENIED" },
    });
    redirect("/portal/account");
  }

  const location = await defaultPortalStorage.getLocationById(locationId);
  if (!location) redirect("/portal/account");
  assertPortalPermission(session, "ACCESS_WORKSPACE", location.id);
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
    redirect("/portal");
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

  redirect("/portal");
};
