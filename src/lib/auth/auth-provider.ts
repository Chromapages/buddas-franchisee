import type { PortalRole } from "@/src/features/portal/types";

export type PortalSession = {
  userId: string;
  email: string;
  role: PortalRole;
  locationId: string;
  locationName: string;
  managedLocationIds: string[];
  expiresAt: number;
};

export const hasRoleAccess = (
  userRole: PortalRole,
  requiredRole: PortalRole,
): boolean => {
  if (userRole === "admin") return true;
  return userRole === requiredRole;
};

export const canAccessLocation = (
  session: PortalSession,
  targetLocationId: string,
): boolean => {
  if (session.role === "admin") return true;
  if (session.locationId === targetLocationId) return true;
  return session.managedLocationIds.includes(targetLocationId);
};

export const formatSessionLocation = (session: PortalSession): string => {
  if (session.role === "admin") {
    return `System Administrator (${session.locationName})`;
  }
  return session.locationName;
};
