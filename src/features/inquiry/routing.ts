import "server-only";

import { firebaseDb } from "../../lib/firebase/admin.ts";
import { extractStateCode } from "../territory/territory-rules.ts";
import type { InquiryRouting } from "./types.ts";
import type { InquiryValues } from "./schema.ts";

type FranchiseDevelopmentRegion = {
  id: string;
  status: "ACTIVE" | "INACTIVE";
  teamId: string;
  ruleVersion: string;
  stateCodes: string[];
  marketAliases: string[];
};

const normalize = (value: string) => value.toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();

const parseRegions = async (): Promise<FranchiseDevelopmentRegion[]> => {
  if (!firebaseDb) return [];
  const snapshot = await firebaseDb.collection("franchiseDevelopmentRegions").get();
  return snapshot.docs.flatMap((doc) => {
    const data = doc.data();
    const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
    if (data.status === "INACTIVE" || typeof data.teamId !== "string" || !data.teamId.trim()) return [];
    return [{
      id: doc.id,
      status: "ACTIVE" as const,
      teamId: data.teamId,
      ruleVersion: typeof data.ruleVersion === "string" ? data.ruleVersion : "unversioned",
      stateCodes: strings(data.stateCodes).map((code) => code.toUpperCase()),
      marketAliases: strings(data.marketAliases).map(normalize),
    }];
  });
};

export const getFranchiseDevelopmentRegion = async (regionId: string): Promise<FranchiseDevelopmentRegion | null> => {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(regionId)) return null;
  return (await parseRegions()).find((region) => region.id === regionId) || null;
};

export const resolveInquiryRouting = async (inquiry: InquiryValues, routedAt = new Date().toISOString()): Promise<InquiryRouting> => {
  const market = normalize(inquiry.marketInterest);
  const stateCode = inquiry.targetState || extractStateCode(inquiry.marketInterest) || extractStateCode(inquiry.cityState);
  const regions = await parseRegions();
  const aliasMatches = regions.filter((region) => region.marketAliases.some((alias) => alias && market.includes(alias)));
  const stateMatches = stateCode ? regions.filter((region) => region.stateCodes.includes(stateCode)) : [];
  const matches = aliasMatches.length === 1 ? aliasMatches : stateMatches;

  if (matches.length === 1) {
    const region = matches[0];
    return {
      status: "ROUTED",
      regionId: region.id,
      teamId: region.teamId,
      ruleId: aliasMatches.length === 1 ? "market-alias" : "state-code",
      ruleVersion: region.ruleVersion,
      reason: aliasMatches.length === 1 ? "Target market matched one configured market alias." : `Target market resolved to ${stateCode}.`,
      routedAt,
      history: [],
    };
  }

  return {
    status: matches.length > 1 ? "NEEDS_REVIEW" : "UNROUTABLE",
    teamId: "franchise-development-intake",
    ruleId: matches.length > 1 ? "ambiguous-region" : "no-region-match",
    ruleVersion: "1",
    reason: matches.length > 1 ? "Multiple franchise-development regions match this target market." : "No active franchise-development region matched the target market.",
    routedAt,
    history: [],
  };
};
