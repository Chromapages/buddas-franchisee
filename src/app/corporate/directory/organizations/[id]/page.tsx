import { notFound } from "next/navigation";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, DefinitionList, ErrorState, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";

export default async function CorporateOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCorporateSession(); const { id } = await params;
  const record = await getCorporateStorage().getOrganizations(session).then((items) => items.find((item) => item.id === id)).catch(() => undefined);
  if (!record) notFound();
  return <div className="corporate-main-stack"><CorporateBreadcrumbs items={[{ label: "Directory", href: "/corporate/directory" }, { label: "Organizations", href: "/corporate/directory?tab=organizations" }, { label: record.name }]} /><CorporatePageHeader eyebrow={`Organization · ${record.id}`} title={record.name} description="Verified entity context, related locations, and scoped operational work." actions={<StatusBadge tone={record.verificationStatus === "VERIFIED" ? "success" : "waiting"}>{record.verificationStatus}</StatusBadge>} /><CorporatePanel title="Organization record" eyebrow="Authorized summary"><div className="corporate-detail-body"><DefinitionList items={[{ label: "Organization ID", value: record.id }, { label: "Verification", value: record.verificationStatus }, { label: "Related locations", value: record.locationIds.length }]} /></div></CorporatePanel></div>;
}
