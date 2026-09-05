"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { trackFunnelEvent } from "@/src/lib/analytics";

type HeroInquiryLinkProps = ComponentProps<typeof Link>;

export const HeroInquiryLink = ({ onClick, ...props }: HeroInquiryLinkProps) => (
  <Link
    {...props}
    onClick={(event) => {
      onClick?.(event);
      trackFunnelEvent("hero_inquiry_link_click", {
        cta_location: "homepage_hero",
      });
    }}
  />
);
