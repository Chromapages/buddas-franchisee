"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, CircleHelp, Clock3, FileText, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import type { ExpansionApplication } from "@/src/features/portal/expansion-records";
import { EXPANSION_STATUS, type ExpansionApplicationStatus } from "@/src/features/portal/expansion-status";
import { expansionSiteReadinessOptions } from "@/src/features/portal/expansion-schema";
import { formatPortalDate, formatPortalDateTime } from "@/src/features/portal/date-time";
import { ExpansionAdminAction } from "@/src/components/portal/expansion-admin-action";

type LaneId = "submitted" | "review" | "next";
type FilterId = "ALL" | LaneId | "closed";
const laneFor = (status: ExpansionApplicationStatus): LaneId | "closed" => EXPANSION_STATUS[status].terminal ? "closed" : status === "SUBMITTED" ? "submitted" : status === "BUILDOUT" ? "next" : "review";
const lanes: Array<{ id: LaneId; title: string; description: string; icon: typeof FileText }> = [
  { id: "submitted", title: "Submitted", description: "Franchise Development received the request.", icon: FileText },
  { id: "review", title: "In review", description: "The opportunity is being evaluated.", icon: Search },
  { id: "next", title: "Next steps", description: "Approved or moving toward opening.", icon: CheckCircle2 },
];

