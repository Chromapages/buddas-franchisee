import type { PortalSession } from "@/src/lib/auth/auth-provider";
import { hasPortalPermission, type PortalPermission } from "./authorization.ts";

/**
 * Dashboard capabilities are presentation contracts backed directly by the
 * portal's server-authoritative permissions. They are intentionally not a
 * second authorization system.
 */
export type DashboardCapability =
  | "supplies.order"
  | "orders.view"
  | "support.view"
  | "support.create"
  | "resources.view"
  | "bulletins.view"
  | "growth_requests.view";

export type DashboardCapabilityFlags = Record<DashboardCapability, boolean>;
type DashboardCapabilityRequirement = { allOf?: readonly PortalPermission[]; anyOf?: readonly PortalPermission[] };

const dashboardCapabilityRequirements: Record<DashboardCapability, DashboardCapabilityRequirement> = {
  "supplies.order": { allOf: ["VIEW_CATALOG", "MANAGE_CART"] },
  "orders.view": { allOf: ["VIEW_ORDERS"] },
  "support.view": { allOf: ["VIEW_SUPPORT"] },
  "support.create": { allOf: ["VIEW_SUPPORT", "CREATE_SUPPORT"] },
  "resources.view": { allOf: ["VIEW_RESOURCES"] },
  // Bulletins are published through the authenticated workspace; there is no
  // separate bulletin permission in the current portal authorization model.
  "bulletins.view": { allOf: ["ACCESS_WORKSPACE"] },
  "growth_requests.view": { anyOf: ["CREATE_EXPANSION_REQUEST", "MANAGE_EXPANSION_REQUESTS"] },
};

export const getDashboardCapabilities = (session: PortalSession): DashboardCapabilityFlags =>
  Object.fromEntries(
    (Object.keys(dashboardCapabilityRequirements) as DashboardCapability[]).map((capability) => [
      capability,
      (dashboardCapabilityRequirements[capability].allOf ?? []).every((permission) => hasPortalPermission(session, permission, session.locationId))
        && (dashboardCapabilityRequirements[capability].anyOf?.some((permission) => hasPortalPermission(session, permission, session.locationId)) ?? true),
    ]),
  ) as DashboardCapabilityFlags;

export type DashboardWidgetId =
  | "orders-in-motion"
  | "support-replies"
  | "required-updates"
  | "recent-orders"
  | "operations-bulletins"
  | "support-shortcut"
  | "supply-shortcut"
  | "resource-shortcut";

export type DashboardWidgetPolicy = {
  /** Retained as an auditable direct mapping to the server permission contract. */
  readPermission: PortalPermission;
  actionPermission?: PortalPermission;
  readCapability: DashboardCapability;
  actionCapability?: DashboardCapability;
  locationScope: "active-unit" | "targeted-active-unit";
  organizationScope: "inherited-from-active-unit" | "audience-targeted";
  unavailablePresentation: "omit" | "explain";
  emptyState: string;
};

export type DashboardModuleId = "operator-status" | "quick-actions" | "recent-orders" | "operations-bulletins" | "resource-rail" | "support-rail";
export type DashboardModuleSurface = "mobile" | "desktop";
export type DashboardModuleComponent = "operator-status" | "quick-actions" | "recent-orders" | "operations-bulletins" | "resource-rail" | "support-rail";
export type DashboardDataDependency = "orders" | "bulletins" | "supportCases" | "resources";
export type DashboardDesktopRegion = "priority" | "quick-actions" | "primary" | "rail";
export type DashboardMinimumContentState = "always" | "meaningful";

