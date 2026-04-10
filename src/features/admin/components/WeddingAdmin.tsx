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
import SendWhatsappModal from "./SendWhatsappModal";
import UnlockChangesModal from "./UnlockChangesModal";

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

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [whatsappModalType, setWhatsappModalType] = useState<
    "initial" | "reminder"
  >("initial");
  const [activeWhatsappGuest, setActiveWhatsappGuest] = useState<Guest | null>(
    null,
  );

  // NUEVO ESTADO PARA EL MODAL DE DESBLOQUEO
  const [unlockModal, setUnlockModal] = useState<{
    isOpen: boolean;
    guest: Guest | null;
    isBulk: boolean;
  }>({ isOpen: false, guest: null, isBulk: false });

  // --- 🪄 VIGILANTE AUTOMÁTICO DE FECHAS VENCIDAS ---
  useEffect(() => {
    if (!guests || guests.length === 0 || !invitationData?.id) return;

    const dateFormatted = new Date().toLocaleDateString("en-CA");

    // Buscar invitados que aún tengan cambios permitidos pero su fecha ya haya pasado
    const expiredGuests = guests.filter(
      (g: Guest) =>
        g.cambiosPermitidos === true &&
        g.fechaLimiteConfirmacion &&
        g.fechaLimiteConfirmacion < dateFormatted,
    );

    if (expiredGuests.length > 0) {
      const guestIds = expiredGuests.map((g: Guest) => g.id);
      GuestService.batchUpdateLock(invitationData.id, guestIds, true);
    }
  }, [guests, invitationData?.id]);

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
  const stats = useGuestsStats(finalFilteredGuests);
  const isFiltered = finalFilteredGuests.length !== (guests?.length || 0);

  useEffect(() => {
    if (error) toast(error, "error");
  }, [error, toast]);

  // --- HANDLERS ACTUALIZADOS PARA BLOQUEO/DESBLOQUEO ---
  const handleBulkUpdateLock = (shouldLock: boolean) => {
    if (selectedGuests.size === 0) return;

    if (shouldLock) {
      openConfirmModal({
        isOpen: true,
        title: `Bloquear Edición`,
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
      // Pedimos fecha nueva para el desbloqueo masivo
      setUnlockModal({ isOpen: true, guest: null, isBulk: true });
    }
  };

  const handleLockToggle = (guest: Guest) => {
    if (guest.cambiosPermitidos) {
      openConfirmModal({
        isOpen: true,
        title: `Bloquear edición a "${guest.nombre}"`,
        message: `Al hacer esto el invitado NO podrá modificar su mensaje de felicitación ni confirmar cantidad de invitados.`,
        isDanger: false,
        action: async () => {
          if (invitationData) {
            await GuestService.toggleGuestLock(invitationData.id, guest, true);
          }
        },
      });
    } else {
      setUnlockModal({ isOpen: true, guest, isBulk: false });
    }
  };

  const executeUnlockDate = async (newDate: string | null) => {
    if (!invitationData?.id) return;
    try {
      if (unlockModal.isBulk) {
        await GuestService.batchUpdateLock(
          invitationData.id,
          Array.from(selectedGuests),
          false,
          newDate || undefined,
        );
        clearSelection();
        toast(
          `Edición habilitada para ${selectedGuests.size} invitados.`,
          "success",
        );
      } else if (unlockModal.guest) {
        await GuestService.toggleGuestLock(
          invitationData.id,
          unlockModal.guest,
          false,
          newDate || undefined,
        );
        toast(
          `Edición habilitada para ${unlockModal.guest.nombre}.`,
          "success",
        );
      }
    } catch (e) {
      toast("Error al habilitar la edición.", "error");
    } finally {
      setUnlockModal({ isOpen: false, guest: null, isBulk: false });
    }
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
    openConfirmModal({
      isOpen: true,
      title: `Eliminar "${guest.nombre}"`,
      message:
        "Esta acción es permanente y no se puede deshacer. ¿Estás seguro de que quieres eliminar este registro?",
      isDanger: true,
      action: async () => {
        if (invitationData) {
          await GuestService.deleteGuest(invitationData.id, guest.id);
        }
        if (selectedGuests.has(guest.id)) {
          removeFromSelection(guest.id);
        }
      },
    });
  };

  const onSaveGuest = (e: React.FormEvent) => {
    handleSaveGuest(e, currentGuestId, formData, handleCloseModal);
  };

  // --- LÓGICA WHATSAPP ACTUALIZADA ---
  const handleWhatsAppClick = (guest: Guest) => {
    setActiveWhatsappGuest(guest);
    setWhatsappModalType("initial");
    setIsWhatsappModalOpen(true);
  };

  const handleOpenReminderModal = (guest: Guest) => {
    setActiveWhatsappGuest(guest);
    setWhatsappModalType("reminder");
    setIsWhatsappModalOpen(true);
  };

  const handleWhatsappSubmit = (dateStr: string | null, autoBlock: boolean) => {
    if (whatsappModalType === "initial") {
      handleSendInitialWhatsApp(dateStr, autoBlock);
    } else {
      handleSendReminder(dateStr, autoBlock);
    }
  };

    const handleSendInitialWhatsApp = async (
      dateStr: string | null,
      autoBlock: boolean,
    ) => {
      if (!activeWhatsappGuest || !invitationData?.id) return;

      const dateSentence = dateStr
        ? `\n\nPor favor, ayúdanos a confirmar tu asistencia a más tardar el día ${new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long" })}.`
        : "";

      const invitationLink = `https://jninvitaciones.com/i/${invitationData.id}?guest=${activeWhatsappGuest.id}`;
      const sparkle = String.fromCodePoint(0x2728);
      const letter = String.fromCodePoint(0x1f48c);

      const msg = `¡Hola ${activeWhatsappGuest.nombre}!\n${sparkle} Les enviamos el enlace de su invitación digital. ${sparkle}\nNos encantaría que nos acompañen en este día tan importante.\n${letter} La confirmación será únicamente para la recepción, cada invitado cuenta con un lugar asignado. Reservamos ${activeWhatsappGuest.invitados} lugares en su nombre${dateSentence}\n${invitationLink}`;

      try {
        const contactInfo = await GuestService.getGuestContactInfo(
          invitationData.id,
          activeWhatsappGuest.id,
        );
        const telefono = contactInfo?.telefono;

        if (!telefono) {
          toast("No se encontró el celular de este invitado", "error");
          return;
        }

        const phoneFormatted = telefono.replace(/\+/g, "").replace(/\s/g, "");
        window.open(
          `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${encodeURIComponent(msg)}`,
          "_blank",
        );

        // Guardamos en la base de datos que se envió y la fecha límite SOLO si hay fecha y autoBlock es true
        GuestService.markWhastappSent(
          invitationData.id,
          activeWhatsappGuest,
          autoBlock && dateStr ? dateStr : undefined,
        );

        setIsWhatsappModalOpen(false);
        setActiveWhatsappGuest(null);
      } catch (error) {
        toast("Error al intentar abrir WhatsApp", "error");
      }
    };

    const handleSendReminder = async (
      dateStr: string | null,
      autoBlock: boolean,
    ) => {
      if (!activeWhatsappGuest || !invitationData?.id) return;

      const dateSentence = dateStr
        ? ` La confirmación (o cualquier cambio) podrás realizarla hasta el día ${new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long" })}. Dado que el lugar es limitado, si no recibimos tu confirmación antes de esa fecha, el espacio será asignado a otra persona.`
        : ` Dado que el lugar es limitado, te pedimos de favor confirmarnos lo antes posible para poder organizar las mesas.`;

      const instaLink = `https://www.instagram.com/reel/DNyrQW6XuMO/?igsh=cGI1andwYzhkcWRy`;

      const sparkle = String.fromCodePoint(0x2728);
      const heart = String.fromCodePoint(0x1f496);
      const tada = String.fromCodePoint(0x1f389);

      const msg = `${sparkle} Queridos ${activeWhatsappGuest.nombre} ${sparkle}\nQueremos recordarte que aún no hemos recibido tu confirmación de asistencia para nuestro evento.${dateSentence} Tu respuesta es muy importante para nosotros ${heart}\n¡Esperamos contar contigo en este día tan especial! ${tada}\n\n${instaLink}`;

      try {
        const contactInfo = await GuestService.getGuestContactInfo(
          invitationData.id,
          activeWhatsappGuest.id,
        );
        const telefono = contactInfo?.telefono;

        if (!telefono) {
          toast("No se encontró el celular de este invitado", "error");
          return;
        }

        const phoneFormatted = telefono.replace(/\+/g, "").replace(/\s/g, "");
        window.open(
          `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${encodeURIComponent(msg)}`,
          "_blank",
        );

        // Guardamos en la base de datos SOLO si hay fecha y autoBlock es true
        GuestService.markReminderAsSent(
          invitationData.id,
          activeWhatsappGuest,
          autoBlock && dateStr ? dateStr : undefined,
        );

        setIsWhatsappModalOpen(false);
        setActiveWhatsappGuest(null);
      } catch (error) {
        toast("Error al intentar abrir WhatsApp", "error");
      }
    };


  return (
    <div className="bg-[#F9F7F2] min-h-screen font-sans text-[#2C2C29]">
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col lg:flex-row gap-4 items-start mt-2.5">
          <aside className="w-full lg:w-auto">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1 ml-1 lg:max-w-[12ch]">
                Personas {(isFiltered || searchTerm !== "") && "(filtrado)"}
              </h3>
              <StatsSidebar stats={stats} />
            </div>
          </aside>
          <main className="flex-1 w-full lg:order-1 min-w-0">
            <h3 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1 ml-1">
              Familias {(isFiltered || searchTerm !== "") && "(filtrado)"}
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
              onImportExcel={() => setIsImportModalOpen(true)}
              onExportExcel={() => handleExportExcel(guests)}
              onNewGuest={() => {
                if (invitationData) handleOpenModal(invitationData.id);
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
                onSendReminder={handleOpenReminderModal}
                onEdit={(e) => {
                  if (invitationData) handleOpenModal(invitationData.id, e);
                }}
                onDelete={handleDeleteGuest}
                onSendWhatsApp={handleWhatsAppClick}
                onLockToggle={handleLockToggle}
                isLoading={isLoadingGuests}
              />
            ) : (
              <GuestsTableView
                filteredGuests={finalFilteredGuests}
                onSendReminder={handleOpenReminderModal}
                selectedGuests={selectedGuests}
                onSelectGuest={handleSelectGuest}
                onEdit={(e) => {
                  if (invitationData) handleOpenModal(invitationData.id, e);
                }}
                onDelete={handleDeleteGuest}
                onSendWhatsApp={handleWhatsAppClick}
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
        isOpen={isWhatsappModalOpen}
        type={whatsappModalType}
        guestName={activeWhatsappGuest?.nombre || ""}
        onClose={() => {
          setIsWhatsappModalOpen(false);
          setActiveWhatsappGuest(null);
        }}
        onConfirm={handleWhatsappSubmit}
      />

      <UnlockChangesModal
        isOpen={unlockModal.isOpen}
        guest={unlockModal.guest}
        isBulk={unlockModal.isBulk}
        onClose={() =>
          setUnlockModal({ isOpen: false, guest: null, isBulk: false })
        }
        onConfirm={executeUnlockDate}
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
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportGuests}
        isImporting={isImporting}
      />
    </div>
  );
}
