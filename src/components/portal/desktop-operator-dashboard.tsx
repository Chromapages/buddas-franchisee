import { Suspense } from "react";
import { AlertCircle } from "lucide-react";
import { DashboardFreshness, RecentWholesaleOrdersSkeleton } from "./dashboard-modules";
import { DesktopDashboardOverview, DesktopDashboardVerdict } from "./desktop-dashboard-overview";
import type { OperatorDashboardViewProps } from "@/src/features/portal/operator-dashboard-view";
import { getUnitTimeZone } from "@/src/features/portal/date-time";
import type { PortalCartItem } from "@/src/features/portal/cart";

const dashboardDate = (date: Date, unitId: string) => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric", timeZone: getUnitTimeZone(unitId) }).format(date);

export const DesktopOperatorDashboard = ({ session, data, permissions, environmentNotice, cartItems }: OperatorDashboardViewProps & { cartItems: PortalCartItem[] }) => {
  const now = new Date();
  return <div className="operator-command-center operator-dashboard-desktop">
  <header className="desktop-dashboard-header"><Suspense fallback={<div><p className="home-section-label">Orders</p><h1 className="home-dashboard-title">Checking order status…</h1></div>}><DesktopDashboardVerdict session={session} data={data} cartItemCount={cartItems.reduce((count, item) => count + item.quantity, 0)} /></Suspense><div className="dashboard-date-context"><time dateTime={now.toISOString()}>{dashboardDate(now, session.locationId)}</time><Suspense fallback={<p className="home-freshness" role="status">Checking dashboard data…</p>}><DashboardFreshness {...data} locationId={session.locationId} /></Suspense></div></header>
  {environmentNotice ? <p className="home-environment"><AlertCircle size={16} aria-hidden="true" />{environmentNotice}</p> : null}
  <Suspense fallback={<div className="dashboard-overview-skeleton"><RecentWholesaleOrdersSkeleton /></div>}><DesktopDashboardOverview session={session} data={data} permissions={permissions} cartItems={cartItems} /></Suspense>
  </div>;
};
