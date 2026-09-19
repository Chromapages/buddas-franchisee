import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CorporateShell } from "@/src/components/corporate/corporate-shell";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";

export const metadata: Metadata = {
  title: "Corporate operations — Budda's Workspace",
  robots: { index: false, follow: false, nocache: true },
  openGraph: null,
  twitter: null,
};

export default async function CorporateLayout({ children }: { children: ReactNode }) {
  const session = await requireCorporateSession();
  const corporateScope = session.memberships.some((membership) => membership.status === "ACTIVE" && membership.scope.type === "corporate");
  const organizationIds = new Set(session.memberships.flatMap((membership) => membership.scope.type === "organizations" ? membership.scope.organizationIds : []));
  const regionIds = new Set(session.memberships.flatMap((membership) => membership.scope.type === "regions" ? membership.scope.regionIds : []));
  const locationIds = new Set(session.memberships.flatMap((membership) => membership.scope.type === "locations" ? membership.scope.locationIds : []));
  const scopeLabel = corporateScope ? "All permitted locations" : organizationIds.size ? `${organizationIds.size} permitted organization${organizationIds.size === 1 ? "" : "s"}` : regionIds.size ? `${regionIds.size} permitted region${regionIds.size === 1 ? "" : "s"}` : `${locationIds.size} permitted location${locationIds.size === 1 ? "" : "s"}`;
  const administration = hasCorporatePermission(session, "MANAGE_ACCESS") || hasCorporatePermission(session, "VIEW_AUDIT") || hasCorporatePermission(session, "VIEW_RECOVERY");

  return <CorporateShell displayName={session.displayName} email={session.email} scopeLabel={scopeLabel} access={{
    requests: hasCorporatePermission(session, "VIEW_REQUESTS"),
    inquiries: hasCorporatePermission(session, "VIEW_INQUIRIES"),
    catalog: hasCorporatePermission(session, "MANAGE_CATALOG"),
    orders: hasCorporatePermission(session, "VIEW_ORDERS"),
    support: hasCorporatePermission(session, "VIEW_SUPPORT"),
    directory: hasCorporatePermission(session, "VIEW_DIRECTORY"),
    resources: hasCorporatePermission(session, "VIEW_RESOURCES"),
    reporting: hasCorporatePermission(session, "VIEW_REPORTS"),
    administration,
  }}>{children}</CorporateShell>;
}
