import { BellRing, Info } from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useState } from "react";
import Modal from "@/features/shared/components/Modal";
import DatePicker from "../../DatePicker";

interface SendWhatsappModalProps {
  isOpen: boolean;
  type: "initial" | "reminder";
  familyName: string;
  onClose: () => void;
  onConfirm: (dateStr: string | null) => void;
  loadingPhone?: boolean;
  phoneError?: string | null;
}

export default function SendWhatsappModal({
  isOpen,
  type,
  familyName,
  onClose,
  onConfirm,
  loadingPhone = false,
  phoneError = null,
}: SendWhatsappModalProps) {
  const storageKey =
    type === "initial" ? "whatsapp_initial_date" : "whatsapp_reminder_date";

  const [limitDate, setLimitDate] = useState(
    () => localStorage.getItem(storageKey) || "",
  );

  const isInitial = type === "initial";

  const isDateInPast = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date().toLocaleDateString("en-CA");
    return dateStr < today;
  };

  const handleConfirm = () => {
    // Si hay fecha y está en el pasado, bloqueamos (validación).
    // Si NO hay fecha, enviamos sin deadline (botón sigue activo).
    if (limitDate && isDateInPast(limitDate)) return;
    if (limitDate) localStorage.setItem(storageKey, limitDate);
    onConfirm(limitDate || null);
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
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${
              isInitial
                ? "bg-[#E7F3EF] text-[#2D5B4F] border-[#CFE5DD]"
                : "bg-[#FFF8E1] text-[#B78103] border-[#FFECB3]"
            }`}
          >
            {isInitial ? (
              <IconBrandWhatsapp size={22} />
            ) : (
              <BellRing size={22} />
            )}
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2C2C29]">
            {isInitial ? "Enviar Invitación" : "Enviar Recordatorio"}
          </h3>
        </div>

        {/* Descripción */}
        <p className="text-sm text-[#5A5A5A] mb-4 leading-relaxed">
          Se enviará un {isInitial ? "mensaje" : "recordatorio"} a{" "}
          <b className="text-[#2C2C29]">{familyName}</b>.
        </p>

        {/* Error del pre-fetch del teléfono */}
        {phoneError && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{phoneError}</span>
          </div>
        )}

        {/* Indicador de carga del teléfono */}
        {/* {loadingPhone && (
          <div className="mb-4 flex items-center gap-2 text-xs text-[#A8A29E]">
            <Loader2 size={14} className="animate-spin shrink-0" />
            <span>Verificando celular del invitado…</span>
          </div>
        )} */}

        {/* Fecha límite (Componente personalizado) */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-[#C5A669] uppercase tracking-widest mb-2">
            Fecha Límite{" "}
            <span className="font-normal normal-case text-[#A8A29E]">
              (Opcional)
            </span>
          </label>
          <DatePicker
            value={limitDate}
            onChange={setLimitDate}
            hasError={isDateInPast(limitDate)}
          />
          {isDateInPast(limitDate) ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 mt-2">
              <Info size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700 leading-relaxed">
                La fecha seleccionada ya pasó. Elige una fecha futura
                o déjala vacía para enviar sin límite.
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

        {/* Botones */}
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
              disabled={
                (limitDate && isDateInPast(limitDate)) ||
                loadingPhone ||
                !!phoneError
              }
              className={`flex-1 px-4 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none text-sm flex items-center justify-center gap-2 ${
                isInitial
                  ? "bg-[#C5A669] hover:bg-[#B39358] shadow-[#C5A669]/20"
                  : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
              }`}
            >
              {loadingPhone ? "Cargando…" : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
