import React, { useState } from "react";
import {
  SeatingElement,
  useSeatingStore,
} from "../../stores/useSeatingStore";
import { useSeatingModalContext } from "../SeatingModalContext";
import { Trash2, Users, RotateCcw, Edit2, X } from "lucide-react";
import Tooltip from "@/features/shared/components/Tooltip";
import { GuestStatus } from "@/types";

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
  const families = useSeatingStore((state) => state.families);
  const showToast = useSeatingStore((state) => state.showToast);
  const [numberValue, setNumberValue] = useState(
    element.alias.replace(/\D/g, ""),
  );

  // Obtenemos el total de invitados que realmente existen (sin contar fantasmas)
  const validAssignedCount = isTable
    ? element.assignedSeats.filter((seatId) => {
        if (!seatId || seatId === "") return false;
        return families.some((f) => f.guests.some((g) => g.id === seatId));
      }).length
    : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);

    // Validamos el tamaño de la mesa contra el conteo real purgado
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

  const allSeats: SeatItemData[] = Array.from(
    { length: element.seats },
    (_, i) => {
      const guestId = element.assignedSeats[i];
      if (!guestId) return { seatNumber: i + 1, isAssigned: false };

      let guestInfo: SeatGuestInfo | null = null;
      for (const f of families) {
        const g = f.guests.map(el => ({id: el.id, name: el.nombre, status: el.estatus })).find((gu) => gu.id === guestId);
        if (g) {
          guestInfo = {
            ...g,
            familyId: f.id,
            familyName: f.name,
            colorBg: f.colorBg,
            colorBorder: f.colorBorder,
            index: f.guests.findIndex((gu) => gu.id === guestId),
          };
          break;
        }
      }

      // Si se encontró un ID en la silla, pero NO pertenece a un invitado real (fantasma),
      // lo forzamos a mostrarse libre.
      const isAssigned = !!guestInfo;

      return {
        seatNumber: i + 1,
        isAssigned,
        guestId: isAssigned ? guestId : undefined,
        guest: guestInfo,
      };
    },
  );

  return (
    <div
      className="settings-popover absolute z-[100]"
      style={{
        bottom: "calc(100% + 14px)",
        left: "50%",
        transform: "translateX(-50%)",
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
                {isTable ? "Número de mesa" : "Nombre / Alias"}
              </label>

              {isTable ? (
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
                      // Al perder el foco, si quedó vacío restauramos el valor actual
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
                  placeholder="Nombre del área"
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

        {isTable && (
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
                    // 🔥 4. Calculamos el ancho de la barra ocupada ignorando a los fantasmas
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

        {isTable && (
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
