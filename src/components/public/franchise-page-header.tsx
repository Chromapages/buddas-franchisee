import type { ReactNode } from "react";
import Link from "next/link";

type FranchisePageHeaderAction = {
  href: string;
  label: string;
  icon?: ReactNode;
  external?: boolean;
  className?: string;
};

type FranchisePageHeaderProps = {
  preTitle?: ReactNode;
  contentClassName?: string;
  eyebrow?: {
    label: string;
    icon?: ReactNode;
    className?: string;
  };
  title: string;
  description: string;
  note?: string;
  sectionClassName?: string;
  containerClassName?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actions?: FranchisePageHeaderAction[];
  actionsClassName?: string;
  aside?: ReactNode;
  layoutClassName?: string;
  contextItems?: Array<{ label: string; value: string }>;
};

const defaultSectionClassName =
  "border-b border-bds-teal-dark/10 bg-bds-cream/60 py-12 xl:py-14";
const defaultEyebrowClassName =
  "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bds-action-primary lg:mb-3";
const defaultTitleClassName =
  "heading-page lg:mb-[1rem] lg:max-w-[23ch] lg:text-[clamp(2.25rem,2.65vw,3.0625rem)]";
const defaultDescriptionClassName =
  "text-base leading-relaxed text-bds-text-body sm:text-xl";

const defaultActionClassName =
  "inline-flex min-h-[44px] items-center gap-2 px-4 py-3 text-sm font-bold text-bds-text-heading hover:text-bds-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 rounded-sm";

export const FranchisePageHeader = ({
  preTitle,
  contentClassName,
  eyebrow,
  title,
  description,
  note,
  sectionClassName,
  containerClassName,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  actions,
  actionsClassName,
  aside,
  layoutClassName,
  contextItems,
}: FranchisePageHeaderProps) => {
  const contextualAside = aside ?? (contextItems?.length ? (
    <dl className="hidden divide-y divide-bds-teal-dark/10 border-l border-bds-teal-dark/20 pl-4 lg:block">
      {contextItems.map((item) => (
        <div key={item.label} className="py-2 first:pt-0 last:pb-0">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-bds-action-primary">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-bds-text-heading">{item.value}</dd>
        </div>
      ))}
    </dl>
  ) : null);
  const hasAside = Boolean(contextualAside);

  return (
    <section className={sectionClassName || defaultSectionClassName}>
      <div className={containerClassName || "content-wide"}>
        <div className={hasAside ? "grid items-center gap-8 lg:items-start lg:gap-12 " + (layoutClassName || "lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]") : "max-w-4xl"}>
          <div className={contentClassName || "heading-stack"}>
          {preTitle}
          {eyebrow ? (
            <span className={eyebrowClassName || eyebrow.className || defaultEyebrowClassName}>
              {eyebrow.icon}
              {eyebrow.label}
            </span>
          ) : null}
          <h1 className={titleClassName || defaultTitleClassName}>{title}</h1>
          <div className={note ? "space-y-2" : undefined}>
            <p className={`${descriptionClassName || defaultDescriptionClassName} prose-measure body-copy`}>
              {description}
            </p>
            {note ? <p className="text-sm font-semibold text-bds-text-body/80">Takes about {note} to complete.</p> : null}
          </div>
          {actions?.length ? (
            <div className={actionsClassName || "flex flex-wrap gap-3"}>
              {actions.map((action) =>
                action.external ? (
                <a
                  key={action.href}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={action.className || defaultActionClassName}
                >
                  {action.label}
                  {action.icon}
                </a>
                ) : (
                <Link
                  key={action.href}
                  href={action.href}
                  className={action.className || defaultActionClassName}
                >
                  {action.label}
                  {action.icon}
                </Link>
                )
              )}
            </div>
          ) : null}
          </div>
          {hasAside ? <div>{contextualAside}</div> : null}
        </div>
      </div>
    </section>
  );
};
