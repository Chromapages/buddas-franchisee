import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import { WhyBuddasPillars } from "@/src/components/public/why-buddas-pillars";
import { FranchisePageHeader } from "@/src/components/public/franchise-page-header";
import { FranchiseFinalCta } from "@/src/components/public/franchise-final-cta";
import { getPublicWhyBuddasPillarsContent } from "@/src/features/why-buddas/pillars-config";

export const metadata: Metadata = {
  title: "Why Budda's | Hawaiian Bakery & Grill Franchise Concept",
  description:
    "Review the Budda Roll, bakery-and-grill format, daypart service, production approach, and hospitality standards behind the Budda's franchise concept.",
  alternates: {
    canonical: "/franchise/why-buddas",
  },
  openGraph: {
    title: "Why Budda's | Hawaiian Bakery & Grill Franchise Concept",
    description:
      "Review the Budda Roll, bakery-and-grill format, daypart service, production approach, and hospitality standards behind the Budda's franchise concept.",
    url: "/franchise/why-buddas",
  },
};

export default function WhyBuddasPage() {
  const pillarsContent = getPublicWhyBuddasPillarsContent();
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
    <div className="page-rhythm">
      <FranchisePageHeader
        eyebrow={{
          label: "The Concept",
        }}
        title="Bakery + Grill Utility for Every Daypart."
        description="See how product, systems, and hospitality work together across the day."
        contextItems={[
          { label: "Product", value: "Budda Roll" },
          { label: "System", value: "Bakery + Grill" },
          { label: "Experience", value: "All-day utility" },
        ]}
        actions={[
          {
            href: "#four-pillars",
            label: "Explore the Four Pillars",
            icon: <ArrowRight className="w-4 h-4" aria-hidden="true" />,
          },
        ]}
      />

      {/* Main Interactive Four Pillars Showcase */}
      <section id="four-pillars" className="content-default">
        <WhyBuddasPillars {...pillarsContent} />
      </section>

      {/* Verified Restaurant Proof */}
      <section className="bg-bds-cream/50 border-y border-bds-teal-dark/10 section-standard">
        <div className="content-default">
          <div className="max-w-2xl space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-bds-action-primary">
              Verified Operating Proof
            </span>
            <h2 className="heading-section text-bds-text-heading">
              Operating Track Record Across Island and Mainland Markets
            </h2>
            <p className="text-base text-bds-text-body/80 leading-relaxed prose-measure">
              Budda&apos;s has demonstrated strong unit economics and customer enthusiasm in both high-cost island markets and suburban mainland centers.
            </p>
          </div>

          <div className="fluid-card-grid">
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
                  <h3 className="heading-minor text-bds-text-heading mt-1">
                    {loc.name}
                  </h3>
                </div>
                <p className="text-xs text-bds-text-body/70">{loc.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FranchiseFinalCta />
    </div>
  );
}
