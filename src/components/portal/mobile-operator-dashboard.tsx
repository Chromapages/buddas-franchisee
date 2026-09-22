import { Suspense } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Truck } from "lucide-react";
import { DashboardFreshness } from "./dashboard-modules";
import { OperatorDashboardModule } from "./operator-dashboard-module";
import type { OperatorDashboardViewProps } from "@/src/features/portal/operator-dashboard-view";
import { getUnitTimeZone } from "@/src/features/portal/date-time";
import { isOrderInMotion } from "@/src/features/portal/order-status";

const greetingForUnit = (unitId: string) => {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: getUnitTimeZone(unitId) }).format(new Date()));
  return hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";
};

const MobileWhatsNext = async ({ orders }: Pick<OperatorDashboardViewProps["data"], "orders">) => {
  const activeOrders = orders ? (await orders.catch(() => [])).filter((order) => isOrderInMotion(order.status)) : [];
  const nextOrder = activeOrders[0];
  return <section className="mobile-dashboard-next" aria-labelledby="mobile-dashboard-next-title">
    <header><p className="home-section-label">What&apos;s next</p><Link href="/portal/orders">View all <ArrowRight aria-hidden="true" /></Link></header>
    <Link href="/portal/orders" aria-labelledby="mobile-dashboard-next-title">
      <span><Truck aria-hidden="true" /></span>
      <span><strong id="mobile-dashboard-next-title">{nextOrder ? `Next expected shipment: ${nextOrder.id}` : "No deliveries scheduled."}</strong><small>{nextOrder ? `Expected ${nextOrder.eta}` : "No active shipments for this unit."}</small></span>
      <ArrowRight aria-hidden="true" />
    </Link>
  </section>;
};

export const MobileOperatorDashboard = ({ session, data, permissions, modules, environmentNotice }: OperatorDashboardViewProps) => {
  const renderModule = (id: (typeof modules)[number]["id"]) => {
    const module = modules.find((candidate) => candidate.id === id);
    return module ? <OperatorDashboardModule key={module.id} module={module} surface="mobile" session={session} data={data} permissions={permissions} /> : null;
  };
  return <div className="operator-command-center operator-dashboard-mobile">
    <header className="home-header"><div><h1 className="home-dashboard-title">{greetingForUnit(session.locationId)}</h1><p className="mobile-dashboard-subtitle">Here&apos;s what&apos;s happening.</p><Suspense fallback={<p className="home-freshness" role="status">Loading dashboard data…</p>}><DashboardFreshness {...data} locationId={session.locationId} /></Suspense></div></header>
    {environmentNotice ? <p className="home-environment"><AlertCircle size={16} aria-hidden="true" />{environmentNotice}</p> : null}
    {renderModule("operator-status")}
    <Suspense fallback={null}><MobileWhatsNext orders={data.orders} /></Suspense>
    {renderModule("quick-actions")}
    {renderModule("recent-orders")}
  </div>;
};
