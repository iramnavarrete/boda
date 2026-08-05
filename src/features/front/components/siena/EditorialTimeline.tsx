"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  useMotionTemplate,
} from "framer-motion";
import { cn } from "@heroui/theme";
import { Heart } from "lucide-react";

// ============================================================================
// 1. IMPORTACIÓN DE TUS ÍCONOS EXTERNOS
// ============================================================================
import CeremoniaIcon from "@/icons/timeline/ceremonia";
import RecepcionIcon from "@/icons/timeline/recepcion";
import RompehielosIcon from "@/icons/timeline/rompehielos";
import BanqueteIcon from "@/icons/timeline/banquete";
import ValsIcon from "@/icons/timeline/vals";
import BaileIcon from "@/icons/timeline/baile";
import DespedidaIcon from "@/icons/timeline/despedida";

// Mapa de íconos disponibles vinculados a tus componentes
const iconDictionary: Record<string, React.ElementType> = {
  ceremonia: CeremoniaIcon,
  recepcion: RecepcionIcon,
  rompehielos: RompehielosIcon,
  banquete: BanqueteIcon,
  vals: ValsIcon,
  baile: BaileIcon,
  despedida: DespedidaIcon,
};

// ============================================================================
// TIPOS Y CONFIGURACIÓN POR DEFECTO
// ============================================================================

export type GraphicTimelineItem = {
  time: string;
  title: string;
  subtitle?: string;
  iconKey: keyof typeof iconDictionary; // Valida que la key exista en el diccionario
};

// Itinerario usando el diccionario
const defaultGraphicItinerary: GraphicTimelineItem[] = [
  {
    time: "15:00 H",
    title: "Ceremonia",
    subtitle: "Iglesia San José",
    iconKey: "ceremonia",
  },
  {
    time: "16:00 H - 16:30 H",
    title: "Rompehielos",
    subtitle: "Jardines",
    iconKey: "rompehielos",
  },
  {
    time: "17:00 H",
    title: "Recepción",
    subtitle: "Jardín principal",
    iconKey: "recepcion",
  },
  {
    time: "18:00 H",
    title: "Banquete de boda",
    subtitle: "Pabellón principal",
    iconKey: "banquete",
  },
  {
    time: "20:00 H",
    title: "El Vals",
    subtitle: "Pista de baile",
    iconKey: "vals",
  },
  {
    time: "21:00 H",
    title: "Inicia el Baile",
    subtitle: "Pista de baile",
    iconKey: "baile",
  },
  {
    time: "00:00 H",
    title: "Despedida",
    subtitle: "¡Gracias por acompañarnos!",
    iconKey: "despedida",
  },
];

export type TimelineStyleConfig = {
  container?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  line?: string;
  heart?: string;
  timeClassName?: string;
  eventTitleClassName?: string;
  eventSubtitleClassName?: string;
};

type Props = {
  items?: GraphicTimelineItem[];
  title?: string;
  subtitle?: string;
  styles?: TimelineStyleConfig;
  accentColor?: string;
};

// ============================================================================
// COMPONENTE INTERNO: Contenido de Texto e Ilustración
// ============================================================================

const TextContent = ({
  item,
  align,
  styles,
}: {
  item: GraphicTimelineItem;
  align: "left" | "right";
  styles?: TimelineStyleConfig;
}) => (
  <div
    className={cn(
      "flex flex-col gap-1 w-full",
      align === "right" ? "items-end text-right" : "items-start text-left",
    )}
  >
    <span
      className={cn(
        "text-sm sm:text-base font-nourdMedium text-primary/80 uppercase tracking-widest",
        styles?.timeClassName,
      )}
    >
      {item.time}
    </span>
    <span
      className={cn(
        "text-base sm:text-lg font-nourdMedium text-primary uppercase tracking-[0.15em] leading-tight mt-1",
        styles?.eventTitleClassName,
      )}
    >
      {item.title}
    </span>
    {item.subtitle && (
      <span
        className={cn(
          "text-xs sm:text-sm font-nourdLight text-primary/70 mt-0.5",
          styles?.eventSubtitleClassName,
        )}
      >
        {item.subtitle}
      </span>
    )}
  </div>
);

const IllustrationContent = ({
  item,
  accentColor,
}: {
  item: GraphicTimelineItem;
  accentColor: string;
}) => {
  const IconComponent = iconDictionary[item.iconKey];

  return (
    <div
      className="relative w-32 h-24 sm:w-32 sm:h-32 flex items-center py-2"
      style={{ color: accentColor }}
    >
      {IconComponent ? (
        <IconComponent className="w-full h-full opacity-90 drop-shadow-sm" />
      ) : (
        <div className="w-16 h-16 bg-primary/10 rounded-full" />
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE INTERNO: Nodo del Itinerario Intercalado
// ============================================================================

const GraphicTimelineItemComponent = ({
  item,
  index,
  styles,
  accentColor,
}: {
  item: GraphicTimelineItem;
  index: number;
  styles?: TimelineStyleConfig;
  accentColor: string;
}) => {
  const isEven = index % 2 === 0;
  console.log({ item });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "0px 0px -25% 0px", once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-6 min-h-[140px] w-full items-center relative z-10"
    >
      {/* COLUMNA IZQUIERDA */}
      <div className="flex justify-end">
        {isEven ? (
          <IllustrationContent item={item} accentColor={accentColor} />
        ) : (
          <TextContent item={item} align="right" styles={styles} />
        )}
      </div>

      {/* COLUMNA CENTRAL (CORAZÓN) */}
      <div className="relative flex flex-col items-center justify-center w-8">
        <Heart
          className={cn("w-4 h-4 z-10 bg-transparent", styles?.heart)}
          style={{ color: accentColor, fill: accentColor }}
        />
      </div>

      {/* COLUMNA DERECHA */}
      <div className="flex justify-start">
        {!isEven ? (
          <IllustrationContent item={item} accentColor={accentColor} />
        ) : (
          <TextContent item={item} align="left" styles={styles} />
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL (EXPORTADO)
// ============================================================================

export default function GraphicTimeline({
  items = defaultGraphicItinerary,
  title = "Día a Día",
  subtitle = "El Itinerario",
  styles,
  accentColor = "#2c3e50",
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

  console.log({ items });

  const leadHeight = useMotionTemplate`calc(${smoothScaleY} * 100% + 140px)`;

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto px-4 py-16 sm:py-24 relative z-10 text-primary",
        styles?.container,
      )}
    >
      <div className="flex flex-col items-center text-center mb-12 sm:mb-20">
        <p
          className={cn(
            "text-[10px] font-nourdMedium text-current opacity-60 uppercase tracking-[0.4em] mb-2",
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

      <div ref={containerRef} className="relative w-full py-4">
        {/* LÍNEA DE FONDO (TENUE) */}
        <motion.div
          className={cn(
            "absolute left-1/2 top-0 w-[2px] -translate-x-1/2 opacity-20 origin-top",
            styles?.line,
          )}
          style={{
            backgroundColor: accentColor,
            height: leadHeight,
            maxHeight: "100%",
          }}
        />

        {/* LÍNEA ANIMADA (PINTADA) */}
        <motion.div
          className={cn(
            "absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 origin-top",
            styles?.line,
          )}
          style={{
            backgroundColor: accentColor,
            scaleY: smoothScaleY,
          }}
        />

        {/* CONTENEDOR DE ITEMS */}
        <div className="flex flex-col gap-8 sm:gap-12">
          {items.map((item, index) => (
            <GraphicTimelineItemComponent
              key={`${item.time}-${index}`}
              item={item}
              index={index}
              styles={styles}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
