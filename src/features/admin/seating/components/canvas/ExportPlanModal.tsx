"use client";

import { useState, useEffect } from "react";
import {
  X,
  Download,
  FileText,
  Image as ImageIcon,
  Info,
  Check,
} from "lucide-react";
import { cn } from "@heroui/theme";
import {
  usePlanExport,
  PdfExportConfig,
} from "../../hooks/usePlanExport";
import { PaperSize, PdfOrientation } from "../../utils/planExport/exportToPdf";

type Tab = "image" | "pdf";

interface ExportPlanModalProps {
  /** Título formateado del evento (ej: "Boda Josué y Yneth"). */
  invitationTitle: string;
}

/**
 * Botón + modal de exportación. El modal tiene dos pestañas:
 *   - "Imagen PNG": descarga directa
 *   - "Documento PDF": opciones de papel, orientación y contenido
 *
 * El botón trigger se renderiza en posición absoluta (esquina superior
 * derecha del canvas, junto a los demás controles).
 */
export function ExportPlanModal({ invitationTitle }: ExportPlanModalProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("pdf");

  // Image config (default: con distribución)
  const [includeDistribution, setIncludeDistribution] = useState(true);

  // PDF config (default: A4 landscape, con estadísticas y lista)
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [orientation, setOrientation] = useState<PdfOrientation>("landscape");
  const [includeStats, setIncludeStats] = useState(true);
  const [includeGuestList, setIncludeGuestList] = useState(true);

  const { isExporting, exportError, setExportError, exportImage, exportPdf } =
    usePlanExport({
      invitationTitle,
    });

  // Reset al cerrar
  useEffect(() => {
    if (!open) setExportError(null);
  }, [open, setExportError]);

  const handleDownloadImage = async () => {
    await exportImage({ includeDistribution });
  };

  const handleDownloadPdf = async () => {
    const cfg: PdfExportConfig = {
      paperSize,
      orientation,
      includeStats,
      includeGuestList,
    };
    await exportPdf(cfg);
  };

  return (
    <>
      {/* Trigger button */}
      <div className="absolute top-3 right-20 z-30">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "p-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#EBE5DA] rounded-xl shadow-sm",
            "hover:bg-[#F9F7F2] text-[#5A5A5A] transition-all",
            "hover:border-[#C5A669] hover:text-[#C5A669]",
          )}
          title="Exportar plano"
        >
          <Download size={18} />
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EBE5DA] flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                  <Download size={16} className="text-[#C5A669]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-serif font-bold text-[#2C2C29]">
                    Exportar Plano
                  </h2>
                  <p className="text-xs text-[#A8A29E] mt-0.5 truncate">
                    Descarga tu plano de asientos en el formato que prefieras
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="group bg-transparent hover:bg-red-50 border border-transparent hover:border-red-100 text-stone-400 hover:text-red-500 rounded-xl p-2 transition-all ml-1 shrink-0"
                title="Cerrar"
              >
                <X
                  size={20}
                  className="transform group-hover:rotate-90 transition-transform duration-300"
                  strokeWidth={2.5}
                />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 bg-white">
              <div className="flex gap-1 p-1 bg-[#F9F7F2] rounded-xl border border-[#EBE5DA]">
                <TabButton
                  active={tab === "image"}
                  onClick={() => setTab("image")}
                  icon={<ImageIcon size={14} />}
                  label="Imagen PNG"
                />
                <TabButton
                  active={tab === "pdf"}
                  onClick={() => setTab("pdf")}
                  icon={<FileText size={14} />}
                  label="Documento PDF"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F9F7F2]/30">
              {tab === "image" ? (
                <ImageTabContent
                  invitationTitle={invitationTitle}
                  includeDistribution={includeDistribution}
                  setIncludeDistribution={setIncludeDistribution}
                />
              ) : (
                <PdfTabContent
                  paperSize={paperSize}
                  setPaperSize={setPaperSize}
                  orientation={orientation}
                  setOrientation={setOrientation}
                  includeStats={includeStats}
                  setIncludeStats={setIncludeStats}
                  includeGuestList={includeGuestList}
                  setIncludeGuestList={setIncludeGuestList}
                />
              )}

              {exportError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs font-semibold text-red-700">
                    Error al exportar
                  </p>
                  <p className="text-[11px] text-red-600 mt-1">
                    {exportError}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EBE5DA] bg-white flex gap-3 shrink-0">
              {tab === "pdf" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={isExporting}
                    className="flex-1 px-4 py-2.5 bg-[#F9F7F2] text-[#2C2C29] border border-[#EBE5DA] rounded-xl hover:bg-white hover:border-[#C5A669]/30 hover:text-[#C5A669] font-medium transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isExporting}
                    className="flex-1 px-4 py-2.5 bg-[#C5A669] text-white rounded-xl hover:bg-[#b09255] font-medium shadow-lg shadow-[#C5A669]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Descargar PDF
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={isExporting}
                    className="flex-1 px-4 py-2.5 bg-[#F9F7F2] text-[#2C2C29] border border-[#EBE5DA] rounded-xl hover:bg-white hover:border-[#C5A669]/30 hover:text-[#C5A669] font-medium transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isExporting}
                    className="flex-1 px-4 py-2.5 bg-[#C5A669] text-white rounded-xl hover:bg-[#b09255] font-medium shadow-lg shadow-[#C5A669]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Descargar PNG
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =====================================================================
// Sub-componentes
// =====================================================================

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-white text-[#2C2C29] shadow-sm"
          : "text-[#A8A29E] hover:text-[#5A5A5A]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2C2C29] mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-[#EBE5DA] bg-white text-[#2C2C29] focus:ring-2 focus:ring-[#C5A669]/20 focus:border-[#C5A669] outline-none transition-all shadow-sm appearance-none cursor-pointer text-sm"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl transition-all border",
        checked
          ? "bg-white border-[#EBE5DA] shadow-sm"
          : "border-transparent hover:bg-white/50",
      )}
    >
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-center gap-3 p-3 w-full text-left rounded-xl group"
      >
        <div
          className={cn(
            "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
            checked
              ? "bg-[#C5A669] border-[#C5A669] text-white"
              : "bg-white border-stone-300 text-transparent group-hover:border-stone-400",
          )}
        >
          <Check size={14} strokeWidth={3} />
        </div>
        <div>
          <span
            className={cn(
              "block text-sm font-medium select-none transition-colors",
              checked ? "text-[#C5A669]" : "text-[#2C2C29]",
            )}
          >
            {title}
          </span>
          <span className="text-xs text-[#A8A29E] block">{description}</span>
        </div>
      </button>
    </div>
  );
}

