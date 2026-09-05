import type { PortalRole } from "@/src/features/portal/types";
import type { PortalSession } from "./auth-provider";
import { randomUUID } from "node:crypto";

export type SupabaseUserMetadata = {
  displayName?: string;
  role?: PortalRole;
  locationId?: string;
  locationName?: string;
  managedLocationIds?: string[];
};

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: SupabaseUserMetadata;
  app_metadata?: {
    role?: string;
    portal_access?: boolean;
    location_id?: string;
    location_name?: string;
    managed_location_ids?: string[];
  };
};

export const mapSupabaseUserToPortalSession = (
  user: SupabaseUser,
  defaultLocationId: string = "HNL-014",
  defaultLocationName: string = "La'ie Origin Grill",
): PortalSession => {
  const metadata = user.user_metadata || {};
  const appMeta = user.app_metadata || {};
  const email = user.email?.trim();
  if (!email) throw new Error("Authenticated operators must have an email address.");

  if (appMeta.portal_access !== true) {
    throw new Error("Authenticated user is not authorized for the Operator Workspace.");
  }
  if (
    (appMeta.role !== "admin" && appMeta.role !== "franchisee")
    || !appMeta.location_id
    || !appMeta.location_name
    || !Array.isArray(appMeta.managed_location_ids)
    || !appMeta.managed_location_ids.includes(appMeta.location_id)
  ) {
    throw new Error("Operator Workspace access is not fully assigned.");
  }
  const role: PortalRole = appMeta.role;
  const locationId = appMeta.location_id;
  const locationName = appMeta.location_name;
  const managedLocationIds = appMeta.managed_location_ids;
  const displayName = typeof metadata.displayName === "string"
    && metadata.displayName.trim().length > 0
    && !metadata.displayName.includes("@")
    ? metadata.displayName.trim()
    : undefined;

  return {
    sessionId: randomUUID(),
    userId: user.id,
    email,
    displayName,
    role,
    locationId,
    locationName,
    managedLocationIds,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
  };
};

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(url && key && url.trim().length > 0 && key.trim().length > 0);
};

export const verifySupabaseAccessToken = async (
  token: string,
): Promise<PortalSession | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const serviceKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )!.trim();

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: serviceKey,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const user = (await response.json()) as SupabaseUser;
    return mapSupabaseUserToPortalSession(user);
  } catch (error) {
    console.error("Supabase token verification error:", error);
    return null;
  }
};
