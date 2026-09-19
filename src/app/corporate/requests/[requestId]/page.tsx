import { notFound } from "next/navigation";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, DefinitionList, ErrorState, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateRequest } from "@/src/features/corporate/operations-data";
import { getRequestDecisionState, getRequestHandlingState } from "@/src/features/corporate/requests/state";

export default async function CorporateRequestDetailPage({ params }: { params: Promise<{ requestId: string }> }) {
  const session = await requireCorporateSession();
  const { requestId } = await params;
  const request = await getCorporateRequest(session, requestId).catch(() => undefined);
  if (request === undefined) return <ErrorState title="Request could not be loaded" description="The request source is unavailable. No decision was changed." retryHref="/corporate/requests" />;
  if (!request) notFound();
  const handling = getRequestHandlingState(request.handlingState);
  const decision = getRequestDecisionState(request.decisionState);
  return <div className="corporate-main-stack">
    <CorporateBreadcrumbs items={[{ label: "Requests", href: "/corporate/requests" }, { label: request.sourceRequestId || request.id }]} />
    <CorporatePageHeader eyebrow={`Growth request · ${request.sourceRequestId || request.id}`} title={request.title} description={`${request.scopeLabel} · Review the actual submitted evidence before recording any decision.`} actions={<StatusBadge tone={request.handlingState === "complete" ? "success" : request.handlingState.includes("await") ? "waiting" : "attention"}>{handling.label}</StatusBadge>} />
    <div className="corporate-detail-grid"><CorporatePanel title="Operator submission" eyebrow="Existing-operator growth"><div className="corporate-detail-body"><p className="corporate-support-details">{request.summary}</p><DefinitionList items={[{ label: "Originating location", value: request.locationName }, { label: "Submitted", value: <time dateTime={request.submittedAt}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(request.submittedAt))}</time> }, { label: "Handling", value: handling.label }, { label: "Decision", value: decision.label }]} /></div></CorporatePanel><CorporatePanel title="Decision boundary" eyebrow="Authority"><div className="corporate-detail-body"><p>{decision.meaning}</p><p className="corporate-support-details">This record does not reserve territory, verify financial qualification, execute an agreement, issue an FDD, or provision a unit. No approval action is enabled without a reviewed authority and evidence contract.</p></div></CorporatePanel></div>
    <CorporatePanel title="Evidence" eyebrow="Source and freshness"><div className="corporate-table-region" role="region" aria-label="Request evidence" tabIndex={0}><table className="corporate-table"><caption className="sr-only">Request evidence and source freshness</caption><thead><tr><th scope="col">Evidence</th><th scope="col">Source</th><th scope="col">Freshness</th><th scope="col">Recorded note</th></tr></thead><tbody>{request.evidence.map((item) => <tr key={item.label}><th scope="row"><strong>{item.label}</strong></th><td>{item.source}</td><td>{item.freshness}</td><td>{item.note || "No note recorded"}</td></tr>)}</tbody></table></div></CorporatePanel>
    <CorporatePanel title="Conditions and recovery" eyebrow="Owned follow-up"><ul className="corporate-recovery-list">{request.conditions.map((condition) => <li key={condition.label}><strong>{condition.label}</strong><span>{condition.satisfied ? "Satisfied" : `Open · ${condition.owner || "No owner"}`}</span></li>)}{request.recoveryActions.map((action) => <li key={action.label}><strong>{action.label}</strong><span>{action.description}</span></li>)}</ul></CorporatePanel>
  </div>;
}
