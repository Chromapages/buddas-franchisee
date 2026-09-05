import Link from "next/link";
import Image from "next/image";
import { Heart, Compass, CheckCircle2, ArrowRight } from "lucide-react";
import { FranchisePageHeader } from "@/src/components/public/franchise-page-header";

export default function AboutPage() {
  return (
    <div className="page-rhythm">
      <FranchisePageHeader
        eyebrow={{
          label: "Our Heritage & Culture",
          icon: <Heart className="w-3.5 h-3.5 text-bds-action-primary" aria-hidden="true" />,
        }}
        title="Rooted in La'i. Born from Family Generosity."
        description="Budda's began not in a corporate test kitchen, but with a family recipe for sweet island butter rolls shared at community gatherings on Oahu's Windward Coast."
        contextItems={[
          { label: "Origin", value: "La'i, Oahu" },
          { label: "Tradition", value: "Family generosity" },
          { label: "Focus", value: "Hospitality" },
        ]}
      />

      {/* Origin Story Grid */}
      <section className="content-default">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 phone:gap-8 md:gap-10 lg:gap-12 xl:gap-14 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-brand-sand">
            <Image
              src="/images/buddas-about-storefront.png"
              alt="Budda's Original Storefront and Bakery Gathering"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-butter text-brand-charcoal text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-brand-clay" aria-hidden="true" />
              The Butter Roll Legacy
            </div>
            <h2 className="heading-section text-brand-charcoal">
              From Island Gatherings to a Modern Fast-Casual Brand
            </h2>
            <p className="text-base text-brand-charcoal/80 leading-relaxed prose-measure">
              In Hawai&apos;i, food is more than sustenance—it is how we express love, respect, and hospitality. Our founder perfected a slow-proofed, steam-baked sweet roll brushed with rich honey butter that became an instant neighborhood obsession in La&apos;ie.
            </p>
            <p className="text-base text-brand-charcoal/80 leading-relaxed prose-measure">
              When we paired our signature rolls with savory char-broiled island barbecue—teriyaki chicken, kalbi short ribs, and crispy garlic mochiko chicken—Budda&apos;s evolved into a full-scale Hawaiian Bakery &amp; Grill.
            </p>
          </div>
        </div>
      </section>

      {/* Cultural Guardrails & Growth Doctrine */}
      <section className="bg-brand-sand/60 border-y border-brand-charcoal/10 section-standard">
        <div className="content-default">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-brand-clay text-xs font-bold uppercase tracking-wider shadow-sm">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              Brand Principles
            </div>
            <h2 className="heading-section text-brand-charcoal">
              Our Growth Doctrine &amp; Cultural Guardrails
            </h2>
            <p className="text-base text-brand-charcoal/70 prose-measure mx-auto">
              We protect our brand heritage by holding every franchisee to uncompromising quality and cultural authenticity.
            </p>
          </div>

          <div className="fluid-card-grid">
            <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 shadow-sm space-y-3">
              <h3 className="heading-subsection text-brand-charcoal">
                1. True Aloha, Not Caricature
              </h3>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                We represent Hawai&apos;i through authentic recipes, genuine hospitality, and real community engagement—never kitschy tiki decor, fake tropical clichés, or diluted flavors.
              </p>
            </div>

            <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 shadow-sm space-y-3">
              <h3 className="heading-subsection text-brand-charcoal">
                2. Bakery Disciplines
              </h3>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                The Budda Roll is our sacred product truth. Every operator commits to strict hourly proofing schedules, steam baking standards, and honey-butter brushing tolerances.
              </p>
            </div>

            <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 shadow-sm space-y-3">
              <h3 className="heading-subsection text-brand-charcoal">
                3. Generous Hospitality
              </h3>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                Portions are hearty, service is warm and attentive, and every guest is treated like family at an island backyard lu&apos;au.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="content-default">
        <div className="bg-brand-clay rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="heading-section heading-inverse">
              Align with Our Values &amp; Growth
            </h2>
            <p className="text-brand-cream/90 text-sm sm:text-base max-w-xl prose-measure">
              Discover how our operating systems and support empower operators to build thriving community restaurants.
            </p>
          </div>
          <Link
            href="/franchise/the-opportunity"
            className="btn-secondary !py-3.5 !px-8 text-base font-bold shrink-0 flex items-center gap-2"
          >
            Review the Opportunity
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
