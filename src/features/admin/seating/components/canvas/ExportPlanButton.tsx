"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@heroui/theme";
import { usePlanExport, ExportFormat } from "../../hooks/usePlanExport";

interface ExportPlanButtonProps {
  invitationName: string;
}

export function ExportPlanButton({
  invitationName,
}: ExportPlanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { isExporting, exportError, exportPlan } = usePlanExport({
    invitationName,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = async (format: ExportFormat) => {
    setIsOpen(false);
    await exportPlan(format);
  };

  return (
    <div className="absolute top-3 right-20 z-30">
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen((o) => !o)}
          disabled={isExporting}
          className={cn(
            "p-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#EBE5DA] rounded-xl shadow-sm",
            "hover:bg-[#F9F7F2] text-[#5A5A5A] transition-all",
            "hover:border-[#C5A669] hover:text-[#C5A669]",
            isExporting && "opacity-70 cursor-not-allowed",
          )}
          title="Exportar plano"
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
        </button>

        {isOpen && !isExporting && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-64 bg-white border border-[#EBE5DA] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="px-4 py-3 border-b border-[#EBE5DA] bg-[#FDFBF7]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">
                Exportar plano
              </p>
              <p className="text-[11px] text-[#5A5A5A] mt-1">
                Descarga el plano actual con su distribución
              </p>
            </div>

            <button
              onClick={() => handleSelect("docx")}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F9F7F2] transition-colors text-left border-b border-[#EBE5DA]"
            >
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2C2C29]">
                  Documento Word
                </p>
                <p className="text-[10px] text-[#A8A29E] mt-0.5">
                  Hoja 1: plano (orientación auto) · Hoja 2: tabla de invitados
                </p>
              </div>
            </button>

            <button
              onClick={() => handleSelect("image")}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F9F7F2] transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <ImageIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2C2C29]">
                  Imagen de alta calidad
                </p>
                <p className="text-[10px] text-[#A8A29E] mt-0.5">
                  300 DPI · plano + tabla · lista para imprimir en lona
                </p>
              </div>
            </button>
          </div>
        )}

        {isExporting && (
          <div className="absolute right-0 mt-2 px-4 py-3 bg-white border border-[#EBE5DA] rounded-2xl shadow-xl whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#C5A669]" />
              <span className="text-xs font-semibold text-[#2C2C29]">
                Generando archivo de alta calidad...
              </span>
            </div>
          </div>
        )}

        {exportError && !isExporting && (
          <div className="absolute right-0 mt-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl shadow-xl max-w-xs">
            <p className="text-xs font-semibold text-red-700">
              Error al exportar
            </p>
            <p className="text-[10px] text-red-600 mt-1">{exportError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
