import { useEffect, useMemo } from "react";

// Hooks de datos
import { useFamiliesData } from "@/features/admin/hooks/useFamilyData";
import { useFamiliesFiltes } from "@/features/admin/hooks/useFamiliesFillters";
import { useFamilyForm } from "@/features/admin/hooks/useFamilyForm";
import { useConfirmModal } from "@/features/admin/hooks/useConfirmModal";
import { useFamiliesStats } from "@/features/admin/hooks/useFamiliesStats";
import { useFamilyActions } from "@/features/admin/hooks/useFamilyActions";
import { useExpiredFamiliesWatcher } from "@/features/admin/hooks/useExpiredFamiliesWatcher";
import { useWhatsappModal } from "@/features/admin/hooks/useWhatsappModal";
import { useUnlockModal } from "@/features/admin/hooks/useUnlockModal";
import { useFamilyDeletion } from "@/features/admin/hooks/useFamilyDeletion";
import { useFamiliesImport } from "@/features/admin/hooks/useFamiliesImport";
import { useLockActions, useEditActions } from "@/features/admin/hooks/family";
import { useEventStats } from "@/features/admin/hooks/useEventStats";

// Stores
import { useFamiliesFiltersStore } from "@/features/admin/stores/useFamiliesFiltersStore";
import { useFamiliesSelectionStore } from "@/features/admin/stores/useFamiliesSelectionStore";

// Shared
import { useToast } from "@/features/shared/components/Toast";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

