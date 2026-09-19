"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { trackFranchiseFunnelEvent } from "@/src/lib/analytics";

type HeroInquiryLinkProps = ComponentProps<typeof Link>;

export const HeroInquiryLink = ({ onClick, ...props }: HeroInquiryLinkProps) => (
  <Link
    {...props}
    onClick={(event) => {
      onClick?.(event);
      trackFranchiseFunnelEvent("franchise_hero_inquiry_clicked");
    }}
  />
);
