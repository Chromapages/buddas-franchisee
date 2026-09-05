import type { PortalRole } from "@/src/features/portal/types";

export type PortalSession = {
  sessionId: string;
  userId: string;
  email: string;
  displayName?: string;
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
  return session.managedLocationIds.includes(targetLocationId);
};

export const formatSessionLocation = (session: PortalSession): string => {
  if (session.role === "admin") {
    return `System Administrator (${session.locationName})`;
  }
  return session.locationName;
};
