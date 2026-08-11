import React, { memo, useRef } from "react";
import {
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  SearchX,
  Users,
} from "lucide-react";
import { Family } from "@/types";
import { useRouter } from "next/router";
import { cn } from "@heroui/theme";
import PartialConfirmationBadge from "./PartialConfirmationBadge";
import { isPartialConfirmation } from "@/utils/family";
import { FamilyActionButtons, FamilyLockButton } from "./FamilyActionButtons";
import { useWeddingAdminContext } from "../context/WeddingAdminContext";
import { useVirtualizer } from "@tanstack/react-virtual";

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
        <td className="p-3 align-middle">
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
        <td className="p-3 align-middle">
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
            <span className="inline-flex items-center max-w-fit gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-dashed border-[#DDD8D0] text-[#C8C2BA]">
              Sin etiquetas
            </span>
          )}
        </td>

        {/* Asistencia */}
        <td className="p-3 align-middle">
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
        <td className="p-3 align-middle">
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
        <td className="p-3 align-middle pr-4">
          <fieldset
            disabled={isAnySelected}
            className="flex justify-end disabled:opacity-30 disabled:pointer-events-none"
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

const FamiliesTableView: React.FC = () => {
  const {
    families, // 🔥 Traemos el arreglo total de la base de datos
    isLoadingFamilies, // 🔥 Traemos el estado de carga
    selectedFamilies,
    handleSelectFamily,
    handleLockToggle,
    finalFilteredFamilies,
    handleEdit,
    handleDeleteFamily,
    whatsapp,
  } = useWeddingAdminContext();

  const { query } = useRouter();
  const isAnySelected = selectedFamilies.size > 0;

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: finalFilteredFamilies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  // ==========================================================================
  // ESTADOS VACÍOS (Loading, Base de datos vacía, Búsqueda vacía)
  // ==========================================================================

  // 1. Cargando datos iniciales
  if (isLoadingFamilies) {
    return (
      <div className="w-full rounded-2xl bg-white border border-[#EBE5DA] shadow-sm flex items-center justify-center h-[calc(100dvh-360px)] md:h-[calc(100dvh-240px)]">
        <div className="w-8 h-8 border-4 border-[#EBE5DA] border-t-[#C5A669] rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Base de datos vacía (Aún no hay invitados creados)
  if (!families || families.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-white border border-[#EBE5DA] shadow-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 h-[calc(100dvh-360px)] md:h-[calc(100dvh-240px)]">
        <div className="w-16 h-16 bg-[#FDFBF7] border border-[#EBE5DA] rounded-full flex items-center justify-center mb-4 shadow-sm text-[#C5A669]">
          <Users size={32} />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-2">
          Aún no tienes familias
        </h3>
        <p className="text-sm text-[#5A5A5A] max-w-sm leading-relaxed">
          Comienza agregando a tus invitados haciendo clic en el botón{" "}
          <b className="text-[#2C2C29]">&quot;+ Nueva Familia&quot;</b> en la parte
          superior.
        </p>
      </div>
    );
  }

  // 3. Hay invitados en la DB, pero los filtros no arrojan resultados
  if (finalFilteredFamilies.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-white border border-[#EBE5DA] shadow-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 h-[calc(100dvh-360px)] md:h-[calc(100dvh-240px)]">
        <div className="w-16 h-16 bg-[#FDFBF7] border border-[#EBE5DA] rounded-full flex items-center justify-center mb-4 shadow-sm text-[#A8A29E]">
          <SearchX size={32} />
        </div>
        <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-sm text-[#5A5A5A] max-w-sm leading-relaxed">
          Ninguna familia coincide con tu búsqueda o filtros actuales. Intenta
          limpiarlos para ver el listado completo.
        </p>
      </div>
    );
  }

  // ==========================================================================
  // RENDERIZADO DE LA TABLA
  // ==========================================================================

  return (
    <div className="w-full rounded-2xl bg-white border border-[#EBE5DA] shadow-sm overflow-hidden flex flex-col h-[calc(100dvh-360px)] md:h-[calc(100dvh-240px)]">
      <div
        ref={parentRef}
        className="w-full h-full overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-[#EBE5DA]"
      >
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead className="sticky top-0 z-50 shadow-sm">
            <tr className="bg-[#FDFBF7] border-b border-[#EBE5DA] text-[10px] uppercase tracking-widest text-[#A8A29E] select-none">
              <th className="p-3 w-14 text-center" />
              <th className="p-3 font-bold text-[#5A5A5A]">Familia</th>
              <th className="p-3 font-bold text-[#5A5A5A]">Etiqueta</th>
              <th className="p-3 font-bold text-[#5A5A5A]">Asistencia</th>
              <th className="p-3 font-bold text-[#5A5A5A]">Edición</th>
              <th className="p-3 pr-4 font-bold text-[#5A5A5A] text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} colSpan={6} />
              </tr>
            )}

            {virtualRows.map((virtualRow) => {
              const g = finalFilteredFamilies[virtualRow.index];
              return (
                <FamilyRow
                  key={g.id}
                  family={g}
                  isSelected={selectedFamilies.has(g.id)}
                  isAnySelected={isAnySelected}
                  invitationId={query.invitationId}
                  onSelectFamily={handleSelectFamily}
                  onEdit={handleEdit}
                  onDelete={handleDeleteFamily}
                  onSendWhatsApp={(g) => whatsapp.open(g, "initial")}
                  onSendReminder={(g) => whatsapp.open(g, "reminder")}
                  onLockToggle={handleLockToggle}
                />
              );
            })}

            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} colSpan={6} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FamiliesTableView;
