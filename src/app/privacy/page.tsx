import { Navbar } from "@/src/components/public/navbar";
import { Footer } from "@/src/components/public/footer";

export const metadata = {
  title: "Privacy Policy — Budda's Franchise Hub",
  description: "Budda's Franchise privacy policy and candidate data handling practices.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 focus:outline-none">
        <div className="space-y-8 bg-white border border-brand-charcoal/10 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="space-y-2 border-b border-brand-sand pb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-clay">
              Legal Notice
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-brand-charcoal">
              Privacy Policy
            </h1>
            <p className="text-xs text-brand-charcoal/60">
              Effective Date: August 21, 2026 &bull; Version 1.0
            </p>
          </div>

          <div className="space-y-6 text-sm text-brand-charcoal/80 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold font-heading text-brand-charcoal">
                1. Information We Collect
              </h2>
              <p>
                When you submit a franchise inquiry through our platform, we collect your name, email address, phone number, geographic location, restaurant operating experience, estimated available capital, and preferred timeline.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold font-heading text-brand-charcoal">
                2. How We Use Your Data
              </h2>
              <p>
                Your information is used strictly to evaluate your qualifications as a prospective franchise partner, coordinate discovery discussions, and provide required regulatory disclosure documents. We do not sell or rent candidate information to third-party brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold font-heading text-brand-charcoal">
                3. Security &amp; Retention
              </h2>
              <p>
                All data in transit is encrypted using Transport Layer Security (TLS). Candidate records are stored securely in compliance with applicable data protection laws.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold font-heading text-brand-charcoal">
                4. Contact Us
              </h2>
              <p>
                For privacy inquiries or data deletion requests, contact our compliance team at buddasbakery@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
