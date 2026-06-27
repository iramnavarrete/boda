import { useEffect } from "react";
import FamilyFormModal from "@/features/admin/components/FamilyFormModal";
import ConfirmationModal from "@/features/admin/components/ConfirmationModal";
import FloatingBulkActionsBar from "@/features/admin/components/FloatingBulkActionsBar";
import ImportFamiliesModal from "@/features/admin/components/ImportFamiliesModal";
import SendWhatsappModal from "@/features/admin/components/SendWhatsappModal";
import UnlockChangesModal from "@/features/admin/components/UnlockChangesModal";
import StatsSidebar from "@/features/admin/components/StatsSidebar";
import FamiliesMainSection from "@/features/admin/components/families/views/FamiliesMainSection";

// Hooks
import { useFamiliesData } from "@/features/admin/hooks/useFamilyData";
import { useFamiliesFiltes } from "@/features/admin/hooks/useFamiliesFillters";
import { useFamilyForm } from "@/features/admin/hooks/useFamilyForm";
import { useConfirmModal } from "@/features/admin/hooks/useConfirmModal";
import { useFamiliesStats } from "@/features/admin/hooks/useFamiliesStats";
import { useFamilyActions } from "@/features/admin/hooks/useFamilyActions";
import { useToast } from "@/features/shared/components/Toast";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { useExpiredFamiliesWatcher } from "@/features/admin/hooks/useExpiredFamiliesWatcher";
import { useFamiliesFiltersAndCounts } from "@/features/admin/hooks/useFamiliesFiltersAndCounts";
import { useWhatsappModal } from "@/features/admin/hooks/useWhatsappModal";
import { useUnlockModal } from "@/features/admin/hooks/useUnlockModal";
import { useFamilyDeletion } from "@/features/admin/hooks/useFamilyDeletion";
import { useFamiliesImport } from "@/features/admin/hooks/useFamiliesImport";
import { useLockActions, useEditActions } from "@/features/admin/hooks/family";

// Stores
import { useFamiliesFiltersStore } from "@/features/admin/stores/useFamiliesFiltersStore";
import { useFamiliesSelectionStore } from "@/features/admin/stores/useFamiliesSelectionStore";

