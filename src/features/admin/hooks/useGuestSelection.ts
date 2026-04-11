import { useState } from "react";
import { Guest } from "@/types";

export function useGuestsSelection() {
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  const handleSelectGuest = (id: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (filtered: Guest[]) => {
    setSelectedGuests((prev) =>
      prev.size === filtered.length && filtered.length > 0
        ? new Set()
        : new Set(filtered.map((g) => g.id)),
    );
  };

  const removeFromSelection = (id: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedGuests(new Set());

  return {
    selectedGuests,
    handleSelectGuest,
    handleSelectAll,
    clearSelection,
    removeFromSelection,
  };
}
