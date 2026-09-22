"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Headphones, Minus, Plus, ShoppingBag, ShoppingCart, X } from "lucide-react";
import type { PortalProduct } from "@/src/features/portal/types";
import { CatalogProductVisual } from "@/src/components/portal/catalog-product-visual";
import { MAX_CART_QUANTITY } from "@/src/features/portal/cart-policy";
import { usePortalContext } from "@/src/features/portal/portal-context";
import { trackOperatorWorkspaceEvent } from "@/src/lib/analytics";

type CurrentOrderLine = { product: PortalProduct; quantity: number };
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const unitLabel = (packSize: string) => {
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
const pluralUnit = (unit: string, quantity: number) => quantity === 1 || unit === "each" ? unit : `${unit}s`;
const orderUnitSummary = (items: CurrentOrderLine[]) => {
  const units = new Map<string, number>();
  for (const { product, quantity } of items) {
    const unit = unitLabel(product.packSize);
    units.set(unit, (units.get(unit) ?? 0) + quantity);
  }
  return [...units.entries()].map(([unit, quantity]) => `${quantity} ${pluralUnit(unit, quantity)}`).join(" · ");
};
const unitsPerPurchase = (packSize: string) => {
  const match = packSize.match(/(?:pack|case|set|kit|box)\s+of\s+(\d+)|^(\d+)\s+per\s+(?:case|pack|set|kit|box)/i);
  const count = Number(match?.[1] || match?.[2]);
  return Number.isInteger(count) && count > 1 ? count : null;
};

export const CatalogCurrentOrder = ({ locationName, items, subtotal, pendingSku, notice, onUpdate }: { locationName: string; items: CurrentOrderLine[]; subtotal: number; pendingSku: string | null; notice: string; onUpdate: (product: PortalProduct, quantity: number) => void }) => {
  const { user, permittedUnits } = usePortalContext();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const unitSummary = orderUnitSummary(items);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  const close = () => { setOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()); };
  const openOrder = () => {
    setOpen(true);
    trackOperatorWorkspaceEvent("operator_supply_current_order_opened", {
      role_category: user.role === "admin" ? "admin" : "franchisee",
      location_scope_count: permittedUnits.length,
      location_scope: "active_unit",
      route: "/portal/supplies",
      cart_item_count: itemCount,
      product_count: items.length,
    });
  };

  return <aside className="catalog-cart-summary" aria-label="Current supply order">
    <section className="catalog-order-rail-panel" aria-labelledby="catalog-order-rail-title"><header><div className="catalog-order-rail-heading"><ShoppingCart size={26} aria-hidden="true" /><div><p>Current order</p><h2 id="catalog-order-rail-title">{items.length ? `${items.length} ${items.length === 1 ? "item" : "items"} · ${unitSummary}` : "Your order is empty."}</h2></div></div><span>{locationName}</span></header>{items.length ? <ul>{items.map(({ product, quantity }) => {
      const unit = unitLabel(product.packSize);
      const disabled = pendingSku !== null;
      return <li key={product.sku}><CatalogProductVisual product={product} compactFallback className="catalog-order-rail-image" sizes="72px" /><div><strong>{product.name}</strong><span>{product.packSize} · {money(product.price)} per {unit}</span></div><strong className="catalog-order-rail-line-total">{money(product.price * quantity)}</strong><div className="catalog-order-rail-actions"><div className="catalog-order-rail-stepper" role="group" aria-label={`${product.name} quantity`}><button type="button" disabled={disabled || quantity <= 1} aria-label={`Decrease ${product.name} ${unit} quantity`} onClick={() => onUpdate(product, quantity - 1)}><Minus size={15} aria-hidden="true" /></button><output aria-label={`${product.name} quantity`}>{quantity} {pluralUnit(unit, quantity)}</output><button type="button" disabled={disabled || quantity >= MAX_CART_QUANTITY} aria-label={`Increase ${product.name} ${unit} quantity`} onClick={() => onUpdate(product, quantity + 1)}><Plus size={15} aria-hidden="true" /></button></div><button type="button" className="catalog-order-rail-remove" disabled={disabled} onClick={() => onUpdate(product, 0)} aria-label={`Remove ${product.name} from current order`}><X size={15} aria-hidden="true" /><span>Remove</span></button></div></li>;
    })}</ul> : <p className="catalog-order-rail-empty">Add supplies from the catalog to get started.</p>}<footer><dl><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div></dl><small>Shipping and tax are calculated later when applicable.</small><Link href="/portal/cart">Review order</Link></footer>{notice ? <p className="catalog-order-rail-notice" role="status">{notice}</p> : null}</section>
    <section className="catalog-order-help" aria-labelledby="catalog-order-help-title"><Headphones size={28} aria-hidden="true" /><div><h2 id="catalog-order-help-title">Need help with supplies?</h2><p>Contact your Budda&apos;s support team.</p><Link href="/portal/support">Get support <ArrowRight size={15} aria-hidden="true" /></Link></div></section>
    <button ref={triggerRef} type="button" className="catalog-current-order-trigger" onClick={openOrder} aria-haspopup="dialog" aria-expanded={open} aria-controls="catalog-current-order-drawer"><span><small>{pendingSku ? "Saving order…" : "Current order"}</small><strong>{items.length ? `${itemCount} ${itemCount === 1 ? "item" : "items"} · ${money(subtotal)}` : "Your order is empty."}</strong></span><span><ShoppingBag size={18} aria-hidden="true" />{items.length ? "Review order" : "Open order"}</span></button>
    <dialog ref={dialogRef} id="catalog-current-order-drawer" className="catalog-order-drawer" aria-labelledby="catalog-current-order-title" onClose={close}>
      <section className="catalog-order-drawer-surface">
        <header><div><p className="catalog-kicker">Current order</p><h2 id="catalog-current-order-title">Supply order</h2></div><button type="button" className="touch-target catalog-order-drawer-close" onClick={close} aria-label="Close current order"><X size={20} aria-hidden="true" /></button></header>
        {items.length ? <ul>{items.map(({ product, quantity }) => {
          const unit = unitLabel(product.packSize);
          const itemEquivalent = unitsPerPurchase(product.packSize);
          const disabled = pendingSku !== null;
          return <li key={product.sku}><div><strong>{product.name}</strong><span>{quantity} {pluralUnit(unit, quantity)}{itemEquivalent ? ` · ${quantity * itemEquivalent} items` : ""} · {money(product.price * quantity)}</span><small>{product.packSize}</small></div><div className="catalog-order-stepper"><button type="button" disabled={disabled} aria-label={`Decrease ${product.name} ${unit} quantity`} onClick={() => onUpdate(product, Math.max(0, quantity - 1))}><Minus size={16} aria-hidden="true" /></button><output aria-label={`${product.name} quantity`}>{quantity} {pluralUnit(unit, quantity)}</output><button type="button" disabled={disabled || quantity >= MAX_CART_QUANTITY} aria-label={`Increase ${product.name} ${unit} quantity`} onClick={() => onUpdate(product, Math.min(MAX_CART_QUANTITY, quantity + 1))}><Plus size={16} aria-hidden="true" /></button></div></li>;
        })}</ul> : <p className="catalog-order-rail-empty">Add supplies from the catalog to get started.</p>}
        {notice ? <p className="catalog-order-drawer-notice" role="status">{notice}</p> : null}
        <footer><dl><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div></dl><Link href="/portal/cart" onClick={close}>Review order</Link></footer>
      </section>
    </dialog>
  </aside>;
};
