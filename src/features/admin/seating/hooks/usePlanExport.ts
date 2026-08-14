"use client";

import { useCallback, useState } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";
import { useZoomStore } from "../stores/useZoomStore";
import { exportPlanToDocx } from "../utils/planExport/exportToDocx";
import { exportPlanToImage } from "../utils/planExport/exportToImage";

export type ExportFormat = "docx" | "image";

export interface UsePlanExportOptions {
  /** Nombre de la invitación. */
  invitationName: string;
}

export function usePlanExport(opts: UsePlanExportOptions) {
  const { invitationName } = opts;

  const elements = useSeatingStore((state) => state.elements);
  const families = useSeatingStore((state) => state.families);
  const zoom = useZoomStore((state) => state.zoom);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportPlan = useCallback(
    async (format: ExportFormat) => {
      if (elements.length === 0) {
        setExportError(
          "No hay elementos en el plano para exportar. Agrega mesas o áreas primero.",
        );
        return;
      }

      setIsExporting(true);
      setExportError(null);

      try {
        if (format === "docx") {
          await exportPlanToDocx({
            invitationName,
            elements,
            families,
            zoom,
          });
        } else {
          await exportPlanToImage({
            invitationName,
            elements,
            families,
            zoom,
          });
        }
      } catch (err) {
        console.error("Error exportando plano:", err);
        setExportError(
          err instanceof Error
            ? err.message
            : "Error desconocido al exportar el plano.",
        );
      } finally {
        setIsExporting(false);
      }
    },
    [elements, families, zoom, invitationName],
  );

  return {
    isExporting,
    exportError,
    exportPlan,
  };
}
