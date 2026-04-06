import { useEffect, useState } from "react";
import {
  FilterCounts,
  Guest,
  ImportedGuest,
  TagCounts,
  TagFilterType,
  WhatsappCounts,
  WhatsappFilterType,
} from "@/types";
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
import ImportGuestsModal from "./ImportGuestsModal";

export default function WeddingAdmin() {
  const invitationData = useInvitationStore((state) => state.invitationData);

  const { guests, isLoadingGuests, error } = useGuestsData(invitationData?.id);
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredGuests,
  } = useGuestsFilter(guests);

  // --- ESTADOS DE FILTROS ADICIONALES ---
  const [whatsappFilter, setWhatsappFilter] =
    useState<WhatsappFilterType>("all");
  const [tagFilter, setTagFilter] = useState<TagFilterType>("all"); // NUEVO ESTADO
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // --- ESTADOS PARA IMPORTACIÓN ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 3. Aplicamos la segunda capa de filtrado COMBINADA
  const finalFilteredGuests = filteredGuests.filter((g: Guest) => {
    // A. Validar Filtro de WhatsApp
    let passWhatsapp = true;
    if (whatsappFilter === "sent")
      passWhatsapp = !!(g.whatsappEnviado && g.tieneTelefono);
    if (whatsappFilter === "not_sent")
      passWhatsapp = !!(!g.whatsappEnviado && g.tieneTelefono);
    if (whatsappFilter === "empty") passWhatsapp = !g.tieneTelefono;

    // B. Validar Filtro de Etiqueta (NUEVO)
    let passTag = true;
    if (tagFilter !== "all") passTag = g.etiqueta === tagFilter;

    // Solo si pasa AMBAS pruebas (WhatsApp Y Etiqueta) se muestra
    return passWhatsapp && passTag;
  });

  // 1. Contadores para WhatsApp
  const whatsappCounts: WhatsappCounts = {
    all: finalFilteredGuests?.length || 0,
    sent:
      finalFilteredGuests?.filter(
        (g: Guest) => g.whatsappEnviado && g.tieneTelefono,
      ).length || 0,
    not_sent:
      finalFilteredGuests?.filter(
        (g: Guest) => !g.whatsappEnviado && g.tieneTelefono,
      ).length || 0,
    empty:
      finalFilteredGuests?.filter((g: Guest) => !g.tieneTelefono).length || 0,
  };

  // 2. Contadores para Etiquetas (NUEVO)
  const tagCounts: TagCounts = {
    all: finalFilteredGuests?.length || 0,
    Novia:
      finalFilteredGuests?.filter((g: Guest) => g.etiqueta === "Novia")
        .length || 0,
    Novio:
      finalFilteredGuests?.filter((g: Guest) => g.etiqueta === "Novio")
        .length || 0,
    Ambos:
      finalFilteredGuests?.filter((g: Guest) => g.etiqueta === "Ambos")
        .length || 0,
  };

  const filterCounts: FilterCounts = finalFilteredGuests.reduce(
    (acc, curr) => ({
      all: acc.all + 1,
      confirmed: acc.confirmed + (curr.asistencia === true ? 1 : 0),
      rejected: acc.rejected + (curr.asistencia === false ? 1 : 0),
      pending:
        acc.pending +
        (curr.asistencia === null || curr.asistencia === undefined ? 1 : 0),
    }),
    { all: 0, confirmed: 0, rejected: 0, pending: 0 },
  );

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

  const handleImportGuests = async (parsedGuests: ImportedGuest[]) => {
    if (!invitationData?.id) return;

    setIsImporting(true);
    try {
      await GuestService.batchImportGuests(invitationData.id, parsedGuests);
      toast(
        `${parsedGuests.length} invitados importados exitosamente.`,
        "success",
      );
      setIsImportModalOpen(false);
    } catch (e) {
      console.error(e);
      toast("Ocurrió un error al importar los invitados.", "error");
    } finally {
      setIsImporting(false);
    }
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

  const handleWhatsAppClick = (guest: Guest) => {
    const hasSeenTutorial =
      typeof window !== "undefined"
        ? localStorage.getItem("tutorial_whatsapp_shown")
        : false;

    if (!hasSeenTutorial) {
      setPendingWappGuest(guest);
      setIsTutorialOpen(true);
    } else {
      sendWhatsApp(guest);
      if (invitationData) {
        GuestService.markWhastappSent(invitationData.id, guest);
      }
    }
  };

  const confirmWhatsAppTutorial = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tutorial_whatsapp_shown", "true");
    }
    setIsTutorialOpen(false);

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
              // NUEVOS PROPS PARA ETIQUETAS (Deberás agregarlos a tu SearchAndFilterBarProps)
              tagFilter={tagFilter}
              setTagFilter={setTagFilter}
              tagCounts={tagCounts}
              onImportExcel={() => setIsImportModalOpen(true)}
              onExportExcel={() => handleExportExcel(guests)}
              onNewGuest={() => {
                if (invitationData) {
                  handleOpenModal(invitationData.id);
                }
              }}
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
                filteredGuests={finalFilteredGuests}
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

      <ImportGuestsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportGuests}
        isImporting={isImporting}
      />
    </div>
  );
}
