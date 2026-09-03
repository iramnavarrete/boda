"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { PlanoSnapshot } from "./PlanoSnapshot";

/**
 * Portal que monta el `<PlanoSnapshot>` en un div off-screen de
 * `document.body`, PERO DENTRO del árbol de React del SeatingManager
 * (donde está el `SeatingModalContext.Provider` y los demás providers).
 *
 * ¿Por qué un portal y no un createRoot separado?
 * - createRoot crea un árbol de React independiente, sin acceso a
 *   los contexts (SeatingModalContext, DndContext, etc.) → los
 *   TableElements fallan al usar `useContext`.
 * - createPortal mantiene al snapshot DENTRO del mismo árbol de
 *   React (con todos los contexts disponibles) pero lo "transporta"
 *   a `document.body` para que sea invisible al usuario.
 *
 * El snapshot se monta SOLO cuando `isSnapshotVisible` es true
 * (típicamente solo durante una captura de exportación). El resto
 * del tiempo retorna null → 0 overhead.
 */
export function PlanoSnapshotPortal() {
  const isVisible = useSeatingStore((state) => state.isSnapshotVisible);
  const elements = useSeatingStore((state) => state.elements);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Crea el contenedor off-screen una sola vez
  useEffect(() => {
    const div = document.createElement("div");
    div.id = "plano-snapshot-portal";
    div.style.position = "fixed";
    div.style.left = "-99999px";
    div.style.top = "0";
    div.style.pointerEvents = "none";
    div.style.zIndex = "-1";
    document.body.appendChild(div);
    containerRef.current = div;

    return () => {
      document.body.removeChild(div);
      containerRef.current = null;
    };
  }, []);

  if (!isVisible || !containerRef.current) return null;

  return createPortal(
    <PlanoSnapshot elements={elements} padding={60} showGrid={false} />,
    containerRef.current,
  );
}
