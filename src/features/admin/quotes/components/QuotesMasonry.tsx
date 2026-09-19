"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useMasonry,
  usePositioner,
  type RenderComponentProps,
} from "masonic";
import { FamilyQuoteMap } from "@/services/familyQuotesService";
import FamilyQuoteCard from "./FamilyQuoteCard";

/** Gap entre cards del masonry (px). */
const MASONRY_GAP = 20;

/** Ancho mínimo de cada columna del masonry (masonic deriva las reales). */
const MASONRY_COLUMN_WIDTH = 280;

/** Estimación inicial de altura para evitar saltos en el primer render. */
const ITEM_HEIGHT_ESTIMATE = 220;

interface QuotesMasonryProps {
  messages: FamilyQuoteMap[];
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

/**
 * Grid masonry virtualizado con `masonic` + scroll interno del contenedor.
 *
 * Mismo patrón que `ActivityCards`:
 * - `useMasonry` directo (no `<Masonry>`) para soportar scroll interno sin
 *   depender de `window.scrollY`.
 * - Medimos `scrollTop`/`width`/`height` del wrapper scrollable.
 * - `orderHash` invalida el `positioner` cuando cambia el orden/filtro.
 */
const QuotesMasonry = ({ messages, onManualToggle }: QuotesMasonryProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);

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

  // Hash estable para invalidar el positioner cuando cambia el orden/filtro.
  const orderHash = useMemo(
    () => messages.map((m) => m.id).join("|"),
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
    [orderHash],
  );

  // El render closure captura `onManualToggle` para usar siempre la versión
  // vigente del handler sin refs externas.
  const renderCard = (props: RenderComponentProps<FamilyQuoteMap>) => (
    <FamilyQuoteCard msg={props.data} onManualToggle={onManualToggle} />
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
      className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#EBE5DA] pr-1"
    >
      {rendered}
    </div>
  );
};

export default QuotesMasonry;
