import { Suspense } from "react";
import Link from "next/link";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { Download } from "lucide-react";
import type { PortalResource, PortalRole } from "@/src/features/portal/types";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { formatAudienceBadgeText } from "@/src/features/portal/targeting";
import { formatPortalDate } from "@/src/features/portal/date-time";

export default async function ResourcesPage() {
  const session = await requirePortalPermission("VIEW_RESOURCES");
  return (
    <div className="portal-page-stack">
      <div className="portal-page-header">
        <span className="portal-page-eyebrow">
          Brand &amp; Operations Center
        </span>
        <h1 className="portal-page-title">
          Operations Manuals &amp; SOPs
        </h1>
        <p className="text-sm text-bds-cocoa/80">
          Authorized training guides, recipes, and marketing toolkits for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <PortalDataBoundary title="Resource Center could not be loaded" description="Authorized operations resources are temporarily unavailable for this unit." className="min-h-40">
        <Suspense fallback={<ResourcesFallback />}>
          <ResourceList locationId={session.locationId} role={session.role} />
        </Suspense>
      </PortalDataBoundary>
    </div>
  );
}

const ResourceList = async ({
  locationId,
  role,
}: {
  locationId: string;
  role: PortalRole;
}) => {
  const resources = await loadPortalModule("resource center", () =>
    defaultPortalStorage.getResourcesByLocation(locationId, role),
  );
  return (
    <>
      {resources.length === 0 ? (
        <div role="status" className="portal-empty-state flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <p className="text-sm font-bold text-bds-teal-dark">No authorized resources are available</p>
            <p className="text-sm text-bds-cocoa/80">Ask Operations Support if you need a specific manual or toolkit for this unit.</p>
          </div>
          <Link href="/portal/support" className="touch-target-inline shrink-0 text-xs font-bold uppercase tracking-wider text-bds-teal-dark underline underline-offset-4">Contact support</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((res: PortalResource) => {
            const audienceBadge = formatAudienceBadgeText(res.audience);
            return (
              <article
                key={res.id}
                className="flex flex-col justify-between space-y-5 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-bds-cream text-bds-teal">
                      {res.category}
                    </span>
                    <span className="text-xs font-semibold text-bds-cocoa/60">
                      Version {res.version}
                    </span>
                  </div>

                  <div className="heading-stack">
                    <h2 className="heading-minor text-bds-teal-dark">
                      {res.title}
                    </h2>
                    <p className="text-xs text-bds-cocoa/70">
                      Updated: {formatPortalDate(res.updatedAt, locationId)} &bull; File Size: {res.fileSize}
                    </p>
                  </div>

                  {audienceBadge ? (
                    <div className="pt-1">
                      <span
                        className="inline-flex items-center rounded-md border border-bds-teal-dark/15 bg-bds-cream/60 px-2 py-0.5 text-[10px] font-semibold text-bds-cocoa/80"
                        aria-label={`Targeted audience: ${audienceBadge}`}
                      >
                        Audience: {audienceBadge}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="pt-4 border-t border-bds-cream flex items-center justify-between">
                  <span className="text-xs text-bds-cocoa/60">Confidential / Franchisee Only</span>
                  <a
                    href={`/portal/resources/download/${encodeURIComponent(res.id)}`}
                    className="touch-target btn-outline !py-2 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    Download PDF
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
};

const ResourcesFallback = () => (
  <section aria-busy="true" className="min-h-40 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm">
    <p className="text-sm text-bds-cocoa/80">Loading authorized resources…</p>
    <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
      {[0, 1].map((index) => (
        <div key={index} className="h-40 rounded-xl bg-bds-cream/60" />
      ))}
    </div>
    <span className="sr-only" role="status">Loading Resource Center</span>
  </section>
);
