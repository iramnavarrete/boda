import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  botanicLevelFromHeight,
  type BotanicLevel,
} from "../constants/botanic";

/**
 * Detecta el nivel de botánico decorativo que corresponde a un elemento
 * según su altura actual.
 *
 * Combina `useLayoutEffect` (medición inicial sincrónica, evita flash en
 * el primer paint) con un `ResizeObserver` (cambios posteriores, ej. el
 * badge "Nuevo" aparece/desaparece al togglear leído).
 *
 * @param ref Ref al elemento a medir (típicamente la card).
 * @returns Nivel actual: "short" | "medium" | "tall".
 */
export function useBotanicLevel(
  ref: RefObject<HTMLElement | null>,
): BotanicLevel {
  const [level, setLevel] = useState<BotanicLevel>("short");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setLevel(botanicLevelFromHeight(el.getBoundingClientRect().height));
    // Solo medimos al montar; el ResizeObserver se encarga de los cambios.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setLevel(botanicLevelFromHeight(entry.contentRect.height));
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return level;
}

/** Ref hook helper: crea un `useRef<HTMLDivElement>(null)` con tipado fuerte. */
export function useElementRef<T extends HTMLElement = HTMLDivElement>() {
  return useRef<T | null>(null);
}
