import { ChartNoAxesCombined, Settings, Sun, UsersRound, Wheat, type LucideIcon } from "lucide-react";
import styles from "./why-buddas-pillars.module.css";
import type { PublicPillar, PublicPillarSection } from "@/src/features/why-buddas/pillars-config";

type WhyBuddasPillarsDesktopProps = { pillars: readonly PublicPillar[]; section: PublicPillarSection };

const pillarIcons: Record<PublicPillar["id"], LucideIcon> = {
  "bakery-product": Wheat,
  "daypart-format": Sun,
  "production-approach": Settings,
  "hospitality-standard": UsersRound,
};

const pillarPositions = [styles.modelPillarOne, styles.modelPillarTwo, styles.modelPillarThree, styles.modelPillarFour] as const;

/** Desktop model overview keeps all four responsibilities visible at once. */
export const WhyBuddasPillarsDesktop = ({ pillars, section }: WhyBuddasPillarsDesktopProps) => (
  <div className={styles.root}>
    <header className={styles.modelIntro}>
      <p className="heading-panel">{section.eyebrow.text}</p>
      <h2 className="heading-section text-bds-text-heading">{section.publicHeading.text}</h2>
      <p>{section.orientationCopy.text}</p>
    </header>

    <section className={styles.modelDiagram} aria-label="The four connected parts of the Budda's model">
      <ol className={styles.modelPillars}>
        {pillars.map((pillar, index) => {
          const Icon = pillarIcons[pillar.id];
          return <li key={pillar.id} id={pillar.id} className={`${styles.modelPillar} ${pillarPositions[index] || ""}`}>
            <div className={styles.modelPillarCopy}>
              <span aria-hidden="true">{pillar.number}</span>
              <h3>{pillar.shortLabel.text}</h3>
              <p>{pillar.operatingThesis.text}</p>
            </div>
            <div className={styles.modelPillarIcon} aria-hidden="true"><Icon /></div>
            <span className={styles.modelConnector} aria-hidden="true" />
          </li>;
        })}
      </ol>

      <div className={styles.modelCenter} aria-label="The Budda's model connects product, daypart, production, and hospitality">
        <span aria-hidden="true" />
        <strong>The<br />Budda&apos;s<br />Model</strong>
        <span aria-hidden="true" />
        <p>Product · Daypart<br />Production · Hospitality</p>
      </div>
    </section>

    <div className={styles.modelOutcomeWrap}>
      <section className={styles.modelOutcome} aria-labelledby="model-outcome-heading">
        <div className={styles.modelOutcomeIcon} aria-hidden="true"><ChartNoAxesCombined /></div>
        <div>
          <h3 id="model-outcome-heading">One operating model. Four connected responsibilities.</h3>
          <p>When product, dayparts, production, and hospitality work together, they support a consistent experience and a stronger foundation for daily restaurant execution.</p>
        </div>
      </section>
    </div>
  </div>
);
