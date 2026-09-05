import type { PortalSession } from "@/src/lib/auth/auth-provider";

export type PortalPermission =
  | "ACCESS_WORKSPACE"
  | "VIEW_CATALOG"
  | "MANAGE_CART"
  | "CREATE_ORDER"
  | "VIEW_ORDERS"
  | "VIEW_RESOURCES"
  | "CREATE_SUPPORT"
  | "VIEW_SUPPORT"
  | "VIEW_ACCOUNT"
  | "MANAGE_FOOD_SAFETY_CREDENTIALS"
  | "ACKNOWLEDGE_BRAND_STANDARDS"
  | "CREATE_EXPANSION_REQUEST"
  | "MANAGE_EXPANSION_REQUESTS"
  | "ADMINISTER_PORTAL";

const rolePermissions: Record<PortalSession["role"], readonly PortalPermission[]> = {
  franchisee: ["ACCESS_WORKSPACE", "VIEW_CATALOG", "MANAGE_CART", "CREATE_ORDER", "VIEW_ORDERS", "VIEW_RESOURCES", "CREATE_SUPPORT", "VIEW_SUPPORT", "VIEW_ACCOUNT", "MANAGE_FOOD_SAFETY_CREDENTIALS", "ACKNOWLEDGE_BRAND_STANDARDS", "CREATE_EXPANSION_REQUEST"],
  admin: ["ACCESS_WORKSPACE", "VIEW_CATALOG", "MANAGE_CART", "CREATE_ORDER", "VIEW_ORDERS", "VIEW_RESOURCES", "CREATE_SUPPORT", "VIEW_SUPPORT", "VIEW_ACCOUNT", "MANAGE_FOOD_SAFETY_CREDENTIALS", "ACKNOWLEDGE_BRAND_STANDARDS", "MANAGE_EXPANSION_REQUESTS", "ADMINISTER_PORTAL"],
};

export const hasPortalPermission = (
  session: Pick<PortalSession, "role" | "managedLocationIds" | "locationId">,
  permission: PortalPermission,
  locationId = session.locationId,
): boolean => session.managedLocationIds.includes(locationId)
  && Boolean(rolePermissions[session.role]?.includes(permission));

export class PortalAuthorizationError extends Error {
  constructor() {
    super("Portal authorization denied.");
  }
}

export const assertPortalPermission = (
  session: PortalSession,
  permission: PortalPermission,
  locationId = session.locationId,
): PortalSession => {
  if (!session.userId || !session.email || !hasPortalPermission(session, permission, locationId)) {
    throw new PortalAuthorizationError();
  }
  return session;
};
