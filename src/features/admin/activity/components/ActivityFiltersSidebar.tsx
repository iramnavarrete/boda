"use client";

import React, { useState } from "react";
import {
  Filter,
  Search,
  X,
  RefreshCw,
  LayoutList,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { cn } from "@heroui/theme";
import { useActivityContext } from "../context/ActivityContext";
import { ACTIVITY_VISUAL } from "../utils/activityLabels";
import { Dropdown } from "./Dropdown";
import type {
  DropdownOption,
} from "./Dropdown";
import type { ActivityFilterType, ActivitySortBy } from "../types";

interface FilterOptionDef {
  value: ActivityFilterType;
  label: string;
  icon: React.ReactNode;
}

/** Filtros principales por tipo de actividad (incluyen "Todas"). */
const FILTER_OPTIONS: FilterOptionDef[] = [
  { value: "all", label: "Todas las actividades", icon: <LayoutList size={13} /> },
  {
    value: "confirm",
    label: "Confirmaciones",
    icon: React.createElement(ACTIVITY_VISUAL.confirm.icon, { size: 13 }),
  },
  {
    value: "view",
    label: "Visualizaciones",
    icon: React.createElement(ACTIVITY_VISUAL.view.icon, { size: 13 }),
  },
  {
    value: "decline",
    label: "Rechazados",
    icon: React.createElement(ACTIVITY_VISUAL.decline.icon, { size: 13 }),
  },
];

/**
 * Filtros "especiales" — derivados o contextuales.
 * Renderizados en su propia sección del sidebar para no contaminar la
 * lista principal de tipos de actividad.
 */
const SPECIAL_FILTERS: FilterOptionDef[] = [
  {
    value: "unanswered",
    label: "Vistas sin responder",
    icon: React.createElement(ACTIVITY_VISUAL.view.icon, { size: 13 }),
  },
];

interface SortOptionDef {
  value: ActivitySortBy;
  label: string;
  arrow: React.ReactNode;
}

const SORT_OPTIONS: SortOptionDef[] = [
  {
    value: "recent",
    label: "Más recientes",
    arrow: <ArrowDown size={12} />,
  },
  {
    value: "oldest",
    label: "Más antiguos",
    arrow: <ArrowUp size={12} />,
  },
];

/** ID para coordinar que solo un dropdown esté abierto a la vez. */
type DropdownKey = "filter" | "special" | "sort";

const ActivityFiltersSidebar: React.FC = () => {
  const {
    counts,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    hasActiveFilters,
    resetFilters,
  } = useActivityContext();

  // Estado compartido: solo un dropdown abierto a la vez.
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  const countFor = (value: ActivityFilterType): number => {
    if (value === "all") return counts.all;
    return counts[value];
  };

  // ── Opciones para los dropdowns (móvil) ──
  const filterDropdownOptions: DropdownOption<ActivityFilterType>[] =
    FILTER_OPTIONS.map((opt) => {
      const count = countFor(opt.value);
      return {
        value: opt.value,
        label: opt.label,
        icon: opt.icon,
        // Badge de conteo en cada opción, igual que los botones desktop.
        trailing: (
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md border tabular-nums",
              opt.value === filterStatus
                ? "bg-gold/10 border-gold/30 text-gold"
                : "bg-white border-[#EBE5DA] text-stone-400",
            )}
          >
            {count}
          </span>
        ),
      };
    });

  const sortDropdownOptions: DropdownOption<ActivitySortBy>[] = SORT_OPTIONS.map(
    (opt) => ({
      value: opt.value,
      label: opt.label,
      icon: opt.arrow,
    }),
  );

  // Opciones para "Filtros especiales" (móvil) — incluye el count badge.
  const specialFilterDropdownOptions: DropdownOption<ActivityFilterType>[] =
    SPECIAL_FILTERS.map((opt) => {
      const count = countFor(opt.value);
      return {
        value: opt.value,
        label: opt.label,
        icon: opt.icon,
        trailing: (
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md border tabular-nums",
              opt.value === filterStatus
                ? "bg-gold/10 border-gold/30 text-gold"
                : "bg-white border-[#EBE5DA] text-stone-400",
            )}
          >
            {count}
          </span>
        ),
      };
    });

  return (
    <aside className="w-full lg:w-64 shrink-0 pt-1.5">
      <div className="bg-white/90 rounded-xl border border-[#EBE5DA] shadow-sm p-3 lg:p-4 lg:sticky lg:top-24">
        {/* Header "Filtros" — solo visible en desktop */}
        <div className="hidden lg:flex items-center gap-2 mb-3 pb-2.5 border-b border-[#EBE5DA]">
          <Filter size={14} className="text-gold" />
          <h3 className="text-[11px] font-bold text-charcoal uppercase tracking-widest">
            Filtros
          </h3>
        </div>

        {/* ── Buscar ── */}
        <div className="mb-3 lg:mb-4">
          <h4 className="hidden lg:block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
            Buscar
          </h4>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-gold transition-colors">
              <Search size={12} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar familia o invitado…"
              className={cn(
                "w-full pl-8 pr-8 py-2 lg:py-1.5 bg-white border border-[#EBE5DA] rounded-lg",
                "text-[13px] text-charcoal placeholder:text-stone-400",
                "outline-none focus:ring-1 focus:ring-gold focus:border-gold/50 transition-all",
              )}
            />
            {searchTerm !== "" && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── MÓVIL: Dropdowns personalizados (grid 2 cols) ── */}
        <div className="grid grid-cols-2 gap-2 lg:hidden">
          <Dropdown
            ariaLabel="Tipo de actividad"
            value={filterStatus}
            onChange={setFilterStatus}
            open={openDropdown === "filter"}
            onOpenChange={(o) => setOpenDropdown(o ? "filter" : null)}
            options={filterDropdownOptions}
          />
          <Dropdown
            ariaLabel="Ordenar por"
            value={sortBy}
            onChange={setSortBy}
            open={openDropdown === "sort"}
            onOpenChange={(o) => setOpenDropdown(o ? "sort" : null)}
            options={sortDropdownOptions}
          />
        </div>

        {/* ── MÓVIL: Filtros especiales (full-width, debajo del grid) ── */}
        <div className="lg:hidden mt-2">
          <Dropdown
            ariaLabel="Filtros especiales"
            value={filterStatus}
            onChange={setFilterStatus}
            open={openDropdown === "special"}
            onOpenChange={(o) => setOpenDropdown(o ? "special" : null)}
            options={specialFilterDropdownOptions}
          />
        </div>

        {/* ── DESKTOP: Tipo de actividad como botones (con counts) ── */}
        <div className="hidden lg:block mb-4">
          <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
            Tipo de actividad
          </h4>
          <div className="flex flex-col gap-0.5">
            {FILTER_OPTIONS.map((opt) => {
              const isActive = filterStatus === opt.value;
              const count = countFor(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={cn(
                    "group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-all border text-left",
                    isActive
                      ? "bg-[#FDFBF7] border-gold/40 text-charcoal shadow-sm"
                      : "bg-white border-transparent text-stone-500 hover:bg-[#F9F7F2] hover:border-[#EBE5DA]",
                  )}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={cn(
                        "shrink-0",
                        isActive ? "text-gold" : "text-stone-400",
                      )}
                    >
                      {opt.icon}
                    </span>
                    <span className={cn("truncate", isActive && "font-bold")}>
                      {opt.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border tabular-nums",
                      isActive
                        ? "bg-gold/10 border-gold/30 text-gold"
                        : "bg-white border-[#EBE5DA] text-stone-400",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DESKTOP: Filtros especiales ── */}
        <div className="hidden lg:block mb-4">
          <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
            Filtros especiales
          </h4>
          <div className="flex flex-col gap-0.5">
            {SPECIAL_FILTERS.map((opt) => {
              const isActive = filterStatus === opt.value;
              const count = countFor(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={cn(
                    "group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-all border text-left",
                    isActive
                      ? "bg-[#FDFBF7] border-gold/40 text-charcoal shadow-sm"
                      : "bg-white border-transparent text-stone-500 hover:bg-[#F9F7F2] hover:border-[#EBE5DA]",
                  )}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={cn(
                        "shrink-0",
                        isActive ? "text-gold" : "text-stone-400",
                      )}
                    >
                      {opt.icon}
                    </span>
                    <span className={cn("truncate", isActive && "font-bold")}>
                      {opt.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border tabular-nums",
                      isActive
                        ? "bg-gold/10 border-gold/30 text-gold"
                        : "bg-white border-[#EBE5DA] text-stone-400",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DESKTOP: Ordenar por como botones (con flechas) ── */}
        <div className="hidden lg:block mb-3">
          <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
            Ordenar por
          </h4>
          <div className="flex flex-col gap-0.5">
            {SORT_OPTIONS.map((opt) => {
              const isActive = sortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cn(
                    "group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-all border text-left",
                    isActive
                      ? "bg-[#FDFBF7] border-gold/40 text-charcoal font-bold shadow-sm"
                      : "bg-white border-transparent text-stone-500 hover:bg-[#F9F7F2] hover:border-[#EBE5DA]",
                  )}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-gold" : "text-stone-400",
                      )}
                      aria-hidden="true"
                    >
                      {opt.arrow}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Limpiar filtros ── */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 mt-2 lg:mt-1 rounded-lg",
              "text-[11px] font-bold text-red-500 bg-red-50 border border-red-100",
              "hover:bg-red-100 hover:text-red-600 transition-colors",
            )}
          >
            <RefreshCw size={11} /> Limpiar filtros
          </button>
        )}
      </div>
    </aside>
  );
};

export default ActivityFiltersSidebar;