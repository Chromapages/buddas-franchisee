import type { PortalSession } from "@/src/lib/auth/auth-provider";
import { loadPortalModule } from "./module-loader";
import { defaultPortalStorage } from "./storage-adapter";
import { readDashboardBulletins, readDashboardResources, readDashboardSupport } from "./dashboard-reads";
import type { DashboardModuleConfig } from "./dashboard-authorization";
import type { OperatorDashboardData, OperatorDashboardPermissions } from "./operator-dashboard-view";

// Module selection has already passed server-side authorization by the time this
// function runs. The dependency list still gates each loader so a module never
// starts a request for data it cannot render for the current session.
export const composeOperatorDashboardData = (
  session: PortalSession,
  modules: readonly DashboardModuleConfig[],
  permissions: OperatorDashboardPermissions,
): OperatorDashboardData => {
  const dependencies = new Set(modules.flatMap((module) => module.dataDependencies));
  return {
    orders: dependencies.has("orders") && permissions.capabilities["orders.view"]
      ? loadPortalModule("dashboard orders", () => defaultPortalStorage.getOrdersByLocation(session.locationId))
      : undefined,
    bulletins: dependencies.has("bulletins") && permissions.capabilities["bulletins.view"]
      ? loadPortalModule("dashboard bulletins", () => readDashboardBulletins(session))
      : undefined,
    supportCases: dependencies.has("supportCases") && permissions.capabilities["support.view"]
      ? loadPortalModule("dashboard support", () => readDashboardSupport(session.locationId))
      : undefined,
    resources: dependencies.has("resources") && permissions.capabilities["resources.view"]
      ? loadPortalModule("dashboard resources", () => readDashboardResources(session.locationId, session.role))
      : undefined,
  };
};
