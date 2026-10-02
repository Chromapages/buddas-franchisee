import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, ClipboardList, Clock3, FileText, KeyRound, MapPin, MessageSquare, Package, Users } from "lucide-react";
import type { WorkRecord } from "@/src/features/corporate/types";
import { EmptyState } from "./corporate-ui";

type QueueState = { view: string; q: string; type: string; locationId: string; sort: string; record: string; detail: string };
type DetailTab = "overview" | "activity" | "related" | "notes";

const dayMs = 86_400_000;
const recordIcon = (type: WorkRecord["type"]) => type === "order" ? Package : type === "support" ? MessageSquare : type === "request" ? ClipboardList : type === "access" ? KeyRound : FileText;
const ageLabel = (createdAt: string, now: number) => {
  const age = Date.parse(createdAt);
  if (!Number.isFinite(age)) return "Age unknown";
  const days = Math.max(0, Math.floor((now - age) / dayMs));
  return `${days} day${days === 1 ? "" : "s"}`;
};
const dateLabel = (value: string) => Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Denver" }).format(new Date(value)) : "Unknown";
const statusLabel = (record: WorkRecord) => record.isClosed ? "Closed" : record.type === "order" && record.waitingReason?.toLowerCase().includes("supplier") ? "Awaiting supplier" : record.waitingReason ? "Waiting" : "Open";
const statusTone = (record: WorkRecord) => record.isClosed ? "is-closed" : record.waitingReason ? "is-waiting" : "is-open";

