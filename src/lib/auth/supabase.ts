import type { PortalRole } from "@/src/features/portal/types";
import type { PortalSession } from "./auth-provider";

export type SupabaseUserMetadata = {
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
  };
};

export const mapSupabaseUserToPortalSession = (
  user: SupabaseUser,
  defaultLocationId: string = "HNL-014",
  defaultLocationName: string = "La'ie Origin Grill",
): PortalSession => {
  const metadata = user.user_metadata || {};
  const appMeta = user.app_metadata || {};

  const role: PortalRole =
    metadata.role === "admin" || appMeta.role === "admin"
      ? "admin"
      : "franchisee";

  const locationId = metadata.locationId || defaultLocationId;
  const locationName = metadata.locationName || defaultLocationName;
  const managedLocationIds = metadata.managedLocationIds || [locationId];

  return {
    userId: user.id,
    email: user.email || "operator@buddasfranchise.com",
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
