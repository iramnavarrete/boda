import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
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
  Tag,
  LucideIcon,
  FilterX,
  Mail
} from "lucide-react";
import { cn } from "@heroui/theme";
import TextureButton from "@/features/shared/components/TextureButton";
import { useWeddingAdminContext } from "@/features/admin/context/WeddingAdminContext";

// ============================================================================
// 1. INTERFACES ESTRICTAS (Cero 'any')
// ============================================================================
interface FilterOption {
  value: string;
  label: string;
  count: number;
  icon?: LucideIcon;
  iconColor?: string;
  activeColorClass?: string; // 🔥 Nueva propiedad para personalizar el color del badge seleccionado
}

interface FilterDropdownProps<T extends string = string> {
  label: string;
  options: FilterOption[];
  currentValue: T;
  onChange: (val: T) => void;
  isOpen: boolean;
  onToggle: () => void;
  fallbackColorClass?: string;
}

type DropdownType = "status" | "whatsapp" | "tag" | "options" | null;

// ============================================================================
// 2. CUSTOM HOOK: Lógica y Estados aislados
// ============================================================================
function useSearchAndFilterBar() {
  const context = useWeddingAdminContext();
  const { setFilterStatus, setWhatsappFilter, setTagFilter } = context;
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside unificado
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters =
    context.filterStatus !== "all" ||
    context.whatsappFilter !== "all" ||
    context.tagFilter !== "all";

  const clearFilters = useCallback(() => {
    setFilterStatus("all");
    setWhatsappFilter("all");
    setTagFilter("all");
    setOpenDropdown(null);
  }, [setFilterStatus, setWhatsappFilter, setTagFilter]);

  const handleDropdownToggle = useCallback((dropdownName: DropdownType) => {
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  }, []);

  return {
    ...context,
    openDropdown,
    containerRef,
    hasActiveFilters,
    clearFilters,
    handleDropdownToggle,
  };
}

// ============================================================================
// 3. SUB-COMPONENTES UI (Altamente reusables)
// ============================================================================

const FilterDropdown = <T extends string>({
  label,
  options,
  currentValue,
  onChange,
  isOpen,
  onToggle,
  fallbackColorClass = "bg-[#FDFBF7] border-[#C5A669] text-[#C5A669] ring-1 ring-[#C5A669]/20",
}: FilterDropdownProps<T>) => {
  const currentOption = options.find((o) => o.value === currentValue) || options[0];
  const isActive = currentValue !== "all";
  
  // Referencia para la detección de colisión
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔥 DETECCIÓN DE COLISIÓN DINÁMICA CERO-RENDERS
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const el = dropdownRef.current;
      
      // 1. Lo reiniciamos hacia la izquierda por defecto para poder medirlo bien
      el.classList.remove("right-0", "origin-top-right");
      el.classList.add("left-0", "origin-top-left");

      // 2. Leemos la posición real en la que el navegador lo acaba de dibujar
      const rect = el.getBoundingClientRect();

      // 3. Si el borde derecho del menú sobrepasa el ancho de la ventana (dejando 16px de margen),
      // le invertimos las clases directamente en el DOM (esto evita re-renderizar todo React)
      if (rect.right > window.innerWidth - 16) {
        el.classList.remove("left-0", "origin-top-left");
        el.classList.add("right-0", "origin-top-right");
      }
    }
  }, [isOpen]);

  // Usamos el color propio de la opción o el fallback si no lo tiene
  const appliedColorClass = currentOption.activeColorClass || fallbackColorClass;

  return (
    <div className="relative shrink-0 dropdown-container">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm",
          isActive
            ? appliedColorClass
            : "bg-white border-[#EBE5DA] text-[#5A5A5A] hover:bg-[#F9F7F2] hover:border-[#C5A669]/50"
        )}
      >
        <span className="opacity-70">{label}:</span>
        <span className="font-bold">{currentOption.label}</span>
        <ChevronDown size={12} className={cn("transition-transform opacity-50", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full mt-1.5 w-[220px] sm:w-56 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-sm rounded-xl border border-[#C5A669]/30 shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {options.map((opt) => {
              const isSelected = currentValue === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value as T); 
                    onToggle();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    isSelected
                      ? "bg-[#F9F7F2] text-[#2C2C29] font-bold"
                      : "text-[#5A5A5A] hover:bg-stone-50"
                  )}
                >
                  <span className="flex items-center gap-2 truncate pr-2">
                    {Icon && <Icon size={14} className={cn("shrink-0", opt.iconColor || "text-stone-400")} />}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  <span className="text-[10px] shrink-0 font-bold text-[#A8A29E] bg-white px-1.5 py-0.5 rounded border border-[#EBE5DA]">
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchInput = ({
  searchTerm,
  setSearchTerm,
  filteredCount
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredCount: number;
}) => (
  <div className="relative flex-1 group">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-[#C5A669] text-[#A8A29E]">
      <Search size={18} />
    </div>
    <input
      className="w-full pl-10 pr-10 py-3 bg-white border border-[#EBE5DA] rounded-xl outline-none focus:ring-1 focus:ring-[#C5A669] focus:border-[#C5A669]/50 transition-all duration-300 text-sm text-[#2C2C29] placeholder:text-[#A8A29E] shadow-sm"
      placeholder={`Buscar entre ${filteredCount} familia${filteredCount === 1 ? "" : "s"}...`}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {searchTerm !== "" && (
      <button
        onClick={() => setSearchTerm("")}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A29E] hover:text-red-400 transition-colors"
      >
        <X size={16} />
      </button>
    )}
  </div>
);

