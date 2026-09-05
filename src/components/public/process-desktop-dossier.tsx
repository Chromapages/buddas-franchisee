import type { PublicFranchiseProcessContent, PublicProcessStage } from "@/src/features/franchise/process-content";
import { FranchisePageHeader } from "@/src/components/public/franchise-page-header";
import { ProcessStageDetails } from "@/src/components/public/process-stage-details";
import { ProcessDesktopClosingCta } from "@/src/components/public/process-desktop-closing-cta";

const ProcessDesktopStage = ({
  stage,
  federalTiming,
}: {
  stage: PublicProcessStage;
  federalTiming: string | null;
}) => {
  const stageId = `${stage.id}-desktop`;

  return (
    <li id={stageId} className="scroll-mt-12 border-t border-bds-teal-dark/20 first:border-t-0">
      <article className="grid grid-cols-[12rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="bg-bds-teal-dark px-7 py-9 text-bds-cream xl:px-8 xl:py-10">
          <p className="font-heading text-6xl font-black leading-none text-bds-cream xl:text-7xl">{stage.number}</p>
          <h2 className="mt-6 font-heading text-2xl font-bold leading-tight">{stage.publicTitle}</h2>
          {stage.approvedTimingLabel ? <p className="mt-5 border-t border-bds-cream/25 pt-4 text-sm font-semibold leading-5 text-bds-cream/85">{stage.approvedTimingLabel}</p> : null}
        </div>

        <div className="min-w-0 px-8 py-9 xl:px-10 xl:py-10">
          <div className="grid gap-x-8 gap-y-7 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-bds-teal-dark">What happens</h3>
              <p className="mt-3 max-w-[30rem] text-base leading-7 text-bds-text-body/85">{stage.summary}</p>
            </section>

            <dl className="contents">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-bds-teal-dark">You evaluate</dt>
                <dd className="mt-3 text-base leading-7 text-brand-charcoal">{stage.candidateEvaluates}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-bds-teal-dark">Budda&apos;s evaluates</dt>
                <dd className="mt-3 text-base leading-7 text-brand-charcoal/80">{stage.buddasEvaluates}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 grid gap-6 border-t border-bds-teal-dark/15 pt-6 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)] xl:items-start">
            <section className="border-l-2 border-bds-gold pl-4" aria-labelledby={`${stageId}-decision`}>
              <h3 id={`${stageId}-decision`} className="text-xs font-bold uppercase tracking-[0.1em] text-bds-teal-dark">Decision gate: {stage.decisionGateLabel}</h3>
              <p className="mt-2 text-base font-semibold leading-7 text-brand-charcoal">{stage.decisionGate}</p>
            </section>

            <div>
              {stage.relatedLinks.map((link) => (
                <a key={link.href} href={link.href} data-process-analytics="related-link" data-process-stage-id={stage.id} data-process-destination-id={link.destinationId} className="touch-target-inline text-sm font-bold text-bds-teal-dark underline underline-offset-4 hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {stage.id === "fdd-disclosure" && federalTiming ? (
            <section className="mt-7 border-y border-bds-teal-dark/20 py-5" aria-labelledby={`${stageId}-federal-timing`}>
              <h3 id={`${stageId}-federal-timing`} className="text-xs font-bold uppercase tracking-[0.1em] text-bds-teal-dark">Federal timing</h3>
              <p className="mt-3 max-w-[54rem] border-l-2 border-bds-gold pl-4 text-sm font-semibold leading-6 text-brand-charcoal">{federalTiming}</p>
            </section>
          ) : null}

          {stage.detailDisclosureLabel && stage.optionalDetails.length > 0 ? (
            <ProcessStageDetails stageId={stage.id} label={stage.detailDisclosureLabel}>
              <dl className="grid gap-6 border-t border-bds-teal-dark/15 pt-5 xl:grid-cols-3">
                {stage.optionalDetails.map((detail) => (
                  <div key={detail.id}>
                    <dt className="text-xs font-bold uppercase tracking-[0.1em] text-bds-teal-dark">{detail.label}</dt>
                    <dd className="mt-2 text-sm leading-6 text-brand-charcoal/80">{detail.detail}</dd>
                  </div>
                ))}
              </dl>
            </ProcessStageDetails>
          ) : null}
        </div>
      </article>
    </li>
  );
};

export const ProcessDesktopDossier = ({
  content,
}: {
  content: PublicFranchiseProcessContent;
}) => (
  <div className="hidden !mt-0 lg:block">
    <FranchisePageHeader
      eyebrow={{ label: content.framing.eyebrow }}
      title={content.framing.title}
      description={content.framing.description}
    />

    <section className="bg-bds-cream/60 pb-24 pt-8" aria-labelledby="desktop-process-overview-heading">
    <div className="mx-auto max-w-[78rem] px-8 xl:px-10">
      <nav className="border-y border-bds-teal-dark/20" aria-labelledby="desktop-process-overview-heading">
        <h2 id="desktop-process-overview-heading" className="sr-only">{content.framing.overviewLabel}</h2>
        <ol className="grid grid-cols-2">
          {content.stages.map((stage, index) => (
            <li key={stage.id} className={`min-w-0 ${index > 1 ? "border-t border-bds-teal-dark/15" : ""} ${index % 2 ? "border-l border-bds-teal-dark/15" : ""}`}>
              <a href={`#${stage.id}-desktop`} data-process-analytics="overview-stage" data-process-stage-id={stage.id} className="flex min-h-[8.5rem] items-center gap-5 px-7 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-inset xl:px-9">
                <span className="font-heading text-5xl font-black leading-none text-bds-teal-dark xl:text-6xl">{stage.number}</span>
                <span className="text-lg font-bold leading-snug text-bds-text-heading xl:text-xl">{stage.publicTitle}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ol className="mt-12">
        {content.stages.map((stage) => (
          <ProcessDesktopStage key={stage.id} stage={stage} federalTiming={stage.id === "fdd-disclosure" ? content.legalGovernance.federalTiming : null} />
        ))}
      </ol>

      <ProcessDesktopClosingCta content={content.closing} />
    </div>
    </section>
  </div>
);
