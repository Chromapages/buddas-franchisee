import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { SupportActionForm } from "@/src/components/corporate/support-action-form";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, DefinitionList, ErrorState, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateSupportRepository } from "@/src/features/corporate/support/server";
import { getCorporateSupportDetail } from "@/src/features/corporate/support/service";

export default async function CorporateSupportDetailPage({ params, searchParams }: { params: Promise<{ caseId: string }>; searchParams: Promise<{ unitId?: string | string[] }> }) {
  const session = await requireCorporateSession();
  const [{ caseId }, query] = await Promise.all([params, searchParams]);
  const unitId = typeof query.unitId === "string" ? query.unitId : "";
  if (!unitId) notFound();
  const detail = await getCorporateSupportDetail(session, getCorporateSupportRepository(), unitId, caseId).catch((error: unknown) => error instanceof Error ? error : new Error("Support case could not be loaded."));
  if (detail instanceof Error) return <ErrorState title="Support case could not be loaded" description={detail.message} retryHref="/corporate/support" />;
  if (!detail) notFound();
  const { ticket, notes, events, locationName, scope } = detail;
  const version = ticket.version ?? 0;
  const canManage = hasCorporatePermission(session, "MANAGE_SUPPORT", scope);
  const canNote = hasCorporatePermission(session, "WRITE_INTERNAL_NOTES", scope);
  const canAssign = hasCorporatePermission(session, "ASSIGN_SUPPORT", scope);
  return <div className="corporate-main-stack">
    <CorporateBreadcrumbs items={[{ label: "Support", href: "/corporate/support" }, { label: ticket.id }]} />
    <CorporatePageHeader eyebrow={`Support case · ${ticket.id}`} title={ticket.subject} description={`${locationName} · ${ticket.topic}`} actions={<StatusBadge tone={ticket.status === "Resolved" ? "success" : ticket.status === "Waiting" ? "waiting" : "attention"}>{ticket.status}</StatusBadge>} />
    <div className="corporate-detail-grid">
      <div className="corporate-main-stack">
        <CorporatePanel title="Issue" eyebrow="Operator submission"><div className="corporate-detail-body"><p className="corporate-support-details">{ticket.details}</p><DefinitionList items={[{ label: "Submitted by", value: ticket.userEmail }, { label: "Created", value: <time dateTime={ticket.createdAt}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(ticket.createdAt))}</time> }, { label: "Record version", value: version }]} /></div></CorporatePanel>
        <CorporatePanel title="Public conversation" eyebrow="Visible to operator"><div className="corporate-timeline">{(ticket.messages || []).length ? ticket.messages!.map((message) => <article key={message.id}><header><strong>{message.authorName || message.authorEmail}</strong><span>{message.authorRole}</span><time dateTime={message.createdAt}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.createdAt))}</time></header><p>{message.message}</p></article>) : <p className="corporate-timeline-empty">No public replies yet.</p>}</div>{canManage && ticket.status !== "Resolved" ? <div className="corporate-detail-body"><SupportActionForm commandId={randomUUID()} unitId={unitId} caseId={caseId} expectedVersion={version} kind="REPLY" label="Send reply" audience="Operator and authorized corporate staff" /></div> : null}</CorporatePanel>
        {canNote ? <CorporatePanel title="Internal notes" eyebrow="Corporate only"><div className="corporate-timeline corporate-timeline-private">{notes.length ? notes.map((note) => <article key={note.id}><header><strong>{note.authorName}</strong><time dateTime={note.createdAt}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(note.createdAt))}</time></header><p>{note.message}</p></article>) : <p className="corporate-timeline-empty">No internal notes.</p>}</div><div className="corporate-detail-body"><SupportActionForm commandId={randomUUID()} unitId={unitId} caseId={caseId} expectedVersion={version} kind="NOTE" label="Add internal note" audience="Authorized corporate staff only" /></div></CorporatePanel> : null}
      </div>
      <aside className="corporate-main-stack" aria-label="Case ownership and actions">
        <CorporatePanel title="Ownership" eyebrow="Accountability"><div className="corporate-detail-body"><DefinitionList items={[{ label: "Location", value: locationName }, { label: "Owner", value: ticket.assignedToUserId || "Unassigned" }, { label: "Operator action", value: ticket.operatorActionRequired ? "Required" : "Not required" }]} />{canAssign ? <SupportActionForm commandId={randomUUID()} unitId={unitId} caseId={caseId} expectedVersion={version} kind="ASSIGN" label={ticket.assignedToUserId === session.userId ? "Keep assigned to me" : "Assign to me"} assigneeId={session.userId} /> : null}</div></CorporatePanel>
        {canManage ? <CorporatePanel title="Next state" eyebrow="Case handling"><div className="corporate-detail-body corporate-action-stack">{ticket.status === "Resolved" ? <SupportActionForm commandId={randomUUID()} unitId={unitId} caseId={caseId} expectedVersion={version} kind="REOPEN" label="Reopen case" audience="Reopen reason, visible to operator" /> : <><SupportActionForm commandId={randomUUID()} unitId={unitId} caseId={caseId} expectedVersion={version} kind="WAIT" label="Request operator information" audience="Question for operator" /><SupportActionForm commandId={randomUUID()} unitId={unitId} caseId={caseId} expectedVersion={version} kind="RESOLVE" label="Resolve case" audience="Resolution summary, visible to operator" /></>}</div></CorporatePanel> : null}
        {events.length ? <CorporatePanel title="Case activity" eyebrow="Recorded events"><ol className="corporate-event-list">{events.slice().reverse().map((event) => <li key={event.id}><strong>{event.kind}</strong><span>{event.actorName}</span><time dateTime={event.createdAt}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(event.createdAt))}</time></li>)}</ol></CorporatePanel> : null}
      </aside>
    </div>
  </div>;
}
