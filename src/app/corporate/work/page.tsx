import { CorporatePageHeader, CorporatePanel, ErrorState, FilterBar } from "@/src/components/corporate/corporate-ui";
import { loadCorporateWork } from "@/src/components/corporate/corporate-data";
import { CorporateWorkRecords } from "@/src/components/corporate/work-records";
import { requireCorporateSession } from "@/src/features/corporate/session";

export default async function CorporateWorkPage({ searchParams }: { searchParams: Promise<{ view?: string | string[]; q?: string | string[]; type?: string | string[] }> }) {
  const session = await requireCorporateSession();
  const query = await searchParams;
  const view = typeof query.view === "string" ? query.view : "open";
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const type = typeof query.type === "string" ? query.type : "all";
  const records = await loadCorporateWork(session).catch(() => null);
  const shown = records?.filter((record) => (view === "mine" ? !record.isClosed && record.assignedToUserId === session.userId : view === "unassigned" ? !record.isClosed && !record.assignedToUserId : view === "waiting" ? !record.isClosed && Boolean(record.waitingReason) : view === "due" ? !record.isClosed && Boolean(record.followUpAt && Date.parse(record.followUpAt) <= Date.now()) : view === "closed" ? record.isClosed : !record.isClosed) && (type === "all" || record.type === type) && (!q || `${record.reference} ${record.subject} ${record.locationName || ""}`.toLowerCase().includes(q))) || [];
  return <div className="corporate-main-stack"><CorporatePageHeader eyebrow="Shared operations" title="Work queue" description="Triage work across permitted modules. Open the owning record to make domain decisions." />{!records ? <ErrorState title="Work queue could not be loaded" description="Authorized record sources are unavailable. Existing filters are safe to retry." retryHref="/corporate/work" /> : <CorporatePanel title="Authorized queue" description="No hidden priority score; records use recorded action, dates, and ownership."><FilterBar resultCount={shown.length}><label className="corporate-field"><span>Search</span><input type="search" name="q" defaultValue={q} placeholder="Reference or summary" /></label><label className="corporate-field"><span>View</span><select name="view" defaultValue={view}><option value="open">All open</option><option value="mine">Mine</option><option value="unassigned">Unassigned</option><option value="due">Follow-ups due</option><option value="waiting">Waiting</option><option value="closed">Closed</option></select></label><label className="corporate-field"><span>Type</span><select name="type" defaultValue={type}><option value="all">All work</option><option value="support">Support</option><option value="request">Requests</option><option value="order">Orders</option><option value="access">Access</option></select></label></FilterBar><CorporateWorkRecords records={shown} caption="Corporate shared work queue" /></CorporatePanel>}</div>;
}
