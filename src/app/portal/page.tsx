import { MobileOperatorDashboard } from "@/src/components/portal/mobile-operator-dashboard";
import { DesktopOperatorDashboard } from "@/src/components/portal/desktop-operator-dashboard";
import { getPortalEnvironmentNotice } from "@/src/features/portal/environment";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { getDashboardCapabilities, getOperatorDashboardModules } from "@/src/features/portal/dashboard-authorization";
import { composeOperatorDashboardData } from "@/src/features/portal/dashboard-composition";
import { getPortalCart } from "@/src/features/portal/cart";
import "./operator-home.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalDashboardPage() {
  const session = await requirePortalPermission("ACCESS_WORKSPACE");
  const capabilities = getDashboardCapabilities(session);
  const permissions = {
    capabilities,
    canViewOrders: capabilities["orders.view"],
    canViewSupport: capabilities["support.view"],
    canViewUpdates: capabilities["bulletins.view"],
    canViewBulletins: capabilities["bulletins.view"],
    canViewCatalog: capabilities["supplies.order"],
    canViewResources: capabilities["resources.view"],
    canManageCart: capabilities["supplies.order"],
    canCreateSupport: capabilities["support.create"],
  };
  const modules = getOperatorDashboardModules(session);
  const data = composeOperatorDashboardData(session, modules, permissions);
  const environmentNotice = getPortalEnvironmentNotice();
  const cartItems = permissions.canManageCart ? await getPortalCart(session) : [];

  return <><MobileOperatorDashboard session={session} data={data} permissions={permissions} modules={modules} environmentNotice={environmentNotice} /><DesktopOperatorDashboard session={session} data={data} permissions={permissions} modules={modules} environmentNotice={environmentNotice} cartItems={cartItems} /></>;
}
