"use client";

import React, { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Lock, Sparkles, ShieldCheck } from "lucide-react";

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
    label: "Digital Brochure After Inquiry",
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
  const touchStartX = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % SIGNALS.length);
  }, []);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  const handlePrevious = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + SIGNALS.length) % SIGNALS.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX === null || endX === undefined || Math.abs(endX - startX) < 48) return;
    if (endX < startX) handleNext();
    else handlePrevious();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrevious();
      return;
    }
    if (event.key === "Home") setActiveIndex(0);
    if (event.key === "End") setActiveIndex(SIGNALS.length - 1);
  };

  const textColorClass = theme === "teal" ? "text-bds-cream/85" : "text-brand-cream/85";

  return (
    <div className="w-full pt-1.5">
      {/* Mobile: Manual swipe carousel (< sm) */}
      <div
        className="block sm:hidden w-full"
        role="region"
        aria-roledescription="carousel"
        aria-label="Workflow and reassurance highlights"
        tabIndex={0}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
      >
        {/* Active Slide Display */}
        <div
          className="relative min-h-[44px] flex items-center justify-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm"
          aria-live="polite"
          aria-atomic="true"
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

        <div className="mt-2 grid grid-cols-[2.75rem_1fr_2.75rem] items-center">
          <button
            type="button"
            onClick={handlePrevious}
            className="touch-target inline-flex items-center justify-center rounded-full text-bds-gold hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-gold"
            aria-label="Previous reassurance highlight"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {/* Carousel Pagination Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5">
          {SIGNALS.map((signal, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`dot-${signal.id}`}
                type="button"
                onClick={() => handleDotClick(index)}
                aria-label={`Slide ${index + 1}: ${signal.label.replace(/&bull;/g, "•")}`}
                aria-current={isActive ? "true" : "false"}
                className="touch-target flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold"
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "w-5 bg-bds-gold" : "w-1.5 bg-bds-cream/80 hover:bg-bds-cream"
                  }`}
                />
              </button>
            );
          })}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="touch-target inline-flex items-center justify-center rounded-full text-bds-gold hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-gold"
            aria-label="Next reassurance highlight"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
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
          <span>Digital Brochure After Inquiry</span>
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
