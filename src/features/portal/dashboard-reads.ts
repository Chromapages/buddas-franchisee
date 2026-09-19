import { cache } from "react";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalRole } from "./types.ts";
import { defaultPortalStorage } from "./storage-adapter";

// Render-request memoization only: never retain operational data across requests.
// Callers must authorize before starting these reads. Sharing the session object
// also keeps bulletin audience and acknowledgement state scoped to the actor.
export const readDashboardSupport = cache((locationId: string) =>
  defaultPortalStorage.getSupportCasesByLocation(locationId));
export const readDashboardBulletins = cache((session: PortalSession) =>
  defaultPortalStorage.getBulletinsForSession(session));

// Resources are reference material, not live operational state. Memoize them
// independently per request and authorized scope without introducing a shared
// cross-user cache that could outlive permission or location changes.
export const readDashboardResources = cache((locationId: string, role: PortalRole) =>
  defaultPortalStorage.getResourcesByLocation(locationId, role));
