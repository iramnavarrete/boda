import { useEffect, useState } from "react";
import { Guest, WhatsappFilterType } from "@/types";
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
import GuestsTableView from "./GuestTableView";

export default function WeddingAdmin() {
  const invitationData = useInvitationStore((state) => state.invitationData);

  const { guests, isLoadingGuests, error } = useGuestsData(invitationData?.id);
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredGuests, // Lista filtrada por texto y asistencia
    filterCounts,
  } = useGuestsFilter(guests);

  // --- NUEVO ESTADO PARA EL FILTRO DE WHATSAPP ---
  const [whatsappFilter, setWhatsappFilter] =
    useState<WhatsappFilterType>("all");

  // 1. Calculamos los contadores totales para WhatsApp basados en la lista original completa
  const whatsappCounts = {
    all: guests?.length || 0,
    sent: guests?.filter((g: Guest) => g.whatsappEnviado).length || 0,
    not_sent: guests?.filter((g: Guest) => !g.whatsappEnviado).length || 0,
  };

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // 2. Aplicamos la segunda capa de filtrado sobre el resultado del primer filtro
  const finalFilteredGuests = filteredGuests.filter((g: Guest) => {
    if (whatsappFilter === "all") return true;
    if (whatsappFilter === "sent") return g.whatsappEnviado === true;
    if (whatsappFilter === "not_sent") return !g.whatsappEnviado;
    return true;
  });

  // ESTADOS DEL TUTORIAL DE WHATSAPP
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [pendingWappGuest, setPendingWappGuest] = useState<Guest | null>(null);

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

  // 3. Pasamos la lista final (con ambos filtros) a las estadísticas
  const stats = useGuestsStats(finalFilteredGuests);
  const isFiltered = finalFilteredGuests.length !== (guests?.length || 0);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast(error, "error");
    }
  }, [error, toast]);

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

  // Función que intercepta el clic en WhatsApp
  const handleWhatsAppClick = (guest: Guest) => {
    // Validamos en el lado del cliente (para evitar errores de SSR)
    const hasSeenTutorial =
      typeof window !== "undefined"
        ? localStorage.getItem("tutorial_whatsapp_shown")
        : false;

    if (!hasSeenTutorial) {
      // Si es la primera vez, abrimos el modal tutorial
      setPendingWappGuest(guest);
      setIsTutorialOpen(true);
    } else {
      // Si ya lo vio, ejecuta la acción normal
      sendWhatsApp(guest);
      if (invitationData) {
        GuestService.markWhastappSent(invitationData.id, guest);
      }
    }
  };

  const confirmWhatsAppTutorial = () => {
    // Marcamos que ya vio el tutorial
    if (typeof window !== "undefined") {
      localStorage.setItem("tutorial_whatsapp_shown", "true");
    }
    setIsTutorialOpen(false);

    // Ejecutamos la acción pendiente
    if (pendingWappGuest) {
      sendWhatsApp(pendingWappGuest);
      setPendingWappGuest(null);
    }
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

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <SearchAndFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterCounts={filterCounts}
              whatsappFilter={whatsappFilter}
              setWhatsappFilter={setWhatsappFilter}
              whatsappCounts={whatsappCounts}
              onExportExcel={() => handleExportExcel(guests)}
              onNewGuest={() => {
                if (invitationData) {
                  handleOpenModal(invitationData.id);
                }
              }}
              disabled={selectedGuests.size > 0}
              filteredGuestCount={finalFilteredGuests.length} // Actualizado
              setViewMode={setViewMode}
              viewMode={viewMode}
            />
            {viewMode === "grid" ? (
              <GuestsGridView
                filteredGuests={finalFilteredGuests} // Pasamos la lista con todos los filtros combinados
                selectedGuests={selectedGuests}
                onSelectGuest={handleSelectGuest}
                onEdit={(e) => {
                  if (invitationData) {
                    handleOpenModal(invitationData.id, e);
                  }
                }}
                onDelete={handleDeleteGuest}
                onSendWhatsApp={handleWhatsAppClick}
                onLockToggle={handleLockToggle}
                isLoading={isLoadingGuests}
              />
            ) : (
              <GuestsTableView
                filteredGuests={finalFilteredGuests} // Pasamos la lista con todos los filtros combinados
                selectedGuests={selectedGuests}
                onSelectGuest={handleSelectGuest}
                onEdit={(e) => {
                  if (invitationData) {
                    handleOpenModal(invitationData.id, e);
                  }
                }}
                onDelete={handleDeleteGuest}
                onSendWhatsApp={handleWhatsAppClick}
                onLockToggle={handleLockToggle}
                // isLoading={isLoadingGuests}
              />
            )}
          </main>
        </div>
      </section>

      {/* BARRA FLOTANTE DE ACCIONES MASIVAS */}
      <FloatingBulkActionsBar
        count={selectedGuests.size}
        isSelectedAll={selectedGuests.size === finalFilteredGuests.length} // Actualizado
        onUpdateLock={handleBulkUpdateLock}
        onDelete={handleBulkDelete}
        onCancel={clearSelection}
        onSelectAll={() => handleSelectAll(finalFilteredGuests)} // Actualizado
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

      <ConfirmationModal
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          setPendingWappGuest(null);
        }}
        onConfirm={confirmWhatsAppTutorial}
        title="Aviso de Envío"
        message="Al hacer clic en este botón, el invitado se marcará automáticamente como 'WhatsApp enviado'. Asegúrate de enviar correctamente el mensaje desde tu aplicación para evitar diferencias en la información de tu lista."
        confirmText="Entendido, continuar"
      />
    </div>
  );
}
