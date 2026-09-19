"use server";

import { revalidatePath } from "next/cache";
import { getCorporateSession } from "../session";
import { isCorporateSeedMode } from "../environment";
import { parseCorporateMemberships } from "../authorization";
import { getCorporateStorage } from "../storage";
import { firebaseDb } from "../../../lib/firebase/admin";
import { getCorporateSupportRepository } from "./server";
import { executeCorporateSupportCommand } from "./service";
import type { SupportCommandKind } from "./model";
import type { CorporateSession } from "../types";

export type CorporateSupportActionState = { status: "idle" | "success" | "error"; message: string };

export async function runCorporateSupportAction(_state: CorporateSupportActionState, formData: FormData): Promise<CorporateSupportActionState> {
  const session = await getCorporateSession();
  if (!session) return { status: "error", message: "Corporate access has expired. Sign in again." };
  if (session.isDevelopmentPreview !== isCorporateSeedMode()) return { status: "error", message: "The workspace environment changed. Reload before updating." };
  const read = (key: string) => String(formData.get(key) || "").trim();
  try {
    const resolveAssignee = async (userId: string): Promise<CorporateSession | null> => {
      const record = isCorporateSeedMode() ? (await getCorporateStorage().getPeople(session)).find((person) => person.id === userId) : (await firebaseDb!.collection("corporateStaff").doc(userId).get()).data();
      if (!record || record.identityClass === "OPERATOR" || record.status !== "ACTIVE" || typeof record.email !== "string") return null;
      return { userId, email: record.email, displayName: String(record.displayName || record.email), identityClass: "CORPORATE", expiresAt: session.expiresAt, memberships: parseCorporateMemberships(record.memberships), isDevelopmentPreview: session.isDevelopmentPreview };
    };
    const result = await executeCorporateSupportCommand(session, getCorporateSupportRepository(), {
      commandId: read("commandId"), unitId: read("unitId"), caseId: read("caseId"), expectedVersion: /^\d+$/.test(read("expectedVersion")) ? Number(read("expectedVersion")) : NaN,
      kind: read("kind") as SupportCommandKind, message: read("message"), assigneeId: read("assigneeId"),
    }, resolveAssignee);
    revalidatePath("/corporate/support");
    revalidatePath("/corporate");
    revalidatePath("/corporate/work");
    revalidatePath("/portal/support");
    revalidatePath("/portal");
    return { status: "success", message: result.replayed ? "This update was already recorded. The ticket is current." : "Support update recorded." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Support could not confirm this update. Reload the ticket before retrying." };
  }
}
