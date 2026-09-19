import Link from "next/link";
import { ArrowRight, CircleHelp, ClipboardList, Clock3, UserRoundX } from "lucide-react";
import { CorporatePanel, EmptyState, ErrorState } from "@/src/components/corporate/corporate-ui";
import { CorporateDashboardFreshness } from "@/src/components/corporate/corporate-dashboard-freshness";
import { loadCorporateWork } from "@/src/components/corporate/corporate-data";
import { CorporateWorkRecords } from "@/src/components/corporate/work-records";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateEnvironmentNotice } from "@/src/features/corporate/environment";

const corporateTimeZone = "America/Denver";

const corporateGreeting = (date: Date) => {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: corporateTimeZone }).format(date));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

export default async function CorporateHomePage() {
  const session = await requireCorporateSession();
  const firstName = session.displayName.trim().split(/\s+/)[0] || "there";
  const records = await loadCorporateWork(session).catch(() => null);
  const open = records?.filter((record) => !record.isClosed) || [];
  const mine = open.filter((record) => record.assignedToUserId === session.userId);
  const unassigned = open.filter((record) => !record.assignedToUserId);
  const waiting = open.filter((record) => Boolean(record.waitingReason));
  const due = open.filter((record) => record.followUpAt && Date.parse(record.followUpAt) <= Date.now());
  return <div className="corporate-dashboard">
    <header className="corporate-dashboard-header"><div><p>Corporate command center</p><h1>{corporateGreeting(new Date())}, {firstName}.</h1><span>My work highlights records that need a clear owner or next action.</span></div><div className="corporate-dashboard-actions"><CorporateDashboardFreshness updatedAt={new Date().toISOString()} timeZone={corporateTimeZone} /><Link className="corporate-button-secondary" href="/corporate/work">Open work queue <ArrowRight size={16} aria-hidden="true" /></Link></div></header>
    {getCorporateEnvironmentNotice() ? <div className="corporate-environment-notice" role="status">{getCorporateEnvironmentNotice()}</div> : null}
    {!records ? <ErrorState title="Work could not be loaded" description="The authorized work sources are temporarily unavailable. Counts are unavailable rather than shown as zero." retryHref="/corporate" /> : <>
      <section className="corporate-dashboard-metrics" aria-label="Actionable work summary"><Link href="/corporate/work?view=mine"><span><ClipboardList aria-hidden="true" /></span><div><small>Assigned to me</small><strong>{mine.length}</strong><p>Open records in your queue</p></div></Link><Link href="/corporate/work?view=unassigned"><span><UserRoundX aria-hidden="true" /></span><div><small>Unassigned</small><strong>{unassigned.length}</strong><p>{unassigned.length ? "Needs an owner" : "Every record has an owner"}</p></div></Link><Link href="/corporate/work?view=due"><span><Clock3 aria-hidden="true" /></span><div><small>Follow-ups due</small><strong>{due.length}</strong><p>{due.length ? "Review records due today" : "No follow-ups due"}</p></div></Link><Link href="/corporate/work?view=waiting"><span><CircleHelp aria-hidden="true" /></span><div><small>Waiting</small><strong>{waiting.length}</strong><p>{waiting.length ? "Owned dependencies" : "No blocked records"}</p></div></Link></section>
      <div className="corporate-dashboard-layout"><CorporatePanel className="corporate-dashboard-panel" title="Next actions" action={<Link className="corporate-text-link" href="/corporate/work">View all</Link>}>{open.length ? <CorporateWorkRecords records={open.slice(0, 8)} caption="My next corporate actions" variant="dashboard" /> : <EmptyState title="No open work in this scope" description="New records will appear here after the source commits them." />}</CorporatePanel><aside className="corporate-dashboard-rail" aria-label="Corporate work context"><section className="corporate-dashboard-context"><header><CircleHelp aria-hidden="true" /><div><p>Work context</p><h2>Stay ahead of bottlenecks</h2></div></header><dl><div><dt>Open records</dt><dd>{open.length}</dd></div><div><dt>Needs ownership</dt><dd>{unassigned.length}</dd></div><div><dt>Dependencies</dt><dd>{waiting.length}</dd></div></dl></section><CorporatePanel className="corporate-dashboard-panel corporate-dashboard-waiting" title="Blocked or waiting" eyebrow="Dependencies" description="Every waiting item keeps an owner and next step.">{waiting.length ? <ul className="corporate-waiting-list">{waiting.slice(0, 6).map((record) => <li key={record.id}><Link href={record.href}><strong>{record.reference}</strong><span>{record.waitingReason}</span><small>{record.assignedToName || record.teamId}</small></Link></li>)}</ul> : <EmptyState title="No recorded dependencies" description="Waiting work will appear here with its reason and owner." />}</CorporatePanel></aside></div>
    </>}
  </div>;
}
