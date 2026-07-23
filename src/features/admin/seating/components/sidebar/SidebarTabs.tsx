import { cn } from "@heroui/theme";
import { useSeatingStore } from "../../stores/useSeatingStore"; // Para detectar conflictos

import { FilterType } from "../../hooks/useGuestAssignment";

interface SidebarTabsProps {
  filter: FilterType;
  setFilter: (val: FilterType) => void;
}

export function SidebarTabs({ filter, setFilter }: SidebarTabsProps) {
  return (
    <div className="flex bg-[#F9F7F2] p-1 rounded-lg border border-[#EBE5DA] mb-2 gap-0.5">
      <TabButton active={filter === "all"} onClick={() => setFilter("all")}>
        TODOS
      </TabButton>

      {/* 🟡 Amarillo = Pendientes (0 sentados) */}
      <TabButton
        active={filter === "pending"}
        onClick={() => setFilter("pending")}
        dotColor="bg-yellow-400"
      >
        PENDIENTES
      </TabButton>

      {/* 🟠 Naranja = Acción Requerida (A medias o con declinados) */}
      <TabButton
        active={filter === "action"}
        onClick={() => setFilter("action")}
        dotColor="bg-orange-400"
      >
        ATENCIÓN
      </TabButton>

      {/* 🟢 Verde = Asignados (100% sentados) */}
      <TabButton
        active={filter === "assigned"}
        onClick={() => setFilter("assigned")}
        dotColor="bg-emerald-400"
      >
        ASIGNADOS
      </TabButton>
    </div>
  );
}

// Subcomponente modificado para aceptar el puntito de color (dotColor)
function TabButton({
  active,
  onClick,
  children,
  dotColor,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 text-[9px] font-bold py-1.5 rounded-md transition-all flex items-center justify-center gap-0.5",
        active
          ? "bg-white text-[#2C2C29] shadow-sm"
          : "text-[#A8A29E] hover:text-[#2C2C29]",
      )}
    >
      {/* Si pasamos un color, dibujamos el circulito de la simbología */}
      {dotColor && (
        <span className={cn("w-1.5 h-1.5 rounded-full shadow-sm", dotColor)} />
      )}
      {children}
    </button>
  );
}
