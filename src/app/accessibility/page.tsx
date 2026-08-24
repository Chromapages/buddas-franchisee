import { Navbar } from "@/src/components/public/navbar";
import { Footer } from "@/src/components/public/footer";

export const metadata = {
  title: "Accessibility Statement — Budda's Franchise Hub",
  description: "Budda's commitment to web accessibility and WCAG 2.2 AA compliance.",
};

export default function AccessibilityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 focus:outline-none">
        <div className="space-y-8 bg-white border border-brand-charcoal/10 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="space-y-2 border-b border-brand-sand pb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-clay">
              Accessibility Commitment
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-brand-charcoal">
              Accessibility Statement
            </h1>
            <p className="text-xs text-brand-charcoal/60">
              Conforming Standard: WCAG 2.2 Level AA &bull; August 2026
            </p>
          </div>

          <div className="space-y-6 text-sm text-brand-charcoal/80 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold font-heading text-brand-charcoal">
                1. Our Commitment
              </h2>
              <p>
                Budda&apos;s Franchising LLC is dedicated to ensuring that digital content on this platform is accessible to all individuals, including people with visual, motor, auditory, or cognitive disabilities.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold font-heading text-brand-charcoal">
                2. Technical Measures &amp; Standards
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>WCAG 2.2 Level AA color contrast ratios across all brand tokens.</li>
                <li>Full keyboard navigation capability with visible, non-obscured focus indicators.</li>
                <li>Semantic HTML heading hierarchies and explicit ARIA labels.</li>
                <li>Responsive layout reflow down to 320 CSS pixels and 200% text zoom support.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold font-heading text-brand-charcoal">
                3. Feedback &amp; Assistance
              </h2>
              <p>
                If you encounter any difficulty accessing any aspect of our site, please contact our accessibility coordinator at (801) 701-0617 or email buddasbakery@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
