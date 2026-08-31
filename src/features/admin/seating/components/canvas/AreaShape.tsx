import React from "react";
import {
  Toilet,
  ChefHat,
  QrCode,
  Camera,
  Sofa,
  Waves,
  Leaf,
  Trees,
  Cigarette,
  BoxSelect,
  DoorOpen,
  Cake,
  Gift,
  Wine,
  UtensilsCrossed,
  Candy,
  Music,
  MonitorUp,
  MonitorPlay,
  ChessQueen,
  ChessKing,
} from "lucide-react";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { ElementType, TextPosition } from "@/types/seating";

interface AreaShapeProps {
  type: ElementType;
  width: number;
  height: number;
  alias?: string;
  textPosition?: TextPosition;
  /**
   * Handlers de drag de dnd-kit. Se usan en `zone_shape` para que
   * solo el texto y el borde sean draggables (el centro queda libre
   * para arrastrar elementos que estén dentro de la zona).
   */
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
}

/**
 * Renderiza la forma de las ÁREAS, SERVICIOS, MOBILIARIO y ESPACIOS.
 *
 * Reglas de presentación:
 *  - Todos los elementos no-mesa, no-utilidad: BORDE PUNTEADO
 *    (border: 2px dashed) alrededor del rectángulo
 *  - Si el elemento es muy pequeño (eje < 50px): solo el icono
 *  - Forma/Zona: solo borde punteado, fondo transparente
 *  - Pista de baile / escenario: mismo borde punteado que el resto
 */
export function AreaShape({
  type,
  width,
  height,
  alias,
  textPosition = "top-left",
  dragAttributes,
  dragListeners,
}: AreaShapeProps) {
  if (type === "text_label") {
    return (
      <div className="area-shape w-full h-full relative flex items-center justify-center pointer-events-none">
        <span
          className="font-serif text-[1rem] text-[#2C2C29] text-center px-2 truncate"
          style={{ maxWidth: width - 8 }}
        >
          {alias || "Texto"}
        </span>
      </div>
    );
  }

  if (type === "line_divider") {
    return (
      <div className="area-shape w-full h-full relative flex items-center justify-center pointer-events-none">
        <div
          className="w-full"
          style={{
            borderTop: "2px solid #C5A669",
            borderRadius: "9999px",
            opacity: 0.85,
          }}
        />
        {alias && width > 80 && (
          <span className="absolute left-1/2 -translate-x-1/2 px-1.5 bg-[#F9F7F2] text-[9px] uppercase font-bold tracking-widest text-[#8B7340]">
            {alias}
          </span>
        )}
      </div>
    );
  }

  if (type === "zone_shape") {
    // Forma/Zona: solo borde punteado, fondo transparente.
    // El texto se ancla a una de las 4 esquinas según `textPosition`.
    //
    // Importante: el CENTRO de la zona NO captura pointer events, para
    // que las mesas u otros elementos que estén dentro se puedan
    // arrastrar con normalidad. Solo el BORDE y el TEXTO son
    // draggables (reciben los handlers de dnd-kit).
    const cornerClasses: Record<TextPosition, string> = {
      "top-left": "top-1.5 left-2 items-start text-left",
      "top-right": "top-1.5 right-2 items-end text-right",
      "bottom-left": "bottom-1.5 left-2 items-start text-left",
      "bottom-right": "bottom-1.5 right-2 items-end text-right",
    };

    // Clases base para los 4 strips del borde (8px de grosor).
    // Usamos background transparente: solo nos importa capturar
    // pointer events, no se ven visualmente.
    const borderStripBase =
      "absolute cursor-grab active:cursor-grabbing pointer-events-auto";

    return (
      <div
        className="area-shape w-full h-full relative pointer-events-none"
        style={{
          backgroundColor: "transparent",
          border: "2px dashed #C5A669",
          borderRadius: "0.75rem",
        }}
      >
        {/* 4 strips invisibles que capturan drag SOLO en el borde */}
        <div
          className={`${borderStripBase} top-0 left-0 right-0 h-2`}
          style={{ background: "transparent" }}
          {...(dragListeners ?? {})}
        />
        <div
          className={`${borderStripBase} bottom-0 left-0 right-0 h-2`}
          style={{ background: "transparent" }}
          {...(dragListeners ?? {})}
        />
        <div
          className={`${borderStripBase} top-0 bottom-0 left-0 w-2`}
          style={{ background: "transparent" }}
          {...(dragListeners ?? {})}
        />
        <div
          className={`${borderStripBase} top-0 bottom-0 right-0 w-2`}
          style={{ background: "transparent" }}
          {...(dragListeners ?? {})}
        />

        {alias && (
          <span
            className={`absolute flex flex-col max-w-[calc(100%-16px)] font-serif text-[1rem] text-[#5A5A5A] cursor-grab active:cursor-grabbing pointer-events-auto ${cornerClasses[textPosition]}`}
            {...(dragAttributes ?? {})}
            {...(dragListeners ?? {})}
          >
            {alias}
          </span>
        )}
      </div>
    );
  }

  const { Icon, color, bg, border } = getAreaStyle(type);
  const isVerySmall = width < 50 || height < 50;

  if (isVerySmall) {
    return (
      <div className="area-shape w-full h-full relative flex items-center justify-center pointer-events-none">
        <Icon
          size={Math.min(width, height) * 0.6}
          color={color}
          strokeWidth={2.5}
        />
      </div>
    );
  }

  return (
    <div
      className="area-shape w-full h-full relative flex items-center justify-center"
      style={{
        backgroundColor: bg,
        border: `2px dashed ${border}`,
        borderRadius: "0.75rem",
      }}
    >
      {/* Icono en la esquina superior izquierda */}
      <div
        className="absolute top-2 left-2 pointer-events-none"
        style={{ color }}
      >
        <Icon size={20} strokeWidth={2} fill={color} fillOpacity={0.15} />
      </div>
      {/* Solo el alias (sin subtítulo duplicado) */}
      <div className="text-center px-4 w-full">
        {alias && (
          <span
            className="block font-serif truncate w-full"
            style={{ color: darken(color) }}
          >
            {alias}
          </span>
        )}
      </div>
    </div>
  );
}

