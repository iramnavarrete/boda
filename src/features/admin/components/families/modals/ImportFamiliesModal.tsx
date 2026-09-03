import React, { useMemo, useState } from "react";
import {
  X,
  ClipboardPaste,
  AlertCircle,
  CheckCircle2,
  Info,
  Save,
  Download,
} from "lucide-react";
import Modal from "@/features/shared/components/Modal";
import { cn } from "@heroui/theme";
import { ImportedFamily } from "@/types";
import { downloadEmptyFamiliesTemplate } from "@/services/excelService";

/**
 * Valores canónicos que aceptamos en la columna "Etiqueta".
 * Comparamos normalizando (lowercase + sin acentos) contra estas claves.
 */
const ETIQUETA_KEYS = ["novio", "novia", "ambos"] as const;
type EtiquetaCanonica = "Novio" | "Novia" | "Ambos";

/** Normaliza un texto para comparar etiquetas (lowercase + sin acentos). */
const normalizeForCompare = (s: string): string =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/**
 * Parsea el valor crudo de la celda "Etiqueta".
 * Devuelve la forma canónica con mayúscula inicial o `null` si no
 * coincide con ninguno de los valores aceptados.
 */
const parseEtiqueta = (raw: string): EtiquetaCanonica | null => {
  const normalized = normalizeForCompare(raw);
  if (ETIQUETA_KEYS.includes(normalized as (typeof ETIQUETA_KEYS)[number])) {
    return (normalized.charAt(0).toUpperCase() +
      normalized.slice(1)) as EtiquetaCanonica;
  }
  return null;
};

/**
 * Código de país por defecto cuando el usuario pega un teléfono
 * sin prefijo internacional. México (+52) porque la plataforma
 * opera principalmente en ese país.
 */
const DEFAULT_COUNTRY_CODE = "52";
const DEFAULT_PHONE_PREFIX = `+${DEFAULT_COUNTRY_CODE} `;

/**
 * Normaliza un teléfono a un único formato canónico:
 *   `+<código> <dígitos>`
 *
 * Reglas:
 * - Si la entrada tiene `+<código> ` (con al menos un espacio
 *   después del código), se respeta ese código y se concatenan
 *   los dígitos restantes sin ningún separador.
 * - Si la entrada no trae `+` (o lo trae pero sin espacio después
 *   del código), se asume México como país por defecto (+52).
 * - Si no hay dígitos en absoluto, devuelve `null`.
 *
 * Esto garantiza que el código de país sea inequívocamente
 * detectable del valor guardado.
 */
const normalizePhone = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const digits = (trimmed.match(/\d/g) ?? []).join("");
  if (!digits) return null;

  // Con `+` y un espacio después del código: respetar el código del usuario.
  const matchWithPlus = trimmed.match(/^\+(\d{1,3})\s+(.*)$/);
  if (matchWithPlus) {
    const countryCode = matchWithPlus[1];
    return `+${countryCode} ${digits.slice(countryCode.length)}`;
  }

  // Sin `+` (o con `+` pero sin espacio después del código):
  // default a México.
  return `${DEFAULT_PHONE_PREFIX}${digits}`;
};

interface ImportFamiliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Ejecuta el import. Debe devolver `true` si terminó bien y
   * `false` si falló, para que el modal pueda vaciar el textarea
   * solo en el caso exitoso.
   */
  onImport: (families: ImportedFamily[]) => Promise<boolean>;
  isImporting: boolean;
}

