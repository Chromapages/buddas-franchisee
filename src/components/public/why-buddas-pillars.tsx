"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./why-buddas-pillars.module.css";
import type {
  PublicPillar,
  PublicPillarSection,
} from "@/src/features/why-buddas/pillars-config";
import { trackFunnelEvent } from "@/src/lib/analytics";

type WhyBuddasPillarsProps = {
  pillars: readonly PublicPillar[];
  section: PublicPillarSection;
};

const getPillarIndexFromHash = (pillars: readonly PublicPillar[]) => {
  if (typeof window === "undefined") return 0;

  const index = pillars.findIndex(
    (pillar) => `#${pillar.id}` === window.location.hash
  );

  return index;
};

/**
 * A focused, manually activated tab set. Every panel remains in the DOM so
 * the relationship between each selector and its reading content is stable.
 */
export const WhyBuddasPillars = ({ pillars, section }: WhyBuddasPillarsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const syncHashToPillar = () => {
      const index = getPillarIndexFromHash(pillars);
      if (index < 0) return;
      setActiveIndex(index);
      setFocusIndex(index);

      if (window.location.hash) {
        requestAnimationFrame(() => {
          document.getElementById(pillars[index].id)?.scrollIntoView({
            block: "start",
          });
        });
      }
    };

    syncHashToPillar();
    window.addEventListener("hashchange", syncHashToPillar);
    return () => window.removeEventListener("hashchange", syncHashToPillar);
  }, [pillars]);

  const selectPillar = (index: number) => {
    const pillar = pillars[index];
    if (!pillar) return;

    setActiveIndex(index);
    setFocusIndex(index);
    window.history.replaceState(null, "", `#${pillar.id}`);

    // Selection data informs content-coverage and navigation decisions only.
    // It never represents qualification, intent to purchase, or readiness.
    trackFunnelEvent("why_buddas_pillar_selected", {
      page_path: "/franchise/why-buddas",
      why_buddas_pillar_id: pillar.id,
    });
  };

  const moveFocus = (index: number) => {
    setFocusIndex(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    const lastIndex = pillars.length - 1;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(currentIndex === lastIndex ? 0 : currentIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(currentIndex === 0 ? lastIndex : currentIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveFocus(0);
    } else if (event.key === "End") {
      event.preventDefault();
      moveFocus(lastIndex);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectPillar(currentIndex);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.intro}>
        <p className="heading-panel">{section.eyebrow.text}</p>
        <h2 className="heading-section max-w-[26ch] text-bds-text-heading lg:text-5xl">
          {section.publicHeading.text}
        </h2>
        <p className="prose-measure text-base leading-relaxed text-bds-text-body sm:text-lg">
          {section.orientationCopy.text}
        </p>
      </div>

      <div className={styles.desk}>
        <div>
          <p id="operator-proof-rail-heading" className="sr-only">
            Explore the four pillars
          </p>
          <div
            role="tablist"
            aria-labelledby="operator-proof-rail-heading"
            aria-orientation="horizontal"
            className={styles.tabs}
          >
            {pillars.map((pillar, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={pillar.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`${pillar.id}-tab`}
                  aria-controls={pillar.id}
                  aria-selected={isActive}
                  tabIndex={focusIndex === index ? 0 : -1}
                  onClick={() => selectPillar(index)}
                  onFocus={() => setFocusIndex(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={styles.tab}
                >
                  <span
                    className={styles.tabNumber}
                    aria-hidden="true"
                  >
                    {pillar.number}
                  </span>
                  <span className={styles.tabLabel}>
                    {pillar.shortLabel.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {pillars.map((pillar, index) => {
            const isActive = activeIndex === index;
            const image = pillar.image;
            const quantitativeEvidence = pillar.evidenceItems.filter(
              (item) => item.kind === "QUANTITATIVE"
            );
            const qualitativeEvidence = pillar.evidenceItems.filter(
              (item) => item.kind !== "QUANTITATIVE"
            );
            const hasApprovedEvidence =
              pillar.verifiedExplanatoryCopy !== null || pillar.evidenceItems.length > 0;

            return (
              <section
                key={pillar.id}
                id={pillar.id}
                role="tabpanel"
                aria-labelledby={`${pillar.id}-tab`}
                tabIndex={isActive ? 0 : -1}
                hidden={!isActive}
                className={styles.panel}
              >
                <div className={image ? styles.withImage : undefined}>
                  <div className={styles.panelContent}>
                    <header className={styles.panelHeading}>
                      <p className={styles.kicker}>Pillar {pillar.number} / {pillar.shortLabel.text}</p>
                      <h3 className="heading-section text-3xl text-bds-text-heading sm:text-4xl">
                        {pillar.publicTitle.text}
                      </h3>
                      <p className="text-base leading-relaxed text-bds-text-body sm:text-lg">
                        {pillar.operatingThesis.text}
                      </p>
                    </header>

                    {hasApprovedEvidence ? <div className={styles.evidence}>
                      <p className="heading-panel">{pillar.evidenceHeading.label}</p>
                      {pillar.verifiedExplanatoryCopy ? (
                        <p className="mt-2 text-sm leading-relaxed text-bds-text-body sm:text-base">
                          {pillar.verifiedExplanatoryCopy.text}
                        </p>
                      ) : null}
                      {quantitativeEvidence.length ? (
                        <dl
                          className={`mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3 ${
                            quantitativeEvidence.length === 1 ? "max-w-xs" : ""
                          }`}
                        >
                          {quantitativeEvidence.map((item) => (
                            <div key={item.id} className="border-l-2 border-bds-action-primary py-1 pl-3">
                              <dt className="text-xs font-bold uppercase tracking-wider text-bds-text-body">
                                {item.label}
                              </dt>
                              <dd className="mt-1 font-heading text-2xl font-black leading-none text-bds-text-heading">
                                {item.value}
                              </dd>
                              <p className="mt-2 text-sm leading-relaxed text-bds-text-body">
                                {item.explanation}
                              </p>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      {qualitativeEvidence.length ? (
                        <ul className="mt-3 space-y-3">
                          {qualitativeEvidence.map((item) => (
                            <li key={item.id} className="border-l-2 border-bds-teal-dark/35 pl-3">
                              <p className="text-sm font-semibold text-bds-text-heading">
                                {item.label}
                              </p>
                              <p className="mt-1 text-sm leading-relaxed text-bds-text-body">
                                {item.explanation}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div> : null}

                    <div className={styles.lens}>
                      <p className="heading-panel">{pillar.operatorLens.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-bds-text-body sm:text-base">
                        {pillar.operatorLens.text}
                      </p>
                    </div>

                    {pillar.contextualLink ? (
                      <a
                        href={pillar.contextualLink.href}
                        onClick={() =>
                          trackFunnelEvent("why_buddas_pillar_resource_open", {
                            page_path: "/franchise/why-buddas",
                            why_buddas_pillar_id: pillar.id,
                            why_buddas_destination_id: pillar.contextualLink?.destinationId,
                          })
                        }
                        className={styles.resource}
                      >
                        {pillar.contextualLink.label}
                        <span aria-hidden="true">→</span>
                      </a>
                    ) : null}

                    {pillar.quote ? (
                      <blockquote className="border-l-2 border-bds-gold pl-4 text-sm italic leading-relaxed text-bds-text-heading sm:text-base">
                        <p>&ldquo;{pillar.quote.text}&rdquo;</p>
                        <footer className="mt-2 text-xs font-bold not-italic uppercase tracking-wider text-bds-text-body">
                          {pillar.quote.speakerName} · {pillar.quote.speakerRole}
                        </footer>
                      </blockquote>
                    ) : null}
                  </div>

                  {isActive && image ? (
                    <figure className="w-full max-w-xs self-start overflow-hidden rounded-xl border border-bds-teal-dark/15 bg-bds-cream lg:max-w-40">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                          style={{ objectPosition: image.objectPosition }}
                          sizes="(max-width: 1023px) min(100vw - 3rem, 20rem), 160px"
                        />
                      </div>
                    </figure>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
