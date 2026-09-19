"use client";

import { useEffect } from "react";
import { usePortalContext, type ScopedNotificationCounts } from "@/src/features/portal/portal-context";

/** Streams a resolved badge into the already authorized shell. No record data. */
export function PortalCountsUpdate({ countKey, value }: {
  countKey: keyof ScopedNotificationCounts;
  value: number | null;
}) {
  const { updateCount } = usePortalContext();
  useEffect(() => { updateCount(countKey, value); }, [countKey, value, updateCount]);
  return null;
}