export type DashboardModuleConfig = {
  id: DashboardModuleId;
  component: DashboardModuleComponent;
  priority: number;
  surfaces: readonly DashboardModuleSurface[];
  requiredPermissions: readonly PortalPermission[];
  requiredCapabilities?: readonly DashboardCapability[];
  capabilityAvailability?: "all" | "any";
  dataDependencies: readonly DashboardDataDependency[];
  columnSpan: Readonly<Record<DashboardModuleSurface, 4 | 6 | 8 | 12>>;
  desktopRegion: DashboardDesktopRegion;
  locationScope: "active-unit" | "targeted-active-unit";
  /** Whether the module may occupy space without real, current context. */
  minimumContentState: DashboardMinimumContentState;
  emptyBehavior: "all-clear" | "compact" | "omit";
  loadingBehavior: "skeleton" | "preserve";
  destination?: string;
};

// This is the dashboard's authorization contract. Server components use it before
// creating a loader, so unavailable records never enter the rendered payload.
export const dashboardWidgetPolicies: Record<DashboardWidgetId, DashboardWidgetPolicy> = {
  "orders-in-motion": {
    readPermission: "VIEW_ORDERS",
    readCapability: "orders.view",
    locationScope: "active-unit",
    organizationScope: "inherited-from-active-unit",
    unavailablePresentation: "explain",
    emptyState: "No orders in motion.",
  },
  "support-replies": {
    readPermission: "VIEW_SUPPORT",
    actionPermission: "CREATE_SUPPORT",
    readCapability: "support.view",
    actionCapability: "support.create",
    locationScope: "active-unit",
    organizationScope: "inherited-from-active-unit",
    unavailablePresentation: "explain",
    emptyState: "No support replies need attention.",
  },
  "required-updates": {
    readPermission: "ACCESS_WORKSPACE",
    actionPermission: "ACKNOWLEDGE_BRAND_STANDARDS",
    readCapability: "bulletins.view",
    locationScope: "targeted-active-unit",
    organizationScope: "audience-targeted",
    unavailablePresentation: "explain",
    emptyState: "No required updates are outstanding.",
  },
  "recent-orders": {
    readPermission: "VIEW_ORDERS",
    readCapability: "orders.view",
    locationScope: "active-unit",
    organizationScope: "inherited-from-active-unit",
    unavailablePresentation: "omit",
    emptyState: "No recent supply orders.",
  },
  "operations-bulletins": {
    readPermission: "ACCESS_WORKSPACE",
    actionPermission: "ACKNOWLEDGE_BRAND_STANDARDS",
    readCapability: "bulletins.view",
    locationScope: "targeted-active-unit",
    organizationScope: "audience-targeted",
    unavailablePresentation: "explain",
    emptyState: "No current bulletins.",
  },
  "support-shortcut": {
    readPermission: "VIEW_SUPPORT",
    actionPermission: "CREATE_SUPPORT",
    readCapability: "support.view",
    actionCapability: "support.create",
    locationScope: "active-unit",
    organizationScope: "inherited-from-active-unit",
    unavailablePresentation: "omit",
    emptyState: "",
  },
  "supply-shortcut": {
    readPermission: "VIEW_CATALOG",
    readCapability: "supplies.order",
    locationScope: "active-unit",
    organizationScope: "inherited-from-active-unit",
    unavailablePresentation: "omit",
    emptyState: "",
  },
  "resource-shortcut": {
    readPermission: "VIEW_RESOURCES",
    readCapability: "resources.view",
    locationScope: "targeted-active-unit",
    organizationScope: "audience-targeted",
    unavailablePresentation: "omit",
    emptyState: "",
  },
};

