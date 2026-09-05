"use client";

import { useState } from "react";
import type { ElementType, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { IconFrame } from "@/src/components/ui/icon-frame";

export type AccordionItemProps = {
  id: string;
  title: ReactNode;
  children: ReactNode;
  category?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  footer?: ReactNode;
  aside?: ReactNode;
  /** Keeps supplementary visual content available on desktop without crowding mobile answers. */
  hideAsideOnMobile?: boolean;
  variant?: "card" | "ledger";
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Native interaction before hydration; opt-in so existing accordions retain their behavior. */
  nativeDisclosure?: boolean;
};

export const AccordionItem = ({
  id,
  title,
  children,
  category,
  headingLevel,
  footer,
  aside,
  hideAsideOnMobile = false,
  variant = "card",
  isOpen: controlledIsOpen,
  onOpenChange,
  nativeDisclosure = false,
}: AccordionItemProps) => {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;

  const handleToggle = () => {
    const nextIsOpen = !isOpen;
    if (controlledIsOpen === undefined) setUncontrolledIsOpen(nextIsOpen);
    onOpenChange?.(nextIsOpen);
  };

  const contentId = `accordion-content-${id}`;
  const headerId = `accordion-header-${id}`;
  const HeadingTag = headingLevel ? (`h${headingLevel}` as ElementType) : null;

  if (nativeDisclosure) {
    const NativeHeading = HeadingTag ?? "span";
    return (
      <details id={id} open={isOpen} className="faq-ledger-item faq-native-disclosure border-t border-bds-teal-dark/20"
        onToggle={(event) => {
          const next = event.currentTarget.open;
          if (next !== isOpen) {
            if (controlledIsOpen === undefined) setUncontrolledIsOpen(next);
            onOpenChange?.(next);
          }
        }}>
        <summary id={headerId} aria-controls={contentId} className="accordion-trigger">
          <NativeHeading className="faq-native-heading">
            <span className="faq-native-label">
              {category ? <span className="taxonomy-label">{category}</span> : null}
              <span className="faq-native-title">{title}</span>
            </span>
            <IconFrame size="md" className="accordion-state-indicator"><ChevronDown className="h-5 w-5" /></IconFrame>
          </NativeHeading>
        </summary>
        <div id={contentId} className="faq-native-panel">
          {children}
          {footer ? <div className="accordion-footer mt-6 border-t border-brand-sand pt-4">{footer}</div> : null}
        </div>
      </details>
    );
  }

  const trigger = (
    <button
      type="button"
      id={headerId}
      aria-controls={contentId}
      aria-expanded={isOpen}
      onClick={handleToggle}
      className={variant === "ledger" ? `accordion-trigger w-full min-h-14 text-left py-4 flex items-start justify-start gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-inset ${isOpen ? "bg-brand-sand/40" : "hover:bg-brand-sand/20"}` : "accordion-trigger w-full min-h-12 text-left px-6 py-6 flex items-start justify-start gap-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal focus-visible:ring-inset"}
    >
      <div className={variant === "ledger" ? "flex flex-1 min-w-0 flex-col gap-1.5" : "flex flex-1 min-w-0 flex-col gap-2"}>
        {category ? (
          <span className={variant === "ledger" ? "taxonomy-label text-[11px] font-semibold uppercase tracking-[0.08em]" : "taxonomy-label text-xs font-semibold uppercase tracking-wider"}>
            {category}
          </span>
        ) : null}
        <span className="text-[1.0625rem] font-bold leading-[1.3] text-brand-charcoal font-heading [text-wrap:balance] sm:text-[1.1875rem] lg:text-[1.3125rem]">
          {title}
        </span>
      </div>
      <IconFrame
        size="md"
        className={`accordion-state-indicator mt-1 text-brand-charcoal transition-transform duration-200 ease-in-out motion-reduce:transition-none ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        <ChevronDown className="h-5 w-5" />
      </IconFrame>
    </button>
  );

  return (
    <div id={id} className={variant === "ledger" ? "faq-ledger-item overflow-hidden border-t border-bds-teal-dark/20 scroll-mt-24 last:border-b-0" : "accordion-item overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 scroll-mt-24 " + (isOpen ? "border-bds-action-primary/40 bg-brand-sand/20" : "border-brand-charcoal/10 bg-white hover:border-brand-mango/50")}>
      {HeadingTag ? <HeadingTag>{trigger}</HeadingTag> : trigger}

      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={"accordion-panel grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-in-out motion-reduce:transition-none " + (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={variant === "ledger" ? "border-t border-bds-teal-dark/15 pb-5 pt-4 text-base leading-relaxed text-brand-charcoal/80" : "border-t border-brand-sand px-6 pb-6 pt-2 text-base leading-relaxed text-brand-charcoal/80"}>
            <div className={aside ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,350px)] lg:gap-8 xl:gap-10" : ""}>
              <div className="max-w-none text-[1rem] leading-[1.65]">{children}</div>
              {aside ? <aside className={`${hideAsideOnMobile ? "hidden md:block" : ""} border-l border-bds-teal-dark/15 bg-brand-sand/20 p-6`}>{aside}</aside> : null}
            </div>
            {footer ? <div className="accordion-footer mt-6 border-t border-brand-sand pt-4">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};
