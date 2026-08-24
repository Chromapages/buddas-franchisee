import { notFound } from "next/navigation";
import { defaultFddStorage } from "@/src/features/fdd/storage-adapter";
import { FddReceiptForm } from "@/src/components/public/fdd-receipt-form";
import { FileText, Download, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Franchise Disclosure Document (FDD) & Item 23 Receipt — Budda's",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FddDetailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const receipt = await defaultFddStorage.getReceiptByToken(token);

  if (!receipt) {
    notFound();
  }

  const fddSections = [
    { item: "Item 1", title: "The Franchisor and Any Parents, Predecessors, and Affiliates" },
    { item: "Item 5", title: "Initial Fees ($35,000 Franchise Fee)" },
    { item: "Item 6", title: "Other Fees (5% Royalty, 1.5% Brand Marketing Fund)" },
    { item: "Item 7", title: "Estimated Initial Investment ($425,000 to $875,000)" },
    { item: "Item 11", title: "Franchisor's Assistance, Advertising, Computer Systems, and Training" },
    { item: "Item 12", title: "Territory and Protected Market Boundary Provisions" },
    { item: "Item 19", title: "Financial Performance Representations (Historical AUV & Margins)" },
    { item: "Item 22", title: "Contracts and Standard Franchise Agreement Form" },
    { item: "Item 23", title: "Receipts and Electronic Acknowledgment" },
  ];

  return (
    <div className="space-y-16 py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="bg-brand-charcoal text-white rounded-3xl p-8 sm:p-12 space-y-4 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-clay text-white text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Confidential Disclosure Delivery
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
          Budda&apos;s Franchise Disclosure Document (FDD v{receipt.fddVersion})
        </h1>
        <p className="text-sm sm:text-base text-brand-cream/80 leading-relaxed max-w-3xl">
          Prepared exclusively for <strong>{receipt.prospectName}</strong> ({receipt.prospectEmail}). This document provides all material disclosures, contracts, and financial representations required under the FTC Franchise Rule.
        </p>
      </div>

      {/* FDD Document Access & Table of Contents */}
      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-sand">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-sand flex items-center justify-center text-brand-clay">
              <FileText className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-brand-charcoal">
                Complete Disclosure Document (PDF)
              </h2>
              <span className="text-xs text-brand-charcoal/60">
                Effective: 2026 Release Baseline &bull; 148 Pages &bull; Version {receipt.fddVersion}
              </span>
            </div>
          </div>

          <a
            href="/resources/buddas-fdd-2026.pdf"
            download
            className="btn-primary !py-3 !px-6 text-sm font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download FDD (PDF)
          </a>
        </div>

        {/* Sections Preview List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal/80">
            Key Disclosure Items Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fddSections.map((sec) => (
              <div
                key={sec.item}
                className="p-3.5 rounded-xl bg-brand-sand/40 border border-brand-charcoal/5 flex items-center gap-3 text-xs text-brand-charcoal"
              >
                <span className="font-bold font-heading text-brand-clay px-2 py-0.5 rounded-md bg-brand-butter/60">
                  {sec.item}
                </span>
                <span className="font-semibold truncate">{sec.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item 23 Electronic Receipt Execution */}
      <div id="receipt">
        <FddReceiptForm receipt={receipt} />
      </div>
    </div>
  );
}
