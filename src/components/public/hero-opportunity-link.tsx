"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { trackFunnelEvent } from "@/src/lib/analytics";

type HeroOpportunityLinkProps = ComponentProps<typeof Link>;

export const HeroOpportunityLink = ({ onClick, ...props }: HeroOpportunityLinkProps) => (
  <Link
    {...props}
    onClick={(event) => {
      onClick?.(event);
      trackFunnelEvent("hero_opportunity_cta_click", { cta_location: "homepage_hero" });
    }}
  />
);
