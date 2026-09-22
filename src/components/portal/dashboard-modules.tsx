import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, ArrowRight, Bell, ChevronRight, FileText, FolderOpen, MessageSquare, Package, Truck } from "lucide-react";
import type { PortalBulletin, PortalOrder, PortalResource, PortalSupportCase } from "@/src/features/portal/types";
import { isBulletinActionOutstanding } from "@/src/features/portal/bulletins";
import { getOrderStatus } from "@/src/features/portal/order-status";
import { formatPortalDate, formatPortalFreshnessTime, formatPortalDateTime, getUnitTimeZone } from "@/src/features/portal/date-time";
import { DASHBOARD_DATA_STATE, DASHBOARD_STALE_AFTER_MS, resolveDashboardCollectionState } from "@/src/features/portal/dashboard-data-state";
import { DashboardFreshness as DashboardFreshnessControl } from "@/src/components/portal/dashboard-freshness";
import { DashboardWidgetRetry, DashboardWidgetSnapshot, DashboardWidgetStateNotice } from "@/src/components/portal/dashboard-widget-state";
import { ActiveWorkPanel, AttentionList, OperatorStatusSummary, type OperatorAttentionItem } from "@/src/components/portal/operator-status";
import { PortalEmptyState } from "@/src/components/portal/empty-state";
import { OperatorAnalyticsLink, OperatorDashboardModuleViewed, OperatorDashboardViewed } from "@/src/components/portal/operator-analytics";
import type { OperatorDashboardData } from "@/src/features/portal/operator-dashboard-view";
import { buildDashboardOperationalState } from "@/src/features/portal/dashboard-attention";

type HomeData = OperatorDashboardData;
const bulletinHref = (id: string) => "/portal/bulletins?bulletinId=" + encodeURIComponent(id);
const orderHref = (id: string) => "/portal/orders?orderId=" + encodeURIComponent(id);
const safeDate = (value: string, unit: string) => Number.isFinite(Date.parse(value)) ? formatPortalDate(value, unit) : "Date unavailable";
const settle = async <T,>(request?: Promise<T>): Promise<PromiseSettledResult<T> | undefined> => request ? (await Promise.allSettled([request]))[0] : undefined;

export async function DashboardFreshness({ orders, bulletins, supportCases, resources, locationId }: HomeData & { locationId: string }) {
  const modules: Array<[string, Promise<unknown>]> = [];
  if (orders) modules.push(["Orders", orders]);
  if (supportCases) modules.push(["Support", supportCases]);
  if (bulletins) modules.push(["Required updates", bulletins]);
  if (resources) modules.push(["Resources", resources]);
  const results = await Promise.allSettled(modules.map(([, request]) => request));
  const failedModules = results.flatMap((result, index) => result.status === "rejected" ? [modules[index][0]] : []);
  // Completion of this dashboard read, not a supplier, POS, or other source update.
  const updatedAt = failedModules.length ? undefined : new Date().toISOString();
  return <DashboardFreshnessControl updatedAt={updatedAt} updatedLabel={updatedAt ? formatPortalFreshnessTime(updatedAt, locationId) : undefined} failedModules={failedModules} moduleCount={modules.length} staleAfterMs={DASHBOARD_STALE_AFTER_MS} />;
}

type PulsePermissions = {
  canViewOrders: boolean;
  canViewSupport: boolean;
  canViewUpdates: boolean;
  locationId: string;
  idPrefix: string;
  trackDashboardView?: boolean;
  trackDashboardSurface?: "mobile" | "desktop";
  roleCategory: "admin" | "franchisee";
  locationScopeCount: number;
};

const formatCount = (count: number) => count > 99 ? "99+" : String(count);
const localDateKey = (value: string | Date, locationId: string) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: getUnitTimeZone(locationId) }).format(new Date(value));

