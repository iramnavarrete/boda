import { useEffect } from "react";
import { Guest } from "@/types";
import { GuestService } from "@/services/guestService";
import GuestFormModal from "@/features/admin/components/GuestFormModal";
import ConfirmationModal from "@/features/admin/components/ConfirmationModal";
import SearchAndFilterBar from "@/features/admin/components/SearchAndFilterBar";
import GuestsGridView from "@/features/admin/components/GuestsGridView";

// Hooks personalizados
import { useGuestsData } from "@/features/admin/hooks/useGuestData";
import { useGuestsFilter } from "@/features/admin/hooks/useGuestFillters";
import { useGuestsSelection } from "@/features/admin/hooks/useGuestSelection";
import { useGuestForm } from "@/features/admin/hooks/useGuestForm";
import { useConfirmModal } from "@/features/admin/hooks/useConfirmModal";
import { useGuestsStats } from "@/features/admin/hooks/useGuestsStats";
import { useGuestActions } from "@/features/admin/hooks/useGuestActions";
import { useToast } from "@/features/shared/components/Toast";
import FloatingBulkActionsBar from "@/features/admin/components/FloatingBulkActionsBar";
import StatsSidebar from "./StatsSidebar";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

export default function WeddingAdmin() {
  const invitationData = useInvitationStore((state) => state.invitationData);

  const { guests, isLoadingGuests, error } = useGuestsData(invitationData?.id);
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredGuests,
    filterCounts,
  } = useGuestsFilter(guests);
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
  const { handleSaveGuest, sendWhatsApp, handleExportExcel } = useGuestActions(
    invitationData?.id,
  );
  const stats = useGuestsStats(filteredGuests);
  const isFiltered = filteredGuests.length !== guests.length;
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast(error, "error");
    }
  }, [error]);

  // --- HANDLERS ---
  const handleBulkUpdateLock = (shouldLock: boolean) => {
    if (selectedGuests.size === 0) return;

    const actionWord = shouldLock ? "Bloquear" : "Permitir";

    openConfirmModal({
      isOpen: true,
      title: `${actionWord} Edición`,
      message: shouldLock
        ? `¿Deseas bloquear la edición para ${selectedGuests.size} invitados? Ya no podrán modificar su mensaje de felicitación ni confirmar cantidad de invitados.`
        : `¿Deseas permitir la edición para ${selectedGuests.size} invitados? Podrán modificar su mensaje de felicitación y confirmar cantidad de invitados.`,
      isDanger: false,
      action: async () => {
        if (invitationData) {
          await GuestService.batchUpdateLock(
            invitationData.id,
            Array.from(selectedGuests),
            shouldLock,
          );
        }
        clearSelection();
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedGuests.size === 0) return;
    openConfirmModal({
      isOpen: true,
      title: "Eliminar Múltiples Invitados",
      message: `¿Estás seguro de que deseas eliminar permanentemente a los ${selectedGuests.size} invitados seleccionados? Esta acción no se puede deshacer.`,
      isDanger: true,
      action: async () => {
        if (invitationData) {
          await GuestService.batchDeleteGuests(
            invitationData.id,
            Array.from(selectedGuests),
          );
        }
        clearSelection();
      },
    });
  };

  const handleDeleteGuest = (guest: Guest) => {
    const { id, nombre } = guest;

    openConfirmModal({
      isOpen: true,
      title: `Eliminar "${nombre}"`,
      message:
        "Esta acción es permanente y no se puede deshacer. ¿Estás seguro de que quieres eliminar este registro?",
      isDanger: true,
      action: async () => {
        if (invitationData) {
          await GuestService.deleteGuest(invitationData.id, id);
        }
        if (selectedGuests.has(id)) {
          removeFromSelection(id);
        }
      },
    });
  };

  const handleLockToggle = (guest: Guest) => {
    const { nombre } = guest;
    const title = `Deseas ${
      guest.cambiosPermitidos ? "bloquear" : "permitir"
    } edición a "${nombre}"`;

    const message = guest.cambiosPermitidos
      ? `Al hacer esto el invitado NO podrá modificar su mensaje de felicitación ni confirmar cantidad de invitados.`
      : `Esta acción le permitirá al invitado realizar cambios en su mensaje de felicitación o cambiar la cantidad de confirmados.`;

    openConfirmModal({
      isOpen: true,
      title,
      message,
      isDanger: false,
      action: async () => {
        if (invitationData) {
          await GuestService.toggleGuestLock(invitationData.id, guest);
        }
      },
    });
  };

  const onSaveGuest = (e: React.FormEvent) => {
    handleSaveGuest(e, currentGuestId, formData, handleCloseModal);
  };

  return (
    <div>
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col lg:flex-row gap-4 items-start mt-2.5">
          <aside className="w-full lg:w-auto">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1 lg:max-w-[12ch]">
                Personas {(isFiltered || searchTerm !== "") && "(filtrado)"}
              </h3>
              <StatsSidebar stats={stats} />
            </div>
          </aside>
          <main className="flex-1 w-full lg:order-1 min-w-0">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">
              Familias {(isFiltered || searchTerm !== "") && "(filtrado)"}
            </h3>
            {/* BARRA DE BÚSQUEDA Y FILTROS (Siempre visible) */}
            <SearchAndFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterCounts={filterCounts}
              onExportExcel={() => handleExportExcel(guests)}
              onNewGuest={() => {
                if (invitationData) {
                  handleOpenModal(invitationData.id);
                }
              }}
              disabled={selectedGuests.size > 0}
              filteredGuestCount={filteredGuests.length}
            />

            <GuestsGridView
              filteredGuests={filteredGuests}
              selectedGuests={selectedGuests}
              onSelectGuest={handleSelectGuest}
              onEdit={(e) => {
                if (invitationData) {
                  handleOpenModal(invitationData.id, e);
                }
              }}
              onDelete={handleDeleteGuest}
              onSendWhatsApp={sendWhatsApp}
              onLockToggle={handleLockToggle}
              isLoading={isLoadingGuests}
            />
          </main>
        </div>
      </section>

      {/* BARRA FLOTANTE DE ACCIONES MASIVAS */}
      <FloatingBulkActionsBar
        count={selectedGuests.size}
        isSelectedAll={selectedGuests.size === filteredGuests.length}
        onUpdateLock={handleBulkUpdateLock}
        onDelete={handleBulkDelete}
        onCancel={clearSelection}
        onSelectAll={() => handleSelectAll(filteredGuests)}
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
    </div>
  );
}
