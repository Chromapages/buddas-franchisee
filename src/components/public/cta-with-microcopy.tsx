"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MouseEventHandler } from "react";

type CtaWithMicrocopyProps = {
  href: string;
  label: string;
  microcopy?: string;
  className: string;
  dataStickyCtaHide?: boolean;
  isNavigating?: boolean;
  navigatingLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export const CtaWithMicrocopy = ({
  href,
  label,
  microcopy = "No obligation — takes under 2 minutes.",
  className,
  dataStickyCtaHide = false,
  isNavigating = false,
  navigatingLabel = "Opening…",
  onClick,
}: CtaWithMicrocopyProps) => (
  <div className="flex w-full flex-col items-center">
    <Link
      href={href}
      onClick={onClick}
      data-sticky-cta-hide={dataStickyCtaHide || undefined}
      aria-busy={isNavigating || undefined}
      className={className}
    >
      <span>{isNavigating ? navigatingLabel : label}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </Link>
    <p className="mt-1 text-[11px] font-medium text-bds-text-body/80">{microcopy}</p>
  </div>
);
