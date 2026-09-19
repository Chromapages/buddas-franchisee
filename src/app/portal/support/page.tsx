import { Suspense } from "react";
import type { Metadata } from "next";
import { SupportWorkspace } from "@/src/components/portal/support-workspace";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { assertPortalPermission } from "@/src/features/portal/authorization";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import type { SupportViewMode } from "@/src/features/portal/saved-views";
import { MapPin } from "lucide-react";
import "./support-page.css";

export const metadata: Metadata = { title: "Operations Support" };

type SupportPageProps = {
  searchParams: Promise<{ ticketId?: string; view?: string; orderId?: string }>;
};

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const session = await requirePortalPermission("VIEW_SUPPORT");
  assertPortalPermission(session, "CREATE_SUPPORT");
  const { ticketId, view, orderId } = await searchParams;
  const initialView: SupportViewMode | undefined = view === "needs-attention" || view === "open" || view === "resolved" || view === "all" ? view : undefined;
  const initialOrderId = orderId && /^[A-Za-z0-9-]{1,64}$/.test(orderId) ? orderId : undefined;

  return (
    <div className="support-page portal-page-stack">
      <header className="support-page-heading">
        <span className="portal-page-eyebrow">
          Operations Support
        </span>
        <h1 className="portal-page-title">
          Operations Support
        </h1>
        <p>Get help with bakery equipment, supply logistics, or recipe standards.</p>
        <div className="support-location" aria-label={`Support requests for ${session.locationName}, unit ${session.locationId}`}>
          <MapPin aria-hidden="true" />
          <span><strong>{session.locationName}</strong><small>{session.locationId}</small></span>
        </div>
      </header>

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
            initialView={initialView}
            initialOrderId={initialOrderId}
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
  initialView,
  initialOrderId,
}: {
  locationId: string;
  locationName: string;
  initialTicketId?: string;
  initialView?: SupportViewMode;
  initialOrderId?: string;
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
      initialView={initialView}
      initialOrderId={initialOrderId}
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