const ViewToggles = ({ viewMode, setViewMode }: { viewMode: string, setViewMode: (val: "table" | "grid") => void }) => (
  <div className="hidden md:flex items-center bg-white border border-[#EBE5DA] rounded-xl p-1 shadow-sm h-full">
    <button
      onClick={() => setViewMode("grid")}
      className={cn(
        "p-2 rounded-lg transition-all flex items-center justify-center h-full",
        viewMode === "grid" ? "bg-[#FDFBF7] text-[#C5A669] shadow-sm border border-[#EBE5DA]" : "text-[#A8A29E] hover:text-[#5A5A5A] border border-transparent"
      )}
      title="Vista de cuadrícula"
    >
      <LayoutGrid size={16} />
    </button>
    <button
      onClick={() => setViewMode("table")}
      className={cn(
        "p-2 rounded-lg transition-all flex items-center justify-center h-full",
        viewMode === "table" ? "bg-[#FDFBF7] text-[#C5A669] shadow-sm border border-[#EBE5DA]" : "text-[#A8A29E] hover:text-[#5A5A5A] border border-transparent"
      )}
      title="Vista de lista"
    >
      <List size={16} />
    </button>
  </div>
);

const MoreOptionsDropdown = ({
  isOpen,
  onToggle,
  onImport,
  onExport
}: {
  isOpen: boolean;
  onToggle: () => void;
  onImport: () => void;
  onExport: () => void;
}) => (
  <div className="relative h-full dropdown-container">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "flex items-center justify-center px-3 py-0 h-full bg-white text-stone-custom border rounded-xl hover:bg-[#C5A669]/10 hover:text-[#C5A669] hover:border-[#C5A669]/50 transition-all shadow-sm",
        isOpen ? "border-[#C5A669]/50 text-[#C5A669] bg-[#C5A669]/5" : "border-[#EBE5DA]"
      )}
      title="Más opciones"
    >
      <MoreVertical size={18} />
    </button>

    {isOpen && (
      <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-2xl border border-[#C5A669]/30 shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
        <div className="p-1.5 flex flex-col gap-1">
          <button
            onClick={onImport}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#5A5A5A] font-medium hover:bg-[#F9F7F2] hover:text-[#C5A669] rounded-xl transition-colors text-left"
          >
            <ClipboardPaste size={16} /> Importar Excel
          </button>
          <button
            onClick={onExport}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#5A5A5A] font-medium hover:bg-[#F9F7F2] hover:text-[#C5A669] rounded-xl transition-colors text-left"
          >
            <FileSpreadsheet size={16} /> Exportar Lista
          </button>
        </div>
      </div>
    )}
  </div>
);

