"use client";

import { Users, User } from "lucide-react";
import { cn } from "@heroui/theme";

export type ViewMode = "family" | "guest";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

const OPTIONS: { value: ViewMode; label: string; Icon: React.ElementType }[] = [
  { value: "family", label: "Familias", Icon: Users },
  { value: "guest", label: "Personas", Icon: User },
];

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="flex gap-1 p-1 bg-[#F9F7F2] rounded-lg border border-[#EBE5DA] mb-2"
      role="tablist"
      aria-label="Modo de visualización del sidebar"
    >
      {OPTIONS.map(({ value: opt, label, Icon }) => {
        const isActive = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all border",
              isActive
                ? "bg-white text-[#2C2C29] border-[#EBE5DA] shadow-sm"
                : "bg-transparent text-[#A8A29E] border-transparent hover:text-[#2C2C29]",
            )}
          >
            <Icon
              size={12}
              className={cn(isActive ? "text-[#C5A669]" : "opacity-50")}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