export default function WeddingAdmin() {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { toast } = useToast();

  const { families, isLoadingFamilies, error } = useFamiliesData(invitationData?.id);
  const { searchTerm, setSearchTerm, filterStatus, setFilterStatus, filteredFamilies } =
    useFamiliesFiltes(families);

  // Filter UI state
  const whatsappFilter = useFamiliesFiltersStore((state) => state.whatsappFilter);
  const setWhatsappFilter = useFamiliesFiltersStore((state) => state.setWhatsappFilter);
  const tagFilter = useFamiliesFiltersStore((state) => state.tagFilter);
  const setTagFilter = useFamiliesFiltersStore((state) => state.setTagFilter);
  const viewMode = useFamiliesFiltersStore((state) => state.viewMode);
  const setViewMode = useFamiliesFiltersStore((state) => state.setViewMode);

  // Selection state
  const selectedFamilies = useFamiliesSelectionStore((state) => state.selectedFamilies);
  const handleSelectFamily = useFamiliesSelectionStore((state) => state.selectFamily);
  const handleSelectAll = useFamiliesSelectionStore((state) => state.selectAll);
  const clearSelection = useFamiliesSelectionStore((state) => state.clearSelection);
  const removeFromSelection = useFamiliesSelectionStore((state) => state.removeFromSelection);

  // Form state
  const { isModalOpen, currentFamilyId: currentFamilyId, formData, handleOpenModal, handleCloseModal } =
    useFamilyForm();

  // Confirm modal
  const { confirmModal, openConfirmModal, closeConfirmModal, handleExecuteConfirmation } =
    useConfirmModal();

  // Family actions
  const { handleSaveFamily, handleExportExcel } = useFamilyActions(invitationData?.id);

  // Watchers
  useExpiredFamiliesWatcher(families, invitationData?.id);

  // Filtered data
  const { finalFilteredFamilies, filterCounts, whatsappCounts, tagCounts } =
    useFamiliesFiltersAndCounts(filteredFamilies, whatsappFilter, tagFilter);

  // Modals
  const whatsapp = useWhatsappModal(invitationData?.id);
  const unlock = useUnlockModal(invitationData?.id, selectedFamilies, clearSelection);
  const { isImportModalOpen, isImporting, openImportModal, closeImportModal, handleImport } =
    useFamiliesImport(invitationData?.id);

  // Delete logic
  const { handleDeleteFamily, handleBulkDelete } = useFamilyDeletion({
    invitationId: invitationData?.id,
    selectedFamilies: selectedFamilies,
    clearSelection,
    removeFromSelection,
    openConfirmModal,
  });

  // Lock actions
  const { handleLockToggle, handleBulkUpdateLock } = useLockActions({
    invitationId: invitationData?.id,
    selectedFamilies: selectedFamilies,
    clearSelection,
    openConfirmModal,
    unlockModal: unlock,
  });

  // Edit actions
  const { handleEdit, handleNewFamily, onSaveFamily } = useEditActions({
    invitationId: invitationData?.id,
    currentFamilyId: currentFamilyId,
    handleOpenModal,
    handleCloseModal,
    handleSaveFamily,
  });

  // Error toast
  useEffect(() => {
    if (error) toast(error, "error");
  }, [error, toast]);

  // Derived state
  const stats = useFamiliesStats(finalFilteredFamilies);
  const isFiltered = finalFilteredFamilies.length !== (families?.length ?? 0);
  const isFilterActive = isFiltered || searchTerm !== "";

  return (
    <div className="bg-[#F9F7F2] min-h-screen font-sans text-[#2C2C29]">
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col lg:flex-row gap-4 items-start mt-2.5">
          <aside className="w-full lg:w-auto">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1 ml-1 lg:max-w-[12ch]">
                Invitados {isFilterActive && "(filtrado)"}
              </h3>
              <StatsSidebar stats={stats} />
            </div>
          </aside>

          <main className="flex-1 w-full lg:order-1 min-w-0">
            <h3 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1 ml-1">
              Familias {isFilterActive && "(filtrado)"}
            </h3>

            <FamiliesMainSection
              viewMode={viewMode}
              setViewMode={setViewMode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterCounts={filterCounts}
              whatsappFilter={whatsappFilter}
              setWhatsappFilter={setWhatsappFilter}
              whatsappCounts={whatsappCounts}
              tagFilter={tagFilter}
              setTagFilter={setTagFilter}
              tagCounts={tagCounts}
              selectedFamilies={selectedFamilies}
              filteredFamilies={finalFilteredFamilies}
              isLoadingFamilies={isLoadingFamilies}
              disabled={selectedFamilies.size > 0}
              onImportExcel={openImportModal}
              onExportExcel={() => handleExportExcel(families)}
              onNewFamily={handleNewFamily}
              onSelectFamily={handleSelectFamily}
              onSendReminder={(g) => whatsapp.open(g, "reminder")}
              onEdit={handleEdit}
              onDelete={handleDeleteFamily}
              onSendWhatsApp={(g) => whatsapp.open(g, "initial")}
              onLockToggle={handleLockToggle}
            />
          </main>
        </div>
      </section>

      <FloatingBulkActionsBar
        count={selectedFamilies.size}
        isSelectedAll={selectedFamilies.size === finalFilteredFamilies.length}
        onUpdateLock={handleBulkUpdateLock}
        onDelete={handleBulkDelete}
        onCancel={clearSelection}
        onSelectAll={() => handleSelectAll(finalFilteredFamilies)}
      />

      <FamilyFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={formData}
        onSubmit={onSaveFamily}
        isEdit={!!currentFamilyId}
        onBackdropPress={handleCloseModal}
      />

      <SendWhatsappModal
        isOpen={whatsapp.modal.isOpen}
        type={whatsapp.modal.type}
        familyName={whatsapp.modal.family?.nombre ?? ""}
        onClose={whatsapp.close}
        onConfirm={whatsapp.handleSubmit}
      />

      <UnlockChangesModal
        isOpen={unlock.modal.isOpen}
        family={unlock.modal.family}
        isBulk={unlock.modal.isBulk}
        onClose={unlock.close}
        onConfirm={unlock.execute}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={closeConfirmModal}
        onConfirm={handleExecuteConfirmation}
        isLoading={confirmModal.isLoading}
        isDanger={confirmModal.isDanger}
        confirmText={confirmModal.isDanger ? "Eliminar" : "Confirmar"}
        onBackdropPress={closeConfirmModal}
      />

      <ImportFamiliesModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={handleImport}
        isImporting={isImporting}
      />
    </div>
  );
}
