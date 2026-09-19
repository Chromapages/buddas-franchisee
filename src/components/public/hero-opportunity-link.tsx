"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { trackFranchiseFunnelEvent } from "@/src/lib/analytics";

type HeroOpportunityLinkProps = ComponentProps<typeof Link>;

export const HeroOpportunityLink = ({ onClick, ...props }: HeroOpportunityLinkProps) => (
  <Link
    {...props}
    onClick={(event) => {
      onClick?.(event);
      trackFranchiseFunnelEvent("franchise_hero_primary_clicked");
    }}
  />
);
