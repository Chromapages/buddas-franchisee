"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  type Pillar,
  WHY_BUDDAS_PILLARS,
} from "@/src/features/why-buddas/pillars-config.ts";

export type { Pillar };
export { WHY_BUDDAS_PILLARS };

export const WhyBuddasPillars = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelectTab = (index: number) => {
    setActiveTab(index);
    tabButtonRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % WHY_BUDDAS_PILLARS.length;
      handleSelectTab(nextIndex);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + WHY_BUDDAS_PILLARS.length) % WHY_BUDDAS_PILLARS.length;
      handleSelectTab(nextIndex);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      handleSelectTab(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      handleSelectTab(WHY_BUDDAS_PILLARS.length - 1);
      return;
    }
  };

  const currentPillar = WHY_BUDDAS_PILLARS[activeTab];

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bds-gold/20 text-bds-teal-dark text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-bds-action-primary" aria-hidden="true" />
          The Four Pillars of Distinction
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-bds-text-heading tracking-tight">
          Why Budda&apos;s Outperforms Conventional Fast-Casual.
        </h2>
        <p className="text-base sm:text-lg text-bds-text-body/80 leading-relaxed">
          Select a pillar to explore how our bakery-led architecture, all-day utility, and operational discipline create an enduring competitive moat.
        </p>
      </div>

      {/* Split Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Sticky Rail Navigation */}
        <div
          role="tablist"
          aria-label="Why Budda's Core Pillars"
          className="lg:col-span-5 lg:sticky lg:top-28 space-y-3"
        >
          {WHY_BUDDAS_PILLARS.map((pillar, idx) => {
            const isSelected = activeTab === idx;
            return (
              <button
                key={pillar.id}
                ref={(el) => {
                  tabButtonRefs.current[idx] = el;
                }}
                role="tab"
                id={`tab-${pillar.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${pillar.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleSelectTab(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all flex items-center justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-bds-action-primary text-bds-action-primary-text shadow-md ring-1 ring-bds-teal-dark"
                    : "bg-white text-bds-text-body hover:bg-bds-cream/80 border border-bds-teal-dark/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider font-heading ${
                      isSelected
                        ? "bg-bds-gold text-bds-teal-dark"
                        : "bg-bds-cream text-bds-cocoa"
                    }`}
                  >
                    {pillar.number}
                  </span>
                  <div>
                    <h3
                      className={`text-base font-bold font-heading ${
                        isSelected ? "text-white" : "text-bds-text-heading"
                      }`}
                    >
                      {pillar.shortTitle}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${
                        isSelected ? "text-bds-cream/80" : "text-bds-text-body/60"
                      }`}
                    >
                      {pillar.tagline}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 transition-transform ${
                    isSelected
                      ? "text-bds-gold translate-x-1"
                      : "text-bds-text-body/30 group-hover:translate-x-0.5"
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        {/* Right Dynamic Evidence Canvas */}
        <div
          role="tabpanel"
          id={`panel-${currentPillar.id}`}
          aria-labelledby={`tab-${currentPillar.id}`}
          tabIndex={0}
          className="lg:col-span-7 bg-white border border-bds-teal-dark/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl space-y-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary transition-all"
        >
          {/* Header Badges & Tagline */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bds-teal-dark/10 pb-4">
            <div className="flex flex-wrap gap-2">
              {currentPillar.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bds-cream text-bds-teal-dark text-xs font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-bds-action-primary" aria-hidden="true" />
                  {badge}
                </span>
              ))}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-bds-cocoa/50">
              Pillar {currentPillar.number} of 04
            </span>
          </div>

          {/* Core Headline & Narrative */}
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black font-heading text-bds-text-heading leading-tight">
              {currentPillar.headline}
            </h3>
            <p className="text-base text-bds-text-body/80 leading-relaxed">
              {currentPillar.narrative}
            </p>
          </div>

          {/* Operational Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {currentPillar.metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-bds-cream/60 border border-bds-teal-dark/10 rounded-2xl p-4 text-center sm:text-left space-y-1"
              >
                <p className="text-2xl sm:text-3xl font-black font-heading text-bds-action-primary">
                  {metric.value}
                </p>
                <p className="text-xs font-semibold text-bds-text-body/70">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          {/* Visual Showcase Card with Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-bds-teal-dark/10 bg-bds-cream">
            <Image
              src={currentPillar.imageSrc}
              alt={currentPillar.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
          </div>

          {/* Founder / Team Quote */}
          <div className="bg-bds-cream/80 border-l-4 border-bds-gold rounded-r-2xl p-5 space-y-2">
            <blockquote className="text-sm sm:text-base italic text-bds-text-heading font-medium leading-relaxed">
              &ldquo;{currentPillar.quote}&rdquo;
            </blockquote>
            <p className="text-xs font-bold uppercase tracking-wider text-bds-cocoa/70">
              — {currentPillar.quoteAuthor}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
