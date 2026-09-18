"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useActivityAdmin } from "../hooks/useActivityAdmin";
import type { ActivityAdminContextValue } from "../hooks/useActivityAdmin";

const ActivityContext = createContext<ActivityAdminContextValue | null>(null);

interface ActivityProviderProps {
  children: ReactNode;
}

export function ActivityProvider({ children }: ActivityProviderProps) {
  const value = useActivityAdmin();
  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext(): ActivityAdminContextValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error(
      "useActivityContext debe usarse dentro de <ActivityProvider>",
    );
  }
  return ctx;
}