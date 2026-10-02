import Link from "next/link";
import { ArrowRight, Check, CircleHelp, Clock3, FileText, Lightbulb, Package } from "lucide-react";
import type { WorkRecord } from "@/src/features/corporate/types";

const ageInDays = (value: string) => {
  const age = Math.floor((Date.now() - Date.parse(value)) / 86_400_000);
  return Number.isFinite(age) ? Math.max(0, age) : null;
};

const ownerLabel = (record: WorkRecord) => record.assignedToName || (record.assignedToUserId ? "Assigned" : record.teamId ? record.teamId.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Unassigned");

const recordPresentation = (record: WorkRecord) => {
  const lineItem = record.type === "order" ? record.subject.match(/^(.+) · (\d+) lines?$/) : null;
  const waitingForSupplier = record.type === "order" && Boolean(record.waitingReason?.toLowerCase().includes("supplier acknowledgment"));
  return {
    title: lineItem?.[1] || record.subject || record.reference,
    detail: lineItem ? `${lineItem[2]} line item${lineItem[2] === "1" ? "" : "s"}` : record.type === "support" ? "Support case" : record.type,
    state: waitingForSupplier ? "Awaiting supplier" : record.state.replaceAll("_", " ") || "In progress",
    stateTone: waitingForSupplier || record.waitingReason ? "waiting" : record.state.toLowerCase() === "open" ? "open" : record.priority === "URGENT" || record.priority === "HIGH" ? "attention" : "neutral",
    age: ageInDays(record.createdAt),
  };
};

export function CorporateNextActions({ records, totalCount, href, scopeName }: { records: WorkRecord[]; totalCount: number; href: string; scopeName: string }) {
  return <section className="corporate-next-actions" aria-labelledby="corporate-next-actions-title">
    <header className="corporate-next-actions-header"><div><p>Next actions · {totalCount}</p><h2 id="corporate-next-actions-title">What needs attention now.</h2><span>{totalCount ? `Highest-priority items ${scopeName}.` : `No items need attention ${scopeName}.`}</span></div><Link href={href}>View all actions<ArrowRight size={20} aria-hidden="true" /></Link></header>
    {records.length ? <div className="corporate-next-actions-table-region" role="region" aria-label="Corporate actions needing attention" tabIndex={0}>
      <table className="corporate-next-actions-table">
        <caption className="sr-only">Highest-priority corporate actions {scopeName}</caption>
        <thead><tr><th scope="col">Record</th><th scope="col">Location</th><th scope="col">State</th><th scope="col">Next action</th><th scope="col">Owner</th><th scope="col">Open</th></tr></thead>
        <tbody>{records.map((record) => {
        const view = recordPresentation(record);
        const Icon = record.type === "order" ? Package : FileText;
        const ageLabel = view.age === null ? "Age unavailable" : `${record.waitingReason ? "Waiting" : "Open"} ${view.age} day${view.age === 1 ? "" : "s"}`;
        return <tr key={record.id}>
          <th scope="row"><Link href={record.href} className="corporate-next-actions-record"><span className="corporate-next-actions-icon"><Icon size={21} aria-hidden="true" /></span><span><small>{record.type} · {record.reference}</small><strong>{view.title}</strong><em>{view.detail}</em></span></Link></th>
          <td className="corporate-next-actions-location">{record.locationName || record.locationId || "Portfolio"}</td>
          <td><span className="corporate-next-actions-state"><span className={`corporate-next-actions-badge is-${view.stateTone}`}>{view.stateTone === "waiting" ? <Clock3 size={15} aria-hidden="true" /> : view.stateTone === "open" ? <Check size={15} aria-hidden="true" /> : null}{view.state}</span><small>{ageLabel}</small></span></td>
          <td className="corporate-next-actions-action"><strong>{record.nextAction || "Open record for next step"}</strong><small>{record.waitingReason || "Open record for the next step"}</small></td>
          <td className="corporate-next-actions-owner">{ownerLabel(record)}</td>
          <td><Link href={record.href} className="corporate-next-actions-open" aria-label={`Open ${record.type} ${record.reference}`}><ArrowRight size={19} aria-hidden="true" /></Link></td>
        </tr>;
      })}</tbody>
      </table>
    </div> : <div className="corporate-next-actions-empty"><CircleHelp size={27} aria-hidden="true" /><div><strong>No actions need attention</strong><span>Open the work queue to review other records.</span></div></div>}
    <footer className="corporate-next-actions-footer"><span className="corporate-next-actions-icon"><Lightbulb size={24} aria-hidden="true" /></span><div><strong>Need to reassign or get help?</strong><span>Open the full queue to filter, assign, or review details.</span></div><Link href={href}>View all actions<ArrowRight size={19} aria-hidden="true" /></Link></footer>
  </section>;
}
