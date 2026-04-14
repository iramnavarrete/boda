import Modal from "@/features/shared/components/Modal";
import { Guest } from "@/types";
import { Unlock, X } from "lucide-react";
import { useEffect, useState } from "react";

interface UnlockChangesModalProps {
  isOpen: boolean;
  guest: Guest | null;
  isBulk: boolean;
  onClose: () => void;
  onConfirm: (newDate: string | null) => void;
}

const UnlockChangesModal = ({
  isOpen,
  guest,
  isBulk,
  onClose,
  onConfirm,
}: UnlockChangesModalProps) => {
  const [limitDate, setLimitDate] = useState("");

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
          Para permitir que{" "}
          {isBulk ? (
            "las familias seleccionadas modifiquen su"
          ) : (
            <>
              <b>{guest?.nombre}</b> modifique su
            </>
          )}{" "}
          respuesta, asigna una nueva fecha límite de confirmación.
        </p>
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-[#C5A669] uppercase tracking-widest mb-2">
            Nueva Fecha Límite
          </label>
          <input
            type="date"
            value={limitDate}
            onChange={(e) => setLimitDate(e.target.value)}
            className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-[#2C2C29] focus:outline-none focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] transition-all shadow-sm"
          />
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
              onClick={() => onConfirm(limitDate)}
              disabled={!limitDate}
              className="flex-1 px-4 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none text-sm bg-[#C5A669] hover:bg-[#B39358] shadow-[#C5A669]/20"
            >
              Confirmar
            </button>
          </div>
          <button
            onClick={() => onConfirm(null)}
            className="w-full py-2.5 text-xs font-bold text-[#A8A29E] hover:text-[#5A5A5A] uppercase tracking-widest transition-colors active:scale-95"
          >
            Omitir fecha y desbloquear
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UnlockChangesModal;