export const DEFAULT_OPERATOR_DASHBOARD_MODULES: readonly DashboardModuleConfig[] = [
  { id: "operator-status", component: "operator-status", priority: 100, surfaces: ["mobile", "desktop"], requiredPermissions: ["ACCESS_WORKSPACE"], requiredCapabilities: ["orders.view", "support.view", "bulletins.view"], capabilityAvailability: "any", dataDependencies: ["orders", "bulletins", "supportCases"], columnSpan: { mobile: 4, desktop: 12 }, desktopRegion: "priority", locationScope: "active-unit", minimumContentState: "always", emptyBehavior: "all-clear", loadingBehavior: "skeleton" },
  { id: "quick-actions", component: "quick-actions", priority: 200, surfaces: ["mobile", "desktop"], requiredPermissions: ["ACCESS_WORKSPACE"], requiredCapabilities: ["supplies.order", "resources.view", "support.create"], capabilityAvailability: "any", dataDependencies: [], columnSpan: { mobile: 4, desktop: 12 }, desktopRegion: "quick-actions", locationScope: "active-unit", minimumContentState: "always", emptyBehavior: "omit", loadingBehavior: "preserve" },
  { id: "recent-orders", component: "recent-orders", priority: 300, surfaces: ["mobile", "desktop"], requiredPermissions: ["VIEW_ORDERS"], requiredCapabilities: ["orders.view"], dataDependencies: ["orders"], columnSpan: { mobile: 4, desktop: 8 }, desktopRegion: "primary", locationScope: "active-unit", minimumContentState: "always", emptyBehavior: "compact", loadingBehavior: "skeleton", destination: "/portal/orders" },
  { id: "operations-bulletins", component: "operations-bulletins", priority: 300, surfaces: ["mobile", "desktop"], requiredPermissions: ["ACCESS_WORKSPACE"], requiredCapabilities: ["bulletins.view"], dataDependencies: ["bulletins"], columnSpan: { mobile: 4, desktop: 4 }, desktopRegion: "rail", locationScope: "targeted-active-unit", minimumContentState: "meaningful", emptyBehavior: "compact", loadingBehavior: "skeleton", destination: "/portal/bulletins" },
  { id: "support-rail", component: "support-rail", priority: 200, surfaces: ["desktop"], requiredPermissions: ["VIEW_SUPPORT"], requiredCapabilities: ["support.view"], dataDependencies: ["supportCases"], columnSpan: { mobile: 4, desktop: 4 }, desktopRegion: "rail", locationScope: "active-unit", minimumContentState: "meaningful", emptyBehavior: "omit", loadingBehavior: "preserve", destination: "/portal/support" },
  { id: "resource-rail", component: "resource-rail", priority: 400, surfaces: ["desktop"], requiredPermissions: ["VIEW_RESOURCES"], requiredCapabilities: ["resources.view"], dataDependencies: ["resources"], columnSpan: { mobile: 4, desktop: 4 }, desktopRegion: "rail", locationScope: "targeted-active-unit", minimumContentState: "meaningful", emptyBehavior: "omit", loadingBehavior: "preserve", destination: "/portal/resources" },
];

export const canAccessDashboardWidget = (
  session: PortalSession,
  widgetId: DashboardWidgetId,
): boolean => {
  const policy = dashboardWidgetPolicies[widgetId];
  return getDashboardCapabilities(session)[policy.readCapability];
};

export const canActFromDashboardWidget = (
  session: PortalSession,
  widgetId: DashboardWidgetId,
): boolean => {
  const policy = dashboardWidgetPolicies[widgetId];
  return canAccessDashboardWidget(session, widgetId)
    && (!policy.actionCapability || getDashboardCapabilities(session)[policy.actionCapability]);
};

export const canAccessDashboardModule = (session: PortalSession, module: DashboardModuleConfig): boolean => {
  if (!module.requiredPermissions.every((permission) => hasPortalPermission(session, permission, session.locationId))) return false;
  if (!module.requiredCapabilities?.length) return true;
  const capabilities = getDashboardCapabilities(session);
  const access = module.requiredCapabilities.map((capability) => capabilities[capability]);
  return module.capabilityAvailability === "any" ? access.some(Boolean) : access.every(Boolean);
};

export const getOperatorDashboardModules = (session: PortalSession): DashboardModuleConfig[] =>
  DEFAULT_OPERATOR_DASHBOARD_MODULES
    .filter((module) => canAccessDashboardModule(session, module))
    .sort((left, right) => left.priority - right.priority);
