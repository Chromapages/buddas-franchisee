import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { WhyBuddasPillars } from "@/src/components/public/why-buddas-pillars";
import { FranchisePageHeader } from "@/src/components/public/franchise-page-header";
import { FranchiseFinalCta } from "@/src/components/public/franchise-final-cta";
import { getPublicWhyBuddasPillarsContent } from "@/src/features/why-buddas/pillars-config";
import { StructuredData } from "@/src/components/public/structured-data";

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
  return (
    <><StructuredData /><div className="page-rhythm">
      <FranchisePageHeader
        eyebrow={{
          label: "The Budda's Model",
        }}
        title="A bakery-and-grill format, explained."
        description="Explore the product, daypart format, production approach, and hospitality standards behind Budda's."
        qualifier="Built for experienced restaurant operators."
        sectionClassName="border-b border-bds-teal-dark/10 bg-bds-cream/60 py-7 sm:py-8 lg:py-9"
        containerClassName="content-wide"
        contentClassName="max-w-3xl space-y-2.5"
        titleClassName="heading-page max-w-[24ch] text-[clamp(2rem,2.4vw,2.75rem)] leading-[1.02]"
        descriptionClassName="prose-measure text-base leading-relaxed text-bds-text-body sm:text-lg"
        qualifierClassName="text-sm font-semibold text-bds-text-heading"
        actions={[
          {
            href: "#four-pillars",
            label: "See the Model",
            icon: <ArrowDown className="h-4 w-4" aria-hidden="true" />,
            className: "btn-outline w-fit min-h-[44px] gap-2 !px-4 !py-2.5 text-sm",
          },
        ]}
        actionsClassName="flex flex-wrap pt-1"
        aside={
          <figure className="relative aspect-[16/10] overflow-hidden rounded-xl border border-bds-teal-dark/10 bg-bds-cream shadow-sm">
            <Image
              src="/images/food-experience-editorial.png"
              alt="Fresh Budda Rolls beside a grilled chicken plate at a Budda's counter"
              fill
              priority
              sizes="(max-width: 1023px) calc(100vw - 2rem), 34vw"
              className="object-cover"
            />
            <figcaption className="absolute bottom-3 left-3 rounded-sm bg-bds-teal-dark px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-bds-text-inverse">
              Bakery + grill
            </figcaption>
          </figure>
        }
        layoutClassName="lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.65fr)]"
      />

      {/* Main Interactive Four Pillars Showcase */}
      <section id="four-pillars" className="content-wide !mt-8 lg:!mt-12">
        <WhyBuddasPillars {...pillarsContent} />
      </section>

      <Suspense fallback={null}>
        <FranchiseFinalCta />
      </Suspense>
    </div></>
  );
}
