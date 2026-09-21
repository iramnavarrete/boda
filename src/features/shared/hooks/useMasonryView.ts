"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";
import {
  useMasonry,
  usePositioner,
  type RenderComponentProps,
} from "masonic";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const MASONRY_GAP = 20;
export const MASONRY_COLUMN_WIDTH = 280;
export const EXIT_DURATION_MS = 260;

export interface RectLike {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ExitingOverlay<T> {
  id: string;
  item: T;
  rect: RectLike;
}

export interface MasonryViewOptions<T> {
  items: T[];
  itemKey: (item: T) => string;
  /**
   * Hash que invalida el positioner cuando cambia algo que afecta el
   * layout (orden, contenido que afecta altura). Default: solo ids.
   */
  getLayoutHash?: (item: T) => string;
  /** Estimación inicial de altura por ítem. */
  itemHeightEstimate: number;
  /**
   * Renderiza cada card dentro de masonic. `captureRef` debe bindearse
   * al elemento raíz de la card para que el hook capture su posición
   * al desmontar.
   */
  renderItem: (props: {
    item: T;
    captureRef: (node: HTMLElement | null) => void;
  }) => ReactNode;
  /** Renderiza un item en el overlay de salida (sin capture). */
  renderExitItem: (props: { item: T }) => ReactNode;
}

export interface MasonryViewResult<T> {
  /** Ref al contenedor scrollable. */
  wrapperRef: RefObject<HTMLDivElement>;
  /** Output de masonic (cards live). */
  rendered: ReactNode;
  /** Overlays a renderizar (fade-out). Vacío después de EXIT_DURATION_MS. */
  exitingOverlays: ExitingOverlay<T>[];
  /** false hasta el primer settle de masonic (ResizeObserver). Útil para fade-in. */
  hasMeasured: boolean;
  /** Duración del exit (ms) — para sincronizar la transition del overlay. */
  exitDurationMs: number;
}

/**
 * Hook que encapsula toda la lógica de un masonry view animado:
 *
 * - Wrapper measurement (resize, scroll)
 * - Integración con `masonic` (positioner, virtualización)
 * - Captura de posición por ítem vía ref callback (solo al desmontar,
 *   para guardar la última posición conocida de items que salen)
 * - Detección de exits/revivals con timer individual por id
 * - Cache de contenido para renderizar el overlay aunque el item ya
 *   no esté en `items`
 * - Flag `hasMeasured` para enmascarar el frame inicial con
 *   estimaciones antes del primer ResizeObserver settle
 *
 * **Por qué `optionsRef`:** las funciones `itemKey`, `getLayoutHash`,
 * `renderItem`, `renderExitItem` son inline en el consumer (cambian en
 * cada render). Si las pusiera en deps de los effects, se ejecutarían
 * en cada render. Las leemos desde una ref que se actualiza en
 * `useLayoutEffect` (no durante render) → cero re-ejecuciones espurias.
 *
 * **Por qué `renderExitItem` no se devuelve:** el consumer lo pasa
 * como prop y lo usa directo en el overlay. Evitamos exponerlo desde el
 * hook para no tener que leer `optionsRef.current` en el `return` (lo
 * que dispara el lint `react-hooks/refs`).
 */
export function useMasonryView<T>(
  options: MasonryViewOptions<T>,
): MasonryViewResult<T> {
  // Ref espejo de options: leer valor actual sin depender en deps.
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  // Nodos DOM vivos por id. Se llena/limpia vía ref callback.
  const nodesRef = useRef<Map<string, HTMLElement>>(new Map());

  // Posición de cada card capturada JUSTO al desmontar. El sync effect
  // la consume para armar los overlays de salida.
  const exitRectsRef = useRef<Map<string, RectLike>>(new Map());

  // Cache del último dato conocido por id.
  const itemCacheRef = useRef<Map<string, T>>(new Map());

  // Ids del render anterior (para diffear).
  const prevIdsRef = useRef<Set<string>>(
    new Set(options.items.map((it) => options.itemKey(it))),
  );

  // Timers individuales de remoción del overlay.
  const exitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const [exitingOverlays, setExitingOverlays] = useState<ExitingOverlay<T>[]>(
    [],
  );

  const [hasMeasured, setHasMeasured] = useState(false);
  useEffect(() => {
    // Doble RAF para asegurar que el ResizeObserver ya disparó y masonic
    // ya midió antes de invalidar el positioner.
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setHasMeasured(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      if (id2) cancelAnimationFrame(id2);
    };
  }, [options.items]);

  // ── Sync estructural: exits, revivals, cache update ──
  useIsoLayoutEffect(() => {
    const { items, itemKey } = optionsRef.current;
    const currentIds = new Set(items.map((it) => itemKey(it)));

    // 1. Detectar exits y armar overlays.
    const newOverlays: ExitingOverlay<T>[] = [];
    prevIdsRef.current.forEach((id) => {
      if (currentIds.has(id)) return;
      const rect = exitRectsRef.current.get(id);
      const item = itemCacheRef.current.get(id);
      // Sin rect = no estaba visible (virtualizada / fuera de pantalla).
      if (!rect || !item) return;
      newOverlays.push({ id, item, rect });
    });
    // Limpiar para no arrastrar posiciones viejas.
    exitRectsRef.current.clear();

    if (newOverlays.length > 0) {
      setExitingOverlays((prev) => {
        const withoutDupes = prev.filter(
          (o) => !newOverlays.some((n) => n.id === o.id),
        );
        return [...withoutDupes, ...newOverlays];
      });

      newOverlays.forEach(({ id }) => {
        const existing = exitTimersRef.current.get(id);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
          setExitingOverlays((prev) => prev.filter((o) => o.id !== id));
          exitTimersRef.current.delete(id);
        }, EXIT_DURATION_MS);
        exitTimersRef.current.set(id, timer);
      });
    }

    // 2. Revived: items en overlay que vuelven a `items`.
    setExitingOverlays((prev) => {
      const stillExiting = prev.filter((o) => {
        if (currentIds.has(o.id)) {
          const t = exitTimersRef.current.get(o.id);
          if (t) {
            clearTimeout(t);
            exitTimersRef.current.delete(o.id);
          }
          return false;
        }
        return true;
      });
      return stillExiting.length === prev.length ? prev : stillExiting;
    });

    // 3. Cache update — solo items en `items` (los exiting quedan en
    // cache por escrituras anteriores del ref callback).
    items.forEach((it) => itemCacheRef.current.set(itemKey(it), it));

    prevIdsRef.current = currentIds;
  }, [options.items]);

  // Cleanup timers al desmontar.
  useEffect(() => {
    // Capturamos el Map actual del ref aquí: cuando se ejecute el
    // cleanup (al desmontar), querremos limpiar exactamente este Map.
    const timers = exitTimersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  // ── Medición del contenedor scrollable ──
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      setWrapperWidth(el.clientWidth);
      setWrapperHeight(el.clientHeight);
    };
    measure();

    const handleScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", handleScroll, { passive: true });

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      ro.disconnect();
    };
  }, []);

  // ── Hash para invalidar el positioner ──
  // Se computa inline (O(n) sobre items) — barato y evita el warning de
  // `react-hooks/exhaustive-deps` que se dispararía al usar `useMemo`
  // (las funciones inline del consumer cambian cada render → memoizar
  // sería contraproducente). masonic hace Object.is sobre el string,
  // así que el mismo contenido → mismo hash → positioner reusado.
  const items = options.items;
  const getLayoutHash = options.getLayoutHash;
  const itemKey = options.itemKey;
  const layoutHash = (
    getLayoutHash ? items.map(getLayoutHash) : items.map(itemKey)
  ).join(";");

  const positioner = usePositioner(
    {
      width:
        wrapperWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 1200),
      columnWidth: MASONRY_COLUMN_WIDTH,
      columnGutter: MASONRY_GAP,
      rowGutter: MASONRY_GAP,
    },
    [layoutHash, hasMeasured],
  );

  // Captura la posición del card al DESMONTAR (cuando React pasa `null`
  // al ref callback). Es cuando tenemos la posición "final" antes de
  // que masonic remueva el nodo del DOM.
  const renderCard = useCallback(
    (props: RenderComponentProps<T>) => {
      const { renderItem } = optionsRef.current;
      const id = optionsRef.current.itemKey(props.data);
      return renderItem({
        item: props.data,
        captureRef: (node: HTMLElement | null) => {
          if (node) {
            // Mount: guardar el nodo vivo y limpiar el rect de exit.
            nodesRef.current.set(id, node);
            exitRectsRef.current.delete(id);
            return;
          }
          // Unmount: capturar la última posición antes de que se pierda.
          const prevNode = nodesRef.current.get(id);
          nodesRef.current.delete(id);

          const wrapper = wrapperRef.current;
          if (!prevNode || !wrapper) return;

          const wrapperRect = wrapper.getBoundingClientRect();
          const r = prevNode.getBoundingClientRect();
          const rect: RectLike = {
            top: r.top - wrapperRect.top + wrapper.scrollTop,
            left: r.left - wrapperRect.left,
            width: r.width,
            height: r.height,
          };

          // Solo guardar si estaba visible. Cards que masonic desmonta
          // por virtualización no se animan.
          const visibleTop = wrapper.scrollTop;
          const visibleBottom = visibleTop + wrapper.clientHeight;
          if (rect.top + rect.height < visibleTop || rect.top > visibleBottom)
            return;

          exitRectsRef.current.set(id, rect);
        },
      });
    },
    [],
  );

  const rendered = useMasonry<T>({
    items,
    positioner,
    height: wrapperHeight || 800,
    scrollTop,
    itemKey: options.itemKey,
    itemHeightEstimate: options.itemHeightEstimate,
    overscanBy: 2,
    render: renderCard,
  });

  return {
    wrapperRef,
    rendered,
    exitingOverlays,
    hasMeasured,
    exitDurationMs: EXIT_DURATION_MS,
  };
}
