import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { CorporatePanel, EmptyState, ErrorState, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { CorporateDashboardFreshness } from "@/src/components/corporate/corporate-dashboard-freshness";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateSupportRepository } from "@/src/features/corporate/support/server";
import { listCorporateSupport } from "@/src/features/corporate/support/service";
import "../work/work-masthead.css";

export default async function CorporateSupportPage({ searchParams }: { searchParams: Promise<{ caseId?: string | string[]; unitId?: string | string[]; q?: string | string[]; status?: string | string[]; sort?: string | string[] }> }) {
  const query = await searchParams;
  if (typeof query.caseId === "string" && typeof query.unitId === "string") redirect(`/corporate/support/${encodeURIComponent(query.caseId)}?unitId=${encodeURIComponent(query.unitId)}`);
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_SUPPORT")) return <ErrorState title="Support is not available" description="Your current corporate scope does not include support records." retryHref="/corporate" />;
  const loadedTickets = await listCorporateSupport(session, getCorporateSupportRepository()).catch(() => null);
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const status = query.status === "all" || query.status === "waiting" || query.status === "resolved" ? query.status : "open";
  const sort = query.sort === "newest" ? "newest" : "oldest";
  const open = loadedTickets?.filter((ticket) => ticket.status !== "Resolved") || [];
  const waiting = loadedTickets?.filter((ticket) => ticket.status === "Waiting") || [];
  const resolved = loadedTickets?.filter((ticket) => ticket.status === "Resolved") || [];
  const filtered = loadedTickets?.filter((ticket) => (status === "all" || status === "resolved" && ticket.status === "Resolved" || status === "waiting" && ticket.status === "Waiting" || status === "open" && ticket.status !== "Resolved") && (!q || `${ticket.id} ${ticket.subject} ${ticket.locationName} ${ticket.topic}`.toLowerCase().includes(q))) || null;
  const tickets = filtered?.slice().sort((a, b) => sort === "newest" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : Date.parse(a.createdAt) - Date.parse(b.createdAt)) || null;
  const statusHref = (nextStatus: string) => {
    const params = new URLSearchParams();
    if (nextStatus !== "open") params.set("status", nextStatus);
    if (sort === "newest") params.set("sort", sort);
    const suffix = params.toString();
    return suffix ? `/corporate/support?${suffix}` : "/corporate/support";
  };
  const sortHref = (nextSort: string) => {
    const params = new URLSearchParams();
    if (status !== "open") params.set("status", status);
    if (q) params.set("q", q);
    if (nextSort !== "oldest") params.set("sort", nextSort);
    const suffix = params.toString();
    return suffix ? `/corporate/support?${suffix}` : "/corporate/support";
  };
  const tabs = [
    { status: "open", label: "Open work", count: open.length },
    { status: "waiting", label: "Waiting", count: waiting.length },
    { status: "resolved", label: "Resolved", count: resolved.length },
    { status: "all", label: "All cases", count: loadedTickets?.length || 0 },
  ];
  return <div className="corporate-main-stack corporate-work-page">
    <section className="corporate-work-masthead" aria-labelledby="corporate-support-title">
      <div className="corporate-work-masthead-top">
        <div className="corporate-work-masthead-intro">
          <p>Operations support</p>
          <h1 id="corporate-support-title">Support cases</h1>
          <span>Triage operator issues, keep ownership visible, and separate public replies from internal notes.</span>
        </div>
        <div className="corporate-work-masthead-tools">
          {loadedTickets ? <CorporateDashboardFreshness updatedAt={new Date().toISOString()} timeZone="America/Denver" showRefreshIcon /> : <span className="corporate-masthead-status">Support unavailable</span>}
          <span className="corporate-work-scope-static">Permitted cases</span>
        </div>
      </div>
      {loadedTickets ? <div className="corporate-work-masthead-bottom">
        <nav className="corporate-work-tabs" aria-label="Support case views">{tabs.map((tab) => <Link key={tab.status} href={statusHref(tab.status)} aria-current={status === tab.status ? "page" : undefined}>{tab.label}<span>{tab.count}</span></Link>)}</nav>
        <div className="corporate-work-toolbar">
          <form className="corporate-work-search" method="get" role="search">{status !== "open" ? <input type="hidden" name="status" value={status} /> : null}{sort === "newest" ? <input type="hidden" name="sort" value={sort} /> : null}<button type="submit" aria-label="Search support cases"><Search size={21} aria-hidden="true" /></button><input type="search" name="q" defaultValue={q} aria-label="Search support cases" placeholder="Search cases, locations, or topics…" /></form>
          <details className="corporate-work-sort"><summary>Sort: {sort === "newest" ? "Newest first" : "Oldest first"}<ChevronDown size={17} aria-hidden="true" /></summary><div><Link href={sortHref("oldest")} aria-current={sort === "oldest" ? "true" : undefined}>Oldest first</Link><Link href={sortHref("newest")} aria-current={sort === "newest" ? "true" : undefined}>Newest first</Link></div></details>
        </div>
      </div> : null}
    </section>
    {!tickets ? <ErrorState title="Support cases could not be loaded" description="The support record source is temporarily unavailable. No cases were changed." retryHref="/corporate/support" /> : <CorporatePanel title="Case queue" eyebrow="Authorized records" description="Review case status and ownership before opening a case.">
      {tickets.length === 0 ? <EmptyState title={q ? "No matching support cases" : status !== "open" ? "No cases in this view" : "No support cases in this scope"} description={q || status !== "open" ? "Try another search or case view." : "New operator cases will appear here after they are committed."} /> : <div className="corporate-table-region" role="region" aria-label="Support case queue" tabIndex={0}><table className="corporate-table"><caption className="sr-only">Support cases in permitted locations</caption><thead><tr><th scope="col">Case</th><th scope="col">Location</th><th scope="col">Topic</th><th scope="col">State</th><th scope="col">Owner</th><th scope="col">Updated</th></tr></thead><tbody>{tickets.map((ticket) => <tr key={`${ticket.locationId}-${ticket.id}`}><th scope="row"><Link href={`/corporate/support/${encodeURIComponent(ticket.id)}?unitId=${encodeURIComponent(ticket.locationId)}`}><small>{ticket.id}</small><strong>{ticket.subject}</strong></Link></th><td>{ticket.locationName}</td><td>{ticket.topic}</td><td><StatusBadge tone={ticket.status === "Resolved" ? "success" : ticket.status === "Waiting" ? "waiting" : "attention"}>{ticket.status}</StatusBadge></td><td>{ticket.assignedToUserId || "Unassigned"}</td><td className="corporate-tabular"><time dateTime={ticket.updatedAt}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(ticket.updatedAt))}</time></td></tr>)}</tbody></table></div>}
    </CorporatePanel>}
  </div>;
}
