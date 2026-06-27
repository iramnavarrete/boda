import { useFamiliesSelectionStore } from "@/features/admin/stores/useFamiliesSelectionStore";

export function useFamiliesSelection() {
  const selectedFamilies = useFamiliesSelectionStore(
    (state) => state.selectedFamilies,
  );
  const handleSelectFamily = useFamiliesSelectionStore(
    (state) => state.selectFamily,
  );
  const handleSelectAll = useFamiliesSelectionStore((state) => state.selectAll);
  const clearSelection = useFamiliesSelectionStore(
    (state) => state.clearSelection,
  );
  const removeFromSelection = useFamiliesSelectionStore(
    (state) => state.removeFromSelection,
  );

  return {
    selectedFamilies,
    handleSelectFamily,
    handleSelectAll,
    clearSelection,
    removeFromSelection,
  };
}
