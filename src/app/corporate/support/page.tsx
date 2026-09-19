import Link from "next/link";
import { redirect } from "next/navigation";
import { CorporatePageHeader, CorporatePanel, EmptyState, ErrorState, FilterBar, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateSupportRepository } from "@/src/features/corporate/support/server";
import { listCorporateSupport } from "@/src/features/corporate/support/service";

export default async function CorporateSupportPage({ searchParams }: { searchParams: Promise<{ caseId?: string | string[]; unitId?: string | string[]; q?: string | string[]; status?: string | string[] }> }) {
  const query = await searchParams;
  if (typeof query.caseId === "string" && typeof query.unitId === "string") redirect(`/corporate/support/${encodeURIComponent(query.caseId)}?unitId=${encodeURIComponent(query.unitId)}`);
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_SUPPORT")) return <ErrorState title="Support is not available" description="Your current corporate scope does not include support records." retryHref="/corporate" />;
  const loadedTickets = await listCorporateSupport(session, getCorporateSupportRepository()).catch(() => null);
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const status = typeof query.status === "string" ? query.status : "open";
  const tickets = loadedTickets?.filter((ticket) => (status === "all" || status === "resolved" && ticket.status === "Resolved" || status === "waiting" && ticket.status === "Waiting" || status === "open" && ticket.status !== "Resolved") && (!q || `${ticket.id} ${ticket.subject}`.toLowerCase().includes(q))) ?? null;
  return <div className="corporate-main-stack">
    <CorporatePageHeader eyebrow="Operations support" title="Support cases" description="Triage operator issues, keep ownership visible, and separate public replies from internal notes." />
    {!tickets ? <ErrorState title="Support cases could not be loaded" description="The support record source is temporarily unavailable. No cases were changed." retryHref="/corporate/support" /> : <CorporatePanel title="Case queue" eyebrow="Authorized records" description="Oldest unresolved operator needs should be reviewed first.">
      <FilterBar resultCount={tickets.length}><label className="corporate-field"><span>Search cases</span><input type="search" name="q" defaultValue={q} placeholder="Reference or subject" /></label><label className="corporate-field"><span>Status</span><select name="status" defaultValue={status}><option value="open">Open work</option><option value="all">All statuses</option><option value="waiting">Waiting</option><option value="resolved">Resolved</option></select></label></FilterBar>
      {tickets.length === 0 ? <EmptyState title="No support cases in this scope" description="New operator cases will appear here after they are committed." /> : <div className="corporate-table-region" role="region" aria-label="Support case queue" tabIndex={0}><table className="corporate-table"><caption className="sr-only">Support cases in permitted locations</caption><thead><tr><th scope="col">Case</th><th scope="col">Location</th><th scope="col">Topic</th><th scope="col">State</th><th scope="col">Owner</th><th scope="col">Updated</th></tr></thead><tbody>{tickets.map((ticket) => <tr key={`${ticket.locationId}-${ticket.id}`}><th scope="row"><Link href={`/corporate/support/${encodeURIComponent(ticket.id)}?unitId=${encodeURIComponent(ticket.locationId)}`}><small>{ticket.id}</small><strong>{ticket.subject}</strong></Link></th><td>{ticket.locationName}</td><td>{ticket.topic}</td><td><StatusBadge tone={ticket.status === "Resolved" ? "success" : ticket.status === "Waiting" ? "waiting" : "attention"}>{ticket.status}</StatusBadge></td><td>{ticket.assignedToUserId || "Unassigned"}</td><td className="corporate-tabular"><time dateTime={ticket.updatedAt}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(ticket.updatedAt))}</time></td></tr>)}</tbody></table></div>}
    </CorporatePanel>}
  </div>;
}
