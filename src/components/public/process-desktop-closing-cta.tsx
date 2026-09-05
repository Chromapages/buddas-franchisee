"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { trackFunnelEvent } from "@/src/lib/analytics";
import type { PublicFranchiseProcessContent } from "@/src/features/franchise/process-content";

const attributionKeys = ["source_page", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export const ProcessDesktopClosingCta = ({
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
    <section className="mt-16 border-t border-bds-teal-dark/20 pt-10" aria-labelledby="desktop-process-closing-heading">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] xl:items-end">
        <div>
          <p className="homepage-section-eyebrow">{content.eyebrow}</p>
          <h2 id="desktop-process-closing-heading" className="mt-3 max-w-[44rem] font-heading text-4xl font-bold leading-[1.02] tracking-tight text-bds-text-heading xl:text-5xl">
            {content.title}
          </h2>
          <p className="mt-4 max-w-[42rem] text-base leading-7 text-bds-text-body/85">{content.description}</p>
          {content.afterApprovalLink ? (
            <div className="mt-6 border-l-2 border-bds-gold pl-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-bds-teal-dark">{content.afterApprovalLabel}</h3>
              <p className="mt-2 max-w-[42rem] text-sm leading-6 text-bds-text-body/80">{content.afterApprovalSummary}</p>
              <Link href={content.afterApprovalLink.href} onClick={onAfterApprovalClick} className="touch-target-inline mt-3 text-sm font-bold text-bds-teal-dark underline underline-offset-4 hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2">
                {content.afterApprovalLink.label}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="bg-bds-teal-dark p-8 text-bds-cream xl:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-bds-gold-accessible">Start with the first step</p>
          <Link href={inquiryHref} onClick={onInquiryClick} aria-busy={isNavigating || undefined} className={`mt-5 inline-flex min-h-[52px] w-full items-center justify-between border border-bds-gold px-5 text-sm font-bold uppercase tracking-[0.08em] text-bds-cream focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark ${isNavigating ? "pointer-events-none opacity-75" : "hover:bg-bds-cream hover:text-bds-teal-dark"}`}>
            {isNavigating ? "Opening inquiry..." : content.primaryActionLabel}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-xs leading-5 text-bds-cream/80">{content.primaryBoundaryNote}</p>
        </div>
      </div>
    </section>
  );
};
