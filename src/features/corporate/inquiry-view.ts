import type { WorkRecord } from "./types.ts";
import type { StoredInquiry } from "../inquiry/types.ts";

export const inquiryAsWorkRecord = (inquiry: StoredInquiry): WorkRecord => ({
  id: `inquiry-${inquiry.id}`,
  reference: inquiry.id,
  type: "inquiry",
  subject: `Franchise inquiry · ${String(inquiry.payload.marketInterest || "Target market")}`,
  regionId: inquiry.routing.regionId,
  state: inquiry.workflow.status,
  isClosed: inquiry.workflow.status === "CLOSED",
  teamId: inquiry.routing.teamId,
  assignedToUserId: inquiry.workflow.assignedToUserId,
  assignedToName: inquiry.workflow.assignedToName,
  priority: inquiry.routing.status === "ROUTED" ? "NORMAL" : "HIGH",
  nextAction: inquiry.workflow.nextAction,
  waitingReason: inquiry.routing.status === "ROUTED" ? undefined : inquiry.routing.reason,
  followUpAt: inquiry.workflow.followUpAt,
  createdAt: inquiry.submittedAt,
  updatedAt: inquiry.workflow.updatedAt,
  version: inquiry.version,
  href: `/corporate/inquiries/${encodeURIComponent(inquiry.id)}`,
});
