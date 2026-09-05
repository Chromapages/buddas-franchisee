export const loadPortalModule = async <T>(
  moduleName: string,
  request: () => Promise<T>,
): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    console.error(`Portal module request failed: ${moduleName}`, error);
    throw new Error(`Portal module unavailable: ${moduleName}`);
  }
};
