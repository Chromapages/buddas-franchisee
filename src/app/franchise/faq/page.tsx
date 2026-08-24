import { AccordionItem } from "@/src/components/ui/accordion";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function FaqPage() {
  const faqs = [
    {
      id: "faq-1",
      category: "Concept & Operations",
      title: "What makes Budda's different from other Hawaiian fast-casual brands?",
      answer:
        "Budda's is anchored by an authentic in-house steam deck bakery producing our proprietary sweet Budda Roll. Unlike standard plate lunch concepts that rely strictly on a lunch rush, our bakery unlocks three high-margin dayparts: morning breakfast roll sandwiches, high-speed lunch plate combos, and dinner family feast takeout packages with multi-pack roll boxes.",
    },
    {
      id: "faq-2",
      category: "Investment & Capital",
      title: "What are the financial qualifications required to open a Budda's franchise?",
      answer:
        "Prospective operating partners must possess a minimum of $150,000 in verifiable liquid capital and a minimum net worth of $400,000 per unit commitment. The initial franchise fee is $35,000, with an estimated initial investment range of $425,000 to $875,000 depending on location size, building condition, and market real estate costs.",
    },
    {
      id: "faq-3",
      category: "Territory & Markets",
      title: "How does Budda's determine and award market territories?",
      answer:
        "Budda's grants protected geographic territories based on demographic density, traffic patterns, and trade area population. Territory availability is evaluated during preliminary qualification screening. An initial inquiry does not hold or reserve a territory until a Franchise Agreement is executed.",
    },
    {
      id: "faq-4",
      category: "Supply & Ingredients",
      title: "Do I have to bake the rolls from scratch at every restaurant?",
      answer:
        "No. Budda's supplies proprietary pre-portioned frozen dough bases formulated by our founding master bakers. In-store staff simply follow our standardized proofing and steam baking protocols, eliminating the need for master baker labor while ensuring 100% recipe consistency across every location.",
    },
    {
      id: "faq-5",
      category: "Training & Support",
      title: "What initial and ongoing training does Budda's provide?",
      answer:
        "All new franchisees complete our 3-week intensive training academy covering baking science, grill line execution, POS and inventory management, labor scheduling, and island hospitality standards. We also provide on-site opening support teams for 7 days during your grand opening week.",
    },
    {
      id: "faq-6",
      category: "Process & Diligence",
      title: "What is the timeline from initial inquiry to restaurant opening?",
      answer:
        "The mutual evaluation and qualification process typically takes 30 to 60 days. Following franchise agreement execution, site selection, architectural permitting, buildout, and opening preparation generally takes 6 to 9 months depending on municipal permitting timelines.",
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-sand/40 border-b border-brand-charcoal/10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-butter text-brand-charcoal text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-brand-clay" aria-hidden="true" />
              Frequently Asked Questions
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-heading text-brand-charcoal tracking-tight">
              Everything You Need to Know About Franchising with Budda&apos;s.
            </h1>
            <p className="text-lg sm:text-xl text-brand-charcoal/80 leading-relaxed">
              Find answers to common questions about our concept, investment requirements, territory availability, and operational support.
            </p>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Grid */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            id={faq.id}
            title={faq.title}
            category={faq.category}
          >
            <p>{faq.answer}</p>
          </AccordionItem>
        ))}
      </section>

      {/* Bottom CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-charcoal rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black font-heading">
              Have a Specific Question for Our Team?
            </h3>
            <p className="text-brand-cream/80 text-sm sm:text-base max-w-xl">
              Our franchise development team is available to discuss your market and qualifications.
            </p>
          </div>
          <Link
            href="/franchise/contact"
            className="btn-primary !py-3.5 !px-8 text-base font-bold shrink-0 flex items-center gap-2"
          >
            Contact Franchise Team
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
