import Link from "next/link";
import { CheckCircle2, ArrowRight, FileCheck, Users, MapPin, Sparkles } from "lucide-react";

export default function ProcessPage() {
  const stages = [
    {
      number: "01",
      title: "Initial Inquiry & Fit Evaluation",
      owner: "Franchise Development Team",
      input: "Online Inquiry Submission & Background Overview",
      outcome: "Initial Qualification Screening",
      description:
        "Submit your contact details, operational background, and target market interest. Our team reviews your profile against our current development territory plan within 2 business days.",
      icon: Users,
    },
    {
      number: "02",
      title: "Discovery Call & Capital Verification",
      owner: "VP of Franchise Development",
      input: "Confidential Franchise Application & Financial Verification",
      outcome: "Mutual Mutual Fit Determination",
      description:
        "A structured 45-minute conversation to explore your restaurant background, business goals, and review preliminary territory availability and financial thresholds.",
      icon: CheckCircle2,
    },
    {
      number: "03",
      title: "FDD Disclosure & Legal Review",
      owner: "Franchise Compliance & Legal Counsel",
      input: "Executed Item 23 Receipt (Mandatory 14-Day Review)",
      outcome: "Completed Due Diligence & Validation Calls",
      description:
        "Receive the active Budda's Franchise Disclosure Document (FDD). You will sign the electronic Item 23 Receipt and enter the mandatory 14-day diligence hold period to review unit economics and speak with operating affiliates.",
      icon: FileCheck,
    },
    {
      number: "04",
      title: "Discovery Day & Territory Award",
      owner: "Executive Leadership & Founders",
      input: "In-Person Visit to La'ie Flagship & Kitchen Tasting",
      outcome: "Franchise Agreement Execution & Territory Award",
      description:
        "Visit our flagship bakery and kitchen in La'ie, Hawai'i. Meet the executive team, taste the full menu fresh from the steam ovens, and finalize territory agreements upon mutual approval.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-sand/40 border-b border-brand-charcoal/10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-clay">
              The Path to Ownership
            </span>
            <h1 className="text-4xl sm:text-5xl font-black font-heading text-brand-charcoal tracking-tight">
              A Transparent, 4-Stage Mutual Evaluation Process.
            </h1>
            <p className="text-lg sm:text-xl text-brand-charcoal/80 leading-relaxed">
              Awarding a franchise is a long-term partnership. Our structured process gives both parties the diligence, clarity, and time needed to ensure mutual success.
            </p>
          </div>
        </div>
      </section>

      {/* 4 Stages Sequence */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.number}
                className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row items-start gap-8 hover:border-brand-mango transition-all"
              >
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-4xl sm:text-5xl font-black font-heading text-brand-clay/30">
                    {stage.number}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-brand-sand flex items-center justify-center text-brand-clay">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-2xl font-bold font-heading text-brand-charcoal">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-brand-charcoal/70 mt-1 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-brand-sand text-xs">
                    <div>
                      <span className="font-bold uppercase tracking-wider text-brand-clay block">
                        Stage Owner
                      </span>
                      <span className="text-brand-charcoal font-semibold mt-0.5 block">
                        {stage.owner}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-wider text-brand-clay block">
                        Key Input
                      </span>
                      <span className="text-brand-charcoal font-semibold mt-0.5 block">
                        {stage.input}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-wider text-brand-clay block">
                        Target Outcome
                      </span>
                      <span className="text-brand-charcoal font-semibold mt-0.5 block">
                        {stage.outcome}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-charcoal rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black font-heading">
              Ready to Initiate Stage 01?
            </h3>
            <p className="text-brand-cream/80 text-sm sm:text-base max-w-xl">
              Complete the franchise inquiry form to begin our mutual evaluation process.
            </p>
          </div>
          <Link
            href="/franchise/contact"
            className="btn-primary !py-3.5 !px-8 text-base font-bold shrink-0 flex items-center gap-2"
          >
            Start Your Inquiry
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
