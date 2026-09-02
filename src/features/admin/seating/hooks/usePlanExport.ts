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
  const setSelectedElementId = useSeatingStore(
    (state) => state.setSelectedElementId,
  );
  const setSelectedElementIds = useSeatingStore(
    (state) => state.setSelectedElementIds,
  );

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  /**
   * Deselecciona TODO antes de exportar. ¿Por qué?
   * El PlanoSnapshot se renderiza con los mismos componentes del
   * canvas (PlanoSnapshot.tsx) pero con data-export-mode="true".
   * Si hay elementos seleccionados al momento de capturar, el
   * dashed border de selección y otros estilos de selección
   * (single-selected) podrían filtrarse en la imagen final.
   * Limpiamos la selección al INICIO de la exportación para
   * garantizar un snapshot "limpio".
   *
   * Se usa `getState()` (no el valor del closure) para que ambos
   * callbacks tengan siempre la versión más reciente de los
   * setters sin necesidad de incluirlos en las dependencias.
   */
  const clearAllSelection = useCallback(() => {
    useSeatingStore.getState().setSelectedElementId(null);
    useSeatingStore.getState().setSelectedElementIds([]);
  }, []);

  const exportImage = useCallback(
    async (config: ImageExportConfig) => {
      if (elements.length === 0) {
        setExportError(
          "No hay elementos en el plano para exportar. Agrega mesas o áreas primero.",
        );
        return;
      }

      // Deseleccionar ANTES de iniciar la captura para que el
      // snapshot no incluya dashed borders de selección.
      clearAllSelection();
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
    [elements, families, invitationTitle, clearAllSelection],
  );

  const exportPdf = useCallback(
    async (config: PdfExportConfig) => {
      if (elements.length === 0) {
        setExportError(
          "No hay elementos en el plano para exportar. Agrega mesas o áreas primero.",
        );
        return;
      }

      // Deseleccionar ANTES de iniciar la captura para que el
      // snapshot no incluya dashed borders de selección.
      clearAllSelection();
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
    [elements, families, invitationTitle, clearAllSelection],
  );

  return {
    isExporting,
    exportError,
    setExportError,
    exportImage,
    exportPdf,
  };
}
