"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import type { PortalProduct } from "@/src/features/portal/types";
import { mutatePortalCartAction } from "@/src/features/portal/cart-actions";
import { MAX_CART_QUANTITY } from "@/src/features/portal/cart-policy";
import { usePortalContext } from "@/src/features/portal/portal-context";
import { resolveCatalogProductState } from "@/src/features/portal/catalog-product-state";
import { trackOperatorWorkspaceEvent } from "@/src/lib/analytics";

const purchaseUnitLabel = (packSize: string) => {
  const normalized = packSize.toLocaleLowerCase();
  for (const unit of ["case", "pack", "set", "bag", "pail", "box", "roll", "kit", "dozen", "each"]) {
    if (normalized.includes(unit)) return unit;
  }
  return "purchase unit";
};

const unitsPerPurchase = (packSize: string) => {
  const match = packSize.match(/(?:pack|case|set|kit|box|dozen)\s+of\s+(\d+)|^(\d+)\s+per\s+(?:case|pack|set|kit|box|dozen)/i);
  const count = Number(match?.[1] || match?.[2]);
  return Number.isInteger(count) && count > 1 ? count : null;
};

const pluralUnit = (unit: string, quantity: number) => quantity === 1 || unit === "each" ? unit : `${unit}s`;
const PURCHASE_SYNC_EVENT = "buddas:supply-purchase-synced";

export const SupplyPurchaseControl = ({ product, locationId, initialQuantity, canManageCart }: { product: PortalProduct; locationId: string; initialQuantity: number; canManageCart: boolean }) => {
  const { updateCount, user, permittedUnits } = usePortalContext();
  const [quantity, setQuantity] = useState(Math.max(1, initialQuantity));
  const [confirmedQuantity, setConfirmedQuantity] = useState(initialQuantity);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const productState = resolveCatalogProductState(product);
  const canOrder = canManageCart && productState.canOrder && Number.isFinite(product.price) && product.price >= 0;
  const analyticsContext = { role_category: user.role === "admin" ? "admin" as const : "franchisee" as const, location_scope_count: permittedUnits.length, location_scope: "active_unit" as const, route: "/portal/supplies" as const };
  const purchaseUnit = purchaseUnitLabel(product.packSize);
  const itemCount = unitsPerPurchase(product.packSize);
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const orderTotal = currency.format(product.price * quantity);

  useEffect(() => {
    const syncQuantity = (event: Event) => {
      const detail = (event as CustomEvent<{ sku: string; quantity: number }>).detail;
      if (detail?.sku !== product.sku) return;
      setConfirmedQuantity(detail.quantity);
      setQuantity(Math.max(1, detail.quantity));
    };
    window.addEventListener(PURCHASE_SYNC_EVENT, syncQuantity);
    return () => window.removeEventListener(PURCHASE_SYNC_EVENT, syncQuantity);
  }, [product.sku]);

  const saveQuantity = (requestedQuantity: number) => {
    if (pending || !canOrder) return;
    const nextQuantity = Math.max(1, Math.min(MAX_CART_QUANTITY, Math.trunc(requestedQuantity) || 1));
    const previousQuantity = confirmedQuantity;
    startTransition(async () => {
      setNotice("");
      try {
        const result = await mutatePortalCartAction({ locationId, sku: product.sku, quantity: nextQuantity });
        if (result.status === "error") {
          setNotice("This item could not be updated. Check your connection and working unit, then try again.");
          return;
        }
        const confirmedQuantity = result.items.find((item) => item.sku === product.sku)?.quantity ?? 0;
        setConfirmedQuantity(confirmedQuantity);
        setQuantity(Math.max(1, confirmedQuantity));
        window.dispatchEvent(new CustomEvent(PURCHASE_SYNC_EVENT, { detail: { sku: product.sku, quantity: confirmedQuantity } }));
        updateCount("cartItemCount", result.count);
        setNotice(`${confirmedQuantity} ${pluralUnit(purchaseUnit, confirmedQuantity)} of ${product.name} ${previousQuantity ? "updated in" : "added to"} current order.`);
        trackOperatorWorkspaceEvent(previousQuantity === 0 && confirmedQuantity > 0 ? "operator_supply_added" : confirmedQuantity === 0 ? "operator_supply_removed" : "operator_supply_quantity_changed", { ...analyticsContext, category: product.category, sku: product.sku, quantity: confirmedQuantity, availability_state: productState.code, lead_time_bucket: product.leadTimeDays <= 3 ? "up_to_3_days" : "4_plus_days", cart_item_count: result.count, purchase_path: "discovery" });
      } catch {
        setNotice("This item could not be updated. Check your connection and working unit, then try again.");
      }
    });
  };

  return <aside className="supply-purchase-dock" aria-label="Purchase this supply">
    <div className="supply-purchase-summary"><span>{productState.label}</span><strong>{Number.isFinite(product.price) && product.price >= 0 ? currency.format(product.price) : "Price unavailable"}</strong><small>per {purchaseUnit}</small></div>
    {canOrder ? <>
      <div className="supply-purchase-quantity"><span>Quantity ({pluralUnit(purchaseUnit, 2)})</span><div className="supply-purchase-stepper" aria-label={`${product.name} quantity in ${pluralUnit(purchaseUnit, 2)}`}><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={pending || quantity <= 1} aria-label={`Decrease ${product.name} quantity`}><Minus size={18} aria-hidden="true" /></button><output aria-live="polite" aria-label={`${product.name} quantity`}>{quantity}</output><button type="button" onClick={() => setQuantity((value) => Math.min(MAX_CART_QUANTITY, value + 1))} disabled={pending || quantity >= MAX_CART_QUANTITY} aria-label={`Increase ${product.name} quantity`}><Plus size={18} aria-hidden="true" /></button></div><p>{quantity} {pluralUnit(purchaseUnit, quantity)}{itemCount ? ` · ${quantity * itemCount} items` : ""} · {orderTotal}</p></div>
      <button type="button" className="supply-purchase-add" onClick={() => saveQuantity(quantity)} disabled={pending || confirmedQuantity === quantity}>{pending ? "Updating…" : confirmedQuantity === quantity ? <><Check size={17} aria-hidden="true" />{quantity} {pluralUnit(purchaseUnit, quantity)} in current order</> : <><ShoppingCart size={17} aria-hidden="true" />{confirmedQuantity ? "Update" : "Add"} {quantity} {pluralUnit(purchaseUnit, quantity)} — {orderTotal}</>}</button>
    </> : <span className="supply-purchase-unavailable">Ordering unavailable</span>}
    {confirmedQuantity > 0 ? <Link href="/portal/cart" className="supply-purchase-cart">View current order</Link> : null}
    <p role="status" aria-live="polite" className={notice ? "supply-purchase-notice" : "sr-only"}>{notice}</p>
  </aside>;
};
