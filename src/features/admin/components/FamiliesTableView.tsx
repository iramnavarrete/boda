import React, { memo, useCallback } from "react";
import {
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
} from "lucide-react";
import { Family } from "@/types";
import { useRouter } from "next/router";
import { cn } from "@heroui/theme";
import PartialConfirmationBadge from "./PartialConfirmationBadge";
import { isPartialConfirmation } from "@/utils/family";
import { FamilyActionButtons, FamilyLockButton } from "./FamilyActionButtons";

interface FamiliesTableViewProps {
  filteredFamilies: Family[];
  selectedFamilies: Set<string>;
  onSelectFamily: (id: string) => void;
  onEdit: (family: Family) => void;
  onDelete: (family: Family) => void;
  onSendWhatsApp: (family: Family) => void;
  onSendReminder: (family: Family) => void;
  onLockToggle: (family: Family) => void;
}

interface FamilyRowProps {
  family: Family;
  isSelected: boolean;
  isAnySelected: boolean;
  invitationId: string | string[] | undefined;
  onSelectFamily: (id: string) => void;
  onEdit: (family: Family) => void;
  onDelete: (family: Family) => void;
  onSendWhatsApp: (family: Family) => void;
  onSendReminder: (family: Family) => void;
  onLockToggle: (family: Family) => void;
}

const statusStyles = (f: Family) => {
  const partial = isPartialConfirmation(f);
  return f.asistencia === null
    ? "bg-paper/30 text-gold border-gold/20"
    : f.asistencia === true && partial
      ? "bg-orange-50 text-orange-800 border-orange-100"
      : f.asistencia === true && !partial
        ? "bg-primary-50 text-primary border-primary-100"
        : "bg-danger-50 text-danger-700 border-danger-100";
};

const FamilyRow = memo(
  ({
    family: f,
    isSelected,
    isAnySelected,
    invitationId,
    onSelectFamily,
    onEdit,
    onDelete,
    onSendWhatsApp,
    onSendReminder,
    onLockToggle,
  }: FamilyRowProps) => {
    return (
      <tr
        onClick={() => (isAnySelected ? onSelectFamily(f.id) : onEdit(f))}
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
              onSelectFamily(f.id);
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
            {f.nombre}
          </h3>
        </td>

        {/* Etiqueta */}
        <td className="p-2 align-middle">
          {f.etiqueta || isPartialConfirmation(f) ? (
            <div className="flex flex-wrap items-center gap-1">
              {f.etiqueta && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#EBE5DA] bg-[#FDFBF7] text-[#C5A669]">
                  <Tag size={10} />
                  {f.etiqueta}
                </span>
              )}
              <PartialConfirmationBadge family={f} />
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
              statusStyles(f),
            )}
          >
            {f.asistencia === null ? (
              <Clock size={12} />
            ) : f.asistencia === true ? (
              <CheckCircle2 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            <span>
              {f.asistencia === true ? f.confirmados : 0}/{f.invitados}
            </span>
          </span>
        </td>

        {/* Edición */}
        <td className="p-2 align-middle">
          <fieldset
            disabled={isAnySelected}
            className="disabled:opacity-30 disabled:pointer-events-none"
          >
            <FamilyLockButton
              family={f}
              onClick={(e) => {
                e.stopPropagation();
                onLockToggle(f);
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
            <FamilyActionButtons
              family={f}
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
    prev.family === next.family &&
    prev.isSelected === next.isSelected &&
    prev.isAnySelected === next.isAnySelected,
);

FamilyRow.displayName = "FamilyRow";

const FamiliesTableView: React.FC<FamiliesTableViewProps> = ({
  filteredFamilies: families = [],
  selectedFamilies,
  onSelectFamily,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onSendReminder,
  onLockToggle,
}) => {
  const { query } = useRouter();
  const isAnySelected = selectedFamilies.size > 0;

  const handleSelect = useCallback(
    (id: string) => onSelectFamily(id),
    [onSelectFamily],
  );
  const handleEdit = useCallback((g: Family) => onEdit(g), [onEdit]);
  const handleDelete = useCallback((g: Family) => onDelete(g), [onDelete]);
  const handleWhatsApp = useCallback(
    (g: Family) => onSendWhatsApp(g),
    [onSendWhatsApp],
  );
  const handleReminder = useCallback(
    (g: Family) => onSendReminder(g),
    [onSendReminder],
  );
  const handleLock = useCallback((g: Family) => onLockToggle(g), [onLockToggle]);

  if (!Array.isArray(families)) return null;

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
          {families.map((g) => (
            <FamilyRow
              key={g.id}
              family={g}
              isSelected={selectedFamilies.has(g.id)}
              isAnySelected={isAnySelected}
              invitationId={query.invitationId}
              onSelectFamily={handleSelect}
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

export default FamiliesTableView;
