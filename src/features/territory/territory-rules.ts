import type { TerritoryEvaluation, TerritoryStatus } from "./types";

export const APPROVED_TERRITORIES: Record<string, string> = {
  HI: "Hawai'i",
  UT: "Utah",
  NV: "Nevada",
  AZ: "Arizona",
  TX: "Texas",
  FL: "Florida",
  CO: "Colorado",
  NC: "North Carolina",
  GA: "Georgia",
  OH: "Ohio",
  CA: "California",
  WA: "Washington",
};

export const PENDING_REGISTRATION_STATES: Record<string, string> = {
  NY: "New York",
  IL: "Illinois",
  VA: "Virginia",
  MD: "Maryland",
  MN: "Minnesota",
  WI: "Wisconsin",
  IN: "Indiana",
  ND: "North Dakota",
  RI: "Rhode Island",
  SD: "South Dakota",
};

export const STATE_NAME_TO_CODE: Record<string, string> = {
  hawaii: "HI",
  "hawai'i": "HI",
  utah: "UT",
  nevada: "NV",
  arizona: "AZ",
  texas: "TX",
  florida: "FL",
  colorado: "CO",
  "north carolina": "NC",
  georgia: "GA",
  ohio: "OH",
  california: "CA",
  washington: "WA",
  "new york": "NY",
  illinois: "IL",
  virginia: "VA",
  maryland: "MD",
  minnesota: "MN",
  wisconsin: "WI",
  indiana: "IN",
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

  return {
    stateCode: code,
    stateName: code,
    status: "FUTURE_EXPANSION",
    isAvailableForActiveOffering: false,
    message:
      "This market is queued for future phase development. We welcome your expression of interest.",
  };
};
