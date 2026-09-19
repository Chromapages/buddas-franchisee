import { CorporatePageHeader, CorporatePanel, ErrorState, FilterBar, PermissionState } from "@/src/components/corporate/corporate-ui";
import { CorporateWorkRecords } from "@/src/components/corporate/work-records";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { corporateRequestsAsWork, listCorporateRequests } from "@/src/features/corporate/operations-data";

export default async function CorporateRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; state?: string | string[] }> }) {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_REQUESTS")) return <PermissionState description="Your current corporate access does not include request reviews." />;
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const state = typeof query.state === "string" ? query.state : "all";
  const loaded = await listCorporateRequests(session).then(corporateRequestsAsWork).catch(() => null);
  const requestRecords = loaded?.filter((record) => (!q || `${record.reference} ${record.subject} ${record.organizationId || ""} ${record.locationName || ""}`.toLowerCase().includes(q)) && (state === "all" || state === "open" && !record.isClosed || state === "decision" && record.state.includes("decision_pending") || state === "closed" && record.isClosed)) ?? null;
  return <div className="corporate-main-stack"><CorporatePageHeader eyebrow="Franchise development" title="Requests" description="Review typed operator requests, evidence, decision state, and the next accountable handoff." />{!requestRecords ? <ErrorState title="Requests could not be loaded" description="The request source is unavailable. No decisions were changed." retryHref="/corporate/requests" /> : <CorporatePanel title="Request review queue" description="Formal decisions belong on each request detail after the submitted version is reviewed."><FilterBar resultCount={requestRecords.length}><label className="corporate-field"><span>Search</span><input type="search" name="q" defaultValue={q} placeholder="Reference, entity, or market" /></label><label className="corporate-field"><span>Decision state</span><select name="state" defaultValue={state}><option value="all">All states</option><option value="open">Open work</option><option value="decision">Decision needed</option><option value="closed">Closed</option></select></label></FilterBar><CorporateWorkRecords records={requestRecords} caption="Corporate requests" /></CorporatePanel>}</div>;
}
