import { notFound } from "next/navigation";
import { CORPORATE_BUNDLE_LABELS, hasCorporatePermission } from "@/src/features/corporate/authorization";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, DefinitionList, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";

export default async function CorporatePersonPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCorporateSession(); const { id } = await params;
  const record = await getCorporateStorage().getPeople(session).then((items) => items.find((item) => item.id === id)).catch(() => undefined);
  if (!record) notFound();
  return <div className="corporate-main-stack"><CorporateBreadcrumbs items={[{ label: "Directory", href: "/corporate/directory" }, { label: "People", href: "/corporate/directory?tab=people" }, { label: record.displayName }]} /><CorporatePageHeader eyebrow="Corporate identity" title={record.displayName} description={record.email} actions={<StatusBadge tone={record.status === "ACTIVE" ? "success" : record.status === "SUSPENDED" ? "danger" : "waiting"}>{record.status}</StatusBadge>} /><CorporatePanel title="Effective access" eyebrow="Server-owned memberships" description={hasCorporatePermission(session, "MANAGE_ACCESS") ? "Review impact before making any future scope change." : "Read-only membership summary."}><div className="corporate-detail-body"><DefinitionList items={[{ label: "Identity", value: record.id }, { label: "Account class", value: record.identityClass === "CORPORATE" ? "Corporate staff" : "Operator" }, { label: "Version", value: record.version }, { label: "Bundles", value: record.memberships.map((membership) => CORPORATE_BUNDLE_LABELS[membership.bundle]).join(", ") || "None" }, { label: "Scopes", value: record.memberships.map((membership) => membership.scope.type).join(", ") || "None" }]} /></div></CorporatePanel></div>;
}