export async function OperatorBriefStatus({ orders, bulletins, supportCases, canViewOrders, canViewSupport, canViewUpdates, locationId, idPrefix, trackDashboardView, trackDashboardSurface, roleCategory, locationScopeCount }: HomeData & PulsePermissions) {
  const [orderResult, bulletinResult, supportResult] = await Promise.all([
    settle(orders),
    settle(bulletins),
    settle(supportCases),
  ]);
  const orderData = resolveDashboardCollectionState(orderResult, canViewOrders);
  const bulletinData = resolveDashboardCollectionState(bulletinResult, canViewUpdates);
  const supportData = resolveDashboardCollectionState(supportResult, canViewSupport);
  const orderRows = orderData.data;
  const updates = bulletinData.data;
  const tickets = supportData.data;
  const operationalState = buildDashboardOperationalState({ orders: orderRows, supportCases: tickets, bulletins: updates, locationId });
  const desktopLayout = trackDashboardSurface === "desktop";
  const attentionItems: OperatorAttentionItem[] = operationalState.attention.map((item) => {
    const delayedOrder = !desktopLayout && item.type === "supply-order" && item.secondaryText.startsWith("Processing beyond expected");
    return { id: item.id, category: item.type === "required-update" ? "Required update" : item.type === "support-reply" ? "Support reply" : "Supply order", title: item.label, status: delayedOrder ? "Delayed" : item.secondaryText, detail: delayedOrder ? item.secondaryText : undefined, dueLabel: item.dueAt ? `Due ${formatPortalDateTime(item.dueAt, locationId)}` : undefined, dueDateTime: item.dueAt, href: item.destination, accessibleStateLabel: `${item.label}. ${item.secondaryText}. Action required.`, priority: item.priority === "P0_BLOCKING" ? "blocking" : "action-required", icon: item.type === "required-update" ? Bell : item.type === "support-reply" ? MessageSquare : Package, analyticsType: item.type === "required-update" ? "required_update" : item.type === "support-reply" ? "support_reply" : "order_exception" };
  });
  const unavailable = [
    ["Required updates", bulletinData.state],
    ["Support replies", supportData.state],
    ["Orders in motion", orderData.state],
  ].flatMap(([label, state]) => state === DASHBOARD_DATA_STATE.PERMISSION_UNAVAILABLE
    ? [label + " are unavailable for this account."]
    : state === DASHBOARD_DATA_STATE.UNCONFIGURED
      ? [label + " are not set up for this workspace."]
      : state === DASHBOARD_DATA_STATE.PARTIAL_ERROR
        ? [label + " could not be loaded."]
        : []);
  const shouldRetry = [orderData, bulletinData, supportData].some((data) => data.state === DASHBOARD_DATA_STATE.PARTIAL_ERROR);
  const attentionCount = attentionItems.length;
  const deliveriesToday = orderRows.filter((order) => order.status === "IN_TRANSIT" && Number.isFinite(Date.parse(order.eta)) && localDateKey(order.eta, locationId) === localDateKey(new Date(), locationId)).length;
  const pulseState = shouldRetry
    ? DASHBOARD_DATA_STATE.PARTIAL_ERROR
    : [orderData, bulletinData, supportData].some((data) => data.state === DASHBOARD_DATA_STATE.UNCONFIGURED)
      ? DASHBOARD_DATA_STATE.UNCONFIGURED
    : [orderData, bulletinData, supportData].every((data) => data.state === DASHBOARD_DATA_STATE.PERMISSION_UNAVAILABLE)
      ? DASHBOARD_DATA_STATE.PERMISSION_UNAVAILABLE
      : [orderData, bulletinData, supportData].every((data) => data.state === DASHBOARD_DATA_STATE.EMPTY || data.state === DASHBOARD_DATA_STATE.PERMISSION_UNAVAILABLE)
        ? DASHBOARD_DATA_STATE.EMPTY
        : DASHBOARD_DATA_STATE.ACTIVE;
  return <DashboardWidgetSnapshot state={pulseState} moduleId="operator-status" retainOnFailure={false} failureMessage="Operational status could not be refreshed." retryLabel="Retry operational status"><div className={`home-brief-status-stack${desktopLayout ? " desktop-right-now" : ""}`}>
    {trackDashboardView && trackDashboardSurface ? <OperatorDashboardViewed surface={trackDashboardSurface} roleCategory={roleCategory} locationScopeCount={locationScopeCount} attentionCount={attentionCount} activeWorkCount={operationalState.active.length} attentionTypes={[
      { type: "required_update", count: attentionItems.filter((item) => item.analyticsType === "required_update").length },
      { type: "support_reply", count: attentionItems.filter((item) => item.analyticsType === "support_reply").length },
      { type: "order_exception", count: attentionItems.filter((item) => item.analyticsType === "order_exception").length },
    ]} /> : null}
    {desktopLayout ? <><OperatorStatusSummary attentionCount={attentionCount} activeItems={operationalState.active} state={pulseState} idPrefix={idPrefix} showActiveWork={false} desktopAllClear attentionContent={<AttentionList items={attentionItems} idPrefix={idPrefix} embedded />}>
      {unavailable.length ? <div className="home-status-unavailable" role="status">{unavailable.map((message) => <p key={message}>{message}</p>)}{shouldRetry ? <DashboardWidgetRetry label="Retry operational status" /> : null}</div> : null}
      <DashboardWidgetStateNotice state={pulseState} />
    </OperatorStatusSummary><ActiveWorkPanel activeItems={operationalState.active} /></> : <><section className="mobile-dashboard-glance" aria-labelledby={`${idPrefix}-glance-heading`}><p className="home-section-label" id={`${idPrefix}-glance-heading`}>Today at a glance</p><div><article><AlertCircle aria-hidden="true" /><span><strong>{formatCount(attentionCount)}</strong><small>Needs attention</small></span></article><article><Truck aria-hidden="true" /><span><strong>{formatCount(deliveriesToday)}</strong><small>Deliveries today</small></span></article><article><FileText aria-hidden="true" /><span><strong>{formatCount(operationalState.active.length)}</strong><small>Active items</small></span></article></div></section><AttentionList items={attentionItems} idPrefix={idPrefix} limit={1} mobileDashboard />{unavailable.length ? <div className="home-status-unavailable" role="status">{unavailable.map((message) => <p key={message}>{message}</p>)}{shouldRetry ? <DashboardWidgetRetry label="Retry operational status" /> : null}</div> : null}<DashboardWidgetStateNotice state={pulseState} /></>}
  </div></DashboardWidgetSnapshot>;
}

