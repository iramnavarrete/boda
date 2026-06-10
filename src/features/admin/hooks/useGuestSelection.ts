import { useGuestSelectionStore } from "@/features/admin/stores/useGuestSelectionStore";

export function useGuestsSelection() {
  const selectedGuests = useGuestSelectionStore((state) => state.selectedGuests);
  const handleSelectGuest = useGuestSelectionStore((state) => state.selectGuest);
  const handleSelectAll = useGuestSelectionStore((state) => state.selectAll);
  const clearSelection = useGuestSelectionStore((state) => state.clearSelection);
  const removeFromSelection = useGuestSelectionStore(
    (state) => state.removeFromSelection,
  );

  return {
    selectedGuests,
    handleSelectGuest,
    handleSelectAll,
    clearSelection,
    removeFromSelection,
  };
}
