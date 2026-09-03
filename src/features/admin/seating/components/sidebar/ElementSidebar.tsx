"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Armchair,
  UserPlus,
  Clock,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import Tooltip from "@/features/shared/components/Tooltip";
import { getTableIssues, TableIssue } from "../../utils/tableIssues";

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
  "lounge_table",
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
            // Badge de status con 3 estados:
            //  - confirmed  → verde (emerald)
            //  - declined   → rojo (red)
            //  - pending    → ámbar (amber)
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
              isConfirmed
                ? "bg-emerald-500"
                : seat.guest.status === "declined"
                  ? "bg-red-500"
                  : "bg-amber-500"
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
// UI complementaria al handle de rotación del canvas. Permite
// ajustar la rotación con un slider (snap a 15°) o con los presets
// rápidos (0/90/180/270°). Sincronizada con el store: cualquier
// cambio desde el handle se refleja acá, y viceversa.
// ─────────────────────────────────────────────────────────────

function RotationControl({ element }: { element: SeatingElement }) {
  const updateElementRotation = useSeatingStore(
    (s) => s.updateElementRotation,
  );
  const rotation = element.rotation ?? 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const snapped = Math.round(raw / 15) * 15;
    const normalized = ((snapped % 360) + 360) % 360;
    updateElementRotation(element.id, normalized);
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
          max="345"
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
                  : "bg-white text-[#5A5A5A] border-[#EBE5DA] hover:border-[#C5A669] hover:text-[#C5A669] cursor-pointer"
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

// ─────────────────────────────────────────────────────────────
// Panel de Estatus de la Mesa
// ─────────────────────────────────────────────────────────────
// Muestra los issues detectados en la mesa seleccionada (declinados,
// sobre-asignación, pendientes, etc.) con su acción sugerida. Solo
// se renderiza si la mesa tiene al menos 1 issue; si está perfecta,
// se muestra un solo card verde de "Mesa completa, sin acciones".

const ICON_MAP: Record<TableIssue["icon"], LucideIcon> = {
  "rotate-ccw": RotateCcw,
  "user-plus": UserPlus,
  clock: Clock,
  alert: AlertTriangle,
  check: CheckCircle2,
};

const SEVERITY_STYLES: Record<
  TableIssue["severity"],
  { bg: string; border: string; iconColor: string; textColor: string }
> = {
  critical: {
    bg: "bg-red-50/70",
    border: "border-l-red-500",
    iconColor: "text-red-600",
    textColor: "text-red-900",
  },
  warning: {
    bg: "bg-amber-50/70",
    border: "border-l-amber-500",
    iconColor: "text-amber-600",
    textColor: "text-amber-900",
  },
  success: {
    bg: "bg-emerald-50/70",
    border: "border-l-emerald-500",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-900",
  },
};

function TableActionsPanel({
  issues,
}: {
  issues: TableIssue[];
}) {
  if (issues.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-[#EBE5DA] bg-[#FDFBF7]">
      <div className="flex items-center gap-1.5 mb-2">
        <ListChecks size={11} className="text-[#A8A29E]" />
        <span className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest">
          Estatus de la Mesa
        </span>
        <span className="ml-auto text-[9px] text-[#A8A29E] font-bold bg-white border border-[#EBE5DA] rounded-md px-1.5 py-px">
          {issues.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {issues.map((issue) => {
          const Icon = ICON_MAP[issue.icon];
          const styles = SEVERITY_STYLES[issue.severity];
          return (
            <div
              key={issue.id}
              role={issue.severity === "critical" ? "alert" : "status"}
              className={`relative pl-2.5 pr-2 py-2 rounded-md border border-[#EBE5DA] border-l-[3px] ${styles.border} ${styles.bg}`}
            >
              <div className="flex items-start gap-2">
                <Icon
                  size={13}
                  className={`${styles.iconColor} shrink-0 mt-px`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[11px] font-bold leading-tight ${styles.textColor}`}
                  >
                    {issue.title}
                  </p>
                  {issue.message && (
                    <p className="text-[10px] text-[#5A5A5A] leading-snug mt-0.5">
                      {issue.message}
                    </p>
                  )}
                </div>
              </div>
              {issue.action && (
                <button
                  onClick={issue.action.onClick}
                  className={`mt-1.5 w-full text-[10px] font-bold uppercase tracking-wider py-1 rounded-md border transition-colors ${
                    issue.severity === "critical"
                      ? "bg-white border-red-200 text-red-600 hover:bg-red-50"
                      : issue.severity === "warning"
                        ? "bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                        : "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {issue.action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const families = useSeatingStore((state) => state.families);

  // Acceso al modal de confirmación global (no usar `window.confirm`
  // — el proyecto usa un modal estilizado en `SeatingManager.tsx`
  // que se renderiza con `<ConfirmationModal>` y se abre vía
  // `openConfirmModal`).
  const { openConfirmModal } = useSeatingModalContext();

  // ─────────────────────────────────────────────────────────────
  // ISSUES / ACCIONES REQUERIDAS de la mesa
  // ─────────────────────────────────────────────────────────────
  // Se calculan con `useMemo` para no recalcularlos en cada
  // pointermove del drag. Solo se recalculan cuando cambia el
  // elemento, el guestMap, las families o las acciones del store.
  // Si la mesa no tiene seats configurados, retorna [] y el panel
  // no se renderiza.
  const tableIssues = useMemo(() => {
    if (!element) return [];
    return getTableIssues(element, {
      guestMap,
      families,
      actions: {
        removeGuestFromTable: (tableId, guestId) =>
          useSeatingStore.getState().removeGuestFromTable(tableId, guestId),
        // Cast a `Record<string, unknown>` para que el type del
        // helper (permisivo) acepte la función real del context
        // (que requiere `isOpen` y otros campos).
        openConfirmModal: openConfirmModal as unknown as (
          config: Record<string, unknown>,
        ) => void,
      },
    });
  }, [element, guestMap, families, openConfirmModal]);

  // ─────────────────────────────────────────────────────────────
  // CONFIRMACIÓN EN DOS PASOS ("click de nuevo para confirmar")
  // ─────────────────────────────────────────────────────────────
  // Para elementos SIN modal de confirmación previo (los que se
  // eliminan con un solo click hoy), exigimos un segundo click
  // antes de ejecutar la acción. Esto evita borrados accidentales.
  //
  // El estado se guarda indexado por `element.id` (en un Map), así
  // cuando el usuario cambia de elemento seleccionado, el nuevo
  // elemento arranca automáticamente con `confirming = false` sin
  // necesidad de un `useEffect` que setee state (lo cual React 19
  // marca como anti-pattern: cascading renders). El timer también
  // se guarda por elemento para que cada uno tenga su propio
  // countdown independiente.
  //
  // Para elementos CON modal (mesas con invitados asignados, etc.)
  // este flujo NO se usa — la confirmación vive en el modal.
  // ─────────────────────────────────────────────────────────────
  const [confirmingMap, setConfirmingMap] = useState<
    Record<string, boolean>
  >({});
  // `element` puede ser `undefined` antes del early return más abajo
  // en el componente, así que usamos un fallback seguro.
  const confirming = element ? (confirmingMap[element.id] ?? false) : false;
  const confirmTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  // Helper para setear confirming del elemento actual y limpiar
  // su timer si lo había. `element` puede ser `undefined` antes
  // del early return; los callers reales están en el JSX posterior
  // donde `element` ya está garantizado.
  const setConfirming = (value: boolean) => {
    if (!element) return;
    if (value) {
      // Limpiar timer previo de este mismo elemento (si existía)
      const prevTimer = confirmTimeoutsRef.current.get(element.id);
      if (prevTimer) clearTimeout(prevTimer);
    } else {
      // Limpiar el timer de este elemento
      const t = confirmTimeoutsRef.current.get(element.id);
      if (t) {
        clearTimeout(t);
        confirmTimeoutsRef.current.delete(element.id);
      }
    }
    setConfirmingMap((prev) =>
      prev[element.id] === value ? prev : { ...prev, [element.id]: value },
    );
  };

  // Programar auto-reset del confirming después de 3 segundos.
  // Se expone como helper para llamarlo al "armar" el botón.
  const armConfirmingWithTimeout = () => {
    if (!element) return;
    setConfirming(true);
    const elementId = element.id;
    const timer = setTimeout(() => {
      setConfirmingMap((prev) => {
        if (!prev[elementId]) return prev;
        // Recrear el Map sin la key del elemento (sin usar
        // destructuring con `_` para evitar el warning de unused).
        const next: Record<string, boolean> = {};
        for (const k of Object.keys(prev)) {
          if (k !== elementId) next[k] = prev[k];
        }
        return next;
      });
      confirmTimeoutsRef.current.delete(elementId);
    }, 3000);
    confirmTimeoutsRef.current.set(elementId, timer);
  };

  // Limpiar TODOS los timers al desmontar el sidebar.
  useEffect(() => {
    const timeouts = confirmTimeoutsRef.current;
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
    };
  }, []);

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

      {/* Panel de acciones requeridas — solo se renderiza si la
          mesa tiene issues (declinados, pendientes, etc.) o si está
          completa. Las áreas/estructuras no tienen panel. */}
      {tableIssues.length > 0 && <TableActionsPanel issues={tableIssues} />}

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
                    <Armchair size={18} className="text-[#C5A669]" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-[#2C2C29] mb-1 uppercase tracking-wider">
                  {emptySeatsCount === 1
                    ? "1 asiento vacío"
                    : `${emptySeatsCount} asientos vacíos`}
                </p>
                <p className="text-[10px] text-[#5A5A5A] leading-relaxed">
                  Arrastra familias o invitados/personas del panel de la derecha a la
                  mesa en el plano para asignarlos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer con botón eliminar — validaciones: warning si hay invitados
          o confirmación en dos pasos si NO hay modal previo. */}
      <div className="px-4 py-3 border-t border-[#EBE5DA] bg-[#F9F7F2]">
        <Tooltip
          text={
            hasAssignedGuests
              ? `Esta mesa tiene ${validAssignedCount} invitado(s) asignado(s). Se desasignarán automáticamente al eliminar la mesa.`
              : confirming
                ? "Click de nuevo para confirmar la eliminación"
                : "Eliminar este elemento del plano"
          }
        >
          <button
            onClick={() => {
              if (hasAssignedGuests) {
                // Elementos CON modal de confirmación: abrimos el
                // `<ConfirmationModal>` global (montado en
                // SeatingManager.tsx) en lugar de `window.confirm`.
                // El doble-click NO aplica porque el modal ya es
                // la confirmación.
                openConfirmModal({
                  isOpen: true,
                  showConfirmToast: false,
                  title: "⚠️ Mesa con invitados asignados",
                  message: `Esta mesa tiene ${validAssignedCount} invitado(s) asignado(s). Al eliminarla, los invitados quedarán sin mesa asignada. ¿Deseas continuar?`,
                  isDanger: true,
                  action: async () => {
                    removeElement(element.id);
                    onBack();
                  },
                });
                return;
              }

              // Elementos SIN modal previo: exigimos un segundo click
              // como confirmación. El primer click "arma" el botón
              // y muestra el texto de aviso; el segundo ejecuta.
              if (confirming) {
                // Segundo click: limpia el timer y elimina.
                setConfirming(false);
                removeElement(element.id);
                onBack();
                return;
              }

              // Primer click: armar el estado de confirmación y
              // programar el auto-reset a 3 segundos.
              armConfirmingWithTimeout();
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-lg font-bold text-[10px] uppercase tracking-widest transition-colors shadow-sm ${
              hasAssignedGuests
                ? "bg-white border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
                : confirming
                  ? // Estado "armado": fondo rojo sólido para señalar
                    // que el siguiente click elimina.
                    "bg-red-600 border-red-600 text-white hover:bg-red-700"
                  : "bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            }`}
          >
            {hasAssignedGuests ? (
              <AlertTriangle size={12} />
            ) : (
              <Trash2 size={12} />
            )}
            {hasAssignedGuests
              ? "Eliminar elemento"
              : confirming
                ? "Presiona de nuevo para confirmar"
                : "Eliminar elemento"}
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
