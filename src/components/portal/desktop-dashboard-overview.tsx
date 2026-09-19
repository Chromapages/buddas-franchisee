import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarDays, Circle, Clock3, FileText, Headphones, List, Package, PackageCheck, Plus, ShoppingCart, Truck } from "lucide-react";
import type { OperatorDashboardViewProps } from "@/src/features/portal/operator-dashboard-view";
import type { PortalCartItem } from "@/src/features/portal/cart";
import { resolveDashboardCollectionState } from "@/src/features/portal/dashboard-data-state";
import { buildDashboardOperationalState } from "@/src/features/portal/dashboard-attention";
import { getOrderStatus, isOrderInMotion } from "@/src/features/portal/order-status";
import { formatPortalDate, formatPortalFreshnessTime } from "@/src/features/portal/date-time";
import { CatalogProductVisual } from "@/src/components/portal/catalog-product-visual";
import { OperatorAnalyticsLink, OperatorDashboardViewed } from "@/src/components/portal/operator-analytics";

const settle = async <T,>(request?: Promise<T>): Promise<PromiseSettledResult<T> | undefined> => request ? (await Promise.allSettled([request]))[0] : undefined;
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const OrderProgress = ({ status, createdAt, locationId, attention }: { status: string; createdAt: string; locationId: string; attention: boolean }) => {
  const currentIndex = status === "DELIVERED" ? 3 : status === "SHIPPED" ? 2 : 1;
  const stages = [
    { label: "Placed", detail: formatPortalDate(createdAt, locationId) },
    { label: "Processing", detail: currentIndex === 1 ? attention ? "Delayed — beyond expected window" : "In progress" : currentIndex > 1 ? "Complete" : "—" },
    { label: "Shipped", detail: currentIndex >= 2 ? currentIndex === 2 ? "In transit" : "Complete" : "—" },
    { label: "Delivered", detail: currentIndex === 3 ? "Complete" : "—" },
  ];
  return <section className="dashboard-order-timeline" aria-labelledby="dashboard-order-timeline-title">
    <p id="dashboard-order-timeline-title">Fulfillment progress</p>
    <ol>
      {stages.map((stage, index) => <li key={stage.label} data-state={index < currentIndex ? "complete" : index === currentIndex ? attention ? "attention" : "current" : "upcoming"} aria-current={index === currentIndex ? "step" : undefined}>
        <span className="dashboard-order-timeline-marker"><Circle aria-hidden="true" /></span>
        <span><strong>{stage.label}</strong><small>{stage.detail}</small></span>
      </li>)}
    </ol>
  </section>;
};

const CurrentOrderCard = ({ cartItems }: { cartItems: PortalCartItem[] }) => {
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  return <section className="dashboard-current-order" aria-labelledby="dashboard-current-order-title">
    <header><ShoppingCart aria-hidden="true" /><div><h2 id="dashboard-current-order-title">Draft order</h2><p>{itemCount} {itemCount === 1 ? "item" : "items"}</p></div><Link href="/portal/cart" aria-label="Open draft order"><ArrowRight aria-hidden="true" /></Link></header>
    {cartItems.length ? <ul className="dashboard-current-order-lines">{cartItems.slice(0, 3).map(({ product, quantity }) => <li key={product.sku}><Link href={`/portal/supplies/${encodeURIComponent(product.slug)}`} aria-label={`View ${product.name}`}><CatalogProductVisual product={product} className="dashboard-current-order-image" sizes="64px" compactFallback /></Link><div><strong>{product.name}</strong><span>{product.packSize}</span></div><b>{quantity} {quantity === 1 ? "unit" : "units"}</b></li>)}</ul> : <p className="dashboard-current-order-empty">Add approved supplies to start an order.</p>}
    <div className="dashboard-current-order-total"><span>Estimated subtotal</span><strong>{money(subtotal)}</strong></div>
    <Link href="/portal/cart" className="dashboard-current-order-action">Review draft <ArrowRight aria-hidden="true" /></Link>
    <Link href="/portal/supplies" className="dashboard-current-order-add"><Plus aria-hidden="true" /><span>Add supplies</span></Link>
  </section>;
};

