import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, CircleAlert, Clock3, ListFilter, Search } from "lucide-react";
import { CorporatePanel, ErrorState, FilterBar, PermissionState } from "@/src/components/corporate/corporate-ui";
import { CorporateDashboardFreshness } from "@/src/components/corporate/corporate-dashboard-freshness";
import { CorporateWorkRecords } from "@/src/components/corporate/work-records";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { corporateOrdersAsWork, listCorporateOrders } from "@/src/features/corporate/operations-data";
import "../work/work-masthead.css";

export default async function CorporateOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; state?: string | string[]; sort?: string | string[] }> }) {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_ORDERS")) return <PermissionState description="Your current corporate access does not include supply coordination." />;
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const state = query.state === "attention" || query.state === "waiting" || query.state === "closed" ? query.state : "all";
  const sort = query.sort === "oldest" ? "oldest" : "newest";
  const loaded = await listCorporateOrders(session).then(corporateOrdersAsWork).catch(() => null);
  const attention = loaded?.filter((record) => record.priority !== "NORMAL") || [];
  const waiting = loaded?.filter((record) => Boolean(record.waitingReason)) || [];
  const closed = loaded?.filter((record) => record.isClosed) || [];
  const filtered = loaded?.filter((record) => (!q || `${record.reference} ${record.locationName || ""}`.toLowerCase().includes(q)) && (state === "all" || state === "attention" && record.priority !== "NORMAL" || state === "waiting" && Boolean(record.waitingReason) || state === "closed" && record.isClosed)) || null;
  const orderRecords = filtered?.slice().sort((a, b) => sort === "oldest" ? Date.parse(a.createdAt) - Date.parse(b.createdAt) : Date.parse(b.createdAt) - Date.parse(a.createdAt)) || null;
  const stateHref = (nextState: string) => {
    const params = new URLSearchParams();
    if (nextState !== "all") params.set("state", nextState);
    if (sort === "oldest") params.set("sort", sort);
    const suffix = params.toString();
    return suffix ? `/corporate/orders?${suffix}` : "/corporate/orders";
  };
  const sortHref = (nextSort: string) => {
    const params = new URLSearchParams();
    if (state !== "all") params.set("state", state);
    if (q) params.set("q", q);
    if (nextSort !== "newest") params.set("sort", nextSort);
    const suffix = params.toString();
    return suffix ? `/corporate/orders?${suffix}` : "/corporate/orders";
  };
  const signals = [
    { state: "attention", label: "Needs attention", count: attention.length, detail: attention.length ? "Records flagged for review" : "Nothing needs review", tone: "is-owner", Icon: CircleAlert },
    { state: "waiting", label: "Waiting on source", count: waiting.length, detail: waiting.length ? "External evidence pending" : "No pending sources", tone: "is-due", Icon: Clock3 },
    { state: "closed", label: "Closed", count: closed.length, detail: closed.length ? "Reconciled outcomes" : "No closed orders", tone: "is-waiting", Icon: CheckCircle2 },
  ];
  const tabs = [
    { state: "all", label: "All orders", count: loaded?.length || 0 },
    { state: "attention", label: "Needs attention", count: attention.length },
    { state: "waiting", label: "Waiting", count: waiting.length },
    { state: "closed", label: "Closed", count: closed.length },
  ];

  return <div className="corporate-main-stack corporate-work-page">
    <section className="corporate-work-masthead" aria-labelledby="corporate-orders-title">
      <div className="corporate-work-masthead-top">
        <div className="corporate-work-masthead-intro">
          <p>Supply coordination</p>
          <h1 id="corporate-orders-title">Orders</h1>
          <span>Track acknowledgment, fulfillment, cancellation, and recovery as separate recorded facts.</span>
        </div>
        <div className="corporate-work-masthead-tools">
          {loaded ? <CorporateDashboardFreshness updatedAt={new Date().toISOString()} timeZone="America/Denver" showRefreshIcon /> : <span className="corporate-masthead-status">Orders unavailable</span>}
          <span className="corporate-work-scope-static">Permitted orders</span>
        </div>
      </div>

      {loaded ? <>
        <div className="corporate-work-masthead-body">
          {signals.map(({ state: signalState, label, count, detail, tone, Icon }) => <Link key={signalState} href={stateHref(signalState)} className={`corporate-work-signal ${tone}`}><span className="corporate-work-signal-icon"><Icon size={28} aria-hidden="true" /></span><span className="corporate-work-signal-copy"><strong>{count}</strong><b>{label}</b><small>{detail}</small></span><ArrowRight size={22} aria-hidden="true" /></Link>)}
          <aside className="corporate-work-quick-actions" aria-label="Quick actions">
            <h2>Quick actions</h2>
            <Link href={stateHref("attention")} className="corporate-work-action is-primary"><ArrowRight size={20} aria-hidden="true" />Review attention</Link>
            <details className="corporate-work-filter-details"><summary className="corporate-work-action"><ListFilter size={21} aria-hidden="true" />Filter orders</summary><div className="corporate-work-filter-popover"><FilterBar resultCount={orderRecords?.length || 0}>{q ? <input type="hidden" name="q" value={q} /> : null}{sort === "oldest" ? <input type="hidden" name="sort" value={sort} /> : null}<label className="corporate-field"><span>Coordination state</span><select name="state" defaultValue={state}><option value="all">All coordination</option><option value="attention">Needs attention</option><option value="waiting">Waiting on source</option><option value="closed">Closed</option></select></label></FilterBar></div></details>
          </aside>
        </div>
        <div className="corporate-work-masthead-bottom">
          <nav className="corporate-work-tabs" aria-label="Order views">{tabs.map((tab) => <Link key={tab.state} href={stateHref(tab.state)} aria-current={state === tab.state ? "page" : undefined}>{tab.label}<span>{tab.count}</span></Link>)}</nav>
          <div className="corporate-work-toolbar">
            <form className="corporate-work-search" method="get" role="search">{state !== "all" ? <input type="hidden" name="state" value={state} /> : null}{sort === "oldest" ? <input type="hidden" name="sort" value={sort} /> : null}<button type="submit" aria-label="Search orders"><Search size={21} aria-hidden="true" /></button><input type="search" name="q" defaultValue={q} aria-label="Search orders" placeholder="Search orders or locations…" /></form>
            <details className="corporate-work-sort"><summary>Sort: {sort === "oldest" ? "Oldest first" : "Newest first"}<ChevronDown size={17} aria-hidden="true" /></summary><div><Link href={sortHref("newest")} aria-current={sort === "newest" ? "true" : undefined}>Newest first</Link><Link href={sortHref("oldest")} aria-current={sort === "oldest" ? "true" : undefined}>Oldest first</Link></div></details>
          </div>
        </div>
      </> : null}
    </section>
    {!orderRecords ? <ErrorState title="Orders could not be loaded" description="The corporate order projection is unavailable. No supplier outcome is inferred." retryHref="/corporate/orders" /> : <CorporatePanel title="Order coordination queue" description="Portal requests appear here, but supplier, payment, fulfillment, and cancellation facts remain unconfirmed until their sources are configured."><CorporateWorkRecords records={orderRecords} caption="Corporate order coordination" /></CorporatePanel>}
  </div>;
}
