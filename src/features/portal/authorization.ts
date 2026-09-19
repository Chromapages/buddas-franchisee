import type { PortalSession } from "@/src/lib/auth/auth-provider";

export type PortalPermission =
  | "ACCESS_WORKSPACE"
  | "VIEW_CATALOG"
  | "VIEW_WHOLESALE_PRICING"
  | "MANAGE_CART"
  | "CREATE_ORDER"
  | "REQUEST_ORDER_CANCELLATION"
  | "VIEW_ORDERS"
  | "VIEW_ORDER_DOCUMENTS"
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
  franchisee: ["ACCESS_WORKSPACE", "VIEW_CATALOG", "VIEW_WHOLESALE_PRICING", "MANAGE_CART", "CREATE_ORDER", "REQUEST_ORDER_CANCELLATION", "VIEW_ORDERS", "VIEW_ORDER_DOCUMENTS", "VIEW_RESOURCES", "CREATE_SUPPORT", "VIEW_SUPPORT", "VIEW_ACCOUNT", "MANAGE_FOOD_SAFETY_CREDENTIALS", "ACKNOWLEDGE_BRAND_STANDARDS", "CREATE_EXPANSION_REQUEST"],
  admin: ["ACCESS_WORKSPACE", "VIEW_CATALOG", "VIEW_WHOLESALE_PRICING", "MANAGE_CART", "CREATE_ORDER", "REQUEST_ORDER_CANCELLATION", "VIEW_ORDERS", "VIEW_ORDER_DOCUMENTS", "VIEW_RESOURCES", "CREATE_SUPPORT", "VIEW_SUPPORT", "VIEW_ACCOUNT", "MANAGE_FOOD_SAFETY_CREDENTIALS", "ACKNOWLEDGE_BRAND_STANDARDS", "MANAGE_EXPANSION_REQUESTS", "ADMINISTER_PORTAL"],
};

export type SupplyCapabilities = {
  canViewCatalog: boolean;
  canViewWholesalePricing: boolean;
  canManageCart: boolean;
  canSubmitOrder: boolean;
  canViewOrderHistory: boolean;
};

export type OrderCapabilities = {
  canViewOrders: boolean;
  canViewDocuments: boolean;
  canViewShipmentTracking: boolean;
  canRequestCancellation: boolean;
};

export const getOrderCapabilities = (
  session: Pick<PortalSession, "role" | "managedLocationIds" | "locationId">,
): OrderCapabilities => ({
  canViewOrders: hasPortalPermission(session, "VIEW_ORDERS"),
  canViewDocuments: hasPortalPermission(session, "VIEW_ORDER_DOCUMENTS"),
  canViewShipmentTracking: hasPortalPermission(session, "VIEW_ORDERS"),
  canRequestCancellation: hasPortalPermission(session, "REQUEST_ORDER_CANCELLATION"),
});

export const getSupplyCapabilities = (session: Pick<PortalSession, "role" | "managedLocationIds" | "locationId">): SupplyCapabilities => ({
  canViewCatalog: hasPortalPermission(session, "VIEW_CATALOG"),
  canViewWholesalePricing: hasPortalPermission(session, "VIEW_WHOLESALE_PRICING"),
  canManageCart: hasPortalPermission(session, "MANAGE_CART"),
  canSubmitOrder: hasPortalPermission(session, "CREATE_ORDER"),
  canViewOrderHistory: hasPortalPermission(session, "VIEW_ORDERS"),
});

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