export const DesktopDashboardOverview = async ({ session, data, permissions, cartItems }: Pick<OperatorDashboardViewProps, "session" | "data" | "permissions"> & { cartItems: PortalCartItem[] }) => {
  const [orderResult, bulletinResult, supportResult] = await Promise.all([
    settle(data.orders), settle(data.bulletins), settle(data.supportCases),
  ]);
  const orders = resolveDashboardCollectionState(orderResult, permissions.canViewOrders).data;
  const bulletins = resolveDashboardCollectionState(bulletinResult, permissions.canViewBulletins).data;
  const supportCases = resolveDashboardCollectionState(supportResult, permissions.canViewSupport).data;
  const operational = buildDashboardOperationalState({ orders, bulletins, supportCases, locationId: session.locationId });
  const activeOrders = orders.filter((order) => isOrderInMotion(order.status));
  const attentionItem = operational.attention.find((item) => item.type === "supply-order");
  const attentionOrderId = attentionItem?.id.replace(/^order:/, "");
  const attentionOrder = attentionOrderId ? orders.find((order) => order.id === attentionOrderId) : undefined;
  const fulfillmentSupportHref = attentionOrder ? `/portal/support?orderId=${encodeURIComponent(attentionOrder.id)}` : "/portal/support";
  const attentionStatus = attentionOrder ? getOrderStatus(attentionOrder.status) : null;
  const completedOrders = orders.filter((order) => order.status === "DELIVERED");
  const nextShipment = attentionOrder || activeOrders[0];
  const recentOrders = [...orders].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)).slice(0, 4);

  return <section className="dashboard-glance">
    <OperatorDashboardViewed surface="desktop" roleCategory={session.role} locationScopeCount={session.managedLocationIds.length} attentionCount={operational.attention.length} activeWorkCount={activeOrders.length} attentionTypes={[]} />
    <div className="dashboard-today"><p>Today</p><dl><div data-tone={attentionOrder ? "attention" : "default"}><dt><AlertTriangle aria-hidden="true" /><strong>{attentionOrder ? 1 : 0}</strong></dt><dd><b>issue needs attention</b><span>{attentionOrder ? "Requires your action" : "Nothing requires action"}</span></dd></div><div><dt><Truck aria-hidden="true" /><strong>{activeOrders.length}</strong></dt><dd><b>in progress</b><span>On the way</span></dd></div><div><dt><Package aria-hidden="true" /><strong>{completedOrders.length}</strong></dt><dd><b>completed orders</b><span>Delivered to this location</span></dd></div></dl></div>
    <div className="dashboard-glance-layout">
      <div className="dashboard-glance-main">
        <section className="dashboard-attention-section" aria-labelledby="dashboard-attention-heading">
          <header><h2 id="dashboard-attention-heading">Needs attention</h2><p>{attentionOrder ? "Review and take action on the order below." : "No active orders need action right now."}</p></header>
          {attentionOrder && attentionItem && attentionStatus ? <article className="dashboard-attention-order">
            <div className="dashboard-attention-order-heading"><AlertTriangle aria-hidden="true" /><div><p>Action required</p><h3>{attentionItem.label}<span>Shipment delayed</span></h3><small>No shipment confirmation has been received yet.</small></div></div>
            <div className="dashboard-attention-actions"><Link href={`/portal/orders/${encodeURIComponent(attentionOrder.id)}`} aria-label={`Review order ${attentionOrder.id}`}>Review order <ArrowRight aria-hidden="true" /></Link><Link href={fulfillmentSupportHref} className="dashboard-attention-support">Need help with the delay? <span>Contact fulfillment support</span><ArrowRight aria-hidden="true" /></Link></div>
            <dl className="dashboard-attention-facts">
              <div><span className="dashboard-attention-fact-icon"><CalendarDays aria-hidden="true" /></span><div><dt>Placed</dt><dd><strong>{formatPortalDate(attentionOrder.createdAt, session.locationId)}</strong><span>{formatPortalFreshnessTime(attentionOrder.createdAt, session.locationId)}</span></dd></div></div>
              <div><span className="dashboard-attention-fact-icon"><Package aria-hidden="true" /></span><div><dt>Order total</dt><dd><strong>{money(attentionOrder.total)}</strong><span>{attentionOrder.items.length} item{attentionOrder.items.length === 1 ? "" : "s"}</span></dd></div></div>
              <div><span className="dashboard-attention-fact-icon"><Clock3 aria-hidden="true" /></span><div><dt>Expected in</dt><dd><strong>{attentionOrder.eta.toLowerCase()}</strong></dd></div></div>
            </dl>
            <OrderProgress status={attentionOrder.status} createdAt={attentionOrder.createdAt} locationId={session.locationId} attention />
          </article> : <div className="dashboard-orders-empty"><PackageCheck aria-hidden="true" /><div><strong>You’re all caught up.</strong><p>New order issues will appear here.</p></div></div>}
        </section>

        <section className="dashboard-whats-next" aria-labelledby="dashboard-whats-next-title"><header><CalendarDays aria-hidden="true" /><div><h2 id="dashboard-whats-next-title">What&apos;s next</h2><p>Here&apos;s what to expect next.</p></div></header><div><article><Truck aria-hidden="true" /><div><strong>No confirmed deliveries scheduled today.</strong><span>We&apos;ll notify you as soon as there are updates.</span></div></article><article><CalendarDays aria-hidden="true" /><div><strong>Next expected shipment:</strong><span>{nextShipment ? `${nextShipment.id} · ${nextShipment.eta}` : "No active shipments"}</span></div></article></div></section>

        <section className="dashboard-recent-activity" aria-labelledby="dashboard-recent-activity-title"><header><FileText aria-hidden="true" /><div><h2 id="dashboard-recent-activity-title">Recent activity</h2><p>Latest updates on your supply orders.</p></div><Link href="/portal/orders">View all activity <ArrowRight aria-hidden="true" /></Link></header>{recentOrders.length ? <ul>{recentOrders.map((order) => <li key={order.id}><time dateTime={order.createdAt}>{formatPortalDate(order.createdAt, session.locationId)}</time><Link href={`/portal/orders/${encodeURIComponent(order.id)}`}>Order {order.id} · {getOrderStatus(order.status).label}</Link><span>{order.items.length} item{order.items.length === 1 ? "" : "s"} · {money(order.total)}</span></li>)}</ul> : <p>No order activity yet.</p>}<footer><Link href="/portal/orders"><List aria-hidden="true" />View all orders <ArrowRight aria-hidden="true" /></Link><Link href="/portal/supplies"><Plus aria-hidden="true" />Start supply order <ArrowRight aria-hidden="true" /></Link></footer></section>
      </div>

      <aside className="dashboard-glance-rail" aria-label="Current order and operator help">
        {permissions.canManageCart ? <CurrentOrderCard cartItems={cartItems} /> : null}
        {permissions.canViewSupport ? <section className="dashboard-help-resources"><div className="dashboard-resource-block"><Headphones aria-hidden="true" /><div><h2>Need help?</h2><p>Get support from the Budda&apos;s team.</p><Link href="/portal/support">Contact support <ArrowRight aria-hidden="true" /></Link></div></div></section> : null}
      </aside>
    </div>
  </section>;
};

export const DesktopDashboardVerdict = async ({ session, data, cartItemCount }: Pick<OperatorDashboardViewProps, "session" | "data"> & { cartItemCount: number }) => {
  const orderResult = await settle(data.orders);
  const orders = resolveDashboardCollectionState(orderResult, true).data;
  const operational = buildDashboardOperationalState({ orders, supportCases: [], bulletins: [], locationId: session.locationId });
  void operational; void cartItemCount;
  return <div className="dashboard-glance-intro"><p className="home-section-label">Good afternoon</p><h1 className="home-dashboard-title">Here&apos;s what&apos;s happening with supplies today.</h1></div>;
};
