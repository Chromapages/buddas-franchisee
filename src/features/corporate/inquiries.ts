"use server";

import { revalidatePath } from "next/cache";
import { hasCorporatePermission, assertCorporatePermission } from "./authorization.ts";
import { getCorporateSession } from "./session.ts";
import type { CorporateSession } from "./types.ts";
import { defaultInquiryStorage } from "../inquiry/storage-adapter.ts";
import type { InquiryDecisionStatus, InquiryWorkflowStatus, StoredInquiry } from "../inquiry/types.ts";
import { getFranchiseDevelopmentRegion } from "../inquiry/routing.ts";

const targetFor = (inquiry: StoredInquiry) => inquiry.routing.regionId ? { regionId: inquiry.routing.regionId } : {};

export const getCorporateInquiries = async (session: CorporateSession): Promise<StoredInquiry[]> => {
  assertCorporatePermission(session, "VIEW_INQUIRIES");
  const inquiries = await defaultInquiryStorage.getAll();
  return inquiries.filter((inquiry) => hasCorporatePermission(session, "VIEW_INQUIRIES", targetFor(inquiry)));
};

export const getCorporateInquiry = async (session: CorporateSession, id: string): Promise<StoredInquiry | null> => {
  const inquiry = await defaultInquiryStorage.getById(id);
  if (!inquiry || !hasCorporatePermission(session, "VIEW_INQUIRIES", targetFor(inquiry))) return null;
  return inquiry;
};

export type InquiryActionState = { status: "idle" | "success" | "error"; message: string };

const validWorkflowStatus = new Set<InquiryWorkflowStatus>(["NEW", "ASSIGNED", "CONTACTING", "ENGAGED", "ON_HOLD", "CLOSED"]);
const validDecision = new Set<InquiryDecisionStatus>(["PENDING", "ADVANCE", "HOLD", "NOT_PROCEEDING"]);

const activityFor = (session: CorporateSession, action: string, occurredAt: string, note?: string) => ({
  id: `${occurredAt}-${session.userId}-${action}`,
  action,
  actorId: session.userId,
  actorName: session.displayName,
  occurredAt,
  ...(note ? { note } : {}),
});

export const runCorporateInquiryAction = async (_previous: InquiryActionState, formData: FormData): Promise<InquiryActionState> => {
  const session = await getCorporateSession();
  if (!session) return { status: "error", message: "Corporate access has expired. Sign in again." };
  const id = String(formData.get("inquiryId") || "");
  const expectedVersion = Number(formData.get("expectedVersion"));
  const action = String(formData.get("action") || "");
  const note = String(formData.get("note") || "").trim();
  const inquiry = await getCorporateInquiry(session, id);
  if (!inquiry || !Number.isSafeInteger(expectedVersion) || inquiry.version !== expectedVersion) return { status: "error", message: "This inquiry changed or is outside your scope. Reload before updating it." };
  const target = targetFor(inquiry);
  try {
    if (action === "reroute") {
      assertCorporatePermission(session, "MANAGE_INQUIRIES", target);
      const regionId = String(formData.get("regionId") || "");
      const region = await getFranchiseDevelopmentRegion(regionId);
      if (!region || note.length < 8 || note.length > 900) throw new Error("Choose an active franchise-development region and provide an 8–900 character routing reason.");
      assertCorporatePermission(session, "MANAGE_INQUIRIES", { regionId: region.id });
      const occurredAt = new Date().toISOString();
      const updated = await defaultInquiryStorage.updateRouting(id, expectedVersion, { status: "ROUTED", regionId: region.id, teamId: region.teamId, ruleId: "manual-override", ruleVersion: region.ruleVersion, reason: note, routedAt: occurredAt, overriddenByUserId: session.userId, overrideReason: note, history: [...inquiry.routing.history, activityFor(session, "ROUTING_OVERRIDDEN", occurredAt, note)] });
      if (!updated) throw new Error("The inquiry changed before routing was overridden.");
    } else if (action === "claim") {
      assertCorporatePermission(session, "ASSIGN_INQUIRIES", target);
      const occurredAt = new Date().toISOString();
      const updated = await defaultInquiryStorage.updateWorkflow(id, expectedVersion, { ...inquiry.workflow, status: "ASSIGNED", assignedToUserId: session.userId, assignedToName: session.displayName, nextAction: "Review candidate and record first contact", updatedAt: occurredAt, history: [...inquiry.workflow.history, activityFor(session, "CLAIMED", occurredAt)] });
      if (!updated) throw new Error("The inquiry changed before assignment.");
    } else if (action === "advance" || action === "hold" || action === "close") {
      assertCorporatePermission(session, action === "advance" ? "RECORD_INQUIRY_DECISION" : "MANAGE_INQUIRIES", target);
      if (note.length < 8 || note.length > 900) throw new Error("Provide a clear 8–900 character review note.");
      const decision: InquiryDecisionStatus = action === "advance" ? "ADVANCE" : action === "hold" ? "HOLD" : "NOT_PROCEEDING";
      const status: InquiryWorkflowStatus = action === "advance" ? "ENGAGED" : action === "hold" ? "ON_HOLD" : "CLOSED";
      const occurredAt = new Date().toISOString();
      const activityAction = action === "advance" ? "ADVANCED" : action === "hold" ? "PLACED_ON_HOLD" : "CLOSED";
      const updated = await defaultInquiryStorage.updateWorkflow(id, expectedVersion, { ...inquiry.workflow, status, decision, decisionNote: note, decidedByUserId: session.userId, decidedByName: session.displayName, nextAction: action === "advance" ? "Continue documented franchise-development review" : action === "hold" ? "Review hold reason and follow-up date" : "No further outreach without a new reviewed action", updatedAt: occurredAt, history: [...inquiry.workflow.history, activityFor(session, activityAction, occurredAt, note)] });
      if (!updated) throw new Error("The inquiry changed before the decision was recorded.");
    } else return { status: "error", message: "Unsupported inquiry action." };
    revalidatePath("/corporate/inquiries");
    revalidatePath(`/corporate/inquiries/${id}`);
    revalidatePath("/corporate");
    revalidatePath("/corporate/work");
    return { status: "success", message: "Inquiry workflow updated." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "The inquiry update could not be confirmed." };
  }
};
