"use client";

import { createContext, useContext } from "react";
import { ConfirmModalState } from "@/types";

/**
 * Tipo del `action` en `openConfirmModal`: una función async que se
 * ejecuta cuando el usuario confirma el modal. Usamos `Omit<>` para
 * no repetir el tipo.
 */
type ConfirmAction = Omit<ConfirmModalState, "isLoading">;

interface SeatingModalContextType {
  triggerSeatRemoval: (familyId: string, guestId: string) => void;
  triggerFamilyRemoval: (familyId: string) => void;
  triggerAddSeat: (familyId: string) => void;
  /**
   * Abre el modal de confirmación global (`<ConfirmationModal>`
   * montado en `SeatingManager.tsx`). Lo usan componentes hijos
   * (como el botón eliminar del `ElementSidebar`) que necesitan
   * pedir confirmación antes de ejecutar acciones destructivas.
   */
  openConfirmModal: (config: ConfirmAction) => void;
}

export const SeatingModalContext = createContext<
  SeatingModalContextType | undefined
>(undefined);

export const useSeatingModalContext = () => {
  const context = useContext(SeatingModalContext);
  if (!context)
    throw new Error(
      "useSeatingModalContext debe usarse dentro de SeatingModalProvider",
    );
  return context;
};
