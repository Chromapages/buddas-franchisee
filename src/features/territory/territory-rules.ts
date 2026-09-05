import type { TerritoryEvaluation, TerritoryStatus } from "./types";
import { PUBLIC_JURISDICTION_STATUSES } from "./public-jurisdiction-status";

const toNameMap = (status: "OFFERING_CLEARED" | "REGISTRATION_PENDING" | "FUTURE_MARKET_INTEREST") =>
  Object.fromEntries(
    PUBLIC_JURISDICTION_STATUSES
      .filter((record) => record.offeringStatus === status)
      .map((record) => [record.code, record.name]),
  ) as Record<string, string>;

export const APPROVED_TERRITORIES = toNameMap("OFFERING_CLEARED");
export const PENDING_REGISTRATION_STATES = toNameMap("REGISTRATION_PENDING");
export const FUTURE_EXPANSION_MARKETS = toNameMap("FUTURE_MARKET_INTEREST");

export const STATE_NAME_TO_CODE: Record<string, string> = {
  ...Object.fromEntries(PUBLIC_JURISDICTION_STATUSES.map((record) => [record.name.toLowerCase(), record.code])),
  hawaii: "HI",
};

export const extractStateCode = (input: string): string | null => {
  if (!input) return null;
  const clean = input.trim();

  // Check 2-letter uppercase word
  const match2Letter = clean.match(/\b([A-Za-z]{2})\b$/);
  if (match2Letter) {
    const code = match2Letter[1].toUpperCase();
    return code;
  }

  // Check state name substring
  const lower = clean.toLowerCase();
  for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
    if (lower.includes(name)) {
      return code;
    }
  }

  return null;
};

export const evaluateTerritory = (stateOrMarket: string): TerritoryEvaluation => {
  const code = extractStateCode(stateOrMarket);

  if (!code) {
    return {
      stateCode: "UNKNOWN",
      stateName: stateOrMarket || "General Territory",
      status: "FUTURE_EXPANSION",
      isAvailableForActiveOffering: false,
      message:
        "Budda's is actively reviewing expansion markets. Your territory will be evaluated during qualification.",
    };
  }

  if (APPROVED_TERRITORIES[code]) {
    return {
      stateCode: code,
      stateName: APPROVED_TERRITORIES[code],
      status: "APPROVED",
      isAvailableForActiveOffering: true,
      message: `Active franchise offering is cleared for ${APPROVED_TERRITORIES[code]}. Formal FDD disclosure available upon qualification.`,
    };
  }

  if (PENDING_REGISTRATION_STATES[code]) {
    return {
      stateCode: code,
      stateName: PENDING_REGISTRATION_STATES[code],
      status: "PENDING_REGISTRATION",
      isAvailableForActiveOffering: false,
      message: `Budda's is currently completing franchise regulatory filings for ${PENDING_REGISTRATION_STATES[code]}. Submissions are accepted for priority review once effective.`,
    };
  }

  if (FUTURE_EXPANSION_MARKETS[code]) {
    return {
      stateCode: code,
      stateName: FUTURE_EXPANSION_MARKETS[code],
      status: "FUTURE_EXPANSION",
      isAvailableForActiveOffering: false,
      message:
        "This market is queued for future phase development. We welcome your expression of interest.",
    };
  }

  return {
    stateCode: code,
    stateName: code,
    status: "FUTURE_EXPANSION",
    isAvailableForActiveOffering: false,
    message:
      "This market is queued for future phase development. We welcome your expression of interest.",
  };
};
