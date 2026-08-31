"use client";

import { useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  Circle,
  Square,
  RectangleHorizontal,
  Disc,
  Music,
  MonitorPlay,
  Cake,
  Gift,
  Wine,
  UtensilsCrossed,
  Candy,
  MonitorUp,
  X,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  // Iconos para nuevos elementos
  DoorOpen,
  Minus as MinusIcon,
  ChefHat,
  Camera,
  Sofa,
  Leaf,
  Trees,
  Crown,
  Cigarette,
  Type as TypeIcon,
  BoxSelect,
  Heart,
  Wrench,
  type LucideIcon,
  Landmark,
  BrickWall,
  Grid2X2,
  RectangleVertical,
  ArrowUpNarrowWide,
  Toilet,
  QrCode,
  HandPlatter,
  Waves,
  ChessQueen,
  ChessKing,
} from "lucide-react";
import { PaletteItemType } from "@/types/seating";
import { useSeatingStore } from "../../stores/useSeatingStore";

/**
 * Icono representativo para cada categoría. Se usa en el header de la
 * sección para identificar visualmente el bloque sin tener que leer el
 * texto. Si se añade una categoría nueva, basta con mapearla aquí.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Mesas: Circle,
  Estructural: Landmark,
  Servicios: HandPlatter,
  Mobiliario: Sofa,
  Espacios: LayoutGrid,
  Utilidades: Wrench,
};

/**
 * Paleta de elementos del seating planner, organizada en 5 categorías.
 */
const ELEMENTS: { category: string; items: PaletteItemType[] }[] = [
  {
    category: "Mesas",
    items: [
      {
        type: "round_table",
        label: "Mesa Redonda",
        seats: 8,
        width: 140,
        height: 140,
        icon: Circle,
      },
      {
        type: "rectangular_table",
        label: "Rectangular",
        seats: 10,
        width: 220,
        height: 100,
        icon: RectangleHorizontal,
      },
      {
        type: "square_table",
        label: "Cuadrada",
        seats: 4,
        width: 100,
        height: 100,
        icon: Square,
      },
      {
        type: "half_moon_table",
        label: "Media Luna",
        seats: 5,
        width: 160,
        height: 80,
        icon: Disc,
      },
      {
        type: "head_table",
        label: "Principal",
        seats: 12,
        width: 280,
        height: 80,
        icon: RectangleHorizontal,
      },
      {
        type: "cocktail_table",
        label: "Coctelera",
        seats: 4,
        width: 80,
        height: 80,
        icon: Circle,
      },
      {
        type: "sweethearts_table",
        label: "Mesa de Novios",
        seats: 0,
        width: 220,
        height: 100,
        icon: ChessQueen,
      },
      {
        type: "lounge_table",
        label: "Lounge",
        seats: 8,
        width: 420,
        height: 320,
        icon: Sofa,
      },
    ],
  },
  {
    category: "Estructural",
    items: [
      {
        type: "wall",
        label: "Pared / Muro",
        seats: 0,
        width: 240,
        height: 24,
        icon: BrickWall,
      },
      {
        type: "door",
        label: "Puerta",
        seats: 0,
        width: 80,
        height: 24,
        icon: DoorOpen,
      },
      {
        type: "window",
        label: "Ventana",
        seats: 0,
        width: 80,
        height: 24,
        icon: Grid2X2,
      },
      {
        type: "column",
        label: "Columna",
        seats: 0,
        width: 50,
        height: 50,
        icon: RectangleVertical,
      },
      {
        type: "stairs",
        label: "Escaleras",
        seats: 0,
        width: 120,
        height: 100,
        icon: ArrowUpNarrowWide,
      },
      {
        type: "emergency_exit",
        label: "Salida Emergencia",
        seats: 0,
        width: 100,
        height: 60,
        icon: DoorOpen,
      },
    ],
  },
  {
    category: "Servicios",
    items: [
      {
        type: "bathroom",
        label: "Baños",
        seats: 0,
        width: 140,
        height: 100,
        icon: Toilet,
      },
      {
        type: "photo_booth",
        label: "Cabina de fotos",
        seats: 0,
        width: 140,
        height: 140,
        icon: Camera,
      },
      {
        type: "drink_bar",
        label: "Barra Bebidas",
        seats: 0,
        width: 180,
        height: 80,
        icon: Wine,
      },
      {
        type: "buffet",
        label: "Buffet",
        seats: 0,
        width: 240,
        height: 80,
        icon: UtensilsCrossed,
      },
      {
        type: "candy_bar",
        label: "Candy Bar",
        seats: 0,
        width: 180,
        height: 80,
        icon: Candy,
      },
      {
        type: "kitchen",
        label: "Cocina",
        seats: 0,
        width: 180,
        height: 100,
        icon: ChefHat,
      },
      {
        type: "check_in",
        label: "Check-in",
        seats: 0,
        width: 140,
        height: 80,
        icon: QrCode,
      },
    ],
  },
  {
    category: "Espacios",
    items: [
      // ── Áreas de estar (ex-Mobiliario) ──
      {
        type: "lounge",
        label: "Lounge",
        seats: 0,
        width: 240,
        height: 160,
        icon: Sofa,
      },
      // ── Escenario y表演 ──
      {
        type: "dance_floor",
        label: "Pista de Baile",
        seats: 0,
        width: 300,
        height: 300,
        icon: Music,
      },
      {
        type: "stage",
        label: "Escenario",
        seats: 0,
        width: 400,
        height: 150,
        icon: MonitorUp,
      },
      {
        type: "dj_booth",
        label: "Cabina DJ",
        seats: 0,
        width: 120,
        height: 80,
        icon: MonitorPlay,
      },
      {
        type: "cake_area",
        label: "Área Pastel",
        seats: 0,
        width: 100,
        height: 100,
        icon: Cake,
      },
      {
        type: "gift_table",
        label: "Mesa Regalos",
        seats: 0,
        width: 140,
        height: 70,
        icon: Gift,
      },
      // ── Accesos y habitaciones ──
      {
        type: "garden_entrance",
        label: "Jardín / Entrada",
        seats: 0,
        width: 240,
        height: 180,
        icon: Trees,
      },
      {
        type: "bride_room",
        label: "Cuarto de Novia",
        seats: 0,
        width: 140,
        height: 100,
        icon: ChessQueen,
      },
      {
        type: "groom_room",
        label: "Cuarto de Novio",
        seats: 0,
        width: 140,
        height: 100,
        icon: ChessKing,
      },
      {
        type: "smoking_area",
        label: "Zona Fumadores",
        seats: 0,
        width: 120,
        height: 120,
        icon: Cigarette,
      },
      // ── Decoración (ex-Mobiliario) ──
      {
        type: "fountain",
        label: "Fuente",
        seats: 0,
        width: 120,
        height: 120,
        icon: Waves,
      },
      {
        type: "plant",
        label: "Planta",
        seats: 0,
        width: 60,
        height: 60,
        icon: Leaf,
      },
    ],
  },
  {
    category: "Utilidades",
    items: [
      {
        type: "text_label",
        label: "Texto",
        seats: 0,
        width: 160,
        height: 40,
        icon: TypeIcon,
      },
      {
        type: "line_divider",
        label: "Línea / Divisor",
        seats: 0,
        width: 200,
        height: 16,
        icon: MinusIcon,
      },
      {
        type: "zone_shape",
        label: "Forma / Zona",
        seats: 0,
        width: 200,
        height: 140,
        icon: BoxSelect,
      },
    ],
  },
];

