"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMasonry, usePositioner, type RenderComponentProps } from "masonic";
import { motion } from "framer-motion";
import { FamilyQuoteMap } from "@/services/familyQuotesService";
import FamilyQuoteCard from "./FamilyQuoteCard";

// Evita el warning de useLayoutEffect en SSR (Next).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Gap entre cards del masonry (px). */
const MASONRY_GAP = 20;

/** Ancho mínimo de cada columna del masonry (masonic deriva las reales). */
const MASONRY_COLUMN_WIDTH = 280;

/**
 * Estimación inicial de altura para evitar saltos en el primer render.
 * Promedio observado en `FamilyQuoteCard`: ~200–260px en cards cortas,
 * ~280–360px en cards largas. Usamos 240 como valor intermedio.
 */
const ITEM_HEIGHT_ESTIMATE = 240;

/**
 * Duración (ms) de la animación de salida de la capa overlay.
 * Debe coincidir con la `transition` del overlay más abajo.
 */
const EXIT_DURATION_MS = 260;

interface RectLike {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ExitingOverlay {
  id: string;
  item: FamilyQuoteMap;
  rect: RectLike;
}

interface QuotesMasonryProps {
  messages: FamilyQuoteMap[];
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

const QuotesMasonry = ({ messages, onManualToggle }: QuotesMasonryProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  // Nodos DOM vivos por id. Se llena/limpia vía ref callback en
  // mount/unmount de cada card.
  const nodesRef = useRef<Map<string, HTMLElement>>(new Map());

  // Posición de cada card medida justo en su desmontaje (ver el ref
  // callback en `renderCard`). El layout effect de `messages` la consume
  // para armar los overlays de salida.
  const exitRectsRef = useRef<Map<string, RectLike>>(new Map());

  // Cache del último dato conocido de cada item (para poder renderizar
  // su contenido en el overlay aunque ya no esté en `messages`).
  const itemCacheRef = useRef<Map<string, FamilyQuoteMap>>(new Map());

  // Ids presentes en el `messages` del render anterior, para diffear.
  const prevIdsRef = useRef<Set<string>>(new Set(messages.map((m) => m.id)));

  // Timers de remoción del overlay, por id.
  const exitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const [exitingOverlays, setExitingOverlays] = useState<ExitingOverlay[]>([]);

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
  }, [messages]);

  useIsoLayoutEffect(() => {
    const currentIds = new Set(messages.map((m) => m.id));

    const newOverlays: ExitingOverlay[] = [];
    prevIdsRef.current.forEach((id) => {
      if (currentIds.has(id)) return;
      const rect = exitRectsRef.current.get(id);
      const item = itemCacheRef.current.get(id);
      // Sin rect = no estaba visible (virtualizada / fuera de pantalla):
      // no hay nada que animar, no se ve de todas formas.
      if (!rect || !item) return;
      newOverlays.push({ id, item, rect });
    });
    // Limpiar para no arrastrar posiciones viejas a futuros cambios.
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

    // Refrescar cache de contenido con lo que hay en `messages` AHORA.
    // El `forEach` solo hace `.set()`, nunca borra: los exiting siguen
    // en el cache mientras dure su animación.
    messages.forEach((m) => itemCacheRef.current.set(m.id, m));

    prevIdsRef.current = currentIds;
  }, [messages]);

  useEffect(() => {
    return () => {
      exitTimersRef.current.forEach(clearTimeout);
      exitTimersRef.current.clear();
    };
  }, []);

  // Medición del contenedor scrollable.
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

  const layoutHash = useMemo(
    () =>
      messages
        .map(
          (m) =>
            `${m.id}|${m.mensaje.length}|${m.autor.length}|${m.parentesco ?? ""}`,
        )
        .join(";"),
    [messages],
  );

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

  const renderCard = useCallback(
    (props: RenderComponentProps<FamilyQuoteMap>) => {
      const id = props.data.id;
      return (
        <motion.div
          layout
          ref={(node: HTMLDivElement | null) => {
            if (node) {
              nodesRef.current.set(id, node);
              exitRectsRef.current.delete(id);
              return;
            }

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
            const visibleTop = wrapper.scrollTop;
            const visibleBottom = visibleTop + wrapper.clientHeight;
            if (rect.top + rect.height < visibleTop || rect.top > visibleBottom)
              return;

            exitRectsRef.current.set(id, rect);
          }}
          className="w-full"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            layout: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
            default: { type: "spring", stiffness: 300, damping: 30 },
          }}
        >
          <FamilyQuoteCard msg={props.data} onManualToggle={onManualToggle} />
        </motion.div>
      );
    },
    [onManualToggle],
  );

  const rendered = useMasonry<FamilyQuoteMap>({
    items: messages,
    positioner,
    height: wrapperHeight || 800,
    scrollTop,
    itemKey: (m) => m.id,
    itemHeightEstimate: ITEM_HEIGHT_ESTIMATE,
    overscanBy: 2,
    render: renderCard,
  });

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#EBE5DA] pr-1 transition-opacity duration-150 ${hasMeasured ? "opacity-100" : "opacity-0"}`}
    >
      {rendered}

      {exitingOverlays.map(({ id, item, rect }) => (
        <motion.div
          key={`exiting-${id}`}
          className="absolute pointer-events-none"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.92 }}
          transition={{
            duration: EXIT_DURATION_MS / 1000,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          <FamilyQuoteCard msg={item} onManualToggle={onManualToggle} />
        </motion.div>
      ))}
    </div>
  );
};

export default QuotesMasonry;
