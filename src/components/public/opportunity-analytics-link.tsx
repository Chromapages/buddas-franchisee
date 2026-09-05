"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackFunnelEvent } from "@/src/lib/analytics";

type OpportunityAnalyticsLinkProps = {
  href: string;
  event: "opportunity_context_link_click" | "opportunity_how_it_works_click" | "opportunity_request_info_click";
  sectionId: string;
  destinationId: string;
  className: string;
  children: ReactNode;
};

export const OpportunityAnalyticsLink = ({
  href,
  event,
  sectionId,
  destinationId,
  className,
  children,
}: OpportunityAnalyticsLinkProps) => (
  <Link
    href={href}
    onClick={() => trackFunnelEvent(event, {
      page_path: "/franchise/the-opportunity",
      opportunity_section_id: sectionId,
      opportunity_destination_id: destinationId,
    })}
    className={className}
  >
    {children}
  </Link>
);
