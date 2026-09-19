import { CorporatePageHeader, CorporatePanel, EmptyState, PermissionState } from "@/src/components/corporate/corporate-ui";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";

export default async function RoutingAdministrationPage() {
  const session = await requireCorporateSession(); if (!hasCorporatePermission(session, "ASSIGN_SUPPORT")) return <PermissionState />;
  return <div className="corporate-main-stack"><CorporatePageHeader eyebrow="Work ownership" title="Routing" description="Each enabled intake needs a fallback team and a named operating owner." /><CorporatePanel title="Routing policies" description="Rules appear here only after they are stored and enforced by intake commands."><EmptyState title="No routing policy source is configured" description="Support remains visible in its authorized intake queue. Configure durable teams before relying on automatic assignment." /></CorporatePanel></div>;
}
