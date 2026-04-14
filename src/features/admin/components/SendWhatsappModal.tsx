import { X, BellRing, Info, Unlock, Check } from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useState } from "react";
import Modal from "@/features/shared/components/Modal";

interface SendWhatsappModalProps {
  isOpen: boolean;
  type: "initial" | "reminder";
  guestName: string;
  onClose: () => void;
  onConfirm: (dateStr: string | null, autoBlock: boolean) => void;
}

export default function SendWhatsappModal({
  isOpen,
  type,
  guestName,
  onClose,
  onConfirm,
}: SendWhatsappModalProps) {
  const storageKey =
    type === "initial" ? "whatsapp_initial_date" : "whatsapp_reminder_date";

  const [limitDate, setLimitDate] = useState(
    () => localStorage.getItem(storageKey) || "",
  );
  const [isAutoBlockEnabled, setIsAutoBlockEnabled] = useState(true);

  const isInitial = type === "initial";

  const handleConfirm = () => {
    if (!limitDate) return;
    localStorage.setItem(storageKey, limitDate);
    onConfirm(limitDate, isAutoBlockEnabled);
  };

  return (
    <Modal isOpen={isOpen} onBackdropPress={onClose}>
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
          <b className="text-[#2C2C29]">{guestName}</b>. Selecciona la fecha
          límite de respuesta:
        </p>

        {/* Fecha límite */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-[#C5A669] uppercase tracking-widest mb-2">
            Fecha Límite
          </label>
          <input
            type="date"
            value={limitDate}
            onChange={(e) => setLimitDate(e.target.value)}
            className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-[#2C2C29] focus:outline-none focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] transition-all shadow-sm"
          />
        </div>

        {/* Checkbox de bloqueo automático */}
        <div className="flex items-center justify-between gap-3 mb-6 relative">
          <label className="flex items-start gap-3 cursor-pointer group select-none flex-1">
            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={isAutoBlockEnabled}
                onChange={(e) => setIsAutoBlockEnabled(e.target.checked)}
                className="peer appearance-none w-5 h-5 border border-[#EBE5DA] rounded bg-[#FDFBF7] checked:bg-[#C5A669] checked:border-[#C5A669] transition-colors cursor-pointer"
              />
              <Check
                size={14}
                className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                strokeWidth={3}
              />
            </div>
            <span className="text-sm text-[#5A5A5A] group-hover:text-[#2C2C29] transition-colors leading-snug self-center">
              Bloquear edición automáticamente al pasar la fecha
            </span>
          </label>

          {/* Tooltip */}
          <div className="relative group/tooltip flex items-center justify-center cursor-help shrink-0 p-1">
            <Info
              size={18}
              className="text-[#C5A669] hover:text-[#B39358] transition-colors"
            />
            <div className="absolute bottom-full -right-1.5 mb-2 w-64 p-4 bg-white border border-[#EBE5DA] shadow-[0_10px_40px_-10px_rgba(44,44,41,0.2)] rounded-2xl text-xs text-[#5A5A5A] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none">
              <p className="leading-relaxed mb-2">
                El día siguiente de la fecha que selecciones, se bloquearán las
                ediciones de la familia automáticamente.
              </p>
              <p className="leading-relaxed">
                Para habilitarla de nuevo, haz clic en{" "}
                <Unlock size={10} className="inline mb-0.5" />{" "}
                <b>Cambios bloqueados</b> desde tu panel.
              </p>
              <div className="absolute top-full right-3 border-[6px] border-transparent border-t-white" />
              <div className="absolute top-full right-3 border-[7px] border-transparent border-t-[#EBE5DA] -z-10 mt-[1px]" />
            </div>
          </div>
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
              disabled={!limitDate}
              className={`flex-1 px-4 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none text-sm ${
                isInitial
                  ? "bg-[#C5A669] hover:bg-[#B39358] shadow-[#C5A669]/20"
                  : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
              }`}
            >
              Enviar
            </button>
          </div>
          <button
            onClick={() => onConfirm(null, false)}
            className="w-full py-2.5 text-xs font-bold text-[#A8A29E] hover:text-[#5A5A5A] uppercase tracking-widest transition-colors active:scale-95"
          >
            Omitir fecha y enviar
          </button>
        </div>
      </div>
    </Modal>
  );
}
