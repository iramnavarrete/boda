"use client";

import React, { useMemo } from "react";
import { SeatingElement, getElementLayer } from "@/types/seating";
import TableElement from "../../components/canvas/TableElement";

interface PlanoSnapshotProps {
  elements: SeatingElement[];
  /** Padding extra alrededor del contenido (en coords del mundo). */
  padding?: number;
  /** Si true, dibuja el grid de fondo (20px). */
  showGrid?: boolean;
}

/**
 * Componente "invisible" que renderiza el plano EXACTAMENTE igual
 * que el canvas del usuario, pero sin controles (resize handles,
 * selection box, drag layer, rotation handle).
 *
 * Se usa como fuente para `html-to-image` y la exportación a PDF.
 * La idea: en lugar de re-implementar el render en Canvas 2D
 * (que generaba bugs: íconos faltantes, textPosition ignorado,
 * sillón del lounge sin dibujar, etc.), capturamos el MISMO
 * render que el usuario ve.
 *
 * Los "ligeros" (ocultar badge de asistencia, contador de
 * asientos, etc.) se aplican via CSS data-attribute:
 *   [data-export-mode="true"] .status-badge { display: none; }
 *   [data-export-mode="true"] .element-capacity { display: none; }
 *   [data-export-mode="true"] .selection-dashed { display: none; }
 *
 * El componente debe ser montado en el DOM (no en un portal) para
 * que html-to-image pueda medirlo. La práctica usual es renderizarlo
 * dentro de un contenedor padre con `position: fixed; left: -99999px`
 * (off-screen pero presente).
 */
export function PlanoSnapshot({
  elements,
  padding = 60,
  showGrid = true,
}: PlanoSnapshotProps) {
  // Calcula el bounding box del contenido en coords del mundo.
  // Si no hay elementos, fallback a 800x600 para no devolver 0x0.
  const bounds = useMemo(() => {
    if (elements.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const el of elements) {
      if (el.x < minX) minX = el.x;
      if (el.y < minY) minY = el.y;
      if (el.x + el.width > maxX) maxX = el.x + el.width;
      if (el.y + el.height > maxY) maxY = el.y + el.height;
    }
    return { minX, minY, maxX, maxY };
  }, [elements]);

  const contentW = bounds.maxX - bounds.minX;
  const contentH = bounds.maxY - bounds.minY;
  const totalW = contentW + padding * 2;
  const totalH = contentH + padding * 2;

  // Ordena por layer: estructurales al fondo, mesas encima.
  // (mismo criterio que el SeatingCanvas real)
  const sortedElements = useMemo(() => {
    const order: Record<string, number> = {
      structural: 0,
      utility: 1,
      service: 2,
      furniture: 3,
      area: 4,
      table: 5,
    };
    return [...elements].sort((a, b) => {
      const la = order[getElementLayer(a.type)] ?? 99;
      const lb = order[getElementLayer(b.type)] ?? 99;
      return la - lb;
    });
  }, [elements]);

  return (
    <div
      data-export-mode="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: totalW,
        height: totalH,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      {/* Fondo con grid opcional (mismo patrón que el canvas). */}
      {showGrid && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(#EBE5DA 1px, transparent 1px), linear-gradient(90deg, #EBE5DA 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            opacity: 0.6,
          }}
        />
      )}

      {/* Contenido: traslado el origen al padding para centrar. */}
      <div
        style={{
          position: "absolute",
          left: padding - bounds.minX,
          top: padding - bounds.minY,
        }}
      >
        {sortedElements.map((el) => (
          <TableElement key={el.id} element={el} />
        ))}
      </div>
    </div>
  );
}
