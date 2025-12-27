import { useState } from "react";
import { Guest } from "../../../types/types";
import { AuthService } from "@/services/authService";
import { GuestService } from "@/services/guestService";
import Header from "@/pages/admin/components/Header";
import BulkActionsBar from "@/pages/admin/components/BulkActionsProps";
import GuestFormModal from "@/pages/admin/components/GuestFormModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import SearchAndFilterBar from "./components/SearchAndFilterBar";
import GuestsListView from "./components/GuestsListView";

// Hooks personalizados
import { useGuestsData } from "./hooks/useGuestData";
import { useGuestsFilter } from "./hooks/useGuestFillters";
import { useGuestsSelection } from "./hooks/useGuestSelection";
import { useGuestForm } from "./hooks/useGuestForm";
import { useConfirmModal } from "./hooks/useConfirmModal";
import { useGuestsStats } from "./hooks/useGuestsStats";
import { useGuestActions } from "./hooks/useGuestActions";
import ProtectedPage from "../ProtectedPage";
import { useAuthStore } from "@/stores/authStore";

export default function WeddingAdminPanel() {
  const [viewMode, setViewMode] = useState<"list" | "table">("list");

  // Custom hooks
  const { user } = useAuthStore();
  const { guests } = useGuestsData(user);
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
  const { handleSaveGuest, sendWhatsApp, handleExportExcel } =
    useGuestActions(user);
  const stats = useGuestsStats(guests);

  // --- HANDLERS ---
  const handleBulkUpdateLock = (shouldLock: boolean) => {
    if (!user || selectedGuests.size === 0) return;

    const actionWord = shouldLock ? "Bloquear" : "Permitir";

    openConfirmModal({
      isOpen: true,
      title: `${actionWord} Edición`,
      message: shouldLock
        ? `¿Deseas bloquear la edición para ${selectedGuests.size} invitados? Ya no podrán modificar su mensaje de felicitación ni confirmar cantidad de invitados.`
        : `¿Deseas permitir la edición para ${selectedGuests.size} invitados? Podrán modificar su mensaje de felicitación y confirmar cantidad de invitados.`,
      isDanger: false,
      action: async () => {
        await GuestService.batchUpdateLock(
          Array.from(selectedGuests),
          shouldLock
        );
        clearSelection();
      },
    });
  };

  const handleBulkDelete = () => {
    if (!user || selectedGuests.size === 0) return;
    openConfirmModal({
      isOpen: true,
      title: "Eliminar Múltiples Invitados",
      message: `¿Estás seguro de que deseas eliminar permanentemente a los ${selectedGuests.size} invitados seleccionados? Esta acción no se puede deshacer.`,
      isDanger: true, // Esto pondrá el botón del modal en ROJO
      action: async () => {
        // Llamamos al servicio nuevo
        await GuestService.batchDeleteGuests(Array.from(selectedGuests));
        clearSelection();
      },
    });
  };

  // TODO MOVER ESTO A AL HOOK DE ACTIONS
  const handleDeleteGuest = (guest: Guest) => {
    if (!user) return;

    const { id, nombre } = guest;

    openConfirmModal({
      isOpen: true,
      title: `Eliminar "${nombre}"`,
      message:
        "Esta acción es permanente y no se puede deshacer. ¿Estás seguro de que quieres eliminar este registro?",
      isDanger: true,
      action: async () => {
        await GuestService.deleteGuest(id);
        if (selectedGuests.has(id)) {
          removeFromSelection(id);
        }
      },
    });
  };

  const handleLockToggle = (guest: Guest) => {
    if (!user) return;

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
        await GuestService.toggleGuestLock(guest);
      },
    });
  };

  const onSaveGuest = (e: React.FormEvent) => {
    handleSaveGuest(e, currentGuestId, formData, handleCloseModal);
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-20">
        <Header
          stats={stats}
          guestCount={guests.length}
          onLogout={AuthService.logout}
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {selectedGuests.size > 0 ? (
            <BulkActionsBar
              count={selectedGuests.size}
              onUpdateLock={handleBulkUpdateLock}
              onDelete={handleBulkDelete}
              onCancel={clearSelection}
            />
          ) : (
            <SearchAndFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterCounts={filterCounts}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onExportExcel={() => handleExportExcel(guests)}
              onNewGuest={() => handleOpenModal()}
            />
          )}

          <GuestsListView
            filteredGuests={filteredGuests}
            viewMode={viewMode}
            selectedGuests={selectedGuests}
            onSelectGuest={handleSelectGuest}
            onSelectAll={handleSelectAll}
            onEdit={handleOpenModal}
            onDelete={handleDeleteGuest}
            onSendWhatsApp={sendWhatsApp}
            onLockToggle={handleLockToggle}
          />
        </section>

        <GuestFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSaveGuest}
          isEdit={!!currentGuestId}
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
        />
      </div>
    </ProtectedPage>
  );
}
