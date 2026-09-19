import { CandidateProfileDesktop } from "@/src/components/public/candidate-profile-desktop";
import { CandidateProfileMobile } from "@/src/components/public/candidate-profile-mobile";
import { CANDIDATE_PROFILE_CONTENT } from "@/src/features/franchise/candidate-criteria";

/** Responsive mount point; each viewport owns its presentation. */
export const CandidateProfileSection = ({ content = CANDIDATE_PROFILE_CONTENT }: { content?: typeof CANDIDATE_PROFILE_CONTENT }) => <>
  <CandidateProfileMobile content={content} />
  <CandidateProfileDesktop content={content} />
</>;
