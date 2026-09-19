import type { WorkRecord } from "@/src/features/corporate/types";
import { WorkTable, type WorkRow } from "./corporate-ui";

const relativeAge = (value: string) => {
  const elapsed = Date.now() - Date.parse(value);
  if (!Number.isFinite(elapsed)) return "Unknown";
  const hours = Math.max(0, Math.floor(elapsed / 3_600_000));
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export const recordTone = (record: Pick<WorkRecord, "priority" | "isClosed" | "waitingReason">): WorkRow["tone"] => record.isClosed ? "success" : record.priority === "URGENT" ? "danger" : record.priority === "HIGH" ? "attention" : record.waitingReason ? "waiting" : "neutral";

export function CorporateWorkRecords({ records, caption, variant = "standard" }: { records: WorkRecord[]; caption?: string; variant?: "standard" | "dashboard" }) {
  const rows: WorkRow[] = records.map((record) => ({
    href: record.href,
    reference: record.reference,
    type: record.type,
    summary: record.subject,
    location: record.locationName || record.locationId || "Portfolio",
    state: record.state,
    nextAction: record.nextAction,
    owner: record.assignedToName || (record.assignedToUserId ? "Assigned" : record.teamId || "Unassigned"),
    timing: record.followUpAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(record.followUpAt)) : relativeAge(record.createdAt),
    tone: recordTone(record),
  }));
  return <WorkTable rows={rows} caption={caption} variant={variant} />;
}
