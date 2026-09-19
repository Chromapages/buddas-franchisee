import { PillarProof } from "./why-buddas-pillar-proof";
import styles from "./why-buddas-pillars.module.css";
import type { PublicPillar, PublicPillarSection } from "@/src/features/why-buddas/pillars-config";

type WhyBuddasPillarsMobileProps = { pillars: readonly PublicPillar[]; section: PublicPillarSection };

/** A no-JavaScript reading flow for narrow layouts and enlarged text. */
export const WhyBuddasPillarsMobile = ({ pillars, section }: WhyBuddasPillarsMobileProps) => (
  <div className={styles.root}>
    <div className={styles.mobileIntro}>
      <p className="heading-panel">{section.eyebrow.text}</p>
      <h2 className="heading-section text-bds-text-heading">{section.publicHeading.text}</h2>
      <p>{section.orientationCopy.text}</p>
    </div>
    <ol className={styles.mobileList}>
      {pillars.map((pillar) => (
        <li key={pillar.id} className={styles.mobileItem}>
          <section id={pillar.id} aria-labelledby={`${pillar.id}-heading`}>
            <p className={styles.mobileNumber} aria-hidden="true">{pillar.number}</p>
            <PillarProof pillar={pillar} headingId={`${pillar.id}-heading`} showKicker={false} />
          </section>
        </li>
      ))}
    </ol>
  </div>
);
