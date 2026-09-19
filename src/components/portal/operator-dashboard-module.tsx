import { Suspense } from "react";
import type { ReactNode } from "react";
import { BulletinModule, ContextRailSkeleton, DashboardResourceRail, DashboardSupportRail, HomeModuleSkeleton, OperatorBriefStatus, OperatorStatusSkeleton, RecentWholesaleOrdersModule, RecentWholesaleOrdersSkeleton } from "./dashboard-modules";
import { DashboardQuickActions, QuickActionsSkeleton } from "./dashboard-quick-actions";
import { PortalDataBoundary } from "./portal-data-boundary";
import { OperatorDashboardModuleViewed } from "./operator-analytics";
import type { DashboardModuleConfig, DashboardModuleSurface } from "@/src/features/portal/dashboard-authorization";
import type { OperatorDashboardViewProps } from "@/src/features/portal/operator-dashboard-view";

type DashboardModuleRendererProps = Pick<OperatorDashboardViewProps, "session" | "data" | "permissions"> & {
  idPrefix: string;
  surface: DashboardModuleSurface;
};

type DashboardModuleRenderer = (props: DashboardModuleRendererProps) => ReactNode;

const dashboardModuleRenderers: Record<DashboardModuleConfig["component"], DashboardModuleRenderer> = {
  "operator-status": ({ session, data, permissions, idPrefix, surface }) => <Suspense fallback={<OperatorStatusSkeleton desktop={surface === "desktop"} />}><OperatorBriefStatus {...data} idPrefix={idPrefix} locationId={session.locationId} canViewOrders={permissions.canViewOrders} canViewSupport={permissions.canViewSupport} canViewUpdates={permissions.canViewUpdates} trackDashboardView trackDashboardSurface={surface} roleCategory={session.role} locationScopeCount={session.managedLocationIds.length} /></Suspense>,
  "quick-actions": ({ permissions, idPrefix, surface }) => <Suspense fallback={<QuickActionsSkeleton idPrefix={idPrefix} />}><DashboardQuickActions idPrefix={idPrefix} surface={surface} capabilities={permissions.capabilities} /></Suspense>,
  "recent-orders": ({ session, data, idPrefix }) => data.orders ? <Suspense fallback={<RecentWholesaleOrdersSkeleton />}><RecentWholesaleOrdersModule orders={data.orders} locationId={session.locationId} idPrefix={idPrefix} /></Suspense> : null,
  "operations-bulletins": ({ session, data, idPrefix, surface }) => data.bulletins ? <PortalDataBoundary title="Bulletins unavailable" description="Corporate updates could not be loaded. Please try again."><Suspense fallback={surface === "desktop" ? <ContextRailSkeleton title="Operations bulletins" /> : <HomeModuleSkeleton title="Operations bulletins" />}><BulletinModule bulletins={data.bulletins} locationId={session.locationId} idPrefix={idPrefix} canViewBulletins /></Suspense></PortalDataBoundary> : null,
  "resource-rail": ({ session, data, idPrefix }) => data.resources ? <Suspense fallback={<ContextRailSkeleton title="Resources" />}><DashboardResourceRail resources={data.resources} locationId={session.locationId} idPrefix={idPrefix} /></Suspense> : null,
  "support-rail": ({ data, idPrefix }) => data.supportCases ? <Suspense fallback={<ContextRailSkeleton title="Support" />}><DashboardSupportRail supportCases={data.supportCases} idPrefix={idPrefix} /></Suspense> : null,
};

export const OperatorDashboardModule = ({
  module,
  surface,
  session,
  data,
  permissions,
}: Pick<OperatorDashboardViewProps, "session" | "data" | "permissions"> & {
  module: DashboardModuleConfig;
  surface: DashboardModuleSurface;
}) => {
  if (!module.surfaces.includes(surface)) return null;
  const idPrefix = `${surface}-${module.id}`;
  const content = dashboardModuleRenderers[module.component]({ session, data, permissions, idPrefix, surface });
  return <>{module.id !== "quick-actions" && module.id !== "resource-rail" && module.id !== "support-rail" ? <OperatorDashboardModuleViewed moduleId={module.id} surface={surface} /> : null}{content}</>;
};
