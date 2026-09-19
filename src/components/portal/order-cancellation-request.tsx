"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import type { PortalOrder } from "@/src/features/portal/types";
import { cancelPortalOrderAction, type CancelPortalOrderResult } from "@/src/features/portal/actions";

type OrderCancellationRequestProps = {
  order: PortalOrder;
  locationId: string;
  locationName: string;
  compact?: boolean;
};

export const OrderCancellationRequest = ({
  order,
  locationId,
  locationName,
  compact = false,
}: OrderCancellationRequestProps) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<CancelPortalOrderResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => reasonRef.current?.focus());
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const restoreTriggerFocus = () => requestAnimationFrame(() => triggerRef.current?.focus());
  const close = () => dialogRef.current?.close();

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    restoreTriggerFocus();
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const next = await cancelPortalOrderAction(formData);
      setResult(next);
    });
  };

  return <>
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(true)}
      aria-label={`Request cancellation for order ${order.id}`}
      className={compact
        ? "order-mobile-cancel-link"
        : "shrink-0 rounded-xl border border-bds-orange/30 bg-bds-orange/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-bds-orange hover:bg-bds-orange/20 hover:border-bds-orange/40 focus:outline-none focus:ring-2 focus:ring-bds-orange"}
    >
      Request cancellation
    </button>

    <dialog
      ref={dialogRef}
      aria-labelledby={`cancel-dialog-title-${order.id}`}
      aria-describedby={`cancel-dialog-description-${order.id}`}
      className="order-cancellation-dialog"
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClose={handleClose}
    >
      <div className="order-cancellation-dialog__surface">
        <div className="order-cancellation-dialog__heading">
          <span className="order-cancellation-dialog__icon"><AlertCircle aria-hidden="true" /></span>
          <div>
            <h2 id={`cancel-dialog-title-${order.id}`}>Request cancellation</h2>
            <p>Ask the fulfillment owner to review cancellation of this order.</p>
          </div>
        </div>

        {result?.status === "success" ? <div className="order-cancellation-result" role="status" aria-live="polite">
          <strong>Request submitted</strong>
          <p>{result.message}</p>
          <button type="button" className="btn-primary" onClick={() => { close(); router.refresh(); }}>Return to order</button>
        </div> : <>
          <div id={`cancel-dialog-description-${order.id}`} className="order-cancellation-dialog__body">
            <p className="order-cancellation-dialog__notice">You are requesting cancellation of the entire order <strong>{order.id}</strong>. This does not cancel the order immediately or confirm that supplier work stopped.</p>
            <dl>
              <div><dt>Target unit</dt><dd>{locationName} ({locationId})</dd></div>
              <div><dt>Order ID</dt><dd>{order.id}</dd></div>
              <div><dt>Invoice ID</dt><dd>{order.invoiceId}</dd></div>
              <div><dt>Total value</dt><dd>${order.total.toFixed(2)}</dd></div>
              <div className="order-cancellation-dialog__lines"><dt>Line items ({order.items.length})</dt><dd>{order.items.map((item, index) => <span key={`${item.sku}-${index}`}>{item.quantity} × {item.name} <strong>${(item.quantity * item.price).toFixed(2)}</strong></span>)}</dd></div>
            </dl>
            <p className="order-cancellation-dialog__notice"><strong>What happens next:</strong> the fulfillment owner reviews this request. Item-level and partial cancellation are not available through this portal. Any fulfillment or payment changes remain pending until an outcome is recorded.</p>
          </div>
          <form onSubmit={submit} className="order-cancellation-dialog__form">
            <input type="hidden" name="orderId" value={order.id} />
            <label>
              <span>Cancellation reason</span>
              <input ref={reasonRef} type="text" name="reason" value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={500} placeholder="State the operational reason" />
            </label>
            {result?.status === "error" ? <p role="alert" className="order-cancellation-dialog__error">{result.message}</p> : null}
            <div>
              <button type="button" className="btn-outline" onClick={close} disabled={isPending}>Keep order</button>
              <button type="submit" className="order-cancellation-dialog__confirm" disabled={isPending}>{isPending ? "Submitting…" : "Submit cancellation request"}</button>
            </div>
          </form>
        </>}
      </div>
    </dialog>
  </>;
};
