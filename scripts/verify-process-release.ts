import { getProcessReleaseBlockers } from "../src/features/franchise/process-content.ts";

const blockers = getProcessReleaseBlockers();

if (blockers.length) {
  console.error(
    "Process release gate failed:\n" +
      blockers
        .map(
          (blocker) =>
            `- ${blocker.path}: reviewStatus=${blocker.reviewStatus}; publicStatus=${blocker.publicStatus}; reviewedAt=${blocker.reviewedAt ?? "missing"}; effectiveDate=${blocker.effectiveDate ?? "missing"}; expiresAt=${blocker.expiresAt ?? "none"}`,
        )
        .join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log("Process release gate passed.");
}
