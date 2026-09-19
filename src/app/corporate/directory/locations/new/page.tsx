import { LocationForm } from "@/src/components/corporate/location-form";
import Link from "next/link";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, EmptyState, ErrorState, PermissionState } from "@/src/components/corporate/corporate-ui";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";
import { getAssignableLocationOperators } from "@/src/features/corporate/locations/queries";

export default async function NewLocationPage() {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "MANAGE_LOCATIONS")) return <PermissionState description="Your current corporate access does not include store creation." />;
  const values = await Promise.all([getCorporateStorage().getOrganizations(session), getCorporateStorage().getRegions(session)]).catch(() => null);
  if (!values) return <ErrorState title="Store setup could not be loaded" description="Organizations or regions are unavailable." retryHref="/corporate/directory" />;
  const activeRegions = values[1].filter((region) => region.status === "ACTIVE");
  if (!values[0].length || !activeRegions.length) return <div className="corporate-main-stack"><CorporateBreadcrumbs items={[{ label: "Directory", href: "/corporate/directory?tab=locations" }, { label: "Add location" }]} /><CorporatePageHeader eyebrow="Store lifecycle" title="Add location" description="A store needs an existing franchise organization and operating region before its record can be created." /><EmptyState title="Complete store setup first" description={`${values[0].length ? "No active operating regions are available." : "No franchise organizations are available."} Add or verify the parent record before creating a store.`} action={<Link href="/corporate/directory" className="corporate-button">Review Directory</Link>} /></div>;
  const canCompleteLifecycle = hasCorporatePermission(session, "VERIFY_LOCATIONS") && hasCorporatePermission(session, "MANAGE_LOCATION_ASSIGNMENTS");
  const operators = canCompleteLifecycle ? await getAssignableLocationOperators() : [];
  return <div className="corporate-main-stack"><CorporateBreadcrumbs items={[{ label: "Directory", href: "/corporate/directory?tab=locations" }, { label: "Add location" }]} /><CorporatePageHeader eyebrow="Store lifecycle" title="Add location" description="Add the store basics, confirm the generated details, then assign an operator and activate the workspace." /><CorporatePanel title="New store setup" eyebrow="Three guided steps"><LocationForm organizations={values[0]} regions={activeRegions} operators={operators} canVerify={canCompleteLifecycle} /></CorporatePanel></div>;
}
