"use client";

import { useCallback, useState } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";
import { exportPlanToImage, ImageExportOptions } from "../utils/planExport/exportToImage";
import {
  exportPlanToPdf,
  PdfExportOptions,
  PaperSize,
  PdfOrientation,
} from "../utils/planExport/exportToPdf";

export type ExportFormat = "image" | "pdf";

export interface ImageExportConfig {
  /** Si es true, incluye la cuadrícula de tarjetas a los lados del plano. */
  includeDistribution: boolean;
}

export interface PdfExportConfig {
  paperSize: PaperSize;
  orientation: PdfOrientation;
  includeStats: boolean;
  includeGuestList: boolean;
}

export interface UsePlanExportOptions {
  /** Título formateado del evento (ej: "Boda Josué y Yneth"). */
  invitationTitle: string;
}

export function usePlanExport(opts: UsePlanExportOptions) {
  const { invitationTitle } = opts;

  const elements = useSeatingStore((state) => state.elements);
  const families = useSeatingStore((state) => state.families);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportImage = useCallback(
    async (config: ImageExportConfig) => {
      if (elements.length === 0) {
        setExportError(
          "No hay elementos en el plano para exportar. Agrega mesas o áreas primero.",
        );
        return;
      }

      setIsExporting(true);
      setExportError(null);

      try {
        const o: ImageExportOptions = {
          invitationTitle,
          elements,
          families,
          includeDistribution: config.includeDistribution,
        };
        await exportPlanToImage(o);
      } catch (err) {
        console.error("Error exportando imagen:", err);
        setExportError(
          err instanceof Error
            ? err.message
            : "Error desconocido al exportar la imagen.",
        );
      } finally {
        setIsExporting(false);
      }
    },
    [elements, families, invitationTitle],
  );

  const exportPdf = useCallback(
    async (config: PdfExportConfig) => {
      if (elements.length === 0) {
        setExportError(
          "No hay elementos en el plano para exportar. Agrega mesas o áreas primero.",
        );
        return;
      }

      setIsExporting(true);
      setExportError(null);

      try {
        const o: PdfExportOptions = {
          invitationTitle,
          elements,
          families,
          paperSize: config.paperSize,
          orientation: config.orientation,
          includeStats: config.includeStats,
          includeGuestList: config.includeGuestList,
        };
        await exportPlanToPdf(o);
      } catch (err) {
        console.error("Error exportando PDF:", err);
        setExportError(
          err instanceof Error
            ? err.message
            : "Error desconocido al exportar el PDF.",
        );
      } finally {
        setIsExporting(false);
      }
    },
    [elements, families, invitationTitle],
  );

  return {
    isExporting,
    exportError,
    setExportError,
    exportImage,
    exportPdf,
  };
}
