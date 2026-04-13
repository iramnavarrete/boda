import React, { useState, useEffect } from "react";
import {
  X,
  ClipboardPaste,
  AlertCircle,
  CheckCircle2,
  Info,
  Save,
} from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import { cn } from "@heroui/theme";
import { ImportedGuest } from "@/types";



interface ImportGuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (guests: ImportedGuest[]) => void;
  isImporting: boolean;
}

const ImportGuestsModal: React.FC<ImportGuestsModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isImporting,
}) => {
  const [rawText, setRawText] = useState("");
  const [parsedGuests, setParsedGuests] = useState<ImportedGuest[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Efecto para parsear y validar en tiempo real cada que el texto cambia
  useEffect(() => {
    if (!rawText.trim()) {
      setParsedGuests([]);
      setErrors([]);
      return;
    }

    const rows = rawText.split(/\r?\n/);
    const newGuests: ImportedGuest[] = [];
    const newErrors: string[] = [];

    rows.forEach((row, index) => {
      // Ignorar filas completamente vacías
      if (!row.trim()) return;

      const columns = row.split("\t");

      // Limpiar y extraer datos
      const nombre = columns[0]?.trim();
      const invitadosStr = columns[1]?.trim();
      const telefono = columns[2]?.trim() || "";
      const notaAnfitrion = columns[3]?.trim() || "";

      // Ignorar probable fila de encabezados si "cupos" no es un número y estamos en la fila 1
      if (index === 0 && isNaN(Number(invitadosStr))) {
        return;
      }

      // Validaciones Requeridas
      if (!nombre) {
        newErrors.push(`Fila ${index + 1}: Falta el nombre del invitado.`);
        return;
      }

      const invitados = parseInt(invitadosStr, 10);
      if (isNaN(invitados) || invitados < 1) {
        newErrors.push(
          `Fila ${index + 1} (${nombre}): Los cupos deben ser un número mayor a 0.`,
        );
        return;
      }

      // Validaciones Opcionales (Teléfono)
      const cleanPhone = telefono.replace(/\D/g, "");
      if (telefono && cleanPhone.length < 10) {
        newErrors.push(
          `Fila ${index + 1} (${nombre}): El teléfono parece ser inválido, se omitirá o guárdalo sin lada.`,
        );
      }

      newGuests.push({
        nombre,
        invitados,
        telefono: cleanPhone,
        notaAnfitrion,
      });
    });

    setParsedGuests(newGuests);
    setErrors(newErrors);
  }, [rawText]);

  const handleClose = () => {
    setRawText("");
    setParsedGuests([]);
    setErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onBackdropPress={handleClose}>
      <div className="px-6 py-5 border-b border-[#EBE5DA] flex justify-between items-center bg-white shrink-0 z-10">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C2C29] flex items-center gap-2">
            <ClipboardPaste size={20} className="text-[#C5A669]" /> Importar
            desde Excel
          </h2>
          <p className="text-xs text-[#A8A29E] mt-1">
            Copia las filas de tu archivo Excel y pégalas aquí.
          </p>
        </div>
        <button
          onClick={handleClose}
          disabled={isImporting}
          className="p-2 text-[#A8A29E] hover:text-[#E17676] bg-[#FDFBF7] hover:bg-red-50 rounded-full transition-all border border-[#EBE5DA] hover:border-red-100 disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden min-h-[60vh] bg-[#F9F7F2]">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Instrucciones */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBE5DA] shadow-sm">
            <h4 className="text-sm font-bold text-[#2C2C29] mb-3 flex items-center gap-2">
              <Info size={16} className="text-[#C5A669]" /> Instrucciones:
            </h4>
            <ol className="list-decimal pl-5 text-sm text-[#5A5A5A] space-y-2">
              <li>Abre tu archivo de Excel o Google Sheets.</li>
              <li>
                Asegúrate de tener tus columnas en este orden exacto: <br />
                <strong className="text-[#C5A669]">
                  Nombre | Cupos | Teléfono (Opcional) | Nota (Opcional)
                </strong>
              </li>
              <li>
                Selecciona las filas con los datos, presiona{" "}
                <kbd className="bg-stone-100 px-1 py-0.5 rounded border border-stone-200 text-xs">
                  Ctrl+C
                </kbd>{" "}
                y pega aquí dentro{" "}
                <kbd className="bg-stone-100 px-1 py-0.5 rounded border border-stone-200 text-xs">
                  Ctrl+V
                </kbd>
                .
              </li>
            </ol>
          </div>

          {/* Área de Pegado */}
          <div>
            <textarea
              className="w-full h-40 p-4 rounded-2xl border border-[#EBE5DA] bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-inner resize-none font-mono text-sm whitespace-pre"
              placeholder="Ejemplo:&#10;Familia Pérez Gómez    4    6141234567    Mesa Principal&#10;Dr. Roberto Martínez   2"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              disabled={isImporting}
            />
          </div>

          {/* Resultados y Validación */}
          {rawText.trim() && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Resumen de Éxito */}
              {parsedGuests.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 mt-0.5" size={18} />
                  <div>
                    <h5 className="text-sm font-bold text-green-800">
                      Datos Válidos
                    </h5>
                    <p className="text-xs text-green-700">
                      Se identificaron {parsedGuests.length} famlias listas
                      para importar.
                    </p>
                  </div>
                </div>
              )}

              {/* Lista de Errores */}
              {errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertCircle
                    className="text-red-500 mt-0.5 shrink-0"
                    size={18}
                  />
                  <div className="w-full">
                    <h5 className="text-sm font-bold text-red-800 mb-1">
                      Errores detectados ({errors.length})
                    </h5>
                    <ul className="text-xs text-red-700 space-y-1 list-disc pl-4 max-h-32 overflow-y-auto pr-2">
                      {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="p-5 md:p-6 border-t border-[#EBE5DA] bg-white flex gap-4 shrink-0 z-10 relative">
          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="flex-1 px-4 py-3 bg-[#FDFBF7] text-[#2C2C29] border border-[#EBE5DA] rounded-xl hover:bg-white hover:border-[#C5A669]/50 hover:text-[#C5A669] font-bold text-sm tracking-wide transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onImport(parsedGuests)}
            disabled={
              isImporting || parsedGuests.length === 0 || errors.length > 0
            }
            className={cn(
              "flex-1 px-4 py-3 bg-[#C5A669] text-white rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2",
              isImporting || parsedGuests.length === 0 || errors.length > 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#B39358] shadow-[#C5A669]/20",
            )}
          >
            {isImporting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            ) : (
              <>
                <Save size={18} /> Importar {parsedGuests.length} Registros
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportGuestsModal;
