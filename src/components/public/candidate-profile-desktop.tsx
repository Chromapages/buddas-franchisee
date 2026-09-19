import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesCombined,
  ClipboardList,
  Megaphone,
  Package,
  UsersRound,
} from "lucide-react";
import { CandidateProfileViewTracker } from "@/src/components/public/candidate-profile-view-tracker";
import { CANDIDATE_PROFILE_CONTENT, OPERATOR_SUPPORT_CONTENT } from "@/src/features/franchise/candidate-criteria";

const supportIcons = [UsersRound, ClipboardList, Megaphone, Package, ChartNoAxesCombined] as const;

/** Desktop operator-support board; tablet and mobile retain the linear evidence narrative. */
export const CandidateProfileDesktop = ({ content: _content = CANDIDATE_PROFILE_CONTENT }: { content?: typeof CANDIDATE_PROFILE_CONTENT }) => (
  <section
    id="candidate-profile-desktop"
    aria-labelledby="candidate-profile-desktop-heading"
    className="operator-support-section hidden bg-white text-bds-teal-dark lg:block"
  >
    <CandidateProfileViewTracker targetId="candidate-profile-desktop" />
    <div className="content-wide operator-support-board">
      <header className="operator-support-board-header">
        <p>{OPERATOR_SUPPORT_CONTENT.eyebrow}</p>
        <h2 id="candidate-profile-desktop-heading">{OPERATOR_SUPPORT_CONTENT.heading}</h2>
        <span>{OPERATOR_SUPPORT_CONTENT.description}</span>
      </header>

      <div className="operator-support-card-grid" aria-label="Five systems behind operator support">
        {OPERATOR_SUPPORT_CONTENT.areas.map((area, index) => {
          const Icon = supportIcons[index];
          return (
            <article className="operator-support-card" key={area.index}>
              <i aria-hidden="true"><Icon /></i>
              <div>
                <p>{area.label}</p>
                <h3>{area.title}</h3>
                <span>{area.description}</span>
                <Link href={OPERATOR_SUPPORT_CONTENT.action.href} aria-label={`Learn more about ${area.label}`}>
                  Learn more <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}

        <article className="operator-support-process-card">
          <div>
            <h3>See How It Works</h3>
            <p>{OPERATOR_SUPPORT_CONTENT.action.microcopy}</p>
            <Link href={OPERATOR_SUPPORT_CONTENT.action.href}>
              Explore the Process <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <figure>
            <Image
              src={OPERATOR_SUPPORT_CONTENT.image.src}
              alt={OPERATOR_SUPPORT_CONTENT.image.alt}
              fill
              loading="lazy"
              sizes="(min-width: 1200px) 14vw, 28vw"
              className="object-cover"
            />
          </figure>
        </article>
      </div>
    </div>
  </section>
);
