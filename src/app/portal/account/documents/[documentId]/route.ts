import { NextResponse } from "next/server";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { getFinancialDocument } from "@/src/features/portal/account-private-records";
import { recordPortalAudit } from "@/src/features/portal/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await requirePortalPermission("VIEW_ACCOUNT");
  const { documentId } = await params;
  const document = await getFinancialDocument(session, documentId);
  if (!document) return new Response(null, { status: 404 });

  await recordPortalAudit({
    actor: session,
    action: "FINANCIAL_DOCUMENT_DOWNLOADED",
    outcome: "SUCCESS",
    unitId: document.unitId ?? session.locationId,
    resourceType: "financial_document",
    resourceId: document.id,
    metadata: { documentType: document.type, referenceId: document.referenceId },
  });

  return NextResponse.redirect(document.downloadUrl);
}
