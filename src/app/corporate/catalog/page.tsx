import { CatalogBulkPublisher } from "@/src/components/corporate/catalog-bulk-publisher";
import { ErrorState, PermissionState } from "@/src/components/corporate/corporate-ui";
import { canManageUniversalCatalog, getCatalogPublicationEligibility } from "@/src/features/corporate/catalog";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import "../work/work-masthead.css";
import "./catalog-masthead.css";

export default async function CorporateCatalogPage() {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "MANAGE_CATALOG")) return <PermissionState description="Your current corporate access does not include franchise-store catalog publishing." />;
  const eligibility = await getCatalogPublicationEligibility();
  if (eligibility.status === "error") return <ErrorState title="Stores could not be loaded" description={eligibility.message || "No publication was created."} retryHref="/corporate/catalog" />;
  return <CatalogBulkPublisher stores={eligibility.stores} canPublishUniversal={await canManageUniversalCatalog(session)} />;
}
