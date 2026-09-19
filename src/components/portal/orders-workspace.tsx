"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookmarkPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  DollarSign,
  Headphones,
  Package,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  Truck,
  X,
} from "lucide-react";
import type { PortalOrder } from "@/src/features/portal/types";
import {
  getOrderStatus,
  getOrderStatusAnalytics,
  getOrderStatusAccessibleLabel,
  isOrderInMotion,
  isOrderTerminal,
  ORDER_STATUS_IDS,
  requiresOrderOperatorAction,
} from "@/src/features/portal/order-status";
import { trackOperatorWorkspaceEvent } from "@/src/lib/analytics";
import { formatPortalDate, getUnitTimeZone } from "@/src/features/portal/date-time";
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
const DEFAULT_PAGE_SIZE = 10;
const orderCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const formatOrderTime = (value: string, locationId: string) => new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: getUnitTimeZone(locationId),
}).format(new Date(value));

const getOrderActionLabel = (order: PortalOrder) => {
  const actionLabel = getOrderStatus(order.status).notification.actionLabel;
  return actionLabel.startsWith("Track") ? "Track" : actionLabel.startsWith("Review") ? "Review" : "View";
};

const getOrderFulfillmentLabel = (order: PortalOrder) => order.status === "DELIVERED"
  ? "Delivered"
  : order.status === "CANCELLED"
    ? "Cancelled"
    : order.eta || getOrderStatus(order.status).meaning;

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

