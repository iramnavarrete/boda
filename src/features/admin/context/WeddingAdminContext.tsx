import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useWeddingAdmin } from "@/features/admin/hooks/useWeddingAdmin";

export type WeddingAdminContextValue = ReturnType<typeof useWeddingAdmin>;

const WeddingAdminContext = createContext<WeddingAdminContextValue | null>(null);

interface WeddingAdminProviderProps {
  children: ReactNode;
}

export function WeddingAdminProvider({ children }: WeddingAdminProviderProps) {
  const value = useWeddingAdmin();
  return (
    <WeddingAdminContext.Provider value={value}>
      {children}
    </WeddingAdminContext.Provider>
  );
}

export function useWeddingAdminContext(): WeddingAdminContextValue {
  const ctx = useContext(WeddingAdminContext);
  if (!ctx) {
    throw new Error(
      "useWeddingAdminContext debe usarse dentro de <WeddingAdminProvider>",
    );
  }
  return ctx;
}
