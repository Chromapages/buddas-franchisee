import Link from "next/link";
import { FinalCtaAction, FinalCtaQualificationBenchmark, type FranchiseFinalCtaPresentationProps } from "@/src/components/public/franchise-final-cta-shared";

/** Mobile closing CTA uses an independent, content-driven four-column rhythm. */
export const FranchiseFinalCtaMobile = (props: FranchiseFinalCtaPresentationProps) => (
  <section
    className={`${props.fullBleed ? "w-full bg-bds-teal-dark pt-9 pb-8" : "content-wide section-standard"} text-white md:hidden`}
    aria-labelledby="franchise-final-cta-mobile-title"
  >
    <div className={props.fullBleed ? "content-wide !px-5" : "rounded-2xl bg-bds-teal-dark p-5 shadow-xl sm:rounded-3xl sm:p-10"}>
      <div className="mx-auto max-w-xl text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-bds-cream/85">{props.eyebrow}</p>
        <h2 id="franchise-final-cta-mobile-title" className="homepage-section-heading !mx-auto mt-3 w-full max-w-[21ch] [text-wrap:balance] !text-[clamp(1.875rem,8vw,2.25rem)] !leading-[1.04] text-bds-cream">{props.title}</h2>
        <p className="homepage-section-description mx-auto mt-4 max-w-[34ch] !text-base leading-6 font-body text-bds-cream/80">{props.description}</p>

        <div className="mt-6">
          <FinalCtaQualificationBenchmark {...props.qualificationBenchmark} />
        </div>

        <div className="mt-5">
          <FinalCtaAction href={props.contactHref} label={props.primaryActionLabel} onPrimaryClick={props.onPrimaryClick} />
        </div>

        {props.expectation ? <p className="mt-3 font-body text-sm font-medium text-bds-cream/85">{props.expectation}</p> : null}

        <Link href={props.processHref} aria-label={props.processActionLabel} onClick={props.onProcessLinkClick} className="touch-target-inline mt-5 inline-flex min-h-11 items-center justify-center font-heading text-[13px] font-medium text-bds-cream underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-cream focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark rounded-sm">{props.processActionLabel}<span aria-hidden="true" className="ml-2">→</span></Link>
        <p className="mx-auto mt-3 max-w-[34ch] font-body text-sm leading-6 text-bds-cream/75">{props.boundary}</p>
      </div>
    </div>
  </section>
);
