"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { PortalLocation } from "./types";

export type PortalUser = {
  id: string;
  email: string;
  role: string;
  displayName?: string;
};

export type PortalActiveUnit = {
  id: string;
  name: string;
};

export type ScopedNotificationCounts = {
  cartItemCount: number | null;
  actionRequiredSupportCount: number | null;
  actionRequiredBulletinCount: number | null;
};

export type PortalContextValue = {
  user: PortalUser;
  permittedUnits: PortalLocation[];
  activeUnit: PortalActiveUnit;
  counts: ScopedNotificationCounts;
  updateCount: (
    key: keyof ScopedNotificationCounts,
    valueOrUpdater: number | null | ((prev: number) => number),
  ) => void;
  decrementCount: (key: keyof ScopedNotificationCounts) => void;
};

const defaultNotificationCounts: ScopedNotificationCounts = {
  cartItemCount: null,
  actionRequiredSupportCount: null,
  actionRequiredBulletinCount: null,
};

const PortalContext = createContext<PortalContextValue | null>(null);

export type PortalProviderProps = {
  initialUser: PortalUser;
  permittedUnits: PortalLocation[];
  activeUnit: PortalActiveUnit;
  initialCounts?: Partial<ScopedNotificationCounts>;
  children: ReactNode;
};

export const PortalProvider = ({
  initialUser,
  permittedUnits,
  activeUnit,
  initialCounts,
  children,
}: PortalProviderProps) => {
  const [counts, setCounts] = useState<ScopedNotificationCounts>(() => ({
    ...defaultNotificationCounts,
    ...initialCounts,
  }));

  useEffect(() => {
    setCounts({ ...defaultNotificationCounts, ...initialCounts });
  }, [activeUnit.id, initialUser.id, initialCounts]);

  const updateCount = useCallback(
    (
      key: keyof ScopedNotificationCounts,
      valueOrUpdater: number | null | ((prev: number) => number),
    ) => {
      setCounts((prev) => {
        const nextValue =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(prev[key] ?? 0)
            : valueOrUpdater;
        const normalizedValue = nextValue === null ? null : Math.max(0, Math.round(nextValue));
        if (prev[key] === normalizedValue) {
          return prev;
        }
        return {
          ...prev,
          [key]: normalizedValue,
        };
      });
    },
    [],
  );

  const decrementCount = useCallback(
    (key: keyof ScopedNotificationCounts) => {
      updateCount(key, (prev) => Math.max(0, prev - 1));
    },
    [updateCount],
  );

  const contextValue = useMemo<PortalContextValue>(
    () => ({
      user: initialUser,
      permittedUnits,
      activeUnit,
      counts,
      updateCount,
      decrementCount,
    }),
    [initialUser, permittedUnits, activeUnit, counts, updateCount, decrementCount],
  );

  return (
    <PortalContext.Provider value={contextValue}>
      {children}
    </PortalContext.Provider>
  );
};

export const usePortalContext = (): PortalContextValue => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortalContext must be used within a PortalProvider");
  }
  return context;
};

export type PortalCartBadgeProps = {
  className?: string;
};

export const PortalCartBadge = ({ className = "" }: PortalCartBadgeProps) => {
  const { counts } = usePortalContext();
  if (counts.cartItemCount === null || counts.cartItemCount <= 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-bds-teal-dark px-2 py-0.5 text-[10px] font-bold text-white shadow-xs ${className}`}
      aria-label={`${counts.cartItemCount} items in cart`}
    >
      {counts.cartItemCount}
    </span>
  );
};

export type PortalNavBadgeProps = {
  countKey: keyof ScopedNotificationCounts;
  labelPrefix?: string;
  className?: string;
};

export const PortalNavBadge = ({
  countKey,
  labelPrefix = "pending items",
  className = "",
}: PortalNavBadgeProps) => {
  const { counts } = usePortalContext();
  const count = counts[countKey];
  if (count === null || count <= 0) {
    return null;
  }

  return (
    <span
      className={`ml-auto inline-flex items-center justify-center rounded-full bg-bds-teal-dark px-2 py-0.5 text-[10px] font-bold text-white font-heading shadow-xs ${className}`}
      aria-label={`${count} ${labelPrefix}`}
    >
      {count}
    </span>
  );
};