const ImportFamiliesModal: React.FC<ImportFamiliesModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isImporting,
}) => {
  const [rawText, setRawText] = useState("");

  const { parsedFamilies, errors } = useMemo<{
    parsedFamilies: ImportedFamily[];
    errors: string[];
  }>(() => {
    if (!rawText.trim()) {
      return { parsedFamilies: [], errors: [] };
    }

    const rows = rawText.split(/\r?\n/);
    const newFamilies: ImportedFamily[] = [];
    const newErrors: string[] = [];

    rows.forEach((row, index) => {
      // Ignorar filas completamente vacías
      if (!row.trim()) return;

      const columns = row.split("\t");

      // Limpiar y extraer datos
      const nombre = columns[0]?.trim();
      const invitadosStr = columns[1]?.trim();
      const telefono = columns[2]?.trim() || "";
      const ingresoNinosStr = columns[3]?.trim() || "";
      const etiquetaStr = columns[4]?.trim() || "";
      const notaAnfitrion = columns[5]?.trim() || "";

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

      // Validaciones Opcionales (Teléfono).
      // Aceptamos el formato internacional con `+` y un solo espacio
      // separando el código de país del resto, por ejemplo:
      //   "+52 6141234567", "+1 5551234567", "6141234567"
      // (los espacios/guiones/separadores entre los dígitos también
      // se toleran en la entrada; `normalizePhone` los colapsa al
      // guardar). Si no se incluye `+`, se asume +52 por defecto.
      let phoneError: string | null = null;
      if (telefono) {
        const digitCount = (telefono.match(/\d/g) ?? []).length;
        // Detectamos cualquier `+` que NO esté en la posición 0
        // (cubrimos `+52 614` con `+` solo al inicio, y casos
        // inválidos como `52+614...` o `++52...`).
        const plusPositions = [...telefono.matchAll(/\+/g)].map(
          (m) => m.index ?? -1,
        );
        const hasInternalPlus = plusPositions.some((pos) => pos > 0);

        if (digitCount < 10) {
          phoneError = `Fila ${index + 1} (${nombre}): El teléfono debe tener al menos 10 dígitos (sin contar el "+" ni separadores).`;
        } else if (hasInternalPlus) {
          phoneError = `Fila ${index + 1} (${nombre}): El "+" solo puede ir al inicio del teléfono.`;
        }
        if (phoneError) newErrors.push(phoneError);
      }

      // Ingreso de niños: solo "si" (sin importar mayúsculas ni acentos) = true.
      // Normalizamos a minúsculas y quitamos diacríticos para que "Sí", "SÍ",
      // "sÍ", "sí" se acepten igual. Cualquier otro valor (incluido vacío) = false.
      const ninosPermitidos = normalizeForCompare(ingresoNinosStr) === "si";

      // Etiqueta: solo "novio" / "novia" / "ambos" (case + accent
      // insensitive). Se guarda con mayúscula inicial o null.
      const etiqueta = parseEtiqueta(etiquetaStr);

      newFamilies.push({
        nombre,
        invitados,
        // Guardamos el teléfono en formato canónico `+<código> <dígitos>`.
        // Si el usuario no incluyó `+`, se normaliza a +52 por defecto.
        telefono: telefono ? (normalizePhone(telefono) ?? "") : "",
        notaAnfitrion,
        ninosPermitidos,
        etiqueta,
      });
    });

    return { parsedFamilies: newFamilies, errors: newErrors };
  }, [rawText]);

  const handleClose = () => {
    // `parsedFamilies` y `errors` son derivados de `rawText`, así que
    // basta con limpiar el texto para que ambos vuelvan a `[]`.
    setRawText("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onBackdropPress={handleClose}
      maxWidth="max-w-lg md:max-w-4xl"
    >
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
                  Nombre | Cupos | Teléfono (Opcional) | Ingreso Niños
                  (Opcional: &quot;si&quot; / &quot;no&quot;) | Etiqueta
                  (Opcional: Novio/Novia/Ambos) | Nota (Opcional)
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
              <li>
                El campo <strong>Teléfono</strong> acepta código de país
                con <code className="bg-stone-100 px-1 rounded">+</code>{" "}
                seguido de un solo espacio y luego el número pegado (ej.{" "}
                <code className="bg-stone-100 px-1 rounded">+52 6141234567</code>,{" "}
                <code className="bg-stone-100 px-1 rounded">+1 5551234567</code>).
                Se guarda <strong>un solo espacio</strong>, entre el código
                de país y los dígitos — nada más. Si no incluyes{" "}
                <code className="bg-stone-100 px-1 rounded">+</code>, se
                guarda automáticamente como{" "}
                <code className="bg-stone-100 px-1 rounded">+52</code>{" "}
                (México).
              </li>
            </ol>
          </div>

          {/* Botón de descarga de plantilla */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                void downloadEmptyFamiliesTemplate();
              }}
              disabled={isImporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#EBE5DA] bg-white text-[#5A5A5A] hover:border-[#C5A669]/50 hover:text-[#C5A669] hover:bg-[#FDFBF7] text-xs font-bold tracking-wide transition-all disabled:opacity-50 shadow-sm"
            >
              <Download size={14} />
              Descargar plantilla vacía
            </button>
          </div>

          {/* Área de Pegado */}
          <div>
            <textarea
              className="w-full h-40 p-4 rounded-2xl border border-[#EBE5DA] bg-white text-[#5A5A5A] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-inner resize-none font-mono text-sm whitespace-pre"
              placeholder={`Ejemplo:\nfamilia de ejemplo    3    0000000000    si    Ambos    no olviden los anillos\nfamilia de ejemplo EUA    3    +1 0000000000    si    Novia    no olvides las botellas`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              disabled={isImporting}
            />
          </div>

          {/* Resultados y Validación */}
          {rawText.trim() && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Resumen de Éxito */}
              {parsedFamilies.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 mt-0.5" size={18} />
                  <div>
                    <h5 className="text-sm font-bold text-green-800">
                      Datos Válidos
                    </h5>
                    <p className="text-xs text-green-700">
                      Se identificaron {parsedFamilies.length} famlias listas
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
            onClick={async () => {
              const ok = await onImport(parsedFamilies);
              // Solo vaciamos el textarea si el import terminó bien.
              // Si falló, conservamos el texto para que el usuario
              // pueda corregir y reintentar.
              if (ok) setRawText("");
            }}
            disabled={
              isImporting || parsedFamilies.length === 0 || errors.length > 0
            }
            className={cn(
              "flex-1 px-4 py-3 bg-[#C5A669] text-white rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2",
              isImporting || parsedFamilies.length === 0 || errors.length > 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#B39358] shadow-[#C5A669]/20",
            )}
          >
            {isImporting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            ) : (
              <>
                <Save size={18} /> Importar {parsedFamilies.length} Registros
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportFamiliesModal;
