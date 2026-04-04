import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle as XCircleIcon,
  Save,
  X,
  Check,
  MinusCircle,
  ChevronDown,
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
  // --- ESTADOS LOCALES PARA EL WHATSAPP ---
  const [countryCode, setCountryCode] = useState("52");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Sincronizar el número de teléfono cuando se abre el modal o cambia la prop externamente
  useEffect(() => {
    if (!formData.telefono) {
      setPhoneNumber("");
      // Mantenemos el código de país actual por comodidad si está agregando varios
    } else if (formData.telefono && !phoneNumber) {
      // Extraemos el código de país si existe en el string guardado
      let parsedCode = "52";
      let parsedNum = formData.telefono;
      const codes = ["52", "1", "34", "57", "54", "56"];

      for (const code of codes) {
        if (parsedNum.startsWith(code) && parsedNum.length > code.length) {
          parsedCode = code;
          parsedNum = parsedNum.substring(code.length);
          break;
        }
      }
      setCountryCode(parsedCode);
      setPhoneNumber(parsedNum);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.telefono]);

  // Handlers para el Input de Teléfono
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCountryCode(code);
    if (phoneNumber) {
      setFormData((prev) => ({ ...prev, telefono: code + phoneNumber }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/\D/g, "");
    setPhoneNumber(num);
    if (num) {
      setFormData((prev) => ({ ...prev, telefono: countryCode + num }));
    } else {
      // Si borra el número completo, limpiamos el campo en el formData
      setFormData((prev) => ({ ...prev, telefono: "" }));
    }
  };

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
      confirmados: nuevoEstado === false ? 0 : formData.confirmados,
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

              {/* --- NUEVO INPUT INTEGRADO CON SELECTOR DE PAÍS --- */}
              <div className="relative flex items-center">
                {/* Contenedor del Selector Absoluto sobre el Input */}
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

                  {/* Flechita Personalizada */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <ChevronDown size={14} />
                  </div>

                  {/* Separador Visual */}
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
            placeholder="Ej. 'Que no se te olviden los macarrones'..."
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
