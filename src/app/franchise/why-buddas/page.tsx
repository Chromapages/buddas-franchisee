import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { WhyBuddasPillars } from "@/src/components/public/why-buddas-pillars";

export default function WhyBuddasPage() {
  const verifiedLocations = [
    {
      name: "La'ie Origin Restaurant & Bakery",
      address: "55-510 Kamehameha Hwy, La'ie, HI 96762",
      role: "Flagship Founding Restaurant",
    },
    {
      name: "Kaka'ako Urban Kitchen",
      address: "660 Ala Moana Blvd, Honolulu, HI 96813",
      role: "High-Volume Metro Concept",
    },
    {
      name: "Sugar House Bakery & Grill",
      address: "2120 S 700 E, Salt Lake City, UT 84106",
      role: "Mainland Multi-Unit Prototype",
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="bg-bds-cream/60 border-b border-bds-teal-dark/10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-bds-action-primary">
              The Concept &amp; Differentiation
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-bds-text-heading tracking-tight">
              Why Budda&apos;s: The Power of Bakery + Grill All-Day Utility.
            </h1>
            <p className="text-lg sm:text-xl text-bds-text-body/80 leading-relaxed">
              Most fast-casual concepts rely strictly on a 2-hour lunch rush. Budda&apos;s unlocks three distinct high-margin dayparts powered by our proprietary bakery engine and iconic butter roll.
            </p>
          </div>
        </div>
      </section>

      {/* Main Interactive Four Pillars Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WhyBuddasPillars />
      </section>

      {/* Verified Restaurant Proof */}
      <section className="bg-bds-cream/50 border-y border-bds-teal-dark/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-bds-action-primary">
              Verified Operating Proof
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-bds-text-heading">
              Operating Track Record Across Island and Mainland Markets
            </h2>
            <p className="text-base text-bds-text-body/80 leading-relaxed">
              Budda&apos;s has demonstrated strong unit economics and customer enthusiasm in both high-cost island markets and suburban mainland centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verifiedLocations.map((loc) => (
              <div
                key={loc.name}
                className="bg-white border border-bds-teal-dark/10 rounded-3xl p-6 shadow-sm space-y-3"
              >
                <div className="w-8 h-8 rounded-xl bg-bds-cream flex items-center justify-center text-bds-action-primary">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-bds-action-primary">
                    {loc.role}
                  </span>
                  <h3 className="text-lg font-bold font-heading text-bds-text-heading mt-1">
                    {loc.name}
                  </h3>
                </div>
                <p className="text-xs text-bds-text-body/70">{loc.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Contrast Conversion CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-bds-action-primary rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black font-heading text-white">
              Ready to Explore Investment &amp; Support?
            </h3>
            <p className="text-bds-cream/80 text-sm sm:text-base max-w-xl">
              See what Budda&apos;s looks for in prospective operating partners and review our training architecture.
            </p>
          </div>
          <Link
            href="/franchise/the-opportunity"
            className="btn-secondary !py-3.5 !px-8 text-base font-bold shrink-0 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-bds-gold focus-visible:ring-offset-2"
          >
            Review the Opportunity
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
