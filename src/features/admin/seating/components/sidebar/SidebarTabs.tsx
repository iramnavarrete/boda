import { cn } from "@heroui/theme";
import { FilterType } from "../../hooks/useGuestAssignment";

interface SidebarTabsProps {
  filter: FilterType;
  setFilter: (val: FilterType) => void;
}

export function SidebarTabs({ filter, setFilter }: SidebarTabsProps) {
  const tabs: { value: FilterType; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Pendientes" },
    { value: "assigned", label: "Asignados" },
  ];

  return (
    <div className="flex p-1 bg-[#EBE5DA]/40 rounded-lg border border-[#EBE5DA]/60">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setFilter(tab.value)}
          className={cn(
            "flex-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all",
            filter === tab.value
              ? "bg-white text-[#2C2C29] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              : "text-[#A8A29E] hover:text-[#5A5A5A]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
