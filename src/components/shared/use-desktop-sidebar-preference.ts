"use client";

import { useEffect, useState } from "react";

type SidebarScope = "corporate" | "operator";
type SidebarPreferences = Partial<Record<SidebarScope, boolean>>;

const storageKey = "buddas:desktop-sidebar-preferences";

export function useDesktopSidebarPreference(scope: SidebarScope) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      const preferences = stored ? JSON.parse(stored) as SidebarPreferences : {};
      setCollapsed(preferences[scope] === true);
    } catch {
      setCollapsed(false);
    }
  }, [scope]);

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        const stored = window.localStorage.getItem(storageKey);
        const preferences = stored ? JSON.parse(stored) as SidebarPreferences : {};
        window.localStorage.setItem(storageKey, JSON.stringify({ ...preferences, [scope]: next }));
      } catch {
        // The interface still works when browser storage is unavailable.
      }
      return next;
    });
  };

  return { collapsed, toggle };
}
