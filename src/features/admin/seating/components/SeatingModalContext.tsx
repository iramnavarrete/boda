"use client";

import { createContext, useContext } from "react";

interface SeatingModalContextType {
  triggerSeatRemoval: (familyId: string, guestId: string) => void;
  triggerFamilyRemoval: (familyId: string) => void;
  triggerAddSeat: (familyId: string) => void;
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
