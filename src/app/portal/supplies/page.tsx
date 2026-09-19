import { Suspense } from "react";
import type { Metadata } from "next";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { CatalogBrowser } from "@/src/components/portal/catalog-browser";
import type { CatalogReplenishmentItem } from "@/src/components/portal/catalog-replenishment-guide";
import { getPortalCart, getPortalCartLocationNotice } from "@/src/features/portal/cart";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { getSupplyCapabilities } from "@/src/features/portal/authorization";
import { formatPortalDate } from "@/src/features/portal/date-time";
import { canonicalizeSupplyCategory } from "@/src/features/portal/catalog-taxonomy";
import "./supplies-desktop.css";

export const metadata: Metadata = {
  title: "Supplies",
  robots: { index: false, follow: false, nocache: true },
};

export default async function SuppliesPage() {
  const session = await requirePortalPermission("VIEW_CATALOG");
  const cartLocationNotice = await getPortalCartLocationNotice(session);
  return (
    <div className="portal-page-stack catalog-page-stack">
      <header className="portal-page-header catalog-page-header">
        <div className="catalog-page-hero-copy">
          <p className="catalog-page-eyebrow">Supplies</p>
          <h1 className="portal-page-title">Approved purchasing for {session.locationName}.</h1>
          <p className="catalog-scope-note">Products, pricing, and supply support for your restaurant.</p>
        </div>
      </header>
      {cartLocationNotice ? <p role="status" className="catalog-location-cart-notice">Your {cartLocationNotice.itemCount} {cartLocationNotice.itemCount === 1 ? "item" : "items"} remain saved for unit {cartLocationNotice.previousLocationId}. They were not moved to this unit.</p> : null}

      <PortalDataBoundary title="Supplies Catalog could not be loaded" description="Authorized products or cart data are temporarily unavailable for this unit." className="min-h-48"><Suspense fallback={<CatalogFallback />}><CatalogModule session={session} /></Suspense></PortalDataBoundary>
    </div>
  );
}

import type { PortalSession } from "@/src/lib/auth/auth-provider";

const CatalogModule = async ({ session }: { session: PortalSession }) => {
  if (!session) return null;
  const capabilities = getSupplyCapabilities(session);
  const [products, cart, orderHistory] = await Promise.all([
    loadPortalModule("supplies catalog", () => defaultPortalStorage.getProductsByLocation(session.locationId)),
    capabilities.canManageCart ? loadPortalModule("supplies cart", () => getPortalCart(session)).catch(() => null) : Promise.resolve(null),
    capabilities.canViewOrderHistory ? loadPortalModule("supply order guide", () => defaultPortalStorage.getOrdersByLocation(session.locationId)).then((orders) => ({ orders, failed: false })).catch(() => ({ orders: [], failed: true })) : Promise.resolve({ orders: [], failed: false }),
  ]);
  const orders = orderHistory.orders;
  const visibleProducts = products.filter((product) => product.isAvailable).map(canonicalizeSupplyCategory);
  const history = new Map<string, CatalogReplenishmentItem>();
  [...orders]
    .filter((order) => order.status !== "CANCELLED" && order.status !== "CANCELLATION_REQUESTED" && Number.isFinite(Date.parse(order.createdAt)))
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .forEach((order) => order.items.forEach((item) => {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) return;
      const existing = history.get(item.sku);
      if (existing) {
        history.set(item.sku, { ...existing, orderCount: existing.orderCount + 1 });
        return;
      }
      history.set(item.sku, { sku: item.sku, name: item.name, orderId: order.id, lastOrderedLabel: formatPortalDate(order.createdAt, session.locationId), lastQuantity: item.quantity, lastPrice: item.price, orderCount: 1 });
  }));
  const replenishmentItems = [...history.values()].slice(0, 5);
  const currentCatalogSkus = new Set(visibleProducts.map((product) => product.sku));
  const recentSkus = replenishmentItems.filter((item) => currentCatalogSkus.has(item.sku)).map((item) => item.sku);
  return <>{cart === null && capabilities.canManageCart ? <p className="catalog-feedback">Cart count is unavailable. Open the cart to review its current contents.</p> : null}<CatalogBrowser key={session.locationId} products={visibleProducts} initialCartCount={cart?.reduce((total, item) => total + item.quantity, 0) ?? null} initialCartQuantities={Object.fromEntries(cart?.map((item) => [item.sku, item.quantity]) ?? [])} recentlyOrderedSkus={recentSkus} replenishmentItems={replenishmentItems} replenishmentFailed={orderHistory.failed} locationId={session.locationId} locationName={session.locationName} canManageCart={capabilities.canManageCart && capabilities.canViewWholesalePricing} /></>;
};

const CatalogFallback = () => <section aria-busy="true" className="catalog-loading-state"><p>Loading authorized supplies…</p><div className="catalog-loading-grid">{[0, 1, 2].map((index) => <div key={index} />)}</div><span className="sr-only" role="status">Loading Supplies Catalog</span></section>;
