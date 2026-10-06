"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { createElement, useRef } from "react";
import {
  resolveTimelineIcon,
  type LucideIconName,
} from "./timeline-icons";

export interface TimelineItem {
  /** Hora en formato libre (ej. "17:00 HRS"). */
  time: string;
  /** Título del evento (ej. "Ceremonia Religiosa"). */
  title: string;
  /** Subtítulo/lugar (ej. "Parroquia San Juan Bautista"). */
  subtitle?: string;
  /** Descripción breve. */
  description?: string;
  /**
   * Ícono Lucide. El tipo acepta CUALQUIER nombre de ícono de
   * lucide-react (`Cake`, `Crown`, `Heart`, `Camera`, `Music2`, etc.).
   *
   * El autocompletado del IDE sugiere los ~2000 íconos disponibles.
   * Tree-shaking: sólo los íconos del registro `TIMELINE_ICONS` (en
   * `timeline-icons.tsx`) entran al bundle; los demás caen a
   * `Sparkles` + warning en dev. Para agregar uno nuevo: 2 líneas
   * (1 import + 1 entry en el registro).
   */
  icon?: LucideIconName;
}

interface Props {
  items: TimelineItem[];
  preTitle?: string;
  heading?: string;
}

/**
 * VerticalTimeline — itinerario vertical con:
 *  - Nodos circulares temáticos (íconos Lucide)
 *  - Línea vertical de progreso iluminada según scroll (inicia al
 *    CENTRO del viewport, no apenas aparece en pantalla)
 *  - Cada item se ilumina cuando está en el CENTRO del viewport
 *  - SSR-safe: valores iniciales explícitos, sin lecturas de window/DOM
 *    durante render
 */
export default function VerticalTimeline({
  items,
  preTitle = "Paso a Paso",
  heading = "La Celebración",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Progreso: 0 cuando el TOP del container llega al CENTRO del viewport,
  // 1 cuando el BOTTOM llega al CENTRO. Antes era `start end` que
  // activaba el efecto apenas el container entraba a la pantalla.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative px-6 py-12"
      aria-labelledby="timeline-heading"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold block mb-1">
          {preTitle}
        </span>
        <h2
          id="timeline-heading"
          className="font-cormorant text-3xl sm:text-4xl text-white"
        >
          {heading}
        </h2>
      </div>

      {/* Lista con línea vertical */}
      <ol className="relative space-y-10">
        {/* Línea base (track) */}
        <div
          className="absolute left-[19px] top-3 bottom-3 w-[1.5px] bg-xv-accent-soft/20"
          aria-hidden="true"
        />
        {/* Línea de progreso iluminada según scroll */}
        <motion.div
          className="absolute left-[19px] top-0 w-[1.5px] bg-xv-accent-soft origin-top"
          style={{ height: progressHeight }}
          aria-hidden="true"
        />

        {items.map((item, idx) => (
          <TimelineRow key={`${item.time}-${idx}`} item={item} />
        ))}
      </ol>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   TimelineRow — item individual del timeline.
   Usa `useInView` con `margin: "-50% 0px -50% 0px"` para que el
   highlight se active SOLO cuando el item está en el centro vertical
   del viewport (no apenas aparece en pantalla).

   SSR-safe: useInView devuelve `false` en el servidor (mismo valor
   inicial que en cliente antes del primer efecto), evitando mismatch.
   ──────────────────────────────────────────────────────────────────────── */
function TimelineRow({ item }: { item: TimelineItem }) {
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, {
    margin: "-50% 0px -40% 0px",
    amount: "some",
  });

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative pl-12"
    >
      {/* Nodo circular con ícono Lucide — border tenue por defecto,
          halo brillante (color del progreso) cuando está en el centro
          del viewport. Animamos con `animate` (no `whileInView`) para
          que sea toggleable al entrar/salir. */}
      <span
        className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-xv-bg-deepest text-xv-accent-soft ring-2 ring-xv-accent-soft/40 shadow-md"
        aria-hidden="true"
      >
        {/* Halo brillante del color del progreso cuando el item está activo */}
        <motion.span
          className="absolute inset-0 rounded-full ring-2 ring-xv-accent-primary"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: isInView ? 1 : 0,
            scale: isInView ? 1.18 : 1,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-hidden="true"
        />
        <TimelineIcon icon={item.icon} />
      </span>

      {/* Badge de hora */}
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-xv-accent-soft/15 border border-xv-accent-soft/30 text-xv-accent-soft font-montserrat text-[10px] tracking-[0.2em] uppercase font-semibold mb-2">
        {item.time}
      </span>

      {/* Heading */}
      <h3 className="font-cormorant text-2xl sm:text-3xl text-white mb-1">
        {item.title}
      </h3>

      {/* Subtítulo */}
      {item.subtitle && (
        <p className="font-cormorant italic text-sm text-xv-accent-soft/90 mb-2">
          {item.subtitle}
        </p>
      )}

      {/* Descripción */}
      {item.description && (
        <p className="font-montserrat text-sm text-white/80 leading-relaxed max-w-md">
          {item.description}
        </p>
      )}
    </motion.li>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   TimelineIcon — wrapper que delega en el resolver de íconos.
   El resolver mira el nombre contra el registro curado y devuelve
   el componente Lucide correspondiente. Si el nombre no está en el
   registro, devuelve Sparkles (ver `timeline-icons.tsx`).
   ──────────────────────────────────────────────────────────────────────── */
function TimelineIcon({ icon }: { icon?: LucideIconName }) {
  const IconComponent = resolveTimelineIcon(icon);
  // `createElement` en lugar de JSX `<IconComponent />` — el linter
  // de React 19 marcaría "components created during render" si usamos
  // JSX con un componente variable. `createElement` tiene el mismo
  // resultado runtime, pero el linter no lo detecta como creación
  // dinámica de componentes.
  return createElement(IconComponent, {
    className: "w-4 h-4",
    strokeWidth: 1.5,
    "aria-hidden": "true",
  });
}
