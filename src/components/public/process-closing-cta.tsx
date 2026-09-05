"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { trackFunnelEvent } from "@/src/lib/analytics";
import type { PublicFranchiseProcessContent } from "@/src/features/franchise/process-content";

const attributionKeys = ["source_page", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export const ProcessClosingCta = ({
  content,
}: {
  content: PublicFranchiseProcessContent["closing"];
}) => {
  const searchParams = useSearchParams();
  const activation = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const query = new URLSearchParams();

  for (const key of attributionKeys) {
    const value = searchParams.get(key);
    if (value) query.set(key, value);
  }

  if (!query.has("source_page")) query.set("source_page", "franchise_process");

  const inquiryHref = `/franchise/contact?${query.toString()}`;

  const onInquiryClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (activation.current) {
      event.preventDefault();
      return;
    }

    activation.current = true;
    setIsNavigating(true);
    trackFunnelEvent("process_inquiry_click", {
      page_path: "/franchise/process",
      process_interaction: "inquiry_transition",
      process_destination_id: "initial_inquiry",
    });
  };

  const onAfterApprovalClick = () => {
    trackFunnelEvent("process_after_approval_click", {
      page_path: "/franchise/process",
      process_interaction: "after_approval",
      process_destination_id: content.afterApprovalLink?.destinationId || "after_mutual_approval",
    });
  };

  return (
    <section
      className="process-closing-cta process-content-grid border-t border-bds-teal-dark/20 pt-8"
      aria-labelledby="process-closing-heading"
    >
      <div className="max-w-2xl">
        <p className="homepage-section-eyebrow">{content.eyebrow}</p>
        <h2 id="process-closing-heading" className="mt-3 homepage-section-heading">
          {content.title}
        </h2>
        <p className="mt-3 homepage-section-description prose-measure">{content.description}</p>

        <section
          className="mt-5 border-l-2 border-bds-teal-dark/50 pl-4"
          aria-labelledby="after-mutual-approval-heading"
        >
          <h3
            id="after-mutual-approval-heading"
            className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark"
          >
            {content.afterApprovalLabel}
          </h3>
          <p className="mt-2 text-sm leading-6 text-bds-text-body/80">{content.afterApprovalSummary}</p>
          {content.afterApprovalLink ? (
            <Link
              href={content.afterApprovalLink.href}
              onClick={onAfterApprovalClick}
              className="touch-target-inline mt-2 text-sm font-bold text-bds-teal-dark underline underline-offset-4 hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2"
            >
              {content.afterApprovalLink.label}
            </Link>
          ) : null}
        </section>

        <div className="mt-6">
          <Link
            href={inquiryHref}
            onClick={onInquiryClick}
            aria-busy={isNavigating || undefined}
            className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-bds-action-primary px-5 text-base font-bold text-bds-action-primary-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 sm:w-auto sm:min-w-[18rem] ${
              isNavigating ? "pointer-events-none opacity-75" : "hover:bg-bds-teal"
            }`}
          >
            {isNavigating ? "Opening inquiry..." : content.primaryActionLabel}
          </Link>
          <p className="mt-2 text-xs leading-5 text-bds-text-body/80">{content.primaryBoundaryNote}</p>
        </div>
      </div>
    </section>
  );
};
