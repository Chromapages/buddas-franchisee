import Link from "next/link";
import { CircleHelp, Clock, Package } from "lucide-react";
import type { PortalProduct } from "@/src/features/portal/types";
import { CatalogProductVisual } from "@/src/components/portal/catalog-product-visual";
import { CatalogProductStateBadge } from "@/src/components/portal/catalog-product-state-badge";
import { SupplyCategoryDetailModules } from "@/src/components/portal/supply-category-detail-modules";
import { SupplyPurchaseControl } from "@/src/components/portal/supply-purchase-control";

export type SupplyDetailViewProps = {
  product: PortalProduct;
  locationId: string;
  currentQuantity: number;
  canManageCart: boolean;
  itemCount: number | null;
  purchaseUnit: string;
  priceLabel: string | null;
  unitPriceLabel: string | null;
  leadTime: string;
  productCanOrder: boolean;
  productStateDescription: string;
  latestPurchase: { dateLabel: string; quantity: number; orderCount: number } | null;
};

export const SupplyDetailDesktop = ({ product, locationId, currentQuantity, canManageCart, itemCount, purchaseUnit, priceLabel, unitPriceLabel, leadTime, productCanOrder, productStateDescription, latestPurchase }: SupplyDetailViewProps) => (
  <div className="supply-detail-desktop">
    <div className="supply-detail-layout">
      <section className="supply-detail-product" aria-labelledby="supply-detail-title">
        <header className="supply-detail-heading"><p>{product.category}</p><div className="supply-detail-title" aria-hidden="true">{product.name}</div>{product.sku ? <span>SKU: {product.sku}</span> : null}</header>
        <CatalogProductVisual product={product} className="catalog-detail-visual relative overflow-hidden rounded-xl bg-bds-cream/60 border border-bds-teal-dark/10" sizes="(max-width: 1023px) 100vw, 560px" priority />
        <p className="supply-detail-description">{product.description}</p>
      </section>

      <div className="supply-detail-side">
        <section className="supply-detail-order-card" aria-label={`Order ${product.name}`}>
          <div className="supply-detail-status"><CatalogProductStateBadge product={product} /><span>{productCanOrder ? `Ships in ~${leadTime}` : productStateDescription}</span></div>
          <div className="supply-detail-pack"><Package aria-hidden="true" /><div><span>Pack size</span><strong>{product.packSize}</strong>{itemCount ? <small>Each purchase unit includes {itemCount} items.</small> : null}</div></div>
          <p className="supply-detail-price"><strong>{priceLabel ?? "Price unavailable"}</strong>{priceLabel ? <span>/ {purchaseUnit}</span> : null}{unitPriceLabel ? <small>{unitPriceLabel} each</small> : null}</p>
          <SupplyPurchaseControl product={product} locationId={locationId} initialQuantity={currentQuantity} canManageCart={canManageCart} />
        </section>

        <div className="supply-detail-lower">
          <section className="supply-detail-specs" aria-labelledby="supply-detail-specs-title-desktop"><h2 id="supply-detail-specs-title-desktop">Product details</h2><dl><div><dt>Category</dt><dd>{product.category}</dd></div>{product.sku ? <div><dt>SKU</dt><dd>{product.sku}</dd></div> : null}<div><dt>Purchase unit</dt><dd>{product.packSize}</dd></div><div><dt>Lead time</dt><dd>{leadTime}</dd></div></dl></section>
          <SupplyDetailAssistance latestPurchase={latestPurchase} purchaseUnit={purchaseUnit} idPrefix="desktop" />
        </div>
        <SupplyCategoryDetailModules product={product} />
      </div>
    </div>
  </div>
);

export const SupplyDetailAssistance = ({ latestPurchase, purchaseUnit, idPrefix }: Pick<SupplyDetailViewProps, "latestPurchase" | "purchaseUnit"> & { idPrefix: string }) => (
  <aside className="supply-detail-assistance" aria-label="Order history and product support">
    {latestPurchase ? <section aria-labelledby={`supply-purchase-history-title-${idPrefix}`} className="supply-detail-history"><Clock aria-hidden="true" /><div><h2 id={`supply-purchase-history-title-${idPrefix}`}>Last ordered</h2><p>{latestPurchase.dateLabel} <span aria-hidden="true">·</span> {latestPurchase.quantity} {latestPurchase.quantity === 1 || purchaseUnit === "each" ? purchaseUnit : `${purchaseUnit}s`}</p>{latestPurchase.orderCount > 1 ? <small>{latestPurchase.orderCount} recorded orders</small> : null}</div></section> : null}
    <section className="supply-detail-help"><CircleHelp aria-hidden="true" /><div><h2>Need help?</h2><p>Contact Support for product questions or ordering assistance.</p><Link href="/portal/support">Contact Support <span aria-hidden="true">→</span></Link></div></section>
  </aside>
);
