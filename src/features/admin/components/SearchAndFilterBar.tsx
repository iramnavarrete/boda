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
  Send,
  MessageCircle,
  List,
  LayoutGrid,
  ClipboardPaste,
  MoreVertical,
} from "lucide-react";
import {
  FilterCounts,
  FilterType,
  WhatsappCounts,
  WhatsappFilterType,
} from "@/types";
import DashedSeparator from "./DashedSeparator";
import { cn } from "@heroui/theme";
import TextureButton from "@/features/shared/components/TextureButton";

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

interface SearchAndFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: FilterType;
  setFilterStatus: (status: FilterType) => void;
  filterCounts: FilterCounts;
  whatsappFilter: WhatsappFilterType;
  setWhatsappFilter: (status: WhatsappFilterType) => void;
  whatsappCounts: WhatsappCounts;
  viewMode?: "grid" | "table";
  setViewMode?: (mode: "grid" | "table") => void;
  onExportExcel: () => void;
  onImportExcel: () => void; // NUEVA PROP
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
  whatsappFilter,
  setWhatsappFilter,
  whatsappCounts,
  viewMode,
  setViewMode,
  onExportExcel,
  onImportExcel, // DESESTRUCTURADO
  onNewGuest,
  disabled,
  filteredGuestCount,
}: SearchAndFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // --- NUEVO ESTADO PARA EL MENÚ DE OPCIONES ---
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

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
    let baseLabel = "Todos";
    if (filterStatus === "confirmed") baseLabel = "Confirmados";
    if (filterStatus === "pending") baseLabel = "Pendientes";
    if (filterStatus === "rejected") baseLabel = "Rechazados";

    if (whatsappFilter === "sent") return `${baseLabel} + WA Enviado`;
    if (whatsappFilter === "not_sent") return `${baseLabel} + WA Pendiente`;
    if (whatsappFilter === "empty") return `${baseLabel} + Sin WA`;

    return baseLabel;
  };

  const getFilterColor = () => {
    if (filterStatus === "confirmed")
      return "text-green-700 bg-green-50 border-green-200 ring-1 ring-green-100";
    if (filterStatus === "pending")
      return "text-gold bg-sand/30 border-sand ring-1 ring-gold/20";
    if (filterStatus === "rejected")
      return "text-red-700 bg-red-50 border-red-200 ring-1 ring-red-100";

    if (whatsappFilter === "sent")
      return "text-green-700 bg-green-50 border-green-200 ring-1 ring-green-100";
    if (whatsappFilter === "not_sent")
      return "text-stone-700 bg-stone-100 border-stone-200 ring-1 ring-stone-200";
    if (whatsappFilter === "empty")
      return "text-red-700 bg-red-50 border-red-200 ring-1 ring-red-200";

    return "text-stone-custom bg-white/90 border-sand hover:border-gold/50";
  };

  const hasActiveFilters = filterStatus !== "all" || whatsappFilter !== "all";

  const clearFilters = () => {
    setFilterStatus("all");
    setWhatsappFilter("all");
    setIsFilterOpen(false);
  };

  return (
    <div className="w-full font-sans">
      <fieldset
        disabled={disabled}
        className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-3 transition-opacity disabled:opacity-60 disabled:pointer-events-none"
      >
        <div className="flex flex-1 gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-gold text-stone-custom">
              <Search size={18} />
            </div>
            <input
              className="w-full pl-10 pr-10 py-3 bg-white/90 border border-sand rounded-xl outline-none focus:ring-0 focus:ring-gold focus:border-gold/50 transition-all duration-300 text-sm text-charcoal placeholder:text-stone-light shadow-sm"
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

          {/* FILTRO COMPACTO */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex h-full items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all whitespace-nowrap shadow-sm ${getFilterColor()}`}
            >
              <Filter
                size={16}
                className={
                  !hasActiveFilters ? "text-stone-light" : "currentColor"
                }
              />
              <span className="hidden sm:inline">{getFilterLabel()}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 opacity-60 ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={cn(
                "absolute top-full right-0 md:left-0 w-56 bg-white/95 backdrop-blur-sm text-stone-800 rounded-2xl border border-gold/50 shadow-[0_20px_40px_-5px_rgba(197,166,105,0.2)] overflow-hidden",
                "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) z-50 flex flex-col",
                isFilterOpen
                  ? "opacity-100 translate-y-1 scale-100"
                  : "opacity-0 translate-y-0 scale-95 pointer-events-none",
              )}
            >
              <div className="p-2 space-y-0.5 max-h-[50vh] overflow-y-auto no-scrollbar flex-1">
                {/* --- SECCIÓN 1: ASISTENCIA --- */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-gold uppercase tracking-widest bg-sand-light/50 rounded-lg mb-1">
                  Asistencia
                </div>

                <button
                  onClick={() => setFilterStatus("all")}
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
                    {filterCounts?.all || 0}
                  </span>
                </button>
                <DashedSeparator className="m-0" />
                <button
                  onClick={() => setFilterStatus("confirmed")}
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
                    {filterCounts?.confirmed || 0}
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
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
                    {filterCounts?.pending || 0}
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus("rejected")}
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
                  <span className="text-stone-light text-xs bg-white/90 px-1.5 py-0.5 rounded border border-sand">
                    {filterCounts?.rejected || 0}
                  </span>
                </button>

                {/* --- SECCIÓN 2: ESTADO WHATSAPP --- */}
                <div className="mt-2 pt-2 border-t border-sand">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gold uppercase tracking-widest bg-sand-light/50 rounded-lg mb-1">
                    WhatsApp
                  </div>
                  <button
                    onClick={() => setWhatsappFilter("all")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      whatsappFilter === "all"
                        ? "bg-sand-light text-charcoal font-medium border border-sand"
                        : "text-stone-custom hover:bg-sand-light hover:text-charcoal border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutList
                        size={16}
                        className={
                          whatsappFilter === "all"
                            ? "text-gold"
                            : "text-stone-light"
                        }
                      />
                      Todos
                    </span>
                    <span className="text-stone-light text-xs bg-white px-1.5 py-0.5 rounded border border-sand">
                      {whatsappCounts?.all || 0}
                    </span>
                  </button>
                  <DashedSeparator className="m-0" />
                  <button
                    onClick={() => setWhatsappFilter("sent")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      whatsappFilter === "sent"
                        ? "bg-green-50 text-green-800 font-medium border border-green-100"
                        : "text-stone-custom hover:bg-green-50/50 hover:text-green-700 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Send
                        size={16}
                        className={
                          whatsappFilter === "sent"
                            ? "text-green-600"
                            : "text-stone-light"
                        }
                      />
                      Enviados
                    </span>
                    <span className="text-stone-light text-xs bg-white px-1.5 py-0.5 rounded border border-sand">
                      {whatsappCounts?.sent || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setWhatsappFilter("not_sent")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      whatsappFilter === "not_sent"
                        ? "bg-stone-100 text-stone-800 font-medium border border-stone-200"
                        : "text-stone-custom hover:bg-stone-50 hover:text-stone-700 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageCircle
                        size={16}
                        className={
                          whatsappFilter === "not_sent"
                            ? "text-stone-500"
                            : "text-stone-light"
                        }
                      />
                      No enviados
                    </span>
                    <span className="text-stone-light text-xs bg-white px-1.5 py-0.5 rounded border border-sand">
                      {whatsappCounts?.not_sent || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setWhatsappFilter("empty")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      whatsappFilter === "empty"
                        ? "bg-red-50 text-red-800 font-medium border border-red-200"
                        : "text-stone-custom hover:bg-red-50/50 hover:text-red-700 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <XCircle
                        size={16}
                        className={
                          whatsappFilter === "empty"
                            ? "text-red-500"
                            : "text-stone-light"
                        }
                      />
                      Sin Teléfono
                    </span>
                    <span className="text-stone-light text-xs bg-white px-1.5 py-0.5 rounded border border-sand">
                      {whatsappCounts?.empty || 0}
                    </span>
                  </button>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="p-2 border-t border-[#EBE5DA] bg-[#FDFBF7] shrink-0">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                  >
                    <X size={14} /> Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GRUPO DERECHO: Acciones */}
        <div className="flex gap-2 sm:gap-3 shrink-0 relative h-[46px]">
          {/* Toggle Vista (Solo Desktop) */}
          {viewMode && setViewMode && (
            <div className="hidden md:flex items-center bg-white/90 border border-[#EBE5DA] rounded-xl p-1 shadow-sm h-full">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all flex items-center justify-center h-full",
                  viewMode === "grid"
                    ? "bg-[#FDFBF7] text-[#C5A669] shadow-sm border border-[#EBE5DA]"
                    : "text-[#A8A29E] hover:text-[#5A5A5A] border border-transparent",
                )}
                title="Vista de cuadrícula"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-2 rounded-lg transition-all flex items-center justify-center h-full",
                  viewMode === "table"
                    ? "bg-[#FDFBF7] text-[#C5A669] shadow-sm border border-[#EBE5DA]"
                    : "text-[#A8A29E] hover:text-[#5A5A5A] border border-transparent",
                )}
                title="Vista de lista"
              >
                <List size={16} />
              </button>
            </div>
          )}

          {/* Menú de Más Opciones (Importar/Exportar) */}
          <div className="relative h-full" ref={optionsRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={cn(
                "flex items-center justify-center px-3 py-0 h-full bg-white/90 text-stone-custom border rounded-xl hover:bg-[#C5A669]/10 hover:text-[#C5A669] hover:border-[#C5A669]/50 transition-all shadow-sm",
                isOptionsOpen
                  ? "border-[#C5A669]/50 text-[#C5A669] bg-[#C5A669]/5"
                  : "border-[#EBE5DA]",
              )}
              title="Más opciones"
            >
              <MoreVertical size={18} />
            </button>

            {/* Contenido del Dropdown de Opciones */}
            <div
              className={cn(
                "absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-2xl border border-gold/50 shadow-[0_20px_40px_-5px_rgba(197,166,105,0.2)] overflow-hidden z-50 transition-all duration-300 origin-top-right",
                isOptionsOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
              )}
            >
              <div className="p-1.5 flex flex-col gap-1">
                <button
                  onClick={() => {
                    onImportExcel();
                    setIsOptionsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-600 font-medium hover:bg-sand-light hover:text-[#C5A669] rounded-xl transition-colors text-left"
                >
                  <ClipboardPaste size={16} /> Importar Excel
                </button>
                <button
                  onClick={() => {
                    onExportExcel();
                    setIsOptionsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-600 font-medium hover:bg-sand-light hover:text-[#C5A669] rounded-xl transition-colors text-left"
                >
                  <FileSpreadsheet size={16} /> Exportar Lista
                </button>
              </div>
            </div>
          </div>

          {/* Nuevo Invitado */}
          <TextureButton
            icon={<Plus size={18} />}
            onClick={onNewGuest}
            className="px-4 xl:px-6 py-0 h-full rounded-xl transition-all shadow-lg shadow-[#C5A669]/20 hover:shadow-[#C5A669]/30 hover:-translate-y-0.5 font-bold"
          >
            <span className="hidden sm:inline">Nuevo Invitado</span>
          </TextureButton>
        </div>
      </fieldset>
    </div>
  );
}