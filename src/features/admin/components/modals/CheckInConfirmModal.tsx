import { useState } from "react";
import Modal from "@/features/shared/components/Modal";
import { UserCheck, Minus, Plus, AlertCircle } from "lucide-react";
import { Guest } from "@/types";
import Tooltip from "@/features/shared/components/Tooltip";

interface CheckInConfirmModalProps {
  isOpen: boolean;
  guest: Guest | null;
  isSubmitting: boolean;
  isEventDay: boolean;
  onClose: () => void;
  onConfirm: (pasesUsados: number) => void;
}

export default function CheckInConfirmModal({
  isOpen,
  guest,
  isSubmitting,
  isEventDay,
  onClose,
  onConfirm,
}: CheckInConfirmModalProps) {
  const [pasesUsados, setPasesUsados] = useState<number>(1);
  const [prevGuestId, setPrevGuestId] = useState<string | undefined | null>(
    null,
  );

  // Evitamos el cascading render
  if (guest?.id !== prevGuestId) {
    setPrevGuestId(guest?.id);
    if (guest) {
      setPasesUsados(guest.confirmados || 1);
    } else {
      setPasesUsados(1);
    }
  }

  if (!guest) return null;

  const maxAllowed = guest.confirmados || 0;

  const confirmButtonElement = (
    <button
      type="button"
      onClick={() => onConfirm(pasesUsados)}
      disabled={isSubmitting || !isEventDay}
      className="w-full h-full px-2 sm:px-4 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 text-xs sm:text-sm bg-[#2C2C29] hover:bg-[#1a1a18] shadow-[#2C2C29]/20 flex items-center justify-center text-center leading-tight"
    >
      {isSubmitting ? "Registrando..." : "Autorizar Ingreso"}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onBackdropPress={onClose}>
      <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 rounded-full flex items-center justify-center border shadow-sm bg-[#FDFBF7] text-[#C5A669] border-[#C5A669]/30 mb-4">
          <UserCheck size={24} />
        </div>

        <h3 className="text-xl font-serif font-bold text-[#2C2C29] mb-4">
          Confirmar Ingreso
        </h3>

        <p className="text-sm text-[#5A5A5A] mb-8 leading-relaxed text-center">
          Familia <b className="text-[#2C2C29] text-base">{guest.nombre}</b>.{" "}
          <br />
          ¿Cuántas personas están ingresando?
        </p>

        <div className="flex items-center justify-center gap-8 mb-8">
          <button
            type="button"
            onClick={() => setPasesUsados((p) => Math.max(1, p - 1))}
            disabled={pasesUsados <= 1}
            className="w-14 h-14 flex items-center justify-center rounded-full border border-stone-400 text-stone-500 disabled:opacity-20 transition-all active:scale-95 hover:bg-stone-100 shrink-0"
          >
            <Minus size={22} strokeWidth={2} />
          </button>

          <div className="flex flex-col items-center justify-center min-w-[5rem]">
            <span className="font-serif text-6xl text-charcoal font-bold leading-none">
              {pasesUsados}
            </span>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-2">
              Ingresan
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPasesUsados((p) => Math.min(maxAllowed, p + 1))}
            disabled={pasesUsados >= maxAllowed}
            className="w-14 h-14 flex items-center justify-center rounded-full border border-stone-400 text-stone-500 disabled:opacity-20 transition-all active:scale-95 hover:bg-stone-100 shrink-0"
          >
            <Plus size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-orange-50 text-orange-800 px-4 py-2.5 rounded-xl text-xs font-medium mb-8 border border-orange-200 w-full justify-center">
          <AlertCircle size={16} className="shrink-0" />
          Límite total confirmado: {maxAllowed} pases.
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full h-full px-2 sm:px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] text-[#2C2C29] font-bold hover:bg-white transition-colors shadow-sm text-xs sm:text-sm flex items-center justify-center text-center leading-tight"
          >
            Cancelar
          </button>

          {!isEventDay ? (
            <Tooltip
              text="El botón de ingreso se habilitará automáticamente el día del evento."
              position="top"
              className="w-full h-full block"
            >
              {confirmButtonElement}
            </Tooltip>
          ) : (
            <div className="w-full h-full">
              {confirmButtonElement}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}