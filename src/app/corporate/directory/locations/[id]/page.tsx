import { notFound } from "next/navigation";
import { CorporateBreadcrumbs, CorporatePageHeader, CorporatePanel, DefinitionList, ErrorState, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import Link from "next/link";
import { getCorporateStorage } from "@/src/features/corporate/storage";

export default async function CorporateLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCorporateSession(); const { id } = await params;
  const records = await getCorporateStorage().getLocations(session).catch(() => null);
  if (!records) return <ErrorState title="Location could not be loaded" description="The directory source is unavailable." retryHref="/corporate/directory?tab=locations" />;
  const record = records.find((item) => item.id === id); if (!record) notFound();
  const canManage = hasCorporatePermission(session, "MANAGE_LOCATIONS", { locationId: record.id, organizationId: record.organizationId, regionId: record.regionId });
  return <div className="corporate-main-stack"><CorporateBreadcrumbs items={[{ label: "Directory", href: "/corporate/directory" }, { label: "Locations", href: "/corporate/directory?tab=locations" }, { label: record.name }]} /><CorporatePageHeader eyebrow={`Location · ${record.code}`} title={record.name} description="Operating context and related work for this authorized location." actions={<>{canManage ? <Link href={`/corporate/directory/locations/${encodeURIComponent(record.id)}/edit`} className="corporate-button">Edit location</Link> : null}<StatusBadge tone={record.operatingStatus === "ACTIVE" ? "success" : "waiting"}>{record.operatingStatus || "UNKNOWN"}</StatusBadge></>} /><CorporatePanel title="Location record" eyebrow="Source-backed fields"><div className="corporate-detail-body"><DefinitionList items={[{ label: "Location ID", value: record.id }, { label: "Organization", value: record.organizationId || "Not recorded" }, { label: "Region", value: record.regionId || "Unassigned" }, { label: "Market", value: record.market || "Not recorded" }, { label: "Operating status", value: record.operatingStatus || "UNKNOWN" }, { label: "Verification", value: record.verificationStatus || "NOT_REVIEWED" }, { label: "Readiness", value: record.verificationReason || "Review store details before activation." }]} /></div></CorporatePanel></div>;
}
