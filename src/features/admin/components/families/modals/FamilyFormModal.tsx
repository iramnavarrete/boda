import React from "react";
import {
  CheckCircle2,
  XCircle as XCircleIcon,
  Save,
  X,
  Check,
  MinusCircle,
  ChevronDown,
  Tag,
  Calendar,
} from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import { cn } from "@heroui/theme";
import { FamilyFormData } from "@/types";
import { useFamilyFormModal } from "../../../hooks/useFamilyFormModal";

// Opciones predefinidas de etiquetas
const TAG_OPTIONS = ["Novia", "Novio", "Ambos"];

interface FamilyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FamilyFormData) => void; // AHORA DEVUELVE LA DATA COMPLETA
  initialData: FamilyFormData; // AHORA RECIBE INITIAL DATA, NO ESTADO EN VIVO
  isEdit: boolean;
  onBackdropPress?: () => void;
}

const FamilyFormModal: React.FC<FamilyFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isEdit,
  onBackdropPress,
}) => {
  // Inyectamos nuestro hook personalizado
  const {
    formData,
    countryCode,
    phoneNumber,
    handleCountryChange,
    handlePhoneChange,
    handleNumberChange,
    handleAsistenciaToggle,
    handleTagToggle,
    handleTextChange,
    handleSubmit,
  } = useFamilyFormModal(isOpen, initialData, onSubmit);

  return (
    <Modal isOpen={isOpen} onBackdropPress={onBackdropPress || onClose}>
      <div className="px-6 py-4 border-b border-sand flex justify-between items-center bg-white shrink-0 z-10">
        <div>
          <h2 className="text-lg font-serif font-bold text-charcoal">
            {isEdit ? "Editar Familia" : "Nueva Familia"}
          </h2>
          <p className="text-xs text-stone-light mt-0.5">
            {isEdit
              ? "Actualiza la información de asistencia"
              : "Agrega a alguien a tu lista"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="group bg-transparent hover:bg-red-50 border border-transparent hover:border-red-100 text-stone-400 hover:text-red-500 rounded-xl p-2 transition-all ml-1"
          title="Cancelar selección"
        >
          <X
            size={20}
            className="transform group-hover:rotate-90 transition-transform duration-300"
            strokeWidth={2.5}
          />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 overflow-hidden min-h-0 bg-sand-light/30"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Asistencia Toggle */}
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
                onClick={() => handleAsistenciaToggle(true)}
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
                onClick={() => handleAsistenciaToggle(false)}
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
                Nombre de familia*
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-stone-custom focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all placeholder:text-stone-300 shadow-sm"
                value={formData.nombre || ""}
                onChange={(e) => handleTextChange("nombre", e.target.value)}
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

            {/* --- SECCIÓN DE ETIQUETAS --- */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-2 ml-1">
                <Tag size={14} className="text-gold" />
                Etiqueta{" "}
                <span className="font-normal text-xs text-stone-400">
                  (Opcional)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                      formData.etiqueta === tag
                        ? "bg-gold border-gold text-white shadow-sm shadow-gold/20"
                        : "bg-white border-sand text-stone-500 hover:border-gold/40 hover:text-charcoal hover:bg-sand-light/50",
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* WHATSAPP */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 ml-1">
                WhatsApp <span className="font-normal text-xs">(Opcional)</span>
              </label>

              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <select
                    className="h-full py-0 pl-4 pr-7 bg-transparent text-stone-custom font-medium focus:ring-0 focus:border-transparent outline-none text-sm cursor-pointer appearance-none z-10"
                    value={countryCode}
                    onChange={handleCountryChange}
                  >
                    <option value="52">🇲🇽 +52</option>
                    <option value="1">🇺🇸 +1</option>
                    <option value="34">🇪🇸 +34</option>
                    <option value="57">🇨🇴 +57</option>
                    <option value="54">🇦🇷 +54</option>
                    <option value="56">🇨🇱 +56</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <ChevronDown size={14} />
                  </div>
                  <div className="w-px h-6 bg-sand ml-1"></div>
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{9,15}"
                  className="w-full pl-[105px] pr-4 py-3 rounded-xl border border-sand bg-white text-stone-custom focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all placeholder:text-stone-300 shadow-sm"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="Ej. 6141234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 ml-1">
                Nota para familia{" "}
                <span className="font-normal text-xs">(Opcional)</span>
              </label>
              <textarea
                style={{ fieldSizing: "content" }}
                className="w-full px-4 py-3 rounded-xl border border-sand bg-white text-stone-custom focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all placeholder:text-stone-300 shadow-sm max-h-20 resize-none"
                value={formData.notaAnfitrion || ""}
                onChange={(e) =>
                  handleTextChange("notaAnfitrion", e.target.value)
                }
                placeholder="Ej. 'Los esperamos con ansias'..."
              />
            </div>

            {/* SECCIÓN DE PERMISOS */}
            {isEdit && (
              <div
                className={cn(
                  "rounded-xl transition-all",
                  formData.cambiosPermitidos
                    ? "bg-white border border-sand shadow-sm"
                    : "border border-transparent hover:bg-white/50",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    const newState = !formData.cambiosPermitidos;
                    handleTextChange("cambiosPermitidos", newState);
                    if (!newState)
                      handleTextChange("fechaLimiteConfirmacion", null);
                  }}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-xl group"
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
                      formData.cambiosPermitidos
                        ? "bg-gold border-gold text-white"
                        : "bg-white border-stone-300 text-transparent group-hover:border-stone-400",
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
                      Si esta activo, la familia podrá modificar su respuesta.
                    </span>
                  </div>
                </button>

                {formData.cambiosPermitidos && (
                  <div className="pl-11 pr-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                      Fecha límite de confirmación{" "}
                      <span className="font-normal normal-case text-stone-400">
                        (Opcional)
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <Calendar
                        size={14}
                        className="absolute left-3 text-stone-400 pointer-events-none"
                      />
                      <input
                        type="date"
                        className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-sand bg-[#FDFBF7] text-stone-custom focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all shadow-sm text-sm"
                        value={formData.fechaLimiteConfirmacion || ""}
                        onChange={(e) =>
                          handleTextChange(
                            "fechaLimiteConfirmacion",
                            e.target.value !== "" ? e.target.value : null,
                          )
                        }
                      />
                      {formData.fechaLimiteConfirmacion && (
                        <button
                          type="button"
                          onClick={() =>
                            handleTextChange("fechaLimiteConfirmacion", null)
                          }
                          className="absolute right-3 p-1 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Quitar fecha límite"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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

export default FamilyFormModal;
