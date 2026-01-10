import { useEffect, useRef, useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  Smartphone,
  LayoutList,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { FilterCounts, FilterType } from "@/types";

interface SearchAndFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: FilterType;
  setFilterStatus: (status: FilterType) => void;
  filterCounts: FilterCounts;
  viewMode: "list" | "table";
  setViewMode: (mode: "list" | "table") => void;
  onExportExcel: () => void;
  onNewGuest: () => void;
}

export default function SearchAndFilterBar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterCounts,
  viewMode,
  setViewMode,
  onExportExcel,
  onNewGuest,
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

  const getFilterColor = () => {
    switch (filterStatus) {
      case "confirmed":
        return "text-green-700 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-stone-700 bg-white border-stone-200";
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
      {/* GRUPO IZQUIERDO: Búsqueda + Filtro */}
      <div className="flex flex-1 gap-2">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search size={18} />
          </div>
          <input
            className="w-full pl-10 pr-3 py-3 bg-white border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-sm"
            placeholder="Buscar invitados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTRO COMPACTO (Dropdown) */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${getFilterColor()}`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">{getFilterLabel()}</span>
            <span className="inline sm:hidden">Filtro</span>
            <span className="bg-black/10 px-1.5 rounded-full text-xs">
              {filterStatus === "all"
                ? filterCounts.all
                : filterStatus === "confirmed"
                ? filterCounts.confirmed
                : filterStatus === "pending"
                ? filterCounts.pending
                : filterCounts.rejected}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isFilterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Menú Desplegable */}
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    filterStatus === "all"
                      ? "bg-stone-100 font-medium"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutList size={14} /> Todos
                  </span>
                  <span className="text-stone-400 text-xs">
                    {filterCounts.all}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("confirmed");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-green-700 ${
                    filterStatus === "confirmed"
                      ? "bg-green-50 font-medium"
                      : "hover:bg-green-50/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={14} /> Confirmados
                  </span>
                  <span className="text-green-600/70 text-xs">
                    {filterCounts.confirmed}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("pending");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-yellow-700 ${
                    filterStatus === "pending"
                      ? "bg-yellow-50 font-medium"
                      : "hover:bg-yellow-50/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock size={14} /> Pendientes
                  </span>
                  <span className="text-yellow-600/70 text-xs">
                    {filterCounts.pending}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("rejected");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-red-700 ${
                    filterStatus === "rejected"
                      ? "bg-red-50 font-medium"
                      : "hover:bg-red-50/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <XCircle size={14} /> Rechazados
                  </span>
                  <span className="text-red-600/70 text-xs">
                    {filterCounts.rejected}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRUPO DERECHO: Acciones */}
      <div className="flex gap-2 shrink-0">
        {/* Excel (Solo Desktop) */}
        <button
          onClick={onExportExcel}
          className="hidden sm:flex items-center justify-center p-3 bg-white text-stone-600 border border-stone-200 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
          title="Exportar Excel"
        >
          <Download size={20} />
        </button>

        {/* Toggle Vista (Solo Desktop) */}
        <div className="hidden sm:flex bg-white rounded-lg border border-stone-200 p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded ${
              viewMode === "list"
                ? "bg-stone-100 text-stone-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Smartphone size={18} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded ${
              viewMode === "table"
                ? "bg-stone-100 text-stone-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <LayoutList size={18} />
          </button>
        </div>

        {/* Nuevo Invitado */}
        <button
          onClick={onNewGuest}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-3 rounded-lg transition-colors shadow-lg shadow-stone-900/20 text-sm font-medium"
        >
          <Plus size={18} /> <span>Nuevo</span>
        </button>
      </div>
    </div>
  );
}