export const GrowthRequestsWorkspace = ({ applications, isAdmin }: { applications: ExpansionApplication[]; isAdmin: boolean }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("ALL");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const normalized = query.trim().toLocaleLowerCase("en-US");
  const filtered = useMemo(() => applications.filter((application) => {
    const lane = laneFor(application.status);
    return (filter === "ALL" || filter === lane) && (!normalized || [application.id, application.targetMarket, EXPANSION_STATUS[application.status].label].some((value) => value.toLocaleLowerCase("en-US").includes(normalized)));
  }).sort((a, b) => (sort === "newest" ? -1 : 1) * ((Date.parse(a.updatedAt) || 0) - (Date.parse(b.updatedAt) || 0))), [applications, filter, normalized, sort]);
  const counts = useMemo(() => ({ submitted: applications.filter((a) => laneFor(a.status) === "submitted").length, review: applications.filter((a) => laneFor(a.status) === "review").length, next: applications.filter((a) => laneFor(a.status) === "next").length, closed: applications.filter((a) => laneFor(a.status) === "closed").length }), [applications]);
  const active = filtered.filter((application) => laneFor(application.status) !== "closed");
  const closed = filtered.filter((application) => laneFor(application.status) === "closed");

  return <div className="growth-board-shell">
    <section className="growth-board-metrics" aria-label="Growth request summary">
      <article aria-label={`${counts.submitted} submitted requests`}><FileText aria-hidden="true" /><span><b>Submitted</b><small>Recently submitted requests</small></span></article>
      <article aria-label={`${counts.review} requests in review`}><Search aria-hidden="true" /><span><b>In review</b><small>Under development review</small></span></article>
      <article aria-label={`${counts.next} requests in next steps`}><Sparkles aria-hidden="true" /><span><b>Next steps</b><small>Moving toward opening</small></span></article>
      <article aria-label={`${counts.closed} closed requests`}><CheckCircle2 aria-hidden="true" /><span><b>Closed</b><small>Completed or not proceeding</small></span></article>
    </section>
    <div className="growth-board-toolbar" role="search">
      <label className="growth-board-search"><span className="sr-only">Search growth requests</span><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests, markets, or request IDs…" /></label>
      <label><span className="sr-only">Filter by stage</span><select value={filter} onChange={(event) => setFilter(event.target.value as FilterId)}><option value="ALL">All stages</option><option value="submitted">Submitted</option><option value="review">In review</option><option value="next">Next steps</option><option value="closed">Closed</option></select></label>
      <label className="growth-board-sort"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")}><option value="newest">Last updated</option><option value="oldest">Oldest updated</option></select></label>
    </div>
    <section className="growth-board-active" aria-labelledby="growth-active-title">
      <header><h2 id="growth-active-title">Active requests ({active.length})</h2><p>Your current growth requests and their status in the development process.</p></header>
      <div className="growth-board-lanes">{lanes.map((lane) => {
        const rows = active.filter((application) => laneFor(application.status) === lane.id);
        const Icon = lane.icon;
        return <section key={lane.id} className="growth-board-lane" data-lane={lane.id} aria-labelledby={`lane-${lane.id}`}>
          <header><Icon aria-hidden="true" /><div><h3 id={`lane-${lane.id}`}>{lane.title} ({rows.length})</h3><p>{lane.description}</p></div></header>
          <div className="growth-board-cards">{rows.length ? rows.map((application) => {
            const status = EXPANSION_STATUS[application.status];
            const readiness = expansionSiteReadinessOptions.find((option) => option.value === application.siteReadiness)?.label;
            return <details key={`${application.entityId}-${application.id}`} className="growth-board-card"><summary><span><strong>{application.id}</strong><time dateTime={application.updatedAt}>{formatPortalDate(application.updatedAt, application.originatingUnitId)}</time></span><span className="growth-board-market"><MapPin aria-hidden="true" /><b>{application.targetMarket}</b><small>{readiness || "Site readiness not available"}</small></span><span className="growth-board-status">{status.label}</span><span className="growth-board-next"><small>Next action</small><b>{lane.id === "submitted" ? "No action needed" : lane.id === "review" ? "Franchise Development is reviewing" : "Follow the opening plan"}</b><ChevronRight aria-hidden="true" /></span></summary><div className="growth-board-detail"><dl>{isAdmin ? <div><dt>Applicant</dt><dd>{application.applicantName}<small>{application.applicantEmail}</small></dd></div> : null}<div><dt>Timeline</dt><dd>{application.preferredTimeline}</dd></div><div><dt>Originating unit</dt><dd>{application.originatingUnitId}</dd></div><div><dt>Investment range</dt><dd>{application.investmentRange}</dd></div><div><dt>Last updated</dt><dd>{formatPortalDateTime(application.updatedAt, application.originatingUnitId)}</dd></div><div className="growth-board-plan"><dt>Operating plan</dt><dd>{application.operatingPlan}</dd></div></dl>{isAdmin ? <ExpansionAdminAction key={application.status} entityId={application.entityId} applicationId={application.id} allowedNextStates={status.allowedNextStates} /> : null}</div></details>;
          }) : <div className="growth-board-lane-empty"><Clock3 aria-hidden="true" /><strong>No requests in this stage</strong><p>{lane.id === "next" ? "Approved requests will appear here with their next steps." : "Requests will appear here as they enter this stage."}</p></div>}</div>
        </section>;
      })}</div>
    </section>
    <section className="growth-board-closed" aria-labelledby="growth-closed-title"><header><div><h2 id="growth-closed-title">Closed requests ({closed.length})</h2><p>Past requests and their outcomes.</p></div></header>{closed.length ? <div className="growth-board-table-wrap"><table><thead><tr><th>Request ID</th><th>Market / Location</th><th>Final status</th><th>Closed date</th><th>Details</th></tr></thead><tbody>{closed.map((application) => <tr key={`${application.entityId}-${application.id}`}><td>{application.id}</td><td><MapPin aria-hidden="true" />{application.targetMarket}</td><td><span>{EXPANSION_STATUS[application.status].label}</span></td><td>{formatPortalDate(application.updatedAt, application.originatingUnitId)}</td><td><details><summary>View details <ArrowRight aria-hidden="true" /></summary><p>{EXPANSION_STATUS[application.status].meaning}</p></details></td></tr>)}</tbody></table></div> : <p className="growth-board-closed-empty">No closed requests match the current filters.</p>}</section>
    {!filtered.length && applications.length ? <p className="growth-board-no-results" role="status">No growth requests match the current search and stage filters.</p> : null}
    {!applications.length ? <section className="growth-board-zero" aria-labelledby="growth-zero-title"><FileText aria-hidden="true" /><div><h2 id="growth-zero-title">No growth requests yet</h2><p>Start a request when you&rsquo;re ready to discuss another location.</p></div>{!isAdmin ? <Link href="/portal/expansion/new">Start growth request <ArrowRight aria-hidden="true" /></Link> : null}</section> : null}
    <aside className="growth-board-guidance"><ShieldCheck aria-hidden="true" /><p>Submitting a request does not reserve territory or guarantee development approval.</p><Link href="/portal/support"><CircleHelp aria-hidden="true" />Questions? Contact Operations Support</Link></aside>
  </div>;
};
