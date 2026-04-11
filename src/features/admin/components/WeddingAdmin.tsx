import { useCallback, useEffect, useState } from "react";
import { Guest, TagFilterType, WhatsappFilterType } from "@/types";
import GuestFormModal from "@/features/admin/components/GuestFormModal";
import ConfirmationModal from "@/features/admin/components/ConfirmationModal";
import SearchAndFilterBar from "@/features/admin/components/SearchAndFilterBar";
import GuestsGridView from "@/features/admin/components/GuestsGridView";
import FloatingBulkActionsBar from "@/features/admin/components/FloatingBulkActionsBar";
import GuestsTableView from "./GuestTableView";
import ImportGuestsModal from "./ImportGuestsModal";
import SendWhatsappModal from "./SendWhatsappModal";
import UnlockChangesModal from "./UnlockChangesModal";
import StatsSidebar from "./StatsSidebar";

// Hooks
import { useGuestsData } from "@/features/admin/hooks/useGuestData";
import { useGuestsFilter } from "@/features/admin/hooks/useGuestFillters";
import { useGuestsSelection } from "@/features/admin/hooks/useGuestSelection";
import { useGuestForm } from "@/features/admin/hooks/useGuestForm";
import { useConfirmModal } from "@/features/admin/hooks/useConfirmModal";
import { useGuestsStats } from "@/features/admin/hooks/useGuestsStats";
import { useGuestActions } from "@/features/admin/hooks/useGuestActions";
import { useToast } from "@/features/shared/components/Toast";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { GuestService } from "@/services/guestService";
import { useExpiredGuestsWatcher } from "@/features/admin/hooks/useExpiredGuestsWatcher";
import { useGuestFiltersAndCounts } from "@/features/admin/hooks/useGuestFiltersAndCounts";
import { useWhatsappModal } from "@/features/admin/hooks/useWhatsappModal";
import { useUnlockModal } from "@/features/admin/hooks/useUnlockModal";
import { useGuestDeletion } from "@/features/admin/hooks/useGuestDeletion";
import { useGuestImport } from "@/features/admin/hooks/useGuestImport";