export const OrdersWorkspace = ({
  orders,
  locationId = "default",
  locationName,
  initialView = "all",
}: {
  orders: PortalOrder[];
  locationId?: string;
  locationName: string;
  initialView?: "all" | "in-motion";
}) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PortalOrder["status"] | "ALL">("ALL");
  const [view, setView] = useState<OrderView>(initialView);
  const [sort, setSort] = useState<OrderSort>("newest");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewOrder, setPreviewOrder] = useState<PortalOrder | null>(orders[0] ?? null);

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

  const pageCount = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const pageStart = (safePage - 1) * pageSize;
  const pagedOrders = visibleOrders.slice(pageStart, pageStart + pageSize);
  const systemViewCounts = useMemo(() => ({
    all: orders.length,
    "in-motion": orders.filter((order) => isOrderInMotion(order.status)).length,
    "needs-attention": orders.filter(isOrderException).length,
  }), [orders]);
  const completedOrderCount = useMemo(() => orders.filter((order) => order.status === "DELIVERED" || order.status === "FULFILLED").length, [orders]);

  useEffect(() => { setCurrentPage(1); }, [pageSize, query, sort, statusFilter, view]);

  return (
    <div className="portal-page-stack orders-page-stack">
      <div className="orders-page-layout">
      <div className="orders-page-index">
      <header className="portal-page-header orders-page-header">
        <div className="orders-page-hero-copy">
          <p className="orders-page-eyebrow">Orders &amp; shipments</p>
          <h1 className="portal-page-title">Orders &amp; Shipments</h1>
          <p className="orders-page-subtitle">Track and manage your supply orders for <strong>{locationName}</strong>.</p>
        </div>
        <div className="orders-page-actions"><Link href="/portal/supplies" className="orders-new-order"><Plus size={17} aria-hidden="true" />New supply order</Link></div>
      </header>

      <section className="orders-metric-grid" aria-label="Order summary">
        <article><span><Truck size={22} aria-hidden="true" /></span><strong>{systemViewCounts["in-motion"]}</strong><div><h2>In progress</h2><p>Orders on the way</p></div></article>
        <article data-tone={systemViewCounts["needs-attention"] ? "attention" : "neutral"}><span><AlertCircle size={22} aria-hidden="true" /></span><strong>{systemViewCounts["needs-attention"]}</strong><div><h2>Needs attention</h2><p>Requires your action</p></div></article>
        <article><span><PackageCheck size={22} aria-hidden="true" /></span><strong>{completedOrderCount}</strong><div><h2>Completed</h2><p>Delivered orders</p></div></article>
        <article><span><ClipboardList size={22} aria-hidden="true" /></span><strong>{orders.length}</strong><div><h2>Total orders</h2><p>For this location</p></div></article>
      </section>

      {orders.length === 0 ? (
        <section role="status" className="portal-empty-state flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="heading-minor text-bds-teal-dark">No supply orders yet</h2>
            <p className="text-sm text-bds-cocoa/80">Orders accepted for this unit will appear here with shipment and invoice details.</p>
          </div>
          <Link href="/portal/supplies" className="btn-primary shrink-0 text-xs font-bold uppercase tracking-wider">Order supplies</Link>
        </section>
      ) : (
        <>
      <section aria-label="Order work queue controls" className="orders-work-queue-toolbar mobile-workspace-panel space-y-4 rounded-2xl border border-bds-teal-dark/15 bg-white p-4 shadow-sm sm:p-5">
        {/* Saved Views / System Presets Rail */}
        <div className="flex flex-col gap-3 pb-3 border-b border-bds-teal-dark/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="orders-work-queue-tabs flex flex-wrap items-center gap-2" role="region" aria-label="Order views">
            <span className="orders-work-queue-label text-xs font-bold uppercase tracking-wider text-bds-cocoa/70 mr-1">Views:</span>
            {SYSTEM_ORDER_VIEWS.map((sysView) => {
              const isSelected = activeMatchedView?.id === sysView.id;
              const viewCount = systemViewCounts[sysView.criteria.view];
              const viewLabel = sysView.criteria.view === "in-motion" ? "Active" : sysView.name;
              return (
                <button
                  key={sysView.id}
                  type="button"
                  tabIndex={0}
                  onClick={() => handleApplyCriteria(sysView.criteria)}
                  className={`orders-work-queue-tab touch-target-inline rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isSelected
                      ? "bg-bds-teal-dark text-white shadow-sm"
                      : "bg-bds-cream text-bds-teal-dark hover:bg-bds-gold/30 border border-bds-teal-dark/10"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`View ${viewLabel}, ${viewCount} orders`}
                >
                  <span>{viewLabel}</span><small aria-hidden="true">{viewCount}</small>
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
          {!activeMatchedView || !isDefaultView ? <div className="orders-work-queue-actions flex items-center gap-2 shrink-0">
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
          </div> : null}
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
        <div className="orders-work-queue-fields mobile-workspace-toolbar grid gap-3 sm:grid-cols-[minmax(15rem,1fr)_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search by order or invoice number</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-bds-cocoa/45" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search orders or invoices…"
                className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/40 py-2.5 pl-9 pr-3 text-sm text-bds-teal-dark outline-none focus:ring-2 focus:ring-bds-teal placeholder:text-bds-cocoa/50"
              />
            </label>
            <label className="relative text-xs font-semibold text-bds-cocoa/80">
              <span className="sr-only">Filter by status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PortalOrder["status"] | "ALL")} className="h-full appearance-none rounded-xl border border-bds-teal-dark/20 bg-white py-2 pl-3 pr-10 text-sm font-semibold text-bds-teal-dark">
                <option value="ALL">Status: All</option>
                {ORDER_STATUS_IDS.map((status) => (
                  <option key={status} value={status}>Status: {getOrderStatus(status).label}</option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-bds-teal">⌄</span>
            </label>
            <label className="relative text-xs font-semibold text-bds-cocoa/80">
              <span className="sr-only">Sort orders</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as OrderSort)} className="h-full appearance-none rounded-xl border border-bds-teal-dark/20 bg-white py-2 pl-3 pr-10 text-sm font-semibold text-bds-teal-dark">
                <option value="newest">Sort: Newest first</option>
                <option value="oldest">Sort: Oldest first</option>
                <option value="highest-total">Sort: Highest total</option>
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-bds-teal">⌄</span>
            </label>
          </div>
      </section>

      <section className="orders-table-workspace" aria-label="Orders table">
        <div className="orders-table-scroll">
          <table>
            <caption className="sr-only">Supply orders for {locationName}</caption>
            <thead><tr><th scope="col">Order</th><th scope="col">Status</th><th scope="col">Items</th><th scope="col">Shipment</th><th scope="col">Total</th><th scope="col">Placed</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {pagedOrders.map((order) => {
                const status = getOrderStatus(order.status);
                const actionLabel = getOrderActionLabel(order);
                const fulfillment = getOrderFulfillmentLabel(order);
                const href = `/portal/orders/${encodeURIComponent(order.id)}`;
                return <tr key={order.id} className={previewOrder?.id === order.id ? "is-previewing" : undefined}>
                  <td><Link href={href} className="orders-table-order" onClick={() => trackOperatorWorkspaceEvent("operator_order_opened", { route: "/portal/orders", order_status_category: getOrderStatusAnalytics(order.status).lifecycleStage })}><strong>{order.id}</strong><small>{order.invoiceId}</small></Link></td>
                  <td><span className="orders-table-status" data-tone={status.presentation.tone} aria-label={getOrderStatusAccessibleLabel(order.status)}>{status.label}</span><small>{status.meaning}</small></td>
                  <td><strong>{order.items.length} item{order.items.length === 1 ? "" : "s"}</strong><small>{order.items[0]?.name || "Order items"}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}</small></td>
                  <td><strong>{fulfillment}</strong><small>{isOrderTerminal(order.status) ? status.meaning : "Ships from approved vendor"}</small></td>
                  <td className="orders-table-total">{orderCurrency.format(order.total)}</td>
                  <td><time dateTime={order.createdAt}>{formatPortalDate(order.createdAt, locationId)}<small>{formatOrderTime(order.createdAt, locationId)}</small></time></td>
                  <td><span className="orders-table-action-cell">{actionLabel === "View" ? <button type="button" aria-label={`Preview order ${order.id}`} aria-pressed={previewOrder?.id === order.id} onClick={() => setPreviewOrder(order)}>View order <ArrowRight size={15} aria-hidden="true" /></button> : <Link href={href} className="is-primary" onClick={() => trackOperatorWorkspaceEvent("operator_order_opened", { route: "/portal/orders", order_status_category: getOrderStatusAnalytics(order.status).lifecycleStage })}>{actionLabel}<ArrowRight size={15} aria-hidden="true" /></Link>}</span></td>
                </tr>;
              })}
              {pagedOrders.length === 0 ? <tr><td colSpan={7} className="orders-table-empty">No orders match this view.</td></tr> : null}
            </tbody>
          </table>
        </div>
        <footer className="orders-table-footer"><p>Showing {visibleOrders.length ? pageStart + 1 : 0}–{Math.min(pageStart + pageSize, visibleOrders.length)} of {visibleOrders.length} orders</p>{pageCount > 1 ? <nav aria-label="Orders pagination"><button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage === 1} aria-label="Previous page"><ChevronLeft size={16} aria-hidden="true" /></button>{Array.from(new Set([Math.max(1, safePage - 1), safePage, Math.min(pageCount, safePage + 1)])).map((page) => <button key={page} type="button" aria-current={page === safePage ? "page" : undefined} onClick={() => setCurrentPage(page)}>{page}</button>)}<button type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={safePage === pageCount} aria-label="Next page"><ChevronRight size={16} aria-hidden="true" /></button></nav> : null}{visibleOrders.length > DEFAULT_PAGE_SIZE ? <label><span>Rows per page</span><select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label> : null}</footer>
      </section>
        </>
      )}
      </div>
      {orders.length ? <aside className="orders-preview-rail" aria-label="Order preview">{previewOrder ? <OrderPreview order={previewOrder} locationId={locationId} locationName={locationName} onClose={() => setPreviewOrder(null)} /> : <div className="orders-preview-empty"><ClipboardList size={28} aria-hidden="true" /><h2>Select an order</h2><p>Choose an order to review its shipment and line items.</p></div>}</aside> : null}
      </div>
    </div>
  );
};

const OrderPreview = ({ order, locationId, locationName, onClose }: { order: PortalOrder; locationId: string; locationName: string; onClose: () => void }) => {
  const status = getOrderStatus(order.status);
  const href = `/portal/orders/${encodeURIComponent(order.id)}`;
  const actionRequired = requiresOrderOperatorAction(order.status);
  const primaryItem = order.items[0];
  const remainingItems = order.items.slice(1);

  return <div className="order-preview-surface">
    <header><div><p>Order preview</p><h2 id="order-preview-title">Order {order.id}</h2></div><button type="button" onClick={onClose} aria-label="Close order preview"><X size={20} aria-hidden="true" /></button></header>
    <div className="order-preview-heading"><span className="orders-table-status" data-tone={status.presentation.tone} aria-label={getOrderStatusAccessibleLabel(order.status)}>{status.label}</span><p>Invoice {order.invoiceId}</p><time dateTime={order.createdAt}>Placed {formatPortalDate(order.createdAt, locationId)} · {formatOrderTime(order.createdAt, locationId)}</time></div>
    <section className="order-preview-callout" data-tone={actionRequired ? "attention" : "progress"} aria-labelledby="order-preview-callout-title">{actionRequired ? <AlertCircle aria-hidden="true" /> : <Package aria-hidden="true" />}<div><h3 id="order-preview-callout-title">{actionRequired ? status.notification.title : `${status.label} order`}</h3><p>{status.notification.body || status.meaning}</p></div><Link href={href}>{actionRequired ? status.notification.actionLabel : "View fulfillment details"}<ArrowRight size={17} aria-hidden="true" /></Link><Link href={`/portal/support?orderId=${encodeURIComponent(order.id)}`} className="order-preview-callout-support">Contact fulfillment support</Link></section>
    <dl className="order-preview-impact"><div><Package aria-hidden="true" /><dt>Items</dt><dd>{order.items.length}</dd></div><div><ClipboardList aria-hidden="true" /><dt>Unit</dt><dd>{locationName}<small>{order.locationId}</small></dd></div><div><DollarSign aria-hidden="true" /><dt>Order total</dt><dd>{orderCurrency.format(order.total)}</dd></div></dl>
    <p className="order-preview-guidance" role="status"><CheckCircle2 aria-hidden="true" />{actionRequired ? "Review the order status and resolution options before continuing." : "No action is required while this order continues through fulfillment."}</p>
    <section className="order-preview-items" aria-labelledby="order-preview-items-title"><h3 id="order-preview-items-title">Items ({order.items.length})</h3>{primaryItem ? <article className="order-preview-primary-item"><span><Package aria-hidden="true" /></span><div><strong>{primaryItem.name}</strong><small>SKU {primaryItem.sku}</small><b>Qty {primaryItem.quantity}</b></div><em>{orderCurrency.format(primaryItem.quantity * primaryItem.price)}</em></article> : <p>No line items are available.</p>}{remainingItems.length ? <details className="order-preview-other-items"><summary>Other items in order: {remainingItems.length}</summary><ul>{remainingItems.map((item, index) => <li key={`${item.sku}-${index}`}><div><strong>{item.name}</strong><small>SKU {item.sku} · Qty {item.quantity}</small></div><span>{orderCurrency.format(item.quantity * item.price)}</span></li>)}</ul></details> : null}</section>
    <section className="order-preview-activity" aria-labelledby="order-preview-activity-title"><header><h3 id="order-preview-activity-title">Order activity</h3><Link href={href}>View full timeline <ArrowRight size={15} aria-hidden="true" /></Link></header><ol><li><CheckCircle2 aria-hidden="true" /><div><strong>Order submitted</strong><small>{formatPortalDate(order.createdAt, locationId)} · {formatOrderTime(order.createdAt, locationId)}</small></div><span>Order received and confirmed.</span></li><li data-tone={actionRequired ? "attention" : "complete"}>{actionRequired ? <AlertCircle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}<div><strong>{status.label}</strong><small>{status.meaning}</small></div><span>{status.notification.body}</span></li>{!isOrderTerminal(order.status) && order.eta ? <li><Circle aria-hidden="true" /><div><strong>Estimated arrival</strong><small>{order.eta}</small></div><span>We&apos;ll notify you if timing changes.</span></li> : null}</ol></section>
    <footer><Link href={href} onClick={() => trackOperatorWorkspaceEvent("operator_order_opened", { route: "/portal/orders", order_status_category: status.analytics.lifecycleStage })}>View full order <ArrowRight size={17} aria-hidden="true" /></Link><Link href={`/portal/support?orderId=${encodeURIComponent(order.id)}`} className="order-preview-support"><Headphones size={17} aria-hidden="true" />Contact support</Link></footer>
  </div>;
};
