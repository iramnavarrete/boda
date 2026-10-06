import { cn } from "@heroui/theme";
import { TagFilterType } from "@/types";
import { Tag } from "lucide-react";
import {
  getEtiquetaOptions,
  getEtiquetaStyle,
} from "@/features/admin/utils/etiquetaPorTipo";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

interface GuestTagFilterProps {
  tagFilter: TagFilterType;
  setTagFilter: (val: TagFilterType) => void;
}

export function GuestTagFilter({
  tagFilter,
  setTagFilter,
}: GuestTagFilterProps) {
  // Tipo de invitación actual — condiciona qué tags se muestran.
  const tipo = useInvitationStore((s) => s.invitationData?.tipo);

  // Tabs dinámicos: "Todos" + cada tag válido para el tipo.
  const specs = getEtiquetaOptions(tipo);
  const tabs: { value: TagFilterType; label: string; color: string }[] = [
    { value: "all", label: "Todos", color: "text-[#A8A29E]" },
    ...specs.map((s) => ({
      value: s.value as TagFilterType,
      label: s.label,
      color: getEtiquetaStyle(s.value).iconColor,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {tabs.map((tab) => {
        const isActive = tagFilter === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => setTagFilter(tab.value)}
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-md text-[10px] font-semibold transition-all border",
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