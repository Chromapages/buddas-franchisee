"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ListFilter, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import type { PortalOrder } from "@/src/features/portal/types";
import {
  getOrderStatus,
  isOrderInMotion,
  requiresOrderOperatorAction,
  ORDER_STATUS_IDS,
} from "@/src/features/portal/order-status";
import { trackOperatorWorkspaceEvent } from "@/src/lib/analytics";
import { usePortalContext } from "@/src/features/portal/portal-context";
import { MobileOrderListItem } from "@/src/components/portal/mobile-order-list-item";
import {
  ordersListScrollKey,
  ordersListHref,
  serializeOrdersListQuery,
  type OrdersListQuery,
  type OrdersListSort,
  type OrdersListView,
} from "@/src/features/portal/orders-query";

type MobileOrdersWorkspaceProps = {
  orders: PortalOrder[];
  locationId: string;
  locationName: string;
  initialQuery: OrdersListQuery;
};

const isAttentionOrder = (order: PortalOrder) => requiresOrderOperatorAction(order.status);

const countLabel = (count: number) => `${count} ${count === 1 ? "order" : "orders"}`;
const INITIAL_RENDERED_ORDERS = 25;

const OrderControlDialog = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={dialogRef} className="mobile-orders-sheet" aria-labelledby={titleId} onClose={onClose}>
    <div className="mobile-orders-sheet__surface">
      <header><h2 id={titleId}>{title}</h2><form method="dialog"><button type="submit" aria-label={`Close ${title.toLowerCase()}`}><X aria-hidden="true" /></button></form></header>
      {children}
    </div>
  </dialog>;
};

