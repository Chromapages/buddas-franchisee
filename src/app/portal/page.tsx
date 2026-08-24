import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { StatCard } from "@/src/components/portal/portal-primitives";
import Link from "next/link";
import {
  Package,
  Clock,
  FolderOpen,
  HelpCircle,
  Bell,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function PortalDashboardPage() {
  const session = (await getPortalSession())!;
  const orders = await defaultPortalStorage.getOrdersByLocation(session.locationId);
  const products = await defaultPortalStorage.getProductsByLocation(session.locationId);
  const resources = await defaultPortalStorage.getResourcesByLocation(session.locationId);
  const announcements = await defaultPortalStorage.getAnnouncements();

  const openOrdersCount = orders.filter(
    (o) => o.status === "Pending" || o.status === "Processing" || o.status === "Shipped",
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
            Store Operations Control
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-charcoal">
            Aloha, {session.email}
          </h2>
          <p className="text-xs sm:text-sm text-brand-charcoal/70">
            Active Unit: <strong>{session.locationName}</strong> ({session.locationId}) &bull; Role: <strong>{session.role}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/supplies"
            className="btn-primary text-xs font-bold uppercase tracking-wider !py-3 !px-5 flex items-center gap-2"
          >
            <Package className="w-4 h-4" aria-hidden="true" />
            Order Supplies
          </Link>
          <Link
            href="/portal/support"
            className="btn-outline text-xs font-bold uppercase tracking-wider !py-3 !px-5 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            Open Ticket
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Orders"
          value={openOrdersCount}
          description="In fulfillment or transit"
          icon={<Clock className="w-5 h-5" aria-hidden="true" />}
        />
        <StatCard
          title="Supply Catalog"
          value={products.length}
          description="Approved wholesale SKUs"
          icon={<Package className="w-5 h-5" aria-hidden="true" />}
        />
        <StatCard
          title="Document Library"
          value={resources.length}
          description="SOPs &amp; Brand Toolkits"
          icon={<FolderOpen className="w-5 h-5" aria-hidden="true" />}
        />
        <StatCard
          title="Baking Efficiency"
          value="98.4%"
          description="Roll batch yield target"
          trend="+1.2% this week"
          icon={<TrendingUp className="w-5 h-5" aria-hidden="true" />}
        />
      </div>

      {/* Announcements & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Column */}
        <div className="lg:col-span-7 bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-sand">
            <div>
              <h3 className="text-lg font-bold font-heading text-brand-charcoal">
                Recent Wholesale Orders
              </h3>
              <p className="text-xs text-brand-charcoal/60">
                Supply orders scoped to {session.locationName}
              </p>
            </div>
            <Link
              href="/portal/orders"
              className="text-xs font-bold uppercase tracking-wider text-brand-clay hover:underline inline-flex items-center gap-1"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-brand-sand/40 border border-brand-charcoal/5 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brand-charcoal">
                      {order.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-charcoal/70">
                    {order.items.length} item(s) &bull; ETA: {order.eta}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold font-heading text-base text-brand-charcoal block">
                    ${order.total.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-brand-charcoal/50 font-mono">
                    {order.invoiceId}
                  </span>
                </div>
              </div>
            ))}

            {orders.length === 0 ? (
              <p className="text-xs text-brand-charcoal/60 text-center py-6">
                No recent wholesale orders found.
              </p>
            ) : null}
          </div>
        </div>

        {/* Announcements Column */}
        <div className="lg:col-span-5 bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-brand-sand">
            <Bell className="w-4 h-4 text-brand-clay" aria-hidden="true" />
            <h3 className="text-lg font-bold font-heading text-brand-charcoal">
              Operations Bulletins
            </h3>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-brand-sand/40 border border-brand-charcoal/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-brand-charcoal">
                    {ann.title}
                  </h4>
                  <span className="text-[10px] text-brand-charcoal/50">
                    {new Date(ann.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                  {ann.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
