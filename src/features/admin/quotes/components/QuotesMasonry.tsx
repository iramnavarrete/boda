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
 * Duración (ms) que mantenemos un ítem "exiting" en `displayedItems`
 * antes de removerlo de verdad. Coincide con el spring de framer-motion
 * (stiffness 300 / damping 30) que tarda ~220ms en estabilizarse.
 */
const EXIT_DURATION_MS = 220;

interface QuotesMasonryProps {
  messages: FamilyQuoteMap[];
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

/**
 * Grid masonry virtualizado con `masonic` + animaciones de framer-motion.
 *
 * **Por qué dos arreglos (`messages` vs `displayedItems`):**
 * masonic desmonta un ítem en cuanto sale del array `items`. Sin un buffer,
 * no hay forma de que framer-motion anime la salida (no llega a montar
 * el frame de "exit"). Por eso:
 * - Cuando llegan ítems nuevos al prop `messages`, se sincronizan
 *   inmediatamente en `displayedItems` → entran con `initial`/`animate`.
 * - Cuando un ítem desaparece del prop `messages`, permanece en
 *   `displayedItems` durante `EXIT_DURATION_MS`, marcado como "exiting"
 *   para que framer-motion anime a `{opacity:0, scale:0.9}`.
 * - Tras el timeout, recién se remueve del array.
 *
 * **Virtualización preservada:**
 * masonic decide qué renderizar según viewport + overscan. Solo los
 * ítems visibles se animan; los fuera de pantalla se saltan.
 */
const QuotesMasonry = ({ messages, onManualToggle }: QuotesMasonryProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  // Buffer de ítems que verá el usuario (con posible retraso en remoción).
  const [displayedItems, setDisplayedItems] = useState<FamilyQuoteMap[]>(messages);

  // Sincronización de `displayedItems` con el prop `messages`.
  useEffect(() => {
    const incomingIds = new Set(messages.map((m) => m.id));
    let removedIds: string[] = [];

    setDisplayedItems((prev) => {
      const toExit = prev.filter((p) => !incomingIds.has(p.id));
      removedIds = toExit.map((t) => t.id);
      // Incoming + exiting: los exiting se quedan al final para que su
      // posición de layout cambie si masonic los reordena (framer-motion
      // anima ese cambio + el fade-out).
      return [...messages, ...toExit];
    });

    if (removedIds.length > 0) {
      const timer = setTimeout(() => {
        setDisplayedItems((prev) =>
          prev.filter((p) => incomingIds.has(p.id)),
        );
      }, EXIT_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // `exitingIds` derivado: ítems que están en displayedItems pero ya no
  // están en messages. No requiere estado propio — se recalcula cuando
  // cualquiera de los dos cambia.
  const exitingIds = useMemo(() => {
    const incomingIds = new Set(messages.map((m) => m.id));
    const set = new Set<string>();
    displayedItems.forEach((d) => {
      if (!incomingIds.has(d.id)) set.add(d.id);
    });
    return set;
  }, [displayedItems, messages]);

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

  // Hash estable para invalidar el positioner SOLO cuando algo que afecta
  // el layout cambia (orden, contenido que afecta altura, ID nuevo).
  //
  // `leido` se omite a propósito: al marcar como leído/desleído NO queremos
  // que masonic recalcule posiciones (el badge es absolute, el botón de mail
  // tiene tamaño fijo → la altura visual no cambia → no debe haber layout
  // shift). Incluir `leido` aquí causaba un parpadeo no deseado.
  const layoutHash = useMemo(
    () =>
      displayedItems
        .map((m) =>
          // Solo los campos que afectan la altura visible del card.
          `${m.id}|${m.mensaje.length}|${m.autor.length}|${m.parentesco ?? ""}`,
        )
        .join(";"),
    [displayedItems],
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
      const isExiting = exitingIds.has(props.data.id);
      return (
        <motion.div
          layout
          layoutId={props.data.id}
          className="w-full"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{
            opacity: isExiting ? 0 : 1,
            y: 0,
            scale: isExiting ? 0.9 : 1,
            pointerEvents: isExiting ? ("none" as const) : ("auto" as const),
          }}
          // Transiciones separadas:
          //  - `layout`: cambios de posición/tamaño (reorder, altura al editar
          //    el contenido del mensaje) → easeOut suave para que se sienta orgánico.
          //  - `default`: entrada/salida → spring snappy.
          transition={{
            layout: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
            default: { type: "spring", stiffness: 300, damping: 30 },
          }}
        >
          <FamilyQuoteCard
            msg={props.data}
            onManualToggle={onManualToggle}
          />
        </motion.div>
      );
    },
    [exitingIds, onManualToggle],
  );

  const rendered = useMasonry<FamilyQuoteMap>({
    items: displayedItems,
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
      className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#EBE5DA] pr-1"
    >
      {rendered}
    </div>
  );
};

export default QuotesMasonry;
