import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { CatalogBrowser } from "@/src/components/portal/catalog-browser";

export default async function SuppliesPage() {
  const session = (await getPortalSession())!;
  const products = await defaultPortalStorage.getProductsByLocation(session.locationId);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
          Wholesale Supply Ordering
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-charcoal">
          Authorized Supplies Catalog
        </h2>
        <p className="text-sm text-brand-charcoal/70 mt-1">
          Wholesale pricing and inventory allocated for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <CatalogBrowser products={products} locationId={session.locationId} />
    </div>
  );
}
