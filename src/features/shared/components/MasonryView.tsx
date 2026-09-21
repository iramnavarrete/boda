"use client";

import { motion } from "framer-motion";
import { useMasonryView, type MasonryViewOptions, EXIT_DURATION_MS } from "../hooks/useMasonryView";

/**
 * Componente presentacional que renderiza un masonry animado completo.
 * Usa `useMasonryView` internamente y aplica:
 * - Wrapper scrollable con `opacity-0` hasta el primer settle (enmascara
 *   el frame inicial con estimaciones).
 * - Capa de overlays fading-out para ítems que salen.
 *
 * El consumer provee:
 * - `items`, `itemKey`, `getLayoutHash`, `itemHeightEstimate`
 * - `renderItem`: cómo se ve cada card dentro del masonry (debe bindear
 *   `captureRef` al elemento raíz del card).
 * - `renderExitItem`: cómo se ve cada card en el overlay de salida.
 * - `className`: clase extra para el wrapper (opcional).
 */
export interface MasonryViewProps<T> extends MasonryViewOptions<T> {
  /** Clase extra aplicada al wrapper scrollable. */
  className?: string;
}

const MasonryView = <T,>({
  className,
  ...options
}: MasonryViewProps<T>) => {
  const { renderExitItem } = options;
  const { wrapperRef, rendered, exitingOverlays, hasMeasured } =
    useMasonryView(options);

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#EBE5DA] transition-opacity duration-150 ${hasMeasured ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
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
          {renderExitItem({ item })}
        </motion.div>
      ))}
    </div>
  );
};

export default MasonryView;
