"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  useMotionTemplate, // 🔥 Importamos useMotionTemplate
} from "framer-motion";
import { cn } from "@heroui/theme";
import {
  Church,
  DoorOpen,
  GlassWater,
  Utensils,
  Music,
  PartyPopper,
  Clock3,
  LucideIcon,
} from "lucide-react";

// ============================================================================
// TIPOS Y CONFIGURACIÓN POR DEFECTO
// ============================================================================

export type TimelineItem = {
  time: string;
  title: string;
  icon?: React.ElementType | React.ReactElement;
};

const defaultIconMap: Record<string, LucideIcon> = {
  ceremonia: Church,
  recepcion: DoorOpen,
  rompehielos: GlassWater,
  banquete: Utensils,
  vals: Music,
  fiesta: PartyPopper,
  fin: Clock3,
};

const defaultItinerary: TimelineItem[] = [
  {
    time: "16:00",
    title: "Ceremonia religiosa",
    icon: defaultIconMap.ceremonia,
  },
  { time: "19:45", title: "Recepción", icon: defaultIconMap.recepcion },
  { time: "20:00", title: "Rompehielos", icon: defaultIconMap.rompehielos },
  { time: "21:15", title: "Banquete", icon: defaultIconMap.banquete },
  { time: "21:45", title: "Vals", icon: defaultIconMap.vals },
  { time: "22:00", title: "Inicio de fiesta", icon: defaultIconMap.fiesta },
  { time: "02:00", title: "Fin del evento", icon: defaultIconMap.fin },
];

export type TimelineStyleConfig = {
  container?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  line?: string;
  diamond?: string;
  icon?: string;
  timeClassName?: string;
  eventTitleClassName?: string;
};

type Props = {
  items?: TimelineItem[];
  title?: string;
  subtitle?: string;
  styles?: TimelineStyleConfig;
  accentColor?: string;
};

// ============================================================================
// COMPONENTE INTERNO: Nodo del Itinerario
// ============================================================================

const EditorialTimelineItem = ({
  item,
  styles,
  accentColor,
}: {
  item: TimelineItem;
  styles?: TimelineStyleConfig;
  accentColor: string;
}) => {
  const renderIcon = () => {
    if (!item.icon) return null;
    if (React.isValidElement(item.icon)) return item.icon;
    const IconComponent = item.icon as React.ElementType;
    return (
      <IconComponent
        className={cn("w-5 h-5 sm:w-6 sm:h-6 opacity-70", styles?.icon)}
        strokeWidth={1}
        style={{ color: accentColor || "currentColor" }}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "0px 0px -50% 0px", once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="grid grid-cols-[1fr_auto_1fr] gap-4 sm:gap-8 min-h-[100px] w-full items-center relative z-10"
    >
      {/* 1. HORA (Izquierda) */}
      <div className="text-right flex flex-col justify-center">
        <span
          className={cn(
            "text-3xl sm:text-4xl font-nourdLight text-primary tracking-widest",
            styles?.timeClassName,
          )}
        >
          {item.time}
        </span>
      </div>

      {/* 2. DIAMANTE CENTRAL */}
      <div className="relative flex flex-col items-center justify-center w-8">
        <div
          className={cn("w-2.5 h-2.5 rotate-45 bg-accent", styles?.diamond)}
          style={{ backgroundColor: accentColor || "currentColor" }}
        />
      </div>

      {/* 3. ÍCONO Y TÍTULO (Derecha) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-left">
        {renderIcon()}
        <span
          className={cn(
            "text-xs sm:text-sm font-nourdMedium text-primary uppercase tracking-[0.2em] leading-tight opacity-90",
            styles?.eventTitleClassName,
          )}
        >
          {item.title}
        </span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL (EXPORTADO)
// ============================================================================

export default function EditorialTimeline({
  items = defaultItinerary,
  title = "Itinerario",
  subtitle = "Nuestro gran día",
  styles,
  accentColor = "#B64160",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lockedProgress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > lockedProgress.get()) {
      lockedProgress.set(latest);
    }
  });

  const smoothScaleY = useSpring(lockedProgress, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001,
  });

  // 🔥 MAGIA AQUÍ: Calculamos dinámicamente la altura de la línea tenue para que
  // siempre vaya 120px (aprox. la distancia de un ícono) por delante de la pintada.
  const leadHeight = useMotionTemplate`calc(${smoothScaleY} * 100% + 120px)`;

  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto px-5 py-16 sm:py-24 relative z-10 text-primary",
        styles?.container,
      )}
    >
      <div className="flex flex-col items-center text-center mb-16 sm:mb-24">
        <p
          className={cn(
            "text-[9px] font-nourdMedium text-current opacity-60 uppercase tracking-[0.4em] mb-3",
            styles?.sectionSubtitle,
          )}
        >
          {subtitle}
        </p>
        <h2
          className={cn(
            "text-5xl sm:text-6xl font-newIconScript text-current drop-shadow-[1px_1px_1px_rgba(0,0,0,0.03)]",
            styles?.sectionTitle,
          )}
        >
          {title}
        </h2>
      </div>

      <div ref={containerRef} className="relative w-full py-8">
        {/* 🔥 LÍNEA DE FONDO (TENUE): Va por delante explorando el camino */}
        <motion.div
          className={cn(
            "absolute left-1/2 top-0 w-[1px] -translate-x-1/2 opacity-30 origin-top",
            styles?.line,
          )}
          style={{
            backgroundColor: accentColor || "currentColor",
            height: leadHeight,
            maxHeight: "100%", // Evita que se salga del contenedor principal
          }}
        />

        {/* LÍNEA ANIMADA (PINTADA): Va detrás, conectando los diamantes */}
        <motion.div
          className={cn(
            "absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 origin-top",
            styles?.line,
          )}
          style={{
            backgroundColor: accentColor || "currentColor",
            scaleY: smoothScaleY,
          }}
        />

        <div className="flex flex-col gap-6 sm:gap-8">
          {items.map((item, index) => (
            <EditorialTimelineItem
              key={`${item.time}-${index}`}
              item={item}
              styles={styles}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
