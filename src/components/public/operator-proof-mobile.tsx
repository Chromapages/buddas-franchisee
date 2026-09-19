import { OperatorProofMobileStack } from "@/src/components/public/operator-proof-mobile-stack";
import { OperatorProofOpportunityCta } from "@/src/components/public/operator-proof-opportunity-cta";
import { OperatorProofViewTracker } from "@/src/components/public/operator-proof-view-tracker";
import { OPERATOR_PROOF_CONTENT } from "@/src/features/franchise/operator-proof-content";

/** Mobile-only proof ledger with its own layout and conversion treatment. */
export const OperatorProofMobile = ({ section = OPERATOR_PROOF_CONTENT.section }: { section?: typeof OPERATOR_PROOF_CONTENT.section }) => {
  const { pillars, opportunity } = OPERATOR_PROOF_CONTENT;

  return (
    <section id="operator-proof-mobile" aria-labelledby="operator-proof-mobile-heading" className="operator-proof-section operator-proof-mobile section-standard overflow-hidden border-b border-bds-teal-dark/10 bg-white text-bds-teal-dark lg:hidden">
      <OperatorProofViewTracker targetId="operator-proof-mobile" surface="mobile" />
      <div className="content-wide operator-proof-mobile-content">
        <header className="max-w-3xl text-left">
          <p className="homepage-mobile-section-eyebrow">{section.eyebrow}</p>
          <h2 id="operator-proof-mobile-heading" className="operator-proof-mobile-heading homepage-mobile-section-heading">
            {section.heading}
          </h2>
          <p className="operator-proof-mobile-subhead homepage-mobile-section-description prose-measure">
            {section.introduction}
          </p>
        </header>

        <div className="operator-proof-stack-layout">
          <OperatorProofMobileStack pillars={pillars} />
        </div>

        <div className="operator-proof-mobile-cta">
          <OperatorProofOpportunityCta {...opportunity} />
        </div>
      </div>
    </section>
  );
};
