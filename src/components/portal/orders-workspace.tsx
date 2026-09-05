"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bookmark,
  BookmarkPlus,
  Clock,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import type { PortalOrder } from "@/src/features/portal/types";
import { TableLine } from "@/src/components/portal/table-line";
import {
  canTransitionOrderStatus,
  getOrderStatus,
  getOrderStatusAnalytics,
  getOrderStatusAccessibleLabel,
  getOrderStatusNotification,
  isOrderInMotion,
  isOrderTerminal,
  ORDER_STATUS_IDS,
  requiresOrderOperatorAction,
} from "@/src/features/portal/order-status";
import { cancelPortalOrderAction } from "@/src/features/portal/actions";
import { trackFunnelEvent } from "@/src/lib/analytics";
import { formatPortalDate } from "@/src/features/portal/date-time";
import {
  areOrderCriteriaEqual,
  deleteCustomView,
  loadCustomViews,
  saveCustomView,
  SYSTEM_ORDER_VIEWS,
  type OrderSortMode,
  type OrderViewCriteria,
  type OrderViewMode,
  type SavedOrderView,
} from "@/src/features/portal/saved-views";

type OrderView = OrderViewMode;
type OrderSort = OrderSortMode;

const isOrderPastDue = (order: PortalOrder): boolean => {
  if (isOrderTerminal(order.status)) return false;

  const eta = new Date(order.eta);
  if (Number.isNaN(eta.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eta < today;
};

const isOrderException = (order: PortalOrder): boolean =>
  requiresOrderOperatorAction(order.status) || isOrderPastDue(order);

const getOrderExceptionLabel = (order: PortalOrder): string | null => {
  if (requiresOrderOperatorAction(order.status)) {
    return getOrderStatusNotification(order.status).title;
  }
  return isOrderPastDue(order) ? "Shipment timing is past ETA" : null;
};

export const OrdersWorkspace = ({
  orders,
  locationId = "default",
  locationName,
  initialOrderId,
  initialView = "all",
}: {
  orders: PortalOrder[];
  locationId?: string;
  locationName: string;
  initialOrderId?: string;
  initialView?: "all" | "in-motion";
}) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PortalOrder["status"] | "ALL">("ALL");
  const [view, setView] = useState<OrderView>(initialView);
  const [sort, setSort] = useState<OrderSort>("newest");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders.find((order) => order.id === initialOrderId)?.id ?? orders[0]?.id ?? null);

  const [customViews, setCustomViews] = useState<SavedOrderView[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [lastDeletedView, setLastDeletedView] = useState<SavedOrderView | null>(null);
  const [undoNotice, setUndoNotice] = useState<string | null>(null);

  useEffect(() => {
    setCustomViews(loadCustomViews<SavedOrderView>("orders", locationId));
  }, [locationId]);

  const currentCriteria = useMemo<OrderViewCriteria>(
    () => ({
      query,
      statusFilter,
      view,
      sort,
    }),
    [query, statusFilter, view, sort],
  );

  const activeMatchedView = useMemo(() => {
    const all = [...SYSTEM_ORDER_VIEWS, ...customViews];
    return all.find((item) => areOrderCriteriaEqual(item.criteria, currentCriteria)) ?? null;
  }, [customViews, currentCriteria]);

  const isDefaultView = useMemo(
    () => areOrderCriteriaEqual(currentCriteria, SYSTEM_ORDER_VIEWS[0].criteria),
    [currentCriteria],
  );

  const handleApplyCriteria = (criteria: OrderViewCriteria) => {
    setQuery(criteria.query);
    setStatusFilter(criteria.statusFilter);
    setView(criteria.view);
    setSort(criteria.sort);
  };

  const handleResetToDefault = () => {
    handleApplyCriteria(SYSTEM_ORDER_VIEWS[0].criteria);
  };

  const handleOpenSaveModal = () => {
    const initialName = query.trim()
      ? `Search: ${query.trim()}`
      : statusFilter !== "ALL"
        ? `${getOrderStatus(statusFilter).label} Orders`
        : view !== "all"
          ? `${view === "in-motion" ? "In Motion" : "Needs Attention"} Custom`
          : "Custom View";
    setNewViewName(initialName);
    setIsSaveModalOpen(true);
  };

  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
    setNewViewName("");
  };

  const handleSaveCustomView = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = newViewName.trim();
    if (!trimmedName) return;

    const newView: SavedOrderView = {
      id: `ord-view-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmedName,
      isSystem: false,
      criteria: { ...currentCriteria },
    };

    const updated = saveCustomView<SavedOrderView>("orders", locationId, newView);
    setCustomViews(updated);
    handleCloseSaveModal();
  };

  const handleDeleteCustomView = (viewId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const target = customViews.find((v) => v.id === viewId);
    const updated = deleteCustomView<SavedOrderView>("orders", locationId, viewId);
    setCustomViews(updated);
    if (target) {
      setLastDeletedView(target);
      setUndoNotice(`View "${target.name}" removed.`);
    }
  };

  const handleUndoDeleteView = () => {
    if (!lastDeletedView) return;
    const restored = saveCustomView<SavedOrderView>("orders", locationId, lastDeletedView);
    setCustomViews(restored);
    setUndoNotice(`Restored view "${lastDeletedView.name}".`);
    setLastDeletedView(null);
  };

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders
      .filter((order) => {
        const matchesQuery = !normalizedQuery
          || order.id.toLowerCase().includes(normalizedQuery)
          || order.invoiceId.toLowerCase().includes(normalizedQuery);
        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
        const matchesView = view === "all"
          || (view === "in-motion" && isOrderInMotion(order.status))
          || (view === "needs-attention" && isOrderException(order));

        return matchesQuery && matchesStatus && matchesView;
      })
      .sort((a, b) => {
        if (sort === "highest-total") return b.total - a.total;
        const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort === "newest" ? difference : -difference;
      });
  }, [orders, query, sort, statusFilter, view]);

  const selectedOrder = visibleOrders.find((order) => order.id === selectedOrderId) ?? visibleOrders[0];

  const selectOrder = (order: PortalOrder) => {
    setSelectedOrderId(order.id);
    trackFunnelEvent("portal_order_detail_open", {
      order_status_category: getOrderStatusAnalytics(order.status).lifecycleStage,
    });
  };

  return (
    <div className="portal-page-stack">
      <div className="portal-page-header">
        <span className="portal-page-eyebrow">Shipment tracking</span>
        <h1 className="portal-page-title">Orders &amp; Shipments</h1>
        <p className="text-sm text-bds-cocoa/80">Search, filter, and inspect wholesale orders for <strong>{locationName}</strong>.</p>
      </div>

      {orders.length === 0 ? (
        <section role="status" className="portal-empty-state flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="heading-minor text-bds-teal-dark">No wholesale orders yet</h2>
            <p className="text-sm text-bds-cocoa/80">Orders accepted for this unit will appear here with shipment and invoice details.</p>
          </div>
          <Link href="/portal/supplies" className="btn-primary shrink-0 text-xs font-bold uppercase tracking-wider">Order supplies</Link>
        </section>
      ) : (
        <>
      <section aria-label="Order controls" className="space-y-4 rounded-2xl border border-bds-teal-dark/15 bg-white p-4 shadow-sm sm:p-5">
        {/* Saved Views / System Presets Rail */}
        <div className="flex flex-col gap-3 pb-3 border-b border-bds-teal-dark/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Saved views and common filters">
            <span className="text-xs font-bold uppercase tracking-wider text-bds-cocoa/70 mr-1">Views:</span>
            {SYSTEM_ORDER_VIEWS.map((sysView) => {
              const isSelected = activeMatchedView?.id === sysView.id;
              return (
                <button
                  key={sysView.id}
                  type="button"
                  tabIndex={0}
                  onClick={() => handleApplyCriteria(sysView.criteria)}
                  className={`touch-target-inline rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isSelected
                      ? "bg-bds-teal-dark text-white shadow-sm"
                      : "bg-bds-cream text-bds-teal-dark hover:bg-bds-gold/30 border border-bds-teal-dark/10"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`View ${sysView.name}`}
                >
                  {sysView.name}
                </button>
              );
            })}

            {/* Custom Saved Views */}
            {customViews.map((cView) => {
              const isSelected = activeMatchedView?.id === cView.id;
              return (
                <div
                  key={cView.id}
                  className={`inline-flex items-center rounded-xl transition-colors ${
                    isSelected
                      ? "bg-bds-teal-dark text-white shadow-sm"
                      : "bg-bds-cream text-bds-teal-dark hover:bg-bds-gold/30 border border-bds-teal-dark/10"
                  }`}
                >
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={() => handleApplyCriteria(cView.criteria)}
                    className="touch-target-inline inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-bold uppercase tracking-wider"
                    aria-pressed={isSelected}
                    aria-label={`Apply saved view ${cView.name}`}
                  >
                    <Bookmark className="h-3 w-3" aria-hidden="true" />
                    <span>{cView.name}</span>
                  </button>
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={(event) => handleDeleteCustomView(cView.id, event)}
                    className={`touch-target-inline mr-1.5 p-1 rounded-full text-xs transition-opacity hover:opacity-100 ${
                      isSelected ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-bds-cocoa/60 hover:bg-bds-teal-dark/10 hover:text-bds-teal-dark"
                    }`}
                    aria-label={`Delete saved view ${cView.name}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action to Save View or Reset Filters */}
          <div className="flex items-center gap-2 shrink-0">
            {!activeMatchedView && (
              <button
                type="button"
                tabIndex={0}
                onClick={handleOpenSaveModal}
                className="touch-target-inline inline-flex items-center gap-1.5 rounded-xl border border-bds-teal/40 bg-bds-cream/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-bds-teal-dark hover:bg-bds-cream"
                aria-label="Save current filter combination as a view"
              >
                <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save view</span>
              </button>
            )}

            {!isDefaultView && (
              <button
                type="button"
                tabIndex={0}
                onClick={handleResetToDefault}
                className="touch-target-inline inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-bds-cocoa/70 hover:text-bds-teal-dark"
                aria-label="Reset all filters to default"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {undoNotice && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between gap-3 rounded-2xl border border-bds-teal-dark/10 bg-bds-cream px-4 py-2.5 text-xs text-bds-teal-dark"
          >
            <span>{undoNotice}</span>
            {lastDeletedView && (
              <button
                type="button"
                tabIndex={0}
                onClick={handleUndoDeleteView}
                className="font-bold text-bds-teal-dark underline underline-offset-2 hover:text-bds-teal focus:outline-none focus:ring-2 focus:ring-bds-gold rounded"
                aria-label={`Undo deletion of view ${lastDeletedView.name}`}
              >
                Undo
              </button>
            )}
          </div>
        )}

        {/* Modal / Dialog for Saving Custom View */}
        {isSaveModalOpen && (
          <form
            onSubmit={handleSaveCustomView}
            className="flex flex-col gap-3 rounded-2xl border border-bds-teal-dark/20 bg-bds-cream/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            aria-label="Save custom view form"
          >
            <div className="flex-1 space-y-1">
              <label htmlFor="order-view-name" className="text-xs font-bold uppercase tracking-wider text-bds-teal-dark">
                Name your view
              </label>
              <input
                id="order-view-name"
                type="text"
                required
                maxLength={40}
                value={newViewName}
                onChange={(event) => setNewViewName(event.target.value)}
                placeholder="e.g. Past Due Oven Parts"
                className="w-full rounded-xl border border-bds-teal-dark/20 bg-white px-3 py-2 text-sm text-bds-teal-dark outline-none focus:ring-2 focus:ring-bds-teal"
              />
            </div>
            <div className="flex items-center gap-2 pt-2 sm:pt-4">
              <button
                type="submit"
                tabIndex={0}
                className="touch-target btn-primary !px-4 !py-2 text-xs font-bold uppercase tracking-wider"
              >
                Save View
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={handleCloseSaveModal}
                className="touch-target btn-outline !px-3 !py-2 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Search, status, and sort refine the selected view without repeating it. */}
        <div className="grid gap-3 sm:grid-cols-[minmax(15rem,1fr)_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search by order or invoice number</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-bds-cocoa/45" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order or invoice"
                className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/40 py-2.5 pl-9 pr-3 text-sm text-bds-teal-dark outline-none focus:ring-2 focus:ring-bds-teal placeholder:text-bds-cocoa/50"
              />
            </label>
            <label className="text-xs font-semibold text-bds-cocoa/80">
              <span className="sr-only">Filter by status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PortalOrder["status"] | "ALL")} className="h-full rounded-xl border border-bds-teal-dark/20 bg-white px-3 text-sm font-semibold text-bds-teal-dark">
                <option value="ALL">All statuses</option>
                {ORDER_STATUS_IDS.map((status) => (
                  <option key={status} value={status}>{getOrderStatus(status).label}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-bds-cocoa/80">
              <span className="sr-only">Sort orders</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as OrderSort)} className="h-full rounded-xl border border-bds-teal-dark/20 bg-white px-3 text-sm font-semibold text-bds-teal-dark">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest-total">Highest total</option>
              </select>
            </label>
          </div>
      </section>

      <div className={`grid gap-5 ${visibleOrders.length > 0 ? "xl:grid-cols-5" : ""}`}>
        <section aria-label="Order list" className={visibleOrders.length > 0 ? "xl:col-span-2" : ""}>
          <div className="space-y-3">
            {visibleOrders.map((order) => {
              const status = getOrderStatus(order.status);
              const isSelected = selectedOrder?.id === order.id;
              const isException = isOrderException(order);
              const exceptionLabel = getOrderExceptionLabel(order);

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => selectOrder(order)}
                  aria-pressed={isSelected}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${isSelected ? "border-bds-teal-dark bg-bds-cream/60 shadow-sm" : isException ? "border-bds-orange/30 bg-bds-orange/5 hover:border-bds-orange/50" : "border-bds-teal-dark/10 bg-white hover:border-bds-teal"}`}
                >
                  <div className="space-y-3">
                    <div className="min-w-0">
                      <p className="font-heading text-base font-bold text-bds-teal-dark">Order {order.id}</p>
                      <p className="mt-1 text-xs text-bds-cocoa/70">Invoice {order.invoiceId}</p>
                    </div>
                    <div className="flex max-w-full flex-wrap gap-1.5">
                      <span aria-label={getOrderStatusAccessibleLabel(order.status)} className="max-w-full rounded-full border border-bds-teal-dark/10 bg-bds-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bds-teal-dark">
                        Status: {status.label}
                      </span>
                      {exceptionLabel ? (
                        <span className="max-w-full rounded-full bg-bds-orange/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bds-orange">
                          Action required: {exceptionLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-bds-cocoa/80">
                    <span>{order.items.length} item{order.items.length === 1 ? "" : "s"}{!isOrderTerminal(order.status) && order.eta ? <> <span aria-hidden="true">·</span> Shipment timing: {order.eta}</> : null}</span>
                    <span className="font-bold text-bds-teal-dark">${order.total.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}

            {visibleOrders.length === 0 ? (
              <div role="status" className="rounded-2xl border border-bds-teal-dark/15 bg-white p-8 text-center text-sm text-bds-cocoa/80">
                No orders match this view.
              </div>
            ) : null}
          </div>
        </section>

        {visibleOrders.length > 0 ? (
          <section aria-label="Selected order detail" className="xl:col-span-3">
            {selectedOrder ? (
            <OrderDetail
              order={selectedOrder}
              locationName={locationName}
              locationId={locationId}
            />
            ) : null}
          </section>
        ) : null}
      </div>
        </>
      )}
    </div>
  );
};

const OrderDetail = ({
  order,
  locationName,
  locationId,
}: {
  order: PortalOrder;
  locationName: string;
  locationId: string;
}) => {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Operator requested cancellation");

  const status = getOrderStatus(order.status);
  const isException = isOrderException(order);
  const exceptionLabel = getOrderExceptionLabel(order);

  const handleOpenCancelDialog = () => {
    setIsCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setIsCancelDialogOpen(false);
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCancelReason(event.target.value);
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleCloseCancelDialog();
    }
  };

  return (
    <article className="rounded-2xl border border-bds-teal-dark/15 bg-white p-6 shadow-sm xl:sticky xl:top-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-bds-teal-dark/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-bds-teal-dark">Order detail</p>
          <h2 className="mt-2 heading-subsection text-bds-teal-dark">Order {order.id}</h2>
          <p className="mt-1 text-xs text-bds-cocoa/80">Placed {formatPortalDate(order.createdAt, locationId)} <span aria-hidden="true">·</span> Invoice {order.invoiceId}</p>
          <TableLine className="w-24 mt-2" />
        </div>
        <div className="flex flex-wrap gap-2">
          <span aria-label={getOrderStatusAccessibleLabel(order.status)} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-bds-cream px-3 py-1 text-xs font-bold text-bds-teal-dark border border-bds-teal-dark/10">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Status: {status.label}
          </span>
          {exceptionLabel ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-bds-orange/15 px-3 py-1 text-xs font-bold text-bds-orange">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Action required: {exceptionLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-bds-cream/40 border border-bds-teal-dark/10 p-4"><span className="block text-[10px] font-bold uppercase tracking-wider text-bds-cocoa/75">{isOrderTerminal(order.status) ? "Fulfillment" : "Shipment timing"}</span><span className="mt-1 block text-sm font-bold text-bds-teal-dark">{isOrderTerminal(order.status) ? getOrderStatus(order.status).meaning : order.eta || "Not available"}</span></div>
        <div className="rounded-2xl bg-bds-cream/40 border border-bds-teal-dark/10 p-4"><span className="block text-[10px] font-bold uppercase tracking-wider text-bds-cocoa/75">Items</span><span className="mt-1 block text-sm font-bold text-bds-teal-dark">{order.items.length}</span></div>
        <div className="rounded-2xl bg-bds-cream/40 border border-bds-teal-dark/10 p-4"><span className="block text-[10px] font-bold uppercase tracking-wider text-bds-cocoa/75">Total</span><span className="mt-1 block text-sm font-bold text-bds-teal-dark">${order.total.toFixed(2)}</span></div>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-bds-cocoa/70">Line items</h4>
        <div className="mt-3 divide-y divide-bds-teal-dark/10 rounded-2xl border border-bds-teal-dark/10">
          {order.items.map((item, index) => (
            <div key={`${item.sku}-${index}`} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div><p className="font-semibold text-bds-teal-dark">{item.quantity}× {item.name}</p><p className="mt-1 text-xs text-bds-cocoa/70">SKU {item.sku}</p></div>
              <span className="shrink-0 font-semibold text-bds-teal-dark">${(item.quantity * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {canTransitionOrderStatus(order.status, "CANCELLED") ? (
        <div className="mt-6 border-t border-bds-teal-dark/10 pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-bds-teal-dark">Fulfillment cancellation</p>
              <p className="mt-0.5 text-[11px] text-bds-cocoa/80">Order is eligible for cancellation while pending fulfillment.</p>
            </div>
            <button
              type="button"
              onClick={handleOpenCancelDialog}
              tabIndex={0}
              aria-label={`Open cancellation confirmation for order ${order.id}`}
              className="shrink-0 rounded-xl border border-bds-orange/30 bg-bds-orange/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-bds-orange hover:bg-bds-orange/20 hover:border-bds-orange/40 focus:outline-none focus:ring-2 focus:ring-bds-orange"
            >
              Cancel order
            </button>
          </div>

          {/* High-Consequence Confirmation Dialog */}
          {isCancelDialogOpen && (
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="cancel-dialog-title"
              aria-describedby="cancel-dialog-description"
              onKeyDown={handleDialogKeyDown}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
              <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-red-100 p-2.5 text-red-700">
                    <AlertCircle className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="cancel-dialog-title" className="text-lg font-bold font-heading text-bds-teal-dark">
                      Confirm Order Cancellation
                    </h3>
                    <p className="text-xs text-bds-cocoa/70">
                      High-consequence action for wholesale logistics
                    </p>
                  </div>
                </div>

                <div id="cancel-dialog-description" className="mt-4 space-y-3 text-xs text-bds-cocoa/80">
                  <p className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-amber-900 leading-relaxed">
                    Cancelling halts warehouse picking and voids invoice <strong>{order.invoiceId}</strong>. This action cannot be automatically reversed once processed.
                  </p>

                  <div className="rounded-2xl border border-bds-teal-dark/10 bg-bds-cream/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-bds-cocoa/75 uppercase text-[10px] tracking-wider">Target Unit</span>
                      <span className="font-bold text-bds-teal-dark">{locationName} ({locationId || order.locationId})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-bds-cocoa/75 uppercase text-[10px] tracking-wider">Order ID</span>
                      <span className="font-mono font-bold text-bds-teal-dark">{order.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-bds-cocoa/75 uppercase text-[10px] tracking-wider">Invoice ID</span>
                      <span className="font-mono font-bold text-bds-teal-dark">{order.invoiceId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-bds-cocoa/75 uppercase text-[10px] tracking-wider">Total Value</span>
                      <span className="font-bold text-bds-teal-dark text-sm">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-bds-teal-dark/10">
                      <span className="block font-bold text-bds-cocoa/75 uppercase text-[10px] tracking-wider mb-1">
                        Line Items ({order.items.length})
                      </span>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={`${item.sku}-${idx}`} className="flex justify-between text-[11px] text-bds-cocoa/80">
                            <span>{item.quantity}× {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <form action={cancelPortalOrderAction} className="mt-4 space-y-4">
                    <input type="hidden" name="orderId" value={order.id} />
                    <label className="block space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-bds-teal-dark">Cancellation Reason</span>
                      <input
                        type="text"
                        name="reason"
                        value={cancelReason}
                        onChange={handleReasonChange}
                        required
                        className="w-full rounded-xl border border-bds-teal-dark/20 bg-white px-3 py-2 text-xs text-bds-teal-dark outline-none focus:ring-2 focus:ring-bds-orange"
                        placeholder="State reason for audit log..."
                      />
                    </label>

                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCloseCancelDialog}
                        tabIndex={0}
                        aria-label="Keep order and dismiss cancellation"
                        className="w-full sm:w-auto rounded-xl border border-bds-teal-dark/20 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-bds-teal-dark hover:bg-bds-cream transition-colors focus:outline-none focus:ring-2 focus:ring-bds-gold"
                      >
                        Keep order
                      </button>
                      <button
                        type="submit"
                        tabIndex={0}
                        aria-label={`Confirm cancellation of order ${order.id} for unit ${locationName}`}
                        className="w-full sm:w-auto rounded-xl border border-red-600 bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Yes, cancel order
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
};
