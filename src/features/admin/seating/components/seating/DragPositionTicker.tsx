"use client";

import { useEffect, useRef } from "react";
import {
  useDndMonitor,
  type DragStartEvent,
  type DragMoveEvent,
} from "@dnd-kit/core";
import { useZoomStore } from "../../stores/useZoomStore";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { useDragStateStore } from "../../stores/dragStateStore";
import { getCard } from "../../utils/canvas/cardRegistry";

interface DragSession {
  /** IDs a los que se les aplica el transform (arrastrada + bulk). */
  ids: string[];
  /** Cache de rotaciones, leídas UNA vez al iniciar el drag. */
  rotationById: Map<string, number>;
  /** Último delta oficial de dnd-kit (mismo que recibiremos en onDragEnd). */
  latestDelta: { x: number; y: number };
}

/**
 * Dueño ÚNICO del `style.transform` de las cards mientras se arrastra.
 *
 * ¿Por qué este componente existe?
 *   Hay dos sistemas escribiendo `style.transform` sobre el mismo nodo
 *   sin coordinación:
 *     1. El `transformStyle` IIFE en `TableElement`, que usa el
 *        `transform` de `useDraggable` (React state, async).
 *     2. Antes: un listener raw de `pointermove` que escribía
 *        `card.style.transform` directamente.
 *   Ambos calculan el delta con fórmulas distintas y compiten por
 *   el mismo nodo en frames distintos → temblor/brinco visible.
 *
 *   La solución: un solo dueño (este ticker) que escribe el
 *   `style.transform` directo al DOM en cada `requestAnimationFrame`,
 *   alimentado por `useDndMonitor` (API oficial de dnd-kit). Mientras
 *   dura el drag, `TableElement` retorna `undefined` en su IIFE y NO
 *   toca el transform. Resultado: cero competencia.
 *
 * ¿Por qué `useDndMonitor` y no un listener raw de `pointermove`?
 *   `useDndMonitor.onDragMove` se dispara DESPUÉS de que dnd-kit
 *   procesó el `pointermove` y actualizó `event.delta`. Garantiza
 *   lectura fresca y consistente con el delta que recibiremos en
 *   `handleDragEnd` → el drop calza exacto con la última posición
 *   pintada.
 *
 * ¿Por qué `requestAnimationFrame`?
 *   Los `pointermove` pueden dispararse a 100-1000Hz. Solo queremos
 *   actualizar el DOM una vez por frame (60fps en la mayoría de
 *   monitores). El RAF agrupa múltiples `delta` updates en una
 *   sola escritura al DOM, evitando trabajo redundante.
 *
 * Composición del transform:
 *   `translate3d(dx, dy, 0) rotate(deg)` — el translate opera en
 *   el sistema de coordenadas del padre (no rotado), y el rotate
 *   rota el contenido DESPUÉS. Así no hay shear/deformación
 *   aunque el elemento tenga `rotation != 0`.
 */
export function DragPositionTicker() {
  const sessionRef = useRef<DragSession | null>(null);
  const rafRef = useRef<number | null>(null);

  /**
   * Limpia el estado al final del drag (o al desmontar). Restablece
   * el `style.transform` de las cards a "" para que React retome el
   * control en el próximo render (que ya llegará con `element.x/y`
   * actualizados desde `handleDragEnd`).
   */
  const cleanup = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const session = sessionRef.current;
    if (session) {
      for (const id of session.ids) {
        const card = getCard(id);
        if (card) card.style.transform = "";
      }
    }
    sessionRef.current = null;
    useDragStateStore.getState().clearDraggingIds();
  };

  /**
   * El loop de RAF. Lee `latestDelta` (que `onDragMove` actualiza
   * de forma asíncrona vía dnd-kit) y aplica el transform a cada
   * card registrada. Una sola escritura al DOM por frame.
   */
  const tick = () => {
    const session = sessionRef.current;
    if (!session) return;

    const zoom = useZoomStore.getState().zoom || 1;

    // `event.delta` de dnd-kit YA incluye el scroll acumulado
    // (dnd-kit mide la diferencia entre `rect.translated` y
    // `rect.initial`, ambos en coords de viewport post-scroll).
    // Dividir por zoom convierte a coords del mundo. NO
    // sumamos compensación manual de scroll — eso era DOBLE
    // conteo y provocaba que el elemento se moviera más de lo
    // que el cursor avanzaba al hacer scroll.
    const dx = session.latestDelta.x / zoom;
    const dy = session.latestDelta.y / zoom;

    for (const id of session.ids) {
      const card = getCard(id);
      if (!card) continue;
      const rotation = session.rotationById.get(id) ?? 0;
      card.style.transform = rotation
        ? `translate3d(${dx}px, ${dy}px, 0) rotate(${rotation}deg)`
        : `translate3d(${dx}px, ${dy}px, 0)`;
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  useDndMonitor({
    onDragStart(event: DragStartEvent) {
      const data = event.active.data.current as { type?: string } | undefined;
      // Solo nos importan los drags de elementos existentes. Los
      // drags del palette (palette_element) usan el overlay y caen
      // en `handleDragEnd` directamente.
      if (data?.type !== "element") return;

      const draggedId = String(event.active.id).replace("element-", "");
      const selectedIds = useSeatingStore.getState().selectedElementIds;
      const ids = Array.from(new Set<string>([draggedId, ...selectedIds]));

      const elements = useSeatingStore.getState().elements;
      const rotationById = new Map(
        elements.map((e) => [e.id, e.rotation ?? 0]),
      );

      sessionRef.current = {
        ids,
        rotationById,
        latestDelta: { x: 0, y: 0 },
      };

      // Un solo render por elemento afectado (entrada al drag), no
      // uno por frame. `useIsElementDragging(id)` usa este Set como
      // selector; solo re-renderiza cuando `has(id)` cambia.
      useDragStateStore.getState().setDraggingIds(new Set(ids));

      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    },

    onDragMove(event: DragMoveEvent) {
      if (!sessionRef.current) return;
      // `event.delta` es el delta oficial de dnd-kit: el MISMO valor
      // que llegará en `onDragEnd`, así que el drop siempre calza
      // exacto con la última posición pintada.
      sessionRef.current.latestDelta = {
        x: event.delta.x,
        y: event.delta.y,
      };
    },

    onDragEnd() {
      cleanup();
    },

    onDragCancel() {
      cleanup();
    },
  });

  // Safety net: si el componente se desmonta durante un drag (ej.
  // cambio de página), limpiamos el estado.
  useEffect(() => cleanup, []);

  return null;
}