export async function RecentWholesaleOrdersModule({ orders, locationId, idPrefix, excludeOrderIds = [] }: Omit<HomeData, "orders"> & { orders: Promise<PortalOrder[]>; locationId: string; idPrefix: string; excludeOrderIds?: string[] }) {
  const headingId = `${idPrefix}-orders-heading`;
  const isDesktop = idPrefix.startsWith("desktop-");
  const orderData = resolveDashboardCollectionState(await settle(orders), true);
  if (orderData.state === DASHBOARD_DATA_STATE.UNCONFIGURED) return <DashboardWidgetSnapshot state={orderData.state} moduleId="recent-orders" failureMessage="Recent supply orders are not configured." retryLabel="Retry recent supply orders"><section className="home-orders" data-dashboard-state={orderData.state} aria-labelledby={headingId}><header className="home-section-header"><h2 id={headingId}>Recent supply orders</h2></header><p className="home-orders-error">Recent supply orders are not set up for this workspace.</p></section></DashboardWidgetSnapshot>;
  if (orderData.state === DASHBOARD_DATA_STATE.PARTIAL_ERROR) return <DashboardWidgetSnapshot state={orderData.state} moduleId="recent-orders" failureMessage="Recent supply orders could not be refreshed." retryLabel="Retry recent supply orders"><section className="home-orders" data-dashboard-state={orderData.state} aria-labelledby={headingId}><header className="home-section-header"><h2 id={headingId}>Recent supply orders</h2><Link href="/portal/orders">View all orders</Link></header><p className="home-orders-error">Recent supply orders could not be loaded.</p><DashboardWidgetRetry label="Retry recent supply orders" /></section></DashboardWidgetSnapshot>;
  const rows = orderData.data.filter((order) => !excludeOrderIds.includes(order.id)).sort((first, second) => (Date.parse(second.createdAt) || 0) - (Date.parse(first.createdAt) || 0)).slice(0, isDesktop ? 5 : 3);
  const title = "Recent supply orders";
  const state = rows.length ? DASHBOARD_DATA_STATE.ACTIVE : DASHBOARD_DATA_STATE.EMPTY;
  if (isDesktop && !rows.length) return null;
  const openOrder = (order: PortalOrder, content: ReactNode) => {
    const status = getOrderStatus(order.status);
    return <OperatorAnalyticsLink key={order.id} href={orderHref(order.id)} events={[{ event: "operator_order_opened", properties: { route: "/portal/orders", order_status_category: status.analytics.lifecycleStage, module_id: "recent-orders" } }, { event: "operator_recent_order_opened", properties: { route: "/portal/orders", order_status_category: status.analytics.lifecycleStage, module_id: "recent-orders" } }]} ariaLabel={`Open order ${order.id}. ${status.presentation.accessibleDescription} Placed ${safeDate(order.createdAt, locationId)}. ${order.items.length} line items. Total ${order.total.toFixed(2)} US dollars.`}>{content}</OperatorAnalyticsLink>;
  };
  return <DashboardWidgetSnapshot state={state} moduleId="recent-orders" failureMessage="Recent supply orders could not be refreshed." retryLabel="Retry recent supply orders"><section className={`home-orders${isDesktop ? " home-orders-desktop" : ""}`} data-dashboard-state={state} aria-labelledby={headingId}>
    <header className="home-section-header"><div><p className="home-section-label">Recent activity</p><h2 id={headingId}>{title}</h2></div><OperatorAnalyticsLink href="/portal/orders" events={[{ event: "operator_orders_view_all", properties: { route: "/portal/orders", module_id: "recent-orders" } }]}>{isDesktop ? "View all orders" : <>View all activity <ArrowRight size={16} aria-hidden="true" /></>}</OperatorAnalyticsLink></header>
    {rows.length ? isDesktop ? <div className="home-orders-table"><div className="home-orders-table-head" aria-hidden="true"><span>Order</span><span>Status</span><span>Date</span><span>Items</span><span>Total</span><span /></div><ul className="home-orders-table-body">{rows.map((order) => {
      const status = getOrderStatus(order.status);
      return <li key={order.id}>{openOrder(order, <span className="home-order-table-row"><strong>{order.id}</strong><span className="home-order-status" data-tone={status.presentation.tone}>{status.label}</span><time dateTime={order.createdAt}>{safeDate(order.createdAt, locationId)}</time><span>{order.items.length}</span><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.total)}</strong><ChevronRight size={18} aria-hidden="true" /></span>)}</li>;
    })}</ul></div> : <ul className="home-orders-list">{rows.map((order) => {
      const status = getOrderStatus(order.status);
      const actionState = status.operatorActionRequired ? "Action required" : order.status === "CANCELLED" ? "No action required" : status.label;
      return <li key={order.id}>{openOrder(order, <span className="home-order-row">
        <span className="home-order-activity-icon" data-tone={status.presentation.tone}>{status.operatorActionRequired ? <AlertCircle aria-hidden="true" /> : <Package aria-hidden="true" />}</span><div className="home-order-main"><div className="home-order-heading"><strong>Order {order.id}</strong></div><p className="home-order-meta"><span>{status.label}</span><span aria-hidden="true">·</span><span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span></p>{status.operatorActionRequired || order.status === "CANCELLED" ? <span className="home-order-action">{actionState}</span> : null}</div>
        <div className="home-order-total"><time dateTime={order.createdAt}>{safeDate(order.createdAt, locationId)}</time><ChevronRight size={18} aria-hidden="true" /></div>
      </span>)}</li>;
    })}</ul> : <p className="home-empty">No recent supply orders.</p>}
    <DashboardWidgetStateNotice state={state} />
  </section></DashboardWidgetSnapshot>;
}