export function DraggablePaletteItem({ item }: { item: PaletteItemType }) {
  const isLayout = item.type === "custom_layout";

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: isLayout ? `palette-layout-builder` : `palette-${item.type}`,
    data: {
      type: isLayout ? "palette_layout" : "palette_element",
      elementType: item.type,
      width: item.width,
      height: item.height,
      seats: item.seats,
      label: item.label,
    },
  });

  // ─────────────────────────────────────────────────────────
  // HERRAMIENTA ESPECIAL: "Diseñador de Salón"
  // Fila plana con un acento dorado sutil a la izquierda
  // (barra vertical) en lugar de una card. Se diferencia del
  // resto sólo por el color del texto secundario.
  // ─────────────────────────────────────────────────────────
  if (isLayout) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`group/item flex items-center gap-4 mb-1 py-2 mx-3 px-4 bg-[#fffdf9] border-dashed border rounded-lg cursor-grab active:cursor-grabbing transition-colors border-gold ${
          isDragging ? "opacity-40" : "hover:border-gold-400 bg-white"
        }`}
        style={{ touchAction: "none" }}
      >
        <item.icon
          className="w-3.5 h-3.5 text-[#C5A669] shrink-0"
          strokeWidth={1.75}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[12px] font-semibold text-[#1F1F1F] truncate leading-tight">
            {item.label}
          </span>
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#C5A669] mt-0.5">
            Generador Inteligente
          </span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // ELEMENTO NORMAL — fila totalmente plana, sin card.
  // Solo icono + nombre + texto secundario discreto.
  // ─────────────────────────────────────────────────────────
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`group/item flex items-center gap-4 mb-1 py-2 mx-3 px-4 bg-[#fffdf9] border rounded-lg cursor-grab active:cursor-grabbing transition-colors ${
        isDragging ? "opacity-40" : "hover:border-gold-400 bg-white"
      }`}
      style={{ touchAction: "none" }}
    >
      <item.icon
        className="w-5 h-5 text-[#7A7A75] group-hover/item:text-gold shrink-0 transition-colors"
        strokeWidth={1.5}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[12px] text-[#1F1F1F] font-medium truncate leading-tight">
          {item.label}
        </span>
        <span
          className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 ${
            item.seats > 0 ? "text-[#9A9A95]" : "text-[#C5A669]"
          }`}
        >
          {item.seats > 0 ? `${item.seats} personas` : "Arrastra al plano"}
        </span>
      </div>
    </div>
  );
}

export default function ElementsPalette({ onClose }: { onClose?: () => void }) {
  // Estado inicial: solo "Mesas" abierta. El resto colapsado.
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({
    Estructural: true,
    Servicios: true,
    Mobiliario: true,
    Espacios: true,
    Utilidades: true,
  });

  const elements = useSeatingStore((state) => state.elements);
  const elementCount = elements.length;

  const { setNodeRef } = useDroppable({
    id: "palette-area",
    data: { type: "sidebar" },
  });

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div
      ref={setNodeRef}
      className="relative flex flex-col h-full w-full bg-white"
      style={{ minWidth: "15rem" }}
    >
      {/* ─────────────────────────────────────────────────────────────
          HEADER — minimal, sin card
          Título serif grande como ancla visual, contador discreto y
          subtítulo gris con la instrucción. El cierre queda en la
          esquina superior derecha.
          ───────────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 px-5 pt-5 pb-4 bg-white border-b-2 border-stone-100">
        <div className="flex items-baseline gap-2 mb-1 pr-7">
          <h2 className="font-serif text- font-bold text-[#1F1F1F] leading-none tracking-tight">
            Elementos
          </h2>
          <span className="text-[10px] font-bold text-gold bg-white border border-gold-300 border-opacity-70 px-1.5 py-[2px] rounded">
            {elementCount}
          </span>
        </div>
        <p className="text-[12px] text-[#9A9A95] leading-snug">
          Arrastra elementos al plano
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-3 p-1 rounded text-[#9A9A95] hover:text-[#1F1F1F] hover:bg-[#F5F5F3] transition-colors"
            aria-label="Cerrar panel"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CUERPO — jerarquía por tipografía y espacio
          Sin gradientes, sin cards, sin bordes entre secciones. La
          separación se logra con padding y tipografía.
          ───────────────────────────────────────────────────────────── */}
      <div className="pt-1 pb-3 overflow-y-auto w-full flex-1">
        {/* ── Plantillas ────────────────────────────────────────────── */}
        <div className="mb-3 px-3 mt-1">
          <div className="flex items-center gap-1.5 px-2 py-3 text-[10px] font-bold text-[#6B6B65] uppercase tracking-wider">
            <Sparkles
              className="w-3 h-3 text-[#C5A669] shrink-0"
              strokeWidth={2}
            />
            <span className="flex-1">Plantillas</span>
            <span className="text-[10px] font-bold text-gold bg-white border border-gold-300 border-opacity-70 px-2 py-[2px] rounded">
              1
            </span>
          </div>
          <DraggablePaletteItem
            item={{
              type: "custom_layout",
              label: "Diseñador de Salón",
              seats: 0,
              width: 0,
              height: 0,
              icon: Sparkles,
            }}
          />
        </div>

        {/* ── Categorías de elementos ──────────────────────────────── */}
        {ELEMENTS.map((group) => {
          const isCollapsed = collapsedCategories[group.category];
          const CategoryIcon = CATEGORY_ICONS[group.category];
          return (
            <div
              key={group.category}
              className="py-1.5 last:mb-0 px-3 border-t-2 border-stone-100"
            >
              <button
                onClick={() => toggleCategory(group.category)}
                className="flex items-center gap-2.5 px-2 py-2.5 w-full text-[10px] font-bold text-[#6B6B65] uppercase tracking-wider hover:text-[#1F1F1F] hover:bg-[#FAFAFA] rounded transition-colors text-left focus:outline-none"
                aria-expanded={!isCollapsed}
              >
                {CategoryIcon && (
                  <CategoryIcon
                    className="w-4 h-4 shrink-0 text-gold"
                    strokeWidth={1.75}
                  />
                )}
                <span className="flex-1 text-left">{group.category}</span>
                <span className="text-[10px] font-bold text-gold bg-white border border-gold-300 border-opacity-70 px-2 py-[2px] rounded">
                  {group.items.length}
                </span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-[#9A9A95]" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-[#9A9A95]" />
                )}
              </button>
              {!isCollapsed && (
                <div className="flex flex-col mt-1">
                  {group.items.map((item) => (
                    <DraggablePaletteItem key={item.type} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
