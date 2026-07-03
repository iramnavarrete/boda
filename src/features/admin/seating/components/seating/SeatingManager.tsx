"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LayoutTemplate,
  Users,
  Loader2,
  Save,
  GripVertical,
  Sparkles,
} from "lucide-react";
import {
  ElementType,
  FamilyElement,
  useSeatingStore,
} from "../../stores/useSeatingStore";
import { SeatingService } from "../../services/seatingService";
import { useZoomStore } from "../../stores/useZoomStore";
import GuestAssignmentSidebar from "../sidebar/GuestAssignmentSidebar";
import { useEventPermissions } from "@/features/admin/hooks/useEventPermissions";
import SeatingCanvas from "../canvas/SeatingCanvas";
import { FamiliesService } from "@/services/familiesService";
import { SeatingModalContext } from "../SeatingModalContext";
import ConfirmationModal from "@/features/admin/components/ConfirmationModal";
import { useConfirmModal } from "@/features/admin/hooks/useConfirmModal";
import ElementsPalette from "./ElementsPalette";
import LayoutSetupModal from "../canvas/LayoutSetupModal";
import { GuestSeat } from "@/types";
import MobileFallback from "./MobileFallback";

export type DragItemData =
  | {
      type: "palette_element";
      elementType: ElementType;
      width: number;
      height: number;
      seats: number;
      label: string;
    }
  | {
      type: "palette_layout";
      elementType: "custom_layout";
      width: number;
      height: number;
      seats: number;
      label: string;
    }
  | { type: "element" }
  | {
      type: "guest";
      guest: GuestSeat & { familyName?: string; index?: number };
    }
  | { type: "family"; family: FamilyElement }
  | Record<string, unknown>;

interface SeatingManagerProps {
  invitationId: string;
}