// =====================================================================
// Tab: Imagen PNG
// =====================================================================

function ImageTabContent({
  invitationTitle,
  includeDistribution,
  setIncludeDistribution,
}: {
  invitationTitle: string;
  includeDistribution: boolean;
  setIncludeDistribution: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#EBE5DA] rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ImageIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#2C2C29]">
            Imagen de alta calidad
          </p>
          <p className="text-[11px] text-[#A8A29E] mt-0.5">
            PNG de 300 DPI con marca de agua. Ideal para imprimir en lona o
            enviar por WhatsApp.
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[#2C2C29] mb-2.5 ml-1">
          Contenido de la imagen
        </p>
        <CheckboxRow
          title="Incluir distribución de mesas"
          description="Si se desactiva, se exporta solo el plano."
          checked={includeDistribution}
          onChange={setIncludeDistribution}
        />
      </div>

      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex gap-2">
        <Info size={14} className="text-[#C5A669] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#5A5A5A]">
          Se exportará el plano de{" "}
          <strong className="text-[#2C2C29]">{invitationTitle}</strong>.
        </p>
      </div>
    </div>
  );
}

// =====================================================================
// Tab: Documento PDF
// =====================================================================

function PdfTabContent({
  paperSize,
  setPaperSize,
  orientation,
  setOrientation,
  includeStats,
  setIncludeStats,
  includeGuestList,
  setIncludeGuestList,
}: {
  paperSize: PaperSize;
  setPaperSize: (v: PaperSize) => void;
  orientation: PdfOrientation;
  setOrientation: (v: PdfOrientation) => void;
  includeStats: boolean;
  setIncludeStats: (v: boolean) => void;
  includeGuestList: boolean;
  setIncludeGuestList: (v: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Card "Documento Profesional" */}
      <div className="bg-white border border-[#EBE5DA] rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileText size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#2C2C29]">
            Documento Profesional
          </p>
          <p className="text-[11px] text-[#A8A29E] mt-0.5">
            Incluye plano, estadísticas y lista de invitados.
          </p>
        </div>
      </div>

      {/* Papel + Orientación */}
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Tamaño de papel"
          value={paperSize}
          onChange={(v) => setPaperSize(v as PaperSize)}
          options={[
            { value: "A4", label: "A4 (210 × 297 mm)" },
            { value: "Letter", label: "Carta (Letter)" },
            { value: "Legal", label: "Legal" },
          ]}
        />
        <SelectField
          label="Orientación"
          value={orientation}
          onChange={(v) => setOrientation(v as PdfOrientation)}
          options={[
            { value: "landscape", label: "Horizontal" },
            { value: "portrait", label: "Vertical" },
          ]}
        />
      </div>

      {/* Contenido del PDF */}
      <div>
        <p className="text-sm font-medium text-[#2C2C29] mb-2.5 ml-1">
          Contenido del PDF
        </p>
        <div className="space-y-2">
          <CheckboxRow
            title="Estadísticas"
            description="Total de invitados, confirmados, etc."
            checked={includeStats}
            onChange={setIncludeStats}
          />
          <CheckboxRow
            title="Lista de invitados"
            description="Invitados asignados por mesa"
            checked={includeGuestList}
            onChange={setIncludeGuestList}
          />
        </div>
      </div>
    </div>
  );
}
