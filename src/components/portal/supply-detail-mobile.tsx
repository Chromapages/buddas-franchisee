import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { CatalogProductVisual } from "@/src/components/portal/catalog-product-visual";
import { CatalogProductStateBadge } from "@/src/components/portal/catalog-product-state-badge";
import { SupplyCategoryDetailModules } from "@/src/components/portal/supply-category-detail-modules";
import { SupplyPurchaseControl } from "@/src/components/portal/supply-purchase-control";
import { SupplyDetailAssistance, type SupplyDetailViewProps } from "@/src/components/portal/supply-detail-desktop";

export const SupplyDetailMobile = ({ product, locationId, currentQuantity, canManageCart, itemCount, purchaseUnit, priceLabel, unitPriceLabel, leadTime, productCanOrder, productStateDescription, latestPurchase }: SupplyDetailViewProps) => (
  <div className="supply-detail-mobile">
    <Link href="/portal/supplies" className="supply-detail-back touch-target-inline"><ArrowLeft className="w-4 h-4" aria-hidden="true" />Back to supplies</Link>
    <header className="supply-detail-heading"><p>{product.category}</p><div className="supply-detail-title" aria-hidden="true">{product.name}</div>{product.sku ? <span>SKU: {product.sku}</span> : null}</header>
    <CatalogProductVisual product={product} className="catalog-detail-visual relative overflow-hidden rounded-xl bg-bds-cream/60 border border-bds-teal-dark/10" sizes="100vw" priority />

    <section className="supply-detail-order-card" aria-label={`Order ${product.name}`}>
      <div className="supply-detail-status"><CatalogProductStateBadge product={product} /><span>{productCanOrder ? `Ships in ~${leadTime}` : productStateDescription}</span></div>
      <div className="supply-detail-pack"><Package aria-hidden="true" /><div><span>Pack size</span><strong>{product.packSize}</strong>{itemCount ? <small>Each purchase unit includes {itemCount} items.</small> : null}</div></div>
      <p className="supply-detail-price"><strong>{priceLabel ?? "Price unavailable"}</strong>{priceLabel ? <span>/ {purchaseUnit}</span> : null}{unitPriceLabel ? <small>{unitPriceLabel} each</small> : null}</p>
      <SupplyPurchaseControl product={product} locationId={locationId} initialQuantity={currentQuantity} canManageCart={canManageCart} />
    </section>

    <section className="supply-detail-mobile-description" aria-labelledby="supply-description-title-mobile"><h2 id="supply-description-title-mobile">About this supply</h2><p>{product.description}</p></section>
    <section className="supply-detail-specs" aria-labelledby="supply-detail-specs-title-mobile"><h2 id="supply-detail-specs-title-mobile">Product details</h2><dl><div><dt>Category</dt><dd>{product.category}</dd></div>{product.sku ? <div><dt>SKU</dt><dd>{product.sku}</dd></div> : null}<div><dt>Purchase unit</dt><dd>{product.packSize}</dd></div><div><dt>Lead time</dt><dd>{leadTime}</dd></div></dl></section>
    <SupplyDetailAssistance latestPurchase={latestPurchase} purchaseUnit={purchaseUnit} idPrefix="mobile" />
    <SupplyCategoryDetailModules product={product} />
  </div>
);
