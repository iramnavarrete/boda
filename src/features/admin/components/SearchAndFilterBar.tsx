import { useEffect, useRef, useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  LayoutList,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { FilterCounts, FilterType } from "@/types";
import DashedSeparator from "./DashedSeparator";
import { cn } from "@heroui/theme";

interface SearchAndFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: FilterType;
  setFilterStatus: (status: FilterType) => void;
  filterCounts: FilterCounts;
  onExportExcel: () => void;
  onNewGuest: () => void;
  disabled: boolean;
  filteredGuestCount: number;
}

export default function SearchAndFilterBar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterCounts,
  onExportExcel,
  onNewGuest,
  disabled,
  filteredGuestCount,
}: SearchAndFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilterLabel = () => {
    switch (filterStatus) {
      case "confirmed":
        return "Confirmados";
      case "pending":
        return "Pendientes";
      case "rejected":
        return "Rechazados";
      default:
        return "Todos";
    }
  };

  // Colores adaptados a la paleta Stone & Gold (más sutiles)
  const getFilterColor = () => {
    switch (filterStatus) {
      case "confirmed":
        return "text-green-700 bg-green-50 border-green-200 ring-1 ring-green-100";
      case "pending":
        return "text-gold bg-paper/30 border-sand ring-1 ring-gold/20"; // Gold theme
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200 ring-1 ring-red-100";
      default:
        return "text-stone-custom bg-white border-sand hover:border-gold/50";
    }
  };

  return (
    <div className="w-full font-sans">
      <fieldset
        disabled={disabled}
        className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-3 transition-opacity disabled:opacity-60 disabled:pointer-events-none"
      >
        {/* GRUPO IZQUIERDO: Búsqueda + Filtro */}
        <div className="flex flex-1 gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-gold text-stone-custom">
              <Search size={18} />
            </div>
            <input
              className="w-full pl-10 pr-10 py-3 bg-white border border-sand rounded-xl outline-none focus:ring-0 focus:ring-gold focus:border-gold/50 transition-all duration-300 text-sm text-charcoal placeholder:text-stone-light shadow-sm"
              placeholder={`Buscar entre ${filteredGuestCount} invitados...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm !== "" && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-custom hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* FILTRO COMPACTO (Dropdown) */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex h-full items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all whitespace-nowrap shadow-sm ${getFilterColor()}`}
            >
              <Filter
                size={16}
                className={
                  filterStatus === "all" ? "text-stone-light" : "currentColor"
                }
              />
              <span className="hidden sm:inline">{getFilterLabel()}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 opacity-60 ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* MENÚ DESPLEGABLE - Sombra Difuminada Coherente */}
            <div
              className={cn(
                "absolute top-full right-0 md:left-0 w-48 bg-white text-stone-800 rounded-2xl border border-gold/50 shadow-[0_20px_40px_-5px_rgba(197,166,105,0.2)] overflow-hidden",
                "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) z-50",
                isFilterOpen
                  ? "opacity-100 translate-y-1 scale-100"
                  : "opacity-0 translate-y-0 scale-95 pointer-events-none",
              )}
            >
              <div className="p-1.5 space-y-0.5">
                <div className="px-3 py-1 text-[10px] font-bold text-gold uppercase tracking-widest bg-sand-light/50 rounded-lg mb-1">
                  Filtrar por estado
                </div>

                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    filterStatus === "all"
                      ? "bg-sand-light text-charcoal font-medium border border-sand"
                      : "text-stone-custom hover:bg-sand-light hover:text-charcoal border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutList
                      size={16}
                      className={
                        filterStatus === "all"
                          ? "text-gold"
                          : "text-stone-light"
                      }
                    />
                    Todos
                  </span>
                  <span className="text-stone-light text-xs bg-white px-1.5 py-0.5 rounded border border-sand">
                    {filterCounts.all}
                  </span>
                </button>

                <DashedSeparator className="m-0" />

                <button
                  onClick={() => {
                    setFilterStatus("confirmed");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    filterStatus === "confirmed"
                      ? "bg-green-50 text-green-800 font-medium border border-green-100"
                      : "text-stone-custom hover:bg-green-50/50 hover:text-green-700 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CheckCircle2
                      size={16}
                      className={
                        filterStatus === "confirmed"
                          ? "text-green-600"
                          : "text-stone-light"
                      }
                    />
                    Confirmados
                  </span>
                  <span className="text-stone-light text-xs bg-white px-1.5 py-0.5 rounded border border-sand">
                    {filterCounts.confirmed}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setFilterStatus("pending");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    filterStatus === "pending"
                      ? "bg-paper/30 text-gold font-medium border border-sand"
                      : "text-stone-custom hover:bg-paper/30 hover:text-gold border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Clock
                      size={16}
                      className={
                        filterStatus === "pending"
                          ? "text-gold"
                          : "text-stone-light"
                      }
                    />
                    Pendientes
                  </span>
                  <span className="text-stone-light text-xs bg-white px-1.5 py-0.5 rounded border border-sand">
                    {filterCounts.pending}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setFilterStatus("rejected");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    filterStatus === "rejected"
                      ? "bg-red-50 text-red-800 font-medium border border-red-100"
                      : "text-stone-custom hover:bg-red-50/50 hover:text-red-700 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <XCircle
                      size={16}
                      className={
                        filterStatus === "rejected"
                          ? "text-red-500"
                          : "text-stone-light"
                      }
                    />
                    Rechazados
                  </span>
                  <span className="text-stone-light text-xs bg-white px-1.5 py-0.5 rounded border border-sand">
                    {filterCounts.rejected}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GRUPO DERECHO: Acciones */}
        <div className="flex gap-3 shrink-0">
          {/* Excel (Solo Desktop) */}
          <button
            onClick={onExportExcel}
            className="hidden md:flex items-center justify-center px-4 py-3 bg-white text-stone-custom border border-sand rounded-xl hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all text-sm font-medium gap-2 shadow-sm group"
            title="Exportar Excel"
          >
            <FileSpreadsheet
              size={18}
              className="text-stone-light group-hover:text-green-600 transition-colors"
            />
            <span>Exportar</span>
          </button>

          {/* Nuevo Invitado */}
          <button
            onClick={onNewGuest}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gold hover:bg-gold-600 hover:bg-g text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:-translate-y-0.5 text-sm font-bold"
          >
            <Plus size={18} />
            <span>Nuevo Invitado</span>
          </button>
        </div>
      </fieldset>
    </div>
  );
}
