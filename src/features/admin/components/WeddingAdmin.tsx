"use client";
import { useEffect, useState } from "react";
import { Guest } from "@/types";
import { AuthService } from "@/services/authService";
import { GuestService } from "@/services/guestService";
import Header from "@/features/admin/components/Header";
// Reemplazamos la barra antigua por la nueva flotante
import GuestFormModal from "@/features/admin/components/GuestFormModal";
import ConfirmationModal from "@/features/admin/components/ConfirmationModal";
import SearchAndFilterBar from "@/features/admin/components/SearchAndFilterBar";
import GuestsListView from "@/features/admin/components/GuestsListView";

// Hooks personalizados
import { useGuestsData } from "@/features/admin/hooks/useGuestData";
import { useGuestsFilter } from "@/features/admin/hooks/useGuestFillters";
import { useGuestsSelection } from "@/features/admin/hooks/useGuestSelection";
import { useGuestForm } from "@/features/admin/hooks/useGuestForm";
import { useConfirmModal } from "@/features/admin/hooks/useConfirmModal";
import { useGuestsStats } from "@/features/admin/hooks/useGuestsStats";
import { useGuestActions } from "@/features/admin/hooks/useGuestActions";
import { useToast } from "@/features/shared/components/Toast";
import { useAuthUser } from "@/features/shared/contexts/AuthUserContext";
import FloatingBulkActionsBar from "@/features/admin/components/FloatingBulkActionsBar";
import { useParams } from "next/navigation";

export default function WeddingAdmin() {
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const params = useParams();
  const invitationId = params.invitationId as string;
  const user = useAuthUser();

  const { guests, isLoadingGuests, error } = useGuestsData(invitationId, user);
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
        await GuestService.batchUpdateLock(
          invitationId,
          Array.from(selectedGuests),
          shouldLock
        );
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
        await GuestService.batchDeleteGuests(
          invitationId,
          Array.from(selectedGuests)
        );
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
        await GuestService.deleteGuest(invitationId, id);
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
        await GuestService.toggleGuestLock(invitationId, guest);
      },
    });
  };

  const onSaveGuest = (e: React.FormEvent) => {
    handleSaveGuest(e, currentGuestId, formData, handleCloseModal);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-20 relative">
      <Header
        stats={stats}
        guestCount={guests.length}
        onLogout={AuthService.logout}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* BARRA DE BÚSQUEDA Y FILTROS (Siempre visible) */}
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
          disabled={selectedGuests.size > 0}
        />

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
          isLoading={isLoadingGuests}
        />
      </section>

      {/* BARRA FLOTANTE DE ACCIONES MASIVAS */}
      <FloatingBulkActionsBar
        count={selectedGuests.size}
        onUpdateLock={handleBulkUpdateLock}
        onDelete={handleBulkDelete}
        onCancel={clearSelection}
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
      />
    </div>
  );
}
