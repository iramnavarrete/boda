import React, { ForwardRefExoticComponent, ReactNode, RefAttributes, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSeatingStore, ElementType } from "./stores/useSeatingStore";
import {
  Circle,
  Square,
  RectangleHorizontal,
  Columns2,
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
  LucideProps,
} from "lucide-react";

const ELEMENTS: {
  category: string;
  items: {
    type: ElementType;
    label: string;
    seats: number;
    width: number;
    height: number;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  }[];
}[] = [
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
        icon: Columns2,
      },
      {
        type: "cocktail_table",
        label: "Coctelera",
        seats: 4,
        width: 80,
        height: 80,
        icon: Circle,
      },
    ],
  },
  {
    category: "Áreas Principales",
    items: [
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
    ],
  },
];

function DraggablePaletteItem({
  item,
}: {
  item: (typeof ELEMENTS)[0]["items"][0];
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: {
      type: "palette_element",
      elementType: item.type,
      width: item.width,
      height: item.height,
      seats: item.seats,
      label: item.label,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-3 bg-white border border-[#EBE5DA] rounded-xl transition-all group w-full text-left cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-40 scale-95" : "hover:border-[#C5A669] hover:shadow-sm"}
      `}
      style={{ touchAction: "none" }}
    >
      <div className="p-2 bg-[#F9F7F2] rounded-lg group-hover:bg-[#f3efdf] transition-colors shrink-0">
        <item.icon
          className="w-5 h-5 text-[#5A5A5A] group-hover:text-[#C5A669]"
          strokeWidth={1.5}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium text-[#2C2C29]">{item.label}</span>
        {item.seats > 0 ? (
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">
            {item.seats} personas
          </span>
        ) : (
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A669]">
            Arrastra al plano
          </span>
        )}
      </div>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          width="12"
          height="16"
          viewBox="0 0 12 16"
          fill="none"
          className="text-[#A8A29E]"
        >
          <circle cx="3" cy="3" r="1.5" fill="currentColor" />
          <circle cx="9" cy="3" r="1.5" fill="currentColor" />
          <circle cx="3" cy="8" r="1.5" fill="currentColor" />
          <circle cx="9" cy="8" r="1.5" fill="currentColor" />
          <circle cx="3" cy="13" r="1.5" fill="currentColor" />
          <circle cx="9" cy="13" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

export default function ElementsPalette({ onClose }: { onClose?: () => void }) {
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div
      className="flex flex-col h-full w-full bg-white"
      style={{ minWidth: "16rem" }}
    >
      <div className="p-4 border-b border-[#EBE5DA] flex justify-between items-center bg-[#FDFBF7]">
        <div className="flex flex-col">
          <h2 className="font-serif text-lg text-[#2C2C29]">Elementos</h2>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">
            Arrastra al plano
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 bg-white rounded-md border border-[#EBE5DA]"
          >
            <X size={16} className="text-[#A8A29E]" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-6 overflow-y-auto w-full">
        {ELEMENTS.map((group) => {
          const isCollapsed = collapsedCategories[group.category];
          return (
            <div key={group.category} className="flex flex-col">
              <button
                onClick={() => toggleCategory(group.category)}
                className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] mb-3 flex items-center justify-between w-full hover:text-[#C5A669] transition-colors focus:outline-none"
              >
                <span className="flex items-center gap-1.5">
                  {isCollapsed ? (
                    <ChevronRight size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                  {group.category}
                </span>
                <span className="bg-[#EBE5DA] text-[#5A5A5A] px-2 py-0.5 rounded-full text-[9px] font-semibold">
                  {group.items.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="flex flex-col gap-2">
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
