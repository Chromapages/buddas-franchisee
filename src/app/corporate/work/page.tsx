import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, Clock3, ListFilter, Pause, Plus, Search, UserRound } from "lucide-react";
import { CorporatePageHeader, ErrorState, FilterBar } from "@/src/components/corporate/corporate-ui";
import { AuthorizedWorkQueue } from "@/src/components/corporate/authorized-work-queue";
import { CorporateDashboardFreshness } from "@/src/components/corporate/corporate-dashboard-freshness";
import { CorporateMastheadScope } from "@/src/components/corporate/corporate-masthead-scope";
import { loadCorporateWork } from "@/src/components/corporate/corporate-data";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";
import { needsCorporateAttention } from "@/src/features/corporate/work-signals";
import "../corporate-masthead.css";
import "./work-masthead.css";
import "./authorized-queue.css";

export default async function CorporateWorkPage({ searchParams }: { searchParams: Promise<{ view?: string | string[]; q?: string | string[]; type?: string | string[]; locationId?: string | string[]; sort?: string | string[]; record?: string | string[]; detail?: string | string[] }> }) {
  const session = await requireCorporateSession();
  const query = await searchParams;
  const view = typeof query.view === "string" ? query.view : "open";
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const type = typeof query.type === "string" ? query.type : "all";
  const locationId = typeof query.locationId === "string" ? query.locationId : "";
  const sort = query.sort === "newest" || query.sort === "updated" ? query.sort : "oldest";
  const selectedRecord = typeof query.record === "string" ? query.record : "";
  const detail = typeof query.detail === "string" ? query.detail : "overview";
  const canBrowseLocations = hasCorporatePermission(session, "VIEW_DIRECTORY");
  const [records, locations] = await Promise.all([
    loadCorporateWork(session).catch(() => null),
    canBrowseLocations ? getCorporateStorage().getLocations(session).catch(() => null) : Promise.resolve([]),
  ]);
  if (locationId && !canBrowseLocations) notFound();
  if (locationId && !locations) return <ErrorState title="Location context is unavailable" description="Authorized locations could not be loaded. No portfolio-wide figures are shown for the selected location." retryHref="/corporate/work" />;
  const selected = locationId ? locations?.find((location) => location.id === locationId) : null;
  if (locationId && !selected) notFound();
  if (!records) return <div className="corporate-main-stack"><CorporatePageHeader eyebrow="Shared operations" title="Work queue" description="Triage work across permitted locations." /><ErrorState title="Work queue could not be loaded" description="Authorized record sources are unavailable. Existing filters are safe to retry." retryHref="/corporate/work" /></div>;

  const now = new Date();
  const scoped = records.filter((record) => !locationId || record.locationId === locationId);
  const open = scoped.filter((record) => !record.isClosed);
  const needsOwner = open.filter((record) => !record.assignedToUserId);
  const followUps = open.filter((record) => Boolean(record.followUpAt && Date.parse(record.followUpAt) <= now.getTime()));
  const waiting = open.filter((record) => Boolean(record.waitingReason));
  const shown = scoped.filter((record) =>
    (view === "mine" ? !record.isClosed && record.assignedToUserId === session.userId
      : view === "unassigned" ? !record.isClosed && !record.assignedToUserId
        : view === "waiting" ? !record.isClosed && Boolean(record.waitingReason)
          : view === "due" ? !record.isClosed && followUps.includes(record)
            : view === "attention" ? needsCorporateAttention(record, session.userId, now.getTime())
              : view === "closed" ? record.isClosed : !record.isClosed)
    && (type === "all" || record.type === type)
    && (!q || `${record.reference} ${record.subject} ${record.locationName || ""}`.toLowerCase().includes(q)));
  const viewHref = (nextView: string) => {
    const params = new URLSearchParams();
    if (nextView !== "open") params.set("view", nextView);
    if (locationId) params.set("locationId", locationId);
    const suffix = params.toString();
    return suffix ? `/corporate/work?${suffix}` : "/corporate/work";
  };
  const sortHref = (nextSort: string) => {
    const params = new URLSearchParams();
    if (view !== "open") params.set("view", view);
    if (q) params.set("q", q);
    if (type !== "all") params.set("type", type);
    if (locationId) params.set("locationId", locationId);
    if (nextSort !== "oldest") params.set("sort", nextSort);
    if (selectedRecord) params.set("record", selectedRecord);
    if (detail !== "overview") params.set("detail", detail);
    const suffix = params.toString();
    return suffix ? `/corporate/work?${suffix}` : "/corporate/work";
  };
  const tabs = [
    { view: "open", label: "All work", count: open.length },
    { view: "unassigned", label: "Needs owner", count: needsOwner.length },
    { view: "due", label: "Follow-ups", count: followUps.length },
    { view: "waiting", label: "Waiting", count: waiting.length },
  ];

  return <div className="corporate-main-stack corporate-work-page">
    <section className="corporate-work-masthead" aria-labelledby="corporate-work-title">
      <div className="corporate-work-masthead-top">
        <div className="corporate-work-masthead-intro">
          <p>Shared operations</p>
          <h1 id="corporate-work-title">Work queue</h1>
          <span>{selected ? `Triage priority work at ${selected.name}. Assign ownership, follow up, and move blocked items forward.` : "Triage priority work across all locations. Assign ownership, follow up, and move blocked items forward."}</span>
        </div>
        <div className="corporate-work-masthead-tools">
          <CorporateDashboardFreshness updatedAt={now.toISOString()} timeZone="America/Denver" showRefreshIcon />
          {canBrowseLocations && locations ? <CorporateMastheadScope locations={locations.map((location) => ({ id: location.id, name: location.name, code: location.code }))} selected={selected ? { id: selected.id, name: selected.name, code: selected.code } : null} baseHref="/corporate/work" /> : <span className="corporate-work-scope-static">Permitted locations</span>}
        </div>
      </div>

      <div className="corporate-work-masthead-body">
        <Link href={viewHref("unassigned")} className="corporate-work-signal is-owner">
          <span className="corporate-work-signal-icon"><UserRound size={28} aria-hidden="true" /></span>
          <span className="corporate-work-signal-copy"><strong>{needsOwner.length}</strong><b>Need an owner</b><small>{needsOwner.length ? "Assign to keep things moving" : "All open work has an owner"}</small></span>
          <ArrowRight size={22} aria-hidden="true" />
        </Link>
        <Link href={viewHref("due")} className="corporate-work-signal is-due">
          <span className="corporate-work-signal-icon"><Clock3 size={28} aria-hidden="true" /></span>
          <span className="corporate-work-signal-copy"><strong>{followUps.length}</strong><b>Follow-ups due</b><small>{followUps.length ? "Ready for follow-up" : "Nothing due right now"}</small></span>
          <ArrowRight size={22} aria-hidden="true" />
        </Link>
        <Link href={viewHref("waiting")} className="corporate-work-signal is-waiting">
          <span className="corporate-work-signal-icon"><Pause size={28} aria-hidden="true" /></span>
          <span className="corporate-work-signal-copy"><strong>{waiting.length}</strong><b>Waiting on others</b><small>{waiting.length ? "Blocked on external action" : "No blocked items"}</small></span>
          <ArrowRight size={22} aria-hidden="true" />
        </Link>
        <aside className="corporate-work-quick-actions" aria-label="Quick actions">
          <h2>Quick actions</h2>
          <Link href={viewHref("unassigned")} className="corporate-work-action is-primary"><Plus size={21} aria-hidden="true" />Assign work</Link>
          <details className="corporate-work-filter-details">
            <summary className="corporate-work-action"><ListFilter size={21} aria-hidden="true" />Filter queue</summary>
            <div className="corporate-work-filter-popover">
              <FilterBar resultCount={shown.length}>
                {locationId ? <input type="hidden" name="locationId" value={locationId} /> : null}
                {q ? <input type="hidden" name="q" value={q} /> : null}
                {sort !== "oldest" ? <input type="hidden" name="sort" value={sort} /> : null}
                <label className="corporate-field"><span>View</span><select name="view" defaultValue={view}><option value="open">All open</option><option value="attention">Needs attention</option><option value="mine">Mine</option><option value="unassigned">Unassigned</option><option value="due">Follow-ups due</option><option value="waiting">Waiting</option><option value="closed">Closed</option></select></label>
                <label className="corporate-field"><span>Type</span><select name="type" defaultValue={type}><option value="all">All work</option><option value="support">Support</option><option value="request">Requests</option><option value="order">Orders</option><option value="access">Access</option></select></label>
              </FilterBar>
            </div>
          </details>
        </aside>
      </div>

      <div className="corporate-work-masthead-bottom">
        <nav className="corporate-work-tabs" aria-label="Work queue views">{tabs.map((tab) => <Link key={tab.view} href={viewHref(tab.view)} aria-current={view === tab.view ? "page" : undefined}>{tab.label}<span>{tab.count}</span></Link>)}</nav>
        <div className="corporate-work-toolbar">
          <form className="corporate-work-search" method="get" role="search">
            {view !== "open" ? <input type="hidden" name="view" value={view} /> : null}
            {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
            {locationId ? <input type="hidden" name="locationId" value={locationId} /> : null}
            {sort !== "oldest" ? <input type="hidden" name="sort" value={sort} /> : null}
            <button type="submit" aria-label="Search work queue"><Search size={21} aria-hidden="true" /></button>
            <input type="search" name="q" defaultValue={q} aria-label="Search work queue" placeholder="Search orders, support cases, or locations…" />
          </form>
          <details className="corporate-work-sort"><summary>Sort: {sort === "newest" ? "Newest first" : sort === "updated" ? "Recently updated" : "Oldest first"}<ChevronDown size={17} aria-hidden="true" /></summary><div><Link href={sortHref("oldest")} scroll={false} aria-current={sort === "oldest" ? "true" : undefined}>Oldest first</Link><Link href={sortHref("newest")} scroll={false} aria-current={sort === "newest" ? "true" : undefined}>Newest first</Link><Link href={sortHref("updated")} scroll={false} aria-current={sort === "updated" ? "true" : undefined}>Recently updated</Link></div></details>
        </div>
      </div>
    </section>

    <AuthorizedWorkQueue records={shown} state={{ view, q, type, locationId, sort, record: selectedRecord, detail }} canBrowseLocations={canBrowseLocations} />
  </div>;
}
