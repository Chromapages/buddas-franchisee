import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CORPORATE_FIREBASE_SESSION_COOKIE, getPortalSession } from "../auth/session";
import { firebaseAdminAuth, firebaseDb } from "../../lib/firebase/admin";
import { isActiveCorporateMembership, parseCorporateMemberships } from "./authorization";
import { isCorporateSeedMode } from "./environment";
import { getCorporatePreviewMemberships } from "./seed-data";
import type { CorporateSession } from "./types";

/** Corporate grants are read from the server-owned registry on every request. */
export const getCorporateSession = async (): Promise<CorporateSession | null> => {
  if (isCorporateSeedMode()) {
    const identity = await getPortalSession();
    if (!identity) return null;
    return { userId: identity.userId, email: identity.email, displayName: identity.displayName || "Preview operations lead",
      identityClass: "CORPORATE", expiresAt: identity.expiresAt, memberships: getCorporatePreviewMemberships(), isDevelopmentPreview: true };
  }
  if (!firebaseAdminAuth || !firebaseDb) return null;
  const cookie = (await cookies()).get(CORPORATE_FIREBASE_SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const token = await firebaseAdminAuth.verifySessionCookie(cookie, true);
    if (!token.email || !token.email_verified) return null;
    // Production corporate access must carry second-factor evidence from Firebase.
    if (process.env.NODE_ENV !== "development" && !token.firebase?.sign_in_second_factor) return null;
    const document = await firebaseDb.collection("corporateStaff").doc(token.uid).get();
    const staff = document.data();
    if (!staff || staff.status !== "ACTIVE") return null;
    const memberships = parseCorporateMemberships(staff.memberships).filter((membership) => isActiveCorporateMembership(membership));
    if (!memberships.length) return null;
    if (staff.identityClass === "OPERATOR") return null;
    return { userId: token.uid, email: token.email, displayName: typeof staff.displayName === "string" ? staff.displayName : token.email,
      identityClass: "CORPORATE", expiresAt: token.exp * 1000, memberships, isDevelopmentPreview: false };
  } catch {
    return null;
  }
};

export const requireCorporateSession = async (): Promise<CorporateSession> => {
  const session = await getCorporateSession();
  if (!session) redirect("/franchise/login?access=corporate");
  return session;
};