// ─────────────────────────────────────────────────────────────────────────────
// Hook maestro: orquesta toda la lógica del módulo WeddingAdmin.
// Separa responsabilidades en secciones claras y evita pasar props en cascada.
// ─────────────────────────────────────────────────────────────────────────────
export function useWeddingAdmin() {
  // ── Datos de invitación ─────────────────────────────────────────────────
  const invitationId = useInvitationStore((state) => state.invitationData?.id);
  const { toast } = useToast();

  // ── Familias (suscripción en tiempo real) ───────────────────────────────
  const { families, isLoadingFamilies, error } = useFamiliesData(invitationId);

  // ── Watcher: bloqueo automático de familias con fecha expirada ──────────
  useExpiredFamiliesWatcher(families, invitationId);

  // ── Filtros de búsqueda / estado ────────────────────────────────────────
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredFamilies,
  } = useFamiliesFiltes(families);

  // ── Filtros adicionales (Zustand — no necesitan estar aquí si los
  //    componentes los leen directo del store, pero los exponemos para
  //    pasarlos a los sub-componentes que aún los necesiten) ───────────────
  const whatsappFilter = useFamiliesFiltersStore((s) => s.whatsappFilter);
  const setWhatsappFilter = useFamiliesFiltersStore((s) => s.setWhatsappFilter);
  const tagFilter = useFamiliesFiltersStore((s) => s.tagFilter);
  const setTagFilter = useFamiliesFiltersStore((s) => s.setTagFilter);
  const viewMode = useFamiliesFiltersStore((s) => s.viewMode);
  const setViewMode = useFamiliesFiltersStore((s) => s.setViewMode);

  // ── Selección de familias ───────────────────────────────────────────────
  const selectedFamilies = useFamiliesSelectionStore((s) => s.selectedFamilies);
  const handleSelectFamily = useFamiliesSelectionStore((s) => s.selectFamily);
  /** Versión cruda del store — requiere pasar el array de familias */
  const _selectAllFromStore = useFamiliesSelectionStore((s) => s.selectAll);
  const clearSelection = useFamiliesSelectionStore((s) => s.clearSelection);
  const removeFromSelection = useFamiliesSelectionStore(
    (s) => s.removeFromSelection,
  );

  // ── Modal de formulario de familia ──────────────────────────────────────
  const {
    isModalOpen,
    currentFamilyId,
    formData,
    handleOpenModal,
    handleCloseModal,
  } = useFamilyForm();

  // ── Modal de confirmación genérico ──────────────────────────────────────
  const {
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    handleExecuteConfirmation,
  } = useConfirmModal();

  // ── Acciones principales: guardar / exportar ────────────────────────────
  const { handleSaveFamily, handleExportExcel } =
    useFamilyActions(invitationId);

  // ── Estadísticas + filtros cruzados (un solo useMemo interno) ──────────
  const {
    filteredFamilies: finalFilteredFamilies,
    filterCounts: {
      whatsapp: whatsappCounts,
      etiquetas: tagCounts,
      status: statusCounts,
    },
  } = useEventStats(filteredFamilies, {
    filters: { whatsapp: whatsappFilter, tag: tagFilter },
  });

  // ── Stats del sidebar (derivadas de finalFilteredFamilies) ──────────────
  const stats = useFamiliesStats(finalFilteredFamilies);

  // ── Derivados: ¿hay filtro activo? ──────────────────────────────────────
  // Memorizamos para no recalcular en cada render
  const isFilterActive = useMemo(
    () =>
      finalFilteredFamilies.length !== (families?.length ?? 0) ||
      searchTerm !== "",
    [finalFilteredFamilies.length, families?.length, searchTerm],
  );

  // ── Modales secundarios ─────────────────────────────────────────────────
  const whatsapp = useWhatsappModal(invitationId);

  const unlock = useUnlockModal(invitationId, selectedFamilies, clearSelection);

  const {
    isImportModalOpen,
    isImporting,
    openImportModal,
    closeImportModal,
    handleImport,
  } = useFamiliesImport(invitationId);

  // ── Acciones de eliminación ─────────────────────────────────────────────
  const { handleDeleteFamily, handleBulkDelete } = useFamilyDeletion({
    invitationId,
    selectedFamilies,
    clearSelection,
    removeFromSelection,
    openConfirmModal,
  });

  // ── Acciones de bloqueo / desbloqueo ────────────────────────────────────
  const { handleLockToggle, handleBulkUpdateLock } = useLockActions({
    invitationId,
    selectedFamilies,
    clearSelection,
    openConfirmModal,
    unlockModal: unlock,
  });

  // ── Acciones de edición / creación ─────────────────────────────────────
  const { handleEdit, handleNewFamily, onSaveFamily } = useEditActions({
    invitationId,
    currentFamilyId,
    handleOpenModal,
    handleCloseModal,
    handleSaveFamily,
  });

  // ── Efecto: mostrar errores de carga con toast ──────────────────────────
  useEffect(() => {
    if (error) toast(error, "error");
  }, [error, toast]);

  return {
    // Datos crudos
    families,
    isLoadingFamilies,

    // Familias ya filtradas (resultado final)
    finalFilteredFamilies,

    // Estado de filtros
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    whatsappFilter,
    setWhatsappFilter,
    tagFilter,
    setTagFilter,
    viewMode,
    setViewMode,

    // Contadores para badges de filtros
    statusCounts,
    whatsappCounts,
    tagCounts,

    // Selección
    selectedFamilies,
    handleSelectFamily,
    clearSelection,

    // Stats del sidebar
    stats,
    isFilterActive,

    // Modal de formulario
    isModalOpen,
    currentFamilyId,
    formData,
    handleCloseModal,

    // Modal de confirmación
    confirmModal,
    closeConfirmModal,
    handleExecuteConfirmation,

    // Modal de WhatsApp
    whatsapp,

    // Modal de desbloqueo
    unlock,

    // Modal de importación
    isImportModalOpen,
    isImporting,
    openImportModal,
    closeImportModal,
    handleImport,

    // Acciones CRUD
    handleEdit,
    handleNewFamily,
    onSaveFamily,
    handleDeleteFamily,
    handleBulkDelete,
    handleLockToggle,
    handleBulkUpdateLock,
    handleExportExcel: () => handleExportExcel(families),
    /** Selecciona/deselecciona todas las familias filtradas */
    handleSelectAll: () => _selectAllFromStore(finalFilteredFamilies),
  } as const;
}
