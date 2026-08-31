import React, { useState, useMemo } from "react";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { SeatingElement, STRUCTURAL_TYPES } from "@/types/seating";
import { useSeatingModalContext } from "../SeatingModalContext";
import {
  Trash2,
  Users,
  RotateCcw,
  RotateCw,
  Square,
  Circle,
} from "lucide-react";
import Tooltip from "@/features/shared/components/Tooltip";
import { GuestStatus } from "@/types";
import { useGuestLookupMap } from "../../hooks/useGuestLookupMap";

interface SeatGuestInfo {
  id: string;
  name: string;
  status: GuestStatus;
  familyId: string;
  familyName: string;
  colorBg: string;
  colorBorder: string;
  index: number;
}

interface SeatItemData {
  seatNumber: number;
  isAssigned: boolean;
  guestId?: string;
  guest?: SeatGuestInfo | null;
}

const SeatListItem = ({
  seat,
  elementId,
}: {
  seat: SeatItemData;
  elementId: string;
}) => {
  const removeGuestFromTable = useSeatingStore((state) => state.removeGuestFromTable);
  const { triggerSeatRemoval } = useSeatingModalContext();

  return (
    <div className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg bg-[#F9F7F2] group/seat">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          className="relative w-5 h-5 rounded-full border shadow-sm flex items-center justify-center shrink-0"
          style={{
            backgroundColor:
              seat.isAssigned && seat.guest ? seat.guest.colorBg : "#EBECEF",
            borderColor:
              seat.isAssigned && seat.guest
                ? seat.guest.colorBorder
                : "#A8AEBA",
          }}
        >
          <span
            className="text-[9px] font-bold"
            style={{ color: seat.isAssigned ? "#2C2C29" : "#A8A29E" }}
          >
            {seat.seatNumber}
          </span>
          {seat.isAssigned && seat.guest && (
            <div
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                seat.guest.status === "confirmed"
                  ? "bg-green-500"
                  : seat.guest.status === "declined"
                    ? "bg-red-500"
                    : "bg-amber-500"
              }`}
            />
          )}
        </div>
        <span
          className={`text-xs font-medium truncate ${
            seat.isAssigned ? "text-[#2C2C29]" : "text-[#A8A29E] italic"
          } ${seat.guest?.status === "declined" ? "line-through" : ""}`}
        >
          {seat.isAssigned && seat.guest
            ? seat.guest.name ||
              `${seat.guest.familyName} #${seat.guest.index + 1}`
            : "Disponible"}
        </span>
      </div>

      {seat.isAssigned && seat.guestId && seat.guest && (
        <div className="flex items-center gap-1 opacity-0 group-hover/seat:opacity-100 transition-opacity">
          <Tooltip text="Quitar de la mesa" position="top" align="right">
            <button
              onClick={() => removeGuestFromTable(elementId, seat.guestId!)}
              className="p-1 hover:bg-red-50 text-red-400 rounded"
            >
              <RotateCcw size={10} />
            </button>
          </Tooltip>
          <Tooltip
            text={
              seat.guest.status === "confirmed"
                ? "No puedes eliminar un asiento confirmado"
                : "Eliminar asiento de la lista"
            }
            position="top"
            align="right"
          >
            <button
              onClick={() =>
                triggerSeatRemoval(seat.guest!.familyId, seat.guestId!)
              }
              disabled={seat.guest.status === "confirmed"}
              className={`p-1 hover:bg-red-50 rounded ml-0.5 transition-colors ${
                seat.guest.status === "confirmed"
                  ? "text-gray-300 cursor-not-allowed pointer-events-none"
                  : "text-red-500 hover:text-red-700"
              }`}
            >
              <Trash2 size={10} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Control de Rotación
// ─────────────────────────────────────────────────────────────

const ROTATION_PRESETS = [0, 90, 180, 270];

function RotationControl({ element }: { element: SeatingElement }) {
  const updateElementRotation = useSeatingStore(
    (state) => state.updateElementRotation,
  );
  const rotation = element.rotation ?? 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    // Snap a 15° para una experiencia más intuitiva
    const snapped = Math.round(raw / 15) * 15;
    updateElementRotation(element.id, snapped);
  };

  return (
    <div className="px-4 py-3 border-b border-[#EBE5DA]">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest flex items-center gap-1.5">
          <RotateCw size={11} />
          Rotación
        </label>
        <span className="text-sm font-bold text-[#2C2C29] bg-[#F9F7F2] border border-[#EBE5DA] px-2.5 py-0.5 rounded-lg min-w-[48px] text-center">
          {rotation}°
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#A8A29E] font-bold w-6 text-right">
          0°
        </span>
        <input
          type="range"
          min="0"
          max="360"
          step="15"
          value={rotation}
          onChange={handleSliderChange}
          className="flex-1 accent-[#C5A669] h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #C5A669 0%, #C5A669 ${
              (rotation / 360) * 100
            }%, #EBE5DA ${(rotation / 360) * 100}%, #EBE5DA 100%)`,
          }}
        />
        <span className="text-[10px] text-[#A8A29E] font-bold w-7">
          360°
        </span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {ROTATION_PRESETS.map((preset) => {
          const isActive = rotation === preset;
          return (
            <button
              key={preset}
              onClick={() => updateElementRotation(element.id, preset)}
              className={`py-1 text-[10px] font-bold rounded-md border transition-colors ${
                isActive
                  ? "bg-[#C5A669] text-white border-[#C5A669]"
                  : "bg-white text-[#5A5A5A] border-[#EBE5DA] hover:border-[#C5A669] hover:text-[#C5A669]"
              }`}
            >
              {preset}°
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Selector de Forma de Columna
// ─────────────────────────────────────────────────────────────

function ColumnShapeControl({ element }: { element: SeatingElement }) {
  const updateElementColumnShape = useSeatingStore(
    (state) => state.updateElementColumnShape,
  );
  const current = element.columnShape ?? "square";

  return (
    <div className="px-4 py-3 border-b border-[#EBE5DA]">
      <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest mb-2">
        Forma de la columna
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => updateElementColumnShape(element.id, "square")}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-md border transition-colors ${
            current === "square"
              ? "bg-[#C5A669] text-white border-[#C5A669]"
              : "bg-white text-[#5A5A5A] border-[#EBE5DA] hover:border-[#C5A669] hover:text-[#C5A669]"
          }`}
        >
          <Square size={11} />
          Cuadrada
        </button>
        <button
          onClick={() => updateElementColumnShape(element.id, "circle")}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-md border transition-colors ${
            current === "circle"
              ? "bg-[#C5A669] text-white border-[#C5A669]"
              : "bg-white text-[#5A5A5A] border-[#EBE5DA] hover:border-[#C5A669] hover:text-[#C5A669]"
          }`}
        >
          <Circle size={11} />
          Circular
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────────────────────

export function TableSettingsPopover({
  element,
  isTable,
  onClose,
}: {
  element: SeatingElement;
  isTable: boolean;
  onClose: () => void;
}) {
  const updateElementSeats = useSeatingStore((state) => state.updateElementSeats);
  const updateElementAlias = useSeatingStore((state) => state.updateElementAlias);
  const removeElement = useSeatingStore((state) => state.removeElement);
  const showToast = useSeatingStore((state) => state.showToast);
  const guestMap = useGuestLookupMap();
  const [numberValue, setNumberValue] = useState(
    element.alias.replace(/\D/g, ""),
  );

  const isStructural = STRUCTURAL_TYPES.has(element.type);
  const isColumn = element.type === "column";
  const isSweethearts = element.type === "sweethearts_table";
  const isTextLabel = element.type === "text_label";
  const hasSeatList = isTable && !isSweethearts;

  // Recorremos los asientos UNA sola vez contra el Map O(1) compartido.
  const { allSeats, validAssignedCount } = useMemo(() => {
    if (!isTable) {
      return { allSeats: [] as SeatItemData[], validAssignedCount: 0 };
    }

    const seats: SeatItemData[] = [];
    let valid = 0;

    for (let i = 0; i < element.seats; i++) {
      const guestId = element.assignedSeats[i];
      if (!guestId) {
        seats.push({ seatNumber: i + 1, isAssigned: false });
        continue;
      }

      const info = guestMap.get(guestId);
      if (!info) {
        seats.push({ seatNumber: i + 1, isAssigned: false });
        continue;
      }

      valid++;
      const guestInfo: SeatGuestInfo = {
        id: info.id,
        name: info.nombre,
        status: info.estatus as GuestStatus,
        familyId: info.familyId,
        familyName: info.familyName,
        colorBg: info.colorBg,
        colorBorder: info.colorBorder,
        index: info.index,
      };

      seats.push({
        seatNumber: i + 1,
        isAssigned: true,
        guestId: info.id,
        guest: guestInfo,
      });
    }

    return { allSeats: seats, validAssignedCount: valid };
  }, [element.seats, element.assignedSeats, guestMap, isTable]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);

    if (newValue < validAssignedCount) {
      if (element.seats !== validAssignedCount) {
        updateElementSeats(element.id, validAssignedCount);
        showToast(
          `No puedes reducir más el tamaño. Esta mesa ya tiene ${validAssignedCount} asientos asignados.`,
        );
      }
      return;
    }
    updateElementSeats(element.id, newValue);
  };

  return (
    <div
      className="settings-popover z-[100]"
      style={{
        width: "280px",
        filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.18))",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FDFBF7] border-r border-b border-[#EBE5DA] rotate-45"
        style={{ bottom: -5 }}
      />
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#EBE5DA] flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-[#EBE5DA] bg-[#FDFBF7] rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest mb-1.5">
                {isTable && !isSweethearts
                  ? "Número de mesa"
                  : isSweethearts
                    ? "Mesa de los novios"
                    : isTextLabel
                      ? "Contenido del texto"
                      : isStructural
                        ? "Elemento estructural"
                        : "Nombre / Alias"}
              </label>

              {isTable && !isSweethearts ? (
                <div className="flex items-center gap-2 bg-white border border-[#EBE5DA] rounded-lg px-3 py-2 focus-within:border-[#C5A669] transition-colors">
                  <span className="text-sm font-semibold text-[#A8A29E]">
                    Mesa
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={numberValue}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, "");
                      setNumberValue(num);
                      if (num) updateElementAlias(element.id, `Mesa ${num}`);
                    }}
                    onBlur={() => {
                      if (!numberValue) {
                        setNumberValue(element.alias.replace(/\D/g, ""));
                      }
                    }}
                    className="w-16 text-sm font-semibold text-[#2C2C29] bg-transparent outline-none"
                    placeholder="1"
                  />
                </div>
              ) : (
                <input
                  value={element.alias}
                  onChange={(e) =>
                    updateElementAlias(element.id, e.target.value)
                  }
                  className="w-full text-sm font-semibold text-[#2C2C29] bg-white border border-[#EBE5DA] rounded-lg px-3 py-2 focus:border-[#C5A669] focus:outline-none"
                  placeholder={
                    isStructural
                      ? "Ej. Pared norte"
                      : isSweethearts
                        ? "Mesa de los novios"
                        : isTextLabel
                          ? "Escribe el texto aquí…"
                          : "Nombre del área"
                  }
                />
              )}
            </div>

            <div className="mt-5 shrink-0">
              <Tooltip text="Eliminar elemento" position="top" align="center">
                <button
                  onClick={() => {
                    removeElement(element.id);
                    onClose();
                  }}
                  className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  <Trash2 size={16} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Selector de forma de columna (solo para columnas) */}
        {isColumn && <ColumnShapeControl element={element} />}

        {/* Control de rotación (para todos los elementos) */}
        <RotationControl element={element} />

        {hasSeatList && (
          <div className="px-4 py-3 border-b border-[#EBE5DA]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Users size={11} />
                Asientos
              </label>
              <span className="text-sm font-bold text-[#2C2C29] bg-[#F9F7F2] border border-[#EBE5DA] px-2.5 py-0.5 rounded-lg min-w-[36px] text-center">
                {element.seats}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#A8A29E] font-bold w-3">
                1
              </span>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={element.seats}
                onChange={handleSliderChange}
                className="flex-1 accent-[#C5A669] h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #C5A669 0%, #C5A669 ${
                    ((element.seats - 1) / 14) * 100
                  }%, #EBE5DA ${((element.seats - 1) / 14) * 100}%, #EBE5DA 100%)`,
                }}
              />
              <span className="text-[10px] text-[#A8A29E] font-bold w-5">
                15
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#EBE5DA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C5A669] rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (validAssignedCount / element.seats) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#5A5A5A] shrink-0">
                {validAssignedCount}/{element.seats} ocupados
              </span>
            </div>
          </div>
        )}

        {hasSeatList && (
          <div className="relative px-4 py-3 my-1.5 max-h-[160px] overflow-y-auto overflow-x-hidden">
            <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest mb-2">
              Listado de asientos
            </label>
            <div className="space-y-1.5">
              {allSeats.map((seat) => (
                <SeatListItem
                  key={seat.seatNumber}
                  seat={seat}
                  elementId={element.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
