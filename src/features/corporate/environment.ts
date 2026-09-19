/** Preview records and identities are allowed only through an explicit local opt-in. */
export const isCorporateSeedMode = (): boolean => process.env.NODE_ENV === "development"
  && process.env.CORPORATE_USE_SEED_DATA === "true";

export const getCorporateEnvironmentNotice = (): string | null => isCorporateSeedMode()
  ? "Development preview. These fictional corporate records reset when the server restarts. Changes do not affect live operating records."
  : null;
