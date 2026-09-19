"use client";

import { useSyncExternalStore } from "react";
import { WhyBuddasPillarsDesktop } from "./why-buddas-pillars-desktop";
import { WhyBuddasPillarsMobile } from "./why-buddas-pillars-mobile";
import type {
  PublicPillar,
  PublicPillarSection,
} from "@/src/features/why-buddas/pillars-config";

type WhyBuddasPillarsProps = {
  pillars: readonly PublicPillar[];
  section: PublicPillarSection;
};

const desktopMediaQuery = "(min-width: 1024px)";

const subscribeToDesktopLayout = (onStoreChange: () => void) => {
  const mediaQuery = window.matchMedia(desktopMediaQuery);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
};

const getDesktopLayoutSnapshot = () => window.matchMedia(desktopMediaQuery).matches;
const getServerLayoutSnapshot = () => false;

/**
 * The mobile reader is the server-rendered baseline: it keeps every pillar
 * immediately available. Desktop progressively replaces it with the focused
 * proof-rail interaction once the viewport can support that presentation.
 */
export const WhyBuddasPillars = ({ pillars, section }: WhyBuddasPillarsProps) => {
  const isDesktop = useSyncExternalStore(
    subscribeToDesktopLayout,
    getDesktopLayoutSnapshot,
    getServerLayoutSnapshot,
  );

  return isDesktop ? (
    <WhyBuddasPillarsDesktop pillars={pillars} section={section} />
  ) : (
    <WhyBuddasPillarsMobile pillars={pillars} section={section} />
  );
};