export default function SeatingManager({ invitationId }: SeatingManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const {
    updateElementPosition,
    updateMultipleElementPositions,
    assignGuestToTable,
    assignFamilyToTable,
    addElement,
    elements,
    families,
    showToast,
    toastMsg,
    initialize,
    isInitialized,
    hasUnsavedChanges,
    markSaved,
    executeRemoveSeat,
    executeDeleteFamily,
    executeAddSeatToFamily,
  } = useSeatingStore();

  const { zoom } = useZoomStore();

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [layoutSetup, setLayoutSetup] = useState<{
    isOpen: boolean;
    dropX: number;
    dropY: number;
  } | null>(null);

  const { isAdminOrHost } = useEventPermissions(invitationId);
  const {
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    handleExecuteConfirmation,
  } = useConfirmModal();

  const [activeDragItem, setActiveDragItem] = useState<{
    id: string;
    type: string | undefined;
    data: DragItemData | null;
  } | null>(null);

  // CARGA INICIAL
  useEffect(() => {
    if (!isAdminOrHost || !invitationId) return;

    let unsubscribe = () => {};

    async function initRealtime() {
      const dbElements = await SeatingService.getPlan(invitationId);

      unsubscribe = FamiliesService.subscribeToFamilies(
        invitationId,
        async (rawFamilies) => {
          const formattedFamilies =
            await SeatingService.formatFamiliesToFamiliesSeats(
              invitationId,
              rawFamilies,
            );

          if (!useSeatingStore.getState().isInitialized) {
            initialize(dbElements, formattedFamilies);
          } else {
            // Actualización en tiempo real con purga de fantasmas
            useSeatingStore.getState().updateFamilies(formattedFamilies);
          }
        },
        (error) => {
          console.error("Error en la suscripción de invitados:", error);
          showToast("Error al sincronizar invitados en tiempo real.");
        },
      );
    }

    initRealtime();
    return () => unsubscribe();
  }, [invitationId, isAdminOrHost, initialize, showToast]);

  const triggerSeatRemoval = (familyId: string, guestId: string) => {
    const family = families.find((f) => f.id === familyId);
    if (!family) return;

    if (family.guests.length === 1) {
      openConfirmModal({
        isOpen: true,
        showConfirmToast: false,
        title: "⚠️ Eliminar último asiento",
        message: `Estás por eliminar el último asiento disponible para "${family.name}". Esta acción eliminará por completo a la familia del sistema de invitados de forma permanente.\n\nRecuerda que si lo deseas, puedes volver a crear esta familia más adelante desde el panel de Invitados principales.\n\n¿Deseas continuar?`,
        isDanger: true,
        action: async () => {
          await executeDeleteFamily(invitationId, familyId);
          showToast(`Familia "${family.name}" eliminada correctamente.`);
        },
      });
      return;
    }

    let title = "Eliminar asiento declinado";
    let message = `¿Deseas eliminar este asiento declinado de forma permanente y liberar el lugar en el plano?\n\n💡 Nota: No te preocupes, si este invitado cambia de opinión, podrás agregar nuevos asientos a "${family.name}" más adelante usando el botón de "+" en el listado de invitados.`;
    const isDanger = true;

    if (family.deadline && family.allowChanges) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [year, month, day] = family.deadline.split("-").map(Number);
      const deadlineDate = new Date(year, month - 1, day);
      deadlineDate.setHours(0, 0, 0, 0);
      title = "⚠️ Fecha límite no superada";
      message = `La fecha límite de confirmación para este invitado AÚN NO HA PASADO. El invitado podría cambiar de opinión y confirmar su asistencia.\n\nSi eliminas este asiento, reducirás su número total de invitados permitidos en el sistema.\n\n¿Estás completamente seguro de que deseas eliminar este asiento?\n\n💡 Nota: Si continúas, podrás revertir esto agregando un asiento extra manualmente a "${family.name}" en el futuro.`;
    } else if (family.allowChanges) {
      title = "⚠️ Sin fecha límite";
      message = `Este invitado no tiene fecha límite de confirmación asignada. Podría cambiar su estado de asistencia.\n\n¿Estás seguro de que deseas eliminar este asiento y reducir el número de invitados de esta familia?\n\n💡 Nota: Podrás agregar nuevos asientos a "${family.name}" más adelante si lo requieres.`;
    }

    openConfirmModal({
      showConfirmToast: false,
      isOpen: true,
      title,
      message,
      isDanger,
      action: async () => {
        await executeRemoveSeat(invitationId, familyId, guestId);
        showToast("Asiento eliminado correctamente");
      },
    });
  };

  const triggerFamilyRemoval = (familyId: string) => {
    const family = families.find((f) => f.id === familyId);
    if (!family) return;

    openConfirmModal({
      showConfirmToast: false,
      isOpen: true,
      title: `Eliminar grupo familiar`,
      message: `¿Estás seguro de que deseas eliminar a la familia "${family.name}" junto con todos sus (${family.guests.length}) asientos del sistema de forma permanente?`,
      isDanger: true,
      action: async () => {
        await executeDeleteFamily(invitationId, familyId);
        showToast(`Familia "${family.name}" eliminada correctamente.`);
      },
    });
  };

  const triggerAddSeat = async (familyId: string) => {
    try {
      await executeAddSeatToFamily(invitationId, familyId);
      showToast("Asiento agregado exitosamente.");
    } catch (err) {
      console.log(err, "ERROR AL AGREGAR");
      showToast("No se pudo agregar el asiento.");
    }
  };

  const handleGlobalSave = async () => {
    if (!invitationId || !hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      await SeatingService.savePlan(invitationId, elements);
      markSaved();
      showToast("Todos los cambios guardados correctamente.");
    } catch (error) {
      console.error(error);
      showToast("Error al guardar los cambios en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      const tableCollision = pointerCollisions.find((c) =>
        String(c.id).startsWith("table-"),
      );
      if (tableCollision) return [tableCollision];
      return pointerCollisions;
    }
    return rectIntersection(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem({
      id: String(event.active.id),
      type: event.active.data.current?.type,
      data: event.active.data.current as DragItemData,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;

    if (active.data.current?.type === "palette_layout") {
      if (over?.id === "palette-area" || over?.id === "guests-area") {
        showToast("Arrastra la plantilla hacia el área del plano.");
        return;
      }

      const canvasEl = document.querySelector(".canvas-droppable-area");
      let dropX = 800;
      let dropY = 500;

      if (canvasEl && active.rect.current.translated) {
        const rect = canvasEl.getBoundingClientRect();
        dropX = (active.rect.current.translated.left - rect.left) / zoom;
        dropY = (active.rect.current.translated.top - rect.top) / zoom;
      }

      setLayoutSetup({ isOpen: true, dropX, dropY });
      return;
    }

    if (active.data.current?.type === "palette_element") {
      if (over?.id === "palette-area" || over?.id === "guests-area") {
        showToast("Arrastra el elemento hacia el área del plano.");
        return;
      }

      const d = active.data.current as Extract<
        DragItemData,
        { type: "palette_element" }
      >;
      const isTable = d.seats > 0;
      const tablesCount = elements.filter((e) => e.seats > 0).length + 1;
      const alias = isTable ? `Mesa ${tablesCount}` : d.label;

      const canvasEl = document.querySelector(".canvas-droppable-area");
      let dropX = 400;
      let dropY = 300;

      if (canvasEl && active.rect.current.translated) {
        const rect = canvasEl.getBoundingClientRect();
        dropX = (active.rect.current.translated.left - rect.left) / zoom;
        dropY = (active.rect.current.translated.top - rect.top) / zoom;
      }

      addElement(
        {
          id: `${d.elementType}-${Date.now()}`,
          type: d.elementType,
          x: Math.max(0, dropX),
          y: Math.max(0, dropY),
          width: d.width,
          height: d.height,
          seats: d.seats,
        },
        alias,
      );
      return;
    }

    if (active.data.current?.type === "element") {
      if (over?.id === "palette-area" || over?.id === "guests-area") {
        showToast("No puedes mover el elemento fuera del plano.");
        return;
      }

      const delta = event.delta;
      if (delta.x !== 0 || delta.y !== 0) {
        const id = String(active.id).replace("element-", "");

        const currentSelectedIds =
          useSeatingStore.getState().selectedElementIds;
        if (currentSelectedIds.length > 1 && currentSelectedIds.includes(id)) {
          updateMultipleElementPositions(
            currentSelectedIds,
            delta.x / zoom,
            delta.y / zoom,
          );
        } else {
          const element = useSeatingStore
            .getState()
            .elements.find((e) => e.id === id);
          if (element) {
            updateElementPosition(
              id,
              element.x + delta.x / zoom,
              element.y + delta.y / zoom,
            );
          }
        }
      }
      return;
    }

    if (over?.data.current?.type === "table") {
      const tableId = String(over.id).replace("table-", "");
      const activeType = active.data.current?.type;
      const table = elements.find((e) => e.id === tableId);
      if (!table) return;

      if (table.seats === 0) {
        if (activeType === "guest" || activeType === "family")
          showToast(
            "No puedes asignar invitados a elementos que no sean mesas.",
          );
        return;
      }

      if (activeType === "guest") {
        const availableSeats =
          table.seats - table.assignedSeats.filter(Boolean).length;

        if (availableSeats <= 0) {
          showToast("No se pudo asignar. La mesa ya está llena.");
          return;
        }
        assignGuestToTable(tableId, String(active.id).replace("guest-", ""));
      } else if (activeType === "family") {
        const familyId = String(active.id).replace("family-", "");
        const family = useSeatingStore
          .getState()
          .families.find((f) => f.id === familyId);

        if (family) {
          const guestIds = family.guests.map((g) => g.id);

          const occupiedByOthers = table.assignedSeats.filter(
            (id) => !!id && !guestIds.includes(id),
          ).length;

          const actualAvailableSeats = table.seats - occupiedByOthers;

          if (actualAvailableSeats <= 0) {
            showToast("No se pudo asignar a la familia. La mesa está llena.");
            return;
          }

          if (family.guests.length > actualAvailableSeats) {
            showToast(
              `Solo se asignaron ${actualAvailableSeats} lugares porque la mesa se llenó.`,
            );
          }

          assignFamilyToTable(tableId, familyId);
        }
      }
    }
  };

  if (!isAdminOrHost) {
    return (
      <div className="flex h-[calc(100svh-4rem-1px)] items-center justify-center bg-[#F9F7F2] rounded-2xl border border-red-200">
        <div className="text-center text-red-800">
          <AlertCircle className="mx-auto mb-2 text-red-500" size={32} />
          <h2 className="font-serif text-lg font-bold">Acceso Denegado</h2>
          <p className="text-sm">
            Solo el Host o Administradores pueden gestionar mesas.
          </p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex flex-col h-[calc(100svh-4rem-1px)] items-center justify-center bg-[#F9F7F2] rounded-2xl">
        <Loader2 className="animate-spin text-[#C5A669] mb-4" size={32} />
        <span className="text-sm font-medium text-[#A8A29E] uppercase tracking-widest">
          Cargando Plano y Familias...
        </span>
      </div>
    );
  }

  return (
    <SeatingModalContext.Provider
      value={{ triggerSeatRemoval, triggerFamilyRemoval, triggerAddSeat }}
    >
      <MobileFallback />
      <div
        className="hidden lg:flex flex-row w-full overflow-hidden relative select-none"
        style={{ height: "calc(100dvh - 4rem - 1px)" }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="flex flex-row shrink-0 transition-all duration-300"
            style={{ width: leftOpen ? "auto" : "0" }}
          >
            <aside
              className="shrink-0 bg-[#FDFBF7] border-r border-[#EBE5DA] overflow-hidden flex flex-col h-full"
              style={{
                transform: leftOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.3s ease",
                position: leftOpen ? "relative" : "absolute",
                zIndex: leftOpen ? "auto" : -1,
              }}
            >
              <ElementsPalette onClose={() => setLeftOpen(false)} />
            </aside>
          </div>

          <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
            <button
              onClick={() => setLeftOpen((o) => !o)}
              className="absolute top-3 left-3 z-30 p-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#EBE5DA] rounded-xl shadow-sm hover:bg-[#F9F7F2] text-[#5A5A5A] transition-all hover:border-[#C5A669] hover:text-[#C5A669]"
            >
              {leftOpen ? (
                <ChevronLeft size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <LayoutTemplate size={18} />
            </button>

            <button
              onClick={() => setRightOpen((o) => !o)}
              className="absolute top-3 right-3 z-30 p-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#EBE5DA] rounded-xl shadow-sm hover:bg-[#F9F7F2] text-[#5A5A5A] transition-all hover:border-[#C5A669] hover:text-[#C5A669]"
            >
              <Users size={18} />
              {rightOpen ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
              <button
                onClick={handleGlobalSave}
                disabled={!hasUnsavedChanges || isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg transition-all duration-300 ${
                  hasUnsavedChanges
                    ? "bg-[#C5A669] hover:bg-[#b09255] text-white hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-[#C5A669]/20"
                    : "bg-white/90 backdrop-blur-sm text-[#A8A29E] border border-[#EBE5DA] cursor-not-allowed opacity-80"
                }`}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving
                  ? "Guardando..."
                  : hasUnsavedChanges
                    ? "Guardar Cambios"
                    : "Cambios Guardados"}
              </button>
            </div>

            <SeatingCanvas openConfirmModal={openConfirmModal} />
          </div>

          <div
            className="flex flex-row shrink-0 transition-all duration-300"
            style={{ width: rightOpen ? "auto" : "0" }}
          >
            <aside
              className="shrink-0 bg-[#FDFBF7] border-l border-[#EBE5DA] overflow-hidden flex flex-col h-full"
              style={{
                transform: rightOpen ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.3s ease",
                position: rightOpen ? "relative" : "absolute",
                right: 0,
                zIndex: rightOpen ? "auto" : -1,
              }}
            >
              <GuestAssignmentSidebar onClose={() => setRightOpen(false)} />
            </aside>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDragItem?.type === "palette_element" &&
            "label" in (activeDragItem.data || {}) ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl pointer-events-none cursor-grabbing opacity-90">
                <span className="text-sm font-semibold text-[#2C2C29]">
                  {
                    (
                      activeDragItem.data as Extract<
                        DragItemData,
                        { type: "palette_element" }
                      >
                    ).label
                  }
                </span>
                {(
                  activeDragItem.data as Extract<
                    DragItemData,
                    { type: "palette_element" }
                  >
                ).seats > 0 && (
                  <span className="text-[10px] font-bold text-[#C5A669] uppercase tracking-wider">
                    {
                      (
                        activeDragItem.data as Extract<
                          DragItemData,
                          { type: "palette_element" }
                        >
                      ).seats
                    }{" "}
                    lugares
                  </span>
                )}
              </div>
            ) : activeDragItem?.type === "guest" &&
              "guest" in (activeDragItem.data || {}) ? (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[#C5A669] ring-2 ring-[#C5A669]/50 shadow-2xl scale-105 pointer-events-none cursor-grabbing text-xs">
                <GripVertical size={12} className="text-[#C5A669]" />
                <span className="flex-1 truncate font-medium text-[#2C2C29]">
                  {(
                    activeDragItem.data as Extract<
                      DragItemData,
                      { type: "guest" }
                    >
                  ).guest?.nombre || `Invitado`}
                </span>
              </div>
            ) : activeDragItem?.type === "family" &&
              "family" in (activeDragItem.data || {}) ? (
              <div className="p-2 bg-white border border-[#C5A669] ring-2 ring-[#C5A669]/50 shadow-2xl rounded-lg scale-105 pointer-events-none flex items-center gap-2 cursor-grabbing min-w-[180px]">
                <GripVertical size={14} className="text-[#C5A669]" />
                <span className="font-serif text-[13px] font-semibold text-[#2C2C29]">
                  {
                    (
                      activeDragItem.data as Extract<
                        DragItemData,
                        { type: "family" }
                      >
                    ).family?.name
                  }
                </span>
              </div>
            ) : activeDragItem?.type === "palette_layout" ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#FDFBF7] border-2 border-dashed border-[#C5A669] ring-4 ring-[#C5A669]/20 shadow-2xl rounded-xl scale-105 pointer-events-none cursor-grabbing opacity-90">
                <div className="p-1.5 bg-amber-50 rounded-md text-[#C5A669]">
                  <Sparkles size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#2C2C29]">
                    Diseñador de Salón
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600">
                    Crear distribución
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {toastMsg && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#2C2C29] text-white px-4 py-2.5 rounded-xl shadow-xl z-[100] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AlertCircle size={16} className="text-[#C5A669]" />
            <span className="text-sm font-medium tracking-wide">
              {toastMsg}
            </span>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleExecuteConfirmation}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
        isLoading={confirmModal.isLoading}
      />
      {layoutSetup?.isOpen && (
        <LayoutSetupModal
          isOpen={layoutSetup.isOpen}
          onClose={() => setLayoutSetup(null)}
          dropX={layoutSetup.dropX}
          dropY={layoutSetup.dropY}
        />
      )}
    </SeatingModalContext.Provider>
  );
}
