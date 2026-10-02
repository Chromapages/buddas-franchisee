import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, CircleAlert, CircleHelp, Clock3 } from "lucide-react";
import { CorporatePanel, EmptyState, ErrorState } from "@/src/components/corporate/corporate-ui";
import { CorporateDashboardFreshness } from "@/src/components/corporate/corporate-dashboard-freshness";
import { CorporateMastheadScope } from "@/src/components/corporate/corporate-masthead-scope";
import { loadCorporateWork } from "@/src/components/corporate/corporate-data";
import { CorporateNextActions } from "@/src/components/corporate/corporate-next-actions";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { getCorporateEnvironmentNotice } from "@/src/features/corporate/environment";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";
import { needsCorporateAttention } from "@/src/features/corporate/work-signals";
import "./corporate-masthead.css";
import "./corporate-next-actions.css";

const corporateTimeZone = "America/Denver";
const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2 } as const;

const corporateGreeting = (date: Date) => {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: corporateTimeZone }).format(date));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

const corporateDay = (date: Date) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: corporateTimeZone }).format(date);

export default async function CorporateHomePage({ searchParams }: { searchParams: Promise<{ locationId?: string | string[] }> }) {
  const session = await requireCorporateSession();
  const query = await searchParams;
  const locationId = typeof query.locationId === "string" ? query.locationId : null;
  const canBrowseLocations = hasCorporatePermission(session, "VIEW_DIRECTORY");
  const [records, locations] = await Promise.all([
    loadCorporateWork(session).catch(() => null),
    canBrowseLocations ? getCorporateStorage().getLocations(session).catch(() => null) : Promise.resolve([]),
  ]);
  if (locationId && !canBrowseLocations) notFound();
  if (locationId && !locations) return <ErrorState title="Location context is unavailable" description="Authorized locations could not be loaded. No portfolio-wide figures are shown for the selected location." retryHref="/corporate" />;
  const selected = locationId ? locations?.find((location) => location.id === locationId) : null;
  if (locationId && !selected) notFound();

  const firstName = session.displayName.trim().split(/\s+/)[0] || "there";
  const scoped = records?.filter((record) => !selected || record.locationId === selected.id) || null;
  const open = scoped?.filter((record) => !record.isClosed) || [];
  const now = new Date();
  const today = corporateDay(now);
  const needsAttention = open.filter((record) => needsCorporateAttention(record, session.userId, now.getTime()));
  const actionRecords = [...needsAttention].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || Date.parse(a.createdAt) - Date.parse(b.createdAt)).slice(0, 8);
  const waiting = open.filter((record) => Boolean(record.waitingReason));
  const dueToday = open.filter((record) => record.followUpAt && Number.isFinite(Date.parse(record.followUpAt)) && corporateDay(new Date(record.followUpAt)) === today);
  const dueLocationCount = new Set(dueToday.map((record) => record.locationId).filter(Boolean)).size;
  const regionCount = new Set(locations?.map((location) => location.regionId).filter(Boolean)).size;
  const workQueueHref = selected ? `/corporate/work?locationId=${encodeURIComponent(selected.id)}` : "/corporate/work";
  const attentionQueueHref = selected ? `/corporate/work?view=attention&locationId=${encodeURIComponent(selected.id)}` : "/corporate/work?view=attention";
  const subject = selected ? `at ${selected.name}` : "across your permitted locations";
  const attentionText = needsAttention.length === 1 ? "1 item needs attention" : `${needsAttention.length} items need attention`;
  const summary = scoped ? needsAttention.length ? `${attentionText} ${subject}.` : `No items need attention ${subject}.` : "Work signals are unavailable right now.";

  return <div className="corporate-dashboard">
    <section className="corporate-masthead" aria-labelledby="corporate-masthead-title">
      <div className="corporate-masthead-intro">
        <p className="corporate-masthead-eyebrow">Corporate command center</p>
        <h1 id="corporate-masthead-title">{corporateGreeting(now)}, {firstName}.</h1>
        <p className="corporate-masthead-summary">{summary}</p>
        <div className="corporate-masthead-context">
          {canBrowseLocations && locations ? <CorporateMastheadScope locations={locations.map((location) => ({ id: location.id, name: location.name, code: location.code }))} selected={selected ? { id: selected.id, name: selected.name, code: selected.code } : null} /> : <div className="corporate-masthead-scope-static"><span>{selected ? "Location" : "Portfolio"}</span><strong>{selected?.name || "Permitted work"}</strong></div>}
          <div className="corporate-masthead-context-detail">{selected ? <><strong>{selected.code}</strong><small>Store ID</small></> : locations && canBrowseLocations ? <><strong>{locations.length} location{locations.length === 1 ? "" : "s"}</strong><small>{regionCount ? `Across ${regionCount} region${regionCount === 1 ? "" : "s"}` : "Authorized portfolio"}</small></> : <><strong>Authorized scope</strong><small>Corporate workspace</small></>}</div>
        </div>
      </div>

      <div className="corporate-masthead-signals" role="group" aria-label="Work signals">
        {!scoped ? <div className="corporate-masthead-clear"><CircleHelp size={30} aria-hidden="true" /><strong>Signals unavailable</strong><span>Open the work queue to retry.</span></div> : needsAttention.length === 0 && waiting.length === 0 && dueToday.length === 0 ? <div className="corporate-masthead-clear"><CheckCircle2 size={36} aria-hidden="true" /><strong>No items need attention</strong><span>You’re all caught up.</span></div> : selected ? <div className="corporate-masthead-signal corporate-masthead-signal-focused"><span className="corporate-masthead-signal-icon is-attention"><CircleAlert size={27} aria-hidden="true" /></span><div><strong>{needsAttention.length}</strong><span>Need attention</span><small>At this location</small></div></div> : <>
          <div className="corporate-masthead-signal"><span className="corporate-masthead-signal-icon is-attention"><CircleAlert size={27} aria-hidden="true" /></span><div><strong>{needsAttention.length}</strong><span>Need attention</span><small>Require review or an owner</small></div></div>
          <div className="corporate-masthead-signal"><span className="corporate-masthead-signal-icon is-waiting"><Clock3 size={27} aria-hidden="true" /></span><div><strong>{waiting.length}</strong><span>Waiting on teams</span><small>In progress or awaiting response</small></div></div>
          <div className="corporate-masthead-signal"><span className="corporate-masthead-signal-icon is-due"><CalendarDays size={27} aria-hidden="true" /></span><div><strong>{dueToday.length}</strong><span>Due today</span><small>{dueLocationCount ? `Across ${dueLocationCount} location${dueLocationCount === 1 ? "" : "s"}` : dueToday.length ? "Follow-ups in this scope" : "No scheduled follow-ups"}</small></div></div>
        </>}
      </div>

      <div className="corporate-masthead-actions">
        {scoped ? <CorporateDashboardFreshness updatedAt={now.toISOString()} timeZone={corporateTimeZone} /> : <span className="corporate-masthead-status">Status unavailable</span>}
        <Link className={needsAttention.length ? "corporate-masthead-queue is-primary" : "corporate-masthead-queue"} href={needsAttention.length ? attentionQueueHref : workQueueHref}>{needsAttention.length ? selected ? "Open location queue" : "Open work queue" : "View work queue"}{needsAttention.length ? <span>· {needsAttention.length}</span> : null}<ArrowRight size={20} aria-hidden="true" /></Link>
      </div>
    </section>

    {getCorporateEnvironmentNotice() ? <div className="corporate-environment-notice" role="status">{getCorporateEnvironmentNotice()}</div> : null}
    {!scoped ? <ErrorState title="Work could not be loaded" description="The authorized work sources are temporarily unavailable. Counts are unavailable rather than shown as zero." retryHref="/corporate" /> : <div className="corporate-dashboard-layout">
      <CorporateNextActions records={actionRecords} totalCount={needsAttention.length} href={needsAttention.length ? attentionQueueHref : workQueueHref} scopeName={subject} />
      <aside className="corporate-dashboard-rail" aria-label="Corporate work context"><section className="corporate-dashboard-context"><header><CircleHelp aria-hidden="true" /><div><p>Work context</p><h2>Stay ahead of bottlenecks</h2></div></header><dl><div><dt>Open records</dt><dd>{open.length}</dd></div><div><dt>Needs ownership</dt><dd>{open.filter((record) => !record.assignedToUserId).length}</dd></div><div><dt>Dependencies</dt><dd>{waiting.length}</dd></div></dl></section><CorporatePanel className="corporate-dashboard-panel corporate-dashboard-waiting" title="Blocked or waiting" eyebrow="Dependencies" description="Every waiting item keeps an owner and next step.">{waiting.length ? <ul className="corporate-waiting-list">{waiting.slice(0, 6).map((record) => <li key={record.id}><Link href={record.href}><strong>{record.reference}</strong><span>{record.waitingReason}</span><small>{record.assignedToName || record.teamId}</small></Link></li>)}</ul> : <EmptyState title="No recorded dependencies" description="Waiting work will appear here with its reason and owner." />}</CorporatePanel></aside>
    </div>}
  </div>;
}
