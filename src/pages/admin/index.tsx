import { useState } from "react";
import { Heart } from "lucide-react";
import { Guest } from "../../../types/types";
import { AuthService } from "@/services/authService";
import { GuestService } from "@/services/guestService";
import Header from "@/components/admin/Header";
import BulkActionsBar from "@/components/admin/BulkActionsProps";
import GuestFormModal from "@/components/admin/GuestFormModal";
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

export default function WeddingAdminPanel() {
  const [viewMode, setViewMode] = useState<"list" | "table">("list");

  // Custom hooks
  const { user, loading, guests } = useGuestsData();
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

  const onSaveGuest = (e: React.FormEvent) => {
    handleSaveGuest(e, currentGuestId, formData, handleCloseModal);
  };

  // --- RENDER ---
  if (loading)
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md w-full">
          <Heart className="mx-auto text-yellow-600 mb-4" size={48} />
          <h1 className="text-2xl font-serif text-stone-800 mb-6">
            Boda J&Y Admin
          </h1>
          <button
            onClick={() => AuthService.initAuth()}
            className="w-full bg-stone-900 text-white py-3 rounded-lg"
          >
            Entrar
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-20">
      <Header
        stats={stats}
        guestCount={guests.length}
        onLogout={AuthService.logout}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedGuests.size > 0 ? (
          <BulkActionsBar
            count={selectedGuests.size}
            onUpdateLock={handleBulkUpdateLock}
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
  );
}
