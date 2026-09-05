import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdminAuth, firebaseDb } from "@/src/lib/firebase/admin";

const SESSION_COOKIE = "buddas_firebase_session";

export async function POST(request: Request) {
  if (!firebaseAdminAuth || !firebaseDb) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  const { idToken } = await request.json();
  if (typeof idToken !== "string") return NextResponse.json({ error: "Invalid authentication request." }, { status: 400 });
  const decoded = await firebaseAdminAuth.verifyIdToken(idToken);
  const operatorRef = firebaseDb.collection("operators").doc(decoded.uid);
  const operator = await operatorRef.get();
  if (!operator.exists) {
    if (process.env.NODE_ENV !== "development") return NextResponse.json({ error: "This account has not been assigned to the Operator Workspace." }, { status: 403 });
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
  const cookie = await firebaseAdminAuth.createSessionCookie(idToken, { expiresIn: 8 * 60 * 60 * 1000 });
  (await cookies()).set(SESSION_COOKIE, cookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (value && firebaseAdminAuth) {
    try { const decoded = await firebaseAdminAuth.verifySessionCookie(value); await firebaseAdminAuth.revokeRefreshTokens(decoded.uid); } catch { /* no token diagnostics */ }
  }
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
