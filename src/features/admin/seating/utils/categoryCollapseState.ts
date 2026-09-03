/**
 * State global del colapso de categorías en `ElementsPalette`.
 *
 * Por qué módulo-level (no useState):
 *   El `ElementsPalette` se DESMONTA cada vez que el usuario
 *   selecciona un elemento del plano (porque el sidebar cambia a
 *   `ElementSidebar`). Al volver a abrir el sidebar de elementos,
 *   el componente se re-monta y un `useState` se reinicia a sus
 *   defaults. Con esta variable de módulo, el state persiste
 *   entre mounts: si el usuario expandió "Espacios" y seleccionó
 *   un espacio, al volver al sidebar de elementos "Espacios"
 *   sigue expandida.
 *
 * Por qué `useSyncExternalStore` (no useState inicial):
 *   Para que React se entere de los cambios cuando el usuario
 *   hace toggle de una categoría, el componente necesita
 *   re-renderizar. `useSyncExternalStore` es la API de React 18
 *   para suscribirse a stores externos.
 *
 * Por qué localStorage:
 *   Persiste entre refreshes del navegador. El usuario no
 *   pierde su setup al refrescar la página. La carga es
 *   despreciable: una escritura sincrónica por toggle (típico:
 *   1-2 KB de JSON).
 */
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "seating:collapsed-categories";

const DEFAULT: Record<string, boolean> = {
  Estructural: true,
  Servicios: true,
  Mobiliario: true,
  Espacios: true,
  Utilidades: true,
};

/**
 * Carga el state inicial desde localStorage. Se ejecuta UNA vez
 * al cargar el módulo (no en cada render).
 */
function loadInitial(): Record<string, boolean> {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge con defaults para añadir categorías nuevas que se
      // agreguen en el futuro (no perder el setup del usuario).
      return { ...DEFAULT, ...parsed };
    }
  } catch {
    // JSON inválido o localStorage no disponible → usar defaults
  }
  return DEFAULT;
}

let state: Record<string, boolean> = loadInitial();
const listeners = new Set<() => void>();

/** Getter para `useSyncExternalStore`. Retorna la misma referencia
 *  hasta el próximo toggle, así React no re-renderiza innecesariamente. */
export function getCollapsedCategories(): Record<string, boolean> {
  return state;
}

/** Toggle de una categoría. Persiste en localStorage y notifica a
 *  los subscribers. */
export function toggleCategory(category: string): void {
  state = { ...state, [category]: !state[category] };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage lleno o no disponible → ignorar silenciosamente
    }
  }
  listeners.forEach((l) => l());
}

/** Subscribe para `useSyncExternalStore`. */
export function subscribeCollapsedCategories(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Hook que retorna el state de colapso y una función para togglear. */
export function useCategoryCollapse(): {
  collapsed: Record<string, boolean>;
  toggle: (category: string) => void;
} {
  const collapsed = useSyncExternalStore(
    subscribeCollapsedCategories,
    getCollapsedCategories,
    getCollapsedCategories,
  );
  return { collapsed, toggle: toggleCategory };
}
