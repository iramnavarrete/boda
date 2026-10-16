"use client";

import { useState } from "react";
import { Calendar, Trash2, Loader2, Info } from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import DatePicker from "../../DatePicker";

interface BulkDeadlineModalProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (dateStr: string | null) => Promise<void>;
}

/**
 * Modal para asignar o quitar la fecha límite de confirmación de
 * forma masiva.
 *
 * El admin elige UNA fecha compartida para N familias. Tanto al
 * "Aplicar" como al "Quitar fecha límite":
 *   - Se persiste `fechaLimiteConfirmacion` en cada familia
 *     (la fecha o `null` respectivamente).
 *   - Se setea `cambiosPermitidos = true` (se reactivan los cambios
 *     de asistencia en las familias seleccionadas, alineado con el
 *     envío de WhatsApp).
 *
 * Cuando se aplica fecha, el bloqueo efectivo al pasar la fecha
 * lo dispara `useExpiredFamiliesWatcher`.
 *
 * Botones: Cancelar | Aplicar | Quitar fecha límite a las N familias
 */
export default function BulkDeadlineModal({
  isOpen,
  count,
  onClose,
  onConfirm,
}: BulkDeadlineModalProps) {
  const storageKey = "bulk_deadline_date";
  const [limitDate, setLimitDate] = useState(
    () => localStorage.getItem(storageKey) || "",
  );
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!limitDate) return;
    setSubmitting(true);
    try {
      await onConfirm(limitDate);
      localStorage.setItem(storageKey, limitDate);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = async () => {
    setSubmitting(true);
    try {
      await onConfirm(null);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onBackdropPress={onClose}
      innerContainerClassName="overflow-visible"
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center border shadow-sm bg-[#E7F3EF] text-[#2D5B4F] border-[#CFE5DD]">
            <Calendar size={22} />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2C2C29]">
            Fecha Limite de Confirmacion
          </h3>
        </div>

        {/* Descripcion */}
        <p className="text-sm text-[#5A5A5A] mb-4 leading-relaxed">
          Establece una fecha limite de confirmacion para las{" "}
          <b className="text-[#2C2C29]">{count}</b> familias seleccionadas. Las
          familias NO podran confirmar ni modificar su mensaje despues de
          esa fecha.
        </p>

        {/* Aviso: side-effect compartido por ambos botones */}
        <div className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-3 flex gap-2 mb-4">
          <Info size={14} className="text-[#C5A669] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#5A5A5A] leading-relaxed">
            Al aplicar <b>o quitar</b> la fecha, se <b>habilitarán los
            cambios</b> en las {count} familias seleccionadas (si
            estaban bloqueadas). Al pasar la fecha límite, los cambios
            se bloquearán automáticamente.
          </p>
        </div>

        {/* Fecha limite (Componente personalizado) */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-[#C5A669] uppercase tracking-widest mb-2">
            Fecha Limite
          </label>
          <DatePicker value={limitDate} onChange={setLimitDate} />
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] text-[#2C2C29] font-bold hover:bg-white hover:border-[#C5A669]/50 transition-colors shadow-sm text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!limitDate || submitting}
              className="flex-1 px-4 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none text-sm flex items-center justify-center gap-2 bg-[#C5A669] hover:bg-[#B39358] shadow-[#C5A669]/20"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Calendar size={16} />
              )}
              Aplicar
            </button>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={submitting}
            className="w-full py-2.5 text-xs font-bold text-[#A8A29E] hover:text-red-600 uppercase tracking-widest transition-colors active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Trash2 size={12} />
            Quitar fecha límite a las {count} familias
          </button>
        </div>
      </div>
    </Modal>
  );
}