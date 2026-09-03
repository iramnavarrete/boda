"use client";

import { toPng } from "html-to-image";
import { SeatingElement } from "@/types/seating";
import { useSeatingStore } from "../../stores/useSeatingStore";

export interface SnapshotOptions {
  /** Factor de escala del PNG. 2 ≈ 200 DPI, 2.5 ≈ 300 DPI. */
  pixelRatio?: number;
  /** Padding alrededor del contenido (en coords del mundo). */
  padding?: number;
}

export interface CapturedSnapshot {
  dataUrl: string;
  width: number;
  height: number;
}

const SNAPSHOT_PORTAL_ID = "plano-snapshot-portal";

/**
 * Captura el `<PlanoSnapshot>` (montado via portal por
 * `<PlanoSnapshotPortal>` dentro del SeatingManager) usando
 * `html-to-image` y lo convierte a PNG.
 *
 * Flujo:
 *   1. Activa `isSnapshotVisible` en el store
 *   2. Espera a que React monte el portal y los TableElements
 *   3. Captura el div off-screen con html-to-image
 *   4. Desactiva `isSnapshotVisible`
 *
 * ¿Por qué este enfoque? El portal está DENTRO del SeatingManager
 * (dentro del SeatingModalContext.Provider), así que los TableElements
 * tienen acceso a todos los contexts que necesitan.
 */
export async function capturePlanSnapshot(
  _elements: SeatingElement[], // unused pero se mantiene por compat
  options: SnapshotOptions = {},
): Promise<CapturedSnapshot> {
  const pixelRatio = options.pixelRatio ?? 2.5;
  const store = useSeatingStore.getState();

  // 1) Activar el snapshot via el flag del store
  store.setSnapshotVisible(true);

  try {
    // 2) Esperar a que React monte el portal + TableElements
    //    (2 frames: 1 para el commit, 1 para SVGs/fonts)
    await waitFrames(2);

    // 3) Buscar el div off-screen del portal
    const mountEl = document.getElementById(SNAPSHOT_PORTAL_ID);
    if (!mountEl || !mountEl.firstElementChild) {
      throw new Error("El snapshot no se montó en el DOM.");
    }
    const snapshotEl = mountEl.firstElementChild as HTMLElement;

    const dataUrl = await toPng(snapshotEl, {
      pixelRatio,
      backgroundColor: "#FFFFFF",
      cacheBust: true,
      // Evita intentar embeber fonts externas (que pueden fallar por CORS)
      skipFonts: true,
    });

    return {
      dataUrl,
      width: snapshotEl.offsetWidth * pixelRatio,
      height: snapshotEl.offsetHeight * pixelRatio,
    };
  } finally {
    // 4) Cleanup: ocultar el snapshot
    useSeatingStore.getState().setSnapshotVisible(false);
  }
}

function waitFrames(n: number): Promise<void> {
  return new Promise((resolve) => {
    const tick = (i: number) => {
      if (i >= n) resolve();
      else requestAnimationFrame(() => tick(i + 1));
    };
    requestAnimationFrame(() => tick(1));
  });
}
