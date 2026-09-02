"use client";

import { useDndMonitor } from "@dnd-kit/core";

/**
 * Sincroniza la clase CSS `is-dragging-active` en un elemento del
 * DOM basándose en los eventos de dnd-kit, SIN causar re-renders
 * de React en el componente padre.
 *
 * ¿Por qué? El hook `useDndContext()` fuerza un re-render del
 * componente que lo usa cada vez que cambia el `active` de dnd-kit
 * (inicio, fin, o cada movimiento si se lee dentro de un RAF).
 * Si solo necesitamos aplicar una clase CSS al container, podemos
 * hacerlo directamente con `classList.add/remove` y evitar ese
 * re-render.
 *
 * Uso:
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   <div ref={containerRef} ...>
 *     <DraggingClassApplier containerRef={containerRef} />
 *     ...
 *   </div>
 */
export function DraggingClassApplier({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  useDndMonitor({
    onDragStart: () => {
      containerRef.current?.classList.add("is-dragging-active");
    },
    onDragEnd: () => {
      containerRef.current?.classList.remove("is-dragging-active");
    },
    onDragCancel: () => {
      containerRef.current?.classList.remove("is-dragging-active");
    },
  });

  return null;
}
