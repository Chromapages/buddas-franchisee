export class PortalModuleLoadError extends Error {
  public readonly state: "unconfigured" | "failed";

  constructor(moduleName: string, state: "unconfigured" | "failed") {
    super(`Portal module unavailable: ${moduleName}`);
    this.name = "PortalModuleLoadError";
    this.state = state;
  }
}

export const isPortalModuleUnconfigured = (error: unknown): boolean =>
  error instanceof PortalModuleLoadError && error.state === "unconfigured";

export const loadPortalModule = async <T>(
  moduleName: string,
  request: () => Promise<T>,
): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    console.error(`Portal module request failed: ${moduleName}`, error);
    const message = error instanceof Error ? error.message : "";
    throw new PortalModuleLoadError(
      moduleName,
      message.includes("Portal storage must be configured") ? "unconfigured" : "failed",
    );
  }
};
