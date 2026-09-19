import { Suspense } from "react";
import { AlertCircle } from "lucide-react";
import { DashboardFreshness } from "./dashboard-modules";
import { OperatorDashboardModule } from "./operator-dashboard-module";
import type { OperatorDashboardViewProps } from "@/src/features/portal/operator-dashboard-view";

export const MobileOperatorDashboard = ({ session, data, permissions, modules, environmentNotice }: OperatorDashboardViewProps) => <div className="operator-command-center operator-dashboard-mobile">
  <header className="home-header"><div><p className="home-section-label">Operator brief</p><div className="home-dashboard-title" role="heading" aria-level={1}>Dashboard</div><Suspense fallback={<p className="home-freshness" role="status">Loading dashboard data…</p>}><DashboardFreshness {...data} locationId={session.locationId} /></Suspense></div></header>
  {environmentNotice ? <p className="home-environment"><AlertCircle size={16} aria-hidden="true" />{environmentNotice}</p> : null}
  {modules.map((module) => <OperatorDashboardModule key={module.id} module={module} surface="mobile" session={session} data={data} permissions={permissions} />)}
</div>;
