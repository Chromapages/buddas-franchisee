/**
 * Feature flag utilities for controlling public release stages and offering gates.
 * Enforces REQ-010: Active-offering content must require a protected release gate.
 */

export const isActiveOfferingEnabled = (): boolean => {
  const flag =
    process.env.NEXT_PUBLIC_ENABLE_ACTIVE_OFFERING ||
    process.env.ENABLE_ACTIVE_OFFERING;

  if (!flag) return false;
  return flag.trim().toLowerCase() === "true" || flag.trim() === "1";
};

export const isFddReceiptsEnabled = (): boolean => {
  const flag =
    process.env.NEXT_PUBLIC_ENABLE_FDD_RECEIPTS ||
    process.env.ENABLE_FDD_RECEIPTS;

  if (!flag) return isActiveOfferingEnabled();
  return flag.trim().toLowerCase() === "true" || flag.trim() === "1";
};
