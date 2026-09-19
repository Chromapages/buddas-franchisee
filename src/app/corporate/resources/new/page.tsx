import Link from "next/link";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, PermissionState } from "@/src/components/corporate/corporate-ui";
import { ResourcePublicationForm } from "@/src/components/corporate/resource-publication-form";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { listResourceLocations } from "@/src/features/resources/server";

export default async function NewCorporateResourcePage() {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "PUBLISH_RESOURCES")) return <PermissionState description="Your current corporate access can review resources but cannot create or publish them." />;
  const locations = await listResourceLocations(session, "PUBLISH_RESOURCES");
  return <div className="corporate-main-stack">
    <CorporateBreadcrumbs items={[{ label: "Resources", href: "/corporate/resources" }, { label: "Send a document" }]} />
    <CorporatePageHeader eyebrow="Resources" title="Send a document" description="Add a document, choose your stores, and check the details before sending." actions={<Link href="/corporate/resources" className="corporate-button-secondary">Back to Resources</Link>} />
    <CorporatePanel title="Prepare your document" description="You can save for later at any step."><ResourcePublicationForm locations={locations} /></CorporatePanel>
  </div>;
}
