import Link from "next/link";
import { FilePlus2, FolderOpen } from "lucide-react";
import { CorporatePageHeader, CorporatePanel, EmptyState, ErrorState, PermissionState, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";
import { listCorporateResourcePublications } from "@/src/features/resources/server";
import { RESOURCE_REQUIRED_ACTION_LABELS } from "@/src/features/resources/types";

const toneFor = (state: string) => state === "PUBLISHED" ? "success" : state === "WITHDRAWN" ? "danger" : "waiting" as const;

export default async function CorporateResourcesPage() {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_RESOURCES")) return <PermissionState description="Your current corporate access does not include resource records." />;
  const [resources, legacyResources] = await Promise.all([
    listCorporateResourcePublications(session).catch(() => null),
    getCorporateStorage().getResources(session).catch(() => []),
  ]);
  const canPublish = hasCorporatePermission(session, "PUBLISH_RESOURCES");
  return <div className="corporate-main-stack">
    <CorporatePageHeader eyebrow="Approved knowledge" title="Resources" description="Create versioned operating resources, target permitted stores, and track each required response." actions={canPublish ? <Link href="/corporate/resources/new" className="corporate-button"><FilePlus2 size={16} aria-hidden="true" /> Create resource</Link> : undefined} />
    {!resources ? <ErrorState title="Resources could not be loaded" description="The authorized resource source is unavailable." retryHref="/corporate/resources" /> : <CorporatePanel title="Resource publications" description="Drafts remain private. Published resources record the exact version, recipient stores, and required action.">
      {resources.length ? <div className="corporate-card-grid">{resources.map((resource) => <article className="corporate-card resource-publication-card" key={resource.id}>
        <header><FolderOpen size={20} aria-hidden="true" /><h3>{resource.title}</h3></header>
        <p>{resource.category} · Version {resource.version}</p>
        <p className="resource-publication-card-action">{RESOURCE_REQUIRED_ACTION_LABELS[resource.requiredAction]} · {resource.recipientCount} store{resource.recipientCount === 1 ? "" : "s"}</p>
        <footer><StatusBadge tone={toneFor(resource.state)}>{resource.state}</StatusBadge><Link href={`/corporate/resources/${encodeURIComponent(resource.id)}`}>{resource.state === "DRAFT" ? "Open draft" : "View delivery"}</Link></footer>
      </article>)}</div> : <EmptyState title="No resource publications yet" description="Create a draft to prepare an operating document, choose its recipients, and publish a clear required action." action={canPublish ? <Link href="/corporate/resources/new" className="corporate-button">Create resource</Link> : undefined} />}
    </CorporatePanel>}
    {legacyResources.length ? <CorporatePanel title="Existing library records" description="These earlier reference records remain available for review. Create a new managed resource when you need recipient actions or delivery status.">
      <div className="corporate-card-grid">{legacyResources.map((resource) => <article className="corporate-card" key={resource.id}><header><FolderOpen size={20} aria-hidden="true" /><h3>{resource.title}</h3></header><p>{resource.category} · Version {resource.version}</p><footer><StatusBadge tone={toneFor(resource.state)}>{resource.state}</StatusBadge><span>{resource.ownerName}</span></footer></article>)}</div>
    </CorporatePanel> : null}
  </div>;
}
