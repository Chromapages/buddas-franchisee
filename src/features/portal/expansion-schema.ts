import { z } from "zod";
import { investmentRangeOptions, preferredTimelineOptions } from "@/src/features/inquiry/schema";

const cleanText = (label: string, minimum: number, maximum: number) => z.string().trim().min(minimum, `${label} is required.`).max(maximum, `${label} is too long.`).refine((value) => !/[\u0000-\u001f\u007f\u202a-\u202e]/u.test(value), `${label} contains unsupported characters.`);

export const expansionSiteReadinessOptions = [
  { value: "EXPLORING", label: "Exploring markets; no site yet" },
  { value: "MARKET_IDENTIFIED", label: "Target market identified" },
  { value: "SITE_IDENTIFIED", label: "Potential site identified" },
  { value: "LOI_OR_CONTROL", label: "Site under LOI or control" },
] as const;

export const expansionApplicationSchema = z.object({
  targetMarket: cleanText("Target market", 3, 120),
  preferredTimeline: z.enum(preferredTimelineOptions),
  investmentRange: z.enum(investmentRangeOptions),
  siteReadiness: z.enum(["EXPLORING", "MARKET_IDENTIFIED", "SITE_IDENTIFIED", "LOI_OR_CONTROL"]),
  operatingPlan: z.string().trim().min(20, "Describe your operating plan in at least 20 characters.").max(1200, "Keep your operating plan within 1,200 characters.").refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e]/u.test(value), "Operating plan contains unsupported characters."),
  territoryAcknowledgement: z.literal("acknowledged", { errorMap: () => ({ message: "Acknowledge the territory and approval terms before submitting." }) }),
});

export type ExpansionApplicationInput = z.infer<typeof expansionApplicationSchema>;
