"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { DragOverlayContent } from "./DragOverlayContent";
import { DragItemData } from "@/types/seating";

// Funciones a nivel de módulo para `useSyncExternalStore`.
// Más estables que definirlas dentro del componente y evita el
// warning de "Calling setState synchronously within an effect"
// que aparecía con el patrón `useEffect(() => setMounted(true), [])`.
const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface CursorCenteredDragOverlayProps {
  activeDragItem: {
    id: string;
    type: string | undefined;
    data: DragItemData | null;
    /**
     * Posición del cursor al inicio del drag (del `activatorEvent` de dnd-kit).
     * Se usa para evitar un frame en (0,0) antes del primer `pointermove`.
     * Opcional: si no se provee, se usa la posición del primer `pointermove`.
     */
    initialCursor?: { x: number; y: number };
  } | null;
  /**
   * Ref compartido con el padre. Se actualiza en cada `pointermove` con
   * la posición real del cursor en coordenadas de pantalla. El padre
   * lo lee en `onDragEnd` para calcular la posición de drop usando
   * el cursor real, sin depender del `event.delta` de dnd-kit
   * (que NO equivale al movimiento del cursor cuando no se usa
   * `DragOverlay`: ver `nodeRectDelta` en el source de dnd-kit).
   */
  cursorPosRef: React.MutableRefObject<{ x: number; y: number } | null>;
}

/**
 * Overlay de arrastre **centrado en el cursor**.
 *
 * A diferencia del `DragOverlay` de dnd-kit — que preserva el punto exacto
 * donde se agarró el elemento fuente — este overlay siempre posiciona su
 * centro en el cursor, sin importar si el usuario lo agarró de una orilla
 * o del centro.
 *
 * ¿Por qué?
 * Cuando se arrastra desde el sidebar (item angosto, ej. ~200px) hacia el
 * canvas, el overlay (mesa ancha, ej. ~500px) tiene un tamaño muy distinto
 * al del elemento fuente. dnd-kit intenta mantener el "punto de agarre"
 * bajo el cursor, lo que provoca que el overlay aparezca visualmente
 * desfasado hacia un lado. Este componente ignora ese offset y siempre
 * centra el overlay en el cursor, dando una experiencia consistente
 * independientemente del tamaño del elemento fuente o el punto de agarre.
 *
 * Además, expone la posición REAL del cursor vía `cursorPosRef` para que
 * el padre pueda calcular la posición de drop sin depender de
 * `event.delta` (que tiene quirks cuando no se usa `DragOverlay`).
 */
export function CursorCenteredDragOverlay({
  activeDragItem,
  cursorPosRef,
}: CursorCenteredDragOverlayProps) {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  // `mounted` vía useSyncExternalStore: false en SSR, true en cliente.
  // No causa el warning de cascading render.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!activeDragItem) {
      cursorPosRef.current = null;
      return;
    }

    // Inicializa el ref con la posición del activator event.
    cursorPosRef.current = activeDragItem.initialCursor ?? null;

    const handlePointerMove = (e: PointerEvent) => {
      const pos = { x: e.clientX, y: e.clientY };
      setCursorPos(pos);
      cursorPosRef.current = pos;
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [activeDragItem, cursorPosRef]);

  if (!mounted || !activeDragItem || !cursorPos) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: `${cursorPos.x}px`,
        top: `${cursorPos.y}px`,
        pointerEvents: "none",
        zIndex: 99999,
      }}
    >
      <DragOverlayContent activeDragItem={activeDragItem} />
    </div>,
    document.body,
  );
}