export default function WeddingAdmin() {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { toast } = useToast();

  const { guests, isLoadingGuests, error } = useGuestsData(invitationData?.id);
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredGuests,
  } = useGuestsFilter(guests);

  const [whatsappFilter, setWhatsappFilter] =
    useState<WhatsappFilterType>("all");
  const [tagFilter, setTagFilter] = useState<TagFilterType>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const {
    selectedGuests,
    handleSelectGuest,
    handleSelectAll,
    clearSelection,
    removeFromSelection,
  } = useGuestsSelection();

  const {
    isModalOpen,
    currentGuestId,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
  } = useGuestForm();

  const {
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    handleExecuteConfirmation,
  } = useConfirmModal();

  const { handleSaveGuest, handleExportExcel } = useGuestActions(
    invitationData?.id,
  );

  // ─── Hooks nuevos ─────────────────────────────────────────────────────────

  useExpiredGuestsWatcher(guests, invitationData?.id);

  const { finalFilteredGuests, filterCounts, whatsappCounts, tagCounts } =
    useGuestFiltersAndCounts(filteredGuests, whatsappFilter, tagFilter);

  const whatsapp = useWhatsappModal(invitationData?.id);

  const unlock = useUnlockModal(
    invitationData?.id,
    selectedGuests,
    clearSelection,
  );

  const { handleDeleteGuest, handleBulkDelete } = useGuestDeletion({
    invitationId: invitationData?.id,
    selectedGuests,
    clearSelection,
    removeFromSelection,
    openConfirmModal,
  });

  const {
    isImportModalOpen,
    isImporting,
    openImportModal,
    closeImportModal,
    handleImport,
  } = useGuestImport(invitationData?.id);

  // ─── Lock / Unlock ────────────────────────────────────────────────────────

  const handleLockToggle = useCallback(
    (guest: Guest) => {
      if (guest.cambiosPermitidos) {
        openConfirmModal({
          isOpen: true,
          title: `Bloquear edición a "${guest.nombre}"`,
          message: `Al hacer esto el invitado NO podrá modificar su mensaje de felicitación ni confirmar cantidad de invitados.`,
          isDanger: false,
          action: async () => {
            if (invitationData) {
              await GuestService.toggleGuestLock(
                invitationData.id,
                guest,
                true,
              );
            }
          },
        });
      } else {
        unlock.openForGuest(guest);
      }
    },
    [invitationData, openConfirmModal, unlock],
  );

  const handleBulkUpdateLock = useCallback(
    (shouldLock: boolean) => {
      if (selectedGuests.size === 0) return;

      if (shouldLock) {
        openConfirmModal({
          isOpen: true,
          title: "Bloquear Edición",
          message: `¿Deseas bloquear la edición para ${selectedGuests.size} invitados? Ya no podrán modificar su mensaje de felicitación ni confirmar cantidad de invitados.`,
          isDanger: false,
          action: async () => {
            if (invitationData) {
              await GuestService.batchUpdateLock(
                invitationData.id,
                Array.from(selectedGuests),
                true,
              );
            }
            clearSelection();
          },
        });
      } else {
        unlock.openForBulk();
      }
    },
    [selectedGuests, invitationData, openConfirmModal, clearSelection, unlock],
  );

  // ─── Edición ──────────────────────────────────────────────────────────────

  const handleEdit = useCallback(
    (guest: Guest) => {
      if (invitationData) handleOpenModal(invitationData.id, guest);
    },
    [invitationData, handleOpenModal],
  );

  const handleNewGuest = useCallback(() => {
    if (invitationData) handleOpenModal(invitationData.id);
  }, [invitationData, handleOpenModal]);

  const onSaveGuest = useCallback(
    (e: React.FormEvent) =>
      handleSaveGuest(e, currentGuestId, formData, handleCloseModal),
    [handleSaveGuest, currentGuestId, formData, handleCloseModal],
  );

  // ─── Efectos globales ─────────────────────────────────────────────────────

  useEffect(() => {
    if (error) toast(error, "error");
  }, [error, toast]);

  // ─── Render ───────────────────────────────────────────────────────────────

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
                Personas {isFilterActive && "(filtrado)"}
              </h3>
              <StatsSidebar stats={stats} />
            </div>
          </aside>

          <main className="flex-1 w-full lg:order-1 min-w-0">
            <h3 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1 ml-1">
              Familias {isFilterActive && "(filtrado)"}
            </h3>

            <SearchAndFilterBar
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
              onImportExcel={openImportModal}
              onExportExcel={() => handleExportExcel(guests)}
              onNewGuest={handleNewGuest}
              disabled={selectedGuests.size > 0}
              filteredGuestCount={finalFilteredGuests.length}
              setViewMode={setViewMode}
              viewMode={viewMode}
            />

            {viewMode === "grid" ? (
              <GuestsGridView
                filteredGuests={finalFilteredGuests}
                selectedGuests={selectedGuests}
                onSelectGuest={handleSelectGuest}
                onSendReminder={(g) => whatsapp.open(g, "reminder")}
                onEdit={handleEdit}
                onDelete={handleDeleteGuest}
                onSendWhatsApp={(g) => whatsapp.open(g, "initial")}
                onLockToggle={handleLockToggle}
                isLoading={isLoadingGuests}
              />
            ) : (
              <GuestsTableView
                filteredGuests={finalFilteredGuests}
                selectedGuests={selectedGuests}
                onSelectGuest={handleSelectGuest}
                onSendReminder={(g) => whatsapp.open(g, "reminder")}
                onEdit={handleEdit}
                onDelete={handleDeleteGuest}
                onSendWhatsApp={(g) => whatsapp.open(g, "initial")}
                onLockToggle={handleLockToggle}
              />
            )}
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
        formData={formData}
        setFormData={setFormData}
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
