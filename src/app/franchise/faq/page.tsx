import { Suspense } from "react";
import type { Metadata } from "next";
import { FaqExplorer, type FaqRetrievalConfig } from "@/src/components/public/faq-explorer";
import { FranchisePageHeader } from "@/src/components/public/franchise-page-header";
import { FAQ_RETRIEVAL_CONFIG, getPublicFranchiseFaqItems } from "@/src/features/franchise/faq-content";
import "./faq.css";

const FAQ_DESCRIPTION = "Answers to common Budda's franchise questions about the concept, capital readiness, territory, support, and the mutual evaluation process.";

export const metadata: Metadata = {
  title: "Budda's Franchise FAQ | Operator Questions & Answers",
  description: FAQ_DESCRIPTION,
  alternates: {
    canonical: "/franchise/faq",
  },
};

const FAQ_RETRIEVAL: FaqRetrievalConfig = FAQ_RETRIEVAL_CONFIG;

export default function FaqPage() {
  const faqs = getPublicFranchiseFaqItems();

  return (
    <div className="faq-page faq-evaluation-desk">
      <FranchisePageHeader
        sectionClassName="faq-hero"
        containerClassName="faq-frame"
        contentClassName="faq-heading-stack"
        titleClassName="faq-title"
        descriptionClassName="faq-intro"
        eyebrow={{ label: "Franchise FAQ" }}
        title="Frequently Asked Questions"
        description={FAQ_DESCRIPTION}
      />
      <section className="faq-desk-surface">
        <Suspense fallback={<div className="faq-frame py-8 text-sm text-bds-text-body">Loading FAQs…</div>}>
          <FaqExplorer faqs={faqs} retrieval={FAQ_RETRIEVAL} />
        </Suspense>
      </section>
    </div>
  );
}
