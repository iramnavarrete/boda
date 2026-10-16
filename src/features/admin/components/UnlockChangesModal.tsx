import Modal from "@/features/shared/components/Modal";
import { Family } from "@/types";
import { Unlock, Info } from "lucide-react";
import { useState } from "react";
import DatePicker from "./DatePicker";
import { isDateInPast } from "@/features/admin/utils/dateComparison";

interface UnlockChangesModalProps {
  isOpen: boolean;
  family: Family | null;
  isBulk: boolean;
  onClose: () => void;
  onConfirm: (newDate: string | null) => void;
}

const UnlockChangesModal = ({
  isOpen,
  family,
  isBulk,
  onClose,
  onConfirm,
}: UnlockChangesModalProps) => {
  const [limitDate, setLimitDate] = useState("");

  const isDateInvalid = isDateInPast(limitDate);

  // Si hay fecha y está en el pasado, bloqueamos (validación).
  // Si NO hay fecha, desbloqueamos sin deadline (botón sigue activo).
  const handleConfirm = () => {
    if (limitDate && isDateInvalid) return;
    onConfirm(limitDate || null);
  };

  return (
    <Modal isOpen={isOpen} onBackdropPress={onClose}>
      <div className="p-8">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 border shadow-sm bg-[#E7F3EF] text-[#2D5B4F] border-[#CFE5DD]">
          <Unlock size={28} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-[#2C2C29] mb-2">
          Habilitar Edición
        </h3>
        <p className="text-sm text-[#5A5A5A] mb-6 leading-relaxed">
          ¿Deseas permitir que{" "}
          {isBulk ? (
            "las familias seleccionadas modifiquen su"
          ) : (
            <>
              <b>{family?.nombre}</b> modifique su
            </>
          )}{" "}
          respuesta?
        </p>
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-[#C5A669] uppercase tracking-widest mb-2">
            Nueva Fecha Límite{" "}
            <span className="font-normal normal-case text-[#A8A29E]">
              (Opcional)
            </span>
          </label>
          <DatePicker
            value={limitDate}
            onChange={setLimitDate}
            hasError={isDateInvalid}
          />
          {isDateInvalid ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 mt-2">
              <Info size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700 leading-relaxed">
                La fecha seleccionada ya pasó. Elige una fecha futura
                o déjala vacía para desbloquear sin límite.
              </p>
            </div>
          ) : (
            <div className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-3 flex gap-2 mt-2">
              <Info size={14} className="text-[#C5A669] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#5A5A5A] leading-relaxed">
                Si configuras la fecha límite, se bloquearán los cambios
                automáticamente al pasar la fecha indicada.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] text-[#2C2C29] font-bold hover:bg-white hover:border-[#C5A669]/50 transition-colors shadow-sm text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!!limitDate && isDateInvalid}
              className="flex-1 px-4 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all text-sm bg-[#C5A669] hover:bg-[#B39358] shadow-[#C5A669]/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UnlockChangesModal;
