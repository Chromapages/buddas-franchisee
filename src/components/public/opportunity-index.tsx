import { OPPORTUNITY_DOSSIER_CHAPTERS } from "@/src/features/franchise/opportunity-content";

export const OPPORTUNITY_INDEX_ITEMS = OPPORTUNITY_DOSSIER_CHAPTERS;

type OpportunityIndexProps = {
  /** A stacked, two-column index keeps the same destinations available when the hero spread collapses. */
  layout?: "rail" | "inline";
  /** Unique visible-heading ID for this responsive navigation instance. */
  labelId: string;
};

/**
 * Static, crawlable document navigation. Current-location styling and analytics
 * are applied separately by OpportunityIndexEnhancer after hydration.
 */
export const OpportunityIndex = ({ layout = "rail", labelId }: OpportunityIndexProps) => {
  const isInline = layout === "inline";
  const rowSpacingClass = isInline ? "px-3" : "-mx-3 px-3";
  const headingRuleClass = isInline ? "border-b border-bds-teal-dark/20 py-3" : "pb-4";
  const listClass = isInline ? "grid md:grid-cols-2 md:gap-x-6" : "space-y-1";
  const rowRuleClass = isInline ? "border-b border-bds-teal-dark/15" : "";

  return (
    <nav data-opportunity-index aria-labelledby={labelId} className={isInline ? "border-t border-bds-teal-dark/20" : "relative pl-6 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-bds-teal-dark/35"}>
      <div className={headingRuleClass}>
        <p id={labelId} className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-bds-teal-dark">Opportunity index</p>
      </div>
      <ol className={listClass}>
        {OPPORTUNITY_INDEX_ITEMS.map((item) => (
          <li key={item.id}>
            <a
              data-opportunity-index-link
              data-opportunity-index-target={item.id}
              data-opportunity-analytics-id={item.analyticsId}
              href={`#${item.id}`}
              className={`group relative grid min-h-14 w-full cursor-pointer grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-1 py-2.5 font-body text-base font-semibold leading-[1.4] text-bds-teal-dark hover:text-bds-teal-ink focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-orange focus-visible:ring-offset-2 ${rowRuleClass} ${rowSpacingClass}`}
            >
              <span data-opportunity-index-number aria-hidden="true" className="inline-flex size-6 items-center justify-center font-body text-[0.8125rem] font-bold leading-none tabular-nums tracking-[0.06em] text-bds-teal-dark">
                {item.number}
              </span>
              <span data-opportunity-index-label className="min-w-0 font-body leading-[1.4] [text-wrap:pretty] underline decoration-bds-teal-dark/45 decoration-1 underline-offset-4 transition-colors duration-150 group-hover:decoration-current group-hover:decoration-2 group-focus-visible:decoration-current group-focus-visible:decoration-2 motion-reduce:transition-none">
                {item.label.text}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
