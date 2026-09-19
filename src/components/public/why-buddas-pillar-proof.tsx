import Image from "next/image";
import type { PublicPillar } from "@/src/features/why-buddas/pillars-config";
import { trackFunnelEvent } from "@/src/lib/analytics";
import styles from "./why-buddas-pillars.module.css";

type PillarProofProps = {
  pillar: PublicPillar;
  headingId: string;
  showKicker?: boolean;
};

export const PillarProof = ({ pillar, headingId, showKicker = true }: PillarProofProps) => {
  const Heading = "h3";
  const quantitativeEvidence = pillar.evidenceItems.filter((item) => item.kind === "QUANTITATIVE");
  const qualitativeEvidence = pillar.evidenceItems.filter((item) => item.kind !== "QUANTITATIVE");
  const hasApprovedEvidence = pillar.verifiedExplanatoryCopy !== null || pillar.evidenceItems.length > 0;

  return (
    <div className={`${styles.proof} ${pillar.image ? styles.proofWithVisual : styles.proofWithoutVisual}`}>
      <div className={styles.proofCopy}>
        {showKicker ? <p className={styles.kicker}>Pillar {pillar.number} / {pillar.shortLabel.text}</p> : null}
        <Heading id={headingId} className={styles.proofTitle}>{pillar.publicTitle.text}</Heading>
        <p className={styles.operatingThesis}>{pillar.operatingThesis.text}</p>

        {hasApprovedEvidence ? (
          <div className={styles.evidence}>
            <p className="heading-panel">{pillar.evidenceHeading.label}</p>
            {pillar.verifiedExplanatoryCopy ? <p className={styles.evidenceSummary}>{pillar.verifiedExplanatoryCopy.text}</p> : null}
            {quantitativeEvidence.length ? (
              <dl className={styles.quantitativeEvidence}>
                {quantitativeEvidence.map((item) => (
                  <div key={item.id} className={styles.quantitativeItem}>
                    <dt>{item.label}</dt><dd>{item.value}</dd><p>{item.explanation}</p>
                  </div>
                ))}
              </dl>
            ) : null}
            {qualitativeEvidence.length ? (
              <ul className={styles.qualitativeEvidence}>
                {qualitativeEvidence.map((item) => (
                  <li key={item.id}><p>{item.label}</p><p>{item.explanation}</p></li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {pillar.contextualLink ? (
          <a href={pillar.contextualLink.href} onClick={() => trackFunnelEvent("why_buddas_pillar_resource_open", {
            page_path: "/franchise/why-buddas",
            why_buddas_pillar_id: pillar.id,
            why_buddas_destination_id: pillar.contextualLink?.destinationId,
          })} className={styles.resource}>
            {pillar.contextualLink.label}<span aria-hidden="true">→</span>
          </a>
        ) : null}

        {pillar.quote ? (
          <blockquote className={styles.quote}>
            <p>&ldquo;{pillar.quote.text}&rdquo;</p>
            <footer>{pillar.quote.speakerName} · {pillar.quote.speakerRole}</footer>
          </blockquote>
        ) : null}
      </div>

      <div className={styles.proofSidebar}>
        <div className={styles.lens}>
          <p className="heading-panel">{pillar.operatorLens.label}</p>
          <p>{pillar.operatorLens.text}</p>
        </div>
        {pillar.image ? (
          <figure className={styles.visual}>
            <div><Image src={pillar.image.src} alt={pillar.image.alt} fill className="object-cover" style={{ objectPosition: pillar.image.objectPosition }} sizes="(max-width: 1023px) min(100vw - 3rem, 36rem), 18rem" /></div>
          </figure>
        ) : null}
      </div>
    </div>
  );
};
