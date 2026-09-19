import "server-only";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { getCorporateStorage } from "@/src/features/corporate/storage";
import { getCorporateSupportRepository } from "@/src/features/corporate/support/server";
import { listCorporateSupport } from "@/src/features/corporate/support/service";
import type { CorporateSession, WorkRecord } from "@/src/features/corporate/types";
import {
  corporateOrdersAsWork,
  corporateRequestsAsWork,
  listCorporateOrders,
  listCorporateRequests,
} from "@/src/features/corporate/operations-data";
import { getCorporateInquiries } from "@/src/features/corporate/inquiries";
import { inquiryAsWorkRecord } from "@/src/features/corporate/inquiry-view";

export async function loadCorporateWork(session: CorporateSession): Promise<WorkRecord[]> {
  const [projected, support, orders, requests, inquiries] = await Promise.all([
    getCorporateStorage().listWorkRecords(session),
    hasCorporatePermission(session, "VIEW_SUPPORT") ? listCorporateSupport(session, getCorporateSupportRepository()).catch(() => []) : Promise.resolve([]),
    hasCorporatePermission(session, "VIEW_ORDERS") ? listCorporateOrders(session).catch(() => []) : Promise.resolve([]),
    hasCorporatePermission(session, "VIEW_REQUESTS") ? listCorporateRequests(session).catch(() => []) : Promise.resolve([]),
    hasCorporatePermission(session, "VIEW_INQUIRIES") ? getCorporateInquiries(session).catch(() => []) : Promise.resolve([]),
  ]);
  const supportRecords: WorkRecord[] = support.map((ticket) => ({
    id: `support:${ticket.locationId}:${ticket.id}`, reference: ticket.id, type: "support", subject: ticket.subject,
    organizationId: ticket.organizationId || undefined, locationId: ticket.locationId, locationName: ticket.locationName,
    state: ticket.status, isClosed: ticket.status === "Resolved", teamId: "Operations support",
    assignedToUserId: ticket.assignedToUserId, assignedToName: ticket.assignedToUserId,
    priority: ticket.operatorActionRequired ? "HIGH" : "NORMAL", nextAction: ticket.operatorActionRequired ? "Await operator reply" : ticket.status === "Open" ? "Triage and assign" : ticket.status === "Resolved" ? "No action" : "Continue investigation",
    waitingReason: ticket.status === "Waiting" ? "Operator response" : undefined,
    createdAt: ticket.createdAt, updatedAt: ticket.updatedAt, version: ticket.version ?? 0,
    href: `/corporate/support/${encodeURIComponent(ticket.id)}?unitId=${encodeURIComponent(ticket.locationId)}`,
  }));
  const discovered = [...supportRecords, ...corporateOrdersAsWork(orders), ...corporateRequestsAsWork(requests), ...inquiries.map(inquiryAsWorkRecord)];
  const existing = new Set(projected.map((record) => `${record.type}:${record.reference}`));
  return [...projected, ...discovered.filter((record) => !existing.has(`${record.type}:${record.reference}`))].sort((a, b) => Number(a.isClosed) - Number(b.isClosed) || (a.followUpAt || a.createdAt).localeCompare(b.followUpAt || b.createdAt));
}
