import { Suspense } from "react";
import { SupportWorkspace } from "@/src/components/portal/support-workspace";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { assertPortalPermission } from "@/src/features/portal/authorization";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";

type SupportPageProps = {
  searchParams: Promise<{ ticketId?: string }>;
};

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const session = await requirePortalPermission("VIEW_SUPPORT");
  assertPortalPermission(session, "CREATE_SUPPORT");
  const { ticketId } = await searchParams;

  return (
    <div className="portal-page-stack">
      <div className="portal-page-header">
        <span className="portal-page-eyebrow">
          Field Operations Desk
        </span>
        <h1 className="portal-page-title">
          Operations Support &amp; Ticketing
        </h1>
        <p className="text-sm text-bds-cocoa/80">
          Direct assistance with bakery equipment, supply logistics, or recipe standards for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <PortalDataBoundary
        title="Operations Support workspace could not be loaded"
        description="Ticket history and operations support tools are temporarily unavailable for this unit."
        className="min-h-48"
      >
        <Suspense fallback={<SupportWorkspaceFallback />}>
          <SupportWorkspaceModule
            locationId={session.locationId}
            locationName={session.locationName}
            initialTicketId={ticketId}
          />
        </Suspense>
      </PortalDataBoundary>
    </div>
  );
}

const SupportWorkspaceModule = async ({
  locationId,
  locationName,
  initialTicketId,
}: {
  locationId: string;
  locationName: string;
  initialTicketId?: string;
}) => {
  const supportCases = await loadPortalModule("support-ticket history", () =>
    defaultPortalStorage.getSupportCasesByLocation(locationId),
  );
  return (
    <SupportWorkspace
      tickets={supportCases}
      locationId={locationId}
      locationName={locationName}
      initialTicketId={initialTicketId}
    />
  );
};

const SupportWorkspaceFallback = () => (
  <section
    aria-busy="true"
    className="min-h-48 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm sm:p-6"
  >
    <h2 className="heading-minor text-bds-teal-dark">Support Tickets</h2>
    <p className="mt-1 text-xs text-bds-cocoa/70">Loading unit support history…</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-2">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-24 rounded-2xl bg-bds-cream/60" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-bds-cream/40 lg:col-span-3" />
    </div>
    <span className="sr-only" role="status">
      Loading Operations Support workspace
    </span>
  </section>
);
