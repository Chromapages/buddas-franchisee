"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MouseEventHandler } from "react";

type CtaWithMicrocopyProps = {
  href: string;
  label: string;
  microcopy: string;
  className: string;
  dataStickyCtaHide?: boolean;
  isNavigating?: boolean;
  navigatingLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export const CtaWithMicrocopy = ({
  href,
  label,
  microcopy,
  className,
  dataStickyCtaHide = false,
  isNavigating = false,
  navigatingLabel = "Opening…",
  onClick,
}: CtaWithMicrocopyProps) => (
  <div className="cta-with-microcopy flex w-full flex-col items-center">
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
    <p className="mt-2 text-xs font-medium leading-[1.5] text-bds-text-body/90">{microcopy}</p>
  </div>
);
