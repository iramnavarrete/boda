import { useState } from "react";
import { Guest } from "@/types";

export function useGuestsSelection() {
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  const handleSelectGuest = (id: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedGuests(newSelected);
  };

  const handleSelectAll = (filtered: Guest[]) => {
    if (selectedGuests.size === filtered.length && filtered.length > 0)
      setSelectedGuests(new Set());
    else setSelectedGuests(new Set(filtered.map((g) => g.id)));
  };

  const clearSelection = () => setSelectedGuests(new Set());

  const removeFromSelection = (id: string) => {
    const newSel = new Set(selectedGuests);
    newSel.delete(id);
    setSelectedGuests(newSel);
  };

  return {
    selectedGuests,
    handleSelectGuest,
    handleSelectAll,
    clearSelection,
    removeFromSelection,
  };
}
