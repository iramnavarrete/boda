import { useEffect } from "react";
import GuestFormModal from "@/features/admin/components/GuestFormModal";
import ConfirmationModal from "@/features/admin/components/ConfirmationModal";
import FloatingBulkActionsBar from "@/features/admin/components/FloatingBulkActionsBar";
import ImportGuestsModal from "@/features/admin/components/ImportGuestsModal";
import SendWhatsappModal from "@/features/admin/components/SendWhatsappModal";
import UnlockChangesModal from "@/features/admin/components/UnlockChangesModal";
import StatsSidebar from "@/features/admin/components/StatsSidebar";
import GuestsMainSection from "@/features/admin/components/guests/views/GuestsMainSection";

// Hooks
import { useGuestsData } from "@/features/admin/hooks/useGuestData";
import { useGuestsFilter } from "@/features/admin/hooks/useGuestFillters";
import { useGuestForm } from "@/features/admin/hooks/useGuestForm";
import { useConfirmModal } from "@/features/admin/hooks/useConfirmModal";
import { useGuestsStats } from "@/features/admin/hooks/useGuestsStats";
import { useGuestActions } from "@/features/admin/hooks/useGuestActions";
import { useToast } from "@/features/shared/components/Toast";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { useExpiredGuestsWatcher } from "@/features/admin/hooks/useExpiredGuestsWatcher";
import { useGuestFiltersAndCounts } from "@/features/admin/hooks/useGuestFiltersAndCounts";
import { useWhatsappModal } from "@/features/admin/hooks/useWhatsappModal";
import { useUnlockModal } from "@/features/admin/hooks/useUnlockModal";
import { useGuestDeletion } from "@/features/admin/hooks/useGuestDeletion";
import { useGuestImport } from "@/features/admin/hooks/useGuestImport";
import { useLockActions, useEditActions } from "@/features/admin/hooks/guests";

// Stores
import { useGuestFiltersStore } from "@/features/admin/stores/useGuestFiltersStore";
import { useGuestSelectionStore } from "@/features/admin/stores/useGuestSelectionStore";

export default function WeddingAdmin() {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { toast } = useToast();

  const { guests, isLoadingGuests, error } = useGuestsData(invitationData?.id);
  const { searchTerm, setSearchTerm, filterStatus, setFilterStatus, filteredGuests } =
    useGuestsFilter(guests);

  // Filter UI state
  const whatsappFilter = useGuestFiltersStore((state) => state.whatsappFilter);
  const setWhatsappFilter = useGuestFiltersStore((state) => state.setWhatsappFilter);
  const tagFilter = useGuestFiltersStore((state) => state.tagFilter);
  const setTagFilter = useGuestFiltersStore((state) => state.setTagFilter);
  const viewMode = useGuestFiltersStore((state) => state.viewMode);
  const setViewMode = useGuestFiltersStore((state) => state.setViewMode);

  // Selection state
  const selectedGuests = useGuestSelectionStore((state) => state.selectedGuests);
  const handleSelectGuest = useGuestSelectionStore((state) => state.selectGuest);
  const handleSelectAll = useGuestSelectionStore((state) => state.selectAll);
  const clearSelection = useGuestSelectionStore((state) => state.clearSelection);
  const removeFromSelection = useGuestSelectionStore((state) => state.removeFromSelection);

  // Form state
  const { isModalOpen, currentGuestId, formData, handleOpenModal, handleCloseModal } =
    useGuestForm();

  // Confirm modal
  const { confirmModal, openConfirmModal, closeConfirmModal, handleExecuteConfirmation } =
    useConfirmModal();

  // Guest actions
  const { handleSaveGuest, handleExportExcel } = useGuestActions(invitationData?.id);

  // Watchers
  useExpiredGuestsWatcher(guests, invitationData?.id);

  // Filtered data
  const { finalFilteredGuests, filterCounts, whatsappCounts, tagCounts } =
    useGuestFiltersAndCounts(filteredGuests, whatsappFilter, tagFilter);

  // Modals
  const whatsapp = useWhatsappModal(invitationData?.id);
  const unlock = useUnlockModal(invitationData?.id, selectedGuests, clearSelection);
  const { isImportModalOpen, isImporting, openImportModal, closeImportModal, handleImport } =
    useGuestImport(invitationData?.id);

  // Delete logic
  const { handleDeleteGuest, handleBulkDelete } = useGuestDeletion({
    invitationId: invitationData?.id,
    selectedGuests,
    clearSelection,
    removeFromSelection,
    openConfirmModal,
  });

  // Lock actions
  const { handleLockToggle, handleBulkUpdateLock } = useLockActions({
    invitationId: invitationData?.id,
    selectedGuests,
    clearSelection,
    openConfirmModal,
    unlockModal: unlock,
  });

  // Edit actions
  const { handleEdit, handleNewGuest, onSaveGuest } = useEditActions({
    invitationId: invitationData?.id,
    currentGuestId,
    handleOpenModal,
    handleCloseModal,
    handleSaveGuest,
  });

  // Error toast
  useEffect(() => {
    if (error) toast(error, "error");
  }, [error, toast]);

  // Derived state
  const stats = useGuestsStats(finalFilteredGuests);
  const isFiltered = finalFilteredGuests.length !== (guests?.length ?? 0);
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

            <GuestsMainSection
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
              selectedGuests={selectedGuests}
              filteredGuests={finalFilteredGuests}
              isLoadingGuests={isLoadingGuests}
              disabled={selectedGuests.size > 0}
              onImportExcel={openImportModal}
              onExportExcel={() => handleExportExcel(guests)}
              onNewGuest={handleNewGuest}
              onSelectGuest={handleSelectGuest}
              onSendReminder={(g) => whatsapp.open(g, "reminder")}
              onEdit={handleEdit}
              onDelete={handleDeleteGuest}
              onSendWhatsApp={(g) => whatsapp.open(g, "initial")}
              onLockToggle={handleLockToggle}
            />
          </main>
        </div>
      </section>

      <FloatingBulkActionsBar
        count={selectedGuests.size}
        isSelectedAll={selectedGuests.size === finalFilteredGuests.length}
        onUpdateLock={handleBulkUpdateLock}
        onDelete={handleBulkDelete}
        onCancel={clearSelection}
        onSelectAll={() => handleSelectAll(finalFilteredGuests)}
      />

      <GuestFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={formData}
        onSubmit={onSaveGuest}
        isEdit={!!currentGuestId}
        onBackdropPress={handleCloseModal}
      />

      <SendWhatsappModal
        isOpen={whatsapp.modal.isOpen}
        type={whatsapp.modal.type}
        guestName={whatsapp.modal.guest?.nombre ?? ""}
        onClose={whatsapp.close}
        onConfirm={whatsapp.handleSubmit}
      />

      <UnlockChangesModal
        isOpen={unlock.modal.isOpen}
        guest={unlock.modal.guest}
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

      <ImportGuestsModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={handleImport}
        isImporting={isImporting}
      />
    </div>
  );
}
