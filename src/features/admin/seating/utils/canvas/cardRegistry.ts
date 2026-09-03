/**
 * Registro de los nodos DOM de las cards del seating.
 *
 * ¿Por qué existe?
 *   Cuando se arrastra un elemento del canvas (tipo "element" en dnd-kit),
 *   necesitamos actualizar su `style.transform` directamente desde un
 *   listener de `pointermove` en `window` (sin pasar por React) para
 *   evitar el desfase acumulado que produce el ciclo de render de
 *   React con movimientos rápidos.
 *
 *   Para eso, el `TableElement` se REGISTRA en este map al montarse
 *   (con su nodo DOM y su `id`) y se DESREGISTRA al desmontarse. El
 *   SeatingManager lee el map en su `pointermove` listener para
 *   encontrar las cards a actualizar.
 *
 *   Es un module-level state (no un Context ni un store) porque:
 *     - No necesita reactividad de React: solo lo leemos en listeners
 *       nativos de DOM (pointermove, pointerup), no en JSX.
 *     - Queremos el costo más bajo posible: una simple inserción en un
 *       Map, sin re-renders.
 */

const cards = new Map<string, HTMLElement>();

/** Registra la card de un elemento. Llamar desde un callback ref al montar. */
export function registerCard(id: string, el: HTMLElement | null): void {
  if (el) {
    cards.set(id, el);
  } else {
    cards.delete(id);
  }
}

/** Devuelve la card registrada para un id, o undefined. */
export function getCard(id: string): HTMLElement | undefined {
  return cards.get(id);
}

/** Itera sobre todas las cards registradas. */
export function forEachCard(fn: (el: HTMLElement, id: string) => void): void {
  for (const [id, el] of cards) {
    fn(el, id);
  }
}
