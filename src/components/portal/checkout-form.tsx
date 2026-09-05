"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Store, AlertCircle, CheckCircle2, X } from "lucide-react";
import { submitReviewedOrderAction } from "@/src/features/portal/actions";

export type CheckoutOrderItem = { sku: string; name: string; price: number; quantity: number; packSize?: string };
export type CheckoutFormProps = {
  locationId: string;
  locationName: string;
  orderItems: CheckoutOrderItem[];
  total: number;
  reviewFingerprint: string;
  destinationParam?: string;
};
const money = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export const CheckoutForm = ({ locationId, locationName, orderItems, total, reviewFingerprint, destinationParam }: CheckoutFormProps) => {
  const [hasConfirmedUnit, setHasConfirmedUnit] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitReviewedOrderAction, { message: "" });
  const quantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const error = state.message || (destinationParam === "unconfirmed" ? "Confirm the receiving unit before placing your order." : "");

  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasConfirmedUnit(event.target.checked);
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      handleCloseConfirmModal();
    }
  };

  return (
    <form action={formAction} className="checkout-review">
      <input type="hidden" name="reviewFingerprint" value={reviewFingerprint} />
      <div className="checkout-progress" aria-label="Order progress">
        <Link href="/portal/cart"><CheckCircle2 size={16} aria-hidden="true" /> Cart</Link>
        <ArrowRight size={14} aria-hidden="true" />
        <span aria-current="step">Review &amp; place order</span>
        <ArrowRight size={14} aria-hidden="true" />
        <span>Confirmation</span>
      </div>

      {error ? (
        <div className="checkout-error" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div><p>{error}</p><a href="/portal/checkout" className="cart-text-link">Reload order review</a></div>
        </div>
      ) : null}

      <div className="checkout-layout">
        <div className="checkout-details">
          <section className="checkout-section" aria-labelledby="receiving-unit-title">
            <div className="checkout-section-heading"><span className="checkout-step">01</span><h2 id="receiving-unit-title">Receiving unit</h2></div>
            <div className="checkout-destination">
              <Store size={22} aria-hidden="true" />
              <div><p className="checkout-unit-name">{locationName}</p><p>Unit {locationId}</p></div>
            </div>
            <p className="checkout-supporting">This order will be assigned to this franchise unit. To order for another unit, switch your working unit before reviewing its cart.</p>
          </section>

          <section className="checkout-section" aria-labelledby="review-items-title">
            <div className="checkout-section-heading"><span className="checkout-step">02</span><h2 id="review-items-title">Review supply items</h2><Link href="/portal/cart" className="cart-text-link">Edit cart</Link></div>
            <p className="checkout-item-count">{orderItems.length} product{orderItems.length === 1 ? "" : "s"} · {quantity} order unit{quantity === 1 ? "" : "s"}</p>
            <ul className="checkout-items">
              {orderItems.map((item) => (
                <li key={item.sku}>
                  <div className="checkout-item-description"><p className="cart-sku">SKU {item.sku}</p><h3>{item.name}</h3>{item.packSize ? <p>Pack size: {item.packSize}</p> : null}</div>
                  <dl className="checkout-item-math">
                    <div><dt>Quantity</dt><dd>{item.quantity}</dd></div>
                    <div><dt>Unit price</dt><dd>{money(item.price)}</dd></div>
                    <div><dt>Line subtotal</dt><dd>{money(item.price * item.quantity)}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>

          <section className="checkout-section checkout-terms" aria-labelledby="additional-costs-title">
            <div className="checkout-section-heading"><span className="checkout-step">03</span><h2 id="additional-costs-title">Costs &amp; fulfillment</h2></div>
            <p>Shipping and tax are not included in the item subtotal. Confirm additional charges, billing terms, and delivery timing with Operations Support before placing your order.</p>
            <Link href="/portal/support" className="cart-text-link">Contact Operations Support <ArrowRight size={15} aria-hidden="true" /></Link>
          </section>
          <Link href="/portal/cart" className="cart-text-link"><ArrowLeft size={16} aria-hidden="true" /> Back to cart</Link>
        </div>

        <section className="checkout-submit-panel" aria-labelledby="place-order-title">
          <div className="checkout-summary-header"><p className="cart-label">Final review</p><h2 id="place-order-title">Ready to place your order?</h2></div>
          <div className="checkout-summary-content">
            <dl className="cart-costs">
              <div><dt>Supply items ({quantity})</dt><dd>{money(total)}</dd></div>
              <div><dt>Freight &amp; handling</dt><dd>Not quoted</dd></div>
              <div><dt>Tax</dt><dd>Not available</dd></div>
            </dl>
            <div className="cart-subtotal"><span>Item subtotal</span><strong>{money(total)}</strong></div>
            <p className="checkout-subtotal-note">USD · excludes shipping and tax</p>
            <label className="checkout-consent">
              <input
                type="checkbox"
                name="destinationConfirmationInline"
                value={locationId}
                checked={hasConfirmedUnit}
                onChange={handleCheckboxChange}
                tabIndex={0}
                aria-label={`Confirm order for ${locationName} unit ${locationId}`}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-bds-teal-dark/30 accent-bds-teal text-bds-teal focus:outline-none focus:ring-2 focus:ring-bds-teal focus:ring-offset-1"
              />
              <span>I confirm this order is for <strong>{locationName}</strong> <span className="checkout-consent-unit">Unit {locationId}</span></span>
            </label>
            <p className="checkout-submission-note" id="submission-description">Placing this order submits the listed supplies and quantities for the confirmed unit.</p>
            <button
              type="button"
              onClick={handleOpenConfirmModal}
              tabIndex={0}
              aria-label="Review and proceed to order placement modal"
              className="btn-primary checkout-place-order"
              disabled={pending || Boolean(state.message)}
              aria-describedby="submission-description"
            >
              {pending ? "Placing your order…" : "Place supply order"}<ArrowRight size={18} aria-hidden="true" />
            </button>
            <p className="checkout-after-submit">{pending ? "Please wait for your order confirmation." : "After acceptance, you’ll receive an order reference."}</p>
            <span className="sr-only" role="status" aria-live="polite">{pending ? "Submitting your supply order. Please wait." : ""}</span>
          </div>
        </section>
      </div>

      {/* High-Consequence Confirmation Modal */}
      {isConfirmModalOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          onKeyDown={handleDialogKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-bds-teal-dark/20 bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={handleCloseConfirmModal}
              tabIndex={0}
              aria-label="Close confirmation dialog and return to review"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-bds-cocoa/60 hover:bg-bds-cream hover:text-bds-teal-dark focus:outline-none focus:ring-2 focus:ring-bds-teal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-bds-teal/15 p-2.5 text-bds-teal-dark">
                <Store className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 id="confirm-dialog-title" className="font-heading text-lg font-bold text-bds-teal-dark">
                  Confirm Financial Supply Order
                </h3>
                <p className="text-xs text-bds-cocoa/70">
                  High-consequence order placement and binding invoice commitment
                </p>
              </div>
            </div>

            <div id="confirm-dialog-description" className="mt-4 space-y-3 text-xs text-bds-cocoa/80">
              <p className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 leading-relaxed text-amber-900">
                Submitting this order creates a wholesale supply order for <strong>{locationName}</strong>. Confirm the unit, quantities, and item costs below before submitting.
              </p>

              <div className="space-y-2.5 rounded-2xl border border-bds-teal-dark/10 bg-bds-cream/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bds-cocoa/75">Target Unit</span>
                  <span className="font-bold text-bds-teal-dark">
                    {locationName} (Unit: {locationId})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bds-cocoa/75">Total Line Items</span>
                  <span className="font-bold text-bds-teal-dark">
                    {quantity} units ({orderItems.length} SKUs)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bds-cocoa/75">Item Subtotal</span>
                  <span className="text-sm font-bold text-bds-teal-dark">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-bds-teal-dark/10 pt-2">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-bds-cocoa/75">
                    Order Items Breakdown
                  </span>
                  <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
                    {orderItems.map((item) => (
                      <div key={item.sku} className="flex items-center justify-between text-[11px] text-bds-cocoa/85">
                        <span className="truncate pr-2">
                          {item.quantity}× {item.name} ({item.sku})
                        </span>
                        <span className="font-semibold text-bds-teal-dark">
                          {money(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-bds-teal-dark/10 pt-2 text-[11px] text-bds-cocoa/75">
                  <span>Shipping and tax are not included. Confirm additional charges, billing terms, and delivery timing with Operations Support.</span>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-bds-teal-dark/10 bg-bds-cream/30 p-3.5 text-xs text-bds-teal-dark">
                  <input
                    type="checkbox"
                    name="destinationConfirmation"
                    value={locationId}
                    checked={hasConfirmedUnit}
                    onChange={handleCheckboxChange}
                    required
                    tabIndex={0}
                    aria-label={`Verify and confirm supply order routing for ${locationName} unit ${locationId}`}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-bds-teal-dark/30 accent-bds-teal text-bds-teal focus:outline-none focus:ring-2 focus:ring-bds-teal focus:ring-offset-1"
                  />
                  <span>
                    <strong>I verify this supply order is for {locationName} (unit {locationId})</strong>
                    <span className="mt-0.5 block text-[11px] text-bds-cocoa/75">
                      Warehouse dispatch and invoice allocation will be routed specifically to this location.
                    </span>
                  </span>
                </label>

                <div className="flex flex-col-reverse items-center justify-end gap-2 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCloseConfirmModal}
                    tabIndex={0}
                    aria-label="Return to cart review and cancel order placement"
                    className="w-full rounded-xl border border-bds-teal-dark/20 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-bds-teal-dark transition-colors hover:bg-bds-cream focus:outline-none focus:ring-2 focus:ring-bds-teal sm:w-auto"
                  >
                    Back to review
                  </button>
                  <button
                    type="submit"
                    disabled={!hasConfirmedUnit || pending}
                    tabIndex={0}
                    aria-label={`Authorize and place order for ${money(total)}`}
                    className="w-full rounded-xl bg-bds-teal-dark px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-bds-teal-ink focus:outline-none focus:ring-2 focus:ring-bds-teal disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {pending ? "Placing your order…" : <span>Authorize &amp; Place Order (${total.toFixed(2)})</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
