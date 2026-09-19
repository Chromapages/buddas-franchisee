import Link from "next/link";
import { notFound } from "next/navigation";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, DefinitionList, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { ResourceReturnReview } from "@/src/components/corporate/resource-return-review";
import { ResourceWithdraw } from "@/src/components/corporate/resource-withdraw";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateResourcePublication, listResourceDeliveries, listResourceReturns } from "@/src/features/resources/server";
import { RESOURCE_DELIVERY_LABELS, RESOURCE_REQUIRED_ACTION_LABELS } from "@/src/features/resources/types";

const toneFor = (state: string) => state === "PUBLISHED" || state === "ACKNOWLEDGED" || state === "ACCEPTED" ? "success" : state === "CHANGES_REQUESTED" ? "attention" : "waiting" as const;

export default async function CorporateResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCorporateSession();
  const { id } = await params;
  const resource = await getCorporateResourcePublication(session, id);
  if (!resource) notFound();
  const deliveries = await listResourceDeliveries(session, resource.id);
  const returns = await Promise.all(deliveries.map(async (delivery) => [delivery.locationId, await listResourceReturns(session, resource.id, delivery.locationId)] as const));
  const returnsByLocation = new Map(returns);
  const canPublish = hasCorporatePermission(session, "PUBLISH_RESOURCES");
  const canWithdraw = resource.state === "PUBLISHED" && resource.scopeTargets.every((target) => hasCorporatePermission(session, "PUBLISH_RESOURCES", target));
  return <div className="corporate-main-stack">
    <CorporateBreadcrumbs items={[{ label: "Resources", href: "/corporate/resources" }, { label: resource.title }]} />
    <CorporatePageHeader eyebrow={`Resource · ${resource.version}`} title={resource.title} description={`${resource.category} · ${RESOURCE_REQUIRED_ACTION_LABELS[resource.requiredAction]}`} actions={resource.state === "DRAFT" && resource.ownerId === session.userId && canPublish ? <Link className="corporate-button" href={`/corporate/resources/${encodeURIComponent(resource.id)}/edit`}>Edit draft</Link> : canWithdraw ? <ResourceWithdraw resourceId={resource.id} recipientCount={resource.recipientCount} /> : undefined} />
    <CorporatePanel title="Publication details" description="This record is the source of truth for the version and recipients that were published.">
      <div className="corporate-detail-body"><DefinitionList items={[{ label: "State", value: <StatusBadge tone={toneFor(resource.state)}>{resource.state}</StatusBadge> }, { label: "Owner", value: resource.ownerName }, { label: "Required action", value: RESOURCE_REQUIRED_ACTION_LABELS[resource.requiredAction] }, { label: "Due", value: resource.dueAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(resource.dueAt)) : "No due date" }, { label: "Recipients", value: `${resource.recipientCount} store${resource.recipientCount === 1 ? "" : "s"}` }, { label: "Document", value: resource.document ? <a className="corporate-text-link" href={resource.document.url} target="_blank" rel="noreferrer">{resource.document.filename}</a> : "Attach a document before publishing" }]} /></div>
      {resource.instructions ? <p className="resource-publication-instructions"><strong>Store instructions</strong>{resource.instructions}</p> : null}
    </CorporatePanel>
    {resource.state === "PUBLISHED" ? <CorporatePanel title="Store delivery status" eyebrow={`${deliveries.length} visible recipient${deliveries.length === 1 ? "" : "s"}`} description="Review each store’s completion state. Store-specific review notes are shared only with that store.">
      <div className="corporate-table-region" role="region" aria-label="Resource delivery status" tabIndex={0}><table className="corporate-table resource-delivery-table"><caption className="sr-only">Resource delivery status by store</caption><thead><tr><th scope="col">Store</th><th scope="col">Published</th><th scope="col">Status</th><th scope="col">Return and review</th></tr></thead><tbody>{deliveries.map((delivery) => {
        const locationReturns = returnsByLocation.get(delivery.locationId) || [];
        const submitted = locationReturns.find((item) => item.state === "SUBMITTED");
        return <tr key={delivery.locationId}><th scope="row"><strong>{delivery.locationName}</strong><small>{delivery.locationCode}</small></th><td>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(delivery.publishedAt))}</td><td><StatusBadge tone={toneFor(delivery.state)}>{RESOURCE_DELIVERY_LABELS[delivery.state]}</StatusBadge>{delivery.reviewNote ? <small>{delivery.reviewNote}</small> : null}</td><td>{submitted ? <div className="resource-delivery-review"><a className="corporate-text-link" href={submitted.document.url} target="_blank" rel="noreferrer">Open submitted document</a>{canPublish ? <ResourceReturnReview resourceId={resource.id} locationId={delivery.locationId} returnId={submitted.id} /> : null}</div> : locationReturns[0] ? <span>{locationReturns[0].state === "ACCEPTED" ? "Completed document accepted" : "Changes requested"}</span> : <span>No return submitted</span>}</td></tr>;
      })}</tbody></table></div>
    </CorporatePanel> : null}
  </div>;
}
