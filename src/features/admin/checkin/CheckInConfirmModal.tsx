import { useState } from "react";
import Modal from "@/features/shared/components/Modal";
import {
  UserCheck,
  Minus,
  Plus,
  AlertCircle,
  MapPin,
  Users,
} from "lucide-react";
import { Family } from "@/types";
import Tooltip from "@/features/shared/components/Tooltip";

interface CheckInConfirmModalProps {
  isOpen: boolean;
  family: Family | null;
  isSubmitting: boolean;
  isEventDay: boolean;
  tableAssignments: Record<string, number>;
  onClose: () => void;
  onConfirm: (pasesUsados: number) => void;
}

export default function CheckInConfirmModal({
  isOpen,
  family,
  isSubmitting,
  isEventDay,
  tableAssignments,
  onClose,
  onConfirm,
}: CheckInConfirmModalProps) {
  const [pasesUsados, setPasesUsados] = useState<number>(1);
  const [prevFamilyId, setPrevFamilyId] = useState<string | undefined | null>(
    null,
  );

  // Cálculos de pases
  const totales = family?.confirmados || 0;
  const yaIngresados = family?.pasesUsados || 0;
  const disponibles = totales - yaIngresados;
  const maxAllowed = disponibles > 0 ? disponibles : 0;
  const quedaranDisponibles = maxAllowed - pasesUsados;

  // Evitamos el cascading render (Estado derivado)
  if (family?.id !== prevFamilyId) {
    setPrevFamilyId(family?.id);
    setPasesUsados(maxAllowed > 0 ? maxAllowed : 0);
  }

  if (!family) return null;

  const confirmButtonElement = (
    <button
      type="button"
      onClick={() => onConfirm(pasesUsados)}
      disabled={isSubmitting || !isEventDay || maxAllowed === 0}
      className={`w-full h-full px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 text-xs sm:text-sm bg-[#2C2C29] hover:bg-[#1a1a18] shadow-[#2C2C29]/20 flex items-center justify-center text-center leading-tight ${
        !isEventDay || maxAllowed === 0 || isSubmitting
          ? "pointer-events-none"
          : ""
      }`}
    >
      {isSubmitting ? "Registrando..." : "Autorizar Ingreso"}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onBackdropPress={onClose}>
      <div className="pt-4 sm:pt-6 pb-5 sm:pb-8 px-5 sm:px-8 flex flex-col items-center animate-in fade-in zoom-in duration-300 w-full max-w-md mx-auto max-h-[90dvh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#EBE5DA]">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 w-full">
          <h3 className="text-lg sm:text-2xl shrink-0 font-serif font-bold text-[#2C2C29]">
            {maxAllowed > 0 ? "Confirmar Ingreso" : "Ingreso Completado"}
          </h3>
        </div>

        <p className="text-xs sm:text-sm shrink-0 text-[#5A5A5A] leading-relaxed text-center mb-4 sm:mb-6">
          Invitación de{" "}
          <b className="text-[#2C2C29] text-sm sm:text-base">{family.nombre}</b>
          . <br />
          {maxAllowed > 0
            ? "¿Cuántas personas están ingresando?"
            : "Todos los pases confirmados ya han sido utilizados."}
        </p>

        {/* ASIGNACIÓN DE MESAS */}
        {Object.keys(tableAssignments).length > 0 && (
          <div className="w-full shrink-0 flex flex-col bg-white border-[1.5px] border-[#EBE5DA] rounded-xl sm:rounded-2xl mb-5 sm:mb-8 overflow-hidden shadow-sm">
            <div className="bg-[#FDFBF7] border-b border-[#EBE5DA] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-center gap-1.5">
              <MapPin size={14} className="text-[#C5A669]" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#5A5A5A]">
                Asientos Confirmados
              </span>
            </div>

            <div className="p-2.5 sm:p-4 flex flex-wrap justify-center gap-2 sm:gap-3 bg-white">
              {Object.entries(tableAssignments).map(([table, count]) => (
                <div
                  key={table}
                  className="flex items-stretch rounded-lg overflow-hidden border border-[#EBE5DA] shadow-sm"
                >
                  <div className="bg-[#F9F7F2] px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center justify-center border-r border-[#EBE5DA]">
                    <span className="text-[11px] sm:text-xs font-bold text-[#2C2C29]">
                      {table}
                    </span>
                  </div>
                  <div className="bg-white px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-1">
                    <Users size={12} className="text-charcoal" />
                    <span className="text-[11px] sm:text-xs font-bold text-charcoal">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTADOR GRANDE (Solo visible si hay pases disponibles) */}
        {maxAllowed > 0 && (
          <div className="flex shrink-0 items-center justify-center gap-5 sm:gap-8 mb-5 sm:mb-8">
            <button
              type="button"
              onClick={() => setPasesUsados((p) => Math.max(1, p - 1))}
              disabled={pasesUsados <= 1}
              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full border border-stone-300 text-stone-500 disabled:opacity-20 transition-all active:scale-95 hover:bg-stone-100 shrink-0"
            >
              <Minus size={20} strokeWidth={2} className="sm:hidden" />
              <Minus size={22} strokeWidth={2} className="hidden sm:block" />
            </button>

            <div className="flex flex-col items-center justify-center min-w-[4.5rem] sm:min-w-[5rem]">
              <span className="font-serif text-5xl sm:text-6xl text-[#2C2C29] font-bold leading-none">
                {pasesUsados}
              </span>
              <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-1.5 sm:mt-2">
                Ingresan
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPasesUsados((p) => Math.min(maxAllowed, p + 1))}
              disabled={pasesUsados >= maxAllowed}
              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full border border-stone-300 text-stone-500 disabled:opacity-20 transition-all active:scale-95 hover:bg-stone-100 shrink-0"
            >
              <Plus size={20} strokeWidth={2} className="sm:hidden" />
              <Plus size={22} strokeWidth={2} className="hidden sm:block" />
            </button>
          </div>
        )}

        {/* MENSAJES DINÁMICOS DE LÍMITES */}
        <div className="flex shrink-0 flex-col gap-1.5 sm:gap-2 bg-orange-50 text-orange-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs mb-5 sm:mb-8 border border-orange-200 w-full text-center shadow-sm relative z-10">
          <div className="flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm">
            <AlertCircle size={16} className="shrink-0 sm:hidden" />
            <AlertCircle size={18} className="shrink-0 hidden sm:block" />
            Límite total confirmado: {totales}{" "}
            {totales === 1 ? "pase" : "pases"}
          </div>

          {yaIngresados > 0 && (
            <>
              <div className="w-full h-px bg-orange-200/60 my-0.5" />
              <p className="font-medium text-orange-700 leading-relaxed">
                Ya hay{" "}
                <b className="font-bold text-orange-900">{yaIngresados}</b>{" "}
                {yaIngresados === 1 ? "persona" : "personas"} de esta familia
                adentro.
              </p>
            </>
          )}

          {maxAllowed > 0 && (
            <p className="font-medium text-orange-700 leading-relaxed opacity-90 mt-0.5">
              Ingresando{" "}
              <b className="font-bold text-orange-900">{pasesUsados}</b>{" "}
              {pasesUsados === 1 ? "persona" : "personas"} ahora,
              {quedaranDisponibles === 1 ? " quedará " : " quedarán "}
              <b className="font-bold text-orange-900">
                {quedaranDisponibles}
              </b>{" "}
              {quedaranDisponibles === 1
                ? "pase disponible."
                : "pases disponibles."}
            </p>
          )}
        </div>

        {/* BOTONES */}
        {maxAllowed > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-auto shrink-0">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full h-full px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] text-[#2C2C29] font-bold hover:bg-white transition-colors shadow-sm text-xs sm:text-sm flex items-center justify-center text-center leading-tight"
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
              <div className="w-full h-full">{confirmButtonElement}</div>
            )}
          </div>
        ) : (
          <div className="w-full mt-auto shrink-0">
            <button
              onClick={onClose}
              className="w-full h-full px-4 py-3.5 rounded-xl border border-[#EBE5DA] bg-[#FDFBF7] text-[#2C2C29] font-bold hover:bg-white transition-colors shadow-sm text-sm flex items-center justify-center text-center leading-tight"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
