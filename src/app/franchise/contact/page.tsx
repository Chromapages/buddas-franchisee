import type { Metadata } from "next";
import Image from "next/image";
import { issueInquiryFormSession } from "@/src/features/inquiry/form-token";
import { InquiryForm } from "@/src/components/public/inquiry-form";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ChefHat, Send, Phone, Mail, MapPin, Lock, UsersRound } from "lucide-react";
import { FranchisePageHeader } from "@/src/components/public/franchise-page-header";
import { InquirySidebarFraming } from "@/src/components/public/inquiry-sidebar-framing";
import type { InquiryAttribution } from "@/src/features/inquiry/types";
import { PUBLIC_INITIAL_INQUIRY_CONTENT } from "@/src/features/inquiry/public-inquiry-content";
import { StructuredData } from "@/src/components/public/structured-data";
import "./contact-desktop.css";

export const metadata: Metadata = {
  title: "Request Franchise Information | Budda's",
  description: "Contact Budda's franchise development team to begin the mutual evaluation process and discuss operator qualifications and market interest.",
  alternates: { canonical: "/franchise/contact" },
};

const getAttribution = (
  searchParams: Record<string, string | string[] | undefined>,
): InquiryAttribution => {
  const read = (key: string) => {
    const value = searchParams[key];
    return typeof value === "string" ? value.slice(0, 128) : undefined;
  };
  return {
    sourcePage: read("source_page"),
    utmSource: read("utm_source"),
    utmMedium: read("utm_medium"),
    utmCampaign: read("utm_campaign"),
    utmContent: read("utm_content"),
    utmTerm: read("utm_term"),
  };
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { session, token } = issueInquiryFormSession();
  const attribution = getAttribution(await searchParams);

  return (
    <><StructuredData /><div className="page-rhythm contact-page">
      <div className="lg:hidden"><FranchisePageHeader
        sectionClassName="contact-inquiry-hero bg-bds-cream/60 border-b border-bds-teal-dark/10 py-[clamp(3rem,6vw,6rem)]"
        containerClassName="content-wide"
        eyebrow={{
          label: "Stage 1 of 4: Initial Inquiry",
          icon: <Send className="w-3.5 h-3.5 text-bds-action-primary" aria-hidden="true" />,
        }}
        title="Request Franchise Information."
        description="Complete this three-step inquiry form to begin Stage 1 of our four-stage mutual evaluation process."
        note={PUBLIC_INITIAL_INQUIRY_CONTENT.completionEstimate.value}
        aside={
          <div className="hidden rounded-2xl border border-bds-teal-dark/15 bg-white/70 p-5 shadow-sm lg:block">
            <p className="text-xs font-bold uppercase tracking-wider text-bds-action-primary">Your journey starts here</p>
            <ol className="mt-4 space-y-3 text-sm">
              <li aria-current="step" className="flex items-center gap-3 font-semibold text-bds-text-heading"><CheckCircle2 className="h-5 w-5 shrink-0 text-bds-action-primary" aria-hidden="true" />1. Initial Inquiry <span className="sr-only">(Current stage)</span></li>
              <li className="flex items-center gap-3 text-bds-text-body/70"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-bds-teal-dark/30 text-[10px]">2</span>Discovery Call</li>
              <li className="flex items-center gap-3 text-bds-text-body/70"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-bds-teal-dark/30 text-[10px]">3</span>FDD Review</li>
              <li className="flex items-center gap-3 text-bds-text-body/70"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-bds-teal-dark/30 text-[10px]">4</span>Discovery Day</li>
            </ol>
          </div>
        }
      /></div>

      <section className="contact-desktop-hero hidden lg:block" aria-labelledby="contact-desktop-title">
        <div className="contact-desktop-hero-grid">
          <div className="contact-desktop-hero-copy">
            <div className="contact-desktop-kicker"><span>Your franchise journey</span><span>Stage 1 of 4</span></div>
            <h1 id="contact-desktop-title">Request Franchise<br />Information.</h1>
            <p>Start with a short inquiry so we can both learn more — about you, your market, and the opportunity. It&apos;s a conversation, not a commitment.</p>
            <div className="contact-desktop-hero-actions"><a href="#inquiry-form" className="contact-desktop-primary">Start your inquiry <ArrowRight aria-hidden="true" /></a><span>Prefer to talk first?</span><a href="tel:+18017010617">Contact our team <ArrowRight aria-hidden="true" /></a></div>
          </div>
          <figure className="contact-desktop-hero-media">
            <Image src="/images/buddas-hero-rolls-cover.png" alt="Signature Budda Roll with a golden crown and soft pull-apart crumb" fill priority sizes="50vw" />
            <figcaption><strong>The Budda Roll</strong><span>A signature worth more tables</span></figcaption>
          </figure>
        </div>
      </section>

      <nav className="contact-stage-rail hidden lg:block" aria-label="Franchise evaluation stages">
        <ol className="content-wide">
          {[
            ["Initial Inquiry", "You are here"],
            ["Discovery Call", "A deeper conversation"],
            ["FDD Review", "Full opportunity details"],
            ["Discovery Day", "Experience Budda’s"],
          ].map(([title, description], index) => <li key={title} aria-current={index === 0 ? "step" : undefined}><span>{index + 1}</span><div><strong>{title}</strong><small>{description}</small></div></li>)}
        </ol>
      </nav>

      {/* Main Grid: Form + Direct Contact Information */}
      <section className="contact-inquiry-action content-wide">
        <section aria-labelledby="operator-fit-heading" className="contact-fit-section rounded-3xl border border-brand-charcoal/10 bg-brand-sand/40 p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-clay">Before you start</p>
            <h2 id="operator-fit-heading" className="mt-2 heading-subsection text-brand-charcoal">Is this a good fit?</h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-charcoal/75">This opportunity is designed for hands-on operators who are ready to build a lasting local business.</p>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex items-start gap-3"><span className="contact-fit-icon"><UsersRound aria-hidden="true" /></span><span className="text-sm leading-relaxed text-brand-charcoal"><strong>Owner-operator mindset</strong><br />Engaged in the business, not absent from it.</span></li>
            <li className="flex items-start gap-3"><span className="contact-fit-icon"><ChefHat aria-hidden="true" /></span><span className="text-sm leading-relaxed text-brand-charcoal"><strong>Hospitality or operations experience</strong><br />Comfortable leading teams and standards.</span></li>
            <li className="flex items-start gap-3"><span className="contact-fit-icon"><UsersRound aria-hidden="true" /></span><span className="text-sm leading-relaxed text-brand-charcoal"><strong>Leadership commitment</strong><br />Ready to develop people and serve a community.</span></li>
            <li className="flex items-start gap-3"><span className="contact-fit-icon"><MapPin aria-hidden="true" /></span><span className="text-sm leading-relaxed text-brand-charcoal"><strong>Market commitment</strong><br />A thoughtful interest in where and how to grow.</span></li>
          </ul>
        </section>

        <section aria-label="Investment and territory overview" className="contact-evaluation-grid mt-6 grid gap-6 lg:grid-cols-2">
          <article className="contact-evaluation-card rounded-3xl border border-brand-charcoal/10 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-clay">Investment snapshot</h2>
            <p className="mt-2 heading-subsection text-brand-charcoal">A practical starting point for evaluation.</p>
            <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-brand-sand py-5 text-center">
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/60">Estimated investment</dt><dd className="mt-1 text-sm font-bold text-brand-charcoal">$425K–$875K</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/60">Liquid capital</dt><dd className="mt-1 text-sm font-bold text-brand-charcoal">$150K+</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/60">Net worth</dt><dd className="mt-1 text-sm font-bold text-brand-charcoal">$400K+</dd></div>
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-brand-charcoal/70">Financing guidance is not currently advertised; questions about capital planning can be raised during the mutual evaluation process.</p>
          </article>

          <article className="contact-evaluation-card rounded-3xl border border-brand-charcoal/10 bg-brand-sand/40 p-6 sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-clay">Territory interest</h2>
            <p className="mt-2 heading-subsection text-brand-charcoal">Tell us where you see the opportunity.</p>
            <p className="mt-4 text-sm leading-relaxed text-brand-charcoal/75">We review target regions against demographic density, traffic patterns, trade-area population, and our current development plan.</p>
            <div className="mt-5 rounded-2xl border border-brand-charcoal/10 bg-white/70 p-4">
              <p className="text-sm font-semibold text-brand-charcoal">An inquiry does not reserve a territory.</p>
              <p className="mt-1 text-sm leading-relaxed text-brand-charcoal/70">Availability is evaluated during qualification; protected territory is only granted after a Franchise Agreement is executed.</p>
            </div>
          </article>
        </section>

        <section aria-labelledby="questions-heading" className="contact-mobile-questions mt-6 rounded-3xl border border-brand-charcoal/10 bg-white p-6 sm:p-8 lg:hidden">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-clay">Questions before you apply?</p>
              <h2 id="questions-heading" className="mt-2 heading-subsection text-brand-charcoal">Choose the path that helps you decide with confidence.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <a href="tel:+18017010617" className="touch-target inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-charcoal px-4 py-3 text-sm font-bold text-white hover:bg-brand-clay focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal focus-visible:ring-offset-2">Book a quick call</a>
              <a href="mailto:buddasbakery@gmail.com" className="touch-target inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-brand-charcoal/30 px-4 py-3 text-sm font-bold text-brand-charcoal hover:border-brand-charcoal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal focus-visible:ring-offset-2">Email development</a>
              <Link href="/franchise/faq" className="touch-target inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-brand-charcoal/30 px-4 py-3 text-sm font-bold text-brand-charcoal hover:border-brand-charcoal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal focus-visible:ring-offset-2">Read franchise FAQ</Link>
            </div>
          </div>
        </section>

        <div className="contact-form-grid mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 phone:gap-8 md:gap-10 lg:gap-10 items-start">
          {/* Form Column */}
          <div id="inquiry-form" className="mt-0 self-start lg:col-span-8 scroll-mt-24">
            <InquiryForm formSession={session} submissionToken={token} attribution={attribution} />
          </div>

          {/* Sidebar / Direct Contact */}
          <aside data-inquiry-sidebar className="mt-0 self-start lg:sticky lg:top-24 lg:col-span-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1 space-y-5 transition-opacity">
            <div className="contact-direct-card bg-brand-sand/60 border border-brand-charcoal/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="heading-compact text-brand-charcoal">Need to talk first?</h2>
              <p className="contact-direct-intro">We&apos;re here to help. Reach out to our franchise development team.</p>
              <InquirySidebarFraming />
              <div className="space-y-4 text-sm text-brand-charcoal">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-clay shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold uppercase text-[11px] text-brand-charcoal block mb-1">
                      Call
                    </span>
                    <a
                      href="tel:+18017010617"
                      className="touch-target-inline text-brand-charcoal font-semibold hover:underline"
                    >
                      (801) 701-0617
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-clay shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold uppercase text-[11px] text-brand-charcoal block mb-1">
                      Email
                    </span>
                    <a
                      href="mailto:buddasbakery@gmail.com"
                      className="touch-target-inline text-brand-charcoal font-semibold hover:underline"
                    >
                      buddasbakery@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3"><Send className="w-5 h-5 text-brand-clay shrink-0 mt-0.5" aria-hidden="true" /><Link href="/franchise/faq" className="touch-target-inline font-semibold hover:underline">Read our FAQ</Link></div>

                <div className="flex items-start gap-3 border-t border-brand-charcoal/10 pt-4 text-xs">
                  <MapPin className="w-4 h-4 text-brand-charcoal/60 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold uppercase text-[10px] text-brand-charcoal block mb-1">
                      Corporate Headquarters
                    </span>
                    <p className="text-brand-charcoal/70">
                      Budda&apos;s Franchising LLC<br />
                      La&apos;ie, Oahu, HI 96762
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-charcoal/10 border-t-4 border-t-brand-clay bg-white/80 p-5 space-y-4 shadow-sm support-copy text-sm text-brand-charcoal/70">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 shrink-0 text-brand-clay" aria-hidden="true" />
                <h2 className="text-sm font-bold text-brand-charcoal">Your information is protected.</h2>
              </div>
              <p>
                Your information is used to evaluate franchise qualification fit and is never sold or shared with third-party marketing brokers.
              </p>
              <div className="flex items-start gap-2 rounded-lg bg-brand-sand/60 p-3 text-brand-charcoal">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-clay" aria-hidden="true" />
                <p className="text-xs font-semibold leading-relaxed">
                  Submitted securely — never shared with third-party marketing brokers.
                </p>
              </div>
              <Link
                href="/privacy"
                className="touch-target-inline inline-flex text-sm font-semibold text-brand-charcoal underline underline-offset-4 hover:text-brand-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-charcoal rounded"
              >
                See our full Privacy Policy for details.
              </Link>
            </div>
          </aside>
        </div>

        <section aria-labelledby="after-submit-heading" className="contact-next-steps mt-10 sm:mt-12 rounded-3xl border border-brand-charcoal/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl">
            <p className="contact-process-kicker">What happens next</p>
            <h2 id="after-submit-heading" className="mt-2 heading-subsection text-brand-charcoal">A clear next step, not a commitment.</h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-charcoal/75">Your inquiry helps both sides determine fit. Here&apos;s what to expect:</p>
          </div>
          <ol className="contact-process-rail mt-7 grid gap-5 md:grid-cols-3" aria-label="Inquiry follow-up path">
            <li className="contact-process-step">
              <CalendarDays className="contact-next-icon" aria-hidden="true" />
              <div>
              <p className="contact-process-kicker">Step 1 · Internal review</p>
              <h3 className="mt-1 text-base font-bold text-brand-charcoal">Internal fit review</h3>
              <p className="mt-1 text-sm leading-relaxed text-brand-charcoal/70">We review your operating background, market interest, and readiness.</p>
              </div>
            </li>
            <li className="contact-process-step" data-conditional="true">
              <Phone className="contact-next-icon" aria-hidden="true" />
              <div>
              <p className="contact-process-kicker">Step 2 · Team outreach</p>
              <h3 className="mt-1 text-base font-bold text-brand-charcoal">If there is potential fit, our team reaches out</h3>
              <p className="mt-1 text-sm leading-relaxed text-brand-charcoal/70">If there is potential fit, our development team reaches out to share next steps and answer initial questions.</p>
              </div>
            </li>
            <li className="contact-process-step" data-conditional="true">
              <UsersRound className="contact-next-icon" aria-hidden="true" />
              <div>
              <p className="contact-process-kicker">Step 3 · Discovery call</p>
              <h3 className="mt-1 text-base font-bold text-brand-charcoal">Discovery call</h3>
              <p className="mt-1 text-sm leading-relaxed text-brand-charcoal/70">Together, we discuss your operating experience, goals, target market, and financial qualifications.</p>
              </div>
            </li>
          </ol>
          <div className="contact-process-return-wrap"><a href="#inquiry-form" className="contact-process-return">Start your inquiry <ArrowRight aria-hidden="true" /></a></div>
        </section>
      </section>
    </div></>
  );
}
