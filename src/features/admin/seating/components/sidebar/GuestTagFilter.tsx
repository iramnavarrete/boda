import { cn } from "@heroui/theme";
import { TagFilterType } from "@/types";
import { Tag } from "lucide-react";

interface GuestTagFilterProps {
  tagFilter: TagFilterType;
  setTagFilter: (val: TagFilterType) => void;
}

export function GuestTagFilter({
  tagFilter,
  setTagFilter
}: GuestTagFilterProps) {
  const tabs: { value: TagFilterType; label: string; color: string }[] = [
    { value: "all", label: "Todos", color: "text-[#A8A29E]" },
    { value: "Novia", label: "Novia", color: "text-pink-400" },
    { value: "Novio", label: "Novio", color: "text-blue-400" },
    { value: "Ambos", label: "Ambos", color: "text-purple-400" },
  ];

  return (
    <div className="flex gap-1.5 mb-3">
      {tabs.map((tab) => {
        const isActive = tagFilter === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => setTagFilter(tab.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[10px] font-semibold transition-all border",
              isActive
                ? "bg-white text-[#2C2C29] border-[#EBE5DA] shadow-sm"
                : "bg-[#F9F7F2] text-[#A8A29E] border-transparent hover:text-[#2C2C29]",
            )}
          >
            <Tag size={12} className={cn(tab.color)} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
