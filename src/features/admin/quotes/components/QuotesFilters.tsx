"use client";

import { Mail, MailOpen, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type QuotesFilterType = "all" | "unread" | "read";

interface QuotesFiltersProps {
  filter: QuotesFilterType;
  onFilterChange: (filter: QuotesFilterType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filteredCount: number;
  counts: Record<QuotesFilterType, number>;
}

const TABS: Record<
  QuotesFilterType,
  { label: string; icon: ReactNode }
> = {
  all: { label: "Todos", icon: null },
  unread: { label: "Nuevos", icon: <Mail size={12} /> },
  read: { label: "Leídos", icon: <MailOpen size={12} /> },
};

/**
 * Barra de filtros (segmented control tipo pill) + búsqueda libre.
 *
 * Estilo:
 *  - Contenedor pill con fondo claro y border sand.
 *  - Cada tab es una píldora con icono + label + count badge.
 *  - Tab activa: bg blanco + shadow + ring dorado; count dorado.
 *  - Tab inactiva: transparente; count gris con border.
 *  - La línea inferior animada se cambió por un ring (más limpio).
 */
const QuotesFilters = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  filteredCount,
  counts,
}: QuotesFiltersProps) => {
  return (
    <div className="flex flex-col-reverse md:flex-row md:items-end justify-between gap-3 shrink-0">
      <div className="flex gap-1.5 overflow-hidden w-full md:w-auto p-1 bg-white/40 rounded-full border border-sand-200/60 self-start">
        {(["all", "unread", "read"] as const).map((f) => {
          const isActive = filter === f;
          const tab = TABS[f];
          return (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`relative px-3.5 py-1.5 text-xs whitespace-nowrap transition-all flex items-center gap-1.5 rounded-full font-medium ${
                isActive
                  ? "text-primary bg-white shadow-sm border border-sand-200"
                  : "text-charcoal-500 hover:text-charcoal-800 hover:bg-white/50 border border-transparent"
              }`}
            >
              {tab.icon && (
                <span
                  className={
                    isActive ? "text-gold-500" : "text-charcoal-400"
                  }
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-gold-500/10 text-gold-500"
                    : "bg-white/80 text-charcoal-400 border border-sand-200"
                }`}
              >
                {counts[f]}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeFilterTab"
                  className="absolute inset-0 rounded-full ring-1 ring-gold-500/30 pointer-events-none"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto mb-3 md:mb-2">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-gold text-stone-custom">
            <Search size={15} />
          </div>
          <input
            className="w-full pl-9 pr-9 py-2 bg-white/90 border border-sand rounded-xl outline-none focus:ring-0 focus:ring-gold focus:border-gold/50 transition-all duration-300 text-xs text-charcoal placeholder:text-stone-light shadow-sm"
            placeholder={`Buscar entre ${filteredCount} mensaje${filteredCount >= 2 ? "s" : ""}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery !== "" && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-custom hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotesFilters;
