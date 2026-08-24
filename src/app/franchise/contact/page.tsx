import { issueInquiryFormSession } from "@/src/features/inquiry/form-token";
import { InquiryForm } from "@/src/components/public/inquiry-form";
import { Send, Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const { session, token } = issueInquiryFormSession();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-sand/40 border-b border-brand-charcoal/10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-butter text-brand-charcoal text-xs font-bold uppercase tracking-wider">
              <Send className="w-3.5 h-3.5 text-brand-clay" aria-hidden="true" />
              Stage 01: Initial Inquiry
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-heading text-brand-charcoal tracking-tight">
              Request Franchise Information.
            </h1>
            <p className="text-lg sm:text-xl text-brand-charcoal/80 leading-relaxed">
              Tell us about your operating background, market goals, and capital readiness to begin our mutual evaluation process.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Form + Direct Contact Information */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Column */}
          <div className="lg:col-span-8">
            <InquiryForm formSession={session} submissionToken={token} />
          </div>

          {/* Sidebar / Direct Contact */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-brand-sand/60 border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold font-heading text-brand-charcoal">
                Direct Franchise Contact
              </h3>
              <div className="space-y-4 text-sm text-brand-charcoal">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-clay shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold uppercase text-[11px] text-brand-clay block">
                      Email Inquiries
                    </span>
                    <a
                      href="mailto:buddasbakery@gmail.com"
                      className="text-brand-charcoal font-semibold hover:underline"
                    >
                      buddasbakery@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-clay shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold uppercase text-[11px] text-brand-clay block">
                      Development Line
                    </span>
                    <a
                      href="tel:+18017010617"
                      className="text-brand-charcoal font-semibold hover:underline"
                    >
                      (801) 701-0617
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-clay shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold uppercase text-[11px] text-brand-clay block">
                      Corporate Headquarters
                    </span>
                    <p className="text-brand-charcoal/80">
                      Budda&apos;s Franchising LLC<br />
                      La&apos;ie, Oahu, HI 96762
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 space-y-3 shadow-sm text-xs text-brand-charcoal/70 leading-relaxed">
              <h4 className="font-bold text-brand-charcoal text-sm font-heading">
                Confidentiality &amp; Privacy Notice
              </h4>
              <p>
                Your contact details and financial readiness data are strictly used to assess franchise qualification fit and are never sold or distributed to third-party marketing brokers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
