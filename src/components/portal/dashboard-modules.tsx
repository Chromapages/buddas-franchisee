import Link from "next/link";
import { AlertCircle, ArrowRight, Bell, Package, MessageSquare } from "lucide-react";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalBulletin, PortalOrder, PortalSupportCase } from "@/src/features/portal/types";
import { getVisibleBulletins, requiresBulletinAction } from "@/src/features/portal/bulletins";
import { getOrderStatus, getOrderStatusAccessibleLabel, getOrderStatusNotification, isOrderInMotion, requiresOrderOperatorAction } from "@/src/features/portal/order-status";
import { formatPortalDate } from "@/src/features/portal/date-time";
import { InteractiveBulletinList } from "@/src/components/portal/interactive-bulletin-list";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";

const resolveBulletins = async (session: PortalSession, bulletins: Promise<PortalBulletin[]>) => {
  const [rows, location] = await Promise.all([bulletins, defaultPortalStorage.getLocationById(session.locationId).catch(() => null)]);
  return getVisibleBulletins(rows, session.locationId, session.role, location);
};
const orderHref = (id: string) => "/portal/orders?orderId=" + encodeURIComponent(id);

export const NeedsAttentionModule = async ({ session, orders, bulletins, supportCases }: {
  session: PortalSession; orders: Promise<PortalOrder[]>; bulletins: Promise<PortalBulletin[]>; supportCases: Promise<PortalSupportCase[]>;
}) => {
  const [orderRows, updates, tickets] = await Promise.all([orders, resolveBulletins(session, bulletins), supportCases]);
  const items = [
    ...updates.filter(requiresBulletinAction).map((bulletin) => ({
      id: "bulletin-" + bulletin.id, title: bulletin.title, detail: "Required operations update",
      href: "#bulletins-heading", action: "Review update",
    })),
    ...tickets.filter((ticket) => ticket.status !== "Resolved" && ticket.operatorActionRequired).map((ticket) => ({
      id: "ticket-" + ticket.id, title: ticket.subject, detail: ticket.id + " · Operations Support is awaiting your response",
      href: "/portal/support?ticketId=" + encodeURIComponent(ticket.id), action: "Respond",
    })),
    ...orderRows.filter((order) => requiresOrderOperatorAction(order.status)).map((order) => ({
      id: "order-" + order.id, title: order.id + " · " + getOrderStatusNotification(order.status).title,
      detail: getOrderStatus(order.status).meaning, href: orderHref(order.id), action: "Review order",
    })),
  ];
  if (!items.length) return null;
  return <section className="dashboard-attention" aria-labelledby="attention-heading">
    <div className="dashboard-section-heading"><AlertCircle size={18} aria-hidden="true" /><h2 id="attention-heading">Needs your attention</h2></div>
    <ul>{items.map((item) => <li key={item.id}><Link href={item.href}><div><strong>{item.title}</strong><p>{item.detail}</p></div><span>{item.action}<ArrowRight size={16} aria-hidden="true" /></span></Link></li>)}</ul>
  </section>;
};

export const OperationalPulseModule = async ({ session, orders, bulletins, supportCases }: {
  session: PortalSession; orders: Promise<PortalOrder[]>; bulletins: Promise<PortalBulletin[]>; supportCases: Promise<PortalSupportCase[]>;
}) => {
  const [orderRows, updates, tickets] = await Promise.all([orders, resolveBulletins(session, bulletins), supportCases]);
  const active = orderRows.filter((order) => isOrderInMotion(order.status)).length;
  const required = updates.filter(requiresBulletinAction).length;
  const open = tickets.filter((ticket) => ticket.status !== "Resolved").length;
  return <section className="dashboard-pulse" aria-labelledby="pulse-heading">
    <h2 id="pulse-heading">Operational pulse</h2>
    <div className="dashboard-pulse-grid">
      <Link href="/portal/orders?view=in-motion" aria-label={active + " orders in motion. View active orders."}><Package size={18} aria-hidden="true" /><div><span>Orders in motion</span><strong>{active ? active + " active" : "No active orders"}</strong></div><ArrowRight size={16} aria-hidden="true" /></Link>
      <Link href="/portal/support" aria-label={open + " open support tickets. Open Operations Support."}><MessageSquare size={18} aria-hidden="true" /><div><span>Operations Support</span><strong>{open ? open + " open ticket" + (open === 1 ? "" : "s") : "No open tickets"}</strong></div><ArrowRight size={16} aria-hidden="true" /></Link>
      <Link href="#bulletins-heading" aria-label={required + " required updates. Jump to Operations bulletins."}><Bell size={18} aria-hidden="true" /><div><span>Required updates</span><strong>{required ? required + " to review" : "None outstanding"}</strong></div><ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  </section>;
};