export async function DashboardResourceRail({ resources, locationId, idPrefix }: { resources: Promise<PortalResource[]>; locationId: string; idPrefix: string }) {
  const headingId = `${idPrefix}-resources-heading`;
  const resourceData = resolveDashboardCollectionState(await settle(resources), true);
  const failed = resourceData.state === DASHBOARD_DATA_STATE.PARTIAL_ERROR || resourceData.state === DASHBOARD_DATA_STATE.UNCONFIGURED;
  if (failed) return <DashboardWidgetSnapshot state={resourceData.state} moduleId="resource-rail" failureMessage="Resources could not be refreshed." retryLabel="Retry resources"><section className="home-rail-section" data-dashboard-state={resourceData.state} aria-labelledby={headingId}><OperatorDashboardModuleViewed moduleId="resource-rail" surface="desktop" /><header className="home-section-header"><h2 id={headingId}>Resources</h2></header><p className="home-rail-loading">Resource updates are unavailable right now.</p><DashboardWidgetRetry label="Retry resources" /></section></DashboardWidgetSnapshot>;
  const latest = [...resourceData.data].sort((first, second) => (Date.parse(second.updatedAt) || 0) - (Date.parse(first.updatedAt) || 0))[0];
  if (!latest) return null;
  return <DashboardWidgetSnapshot state={resourceData.state} moduleId="resource-rail" failureMessage="Resources could not be refreshed." retryLabel="Retry resources"><section className="home-rail-section" data-dashboard-state={resourceData.state} aria-labelledby={headingId}>
    <OperatorDashboardModuleViewed moduleId="resource-rail" surface="desktop" />
    <header className="home-section-header"><h2 id={headingId}>Recently updated</h2></header>
    <OperatorAnalyticsLink className="home-rail-link" href="/portal/resources" events={[{ event: "operator_resource_center_opened", properties: { route: "/portal/resources", module_id: "resource-rail" } }]}><FolderOpen size={16} aria-hidden="true" /><span><strong>{latest.title}</strong><small>Updated {safeDate(latest.updatedAt, locationId)}</small></span><ChevronRight size={16} aria-hidden="true" /></OperatorAnalyticsLink>
  </section></DashboardWidgetSnapshot>;
}

