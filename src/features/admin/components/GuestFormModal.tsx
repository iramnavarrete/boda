import React from "react";
import { GuestFormData } from "@/types";
import { cn } from "@heroui/theme";
import { CheckSquare, Square, XCircle, XSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/features/shared/components/Modal";

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

  const toggleAsistencia = () => {
    const current = formData.asistencia;
    let next: boolean | null = null;

    if (current === null || current === undefined) next = true;
    else if (current === true) next = false;
    else next = null;

    setFormData({
      ...formData,
      asistencia: next,
      confirmados: next === false ? 0 : formData.confirmados,
    });
  };

  return (
    <Modal isOpen={isOpen} onBackdropPress={onBackdropPress}>
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50 shrink-0 z-10">
        <h2 className="text-lg font-bold text-stone-800">
          {isEdit ? "Editar Invitado" : "Nuevo Invitado"}
        </h2>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-600 transition-colors"
          type="button"
        >
          <XCircle size={24} />
        </button>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col flex-1 overflow-hidden min-h-0"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Selector Asistencia */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Estado de Asistencia
            </label>
            <button
              type="button"
              onClick={toggleAsistencia}
              className="flex items-center gap-3 w-full bg-white p-3 rounded-lg border border-stone-200 hover:border-yellow-400 transition-all shadow-sm group"
            >
              {formData.asistencia === true && (
                <>
                  <div className="bg-green-100 text-green-600 p-1 rounded">
                    <CheckSquare size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-stone-800">
                      Asistirá
                    </span>
                    <span className="text-xs text-green-600">
                      Asistencia confirmada
                    </span>
                  </div>
                </>
              )}
              {formData.asistencia === false && (
                <>
                  <div className="bg-red-100 text-red-500 p-1 rounded">
                    <XSquare size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-stone-800">
                      No asistirá
                    </span>
                    <span className="text-xs text-red-500">
                      Invitación declinada
                    </span>
                  </div>
                </>
              )}
              {(formData.asistencia === null ||
                formData.asistencia === undefined) && (
                <>
                  <div className="bg-stone-100 text-stone-400 p-1 rounded group-hover:text-stone-500 transition-colors">
                    <Square size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-stone-800">
                      Pendiente
                    </span>
                    <span className="text-xs text-stone-400">
                      Sin respuesta aún
                    </span>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Nombre(s) de invitado(s)*
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                value={formData.nombre || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej. Familia Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                value={formData.telefono || ""}
                onChange={(e) => {
                  const input = e.target;
                  const value = input.value.replace(/\D/g, "");
                  if (value !== "" && value.length !== 10) {
                    input.setCustomValidity("El número debe ser de 10 dígitos");
                  } else {
                    input.setCustomValidity("");
                  }
                  setFormData({ ...formData, telefono: value });
                }}
                placeholder="Ej. 6141234567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Cupos Totales*
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-yellow-500 outline-none"
                  value={formData.invitados || ""}
                  onChange={(e) =>
                    handleNumberChange("invitados", e.target.value)
                  }
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium text-stone-700 mb-1 ${
                    formData.asistencia === false ? "opacity-40" : ""
                  }`}
                >
                  Confirmados {formData.asistencia === true && "*"}
                </label>
                <input
                  required={formData.asistencia === true}
                  type="number"
                  min="0"
                  max={formData.invitados}
                  disabled={formData.asistencia === false}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-40"
                  value={formData.confirmados || ""}
                  onChange={(e) =>
                    handleNumberChange("confirmados", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Nota para invitado
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                value={formData.notaAnfitrion || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notaAnfitrion: e.target.value,
                  })
                }
                placeholder="Ej. Los queremos mucho padrinos"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
              <input
                type="checkbox"
                id="permiteCambios"
                className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 border-stone-300 cursor-pointer"
                checked={!!formData.cambiosPermitidos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cambiosPermitidos: e.target.checked,
                  })
                }
              />
              <label
                htmlFor="permiteCambios"
                className="text-sm text-stone-700 cursor-pointer select-none"
              >
                Permitir que el invitado modifique su asistencia
              </label>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex gap-3 shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-100 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-medium shadow-lg shadow-stone-900/10 transition-colors"
          >
            {isEdit ? "Guardar Cambios" : "Crear Invitado"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GuestFormModal;
