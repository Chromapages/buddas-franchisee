"use client";

import { useEffect } from "react";
import { trackFunnelEvent } from "@/src/lib/analytics";

const currentLinkClasses = [
  "font-bold",
  "text-bds-teal-dark",
];
const currentNumberClasses = ["font-black"];
const currentLabelClasses = ["decoration-2", "decoration-current"];
const inactiveLinkClasses = ["font-semibold", "text-bds-text-heading"];
const inactiveNumberClasses = ["font-bold", "text-bds-teal-dark"];
const inactiveLabelClasses = ["decoration-1", "decoration-bds-teal-dark/45"];
const setClassState = (element: Element, classes: string[], enabled: boolean) => {
  element.classList[enabled ? "add" : "remove"](...classes);
};

/**
 * Progressive enhancement only. Scroll observation updates rail presentation,
 * while normal anchors remain the sole source of fragment/history changes.
 */
export const OpportunityIndexEnhancer = () => {
  useEffect(() => {
    const dossier = document.querySelector<HTMLElement>("[data-opportunity-dossier]");
    const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-opportunity-index-link]")];
    const targetIds = [...new Set(links
      .map((link) => link.dataset.opportunityIndexTarget)
      .filter((id): id is string => Boolean(id)))];
    const sections = targetIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const chapterOrder = new Map(targetIds.map((id, index) => [id, index]));
    let activeId: string | null = null;
    const intersectingSections = new Set<string>();
    let observer: IntersectionObserver | null = null;

    const updateCurrentLocation = (id: string | null) => {
      if (id === activeId) return;
      activeId = id;

      links.forEach((link) => {
        const isCurrent = link.dataset.opportunityIndexTarget === id;
        const number = link.querySelector<HTMLElement>("[data-opportunity-index-number]");
        const label = link.querySelector<HTMLElement>("[data-opportunity-index-label]");

        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        setClassState(link, currentLinkClasses, isCurrent);
        setClassState(link, inactiveLinkClasses, !isCurrent);
        if (number) setClassState(number, currentNumberClasses, isCurrent);
        if (number) setClassState(number, inactiveNumberClasses, !isCurrent);
        if (label) setClassState(label, currentLabelClasses, isCurrent);
        if (label) setClassState(label, inactiveLabelClasses, !isCurrent);
      });
    };

    const getHashTargetId = () => {
      const fragment = window.location.hash.slice(1);
      const matchingLink = links.find((link) => link.dataset.opportunityIndexTarget === fragment)
        ?? links.find((link) => document.getElementById(fragment) && link.dataset.opportunityIndexTarget !== fragment && document.getElementById(fragment)?.closest("section")?.id === link.dataset.opportunityIndexTarget);
      return matchingLink?.dataset.opportunityIndexTarget ?? null;
    };

    const updateFromHash = () => {
      updateCurrentLocation(getHashTargetId());
    };

    const focusHashTarget = () => {
      const targetId = getHashTargetId();
      const heading = targetId
        ? document.getElementById(targetId)?.querySelector<HTMLElement>("[data-opportunity-chapter-heading]")
        : null;
      heading?.focus({ preventScroll: true });
    };

    const syncHashLocation = () => {
      updateFromHash();
      window.requestAnimationFrame(focusHashTarget);
    };

    // Editorial current-location rule: a chapter becomes current when its H2/section
    // crosses the header-safe reading line, regardless of the chapter's total height.
    const getObservationLine = () => {
      const headerBottom = document.querySelector<HTMLElement>('[role="banner"]')?.getBoundingClientRect().bottom ?? 0;
      const anchorOffset = Number.parseFloat(getComputedStyle(sections[0]).scrollMarginTop);
      return Math.ceil(Math.max(headerBottom + 8, Number.isFinite(anchorOffset) ? anchorOffset : 0));
    };

    const observeChapters = () => {
      if (typeof IntersectionObserver === "undefined" || sections.length === 0) return;

      observer?.disconnect();
      intersectingSections.clear();
      const observationLine = getObservationLine();
      const bottomMargin = Math.max(0, window.innerHeight - observationLine - 1);

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) intersectingSections.add(entry.target.id);
            else intersectingSections.delete(entry.target.id);
          });

          // The one-pixel reading line usually intersects one chapter. At a shared
          // boundary, the later chapter wins, so the result is stable and deterministic.
          const currentId = [...intersectingSections]
            .sort((left, right) => (chapterOrder.get(right) ?? -1) - (chapterOrder.get(left) ?? -1))[0] ?? null;
          updateCurrentLocation(currentId);
        },
        { rootMargin: `-${observationLine}px 0px -${bottomMargin}px 0px`, threshold: 0 },
      );
      sections.forEach((section) => observer?.observe(section));
    };

    const onClick = (event: Event) => {
      const link = event.currentTarget as HTMLAnchorElement;
      const chapterId = link.dataset.opportunityAnalyticsId;

      // Answers which diligence topics visitors deliberately seek; it is never an intent or qualification signal.
      if (!chapterId) return;

      trackFunnelEvent("opportunity_index_navigation", {
        page_path: "/franchise/the-opportunity",
        opportunity_section_id: chapterId,
        opportunity_destination_id: chapterId,
      });
    };

    const onFocusWithinDossier = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !dossier?.contains(target)) return;

      window.requestAnimationFrame(() => {
        if (document.activeElement !== target) return;

        const targetRect = target.getBoundingClientRect();
        const obstructors = [...document.querySelectorAll<HTMLElement>(
          '[role="banner"], [data-sticky-focus-obstructor], .opportunity-dossier-spine, .mobile-sticky-franchise-cta',
        )].filter((element) => {
          const { opacity, position, visibility } = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (position === "fixed" || position === "sticky")
            && visibility !== "hidden"
            && Number.parseFloat(opacity) > 0
            && rect.width > 0
            && rect.height > 0
            && !element.contains(target);
        });

        const overlap = obstructors.find((element) => {
          const rect = element.getBoundingClientRect();
          return targetRect.left < rect.right
            && targetRect.right > rect.left
            && targetRect.top < rect.bottom
            && targetRect.bottom > rect.top;
        });
        if (!overlap) return;

        const obstruction = overlap.getBoundingClientRect();
        target.scrollIntoView({
          block: obstruction.top <= targetRect.top ? "start" : "end",
          inline: "nearest",
          behavior: "auto",
        });
      });
    };

    // Browsers may apply the initial fragment scroll after hydration and after the
    // observer's first callback. Reconcile once more after that native jump.
    syncHashLocation();
    const initialHashFrame = window.requestAnimationFrame(syncHashLocation);
    const initialHashTimer = window.setTimeout(syncHashLocation, 400);
    observeChapters();
    links.forEach((link) => link.addEventListener("click", onClick));
    document.addEventListener("focusin", onFocusWithinDossier);
    window.addEventListener("hashchange", syncHashLocation);
    window.addEventListener("resize", observeChapters);

    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(initialHashFrame);
      window.clearTimeout(initialHashTimer);
      links.forEach((link) => link.removeEventListener("click", onClick));
      document.removeEventListener("focusin", onFocusWithinDossier);
      window.removeEventListener("hashchange", syncHashLocation);
      window.removeEventListener("resize", observeChapters);
    };
  }, []);

  return null;
};
