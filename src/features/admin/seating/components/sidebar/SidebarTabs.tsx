import { SeatingFilterType } from "@/types/seating";
import { cn } from "@heroui/theme";
import { LayoutGrid, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface SidebarTabsProps {
  filter: SeatingFilterType;
  setFilter: (val: SeatingFilterType) => void;
}

export function SidebarTabs({ filter, setFilter }: SidebarTabsProps) {
  const tabs: { value: SeatingFilterType; label: string; color: string; Icon: React.ElementType }[] = [
    { value: "all", label: "Todos", color: "text-[#A8A29E]", Icon: LayoutGrid },
    { value: "pending", label: "Pendientes", color: "text-yellow-500", Icon: Clock },
    { value: "action", label: "Atención", color: "text-orange-500", Icon: AlertCircle },
    { value: "assigned", label: "Asignados", color: "text-emerald-500", Icon: CheckCircle },
  ];

  return (
    <div className="flex gap-1.5 mb-2">
      {tabs.map((tab) => {
        const isActive = filter === tab.value;
        const Icon = tab.Icon;

        return (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[10px] font-semibold transition-all border",
              isActive
                ? "bg-white text-[#2C2C29] border-[#EBE5DA] shadow-sm"
                : "bg-[#F9F7F2] text-[#A8A29E] border-transparent hover:text-[#2C2C29]",
            )}
          >
            <Icon size={12} className={cn(tab.color, !isActive && "opacity-50")} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
