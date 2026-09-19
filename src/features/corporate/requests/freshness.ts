import type { CorporateSourceFreshness } from "./types.ts";

const FRESH_DAYS = 7;
const RECENT_DAYS = 30;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const assessSourceFreshness = (
  observedAt?: string,
  referenceDate = new Date(),
): CorporateSourceFreshness => {
  if (!observedAt) return "unknown";

  const observedTime = new Date(observedAt).getTime();
  if (Number.isNaN(observedTime)) return "unknown";

  const ageDays = Math.max(0, (referenceDate.getTime() - observedTime) / MS_PER_DAY);
  if (ageDays <= FRESH_DAYS) return "fresh";
  if (ageDays <= RECENT_DAYS) return "recent";
  return "stale";
};

export const summarizeFreshness = (
  freshnessValues: readonly CorporateSourceFreshness[],
): CorporateSourceFreshness => {
  if (freshnessValues.includes("stale")) return "stale";
  if (freshnessValues.includes("recent")) return "recent";
  if (freshnessValues.includes("fresh")) return "fresh";
  return "unknown";
};

export const describeSourceFreshness = (freshness: CorporateSourceFreshness): string => {
  switch (freshness) {
    case "fresh":
      return "Fresh source";
    case "recent":
      return "Recent source";
    case "stale":
      return "Stale source";
    default:
      return "Freshness unknown";
  }
};
