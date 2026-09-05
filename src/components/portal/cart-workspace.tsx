"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, RotateCcw, Store, Trash2, AlertCircle, Truck } from "lucide-react";
import { mutatePortalCartAction } from "@/src/features/portal/cart-actions";
import { MAX_CART_QUANTITY } from "@/src/features/portal/cart-policy";
import { usePortalContext } from "@/src/features/portal/portal-context";

export type CartWorkspaceItem = {
  sku: string;
  quantity: number;
  product: {
    sku: string;
    name: string;
    price: number;
    packSize: string;
    slug?: string;
    category?: string;
    description?: string;
    leadTimeDays?: number;
  };
};
type Mutation = { item: CartWorkspaceItem; quantity: number; restoring?: boolean };
export type CartWorkspaceProps = { locationId: string; locationName: string; items: CartWorkspaceItem[]; removedItem?: CartWorkspaceItem | null };
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const CartWorkspace = ({ locationId, locationName, items: initialItems, removedItem = null }: CartWorkspaceProps) => {
  const { updateCount } = usePortalContext();
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<{ sku: string; value: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [removed, setRemoved] = useState<CartWorkspaceItem | null>(removedItem);
  const [failure, setFailure] = useState<{ message: string; mutation: Mutation } | null>(null);
  const inFlight = useRef(false);
  const undoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setItems(initialItems); }, [initialItems]);
  useEffect(() => { setRemoved(removedItem); }, [removedItem]);
  useEffect(() => {
    updateCount("cartItemCount", items.reduce((count, item) => count + item.quantity, 0));
  }, [items, updateCount]);

  const mutate = useCallback(async (mutation: Mutation) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(mutation.item.sku);
    setFailure(null);
    setNotice("Updating cart…");
    startTransition(async () => {
    try {
      const result = await mutatePortalCartAction({ locationId, sku: mutation.item.sku, quantity: mutation.quantity });
      if (result.status === "error") {
        setFailure({ message: result.message, mutation });
        setNotice("");
        return;
      }
      setItems(result.items);
      updateCount("cartItemCount", result.count);
      setDraft(null);
      if (mutation.quantity === 0) {
        setRemoved(mutation.item);
        setNotice(mutation.item.product.name + " removed from cart.");
        requestAnimationFrame(() => undoRef.current?.focus());
      } else if (mutation.restoring) {
        setRemoved(null);
        setNotice(mutation.item.product.name + " restored to cart.");
      } else {
        setNotice("Quantity updated to " + mutation.quantity + ". Cart subtotal " + money(result.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)) + ".");
      }
    } catch {
      setFailure({ message: "We couldn’t update your cart. Check your connection and try again.", mutation });
      setNotice("");
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
    });
  }, [locationId, updateCount]);

  const draftQuantity = draft && /^\d+$/.test(draft.value) ? Number(draft.value) : NaN;
  const draftValid = Number.isInteger(draftQuantity) && draftQuantity >= 1 && draftQuantity <= MAX_CART_QUANTITY;
  const dirty = Boolean(draft && draft.value !== String(items.find((item) => item.sku === draft.sku)?.quantity));

  // Typed quantities save automatically; checkout waits for server confirmation.
  useEffect(() => {
    if (!draft || !dirty || !draftValid || busy || failure) return;
    const item = items.find((candidate) => candidate.sku === draft.sku);
    if (!item) return;
    const timer = setTimeout(() => { void mutate({ item, quantity: draftQuantity }); }, 650);
    return () => clearTimeout(timer);
  }, [draft, dirty, draftValid, draftQuantity, busy, failure, items, mutate]);

  const subtotal = items.reduce((sum, item) => sum + Math.round(item.product.price * 100) * item.quantity, 0) / 100;
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const skuCount = items.length;
  const blocked = Boolean(busy || dirty || failure);

  return (
    <div className="cart-workspace">
      <section className="cart-unit" aria-label="Receiving franchise unit">
        <Store size={20} aria-hidden="true" />
        <div><p className="cart-label">Ordering for</p><p className="cart-unit-name">{locationName} <span>Unit {locationId}</span></p></div>
        <p className="cart-unit-note">You’ll confirm this unit before placing your order.</p>
      </section>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{notice}</p>
      {removed ? (
        <div className="cart-feedback">
          <p><Check size={18} aria-hidden="true" /><span><strong>{removed.product.name}</strong> removed.</span></p>
          <button ref={undoRef} type="button" disabled={Boolean(busy || dirty)} onClick={() => void mutate({ item: removed, quantity: removed.quantity, restoring: true })}><RotateCcw size={16} aria-hidden="true" /> Undo removal</button>
        </div>
      ) : null}
      {failure ? (
        <div className="cart-feedback cart-feedback-error">
          <p role="alert"><AlertCircle size={18} aria-hidden="true" /><span>{failure.message}</span></p>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={Boolean(busy)} onClick={() => void mutate(failure.mutation)}>Retry</button>
            <button type="button" onClick={() => { setFailure(null); setDraft(null); }}>Keep saved cart</button>
          </div>
        </div>
      ) : null}
      {items.length === 0 ? (
        <section className="cart-empty">
          <h2>Your cart is ready for supplies</h2>
          <p>Add approved products for {locationName}. You’ll review quantities and costs here before checkout.</p>
          <Link href="/portal/supplies" className="btn-primary">Browse supplies <ArrowRight size={18} aria-hidden="true" /></Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-lines" aria-labelledby="cart-lines-title">
            <div className="cart-lines-heading">
              <div><h2 id="cart-lines-title">Supply items</h2><p>{skuCount} product{skuCount === 1 ? "" : "s"} · {quantity} case{quantity === 1 ? "" : "s"} in cart</p></div>
              <Link href="/portal/supplies" className="cart-text-link"><Plus size={16} aria-hidden="true" /> Add supplies</Link>
            </div>
            <ul>
              {items.map((item) => {
                const editing = draft?.sku === item.sku;
                const invalid = editing && !draftValid;
                const controlsDisabled = Boolean(busy) || (dirty && !editing);
                const inputId = "quantity-" + item.sku;
                const helpId = "quantity-help-" + item.sku;
                const displayedQuantity = editing ? draftQuantity : item.quantity;
                return (
                  <li key={item.sku} className="cart-line">
                    <div className="cart-product">
                      <div className="cart-product-meta">
                        {item.product.category ? <span className="cart-category">{item.product.category}</span> : null}
                        <p className="cart-sku">SKU {item.sku}</p>
                      </div>
                      <h3>{item.product.slug ? <Link href={"/portal/supplies/" + item.product.slug}>{item.product.name}</Link> : item.product.name}</h3>
                      {item.product.description ? <p className="cart-description">{item.product.description}</p> : null}
                      <p className="cart-pack">Pack size: <strong>{item.product.packSize}</strong></p>
                      <p className="cart-unit-price">{money(item.product.price)} <span>per case</span></p>
                      {typeof item.product.leadTimeDays === "number" ? <p className="cart-lead-time">Lead time: {item.product.leadTimeDays} business day{item.product.leadTimeDays === 1 ? "" : "s"}</p> : null}
                    </div>
                    <div className="cart-quantity">
                      <label className="cart-label" htmlFor={inputId}>Cases for this unit</label>
                      <div className="cart-stepper">
                        <button type="button" disabled={controlsDisabled || displayedQuantity <= 1 || Boolean(invalid)} aria-label={"Decrease " + item.product.name + " quantity"} onClick={() => void mutate({ item, quantity: Math.max(1, displayedQuantity - 1) })}><Minus size={16} aria-hidden="true" /></button>
                        <input id={inputId} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={editing ? draft.value : item.quantity} readOnly={controlsDisabled} aria-busy={busy === item.sku || undefined} aria-label={"Order quantity for " + item.product.name} aria-invalid={invalid || undefined} aria-describedby={helpId} onFocus={(event) => event.currentTarget.select()} onChange={(event) => { setDraft({ sku: item.sku, value: event.target.value }); setFailure(null); }} onKeyDown={(event) => {
                          if (event.key === "Escape") { setDraft(null); setFailure(null); }
                          if (event.key === "Enter" && editing && draftValid) { event.preventDefault(); void mutate({ item, quantity: draftQuantity }); }
                        }} />
                        <button type="button" disabled={controlsDisabled || displayedQuantity >= MAX_CART_QUANTITY || Boolean(invalid)} aria-label={"Increase " + item.product.name + " quantity"} onClick={() => void mutate({ item, quantity: Math.min(MAX_CART_QUANTITY, displayedQuantity + 1) })}><Plus size={16} aria-hidden="true" /></button>
                      </div>
                      <p id={helpId} className={invalid ? "cart-field-error" : "cart-quantity-help"}>{invalid ? "Enter 1–" + MAX_CART_QUANTITY + ". Use Remove to delete." : busy === item.sku ? "Saving quantity…" : "Changes save automatically."}</p>
                    </div>
                    <div className="cart-line-total">
                      <p className="cart-label">Line subtotal</p><p className="cart-line-amount">{money(item.product.price * item.quantity)}</p>
                      <p className="cart-line-count">{displayedQuantity} case{displayedQuantity === 1 ? "" : "s"}</p>
                      <button type="button" className="cart-remove" disabled={controlsDisabled} onClick={() => void mutate({ item, quantity: 0 })} aria-label={"Remove " + item.product.name + " from cart"}><Trash2 size={14} aria-hidden="true" /> Remove</button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="cart-lines-footer"><p>Quantities refer to the pack or size shown for each product.</p><Link className="cart-text-link" href="/portal/supplies"><ArrowLeft size={16} aria-hidden="true" /> Continue shopping</Link></div>
          </section>
          <section className="cart-summary" aria-labelledby="cart-summary-title">
            <div className="cart-summary-top"><p className="cart-label">Before you order</p><h2 id="cart-summary-title">Order summary</h2></div>
            <div className="cart-summary-body">
              <div className="cart-summary-unit">
                <div className="cart-summary-unit-head">
                  <Store size={18} aria-hidden="true" />
                  <div>
                    <p className="cart-label">Unit receiving this order</p>
                    <p className="cart-summary-unit-name">{locationName}</p>
                  </div>
                </div>
                <p className="cart-summary-unit-code">Unit code: {locationId}</p>
              </div>
              <dl className="cart-costs"><div><dt>Merchandise subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Freight &amp; handling</dt><dd>Not quoted</dd></div><div><dt>Tax</dt><dd>Not available</dd></div></dl>
              <div className="cart-subtotal"><span>Current item subtotal</span><strong>{money(subtotal)}</strong></div>
              <p className="cart-cost-note">USD. Shipping and tax are not included because the current supply feed does not provide them here.</p>
              {blocked ? <button type="button" disabled className="btn-primary cart-review" aria-describedby="cart-checkout-note">{busy ? "Updating cart…" : "Continue to final review"}<ArrowRight size={18} aria-hidden="true" /></button> : <Link href="/portal/checkout" className="btn-primary cart-review" aria-describedby="cart-checkout-note">Continue to final review<ArrowRight size={18} aria-hidden="true" /></Link>}
              <p id="cart-checkout-note" className="cart-checkout-note">{failure ? "Resolve the cart update before continuing." : dirty ? "Your quantity change must finish saving before continuing." : "No order is placed at this step."}</p>
            </div>
            <div className="cart-summary-footer"><span>Need help with this order?</span><Link className="cart-text-link" href="/portal/support"><Truck size={14} aria-hidden="true" /> Operations Support</Link></div>
          </section>
        </div>
      )}
    </div>
  );
};
