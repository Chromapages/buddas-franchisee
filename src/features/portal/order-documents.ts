import "server-only";

import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalOrder } from "@/src/features/portal/types";
import {
  getFinancialDocument,
  getFinancialDocuments,
  type FinancialDocument,
} from "@/src/features/portal/account-private-records";

export type AuthorizedOrderDocument = {
  id: string;
  type: "INVOICE";
  title: string;
  referenceId: string;
  issuedAt?: string;
};

const isOrderInvoice = (document: FinancialDocument, order: PortalOrder): boolean =>
  document.type === "WHOLESALE_INVOICE"
  && document.unitId === order.locationId
  && document.referenceId === order.invoiceId;

const toAuthorizedOrderDocument = (document: FinancialDocument, order: PortalOrder): AuthorizedOrderDocument => ({
  id: document.id,
  type: "INVOICE",
  title: document.title || `Invoice ${order.invoiceId}`,
  referenceId: order.invoiceId,
  issuedAt: document.issuedAt,
});

/**
 * Order documents are derived from the existing entity financial-document
 * store. The unit and invoice reference must both match before a document is
 * made available on an order; entity-level documents are intentionally not
 * inferred to belong to an order.
 */
export const getAuthorizedOrderDocuments = async (
  session: PortalSession,
  order: PortalOrder,
): Promise<AuthorizedOrderDocument[]> => {
  const documents = await getFinancialDocuments(session);
  return documents
    .filter((document) => isOrderInvoice(document, order))
    .map((document) => toAuthorizedOrderDocument(document, order));
};

/** Returns the private delivery record for a previously authorized document. */
export const getAuthorizedOrderDocumentDownload = async (
  session: PortalSession,
  order: PortalOrder,
  documentId: string,
): Promise<FinancialDocument | null> => {
  const document = await getFinancialDocument(session, documentId);
  return document && isOrderInvoice(document, order) ? document : null;
};
