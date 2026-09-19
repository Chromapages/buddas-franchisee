import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalBulletin, PortalOrder, PortalResource, PortalSupportCase } from "./types.ts";
import type { DashboardCapabilityFlags, DashboardModuleConfig } from "./dashboard-authorization.ts";

export type OperatorDashboardData = {
  orders?: Promise<PortalOrder[]>;
  bulletins?: Promise<PortalBulletin[]>;
  supportCases?: Promise<PortalSupportCase[]>;
  resources?: Promise<PortalResource[]>;
};

export type OperatorDashboardPermissions = {
  capabilities: DashboardCapabilityFlags;
  canViewOrders: boolean;
  canViewSupport: boolean;
  canViewUpdates: boolean;
  canViewBulletins: boolean;
  canViewCatalog: boolean;
  canViewResources: boolean;
  canManageCart: boolean;
  canCreateSupport: boolean;
};

export type OperatorDashboardViewProps = {
  session: PortalSession;
  data: OperatorDashboardData;
  permissions: OperatorDashboardPermissions;
  modules: DashboardModuleConfig[];
  environmentNotice: string | null;
};