export async function DashboardSupportRail({ supportCases, idPrefix }: { supportCases: Promise<PortalSupportCase[]>; idPrefix: string }) {
  const supportData = resolveDashboardCollectionState(await settle(supportCases), true);
  const openCases = supportData.data.filter((supportCase) => supportCase.status !== "Resolved").sort((first, second) => Number(second.operatorActionRequired) - Number(first.operatorActionRequired) || (Date.parse(second.updatedAt) || 0) - (Date.parse(first.updatedAt) || 0));
  const failed = supportData.state === DASHBOARD_DATA_STATE.PARTIAL_ERROR || supportData.state === DASHBOARD_DATA_STATE.UNCONFIGURED;
  if (failed) return <DashboardWidgetSnapshot state={supportData.state} moduleId="support-rail" failureMessage="Support status could not be refreshed." retryLabel="Retry support"><section className="home-rail-section" data-dashboard-state={supportData.state} aria-labelledby={`${idPrefix}-support-heading`}><OperatorDashboardModuleViewed moduleId="support-rail" surface="desktop" /><header className="home-section-header"><h2 id={`${idPrefix}-support-heading`}>Support</h2></header><p className="home-rail-loading">Support status is unavailable right now.</p><DashboardWidgetRetry label="Retry support" /></section></DashboardWidgetSnapshot>;
  if (!openCases.length) return null;
  const focusCase = openCases[0];
  const countLabel = `${openCases.length} open support ${openCases.length === 1 ? "request" : "requests"}`;
  const title = focusCase.operatorActionRequired ? "Reply needed" : countLabel;
  return <DashboardWidgetSnapshot state={supportData.state} moduleId="support-rail" failureMessage="Support status could not be refreshed." retryLabel="Retry support"><section className="home-rail-section" data-dashboard-state={supportData.state} aria-labelledby={`${idPrefix}-support-heading`}>
    <OperatorDashboardModuleViewed moduleId="support-rail" surface="desktop" />
    <header className="home-section-header"><h2 id={`${idPrefix}-support-heading`}>Support</h2></header>
    <OperatorAnalyticsLink className="home-rail-link" href={`/portal/support?ticketId=${encodeURIComponent(focusCase.id)}`} events={[{ event: "operator_support_opened", properties: { route: "/portal/support" } }]}><MessageSquare size={16} aria-hidden="true" /><span><strong>{title}</strong><small>{focusCase.operatorActionRequired ? countLabel : "Open Operations Support"}</small></span><ChevronRight size={16} aria-hidden="true" /></OperatorAnalyticsLink>
  </section></DashboardWidgetSnapshot>;
}

