import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { SupplyDetailDesktop, type SupplyDetailViewProps } from "@/src/components/portal/supply-detail-desktop";
import { SupplyDetailMobile } from "@/src/components/portal/supply-detail-mobile";
import { getPortalCart } from "@/src/features/portal/cart";
import { getSupplyCapabilities } from "@/src/features/portal/authorization";
import { formatPortalDate } from "@/src/features/portal/date-time";
import { OperatorEventOnMount } from "@/src/components/portal/operator-analytics";
import { resolveCatalogProductState } from "@/src/features/portal/catalog-product-state";
import { canonicalizeSupplyCategory } from "@/src/features/portal/catalog-taxonomy";
import "./supply-detail.css";

const unitsPerPurchase = (packSize: string) => {
  const match = packSize.match(/(?:pack|case|set|kit|box|dozen)\s+of\s+(\d+)|^(\d+)\s+per\s+(?:case|pack|set|kit|box|dozen)/i);
  const count = Number(match?.[1] || match?.[2]);
  return Number.isInteger(count) && count > 1 ? count : null;
};

const purchaseUnitLabel = (packSize: string) => {
  const normalized = packSize.toLocaleLowerCase();
  for (const unit of ["case", "pack", "set", "bag", "pail", "box", "roll", "kit", "dozen", "each"]) {
    if (normalized.includes(unit)) return unit;
  }
  return "purchase unit";
};

export const metadata: Metadata = {
  title: "Supply Item",
  robots: { index: false, follow: false, nocache: true },
};

export default async function SupplyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await requirePortalPermission("VIEW_CATALOG");
  const capabilities = getSupplyCapabilities(session);
  const [products, cart, orders] = await Promise.all([
    defaultPortalStorage.getProductsByLocation(session.locationId),
    capabilities.canManageCart ? getPortalCart(session).catch(() => []) : Promise.resolve([]),
    capabilities.canViewOrderHistory ? defaultPortalStorage.getOrdersByLocation(session.locationId).catch(() => []) : Promise.resolve([]),
  ]);
  const sourceProduct = products.find((p) => p.slug === slug);

  if (!sourceProduct) {
    notFound();
  }
  const product = canonicalizeSupplyCategory(sourceProduct);

  const currentQuantity = cart.find((item) => item.sku === product.sku)?.quantity ?? 0;
  const productOrders = orders
    .filter((order) => order.status !== "CANCELLED" && order.status !== "CANCELLATION_REQUESTED" && Number.isFinite(Date.parse(order.createdAt)))
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .flatMap((order) => order.items.map((item) => ({ order, item })))
    .filter(({ item }) => item.sku === product.sku && Number.isInteger(item.quantity) && item.quantity > 0);
  const latestPurchase = productOrders[0];
  const productState = resolveCatalogProductState(product);
  const itemCount = unitsPerPurchase(product.packSize);
  const purchaseUnit = purchaseUnitLabel(product.packSize);
  const currency = Number.isFinite(product.price) && product.price >= 0
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
    : null;
  const leadTime = Number.isFinite(product.leadTimeDays) && product.leadTimeDays >= 0
    ? `${product.leadTimeDays} business day${product.leadTimeDays === 1 ? "" : "s"}`
    : "Lead time unavailable";
  const viewProps: SupplyDetailViewProps = {
    product,
    locationId: session.locationId,
    currentQuantity,
    canManageCart: capabilities.canManageCart && capabilities.canViewWholesalePricing,
    itemCount,
    purchaseUnit,
    priceLabel: currency?.format(product.price) ?? null,
    unitPriceLabel: currency && itemCount ? currency.format(product.price / itemCount) : null,
    leadTime,
    productCanOrder: productState.canOrder,
    productStateDescription: productState.description,
    latestPurchase: latestPurchase ? {
      dateLabel: formatPortalDate(latestPurchase.order.createdAt, session.locationId),
      quantity: latestPurchase.item.quantity,
      orderCount: productOrders.length,
    } : null,
  };

  return (
    <div className="workspace-detail supply-detail-page portal-page-stack">
      <OperatorEventOnMount event="operator_supply_product_opened" properties={{ route: "/portal/supplies", location_scope: "active_unit", category: product.category, sku: product.sku, availability_state: productState.code, lead_time_bucket: product.leadTimeDays <= 3 ? "up_to_3_days" : "4_plus_days", purchase_path: latestPurchase ? "repeat" : "discovery" }} />
      <h1 id="supply-detail-title" className="sr-only">{product.name}</h1>
      <SupplyDetailDesktop {...viewProps} />
      <SupplyDetailMobile {...viewProps} />
    </div>
  );
}
