import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, CircleAlert, ClipboardList, ListFilter, Search } from "lucide-react";
import { CorporatePanel, ErrorState, FilterBar, PermissionState } from "@/src/components/corporate/corporate-ui";
import { CorporateDashboardFreshness } from "@/src/components/corporate/corporate-dashboard-freshness";
import { CorporateWorkRecords } from "@/src/components/corporate/work-records";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { corporateRequestsAsWork, listCorporateRequests } from "@/src/features/corporate/operations-data";
import "../work/work-masthead.css";

export default async function CorporateRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; state?: string | string[]; sort?: string | string[] }> }) {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_REQUESTS")) return <PermissionState description="Your current corporate access does not include request reviews." />;
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const state = query.state === "open" || query.state === "decision" || query.state === "closed" ? query.state : "all";
  const sort = query.sort === "oldest" ? "oldest" : "newest";
  const loaded = await listCorporateRequests(session).then(corporateRequestsAsWork).catch(() => null);
  const open = loaded?.filter((record) => !record.isClosed) || [];
  const decisions = open.filter((record) => record.state.includes("decision_pending"));
  const closed = loaded?.filter((record) => record.isClosed) || [];
  const filtered = loaded?.filter((record) => (!q || `${record.reference} ${record.subject} ${record.organizationId || ""} ${record.locationName || ""}`.toLowerCase().includes(q)) && (state === "all" || state === "open" && !record.isClosed || state === "decision" && record.state.includes("decision_pending") || state === "closed" && record.isClosed)) || null;
  const requestRecords = filtered?.slice().sort((a, b) => sort === "oldest" ? Date.parse(a.createdAt) - Date.parse(b.createdAt) : Date.parse(b.createdAt) - Date.parse(a.createdAt)) || null;
  const stateHref = (nextState: string) => {
    const params = new URLSearchParams();
    if (nextState !== "all") params.set("state", nextState);
    if (sort === "oldest") params.set("sort", sort);
    const suffix = params.toString();
    return suffix ? `/corporate/requests?${suffix}` : "/corporate/requests";
  };
  const sortHref = (nextSort: string) => {
    const params = new URLSearchParams();
    if (state !== "all") params.set("state", state);
    if (q) params.set("q", q);
    if (nextSort !== "newest") params.set("sort", nextSort);
    const suffix = params.toString();
    return suffix ? `/corporate/requests?${suffix}` : "/corporate/requests";
  };
  const signals = [
    { state: "decision", label: "Decision needed", count: decisions.length, detail: decisions.length ? "Ready for evidence review" : "No decisions pending", tone: "is-owner", Icon: CircleAlert },
    { state: "open", label: "Open requests", count: open.length, detail: open.length ? "In active review" : "No open requests", tone: "is-due", Icon: ClipboardList },
    { state: "closed", label: "Closed", count: closed.length, detail: closed.length ? "Recorded outcomes" : "No closed requests", tone: "is-waiting", Icon: CheckCircle2 },
  ];
  const tabs = [
    { state: "all", label: "All requests", count: loaded?.length || 0 },
    { state: "open", label: "Open", count: open.length },
    { state: "decision", label: "Decision needed", count: decisions.length },
    { state: "closed", label: "Closed", count: closed.length },
  ];

  return <div className="corporate-main-stack corporate-work-page">
    <section className="corporate-work-masthead" aria-labelledby="corporate-requests-title">
      <div className="corporate-work-masthead-top">
        <div className="corporate-work-masthead-intro">
          <p>Franchise development</p>
          <h1 id="corporate-requests-title">Requests</h1>
          <span>Review typed operator requests, evidence, decision state, and the next accountable handoff.</span>
        </div>
        <div className="corporate-work-masthead-tools">
          {loaded ? <CorporateDashboardFreshness updatedAt={new Date().toISOString()} timeZone="America/Denver" showRefreshIcon /> : <span className="corporate-masthead-status">Requests unavailable</span>}
          <span className="corporate-work-scope-static">Permitted requests</span>
        </div>
      </div>

      {loaded ? <>
        <div className="corporate-work-masthead-body">
          {signals.map(({ state: signalState, label, count, detail, tone, Icon }) => <Link key={signalState} href={stateHref(signalState)} className={`corporate-work-signal ${tone}`}><span className="corporate-work-signal-icon"><Icon size={28} aria-hidden="true" /></span><span className="corporate-work-signal-copy"><strong>{count}</strong><b>{label}</b><small>{detail}</small></span><ArrowRight size={22} aria-hidden="true" /></Link>)}
          <aside className="corporate-work-quick-actions" aria-label="Quick actions">
            <h2>Quick actions</h2>
            <Link href={stateHref("decision")} className="corporate-work-action is-primary"><ArrowRight size={20} aria-hidden="true" />Review decisions</Link>
            <details className="corporate-work-filter-details"><summary className="corporate-work-action"><ListFilter size={21} aria-hidden="true" />Filter requests</summary><div className="corporate-work-filter-popover"><FilterBar resultCount={requestRecords?.length || 0}>{q ? <input type="hidden" name="q" value={q} /> : null}{sort === "oldest" ? <input type="hidden" name="sort" value={sort} /> : null}<label className="corporate-field"><span>Decision state</span><select name="state" defaultValue={state}><option value="all">All states</option><option value="open">Open work</option><option value="decision">Decision needed</option><option value="closed">Closed</option></select></label></FilterBar></div></details>
          </aside>
        </div>
        <div className="corporate-work-masthead-bottom">
          <nav className="corporate-work-tabs" aria-label="Request views">{tabs.map((tab) => <Link key={tab.state} href={stateHref(tab.state)} aria-current={state === tab.state ? "page" : undefined}>{tab.label}<span>{tab.count}</span></Link>)}</nav>
          <div className="corporate-work-toolbar">
            <form className="corporate-work-search" method="get" role="search">{state !== "all" ? <input type="hidden" name="state" value={state} /> : null}{sort === "oldest" ? <input type="hidden" name="sort" value={sort} /> : null}<button type="submit" aria-label="Search requests"><Search size={21} aria-hidden="true" /></button><input type="search" name="q" defaultValue={q} aria-label="Search requests" placeholder="Search requests, entities, or locations…" /></form>
            <details className="corporate-work-sort"><summary>Sort: {sort === "oldest" ? "Oldest first" : "Newest first"}<ChevronDown size={17} aria-hidden="true" /></summary><div><Link href={sortHref("newest")} aria-current={sort === "newest" ? "true" : undefined}>Newest first</Link><Link href={sortHref("oldest")} aria-current={sort === "oldest" ? "true" : undefined}>Oldest first</Link></div></details>
          </div>
        </div>
      </> : null}
    </section>
    {!requestRecords ? <ErrorState title="Requests could not be loaded" description="The request source is unavailable. No decisions were changed." retryHref="/corporate/requests" /> : <CorporatePanel title="Request review queue" description="Formal decisions belong on each request detail after the submitted version is reviewed."><CorporateWorkRecords records={requestRecords} caption="Corporate requests" /></CorporatePanel>}
  </div>;
}