export const ContextRailSkeleton = ({ title }: { title: string }) => <section className="home-rail-section" aria-busy="true" aria-label={`Loading ${title}`}><h2>{title}</h2><p className="home-rail-loading">Loading…</p><span className="sr-only" role="status">Loading {title}</span></section>;

export const OperatorStatusSkeleton = ({ desktop = false }: { desktop?: boolean }) => <div className={`home-brief-status-stack${desktop ? " desktop-right-now" : ""}`} data-dashboard-state={DASHBOARD_DATA_STATE.LOADING} aria-busy="true" aria-label="Loading Right now"><section className="home-status home-status-skeleton"><p className="home-section-label">Right now</p><div /><div /><span className="sr-only" role="status">Loading operational status</span></section>{desktop ? <section className="desktop-active-work home-status-skeleton"><p className="home-section-label">Active work</p><div /><div /></section> : null}</div>;

export async function BulletinModule({ bulletins, locationId, idPrefix, canViewBulletins = true }: Omit<HomeData, "bulletins"> & { bulletins: Promise<PortalBulletin[]>; locationId: string; idPrefix: string; canViewBulletins?: boolean }) {
  const headingId = `${idPrefix}-bulletins-heading`;
  const bulletinData = resolveDashboardCollectionState(await settle(bulletins), canViewBulletins);
  if (bulletinData.state === DASHBOARD_DATA_STATE.PERMISSION_UNAVAILABLE) return <section className="home-bulletins" data-dashboard-state={bulletinData.state} aria-labelledby={headingId}><header className="home-section-header"><h2 id={headingId}>Operations bulletins</h2></header><p className="home-bulletin-state">Bulletins are unavailable for this account.</p></section>;
  if (bulletinData.state === DASHBOARD_DATA_STATE.UNCONFIGURED) return <DashboardWidgetSnapshot state={bulletinData.state} moduleId="operations-bulletins" failureMessage="Operations bulletins are not configured." retryLabel="Retry operations bulletins"><section className="home-bulletins" data-dashboard-state={bulletinData.state} aria-labelledby={headingId}><header className="home-section-header"><h2 id={headingId}>Operations bulletins</h2></header><p className="home-bulletin-state">Operations bulletins are not set up for this workspace.</p></section></DashboardWidgetSnapshot>;
  if (bulletinData.state === DASHBOARD_DATA_STATE.PARTIAL_ERROR) return <DashboardWidgetSnapshot state={bulletinData.state} moduleId="operations-bulletins" failureMessage="Operations bulletins could not be refreshed." retryLabel="Retry operations bulletins"><section className="home-bulletins" data-dashboard-state={bulletinData.state} aria-labelledby={headingId}><header className="home-section-header"><h2 id={headingId}>Operations bulletins</h2><Link href="/portal/bulletins">View all bulletins</Link></header><p className="home-bulletin-state">Operations bulletins could not be loaded.</p><DashboardWidgetRetry label="Retry operations bulletins" /></section></DashboardWidgetSnapshot>;
  const rows = [...bulletinData.data].sort((a, b) => Number(isBulletinActionOutstanding(b)) - Number(isBulletinActionOutstanding(a)) || Number(b.priority === "IMPORTANT") - Number(a.priority === "IMPORTANT") || (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0)).slice(0, 1);
  if (!rows.length) return <DashboardWidgetSnapshot state={DASHBOARD_DATA_STATE.EMPTY} moduleId="operations-bulletins" failureMessage="Operations bulletins could not be refreshed." retryLabel="Retry operations bulletins"><section className="home-bulletins home-bulletins-compact" data-dashboard-state={DASHBOARD_DATA_STATE.EMPTY} aria-labelledby={headingId}><header className="home-section-header"><h2 id={headingId}>Operations bulletins</h2><Link href="/portal/bulletins">View all bulletins</Link></header><PortalEmptyState size="compact" title="No new bulletins" /></section></DashboardWidgetSnapshot>;
  return <DashboardWidgetSnapshot state={DASHBOARD_DATA_STATE.ACTIVE} moduleId="operations-bulletins" failureMessage="Operations bulletins could not be refreshed." retryLabel="Retry operations bulletins"><section className="home-bulletins" data-dashboard-state={DASHBOARD_DATA_STATE.ACTIVE} aria-labelledby={headingId}>
    <header className="home-section-header"><div><p className="home-section-label">From operations</p><h2 id={headingId}>Operations bulletins</h2></div><Link href="/portal/bulletins">All current</Link></header>
    <ul className="home-bulletin-list">{rows.map((bulletin) => {
      const acknowledgement = bulletin.acknowledgement?.required ? bulletin.currentUserState?.acknowledgedAt ? "Acknowledged" : "Acknowledgement required" : null;
      const status = acknowledgement || (bulletin.priority === "IMPORTANT" ? "Important" : "Information");
      return <li key={bulletin.id}><OperatorAnalyticsLink href={bulletinHref(bulletin.id)} events={[{ event: "operator_bulletin_opened", properties: { route: "/portal/bulletins", module_id: "operations-bulletins" } }]} ariaLabel={"Open bulletin: " + bulletin.title + ". " + status + ". Published " + safeDate(bulletin.publishedAt, locationId) + "."}><div><span>{safeDate(bulletin.publishedAt, locationId)}</span><span className="home-bulletin-status" data-required={acknowledgement === "Acknowledgement required" || undefined}>{acknowledgement || status}</span></div><h3>{bulletin.title}</h3><p>{bulletin.summary}</p><span className="home-bulletin-open">Open bulletin</span></OperatorAnalyticsLink></li>;
    })}</ul>
    <DashboardWidgetStateNotice state={DASHBOARD_DATA_STATE.ACTIVE} />
  </section></DashboardWidgetSnapshot>;
}

export const HomeModuleSkeleton = ({ title }: { title: string }) => <section className="home-skeleton" data-dashboard-state={DASHBOARD_DATA_STATE.LOADING} aria-busy="true" aria-label={"Loading " + title}><h2>{title}</h2><div /><div /><span className="sr-only" role="status">Loading {title}</span></section>;
export const RecentWholesaleOrdersSkeleton = () => <section className="home-orders home-orders-skeleton" data-dashboard-state={DASHBOARD_DATA_STATE.LOADING} aria-busy="true" aria-label="Loading recent supply orders"><div className="home-section-header"><h2>Recent supply orders</h2></div><div /><div /><span className="sr-only" role="status">Loading recent supply orders</span></section>;
