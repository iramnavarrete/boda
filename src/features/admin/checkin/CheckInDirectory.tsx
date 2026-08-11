import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Search, XCircle, ChevronRight, Users, UserPlus } from "lucide-react";
import { Family } from "@/types";
import { cn } from "@heroui/theme";

// Definimos los filtros con etiquetas claras en español
const FILTER_TABS = [
  { id: "all", label: "Todos" },
  { id: "pending_entry", label: "Faltan por entrar" },
  { id: "entered", label: "Ya ingresaron" },
  { id: "no_access", label: "Sin acceso" },
];

export default function CheckInDirectory({
  families,
  onSelect,
}: {
  families: Family[];
  onSelect: (f: Family) => void;
}) {
  const router = useRouter();
  const invitationId = router.query.invitationId as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredFamilies = useMemo(() => {
    // 1. Primero filtramos según la búsqueda y el tab activo
    const filtered = families.filter((f) => {
      const matchName = f.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const confirmados = f.confirmados || 0;
      const usados = f.pasesUsados || 0;

      let matchFilter = true;
      if (filter === "pending_entry")
        matchFilter =
          f.asistencia === true && confirmados > 0 && usados < confirmados;
      if (filter === "entered") matchFilter = usados > 0;
      if (filter === "no_access")
        matchFilter =
          f.asistencia === false || f.asistencia === null || confirmados === 0;

      return matchName && matchFilter;
    });

    // 2. Luego ordenamos el resultado para priorizar los que faltan por entrar
    return filtered.sort((a, b) => {
      const getWeight = (f: Family) => {
        const confirmados = f.confirmados || 0;
        const usados = f.pasesUsados || 0;

        // Peso 3: Los enviamos hasta el final (Sin acceso)
        if (
          f.asistencia === false ||
          f.asistencia === null ||
          confirmados === 0
        ) {
          return 3;
        }
        // Peso 2: En medio (Ya ingresaron todos)
        if (usados >= confirmados && confirmados > 0) {
          return 2;
        }
        // Peso 1: Hasta arriba (Faltan por entrar / Ingreso parcial)
        return 1;
      };

      const weightA = getWeight(a);
      const weightB = getWeight(b);

      // Si pertenecen a grupos diferentes, los ordenamos por su peso
      if (weightA !== weightB) {
        return weightA - weightB;
      }

      // Si pertenecen al mismo grupo, los ordenamos alfabéticamente
      return a.nombre.localeCompare(b.nombre);
    });
  }, [families, searchTerm, filter]);

  const isSearching = searchTerm.trim() !== "";

  // 🔥 NUEVO: ESTADO VACÍO ABSOLUTO (0 INVITADOS EN LA BASE DE DATOS)
  if (families.length === 0) {
    return (
      <div className="w-full bg-white rounded-[2rem] border border-[#EBE5DA] shadow-sm p-6 md:p-12 flex flex-col flex-1 items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
        <div className="w-20 h-20 bg-[#FDFBF7] border border-[#EBE5DA] rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Users size={32} className="text-[#C5A669]" />
        </div>
        <h3 className="text-xl md:text-2xl font-serif font-bold text-[#2C2C29] mb-3">
          Aún no tienes invitados
        </h3>
        <p className="text-sm text-[#5A5A5A] max-w-md mb-8 leading-relaxed">
          Para poder registrar el acceso en la puerta, primero necesitas agregar
          invitados a tu evento desde el panel de administración.
        </p>
        <button
          onClick={() => router.push(`/admin/invitations/${invitationId}`)} // Ajusta '/guests' si tu ruta se llama '/invitados'
          className="px-6 py-3.5 bg-[#C5A669] text-white rounded-xl font-bold hover:bg-[#b09255] transition-colors shadow-md shadow-[#C5A669]/20 text-sm flex items-center justify-center gap-2 active:scale-95"
        >
          <UserPlus size={18} />
          Ir a Crear Invitados
        </button>
      </div>
    );
  }

  // SI HAY INVITADOS, RENDERIZAMOS EL DIRECTORIO NORMALMENTE
  return (
    <div className="w-full bg-white rounded-[2rem] border border-[#EBE5DA] shadow-sm p-4 md:p-6 flex flex-col flex-1 min-h-[60vh] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* CABECERA: Buscador y Filtros */}
      <div className="flex flex-col xl:flex-row gap-4 mb-5 shrink-0">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre de invitado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-sm font-medium focus:outline-none focus:border-[#C5A669] focus:ring-1 focus:ring-[#C5A669]/20 transition-all placeholder:text-[#A8A29E] placeholder:font-normal"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 shrink-0 items-center scrollbar-thin scrollbar-thumb-[#EBE5DA]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "px-4 py-2 xl:py-3.5 rounded-xl text-[10px] font-bold uppercase border whitespace-nowrap transition-colors",
                filter === tab.id
                  ? "bg-[#C5A669] border-[#C5A669] text-white shadow-sm"
                  : "bg-[#FDFBF7] border-[#EBE5DA] text-[#A8A29E] hover:text-[#5A5A5A] hover:border-[#C5A669]/30",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* INDICADOR VISUAL DE BÚSQUEDA ACTIVA */}
      {isSearching && (
        <div className="flex items-center justify-between bg-[#F9F7F2] border border-[#EBE5DA] rounded-xl px-4 py-3 mb-4 shrink-0 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-[#C5A669]" />
            <span className="text-xs text-[#5A5A5A]">
              Filtrando resultados para:{" "}
              <strong className="text-[#2C2C29]">&quot;{searchTerm}&quot;</strong>
              <span className="text-[#A8A29E] ml-1 font-medium">
                ({filteredFamilies.length} encontrados)
              </span>
            </span>
          </div>
          <button
            onClick={() => setSearchTerm("")}
            className="text-[#A8A29E] hover:text-[#2C2C29] transition-colors flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider bg-white border border-[#EBE5DA] px-2 py-1 rounded-md shadow-sm"
          >
            <XCircle size={12} /> Limpiar
          </button>
        </div>
      )}

      {/* LISTADO DE INVITADOS */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-[#EBE5DA]">
        {filteredFamilies.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-[#A8A29E] h-full">
            <Users size={32} className="opacity-30 mb-3" />
            <p className="text-sm font-medium text-[#5A5A5A]">
              No se encontraron invitados.
            </p>
            <p className="text-xs mt-1 max-w-xs">
              Verifica que el nombre esté escrito correctamente o intenta
              limpiar los filtros activos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max pb-4">
            {filteredFamilies.map((family) => {
              const isDeclined = family.asistencia === false;
              const isPending = family.asistencia === null;
              const hasEntered = family.asistio === true;

              return (
                <button
                  key={family.id}
                  onClick={() => onSelect(family)}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F9F7F2] rounded-xl border border-transparent hover:border-[#EBE5DA] transition-all text-left group shadow-sm h-full"
                >
                  <div className="flex flex-col pr-4 min-w-0">
                    <span className="font-semibold text-[#2C2C29] truncate">
                      {family.nombre}
                    </span>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {isDeclined ? (
                        <span className="text-[10px] text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase font-bold">
                          Declinado
                        </span>
                      ) : isPending ? (
                        <span className="text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded uppercase font-bold">
                          Pendiente
                        </span>
                      ) : hasEntered &&
                        (family.pasesUsados || 0) >=
                          (family.confirmados || 0) ? (
                        <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded uppercase font-bold">
                          {family.pasesUsados}/{family.confirmados} Ingresaron
                        </span>
                      ) : (family.pasesUsados || 0) > 0 ? (
                        <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase font-bold">
                          Ingreso Parcial ({family.pasesUsados}/
                          {family.confirmados})
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#C5A669] bg-[#FDFBF7] border border-[#EBE5DA] px-1.5 py-0.5 rounded uppercase font-bold">
                          {family.confirmados} Listos
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    className="text-[#A8A29E] group-hover:text-[#C5A669] shrink-0"
                    size={20}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
