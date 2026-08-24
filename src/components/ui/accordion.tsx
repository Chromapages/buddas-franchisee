"use client";

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionItemProps = {
  id: string;
  title: string;
  children: ReactNode;
  category?: string;
};

export const AccordionItem = ({
  id,
  title,
  children,
  category,
}: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  const contentId = `accordion-content-${id}`;
  const headerId = `accordion-header-${id}`;

  return (
    <div className="border border-brand-charcoal/10 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:border-brand-mango/50">
      <button
        type="button"
        id={headerId}
        aria-controls={contentId}
        aria-expanded={isOpen}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label={`Toggle FAQ: ${title}`}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-brand-clay focus:ring-inset"
      >
        <div className="flex flex-col gap-1">
          {category ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-clay">
              {category}
            </span>
          ) : null}
          <span className="text-lg font-bold text-brand-charcoal font-heading">
            {title}
          </span>
        </div>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full bg-brand-sand flex items-center justify-center text-brand-charcoal transition-transform duration-200 ${
            isOpen ? "rotate-180 bg-brand-butter text-brand-charcoal" : ""
          }`}
        >
          <ChevronDown className="w-5 h-5" aria-hidden="true" />
        </div>
      </button>

      {isOpen ? (
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className="px-6 pb-6 pt-2 text-brand-charcoal/80 text-base leading-relaxed border-t border-brand-sand"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};
