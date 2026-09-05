export type PortalRuntimeEnvironment = "development" | "preview" | "production";

const previewEnvironmentNames = new Set(["preview", "staging", "demo"]);

export const getPortalRuntimeEnvironment = (): PortalRuntimeEnvironment => {
  if (process.env.NODE_ENV === "development") return "development";

  const deploymentEnvironment = (
    process.env.DEPLOYMENT_ENV || process.env.VERCEL_ENV
  )?.trim().toLowerCase();
  return deploymentEnvironment && previewEnvironmentNames.has(deploymentEnvironment)
    ? "preview"
    : "production";
};

export const canUseSeedPortalData = (): boolean =>
  getPortalRuntimeEnvironment() !== "production";

export const canUseDevelopmentSeedData = (): boolean =>
  getPortalRuntimeEnvironment() === "development";

export const getPortalEnvironmentNotice = (): string | null => {
  const environment = getPortalRuntimeEnvironment();

  if (environment === "development") {
    return process.env.PORTAL_USE_SEED_DATA === "true" ? "Local seed data is explicitly enabled; it resets when the development server restarts." : null;
  }

  if (environment === "preview") {
    return "Preview workspace. This is a non-production environment; do not treat transactions, identities, or unit data as live operating records.";
  }

  return null;
};
