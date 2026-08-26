"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Lock, Sparkles, ShieldCheck } from "lucide-react";

interface SignalItem {
  readonly id: string;
  readonly icon: React.ElementType;
  readonly label: string;
  readonly highlight?: string;
}

const SIGNALS: readonly SignalItem[] = [
  {
    id: "in-house-review",
    icon: Lock,
    label: "In-House Corporate Review",
    highlight: "Direct Team",
  },
  {
    id: "instant-brochure",
    icon: Sparkles,
    label: "Instant Digital Brochure via Email",
    highlight: "Immediate",
  },
  {
    id: "zero-obligation",
    icon: ShieldCheck,
    label: "Zero Obligation &bull; Non-Binding",
    highlight: "Protected",
  },
];

export interface WorkflowReassuranceCarouselProps {
  readonly theme?: "teal" | "charcoal";
}

export const WorkflowReassuranceCarousel: React.FC<WorkflowReassuranceCarouselProps> = ({
  theme = "teal",
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const handleNext = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % SIGNALS.length);
  }, []);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex - 1 + SIGNALS.length) % SIGNALS.length);
      return;
    }
  };

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, 3500);

    return () => {
      clearInterval(timer);
    };
  }, [isPaused, handleNext]);

  const textColorClass = theme === "teal" ? "text-bds-cream/85" : "text-brand-cream/85";

  return (
    <div className="w-full pt-1.5">
      {/* Mobile: Automatic Flowing Carousel (< sm) */}
      <div
        className="block sm:hidden w-full"
        role="region"
        aria-roledescription="carousel"
        aria-label="Workflow and reassurance highlights"
        tabIndex={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
      >
        {/* Active Slide Display */}
        <div
          className="relative min-h-[44px] flex items-center justify-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm"
          aria-live={isPaused ? "polite" : "off"}
        >
          {SIGNALS.map((signal, index) => {
            const Icon = signal.icon;
            const isActive = index === activeIndex;

            return (
              <div
                key={signal.id}
                className={`flex items-center justify-center gap-2 text-xs font-medium ${textColorClass} transition-all duration-500 ease-in-out ${
                  isActive
                    ? "opacity-100 translate-y-0 relative z-10"
                    : "opacity-0 translate-y-3 absolute inset-0 pointer-events-none"
                }`}
                aria-hidden={!isActive}
              >
                <Icon className="w-4 h-4 text-bds-gold shrink-0" aria-hidden="true" />
                <span dangerouslySetInnerHTML={{ __html: signal.label }} />
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {SIGNALS.map((signal, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`dot-${signal.id}`}
                type="button"
                onClick={() => handleDotClick(index)}
                aria-label={`Slide ${index + 1}: ${signal.label.replace(/&bull;/g, "•")}`}
                aria-current={isActive ? "true" : "false"}
                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold ${
                  isActive ? "w-5 bg-bds-gold" : "w-1.5 bg-white/25 hover:bg-white/40"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop & Tablet: Static Inline Row (>= sm) */}
      <div className={`hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-xs ${textColorClass}`}>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-bds-gold shrink-0" aria-hidden="true" />
          <span>In-House Corporate Review</span>
        </span>
        <span className="text-bds-gold/40 hidden sm:inline" aria-hidden="true">&bull;</span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-bds-gold shrink-0" aria-hidden="true" />
          <span>Instant Digital Brochure via Email</span>
        </span>
        <span className="text-bds-gold/40 hidden sm:inline" aria-hidden="true">&bull;</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-bds-gold shrink-0" aria-hidden="true" />
          <span>Zero Obligation</span>
        </span>
      </div>
    </div>
  );
};
