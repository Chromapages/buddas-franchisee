import { CorporatePageHeader, CorporatePanel, ErrorState, FilterBar, PermissionState } from "@/src/components/corporate/corporate-ui";
import { CorporateWorkRecords } from "@/src/components/corporate/work-records";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { corporateOrdersAsWork, listCorporateOrders } from "@/src/features/corporate/operations-data";

export default async function CorporateOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; state?: string | string[] }> }) {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_ORDERS")) return <PermissionState description="Your current corporate access does not include supply coordination." />;
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const state = typeof query.state === "string" ? query.state : "all";
  const loaded = await listCorporateOrders(session).then(corporateOrdersAsWork).catch(() => null);
  const orderRecords = loaded?.filter((record) => (!q || `${record.reference} ${record.locationName || ""}`.toLowerCase().includes(q)) && (state === "all" || state === "attention" && record.priority !== "NORMAL" || state === "waiting" && Boolean(record.waitingReason) || state === "closed" && record.isClosed)) ?? null;
  return <div className="corporate-main-stack"><CorporatePageHeader eyebrow="Supply coordination" title="Orders" description="Track acknowledgment, fulfillment, cancellation, and recovery as separate recorded facts." />{!orderRecords ? <ErrorState title="Orders could not be loaded" description="The corporate order projection is unavailable. No supplier outcome is inferred." retryHref="/corporate/orders" /> : <CorporatePanel title="Order coordination queue" description="Portal requests appear here, but supplier, payment, fulfillment, and cancellation facts remain unconfirmed until their sources are configured."><FilterBar resultCount={orderRecords.length}><label className="corporate-field"><span>Search</span><input type="search" name="q" defaultValue={q} placeholder="Order reference or unit" /></label><label className="corporate-field"><span>Coordination state</span><select name="state" defaultValue={state}><option value="all">All coordination</option><option value="attention">Needs attention</option><option value="waiting">Waiting on source</option><option value="closed">Closed</option></select></label></FilterBar><CorporateWorkRecords records={orderRecords} caption="Corporate order coordination" /></CorporatePanel>}</div>;
}
