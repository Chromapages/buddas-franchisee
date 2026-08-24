import Link from "next/link";
import {
  CheckCircle2,
  DollarSign,
  Award,
  Users,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { isActiveOfferingEnabled } from "@/src/lib/flags";
import { FinancialDisclosure } from "@/src/components/public/financial-disclosure";
import { Item19FprTable } from "@/src/components/public/item19-fpr-table";
import { TerritoryChecker } from "@/src/components/public/territory-checker";

export default function TheOpportunityPage() {
  const activeOffering = isActiveOfferingEnabled();

  const supportPillars = [
    {
      title: "1. Real Estate & Site Selection",
      description:
        "Demographic scoring, drive-thru optimization, footprint sizing (1,800–2,600 sq ft), lease negotiation advisory, and architectural space planning.",
      icon: Building,
    },
    {
      title: "2. Comprehensive Training Academy",
      description:
        "3-week intensive immersion in La'ie covering dough proofing, steam baking, line speed, inventory controls, and Hawaiian hospitality standards.",
      icon: GraduationCap,
    },
    {
      title: "3. Proprietary Supply Chain",
      description:
        "Direct access to master-batch frozen dough bases, compound whipped honey butters, signature teriyaki glazes, and custom branded packaging.",
      icon: ShieldCheck,
    },
    {
      title: "4. Grand Opening & Local Marketing",
      description:
        "Targeted digital campaigns, VIP roll tasting events, local PR orchestration, and ongoing local store marketing (LSM) toolkits.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-sand/40 border-b border-brand-charcoal/10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-butter text-brand-charcoal text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-brand-clay" aria-hidden="true" />
              Franchise Opportunity &amp; Investment
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-heading text-brand-charcoal tracking-tight">
              Invest in a Category-Defining Hawaiian Bakery &amp; Grill.
            </h1>
            <p className="text-lg sm:text-xl text-brand-charcoal/80 leading-relaxed">
              Review our candidate criteria, operating support structure, territory availability, and active investment requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Financials & Item 7 Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-clay">
            Investment Parameters
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-brand-charcoal">
            Capital Readiness &amp; Estimated Investment
          </h2>
          <p className="text-base text-brand-charcoal/70 max-w-2xl leading-relaxed">
            Transparent initial capital estimates to develop and launch an authentic Budda&apos;s restaurant.
          </p>
        </div>

        <FinancialDisclosure isActiveOffering={activeOffering} />
      </section>

      {/* Item 19 FPR Section (Gated in Release 2) */}
      {activeOffering ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Item19FprTable />
        </section>
      ) : null}

      {/* Territory & Market Clearance Checker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="territory">
        <div className="space-y-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-clay">
            Expansion Markets
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-brand-charcoal">
            Approved Territories &amp; State Regulatory Status
          </h2>
          <p className="text-base text-brand-charcoal/70 max-w-2xl leading-relaxed">
            Budda&apos;s complies strictly with federal and state franchise registration requirements. Check your territory clearance below.
          </p>
        </div>

        <TerritoryChecker />
      </section>

      {/* Qualifications Framework */}
      <section className="bg-brand-sand/60 border-y border-brand-charcoal/10 py-16" id="qualifications">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-clay">
              Ideal Candidate Profile
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-brand-charcoal">
              What Budda&apos;s Evaluates in Prospective Operators
            </h2>
            <p className="text-base text-brand-charcoal/70">
              We look for partners who combine operational discipline with a heart for hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
                <Award className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold font-heading text-brand-charcoal">
                Operating Experience
              </h3>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                Minimum 3+ years of restaurant management, multi-unit leadership, or food-service franchise ownership with a proven record of team development.
              </p>
            </div>

            <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-butter flex items-center justify-center text-brand-charcoal">
                <DollarSign className="w-5 h-5 text-brand-clay" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold font-heading text-brand-charcoal">
                Financial Qualifications
              </h3>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                Minimum of $150,000 in liquid capital and $400,000 net worth per unit commitment to ensure adequate capitalization during buildout and ramp.
              </p>
            </div>

            <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
                <Users className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold font-heading text-brand-charcoal">
                Cultural Alignment
              </h3>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                A passion for genuine island hospitality, active community stewardship, and an unwavering commitment to bakery recipe standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-clay">
            Turnkey Systems
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-brand-charcoal">
            Comprehensive Operator Support Architecture
          </h2>
          <p className="text-base text-brand-charcoal/70">
            From initial site scoring to daily kitchen execution, our corporate infrastructure supports your growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {supportPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 shadow-sm flex items-start gap-5 hover:border-brand-mango transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-sand flex items-center justify-center text-brand-clay shrink-0 mt-1">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-heading text-brand-charcoal">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-charcoal rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-white max-w-2xl mx-auto">
            Ready to Evaluate Mutual Fit?
          </h2>
          <p className="text-base text-brand-cream/80 max-w-xl mx-auto">
            Submit your franchise inquiry to connect with our development leadership and review the next steps.
          </p>
          <div className="pt-2">
            <Link href="/franchise/contact" className="btn-primary text-base font-bold">
              Start a Franchise Inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
