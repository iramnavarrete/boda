import { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@heroui/theme";

export interface UnassignOptions {
  includeNoDeadline: boolean;
  includePendingNotExpired: boolean;
  includePendingExpired: boolean;
}

interface UnassignDeclinedPanelProps {
  onClose: () => void;
  onConfirm: (options: UnassignOptions) => void;
}

const CustomCheckbox = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  description?: React.ReactNode;
}) => (
  <div
    onClick={onChange}
    className="flex items-start gap-3 cursor-pointer group p-1.5 -ml-1.5 rounded-lg hover:bg-[#F9F7F2] transition-colors"
  >
    <div
      className={cn(
        "mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-200",
        checked
          ? "bg-[#C5A669] border-[#C5A669] text-white shadow-sm"
          : "bg-white border-[#EBE5DA] group-hover:border-[#C5A669]",
      )}
    >
      {checked && <Check size={12} strokeWidth={3.5} />}
    </div>
    <div className="flex flex-col select-none">
      <span className="text-[11px] font-medium text-[#2C2C29] leading-tight">
        {label}
      </span>
      {description && (
        <span className="text-[10px] text-[#A8A29E] mt-0.5 leading-tight">
          {description}
        </span>
      )}
    </div>
  </div>
);

export function UnassignDeclinedPanel({
  onClose,
  onConfirm,
}: UnassignDeclinedPanelProps) {
  const [options, setOptions] = useState<UnassignOptions>({
    includeNoDeadline: false,
    includePendingNotExpired: false,
    includePendingExpired: true,
  });

  const handleToggle = (key: keyof UnassignOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Componente interno para checkboxes personalizados y elegantes

  return (
    <div className="mx-4 mb-4 p-4 bg-white border border-[#EBE5DA] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Título */}
      <h3 className="text-xs font-bold text-[#2C2C29] mb-2 flex items-center gap-1.5">
        <AlertCircle size={14} className="text-[#C5A669]" />
        Liberar asientos declinados
      </h3>

      {/* Descripción principal */}
      <p className="text-[10px] text-[#A8A29E] mb-3 leading-relaxed">
        Selecciona de qué familias deseas remover a los invitados que ya{" "}
        <strong className="text-[#2C2C29] font-semibold">declinaron</strong>:
      </p>

      {/* Opciones (Checkboxes custom) */}
      <div className="flex flex-col gap-1 mb-4">
        <CustomCheckbox
          checked={options.includeNoDeadline}
          onChange={() => handleToggle("includeNoDeadline")}
          label="Sin fecha límite de confirmación"
          description="Familias que no tienen una fecha límite de confirmación configurada."
        />
        <CustomCheckbox
          checked={options.includePendingNotExpired}
          onChange={() => handleToggle("includePendingNotExpired")}
          label="Con fecha límite de confirmación aún vigente"
          description="Familias que aún podrían cambiar de opinión."
        />
        <CustomCheckbox
          checked={options.includePendingExpired}
          onChange={() => handleToggle("includePendingExpired")}
          label="Con fecha limite de confirmación ya vencida"
        />
      </div>

      {/* Advertencia suavizada */}
      <div className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-lg p-2.5 mb-4 flex gap-2 items-start">
        <span className="text-[10px] text-[#C5A669] mt-0.5">💡</span>
        <p className="text-[9.5px] text-[#5A5A5A] leading-relaxed">
          Los invitados afectados saldrán del plano y regresarán a la lista
          general de pendientes por asignar.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-[10px] font-medium text-[#A8A29E] hover:text-[#2C2C29] hover:bg-[#F9F7F2] rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirm(options)}
          className="px-3 py-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 rounded-lg transition-colors shadow-sm"
        >
          Confirmar y liberar
        </button>
      </div>
    </div>
  );
}
