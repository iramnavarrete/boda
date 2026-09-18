"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useMasonry,
  usePositioner,
  type RenderComponentProps,
} from "masonic";
import ActivityCard from "./ActivityCard";
import {
  MASONRY_GAP,
  MASONRY_COLUMN_WIDTH,
  ITEM_HEIGHT_ESTIMATE,
} from "../hooks/layoutConstants";
import type { ActivityGroup } from "../types";

interface ActivityCardsProps {
  groups: ActivityGroup[];
}

/**
 * Grid masonry virtualizado con `masonic` + scroll interno del contenedor.
 *
 * Por qué `useMasonry` directo (no `<Masonry>`):
 * - `<Masonry>` usa `window.scrollY` → no funciona si el contenedor interno
 *   scrollea independientemente.
 * - `useMasonry` acepta `scrollTop` y `height` como props → nosotros los
 *   medimos del contenedor scrollable.
 * - `MasonryScroller` también usa window scroll, descartado.
 *
 * Esto permite que **solo el contenedor del masonry scrollee** — el header
 * y el sidebar permanecen completamente fijos en la página.
 */
const ActivityCards: React.FC<ActivityCardsProps> = ({ groups }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Medimos el contenedor scrollable (no el window).
  const [scrollTop, setScrollTop] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      // clientWidth/Height = dimensiones internas del contenedor (excluye scrollbar)
      setWrapperWidth(el.clientWidth);
      setWrapperHeight(el.clientHeight);
    };

    measure();

    const handleScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", handleScroll, { passive: true });

    // ResizeObserver detecta cambios de tamaño del contenedor
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      ro.disconnect();
    };
  }, []);

  // Hash estable del orden actual de familias. Se usa como dep de
  // `usePositioner` para forzar la invalidación del cache cuando cambia
  // el orden (sort). Sin esto, masonic devuelve posiciones del orden
  // anterior y los items se superponen al reordenar.
  const orderHash = useMemo(
    () => groups.map((g) => g.familyId).join("|"),
    [groups],
  );

  // Positioner con cache interno. Recrea cuando:
  // - Cambia `width` (resize del contenedor)
  // - Cambia `orderHash` (sort/filter que reordena items)
  // Usamos fallback a window.innerWidth para evitar flash de 0 columnas
  // en el primer render antes de que el ResizeObserver se dispare.
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

  // useMasonry (no MasonryScroller) — pasamos scrollTop/height manuales.
  // `offset` solo existe en MasonryScrollerProps; useMasonry ignora el window.
  //
  // Sin `resizeObserver`: masonic mide las alturas UNA SOLA VEZ al montar
  // cada card. Si el contenido cambia después (e.g., useTimeAgo actualiza
  // el texto), las alturas cacheadas quedan obsoletas — pero el layout
  // permanece estable, sin brincos al reordenar.
  const masonryContent = useMasonry<ActivityGroup>({
    items: groups,
    positioner,
    height: wrapperHeight || 800, // fallback mientras se mide
    scrollTop,
    itemKey: (item: ActivityGroup) => item.familyId,
    itemHeightEstimate: ITEM_HEIGHT_ESTIMATE,
    overscanBy: 2,
    render: MasonryCard,
  });

  return (
    <div
      ref={wrapperRef}
      className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#EBE5DA]"
    >
      {masonryContent}
    </div>
  );
};

/**
 * Render: solo el contenido. masonic ya posiciona con absolute + top/left/width
 * a través de su wrapper interno. No aplicamos width/position aquí.
 */
function MasonryCard({ data }: RenderComponentProps<ActivityGroup>) {
  return <ActivityCard group={data} />;
}

export default ActivityCards;