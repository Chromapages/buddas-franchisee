import { ChartNoAxesCombined, UsersRound } from "lucide-react";
import { OperatorProofOpportunityCta } from "@/src/components/public/operator-proof-opportunity-cta";
import { OperatorProofViewTracker } from "@/src/components/public/operator-proof-view-tracker";
import { OPERATOR_PROOF_CONTENT } from "@/src/features/franchise/operator-proof-content";

/** Desktop-only explanation of the model's foundations and outcomes. */
export const OperatorProofDesktop = ({ section = OPERATOR_PROOF_CONTENT.section }: { section?: typeof OPERATOR_PROOF_CONTENT.section }) => {
  const { opportunity, pillars } = OPERATOR_PROOF_CONTENT;
  const foundations = pillars.filter((pillar) => pillar.id !== "growth");
  const growth = pillars.find((pillar) => pillar.id === "growth");
  const outcomes = [
    { id: "consistent-experience", title: "A consistent experience", body: OPERATOR_PROOF_CONTENT.outcomes.result.body, Icon: UsersRound },
    { id: "disciplined-growth", title: "Disciplined growth", body: growth?.body || "Expansion follows readiness.", Icon: ChartNoAxesCombined },
  ];

  return (
    <section id="operator-proof-desktop" aria-labelledby="operator-proof-desktop-heading" className="operator-proof-section operator-proof-desktop hidden overflow-hidden border-b border-bds-teal-dark/10 bg-bds-cream text-bds-teal-dark lg:block">
      <OperatorProofViewTracker targetId="operator-proof-desktop" surface="desktop" />

      <div className="content-wide operator-advantage-layout">
        <header className="operator-advantage-intro">
          <p className="homepage-section-eyebrow">{section.eyebrow}</p>
          <h2 id="operator-proof-desktop-heading">{section.heading}</h2>
          <p>{section.introduction}</p>
        </header>

        <section className="operator-advantage-group" aria-labelledby="operator-advantage-foundations-heading">
          <h3 id="operator-advantage-foundations-heading" className="operator-advantage-group-heading">What the model is built on</h3>
          <ol className="operator-advantage-foundations" aria-label="Four operating foundations">
            {foundations.map((pillar) => <li key={pillar.id}>
              <span aria-hidden="true" className="operator-advantage-number">{pillar.index}</span>
              <h4>{pillar.category === "Operator support system" ? "Operator support" : pillar.category}</h4>
              <p>{pillar.body}</p>
            </li>)}
          </ol>
        </section>

        <div className="operator-advantage-bridge" aria-hidden="true">
          <span>Together, this creates</span>
        </div>

        <section className="operator-advantage-group operator-advantage-outcomes-group" aria-label="Model outcomes">
          <div className="operator-advantage-outcomes">
            {outcomes.map(({ id, title, body, Icon }) => <article key={id}>
              <i aria-hidden="true"><Icon /></i>
              <div><h4>{title}</h4><p>{body}</p></div>
            </article>)}
          </div>
        </section>

        <div className="operator-advantage-cta"><OperatorProofOpportunityCta {...opportunity} /></div>
      </div>
    </section>
  );
};
