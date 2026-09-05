import type { Metadata } from "next";
import { ProcessDesktopDossier } from "@/src/components/public/process-desktop-dossier";
import { ProcessClosingCta } from "@/src/components/public/process-closing-cta";
import { ProcessInteractionAnalytics } from "@/src/components/public/process-interaction-analytics";
import { ProcessStageDetails } from "@/src/components/public/process-stage-details";
import { FranchisePageHeader } from "@/src/components/public/franchise-page-header";
import { getPublicFranchiseProcessContent } from "@/src/features/franchise/process-content";

const processContent = getPublicFranchiseProcessContent();

export const metadata: Metadata = {
  title: processContent.metadata.title,
  description: processContent.metadata.description,
  alternates: { canonical: processContent.metadata.canonicalPath },
};

export default function ProcessPage() {
  return (
    <div className="page-rhythm">
      <div className="lg:hidden">
      <FranchisePageHeader
        sectionClassName="bg-bds-cream/60 pt-12 pb-6"
        containerClassName="process-content-grid"
        eyebrow={{ label: processContent.framing.eyebrow }}
        title={processContent.framing.title}
        titleClassName="heading-page text-[clamp(1.875rem,8vw,2.25rem)]"
        description={processContent.framing.description}
      />

      <section className="process-spine process-content-grid mt-6" aria-labelledby="process-spine-heading">
        <h2 id="process-spine-heading" className="sr-only">
          Detailed four-stage mutual evaluation process
        </h2>
        <ol className="space-y-0">
          {processContent.stages.map((stage, index) => (
            <li
              id={stage.id}
              key={stage.id}
              className="process-spine-stage relative grid scroll-mt-24 grid-cols-[3rem_minmax(0,1fr)] gap-4 pb-8 last:pb-0 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6"
            >
              <div className="relative flex justify-center" aria-hidden="true">
                <span
                  className={`absolute left-1/2 w-px -translate-x-1/2 bg-bds-teal-dark/25 ${
                    index === 0
                      ? "top-6 bottom-0"
                      : index === processContent.stages.length - 1
                        ? "top-0 bottom-[calc(100%-1.5rem)]"
                        : "inset-y-0"
                  }`}
                />
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-bds-teal-dark/70 bg-bds-cream font-heading text-lg font-black text-bds-teal-dark">
                  {stage.number}
                </span>
              </div>
              <article className="min-w-0 pb-1">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-bds-teal-dark">
                  Stage {stage.number}
                </p>
                <h3 className="mt-1 font-heading text-2xl font-bold leading-tight text-brand-charcoal sm:text-[1.625rem]">
                  {stage.publicTitle}
                </h3>
                <section className="mt-3">
                  <h4 className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">
                    What happens
                  </h4>
                  <p className="mt-2 text-base leading-[1.6] text-bds-text-body/80">{stage.summary}</p>
                </section>

                <dl className="mt-5 grid gap-4 border-y border-bds-teal-dark/15 py-4 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">
                      Budda&apos;s evaluates
                    </dt>
                    <dd className="mt-2 text-base leading-[1.6] text-brand-charcoal/80">
                      {stage.buddasEvaluates}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">
                      You evaluate
                    </dt>
                    <dd className="mt-2 text-base font-medium leading-[1.6] text-brand-charcoal">
                      {stage.candidateEvaluates}
                    </dd>
                  </div>
                </dl>

                <section className="mt-4 border-l-2 border-bds-teal-dark/60 pl-4" aria-labelledby={`${stage.id}-decision`}>
                  <h4
                    id={`${stage.id}-decision`}
                    className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark"
                  >
                    Decision gate: {stage.decisionGateLabel}
                  </h4>
                  <p className="mt-1 text-base font-semibold leading-[1.6] text-brand-charcoal">
                    {stage.decisionGate}
                  </p>
                </section>

                {stage.relatedLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    data-process-analytics="related-link"
                    data-process-stage-id={stage.id}
                    data-process-destination-id={link.destinationId}
                    className="touch-target-inline mt-4 text-sm font-bold text-bds-teal-dark underline underline-offset-4 hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </a>
                ))}

                {stage.id === "fdd-disclosure" && processContent.legalGovernance.federalTiming ? (
                  <section
                    className="mt-5 border-y border-bds-teal-dark/20 py-4"
                    aria-labelledby={`${stage.id}-federal-timing`}
                  >
                    <h4
                      id={`${stage.id}-federal-timing`}
                      className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark"
                    >
                      Federal timing
                    </h4>
                    <p className="mt-2 border-l-2 border-bds-gold pl-4 text-base font-semibold leading-[1.6] text-brand-charcoal">
                      {processContent.legalGovernance.federalTiming}
                    </p>
                  </section>
                ) : null}

                {stage.detailDisclosureLabel && stage.optionalDetails.length > 0 ? (
                  <ProcessStageDetails stageId={stage.id} label={stage.detailDisclosureLabel}>
                    <dl className="grid gap-4 border-t border-bds-teal-dark/15 pt-4 sm:grid-cols-3">
                      {stage.optionalDetails.map((detail) => (
                        <div key={detail.id}>
                          <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">
                            {detail.label}
                          </dt>
                          <dd className="mt-1 text-base leading-[1.6] text-brand-charcoal/80">
                            {detail.detail}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </ProcessStageDetails>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      </section>

      <ProcessClosingCta content={processContent.closing} />
      </div>

      <ProcessDesktopDossier content={processContent} />
      <ProcessInteractionAnalytics />
    </div>
  );
}