export const MobileOrdersWorkspace = ({
  orders,
  locationId,
  locationName,
  initialQuery,
}: MobileOrdersWorkspaceProps) => {
  const router = useRouter();
  const { user, permittedUnits } = usePortalContext();
  const analyticsContext = { role_category: user.role, location_scope_count: permittedUnits.length, route: "/portal/orders" as const, viewport_group: "mobile" as const };
  const hasTrackedView = useRef(false);
  const [view, setView] = useState<OrdersListView>(initialQuery.view);
  const [query, setQuery] = useState(initialQuery.query);
  const [status, setStatus] = useState<PortalOrder["status"] | "ALL">(initialQuery.status);
  const [sort, setSort] = useState<OrdersListSort>(initialQuery.sort);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<PortalOrder["status"] | "ALL">(initialQuery.status);
  const [renderedCount, setRenderedCount] = useState(INITIAL_RENDERED_ORDERS);
  const [isOffline, setIsOffline] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const initialSerialized = useRef(serializeOrdersListQuery(initialQuery));
  const currentQuery = useMemo<OrdersListQuery>(() => ({ query: query.trim(), status, sort, view }), [query, sort, status, view]);
  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders
      .filter((order) => {
        const matchesQuery = !normalizedQuery
          || order.id.toLowerCase().includes(normalizedQuery)
          || order.invoiceId.toLowerCase().includes(normalizedQuery)
          || order.items.some((item) => item.sku.toLowerCase().includes(normalizedQuery) || item.name.toLowerCase().includes(normalizedQuery));
        const matchesStatus = status === "ALL" || order.status === status;
        const matchesView = view === "all" || (view === "in-motion" && isOrderInMotion(order.status)) || (view === "needs-attention" && isAttentionOrder(order));
        return matchesQuery && matchesStatus && matchesView;
      })
      .sort((left, right) => {
        if (sort === "highest-total") return right.total - left.total;
        const difference = Date.parse(right.createdAt) - Date.parse(left.createdAt);
        return sort === "newest" ? difference : -difference;
      });
  }, [orders, query, sort, status, view]);
  const renderedOrders = visibleOrders.slice(0, renderedCount);
  const hasMoreOrders = visibleOrders.length > renderedOrders.length;

  useEffect(() => {
    const serialized = serializeOrdersListQuery(currentQuery);
    if (serialized === initialSerialized.current) return;
    const timeout = window.setTimeout(() => router.replace(ordersListHref(currentQuery), { scroll: false }), 220);
    return () => window.clearTimeout(timeout);
  }, [currentQuery, router]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(ordersListScrollKey(locationId, initialQuery));
    if (!stored) return;
    const top = Number(stored);
    if (!Number.isFinite(top) || top < 0) return;
    requestAnimationFrame(() => window.scrollTo({ top, behavior: "auto" }));
  }, [initialQuery, locationId]);

  useEffect(() => { if (!hasTrackedView.current) { hasTrackedView.current = true; trackOperatorWorkspaceEvent("operator_orders_viewed", { ...analyticsContext, result_count: orders.length }); } }, [analyticsContext, orders.length]);

  useEffect(() => {
    const search = query.trim();
    if (!search) return;
    const timer = window.setTimeout(() => trackOperatorWorkspaceEvent("operator_orders_searched", { ...analyticsContext, result_count: visibleOrders.length }), 500);
    return () => window.clearTimeout(timer);
  }, [analyticsContext, query, visibleOrders.length]);

  useEffect(() => {
    const updateConnectivity = () => setIsOffline(!navigator.onLine);
    updateConnectivity();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);
    return () => { window.removeEventListener("online", updateConnectivity); window.removeEventListener("offline", updateConnectivity); };
  }, []);

  useEffect(() => { setRenderedCount(INITIAL_RENDERED_ORDERS); }, [locationId, query, sort, status, view]);

  const clearFilters = () => {
    setView("all");
    setQuery("");
    setStatus("ALL");
  };
  const activeFilterCount = Number(status !== "ALL");
  const queryText = query.trim();
  const hasRefinedList = Boolean(queryText || status !== "ALL" || view !== "all");
  const resultLabel = view === "in-motion"
    ? `${countLabel(visibleOrders.length)} in motion`
    : view === "needs-attention"
      ? `${countLabel(visibleOrders.length)} ${visibleOrders.length === 1 ? "needs" : "need"} attention`
      : countLabel(visibleOrders.length);
  const emptyState = queryText
    ? { title: `No orders match “${queryText}”`, description: "Search by order ID, invoice ID, SKU, or item name, or clear the current filters." }
    : view === "in-motion"
      ? { title: "No active shipments", description: "No orders are currently in motion for this unit." }
      : view === "needs-attention"
        ? { title: "Nothing needs attention", description: "No orders currently need operator action." }
        : status !== "ALL"
          ? { title: `No ${getOrderStatus(status).label.toLowerCase()} orders`, description: "Try another status or clear the current filters." }
          : { title: "No orders match these filters", description: "Try another filter or clear the current selection." };

  if (orders.length === 0) {
    return <div className="portal-page-stack mobile-orders-workspace">
      <header className="portal-page-header mobile-orders-header"><span className="portal-page-eyebrow">Orders &amp; shipments</span><h1 className="portal-page-title">Orders &amp; Shipments</h1><p>Track active shipments or review past supply orders for <strong>{locationName}</strong>.</p></header>
      <section className="portal-empty-state" aria-labelledby="mobile-orders-empty-title"><h2 id="mobile-orders-empty-title">No supply orders yet</h2><p>Accepted orders for this unit will appear here with their order status and fulfillment window.</p><Link href="/portal/supplies" className="btn-primary">Order supplies</Link></section>
    </div>;
  }

  return <div className="portal-page-stack mobile-orders-workspace">
    <header className="portal-page-header mobile-orders-header">
      <span className="portal-page-eyebrow">Orders &amp; shipments</span>
      <h1 className="portal-page-title">Orders &amp; Shipments</h1>
      <p>Track active shipments or review past supply orders for <strong>{locationName}</strong>.</p>
    </header>

    <section className="mobile-orders-controls" aria-label="Order controls">
      <div className="mobile-orders-tabs" role="group" aria-label="Order views">
        {([
          ["all", "All orders"],
          ["in-motion", "In motion"],
          ["needs-attention", "Needs attention"],
        ] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>)}
      </div>
      <label className="mobile-orders-search"><Search aria-hidden="true" /><span className="sr-only">Search orders by order ID, invoice ID, SKU, or item name</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders or invoices" aria-label="Search orders by order ID, invoice ID, SKU, or item name" /></label>
      <div className="mobile-orders-secondary-controls">
        <button type="button" onClick={() => { setDraftStatus(status); setFilterOpen(true); }}><SlidersHorizontal aria-hidden="true" />Filter{activeFilterCount ? <span className="mobile-orders-control-count" aria-label={`${activeFilterCount} active filter`}>{activeFilterCount}</span> : null}</button>
        <button type="button" onClick={() => setSortOpen(true)}><ListFilter aria-hidden="true" />Sort</button>
      </div>
    </section>

    <div className="mobile-orders-results"><p aria-live="polite">{resultLabel}</p><div>{isOffline ? <span className="mobile-orders-freshness" role="status">Offline · order information may be out of date</span> : null}<button type="button" onClick={() => startRefresh(() => router.refresh())} disabled={isRefreshing} aria-label="Refresh orders" className="mobile-orders-refresh"><RefreshCw aria-hidden="true" className={isRefreshing ? "is-spinning" : ""} />{isRefreshing ? "Refreshing" : "Refresh"}</button>{hasRefinedList && visibleOrders.length > 0 ? <button type="button" onClick={clearFilters}>Clear filters</button> : null}</div></div>

    {visibleOrders.length ? <section className="mobile-orders-list" aria-label="Order list">
      {renderedOrders.map((order) => {
        const definition = getOrderStatus(order.status);
        const href = `/portal/orders/${encodeURIComponent(order.id)}${serializeOrdersListQuery(currentQuery) ? `?${serializeOrdersListQuery(currentQuery)}` : ""}`;
        return <MobileOrderListItem
          key={order.id}
          order={order}
          href={href}
          searchQuery={query}
          onOpen={() => {
            window.sessionStorage.setItem(ordersListScrollKey(locationId, currentQuery), String(window.scrollY));
            trackOperatorWorkspaceEvent("operator_order_opened", { route: "/portal/orders", order_status_category: definition.analytics.lifecycleStage });
          }}
        />;
      })}{hasMoreOrders ? <button type="button" className="mobile-orders-load-more" onClick={() => setRenderedCount((count) => count + INITIAL_RENDERED_ORDERS)}>Load more orders</button> : null}
    </section> : <section className="portal-empty-state mobile-orders-filter-empty" role="status"><h2>{emptyState.title}</h2><p>{emptyState.description}</p>{hasRefinedList ? <button type="button" className="btn-outline" onClick={clearFilters}>Clear filters</button> : null}</section>}

    <OrderControlDialog open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter orders">
      <fieldset className="mobile-orders-sheet__choices"><legend>Status</legend>
        {(["ALL", ...ORDER_STATUS_IDS] as const).map((id) => <label key={id}><input type="radio" name="order-status" value={id} checked={draftStatus === id} onChange={() => setDraftStatus(id)} /><span>{id === "ALL" ? "All statuses" : getOrderStatus(id).label}</span>{draftStatus === id ? <Check aria-hidden="true" /> : null}</label>)}
      </fieldset>
      <footer><button type="button" onClick={() => setDraftStatus("ALL")}>Clear filters</button><button type="button" className="btn-primary" onClick={() => { setStatus(draftStatus); setFilterOpen(false); trackOperatorWorkspaceEvent("operator_orders_filter_applied", { ...analyticsContext, filter_count: Number(draftStatus !== "ALL") }); }}>Apply filters</button></footer>
    </OrderControlDialog>

    <OrderControlDialog open={sortOpen} onClose={() => setSortOpen(false)} title="Sort orders">
      <div className="mobile-orders-sheet__choices" role="group" aria-label="Sort orders">
        {([ ["newest", "Newest first"], ["oldest", "Oldest first"], ["highest-total", "Highest total"] ] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={sort === id} onClick={() => { setSort(id); setSortOpen(false); }}><span>{label}</span>{sort === id ? <Check aria-hidden="true" /> : null}</button>)}
      </div>
    </OrderControlDialog>
  </div>;
};
