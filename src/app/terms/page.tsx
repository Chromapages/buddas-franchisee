import { Navbar } from "@/src/components/public/navbar";
import { Footer } from "@/src/components/public/footer";

export const metadata = {
  title: "Terms of Use — Budda's Franchise Hub",
  description: "Terms of use and non-offer legal disclaimer for Budda's Franchise website.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="content-narrow section-standard flex-1 focus:outline-none">
        <div className="surface-legal space-y-8 bg-white border border-brand-charcoal/10 rounded-3xl shadow-sm">
          <div className="space-y-3 border-b border-brand-sand pb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-clay">
              Legal Agreement
            </span>
            <h1 className="heading-page text-brand-charcoal">
              Terms of Use
            </h1>
            <p className="support-copy text-brand-charcoal/60">
              Effective Date: August 21, 2026 &bull; Version 1.0
            </p>
          </div>

          <div className="space-y-6 text-sm lg:text-base text-brand-charcoal/80 leading-relaxed">
            <section className="space-y-3">
              <h2 className="heading-compact text-brand-charcoal">
                1. Informational Purpose (Non-Offer Disclosure)
              </h2>
              <p>
                The information provided on this website is for general informational purposes only and does not constitute an offer to sell, or the solicitation of an offer to buy, a franchise. An offer of a franchise is made only through the delivery of a Franchise Disclosure Document (FDD) registered or exempt in applicable jurisdictions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="heading-compact text-brand-charcoal">
                2. Intellectual Property
              </h2>
              <p>
                All trademarks, logos, service marks, trade names, and designs related to &quot;Budda&apos;s&quot; and &quot;Budda Roll&quot; are the exclusive proprietary property of Budda&apos;s Franchising LLC. Unauthorized use or reproduction is strictly prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="heading-compact text-brand-charcoal">
                3. Governing Law
              </h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the State of Hawai&apos;i without regard to conflict of law principles.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
