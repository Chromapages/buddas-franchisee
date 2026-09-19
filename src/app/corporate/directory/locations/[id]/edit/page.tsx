import { notFound } from "next/navigation";
import { LocationForm } from "@/src/components/corporate/location-form";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, ErrorState, PermissionState } from "@/src/components/corporate/corporate-ui";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";
import { getAssignableLocationOperators } from "@/src/features/corporate/locations/queries";

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCorporateSession(); const { id } = await params;
  const storage = getCorporateStorage(); const loaded = await Promise.all([storage.getLocations(session), storage.getOrganizations(session), storage.getRegions(session)]).catch(() => null);
  if (!loaded) return <ErrorState title="Store editor could not be loaded" description="The directory source is unavailable." retryHref={`/corporate/directory/locations/${encodeURIComponent(id)}`} />;
  const location = loaded[0].find((item) => item.id === id); if (!location) notFound();
  if (!hasCorporatePermission(session, "MANAGE_LOCATIONS", { locationId: id, organizationId: location.organizationId, regionId: location.regionId })) return <PermissionState description="Your current corporate access does not include this store." />;
  const canAssign = hasCorporatePermission(session, "MANAGE_LOCATION_ASSIGNMENTS", { locationId: id, organizationId: location.organizationId, regionId: location.regionId });
  const operators = canAssign ? await getAssignableLocationOperators() : [];
  return <div className="corporate-main-stack"><CorporateBreadcrumbs items={[{ label: "Directory", href: "/corporate/directory?tab=locations" }, { label: location.name, href: `/corporate/directory/locations/${encodeURIComponent(id)}` }, { label: "Store setup" }]} /><CorporatePageHeader eyebrow="Store lifecycle" title={`Set up ${location.name}`} description={location.operatingStatus === "ACTIVE" ? "Review the active store record and update the person responsible for its operator workspace." : "Review the basics, confirm the inferred details, then assign an operator and activate the store."} /><CorporatePanel title="Store setup" eyebrow={location.operatingStatus || "UNKNOWN"}><LocationForm location={location} organizations={loaded[1]} regions={loaded[2]} operators={operators} canVerify={hasCorporatePermission(session, "VERIFY_LOCATIONS", { locationId: id, organizationId: location.organizationId, regionId: location.regionId }) && canAssign} /></CorporatePanel></div>;
}
