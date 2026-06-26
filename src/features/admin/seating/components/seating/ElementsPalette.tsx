"use client";

import React, {
  ForwardRefExoticComponent,
  RefAttributes,
  useState,
} from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useSeatingStore, ElementType } from "../../stores/useSeatingStore";
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
  LayoutGrid,
  Sparkles,
} from "lucide-react";

export interface PaletteItemType {
  type: ElementType | "custom_layout";
  label: string;
  seats: number;
  width: number;
  height: number;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}

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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 p-2 bg-white border border-[#EBE5DA] rounded-lg transition-all group w-full text-left cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40 scale-95" : "hover:border-[#C5A669] hover:shadow-sm"} ${isLayout ? "bg-[#FDFBF7] border-dashed border-[#C5A669]/60 hover:bg-[#F9F7F2]" : ""}`}
      style={{ touchAction: "none" }}
    >
      <div
        className={`p-1.5 rounded-md transition-colors shrink-0 ${isLayout ? "bg-amber-50 group-hover:bg-amber-100" : "bg-[#F9F7F2] group-hover:bg-[#f3efdf]"}`}
      >
        <item.icon
          className={`w-4 h-4 ${isLayout ? "text-[#C5A669]" : "text-[#5A5A5A] group-hover:text-[#C5A669]"}`}
          strokeWidth={1.5}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={`text-xs font-medium ${isLayout ? "text-[#C5A669] font-semibold" : "text-[#2C2C29]"}`}
        >
          {item.label}
        </span>
        {isLayout ? (
          <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600">
            Generador Inteligente
          </span>
        ) : item.seats > 0 ? (
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#A8A29E]">
            {item.seats} personas
          </span>
        ) : (
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#C5A669]">
            Arrastra al plano
          </span>
        )}
      </div>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
        <svg
          width="10"
          height="14"
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
      className="flex flex-col h-full w-full bg-white"
      style={{ minWidth: "15rem" }}
    >
      <div className="p-3 border-b border-[#EBE5DA] flex justify-between items-center bg-[#FDFBF7]">
        <div className="flex flex-col">
          <h2 className="font-serif text-[15px] font-semibold text-[#2C2C29]">
            Elementos
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 bg-white rounded-md border border-[#EBE5DA] hover:bg-[#F9F7F2]"
          >
            <X size={14} className="text-[#A8A29E]" />
          </button>
        )}
      </div>

      <div className="p-3 space-y-4 overflow-y-auto w-full flex-1">
        {/* 🔥 PUESTO AL PRINCIPIO: Sección del Generador Inteligente */}
        <div className="flex flex-col">
          <div className="text-[9px] font-bold uppercase tracking-widest text-[#A8A29E] mb-3 flex items-center gap-1.5">
            <LayoutGrid size={12} />
            Plantillas Dinámicas
          </div>
          <div className="space-y-2">
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
        </div>

        <hr className="border-[#EBE5DA] my-2" />

        {/* Listado tradicional de elementos individuales */}
        {ELEMENTS.map((group) => {
          const isCollapsed = collapsedCategories[group.category];
          return (
            <div key={group.category} className="flex flex-col">
              <button
                onClick={() => toggleCategory(group.category)}
                className="text-[9px] font-bold uppercase tracking-widest text-[#A8A29E] mb-2 flex items-center justify-between w-full hover:text-[#C5A669] transition-colors focus:outline-none"
              >
                <span className="flex items-center gap-1">
                  {isCollapsed ? (
                    <ChevronRight size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                  {group.category}
                </span>
                <span className="bg-[#EBE5DA] text-[#5A5A5A] px-1.5 py-[1px] rounded-full text-[8px] font-semibold">
                  {group.items.length}
                </span>
              </button>
              {!isCollapsed && (
                <div className="flex flex-col gap-1.5">
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
