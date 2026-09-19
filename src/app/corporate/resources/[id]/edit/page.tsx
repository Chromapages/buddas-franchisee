import { notFound } from "next/navigation";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, PermissionState } from "@/src/components/corporate/corporate-ui";
import { ResourcePublicationForm } from "@/src/components/corporate/resource-publication-form";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateResourcePublication, listResourceLocations } from "@/src/features/resources/server";

export default async function EditCorporateResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "PUBLISH_RESOURCES")) return <PermissionState description="Your current corporate access cannot edit resource drafts." />;
  const { id } = await params;
  const resource = await getCorporateResourcePublication(session, id);
  if (!resource || resource.state !== "DRAFT" || resource.ownerId !== session.userId) notFound();
  const locations = await listResourceLocations(session, "PUBLISH_RESOURCES");
  return <div className="corporate-main-stack">
    <CorporateBreadcrumbs items={[{ label: "Resources", href: "/corporate/resources" }, { label: resource.title, href: `/corporate/resources/${resource.id}` }, { label: "Edit draft" }]} />
    <CorporatePageHeader eyebrow="Resource draft" title={`Edit ${resource.title}`} description="Finish the document and recipient selection, then review the publication before it reaches stores." />
    <CorporatePanel title="Send a document" description="You can save for later at any step."><ResourcePublicationForm locations={locations} initial={resource} /></CorporatePanel>
  </div>;
}
