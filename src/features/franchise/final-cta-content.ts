import { OPPORTUNITY_DOSSIER_CONTENT } from "@/src/features/franchise/opportunity-content";
import { CANDIDATE_PROFILE_CONTENT } from "@/src/features/franchise/candidate-criteria";
import { PUBLIC_INITIAL_INQUIRY_CONTENT } from "@/src/features/inquiry/public-inquiry-content";

/**
 * Closing conversion content reuses the governed next-step language from the
 * opportunity dossier. Financial figures intentionally remain outside this
 * surface because finance governance does not define an approved final-CTA
 * placement. The linked destination owns any approved disclosure.
 */
export const FRANCHISE_FINAL_CTA_CONTENT = {
  eyebrow: "Franchise partnership",
  title: "Ready to see if we’re a fit?",
  titleAlternative: "Let’s Build Something Together.",
  description: "A two-way evaluation for experienced restaurant operators.",
  qualificationBenchmark: {
    label: "Candidate profile",
    items: [
      { label: CANDIDATE_PROFILE_CONTENT.partnership.candidateItems[0] },
      { label: CANDIDATE_PROFILE_CONTENT.partnership.candidateItems[1] },
      { label: CANDIDATE_PROFILE_CONTENT.partnership.candidateItems[2] },
    ],
  },
  expectation: PUBLIC_INITIAL_INQUIRY_CONTENT.ctaExpectation.value,
  boundary: OPPORTUNITY_DOSSIER_CONTENT.finalDecision.boundary.text,
  primaryAction: {
    label: "Request Franchise Information",
    href: "/franchise/contact",
  },
  researchAction: {
    label: "See the franchise evaluation process",
    href: "/franchise/process",
  },
} as const;
