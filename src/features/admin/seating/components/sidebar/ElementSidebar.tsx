"use client";

import React, { useState, useMemo } from "react";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { ElementType, SeatingElement, STRUCTURAL_TYPES } from "@/types/seating";
import { useSeatingModalContext } from "../SeatingModalContext";
import { GuestStatus } from "@/types";
import { useGuestLookupMap } from "../../hooks/useGuestLookupMap";
import {
  Trash2,
  Users,
  RotateCw,
  RotateCcw,
  Square,
  Circle,
  ChevronLeft,
  X,
  HandHelping,
  Move,
  AlertTriangle,
  Settings,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";
import Tooltip from "@/features/shared/components/Tooltip";

// ─────────────────────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────────────────────

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

const ROTATION_PRESETS = [0, 90, 180, 270];

const SQUARE_ASPECT_TYPES = new Set([
  "round_table",
  "square_table",
  "cocktail_table",
  "sweethearts_table",
]);

const SIZE_EDITABLE_TYPES = new Set<ElementType>([
  // ── Mesas ──
  "round_table",
  "square_table",
  "rectangular_table",
  "half_moon_table",
  "head_table",
  "cocktail_table",
  "sweethearts_table",
  // ── Estructurales ──
  "wall",
  "door",
  "window",
  "column",
  "stairs",
  "aisle",
  // ── Servicios ──
  "bathroom",
  "kitchen",
  "emergency_exit",
  "check_in",
  // ── Espacios (ex-Mobiliario) ──
  "photo_booth",
  "lounge",
  "fountain",
  "plant",
  // ── Espacios / Áreas ──
  "dance_floor",
  "stage",
  "dj_booth",
  "cake_area",
  "gift_table",
  "drink_bar",
  "buffet",
  "candy_bar",
  "garden_entrance",
  "bride_room",
  "groom_room",
  "smoking_area",
  // ── Utilidades ──
  "text_label",
  "line_divider",
  "zone_shape",
]);

// ─────────────────────────────────────────────────────────────
// Listado de asientos — estilo del popover original con:
//  - badge de estado (como en el plano) siempre visible
//  - nombre abarca todo el ancho
//  - en hover aparecen los botones (desasignar + eliminar)
//    sobrepuestos con fondo semi-transparente que desvanece el nombre
// ─────────────────────────────────────────────────────────────

const SeatListItem = ({
  seat,
}: {
  seat: SeatItemData;
}) => {
  const { triggerSeatRemoval } = useSeatingModalContext();
  const removeGuestFromTable = useSeatingStore(
    (state) => state.removeGuestFromTable,
  );
  const isConfirmed = seat.guest?.status === "confirmed";

  const displayName =
    seat.guest
      ? seat.guest.name ||
        `${seat.guest.familyName} #${seat.guest.index + 1}`
      : null;

  const handleUnassign = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!seat.guest || !seat.guestId) return;
    const tableId = useSeatingStore.getState().selectedElementId;
    if (tableId) {
      removeGuestFromTable(tableId, seat.guestId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!seat.guest) return;
    triggerSeatRemoval(seat.guest.familyId, seat.guestId!);
  };

  return (
    <div
      className={`flex items-center gap-2 py-1 px-2 rounded-lg group/seat relative ${
        seat.isAssigned
          ? "bg-[#F9F7F2]"
          : "bg-[#FDFBF7] border border-dashed border-[#EBE5DA]"
      }`}
    >
      <div
        className="relative w-5 h-5 rounded-full border shadow-sm flex items-center justify-center shrink-0"
        style={{
          backgroundColor: seat.guest?.colorBg ?? "transparent",
          borderColor: seat.guest?.colorBorder ?? "#EBE5DA",
        }}
      >
        <span className="text-[9px] font-bold text-[#2C2C29]">
          {seat.seatNumber}
        </span>
        {seat.guest && (
          <span
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
              isConfirmed ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        )}
      </div>

      <span
        className={`text-xs truncate flex-1 min-w-0 ${
          seat.isAssigned
            ? "text-[#2C2C29]"
            : "text-[#A8A29E] italic"
        }`}
      >
        {displayName ?? "Asiento vacío"}
      </span>

      {seat.isAssigned && seat.guest && (
        <div className="flex items-center gap-0.5 max-w-0 opacity-0 overflow-hidden transition-all duration-200 group-hover/seat:max-w-[110px] group-hover/seat:opacity-100 shrink-0 bg-white/90 backdrop-blur-sm rounded pl-1 -mr-1">
          <Tooltip text="Desasignar invitado" position="top" align="right">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleUnassign}
              aria-label="Desasignar invitado"
              className="p-1 hover:bg-amber-50 rounded text-amber-500 hover:text-amber-700 transition-colors"
            >
              <RotateCcw size={10} />
            </button>
          </Tooltip>
          <Tooltip
            text={
              isConfirmed
                ? "No puedes eliminar un asiento confirmado"
                : "Eliminar asiento de la lista"
            }
            position="top"
            align="right"
          >
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleDelete}
              disabled={isConfirmed}
              aria-label={
                isConfirmed
                  ? "No puedes eliminar un asiento confirmado"
                  : "Eliminar asiento"
              }
              className={`p-1 hover:bg-red-50 rounded ml-0.5 transition-colors ${
                isConfirmed
                  ? "text-gray-300 cursor-not-allowed opacity-50"
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

function RotationControl({ element }: { element: SeatingElement }) {
  const updateElementRotation = useSeatingStore(
    (state) => state.updateElementRotation,
  );
  const rotation = element.rotation ?? 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
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
// Posición de los asientos (arriba / abajo)
// Aplica a mesas con disposición lineal/lado-a-lado
// (rectangular, head, half_moon, square) y a la mesa de novios
// (cuyas sillas decorativas pueden ir arriba o abajo de la mesa).
// ─────────────────────────────────────────────────────────────

const SEAT_POSITIONABLE_TYPES = new Set([
  "rectangular_table",
  "head_table",
  "half_moon_table",
  "square_table",
  "sweethearts_table",
]);

function SeatPositionControl({ element }: { element: SeatingElement }) {
  const updateElementSeatPosition = useSeatingStore(
    (state) => state.updateElementSeatPosition,
  );
  const current = element.seatPosition ?? "top";

  return (
    <div className="px-4 py-3 border-b border-[#EBE5DA]">
      <label className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest flex items-center gap-1.5 mb-2">
        <ArrowUpDown size={11} />
        Posición de asientos
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => updateElementSeatPosition(element.id, "top")}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-md border transition-colors ${
            current === "top"
              ? "bg-[#C5A669] text-white border-[#C5A669]"
              : "bg-white text-[#5A5A5A] border-[#EBE5DA] hover:border-[#C5A669] hover:text-[#C5A669]"
          }`}
        >
          <ArrowUp size={11} />
          Arriba
        </button>
        <button
          onClick={() => updateElementSeatPosition(element.id, "bottom")}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-md border transition-colors ${
            current === "bottom"
              ? "bg-[#C5A669] text-white border-[#C5A669]"
              : "bg-white text-[#5A5A5A] border-[#EBE5DA] hover:border-[#C5A669] hover:text-[#C5A669]"
          }`}
        >
          <ArrowDown size={11} />
          Abajo
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Posición del texto (solo para zone_shape)
// Ancla el texto a una de las 4 esquinas del rectángulo.
// ─────────────────────────────────────────────────────────────

const TEXT_POSITION_OPTIONS: Array<{
  value: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  Icon: LucideIcon;
}> = [
  { value: "top-left", Icon: ArrowUpLeft },
  { value: "top-right", Icon: ArrowUpRight },
  { value: "bottom-left", Icon: ArrowDownLeft },
  { value: "bottom-right", Icon: ArrowDownRight },
];

function TextPositionControl({ element }: { element: SeatingElement }) {
  const updateElementTextPosition = useSeatingStore(
    (state) => state.updateElementTextPosition,
  );
  const current = element.textPosition ?? "top-left";

  return (
    <div className="px-4 py-3 border-b border-[#EBE5DA]">
      <label className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest flex items-center gap-1.5 mb-2">
        <Move size={11} />
        Posición del texto
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {TEXT_POSITION_OPTIONS.map((opt) => {
          const isActive = current === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() =>
                updateElementTextPosition(element.id, opt.value)
              }
              className={`flex items-center justify-center py-1.5 rounded-md border transition-colors ${
                isActive
                  ? "bg-[#C5A669] text-white border-[#C5A669]"
                  : "bg-white text-[#5A5A5A] border-[#EBE5DA] hover:border-[#C5A669] hover:text-[#C5A669]"
              }`}
            >
              <opt.Icon size={14} strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Editor de Tamaño (Ancho / Alto)
// ─────────────────────────────────────────────────────────────

function SizeControl({ element }: { element: SeatingElement }) {
  const updateElementGeometry = useSeatingStore(
    (state) => state.updateElementGeometry,
  );
  const isSquare = SQUARE_ASPECT_TYPES.has(element.type);

  // Estado local para lo que el usuario está escribiendo en los inputs.
  // Se re-sincroniza con la prop solo cuando `element.width` /
  // `element.height` cambia desde fuera (p.ej. resize desde el canvas),
  // usando el patrón "store previous value" recomendado por React 19
  // en lugar de `useEffect`, para evitar renders en cascada.
  const [widthValue, setWidthValue] = useState(
    Math.round(element.width).toString(),
  );
  const [heightValue, setHeightValue] = useState(
    Math.round(element.height).toString(),
  );
  const [prevWidth, setPrevWidth] = useState(element.width);
  const [prevHeight, setPrevHeight] = useState(element.height);

  if (element.width !== prevWidth) {
    setPrevWidth(element.width);
    setWidthValue(Math.round(element.width).toString());
  }
  if (element.height !== prevHeight) {
    setPrevHeight(element.height);
    setHeightValue(Math.round(element.height).toString());
  }

  const MIN_SIZE = 20;
  const MAX_SIZE = 2000;

  const clampSize = (raw: number) =>
    Math.max(MIN_SIZE, Math.min(raw, MAX_SIZE));

  const commitWidth = () => {
    const raw = parseInt(widthValue, 10);
    if (isNaN(raw)) {
      setWidthValue(Math.round(element.width).toString());
      return;
    }
    const clamped = clampSize(raw);
    if (isSquare) {
      updateElementGeometry(
        element.id,
        clamped,
        clamped,
        element.x,
        element.y,
      );
      setHeightValue(clamped.toString());
    } else {
      updateElementGeometry(
        element.id,
        clamped,
        element.height,
        element.x,
        element.y,
      );
    }
    setWidthValue(clamped.toString());
  };

  const commitHeight = () => {
    const raw = parseInt(heightValue, 10);
    if (isNaN(raw)) {
      setHeightValue(Math.round(element.height).toString());
      return;
    }
    const clamped = clampSize(raw);
    if (isSquare) {
      updateElementGeometry(
        element.id,
        clamped,
        clamped,
        element.x,
        element.y,
      );
      setWidthValue(clamped.toString());
    } else {
      updateElementGeometry(
        element.id,
        element.width,
        clamped,
        element.x,
        element.y,
      );
    }
    setHeightValue(clamped.toString());
  };

  return (
    <div className="px-4 py-3 border-b border-[#EBE5DA]">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest flex items-center gap-1.5">
          <Move size={11} />
          Tamaño
        </label>
        {isSquare && (
          <span className="text-[9px] text-[#C5A669] font-bold uppercase tracking-wider">
            1:1
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-wider mb-1">
            Ancho
          </label>
          <div className="flex items-center bg-white border border-[#EBE5DA] rounded-lg focus-within:border-[#C5A669] focus-within:ring-1 focus-within:ring-[#C5A669]/20 transition-all shadow-sm">
            <input
              type="number"
              value={widthValue}
              onChange={(e) => setWidthValue(e.target.value)}
              onBlur={commitWidth}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              min={MIN_SIZE}
              max={MAX_SIZE}
              className="w-full bg-transparent px-2.5 py-1.5 text-xs font-semibold text-[#2C2C29] outline-none"
            />
            <span className="text-[10px] text-[#A8A29E] font-bold pr-2">px</span>
          </div>
        </div>
        <div>
          <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-wider mb-1">
            Alto
          </label>
          <div className="flex items-center bg-white border border-[#EBE5DA] rounded-lg focus-within:border-[#C5A669] focus-within:ring-1 focus-within:ring-[#C5A669]/20 transition-all shadow-sm">
            <input
              type="number"
              value={heightValue}
              onChange={(e) => setHeightValue(e.target.value)}
              onBlur={commitHeight}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              min={MIN_SIZE}
              max={MAX_SIZE}
              className="w-full bg-transparent px-2.5 py-1.5 text-xs font-semibold text-[#2C2C29] outline-none"
            />
            <span className="text-[10px] text-[#A8A29E] font-bold pr-2">px</span>
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-[9px] text-[#A8A29E]">
        También puedes arrastrar las esquinas en el plano
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────────────────────

interface ElementSidebarProps {
  onBack: () => void;
  onCloseSidebar?: () => void;
}

export function ElementSidebar({
  onBack,
  onCloseSidebar,
}: ElementSidebarProps) {
  const selectedElementId = useSeatingStore(
    (state) => state.selectedElementId,
  );
  const element = useSeatingStore((state) =>
    state.elements.find((e) => e.id === selectedElementId),
  );

  const updateElementSeats = useSeatingStore(
    (state) => state.updateElementSeats,
  );
  const updateElementAlias = useSeatingStore(
    (state) => state.updateElementAlias,
  );
  const removeElement = useSeatingStore((state) => state.removeElement);
  const showToast = useSeatingStore((state) => state.showToast);
  const guestMap = useGuestLookupMap();

  // ── Hooks que dependen de `element` deben declararse ANTES del
  // early return para cumplir con las reglas de React Hooks. El
  // estado derivado se calcula con un fallback seguro cuando
  // `element` aún no está disponible.
  const isTable =
    element !== undefined && element.seats !== undefined && element.seats > 0;

  const { allSeats, validAssignedCount } = useMemo(() => {
    if (!element || !isTable) {
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
  }, [element, guestMap, isTable]);

  if (!element) return null;

  const isStructural = STRUCTURAL_TYPES.has(element.type);
  const isColumn = element.type === "column";
  const isSweethearts = element.type === "sweethearts_table";
  const isTextLabel = element.type === "text_label";
  const hasSeatList = isTable && !isSweethearts;
  const canEditSize = SIZE_EDITABLE_TYPES.has(element.type);
  const emptySeatsCount = hasSeatList
    ? element.seats -
      Math.min(
        element.assignedSeats.filter((id) => id && guestMap.get(id)).length,
        element.seats,
      )
    : 0;

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

  const hasAssignedGuests = validAssignedCount > 0;
  const assignedRatio = hasSeatList
    ? Math.min((validAssignedCount / element.seats) * 100, 100)
    : 0;
  const isFull = hasSeatList && validAssignedCount >= element.seats;

  return (
    <aside
      className="w-72 shrink-0 bg-white flex flex-col h-full overflow-hidden"
      data-element-sidebar
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header — mismo estilo que el sidebar de invitados */}
      <div className="p-4 pb-3 border-b border-[#EBE5DA] bg-white shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Tooltip text="Regresar a elementos" position="bottom" align="left">
              <button
                onClick={onBack}
                className="p-1 bg-white hover:bg-[#F9F7F2] border border-[#EBE5DA] rounded-md transition-colors text-[#A8A29E] hover:text-[#2C2C29] shadow-sm shrink-0"
                aria-label="Regresar a elementos"
              >
                <ChevronLeft size={14} />
              </button>
            </Tooltip>
            <div className="min-w-0">
              <p className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest">
                Editando
              </p>
              <h2 className="font-serif text-[15px] font-bold text-[#2C2C29] truncate">
                {element.alias || "Sin nombre"}
              </h2>
            </div>
          </div>

          {onCloseSidebar && (
            <Tooltip text="Cerrar panel" position="bottom" align="right">
              <button
                onClick={onCloseSidebar}
                className="p-1.5 bg-white hover:bg-[#F9F7F2] border border-[#EBE5DA] rounded-md transition-colors text-[#A8A29E] hover:text-[#2C2C29] shadow-sm shrink-0"
                aria-label="Cerrar panel"
              >
                <X size={14} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Badge de estado — mismo estilo que "N personas" en el otro sidebar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C5A669] bg-amber-50/50 px-2 py-0.5 rounded-md border border-amber-100/50 shadow-sm">
            <Settings size={10} />
            {isStructural ? "Estructural" : isTable ? "Mesa" : "Área"}
          </span>
          {hasSeatList && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-sm ${
                isFull
                  ? "text-emerald-700 bg-emerald-50/50 border-emerald-100/50"
                  : hasAssignedGuests
                    ? "text-amber-700 bg-amber-50/50 border-amber-100/50"
                    : "text-[#A8A29E] bg-[#F9F7F2] border-[#EBE5DA]"
              }`}
            >
              <Users size={10} />
              {validAssignedCount}/{element.seats} asientos
            </span>
          )}
        </div>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Nombre / Alias — editable en su totalidad, sin importar
            si es mesa, área o estructura. El default se genera al
            crear (ver `getDefaultTableAlias` en utils/tableAlias). */}
        <div className="px-4 py-3 border-b border-[#EBE5DA]">
          <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest mb-1.5">
            {isTable && !isSweethearts
              ? "Nombre de la mesa"
              : isSweethearts
                ? "Mesa de los novios"
                : isTextLabel
                  ? "Contenido del texto"
                  : isStructural
                    ? "Elemento estructural"
                    : "Nombre / Alias"}
          </label>

          <input
            value={element.alias}
            onChange={(e) => updateElementAlias(element.id, e.target.value)}
            className="w-full text-xs font-semibold text-[#2C2C29] bg-white border border-[#EBE5DA] rounded-lg px-2.5 py-1.5 focus:border-[#C5A669] focus:ring-1 focus:ring-[#C5A669]/20 focus:outline-none transition-all placeholder:text-[#A8A29E] placeholder:font-normal shadow-sm"
            placeholder={
              isStructural
                ? "Ej. Pared norte"
                : isSweethearts
                  ? "Mesa de los novios"
                  : isTextLabel
                    ? "Escribe el texto…"
                    : isTable
                      ? "Ej. Mesa 5"
                      : "Nombre del área"
            }
          />
        </div>

        {isColumn && <ColumnShapeControl element={element} />}

        {element.type === "zone_shape" && (
          <TextPositionControl element={element} />
        )}

        {canEditSize && <SizeControl element={element} />}

        {SEAT_POSITIONABLE_TYPES.has(element.type) &&
          (hasSeatList || element.type === "sweethearts_table") && (
            <SeatPositionControl element={element} />
          )}

        <RotationControl element={element} />

        {hasSeatList && (
          <div className="px-4 py-3 border-b border-[#EBE5DA]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Users size={11} />
                Asientos
              </label>
              <span className="text-xs font-bold text-[#2C2C29] bg-[#F9F7F2] border border-[#EBE5DA] px-2 py-0.5 rounded-lg min-w-[32px] text-center">
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
                    ((element.seats - 1) / (15 - 1)) * 100
                  }%, #EBE5DA ${
                    ((element.seats - 1) / (15 - 1)) * 100
                  }%, #EBE5DA 100%)`,
                }}
              />
              <span className="text-[10px] text-[#A8A29E] font-bold w-5">
                15
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#EBE5DA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C5A669] rounded-full transition-all"
                  style={{ width: `${assignedRatio}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#5A5A5A] shrink-0">
                {validAssignedCount}/{element.seats}
              </span>
            </div>
          </div>
        )}

        {hasSeatList && (
          <div className="px-4 py-3">
            <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest mb-2">
              Listado de asientos
            </label>
            <div className="space-y-1.5">
              {allSeats.map((seat) => (
                <SeatListItem key={seat.seatNumber} seat={seat} />
              ))}
            </div>

            {emptySeatsCount > 0 && (
              <div className="mt-3 relative overflow-hidden border-2 border-dashed border-[#C5A669]/50 rounded-xl p-3 bg-gradient-to-br from-[#FDFBF7] to-[#F9F7F2] text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#C5A669]/15 flex items-center justify-center">
                    <HandHelping size={18} className="text-[#C5A669]" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-[#2C2C29] mb-1 uppercase tracking-wider">
                  {emptySeatsCount === 1
                    ? "1 asiento vacío"
                    : `${emptySeatsCount} asientos vacíos`}
                </p>
                <p className="text-[10px] text-[#5A5A5A] leading-relaxed">
                  Arrastra familias o invitados del panel de la derecha a la
                  mesa en el plano para asignarlos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer con botón eliminar — validaciones: warning si hay invitados */}
      <div className="px-4 py-3 border-t border-[#EBE5DA] bg-[#F9F7F2]">
        <Tooltip
          text={
            hasAssignedGuests
              ? `Esta mesa tiene ${validAssignedCount} invitado(s) asignado(s). Se desasignarán automáticamente al eliminar la mesa.`
              : "Eliminar este elemento del plano"
          }
        >
          <button
            onClick={() => {
              if (hasAssignedGuests) {
                const confirmMsg = `Esta mesa tiene ${validAssignedCount} invitado(s) asignado(s). ¿Eliminar la mesa y desasignar a los invitados?`;
                if (window.confirm(confirmMsg)) {
                  removeElement(element.id);
                  onBack();
                }
              } else {
                removeElement(element.id);
                onBack();
              }
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border rounded-lg font-bold text-[10px] uppercase tracking-widest transition-colors shadow-sm ${
              hasAssignedGuests
                ? "border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
                : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            }`}
          >
            {hasAssignedGuests ? (
              <AlertTriangle size={12} />
            ) : (
              <Trash2 size={12} />
            )}
            Eliminar elemento
            {hasAssignedGuests && (
              <span className="ml-1 text-amber-600">
                ({validAssignedCount})
              </span>
            )}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

export default ElementSidebar;
