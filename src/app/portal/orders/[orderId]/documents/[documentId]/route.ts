import { NextResponse } from "next/server";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { assertPortalPermission } from "@/src/features/portal/authorization";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { getAuthorizedOrderDocumentDownload } from "@/src/features/portal/order-documents";
import { recordPortalAudit } from "@/src/features/portal/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string; documentId: string }> },
) {
  const session = await requirePortalPermission("VIEW_ORDERS");
  assertPortalPermission(session, "VIEW_ORDER_DOCUMENTS");
  const { orderId, documentId } = await params;
  const orders = await defaultPortalStorage.getOrdersByLocation(session.locationId);
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) return new Response(null, { status: 404 });

  const document = await getAuthorizedOrderDocumentDownload(session, order, documentId);
  if (!document) return new Response(null, { status: 404 });

  await recordPortalAudit({
    actor: session,
    action: "FINANCIAL_DOCUMENT_DOWNLOADED",
    outcome: "SUCCESS",
    unitId: session.locationId,
    resourceType: "order_invoice",
    resourceId: document.id,
    metadata: { orderId: order.id, invoiceId: order.invoiceId, documentType: document.type },
  });

  return NextResponse.redirect(document.downloadUrl);
}
