import type { CorporateBundle, CorporateMembership, CorporatePermission, CorporateSession, CorporateTarget } from "./types.ts";

export const CORPORATE_BUNDLE_LABELS: Record<CorporateBundle, string> = {
  operations_lead: "Operations lead", support_handler: "Support handler",
  order_coordinator: "Order coordinator", request_approver: "Request approver",
  access_steward: "Access steward", leadership: "Read-only leadership",
  content_publisher: "Content publisher", finance_reviewer: "Finance reviewer",
  platform_administrator: "Platform administrator",
  franchise_development: "Franchise development",
  location_steward: "Location steward",
};

export const CORPORATE_BUNDLE_PERMISSIONS: Record<CorporateBundle, readonly CorporatePermission[]> = {
  operations_lead: ["VIEW_REPORTS", "VIEW_WORK", "VIEW_SUPPORT", "MANAGE_SUPPORT", "ASSIGN_SUPPORT", "VIEW_INTERNAL_NOTES", "WRITE_INTERNAL_NOTES", "VIEW_REQUESTS", "MANAGE_REQUESTS", "VIEW_ORDERS", "VIEW_DIRECTORY", "VIEW_RESOURCES", "VIEW_AUDIT", "VIEW_RECOVERY", "MANAGE_RECOVERY", "MANAGE_CATALOG", "MANAGE_LOCATIONS"],
  support_handler: ["VIEW_WORK", "VIEW_SUPPORT", "MANAGE_SUPPORT", "VIEW_INTERNAL_NOTES", "WRITE_INTERNAL_NOTES", "VIEW_DIRECTORY", "VIEW_RESOURCES"],
  order_coordinator: ["VIEW_WORK", "VIEW_ORDERS", "COORDINATE_ORDERS", "VIEW_DIRECTORY", "VIEW_RESOURCES"],
  request_approver: ["VIEW_WORK", "VIEW_REQUESTS", "MANAGE_REQUESTS", "APPROVE_REQUESTS", "VIEW_DIRECTORY", "VIEW_RESOURCES"],
  access_steward: ["VIEW_DIRECTORY", "MANAGE_ACCESS", "VIEW_AUDIT", "VIEW_RECOVERY"],
  leadership: ["VIEW_REPORTS", "VIEW_WORK", "VIEW_SUPPORT", "VIEW_REQUESTS", "VIEW_ORDERS", "VIEW_DIRECTORY", "VIEW_RESOURCES"],
  content_publisher: ["VIEW_RESOURCES", "PUBLISH_RESOURCES"],
  finance_reviewer: ["VIEW_REPORTS", "VIEW_WORK", "VIEW_ORDERS", "VIEW_FINANCIAL_REFERENCES"],
  platform_administrator: ["MANAGE_PLATFORM_SETTINGS", "MANAGE_ACCESS", "VIEW_AUDIT", "VIEW_RECOVERY", "MANAGE_RECOVERY"],
  franchise_development: ["VIEW_WORK", "VIEW_INQUIRIES", "ASSIGN_INQUIRIES", "MANAGE_INQUIRIES", "RECORD_INQUIRY_DECISION", "VIEW_INQUIRY_PII"],
  location_steward: ["VIEW_DIRECTORY", "MANAGE_LOCATIONS", "VERIFY_LOCATIONS", "MANAGE_LOCATION_ASSIGNMENTS"],
};

export class CorporateAuthorizationError extends Error {
  readonly code = "FORBIDDEN";
  constructor() { super("You do not have access to this corporate action or record."); }
}

export const isActiveCorporateMembership = (membership: CorporateMembership, now = Date.now()): boolean => {
  if (membership.status !== "ACTIVE" || !CORPORATE_BUNDLE_PERMISSIONS[membership.bundle]) return false;
  if (membership.startsAt && (!Number.isFinite(Date.parse(membership.startsAt)) || Date.parse(membership.startsAt) > now)) return false;
  if (membership.expiresAt && (!Number.isFinite(Date.parse(membership.expiresAt)) || Date.parse(membership.expiresAt) <= now)) return false;
  return true;
};

export const membershipCoversTarget = (membership: CorporateMembership, target: CorporateTarget): boolean => {
  if (!membership.scope) return false;
  switch (membership.scope.type) {
    case "corporate": return true;
    case "organizations": return Boolean(target.organizationId && membership.scope.organizationIds.includes(target.organizationId));
    case "regions": return Boolean(target.regionId && membership.scope.regionIds.includes(target.regionId));
    case "locations": return Boolean(target.locationId && membership.scope.locationIds.includes(target.locationId));
    default: return false;
  }
};

/** Omitting target checks navigation availability only. Commands must pass their stored record scope. */
export const hasCorporatePermission = (
  session: CorporateSession,
  permission: CorporatePermission,
  target?: CorporateTarget,
  now = Date.now(),
): boolean => Boolean(session.userId && session.email && Number.isFinite(session.expiresAt) && session.expiresAt > now)
  && session.memberships.some((membership) => isActiveCorporateMembership(membership, now)
    && CORPORATE_BUNDLE_PERMISSIONS[membership.bundle].includes(permission)
    && (!target || membershipCoversTarget(membership, target)));

export const assertCorporatePermission = (session: CorporateSession, permission: CorporatePermission, target?: CorporateTarget): void => {
  if (!hasCorporatePermission(session, permission, target)) throw new CorporateAuthorizationError();
};

/** Only trust well-formed server-owned membership data, never submitted role claims. */
export const parseCorporateMemberships = (input: unknown): CorporateMembership[] => {
  if (!Array.isArray(input)) return [];
  return input.flatMap((value): CorporateMembership[] => {
    if (!value || typeof value !== "object") return [];
    const raw = value as Record<string, unknown>;
    if (typeof raw.id !== "string" || !raw.id || typeof raw.bundle !== "string"
      || !Object.hasOwn(CORPORATE_BUNDLE_PERMISSIONS, raw.bundle)
      || (raw.status !== "ACTIVE" && raw.status !== "SUSPENDED") || !raw.scope || typeof raw.scope !== "object") return [];
    const scope = raw.scope as Record<string, unknown>;
    const validIds = (ids: unknown): ids is string[] => Array.isArray(ids) && ids.length > 0 && ids.every((id) => typeof id === "string" && id.length > 0 && !id.includes("/"));
    if (scope.type !== "corporate"
      && !(scope.type === "organizations" && validIds(scope.organizationIds))
      && !(scope.type === "regions" && validIds(scope.regionIds))
      && !(scope.type === "locations" && validIds(scope.locationIds))) return [];
    if ((raw.startsAt !== undefined && typeof raw.startsAt !== "string") || (raw.expiresAt !== undefined && typeof raw.expiresAt !== "string")) return [];
    return [{ id: raw.id, bundle: raw.bundle as CorporateBundle, status: raw.status,
      scope: scope.type === "corporate" ? { type: "corporate" }
        : scope.type === "organizations" ? { type: "organizations", organizationIds: scope.organizationIds as string[] }
          : scope.type === "regions" ? { type: "regions", regionIds: scope.regionIds as string[] }
          : { type: "locations", locationIds: scope.locationIds as string[] },
      ...(raw.startsAt ? { startsAt: raw.startsAt as string } : {}), ...(raw.expiresAt ? { expiresAt: raw.expiresAt as string } : {}),
    }];
  });
};
