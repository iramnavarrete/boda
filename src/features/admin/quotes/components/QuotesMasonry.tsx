"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useMasonry,
  usePositioner,
  type RenderComponentProps,
} from "masonic";
import { motion } from "framer-motion";
import { FamilyQuoteMap } from "@/services/familyQuotesService";
import FamilyQuoteCard from "./FamilyQuoteCard";

const MASONRY_GAP = 20;
const MASONRY_COLUMN_WIDTH = 280;
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

interface QuotesMasonryProps {
  messages: FamilyQuoteMap[];
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

/**
 * Grid masonry virtualizado con `masonic` + animaciones de framer-motion.
 *
 * DISEÑO: `items` de useMasonry es SIEMPRE `messages` directo, sin
 * buffer de estructura. Los ítems que "salen" (por filtro o toggle) se
 * capturan en su última posición conocida y se renderizan en una capa
 * overlay INDEPENDIENTE (position: absolute), que no participa del
 * cálculo de columnas de masonic. Así el masonry real (lo que queda o
 * lo que entra) siempre obtiene su posición final correcta de
 * inmediato, sin distorsión por ítems que están despidiéndose.
 */
const QuotesMasonry = ({ messages, onManualToggle }: QuotesMasonryProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  // Última posición conocida en pantalla de cada card (relativa al
  // contenedor scrolleable). Se actualiza en cada render vía ref
  // callback. Cuando un id desaparece de `messages`, esta es la
  // posición que usamos para el overlay de salida.
  const lastRectRef = useRef<Map<string, RectLike>>(new Map());

  // Cache del último dato conocido de cada item (para poder renderizar
  // su contenido en el overlay aunque ya no esté en `messages`).
  const itemCacheRef = useRef<Map<string, FamilyQuoteMap>>(new Map());

  // Ids presentes en el `messages` del render anterior, para diffear.
  const prevIdsRef = useRef<Set<string>>(new Set(messages.map((m) => m.id)));

  // Timers de remoción del overlay, por id.
  const exitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const [exitingOverlays, setExitingOverlays] = useState<
    Array<{ id: string; item: FamilyQuoteMap; rect: RectLike }>
  >([]);

  useEffect(() => {
    const currentIds = new Set(messages.map((m) => m.id));
    const prevIds = prevIdsRef.current;

    const removedIds = [...prevIds].filter((id) => !currentIds.has(id));

    if (removedIds.length > 0) {
      const newOverlays = removedIds
        .map((id) => {
          const rect = lastRectRef.current.get(id);
          const item = itemCacheRef.current.get(id);
          // Si nunca se llegó a medir (estaba fuera del viewport +
          // overscan, virtualizado), no hay nada que animar: se
          // descarta silenciosamente, no es visible de todas formas.
          if (!rect || !item) return null;
          return { id, item, rect };
        })
        .filter(
          (o): o is { id: string; item: FamilyQuoteMap; rect: RectLike } =>
            o !== null,
        );

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
    }

    // "Revividos": un id que estaba en el overlay volvió a aparecer en
    // `messages` antes de que terminara su animación de salida (ej.
    // toggle rápido de ida y vuelta). Se cancela su timer y se saca del
    // overlay — vuelve a ser un ítem normal del masonry real.
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

    // Refrescar cache de contenido con lo que hay en `messages` AHORA,
    // después del lookup de removals — así los items que están saliendo
    // todavía tienen su última versión disponible para el overlay en
    // ESTE mismo effect. El `forEach` solo hace `.set()`, nunca borra:
    // los exiting siguen en el cache mientras dure su animación.
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

  // Hash para invalidar el positioner: ids presentes + lo que afecta
  // altura. `leido` excluido a propósito (no afecta altura del card).
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
    [layoutHash],
  );

  const renderCard = useCallback(
    (props: RenderComponentProps<FamilyQuoteMap>) => {
      const id = props.data.id;
      return (
        <motion.div
          layout
          // IMPORTANTE: función inline a propósito, NO memoizar con
          // useCallback/useMemo. Necesitamos que React la re-invoque en
          // cada render de esta card para mantener `lastRectRef`
          // actualizado con la posición vigente (memoizarla rompería la
          // captura continua y el overlay usaría coordenadas viejas).
          ref={(node) => {
            if (node && wrapperRef.current) {
              const wrapperRect = wrapperRef.current.getBoundingClientRect();
              const nodeRect = node.getBoundingClientRect();
              lastRectRef.current.set(id, {
                top:
                  nodeRect.top -
                  wrapperRect.top +
                  wrapperRef.current.scrollTop,
                left: nodeRect.left - wrapperRect.left,
                width: nodeRect.width,
                height: nodeRect.height,
              });
            }
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
      className="relative h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#EBE5DA] pr-1"
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