export const RecentOrdersModule = async ({ orders, locationId }: { orders: Promise<PortalOrder[]>; locationId: string }) => {
  const rows = [...await orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  return <section className="dashboard-panel dashboard-orders" aria-labelledby="orders-heading">
    <div className="dashboard-panel-header"><div><p className="dashboard-eyebrow">Supply activity</p><h2 id="orders-heading">Recent wholesale orders</h2></div><Link href="/portal/orders">All orders<ArrowRight size={16} aria-hidden="true" /></Link></div>
    {rows.length ? <ul className="dashboard-order-list">{rows.map((order) => {
      const status = getOrderStatus(order.status);
      return <li key={order.id}><Link href={orderHref(order.id)} aria-label={"Open order " + order.id + ". " + getOrderStatusAccessibleLabel(order.status) + " Placed " + formatPortalDate(order.createdAt, locationId) + ". " + order.items.length + " line items. " + (order.invoiceId ? "Invoice " + order.invoiceId + ". " : "") + "Total " + order.total.toFixed(2) + " US dollars."}>
        <div className="dashboard-order-main"><div className="dashboard-order-identity"><strong>Order {order.id}</strong><span className="dashboard-order-status" data-attention={status.operatorActionRequired || undefined}>{status.label}</span></div>
          <p>Placed {formatPortalDate(order.createdAt, locationId)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
          {order.invoiceId ? <p className="dashboard-invoice">Invoice {order.invoiceId}</p> : null}
          {order.status === "CANCELLED" ? <p className="dashboard-order-note">Cancelled · no upcoming fulfillment</p> : !status.isTerminal && order.eta ? <p className="dashboard-order-note">Shipment timing: {order.eta}</p> : null}
        </div><div className="dashboard-order-total"><span>Order total</span><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.total)}</strong><ArrowRight size={18} aria-hidden="true" /></div>
      </Link></li>;
    })}</ul> : <div className="dashboard-empty"><h3>No wholesale orders yet</h3><p>Orders for this unit will appear here after submission.</p><Link href="/portal/supplies">Browse supplies<ArrowRight size={16} aria-hidden="true" /></Link></div>}
    {rows.length ? <p className="dashboard-panel-footnote">Showing the latest {rows.length} order{rows.length === 1 ? "" : "s"} for this unit.</p> : null}
  </section>;
};

export const BulletinModule = async ({ session, bulletins }: { session: PortalSession; bulletins: Promise<PortalBulletin[]> }) => {
  const rows = await resolveBulletins(session, bulletins);
  return <section className="dashboard-panel dashboard-bulletins" aria-labelledby="bulletins-heading">
    <div className="dashboard-panel-header"><div><p className="dashboard-eyebrow">From operations</p><h2 id="bulletins-heading">Operations bulletins</h2></div><Bell size={18} aria-hidden="true" /></div>
    {rows.length ? <div className="dashboard-bulletin-content"><InteractiveBulletinList bulletins={rows} /></div> : <div className="dashboard-empty"><h3>No current bulletins</h3><p>Published operations updates for this unit will appear here.</p></div>}
    <div className="dashboard-resource-link"><div><strong>Looking for a manual or SOP?</strong><p>Find approved materials in the Resource Center.</p></div><Link href="/portal/resources">Open Resource Center<ArrowRight size={16} aria-hidden="true" /></Link></div>
  </section>;
};

const ModuleSkeleton = ({ title, className = "" }: { title: string; className?: string }) => <section className={"dashboard-panel dashboard-skeleton " + className} aria-busy="true" aria-label={"Loading " + title}><h2>{title}</h2><div /><div /><span className="sr-only" role="status">Loading {title}</span></section>;
export const NeedsAttentionSkeleton = () => <ModuleSkeleton title="Needs your attention" />;
export const OperationalPulseSkeleton = () => <ModuleSkeleton title="Operational pulse" />;
export const RecentOrdersSkeleton = () => <ModuleSkeleton title="Recent wholesale orders" className="dashboard-orders" />;
export const BulletinModuleSkeleton = () => <ModuleSkeleton title="Operations bulletins" className="dashboard-bulletins" />;
