"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const MobileStickyFranchiseCta = () => {
  const [pastHero, setPastHero] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const visibleTargets = useRef(new Set<Element>());
  const isVisible = pastHero && !isBlocked;

  useEffect(() => {
    const hero = document.querySelector("[data-franchise-home-hero]");
    const footer = document.querySelector("footer");
    const fullSizeCtas = Array.from(document.querySelectorAll("[data-sticky-cta-hide]"));

    if (!hero) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0),
      { threshold: 0 },
    );
    heroObserver.observe(hero);

    const blockingTargets = [footer, ...fullSizeCtas].filter(
      (target): target is Element => Boolean(target),
    );
    const blockingObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleTargets.current.add(entry.target);
          else visibleTargets.current.delete(entry.target);
        }
        setIsBlocked(visibleTargets.current.size > 0);
      },
      { threshold: 0.2 },
    );
    blockingTargets.forEach((target) => blockingObserver.observe(target));

    return () => {
      heroObserver.disconnect();
      blockingObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={`mobile-sticky-franchise-cta md:hidden ${
        isVisible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
      }`}
      aria-hidden={!isVisible}
    >
      <Link
        href="/franchise/the-opportunity"
        tabIndex={isVisible ? 0 : -1}
        className="touch-target min-h-12 btn-primary w-full text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2"
      >
        Review the Franchise Opportunity
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </Link>
    </div>
  );
};