// ============================================================================
// 4. COMPONENTE PRINCIPAL (Ultra Limpio)
// ============================================================================
export default function SearchAndFilterBar() {
  const {
    searchTerm, setSearchTerm, filterStatus, setFilterStatus, statusCounts,
    whatsappFilter, setWhatsappFilter, whatsappCounts, tagFilter, setTagFilter, tagCounts,
    viewMode, setViewMode, finalFilteredFamilies, selectedFamilies,
    handleNewFamily, handleExportExcel, openImportModal,
    openDropdown, handleDropdownToggle, hasActiveFilters, clearFilters, containerRef
  } = useSearchAndFilterBar();

  const disabled = selectedFamilies.size > 0;

  // 🔥 Opciones de configuración con colores específicos para la píldora activa
  const statusOptions: FilterOption[] = [
    { value: "all", label: "Todas", count: statusCounts?.all || 0, icon: LayoutList },
    { value: "confirmed", label: "Completas", count: statusCounts?.confirmed || 0, icon: CheckCircle2, iconColor: "text-green-500", activeColorClass: "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-100" },
    { value: "partial", label: "Parciales", count: statusCounts?.partial || 0, icon: CheckCircle2, iconColor: "text-amber-500", activeColorClass: "bg-amber-50 border-amber-200 text-amber-700 ring-1 ring-amber-100" },
    { value: "pending", label: "Pendientes", count: statusCounts?.pending || 0, icon: Clock, iconColor: "text-gold", activeColorClass: "bg-[#FDFBF7] border-[#C5A669] text-[#C5A669] ring-1 ring-[#C5A669]/20" },
    { value: "unopened", label: "Sin Abrir", count: statusCounts?.unopened || 0, icon: Mail, iconColor: "text-stone-400", activeColorClass: "bg-stone-50 border-stone-200 text-stone-600 ring-1 ring-stone-200" },
    { value: "rejected", label: "Rechazadas", count: statusCounts?.rejected || 0, icon: XCircle, iconColor: "text-red-500", activeColorClass: "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-100" },
  ];

  const whatsappOptions: FilterOption[] = [
    { value: "all", label: "Todos", count: whatsappCounts?.all || 0, icon: LayoutList },
    { value: "sent", label: "Enviados", count: whatsappCounts?.sent || 0, icon: Send, iconColor: "text-green-500", activeColorClass: "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-100" },
    { value: "not_sent", label: "Pendientes", count: whatsappCounts?.not_sent || 0, icon: MessageCircle, iconColor: "text-stone-400", activeColorClass: "bg-stone-50 border-stone-200 text-stone-600 ring-1 ring-stone-200" },
    { value: "empty", label: "Sin Teléfono", count: whatsappCounts?.empty || 0, icon: XCircle, iconColor: "text-red-400", activeColorClass: "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-100" },
  ];

  const tagOptions: FilterOption[] = [
    { value: "all", label: "Todas", count: tagCounts?.all || 0, icon: LayoutList },
    { value: "Novia", label: "Novia", count: tagCounts?.Novia || 0, icon: Tag, iconColor: "text-rose-400", activeColorClass: "bg-rose-50 border-rose-200 text-rose-700 ring-1 ring-rose-100" },
    { value: "Novio", label: "Novio", count: tagCounts?.Novio || 0, icon: Tag, iconColor: "text-blue-400", activeColorClass: "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-100" },
    { value: "Ambos", label: "Ambos", count: tagCounts?.Ambos || 0, icon: Tag, iconColor: "text-purple-400", activeColorClass: "bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-100" },
  ];

  return (
    <div className="w-full font-sans mb-4" ref={containerRef}>
      <fieldset
        disabled={disabled}
        className="flex flex-col gap-3 transition-opacity disabled:opacity-60 disabled:pointer-events-none"
      >
        {/* FILA 1: BÚSQUEDA Y ACCIONES */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <SearchInput 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            filteredCount={finalFilteredFamilies.length} 
          />

          <div className="flex gap-2 flex-row-reverse md:flex-row sm:gap-3 shrink-0 relative h-[46px]">
            <ViewToggles viewMode={viewMode} setViewMode={setViewMode} />
            <MoreOptionsDropdown
              isOpen={openDropdown === "options"}
              onToggle={() => handleDropdownToggle("options")}
              onImport={() => { openImportModal(); handleDropdownToggle("options"); }}
              onExport={() => { handleExportExcel(); handleDropdownToggle("options"); }}
            />
            <TextureButton
              icon={<Plus size={18} />}
              onClick={handleNewFamily}
              className="px-4 xl:px-6 py-0 h-full w-full md:w-auto rounded-xl transition-all shadow-lg shadow-[#C5A669]/20 hover:shadow-[#C5A669]/30 hover:-translate-y-0.5 font-bold"
            >
              <span>Nueva Familia</span>
            </TextureButton>
          </div>
        </div>

        {/* FILA 2: PÍLDORAS DE FILTROS */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <FilterDropdown
            label="Familias"
            options={statusOptions}
            currentValue={filterStatus}
            onChange={setFilterStatus}
            isOpen={openDropdown === "status"}
            onToggle={() => handleDropdownToggle("status")}
          />

          <FilterDropdown
            label="WhatsApp"
            options={whatsappOptions}
            currentValue={whatsappFilter}
            onChange={setWhatsappFilter}
            isOpen={openDropdown === "whatsapp"}
            onToggle={() => handleDropdownToggle("whatsapp")}
          />

          <FilterDropdown
            label="Etiqueta"
            options={tagOptions}
            currentValue={tagFilter}
            onChange={setTagFilter}
            isOpen={openDropdown === "tag"}
            onToggle={() => handleDropdownToggle("tag")}
          />

          {hasActiveFilters && (
            <div className="pl-2 border-l border-[#EBE5DA] shrink-0">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
              >
                <FilterX size={14} /> Limpiar
              </button>
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
}