import { redirect } from "next/navigation";
import { getPortalSession } from "@/src/features/auth/session";
import {
  assertPortalPermission,
  type PortalPermission,
} from "./authorization";
import type { PortalSession } from "@/src/lib/auth/auth-provider";

export const requirePortalPermission = async (
  permission: PortalPermission,
  locationId?: string,
): Promise<PortalSession> => {
  const session = await getPortalSession();
  if (!session) redirect("/franchise/login");
  return assertPortalPermission(session, permission, locationId);
};
