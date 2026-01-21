import React from "react";
import {
  CheckCircle2,
  XCircle as XCircleIcon,
  Save,
  X,
  Check,
  MinusCircle,
} from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import { cn } from "@heroui/theme";
import { GuestFormData } from "@/types";

interface GuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: GuestFormData;
  setFormData: React.Dispatch<React.SetStateAction<GuestFormData>>;
  isEdit: boolean;
  onBackdropPress?: () => void;
}

const GuestFormModal: React.FC<GuestFormModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEdit,
  onBackdropPress,
}) => {

  const handleNumberChange = (field: keyof GuestFormData, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    const finalValue = isNaN(numValue) ? 0 : numValue;
    const updates: Partial<GuestFormData> = { [field]: finalValue };

    if (field === "confirmados") {
      updates.asistencia = true;
      if (finalValue <= 0) {
        updates.asistencia = false;
      }
    }

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const setAsistencia = (estado: boolean | null) => {
    const nuevoEstado = formData.asistencia === estado ? null : estado;

    setFormData({
      ...formData,
      asistencia: nuevoEstado,
      confirmados: nuevoEstado === false ? 0 : formData.confirmados
    });
  };

  return (
    <Modal isOpen={isOpen} onBackdropPress={onBackdropPress || onClose}>
      <div className="px-6 py-4 border-b border-sand flex justify-between items-center bg-white shrink-0 z-10">
        <div>
          <h2 className="text-lg font-serif font-bold text-charcoal">
            {isEdit ? "Editar Invitado" : "Nuevo Invitado"}
          </h2>
          <p className="text-xs text-stone-light mt-0.5">
            {isEdit
              ? "Actualiza la información de asistencia"
              : "Agrega a alguien a tu lista"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-light hover:text-charcoal transition-colors p-2 hover:bg-sand-light rounded-full"
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col flex-1 overflow-hidden min-h-0 bg-sand-light/30"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="relative">
            <div className="mb-2 px-1">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider">
                ¿Asistirá al evento?
              </label>
            </div>
            {formData.asistencia === null && (
              <span className="absolute right-0 top-0 text-[10px] text-stone-400 bg-white px-2 py-0.5 rounded-full border border-sand animate-in fade-in duration-200">
                Pendiente
              </span>
            )}
            <div className="flex p-1 bg-stone-200/50 rounded-xl border border-sand">
              <button
                type="button"
                onClick={() => setAsistencia(true)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  formData.asistencia === true
                    ? "bg-white text-green-700 shadow-sm ring-1 ring-green-100"
                    : "text-stone-500 hover:text-stone-700 hover:bg-white/50",
                )}
              >
                <CheckCircle2
                  size={16}
                  className={
                    formData.asistencia === true
                      ? "text-green-600"
                      : "text-stone-400 opacity-50"
                  }
                />
                Sí
              </button>

              <div className="w-px bg-stone-300/20 my-2 mx-1" />

              <button
                type="button"
                onClick={() => setAsistencia(false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  formData.asistencia === false
                    ? "bg-white text-red-700 shadow-sm ring-1 ring-red-100"
                    : "text-stone-500 hover:text-stone-700 hover:bg-white/50",
                )}
              >
                <XCircleIcon
                  size={16}
                  className={
                    formData.asistencia === false
                      ? "text-red-500"
                      : "text-stone-400 opacity-50"
                  }
                />
                No
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 ml-1">
                Nombre(s) de invitado(s)*
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-stone-custom focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all placeholder:text-stone-300 shadow-sm"
                value={formData.nombre || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej. Familia Pérez"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5 ml-1">
                  Cupos Totales*
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-stone-custom focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all shadow-sm"
                    value={formData.invitados || ""}
                    onChange={(e) =>
                      handleNumberChange("invitados", e.target.value)
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
                    pers.
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  "transition-opacity duration-300",
                  formData.asistencia === false
                    ? "opacity-50 grayscale"
                    : "opacity-100",
                )}
              >
                <label className="block text-sm font-medium text-charcoal mb-1.5 ml-1">
                  Confirmados {formData.asistencia === true && "*"}
                </label>
                <div className="relative">
                  <input
                    required={formData.asistencia === true}
                    type="number"
                    min="0"
                    max={formData.invitados}
                    disabled={formData.asistencia === false}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-stone-custom focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all disabled:bg-sand-light disabled:text-stone-300 shadow-sm"
                    value={formData.confirmados || ""}
                    onChange={(e) =>
                      handleNumberChange("confirmados", e.target.value)
                    }
                  />
                  {formData.asistencia === false && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                      <MinusCircle size={14} />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 ml-1">
                WhatsApp{" "}
                <span className="text-stone-light font-normal text-xs">
                  (Opcional)
                </span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-stone-custom focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all placeholder:text-stone-300 shadow-sm"
                value={formData.telefono || ""}
                onChange={(e) => {
                  const input = e.target;
                  const value = input.value.replace(/\D/g, "");
                  setFormData({ ...formData, telefono: value });
                }}
                placeholder="Ej. 6141234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 ml-1">
                Nota para invitado
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-stone-custom focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all placeholder:text-stone-300 shadow-sm"
                value={formData.notaAnfitrion || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notaAnfitrion: e.target.value,
                  })
                }
                placeholder="Ej. 'Mesa principal', 'Alergia nueces'..."
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  cambiosPermitidos: !formData.cambiosPermitidos,
                })
              }
              className="flex items-center gap-3 p-3 w-full text-left rounded-xl hover:bg-white/50 transition-colors group"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
                  formData.cambiosPermitidos
                    ? "bg-gold border-gold text-white"
                    : "bg-white border-stone-300 text-transparent",
                )}
              >
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <span
                  className={cn(
                    "block text-sm font-medium select-none transition-colors",
                    formData.cambiosPermitidos
                      ? "text-gold"
                      : "text-stone-custom",
                  )}
                >
                  Permitir cambios de asistencia
                </span>
                <span className="text-xs text-stone-light hidden sm:block">
                  Si esta activo, el invitado podrá modificar su respuesta.
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-sand bg-white flex gap-3 shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-sand-light text-stone-custom border border-sand rounded-xl hover:bg-white hover:border-gold/30 hover:text-gold font-medium transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-gold text-white rounded-xl hover:bg-gold-600 font-medium shadow-lg shadow-gold/20 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GuestFormModal;