export function AuthorizedWorkQueue({ records, state, canBrowseLocations }: { records: WorkRecord[]; state: QueueState; canBrowseLocations: boolean }) {
  const sort = state.sort === "newest" || state.sort === "updated" ? state.sort : "oldest";
  const sortLabel = sort === "newest" ? "Newest first" : sort === "updated" ? "Recently updated" : "Oldest first";
  const ordered = [...records].sort((a, b) => sort === "updated" ? Date.parse(b.updatedAt) - Date.parse(a.updatedAt) : sort === "newest" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const selected = ordered.find((record) => record.id === state.record) || ordered[0];
  const detail: DetailTab = state.detail === "activity" || state.detail === "related" || state.detail === "notes" ? state.detail : "overview";
  const now = Date.now();
  const hrefFor = (changes: Partial<QueueState>) => {
    const next = { ...state, ...changes };
    const params = new URLSearchParams();
    if (next.view !== "open") params.set("view", next.view);
    if (next.q) params.set("q", next.q);
    if (next.type !== "all") params.set("type", next.type);
    if (next.locationId) params.set("locationId", next.locationId);
    if (next.sort !== "oldest") params.set("sort", next.sort);
    if (next.record) params.set("record", next.record);
    if (next.detail !== "overview") params.set("detail", next.detail);
    const suffix = params.toString();
    return suffix ? `/corporate/work?${suffix}` : "/corporate/work";
  };
  const timeline = selected ? [{ at: selected.createdAt, title: "Record created", description: selected.subject }, ...(selected.updatedAt !== selected.createdAt ? [{ at: selected.updatedAt, title: "Record updated", description: selected.state }] : [])] : [];
  const SelectedIcon = selected ? recordIcon(selected.type) : FileText;
  const owner = selected?.assignedToName || selected?.assignedToUserId || selected?.teamId?.replaceAll("-", " ") || "Unassigned";

  return <section className="authorized-queue" aria-label="Authorized queue">
    <div className="authorized-queue-layout">
      <section className="authorized-queue-list" aria-label="Authorized records">
        <header className="authorized-queue-list-heading"><strong>{ordered.length} record{ordered.length === 1 ? "" : "s"}</strong><span>Sorted: {sortLabel.toLowerCase()}</span></header>
        <div className="authorized-queue-list-labels" aria-hidden="true"><span>Record</span><span>Location</span><span>State</span><span>Age</span><span /></div>
        {ordered.length ? <ul>{ordered.map((record) => {
          const Icon = recordIcon(record.type);
          const divider = record.subject.indexOf(" · ");
          const title = divider < 0 ? record.subject : record.subject.slice(0, divider);
          const detailText = divider < 0 ? null : record.subject.slice(divider + 3);
          return <li key={record.id}><Link href={hrefFor({ record: record.id, detail: "overview" })} scroll={false} className="authorized-queue-row" aria-current={selected?.id === record.id ? "true" : undefined}>
            <span className={`authorized-queue-row-icon is-${record.type}`}><Icon size={22} aria-hidden="true" /></span>
            <span className="authorized-queue-row-record"><strong>{record.reference}</strong><b>{title}</b>{detailText ? <small>{detailText}</small> : null}</span>
            <span className="authorized-queue-row-location">{record.locationName || "Portfolio"}</span>
            <span className="authorized-queue-row-state"><b className={`authorized-queue-status ${statusTone(record)}`}>{statusLabel(record)}</b><small>{record.waitingReason || record.nextAction}</small></span>
            <span className="authorized-queue-row-age">{ageLabel(record.createdAt, now)}</span>
            <ChevronRight size={20} aria-hidden="true" />
          </Link></li>;
        })}</ul> : <EmptyState title="No records match these filters" description="Choose another view, search term, or record type." />}
      </section>

      {selected ? <article className="authorized-queue-detail" aria-labelledby="authorized-queue-detail-title">
        <header className="authorized-queue-detail-header">
          <span className={`authorized-queue-detail-icon is-${selected.type}`}><SelectedIcon size={28} aria-hidden="true" /></span>
          <div><h2 id="authorized-queue-detail-title">{selected.reference}</h2><p>{selected.subject}</p></div>
          <div className="authorized-queue-detail-status"><b className={`authorized-queue-status ${statusTone(selected)}`}>{statusLabel(selected)}</b><span>{ageLabel(selected.createdAt, now)} old</span></div>
        </header>
        <nav className="authorized-queue-detail-tabs" aria-label="Record detail views">{(["overview", "activity", "related", "notes"] as const).map((tab) => <Link key={tab} href={hrefFor({ record: selected.id, detail: tab })} scroll={false} aria-current={detail === tab ? "page" : undefined}>{tab[0].toUpperCase() + tab.slice(1)}</Link>)}</nav>

        {detail === "overview" ? <div className="authorized-queue-overview">
          <div className="authorized-queue-detail-column">
            <section className="authorized-queue-detail-card authorized-queue-next-action"><h3>Next action</h3><strong>{selected.nextAction}</strong><p>{selected.waitingReason || "Open the owning record to review its current state and next step."}</p><Link href={selected.href} className="authorized-queue-primary-action">Open source record<ArrowRight size={17} aria-hidden="true" /></Link></section>
            <section className="authorized-queue-detail-card authorized-queue-activity"><div className="authorized-queue-card-heading"><h3>Recent activity</h3><Link href={hrefFor({ record: selected.id, detail: "activity" })} scroll={false}>View all</Link></div><ol>{timeline.map((item) => <li key={`${item.title}-${item.at}`}><time dateTime={item.at}>{dateLabel(item.at)}</time><strong>{item.title}</strong><span>{item.description}</span></li>)}</ol></section>
          </div>
          <div className="authorized-queue-detail-column">
            <section className="authorized-queue-detail-card authorized-queue-facts" aria-label="Record summary"><dl><div><MapPin size={17} aria-hidden="true" /><dt>Location</dt><dd>{selected.locationName || "Portfolio"}</dd></div><div><Users size={17} aria-hidden="true" /><dt>Owner</dt><dd>{owner}</dd></div><div><CalendarDays size={17} aria-hidden="true" /><dt>Created</dt><dd>{dateLabel(selected.createdAt)}</dd></div><div><Clock3 size={17} aria-hidden="true" /><dt>Age</dt><dd>{ageLabel(selected.createdAt, now)}</dd></div><div><Clock3 size={17} aria-hidden="true" /><dt>Updated</dt><dd>{dateLabel(selected.updatedAt)}</dd></div></dl></section>
            <section className="authorized-queue-detail-card authorized-queue-record-details"><h3>Record details</h3><dl><div><dt>Record type</dt><dd>{selected.type}</dd></div><div><dt>Record ID</dt><dd>{selected.reference}</dd></div><div><dt>Priority</dt><dd>{selected.priority.toLowerCase()}</dd></div><div><dt>State</dt><dd>{selected.state}</dd></div></dl></section>
            {selected.waitingReason ? <aside className="authorized-queue-dependency"><strong>Waiting on external action</strong><p>{selected.waitingReason}</p></aside> : null}
          </div>
        </div> : detail === "activity" ? <section className="authorized-queue-single-tab authorized-queue-activity"><h3>Recorded timeline</h3><ol>{timeline.map((item) => <li key={`${item.title}-${item.at}`}><time dateTime={item.at}>{dateLabel(item.at)}</time><strong>{item.title}</strong><span>{item.description}</span></li>)}</ol><p>Open the source record for domain-specific activity.</p><Link href={selected.href}>Open source record<ArrowRight size={16} aria-hidden="true" /></Link></section> : detail === "related" ? <section className="authorized-queue-single-tab"><h3>Related records</h3><Link href={selected.href}>Owning {selected.type} record<ArrowRight size={16} aria-hidden="true" /></Link>{canBrowseLocations && selected.locationId ? <Link href={`/corporate/directory/locations/${encodeURIComponent(selected.locationId)}`}>{selected.locationName || "Location"}<ArrowRight size={16} aria-hidden="true" /></Link> : null}</section> : <section className="authorized-queue-single-tab"><h3>Notes</h3><p>{selected.waitingReason || "No shared queue note is recorded for this item."}</p><Link href={selected.href}>Open source record for full notes<ArrowRight size={16} aria-hidden="true" /></Link></section>}
      </article> : <section className="authorized-queue-detail authorized-queue-detail-empty" aria-label="Record details"><FileText size={30} aria-hidden="true" /><h2>No record selected</h2><p>Adjust the filters to show authorized work.</p></section>}
    </div>
  </section>;
}
