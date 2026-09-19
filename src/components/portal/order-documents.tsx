"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { formatPortalDate } from "@/src/features/portal/date-time";

export type OrderDocumentLink = {
  id: string;
  type: "INVOICE";
  title: string;
  referenceId: string;
  issuedAt?: string;
  href: string;
};

export const OrderDocuments = ({ documents, locationId, unavailable = false }: { documents: OrderDocumentLink[]; locationId: string; unavailable?: boolean }) => {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();
  if (unavailable) return <section className="mobile-order-detail__documents order-documents" aria-labelledby="order-documents-title">
    <h2 id="order-documents-title">Documents</h2>
    <p className="order-documents__unavailable" role="status">Documents are temporarily unavailable. Order details remain available.</p>
    <button type="button" className="order-documents__retry" disabled={isRetrying} onClick={() => startRetry(() => router.refresh())}>{isRetrying ? "Retrying…" : "Retry documents"}</button>
  </section>;
  if (!documents.length) return null;

  return <section className="mobile-order-detail__documents order-documents" aria-labelledby="order-documents-title">
    <h2 id="order-documents-title">Documents</h2>
    <ul>
      {documents.map((document) => {
        const documentName = document.type === "INVOICE" ? `Invoice ${document.referenceId}` : document.title;
        return <li key={document.id}>
          <div>
            <FileText aria-hidden="true" />
            <span><strong>{documentName}</strong>{document.issuedAt ? <small>Issued {formatPortalDate(document.issuedAt, locationId)}</small> : null}</span>
          </div>
          <Link href={document.href} className="order-documents__action" aria-label={`Download ${documentName}`}>
            <Download aria-hidden="true" />
            <span>Download</span>
          </Link>
        </li>;
      })}
    </ul>
  </section>;
};
