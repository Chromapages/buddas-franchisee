import { Suspense } from "react";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { CatalogBrowser } from "@/src/components/portal/catalog-browser";
import { getPortalCart } from "@/src/features/portal/cart";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";

export default async function SuppliesPage() {
  const session = await requirePortalPermission("VIEW_CATALOG");
  return (
    <div className="portal-page-stack">
      <div className="portal-page-header">
        <span className="portal-page-eyebrow">
          Wholesale Supply Ordering
        </span>
        <h1 className="portal-page-title">
          Authorized Supplies Catalog
        </h1>
        <p className="text-sm text-bds-cocoa/80">
          Wholesale pricing and inventory allocated for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <PortalDataBoundary title="Supplies Catalog could not be loaded" description="Authorized products or cart data are temporarily unavailable for this unit." className="min-h-48"><Suspense fallback={<CatalogFallback />}><CatalogModule session={session} /></Suspense></PortalDataBoundary>
    </div>
  );
}

import type { PortalSession } from "@/src/lib/auth/auth-provider";

const CatalogModule = async ({ session }: { session: PortalSession }) => {
  if (!session) return null;
  const [products, cart] = await Promise.all([
    loadPortalModule("supplies catalog", () => defaultPortalStorage.getProductsByLocation(session.locationId)),
    loadPortalModule("supplies cart", () => getPortalCart(session)),
  ]);
  return <CatalogBrowser products={products} initialCartCount={cart.reduce((total, item) => total + item.quantity, 0)} />;
};

const CatalogFallback = () => <section aria-busy="true" className="min-h-48 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm"><p className="text-sm text-bds-cocoa/80">Loading authorized supplies…</p><div className="mt-4 grid gap-4 md:grid-cols-2">{[0, 1].map((index) => <div key={index} className="h-28 rounded-xl bg-bds-cream/60" />)}</div><span className="sr-only" role="status">Loading Supplies Catalog</span></section>;