interface AreaStyle {
  Icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

function getAreaStyle(type: ElementType): AreaStyle {
  switch (type) {
    // Servicios
    case "bathroom":
      return { Icon: Toilet, color: "#3B82F6", bg: "#DBEAFE", border: "#60A5FA" };
    case "kitchen":
      return { Icon: ChefHat, color: "#EA580C", bg: "#FFEDD5", border: "#FB923C" };
    case "emergency_exit":
      return { Icon: DoorOpen, color: "#DC2626", bg: "#FEE2E2", border: "#F87171" };
    case "check_in":
      return { Icon: QrCode, color: "#0891B2", bg: "#CFFAFE", border: "#22D3EE" };

    // Espacios (ex-Mobiliario)
    case "photo_booth":
      return { Icon: Camera, color: "#DB2777", bg: "#FCE7F3", border: "#F472B6" };
    case "lounge":
      return { Icon: Sofa, color: "#7C3AED", bg: "#F5F3FF", border: "#A78BFA" };
    case "fountain":
      return { Icon: Waves, color: "#0284C7", bg: "#E0F2FE", border: "#38BDF8" };
    case "plant":
      return { Icon: Leaf, color: "#16A34A", bg: "#DCFCE7", border: "#4ADE80" };

    // Áreas existentes — todas con borde punteado (igual que el resto)
    case "dance_floor":
      return { Icon: Music, color: "#4F46E5", bg: "#E0E7FF", border: "#818CF8" };
    case "stage":
      return { Icon: MonitorUp, color: "#E11D48", bg: "#FFE4E6", border: "#FB7185" };
    case "dj_booth":
      return { Icon: MonitorPlay, color: "#0284C7", bg: "#E0F2FE", border: "#38BDF8" };
    case "cake_area":
      return { Icon: Cake, color: "#E11D48", bg: "#FFE4E6", border: "#FB7185" };
    case "gift_table":
      return { Icon: Gift, color: "#7C3AED", bg: "#EDE9FE", border: "#A78BFA" };
    case "drink_bar":
      return { Icon: Wine, color: "#7C2D12", bg: "#FED7AA", border: "#FB923C" };
    case "buffet":
      return { Icon: UtensilsCrossed, color: "#16A34A", bg: "#DCFCE7", border: "#4ADE80" };
    case "candy_bar":
      return { Icon: Candy, color: "#DB2777", bg: "#FCE7F3", border: "#F472B6" };

    // Espacios especiales
    case "garden_entrance":
      return { Icon: Trees, color: "#15803D", bg: "#DCFCE7", border: "#4ADE80" };
    case "bride_room":
      return { Icon: ChessQueen, color: "#BE185D", bg: "#FCE7F3", border: "#F472B6" };
    case "groom_room":
      return { Icon: ChessKing, color: "#92400E", bg: "#FEF3C7", border: "#C5A669" };
    case "smoking_area":
      return { Icon: Cigarette, color: "#52525B", bg: "#F4F4F5", border: "#A1A1AA" };

    default:
      return { Icon: BoxSelect, color: "#5A5A5A", bg: "#F9F7F2", border: "#C5A669" };
  }
}

function darken(hex: string, amount = 0.2): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const factor = 1 - amount;
  const dr = Math.max(0, Math.round(r * factor));
  const dg = Math.max(0, Math.round(g * factor));
  const db = Math.max(0, Math.round(b * factor));
  return `rgb(${dr}, ${dg}, ${db})`;
}
