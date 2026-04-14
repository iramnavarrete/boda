import React, { memo, useCallback } from "react";
import {
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
} from "lucide-react";
import { Guest } from "@/types";
import { useRouter } from "next/router";
import { cn } from "@heroui/theme";
import { GuestActionButtons, GuestLockButton } from "./GuestActionButtons";
import PartialConfirmationBadge from "./PartialConfirmationBadge";
import { isPartialConfirmation } from "@/utils/guest";

interface GuestsTableViewProps {
  filteredGuests: Guest[];
  selectedGuests: Set<string>;
  onSelectGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onSendReminder: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
}

interface GuestRowProps {
  guest: Guest;
  isSelected: boolean;
  isAnySelected: boolean;
  invitationId: string | string[] | undefined;
  onSelectGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onSendReminder: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
}

const statusStyles = (g: Guest) => {
  const partial = isPartialConfirmation(g);
  return g.asistencia === null
    ? "bg-paper/30 text-gold border-gold/20"
    : g.asistencia === true && partial
      ? "bg-orange-50 text-orange-800 border-orange-100"
      : g.asistencia === true && !partial
        ? "bg-primary-50 text-primary border-primary-100"
        : "bg-danger-50 text-danger-700 border-danger-100";
};

const GuestRow = memo(
  ({
    guest: g,
    isSelected,
    isAnySelected,
    invitationId,
    onSelectGuest,
    onEdit,
    onDelete,
    onSendWhatsApp,
    onSendReminder,
    onLockToggle,
  }: GuestRowProps) => {
    return (
      <tr
        onClick={() => (isAnySelected ? onSelectGuest(g.id) : onEdit(g))}
        className={cn(
          "border-b last:border-b-0 border-[#EBE5DA] transition-colors cursor-pointer group",
          isSelected ? "bg-[#FDFBF7]" : "hover:bg-[#F9F7F2]/50 bg-white",
        )}
      >
        {/* Checkbox */}
        <td className="p-4 text-center align-middle">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectGuest(g.id);
            }}
            className={cn(
              "p-1 rounded-lg transition-colors",
              isSelected
                ? "text-[#2C2C29]"
                : "text-[#A8A29E] group-hover:text-[#2C2C29]",
            )}
          >
            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
          </button>
        </td>

        {/* Nombre */}
        <td className="p-2 align-middle">
          <h3
            className={cn(
              "font-serif text-base font-bold leading-snug transition-colors",
              isSelected ? "text-[#C5A669]" : "text-[#2C2C29]",
            )}
          >
            {g.nombre}
          </h3>
        </td>

        {/* Etiqueta */}
        <td className="p-2 align-middle">
          {g.etiqueta || isPartialConfirmation(g) ? (
            <div className="flex flex-wrap items-center gap-1">
              {g.etiqueta && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#EBE5DA] bg-[#FDFBF7] text-[#C5A669]">
                  <Tag size={10} />
                  {g.etiqueta}
                </span>
              )}
              <PartialConfirmationBadge guest={g} />
            </div>
          ) : (
            <span className="inline-flex items-center  max-w-fit gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-dashed border-[#DDD8D0] text-[#C8C2BA]">
              Sin etiquetas
            </span>
          )}
        </td>

        {/* Asistencia */}
        <td className="p-2 align-middle">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
              statusStyles(g),
            )}
          >
            {g.asistencia === null ? (
              <Clock size={12} />
            ) : g.asistencia === true ? (
              <CheckCircle2 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            <span>
              {g.asistencia === true ? g.confirmados : 0}/{g.invitados}
            </span>
          </span>
        </td>

        {/* Edición */}
        <td className="p-2 align-middle">
          <fieldset
            disabled={isAnySelected}
            className="disabled:opacity-30 disabled:pointer-events-none"
          >
            <GuestLockButton
              guest={g}
              onClick={(e) => {
                e.stopPropagation();
                onLockToggle(g);
              }}
            />
          </fieldset>
        </td>

        {/* Acciones */}
        <td className="p-2 align-middle text-right">
          <fieldset
            disabled={isAnySelected}
            className="disabled:opacity-30 disabled:pointer-events-none"
          >
            <GuestActionButtons
              guest={g}
              invitationId={invitationId}
              onSendWhatsApp={onSendWhatsApp}
              onSendReminder={onSendReminder}
              onDelete={onDelete}
            />
          </fieldset>
        </td>
      </tr>
    );
  },
  (prev, next) =>
    prev.guest === next.guest &&
    prev.isSelected === next.isSelected &&
    prev.isAnySelected === next.isAnySelected,
);

GuestRow.displayName = "GuestRow";

const GuestsTableView: React.FC<GuestsTableViewProps> = ({
  filteredGuests: guests = [],
  selectedGuests,
  onSelectGuest,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onSendReminder,
  onLockToggle,
}) => {
  const { query } = useRouter();
  const isAnySelected = selectedGuests.size > 0;

  const handleSelect = useCallback(
    (id: string) => onSelectGuest(id),
    [onSelectGuest],
  );
  const handleEdit = useCallback((g: Guest) => onEdit(g), [onEdit]);
  const handleDelete = useCallback((g: Guest) => onDelete(g), [onDelete]);
  const handleWhatsApp = useCallback(
    (g: Guest) => onSendWhatsApp(g),
    [onSendWhatsApp],
  );
  const handleReminder = useCallback(
    (g: Guest) => onSendReminder(g),
    [onSendReminder],
  );
  const handleLock = useCallback((g: Guest) => onLockToggle(g), [onLockToggle]);

  if (!Array.isArray(guests)) return null;

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-white border border-[#EBE5DA] shadow-sm">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[#FDFBF7] border-b border-[#EBE5DA] text-[10px] uppercase tracking-widest text-[#A8A29E] select-none">
            <th className="p-3 w-14 text-center" />
            <th className="p-3 font-bold text-[#5A5A5A]">Familia</th>
            <th className="p-3 font-bold text-[#5A5A5A]">Etiqueta</th>
            <th className="p-3 font-bold text-[#5A5A5A]">Asistencia</th>
            <th className="p-3 font-bold text-[#5A5A5A]">Edición</th>
            <th className="p-3 font-bold text-[#5A5A5A] text-right">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {guests.map((g) => (
            <GuestRow
              key={g.id}
              guest={g}
              isSelected={selectedGuests.has(g.id)}
              isAnySelected={isAnySelected}
              invitationId={query.invitationId}
              onSelectGuest={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSendWhatsApp={handleWhatsApp}
              onSendReminder={handleReminder}
              onLockToggle={handleLock}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GuestsTableView;
