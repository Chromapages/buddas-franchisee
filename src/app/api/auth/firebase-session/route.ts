import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdminAuth, firebaseDb } from "@/src/lib/firebase/admin";

const OPERATOR_SESSION_COOKIE = "buddas_operator_session";
const CORPORATE_SESSION_COOKIE = "buddas_corporate_session";
const LEGACY_SESSION_COOKIE = "buddas_firebase_session";

export async function POST(request: Request) {
  if (!firebaseAdminAuth || !firebaseDb) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  const { idToken, workspace } = await request.json();
  if (typeof idToken !== "string" || (workspace !== "operator" && workspace !== "corporate")) return NextResponse.json({ error: "Invalid authentication request." }, { status: 400 });
  const decoded = await firebaseAdminAuth.verifyIdToken(idToken);
  const operatorRef = firebaseDb.collection("operators").doc(decoded.uid);
  const corporateRef = firebaseDb.collection("corporateStaff").doc(decoded.uid);
  const [operator, corporate] = await Promise.all([operatorRef.get(), corporateRef.get()]);
  const corporateData = corporate.data();
  const hasActiveCorporateMembership = corporate.exists
    && corporateData?.status === "ACTIVE"
    && Array.isArray(corporateData.memberships)
    && corporateData.memberships.length > 0;

  if (workspace === "operator") {
    // Corporate identities are deliberately isolated from the franchisee portal,
    // even when a legacy operator document remains in Firestore.
    if (hasActiveCorporateMembership) return NextResponse.json({ error: "Corporate accounts must sign in through Corporate Operations." }, { status: 403 });
    if (!operator.exists) {
      if (process.env.NODE_ENV !== "development") return NextResponse.json({ error: "This account is not assigned to the Operator Workspace." }, { status: 403 });
      await operatorRef.set({
        email: decoded.email || "",
        displayName: decoded.name || decoded.email?.split("@")[0] || "Operator",
        role: "franchisee",
        activeUnitId: "HNL-014",
        activeUnitName: "La'ie Origin Grill",
        managedUnitIds: ["HNL-014"],
        provisionedForDevelopment: true,
        updatedAt: new Date().toISOString(),
      });
    }
  } else if (!hasActiveCorporateMembership) {
    return NextResponse.json({ error: "This account is not assigned to Corporate Operations." }, { status: 403 });
  } else if (process.env.NODE_ENV !== "development" && !decoded.firebase?.sign_in_second_factor) {
    return NextResponse.json({ error: "Corporate Operations requires multi-factor authentication." }, { status: 403 });
  }
  const cookie = await firebaseAdminAuth.createSessionCookie(idToken, { expiresIn: 8 * 60 * 60 * 1000 });
  const cookieStore = await cookies();
  cookieStore.delete(LEGACY_SESSION_COOKIE);
  cookieStore.delete(workspace === "operator" ? CORPORATE_SESSION_COOKIE : OPERATOR_SESSION_COOKIE);
  cookieStore.set(workspace === "operator" ? OPERATOR_SESSION_COOKIE : CORPORATE_SESSION_COOKIE, cookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const value = cookieStore.get(OPERATOR_SESSION_COOKIE)?.value || cookieStore.get(CORPORATE_SESSION_COOKIE)?.value || cookieStore.get(LEGACY_SESSION_COOKIE)?.value;
  if (value && firebaseAdminAuth) {
    try { const decoded = await firebaseAdminAuth.verifySessionCookie(value); await firebaseAdminAuth.revokeRefreshTokens(decoded.uid); } catch { /* no token diagnostics */ }
  }
  cookieStore.delete(OPERATOR_SESSION_COOKIE);
  cookieStore.delete(CORPORATE_SESSION_COOKIE);
  cookieStore.delete(LEGACY_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
