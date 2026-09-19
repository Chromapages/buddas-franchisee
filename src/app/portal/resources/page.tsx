import { Suspense } from "react";
import type { Metadata } from "next";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { ResourceCenterWorkspace } from "@/src/components/portal/resource-center-workspace";
import "./resource-center.css";

export const metadata: Metadata = { title: "Resource Center" };

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await requirePortalPermission("VIEW_RESOURCES");
  const { q = "" } = await searchParams;
  return <div className="resources-page">
    <PortalDataBoundary title="Resource Center could not be loaded" description="Authorized operations resources are temporarily unavailable for this unit." className="min-h-40">
      <Suspense fallback={<ResourcesFallback />}><ResourceModule locationId={session.locationId} locationName={session.locationName} role={session.role} query={q.trim().slice(0,64)} /></Suspense>
    </PortalDataBoundary>
  </div>;
}

async function ResourceModule({ locationId, locationName, role, query }: { locationId:string; locationName:string; role:"admin"|"franchisee"; query:string }) {
  const [resources, location] = await Promise.all([
    loadPortalModule("resource center", () => defaultPortalStorage.getResourcesByLocation(locationId, role)),
    defaultPortalStorage.getLocationById(locationId).catch(() => null),
  ]);
  const address = location?.address ? [location.address.line1, location.address.line2, [location.address.city, location.address.state, location.address.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ") : undefined;
  return <ResourceCenterWorkspace resources={resources} locationId={locationId} locationName={locationName} address={address} initialQuery={query} />;
}

const ResourcesFallback = () => <section aria-busy="true" className="resource-center-fallback"><p>Loading authorized resources…</p><span className="sr-only" role="status">Loading Resource Center</span></section>;
