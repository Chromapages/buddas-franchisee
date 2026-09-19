"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Minus, Package, Plus } from "lucide-react";
import type { PortalProduct } from "@/src/features/portal/types";
import { CatalogProductVisual } from "@/src/components/portal/catalog-product-visual";
import { MAX_CART_QUANTITY } from "@/src/features/portal/cart-policy";

export type CatalogReplenishmentItem = {
  sku: string;
  name: string;
  orderId: string;
  lastOrderedLabel: string;
  lastQuantity: number;
  lastPrice?: number;
  orderCount: number;
};

const purchaseUnitLabel = (packSize: string) => {
  const normalized = packSize.toLocaleLowerCase();
  if (normalized.includes("case")) return "case";
  if (normalized.includes("pack")) return "pack";
  if (normalized.includes("set")) return "set";
  if (normalized.includes("bag")) return "bag";
  if (normalized.includes("pail")) return "pail";
  if (normalized.includes("box")) return "box";
  if (normalized.includes("roll")) return "roll";
  if (normalized.includes("kit")) return "kit";
  if (normalized.includes("each")) return "each";
  return "unit";
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const quantityUnit = (unit: string, quantity: number) => quantity === 1 || unit === "each" ? unit : unit === "box" ? "boxes" : `${unit}s`;

export const CatalogReplenishmentGuide = ({
  items,
  products,
  cartQuantities,
  pendingSku,
  canManageCart,
  onAddLastQuantity,
}: {
  items: CatalogReplenishmentItem[];
  products: PortalProduct[];
  cartQuantities: Record<string, number>;
  pendingSku: string | null;
  canManageCart: boolean;
  onAddLastQuantity: (product: PortalProduct, quantity: number) => void;
}) => {
  const [stagedQuantities, setStagedQuantities] = useState<Record<string, number>>(() => Object.fromEntries(items.map((item) => [item.sku, item.lastQuantity])));
  const rows = items.map((item) => ({ item, product: products.find((candidate) => candidate.sku === item.sku) }));

  if (!items.length) return null;

  return <section className="catalog-replenishment-guide" aria-labelledby="catalog-replenishment-title">
    <header><div><p className="catalog-kicker">Order again</p><h2 id="catalog-replenishment-title">Recent supplies for this location</h2></div><Link href="/portal/orders">View order history <ArrowRight size={15} aria-hidden="true" /></Link></header>
    <ul>{rows.map(({ item, product }) => {
      const currentQuantity = product ? cartQuantities[product.sku] ?? 0 : 0;
      const purchaseUnit = product ? purchaseUnitLabel(product.packSize) : "unit";
      const canAdd = product !== undefined && canManageCart && product.isAvailable && Number.isFinite(product.price) && product.price >= 0 && currentQuantity === 0;
      const quantity = Math.max(1, Math.min(MAX_CART_QUANTITY, stagedQuantities[item.sku] ?? item.lastQuantity));
      const quantityLabel = `${quantity} ${quantityUnit(purchaseUnit, quantity)}`;
      return <li key={item.sku}>
        {product ? <Link href={`/portal/supplies/${encodeURIComponent(product.slug)}`} className="catalog-replenishment-visual" aria-label={`View ${product.name}`}><CatalogProductVisual product={product} compactFallback className="catalog-replenishment-image" sizes="72px" /></Link> : <div className="catalog-replenishment-missing-visual" aria-hidden="true"><Package size={20} /></div>}
        <div className="catalog-replenishment-product">{product ? <Link href={`/portal/supplies/${encodeURIComponent(product.slug)}`}>{product.name}</Link> : <strong>{item.name}</strong>}<small>{product ? product.packSize : `SKU ${item.sku}`}</small><span>Last ordered {item.lastOrderedLabel} · {item.lastQuantity} {quantityUnit(purchaseUnit, item.lastQuantity)}</span>{product && item.lastPrice !== undefined && item.lastPrice !== product.price ? <strong className="catalog-replenishment-change">Price changed from {money(item.lastPrice)} to {money(product.price)}</strong> : !product ? <strong className="catalog-replenishment-change">No longer available in this catalog</strong> : null}</div>
        <div className="catalog-replenishment-purchase">
          {!product ? <Link href="/portal/supplies" className="catalog-replenishment-view-product">Find replacement</Link> : currentQuantity > 0 ? <span className="catalog-replenishment-in-cart">{currentQuantity} {quantityUnit(purchaseUnit, currentQuantity)} in current order</span> : canAdd && product ? <>
            <div className="catalog-replenishment-stepper">
              <button type="button" disabled={pendingSku !== null || quantity <= 1} onClick={() => setStagedQuantities((current) => ({ ...current, [product.sku]: quantity - 1 }))} aria-label={`Decrease ${product.name} quantity`}><Minus size={15} aria-hidden="true" /></button>
              <label className="sr-only" htmlFor={`reorder-quantity-${product.id}`}>Quantity — {product.name}, {purchaseUnit}</label>
              <input id={`reorder-quantity-${product.id}`} type="number" min="1" max={MAX_CART_QUANTITY} step="1" inputMode="numeric" value={quantity} onChange={(event) => {
                const nextQuantity = Math.max(1, Math.min(MAX_CART_QUANTITY, Math.trunc(Number(event.target.value)) || 1));
                setStagedQuantities((current) => ({ ...current, [product.sku]: nextQuantity }));
              }} />
              <button type="button" disabled={pendingSku !== null || quantity >= MAX_CART_QUANTITY} onClick={() => setStagedQuantities((current) => ({ ...current, [product.sku]: quantity + 1 }))} aria-label={`Increase ${product.name} quantity`}><Plus size={15} aria-hidden="true" /></button>
            </div>
            <div className="catalog-replenishment-action"><button type="button" onClick={() => onAddLastQuantity(product, quantity)} disabled={pendingSku !== null} aria-label={`Order ${quantityLabel} of ${product.name} again`}>Order again</button></div>
          </> : canManageCart ? <Link href={`/portal/supplies/${encodeURIComponent(product.slug)}`} className="catalog-replenishment-view-product">View product</Link> : <span className="catalog-replenishment-unavailable">View only</span>}
        </div>
      </li>;
    })}</ul>
  </section>;
};
