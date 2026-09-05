import { FRANCHISE_FAQ_CONTENT } from "../src/features/franchise/faq-content.ts";

const blockers = FRANCHISE_FAQ_CONTENT
  .filter((item) => item.governance.publicStatus === "PUBLIC")
  .flatMap((item) => {
    const issues: string[] = [];
    if (item.governance.lastReviewedAt === null) issues.push("missing last-reviewed date");
    if (item.governance.legalReviewStatus !== "APPROVED") issues.push(`review status is ${item.governance.legalReviewStatus}`);
    if (item.governance.financialClaimReviewRequirement !== "NONE" && !item.governance.requiresLegalReview) issues.push("financial-review requirement lacks legal-review gate");
    return issues.map((issue) => `${item.slug}: ${issue}`);
  });

if (blockers.length) {
  console.error("FAQ release gate failed:\n" + blockers.map((blocker) => `- ${blocker}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("FAQ release gate passed.");
}
