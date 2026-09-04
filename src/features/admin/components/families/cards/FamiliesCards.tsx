import {
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
} from "lucide-react";
import { Family } from "@/types";
import { memo, useEffect, useRef, useState } from "react";
import DashedSeparator from "../../DashedSeparator";
import { cn } from "@heroui/theme";
import { useRouter } from "next/router";
import {
  FamilyActionButtons,
  FamilyLockButton,
} from "../../FamilyActionButtons";
import PartialConfirmationBadge from "../../PartialConfirmationBadge";
import { isPartialConfirmation } from "@/utils/family";
import { useWeddingAdminContext } from "../../../context/WeddingAdminContext";
import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual";

interface FamilyCardProps {
  families: Family;
  isSelected: boolean;
  isAnySelected: boolean;
  invitationId: string | string[] | undefined;
  onSelectFamily: (id: string) => void;
  onEdit: (family: Family) => void;
  onDelete: (family: Family) => void;
  onSendWhatsApp: (family: Family) => void;
  onSendReminder: (family: Family) => void;
  onLockToggle: (family: Family) => void;
}

const FamilyCard = memo(
  ({
    families: f,
    isSelected,
    isAnySelected,
    invitationId,
    onSelectFamily,
    onEdit,
    onDelete,
    onSendWhatsApp,
    onSendReminder,
    onLockToggle,
  }: FamilyCardProps) => {
    const partial = isPartialConfirmation(f);
    return (
      <div
        onClick={() => (isAnySelected ? onSelectFamily(f.id) : onEdit(f))}
        className={cn(
          "relative flex flex-col bg-white/90 rounded-2xl p-5 pb-3.5 cursor-default transition-all duration-300 border-2 justify-between min-h-44",
          isSelected
            ? "border-gold shadow-[0_8px_30px_-5px_rgba(197,166,105,0.3)] z-10"
            : "border-sand hover:border-gold/50 hover:shadow-lg hover:shadow-stone-200/50 md:hover:-translate-y-0.5",
        )}
      >
        {/* Header */}
        <div className="flex w-full items-start mb-4 gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectFamily(f.id);
            }}
            className={cn(
              "p-1 rounded-lg transition-all duration-200 shrink-0 mt-0.5",
              isSelected
                ? "text-gold bg-paper/30"
                : "text-stone-400 hover:text-gold hover:bg-paper/30",
            )}
          >
            {isSelected ? (
              <CheckSquare size={22} className="drop-shadow-sm" />
            ) : (
              <Square size={22} />
            )}
          </button>

          <div className="flex flex-col w-full min-w-0 gap-1.5">
            <div className="flex justify-between items-start w-full gap-3">
              <h3 title={f.nombre} className="font-serif text-base font-bold text-charcoal leading-snug line-clamp-2">
                {f.nombre}
              </h3>

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0",
                  f.asistencia === null
                    ? "bg-paper/30 text-gold border-gold/20"
                    : f.asistencia === true && partial
                      ? "bg-orange-50 text-orange-800 border-orange-100"
                      : f.asistencia === true && !partial
                        ? "bg-primary-50 text-primary border-primary-100"
                        : "bg-danger-50 text-danger-700 border-danger-100",
                )}
              >
                {f.asistencia === null ? (
                  <Clock size={12} />
                ) : f.asistencia === true ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <XCircle size={12} />
                )}
                <span className="h-max">
                  {f.asistencia === true ? f.confirmados : 0}/{f.invitados}
                </span>
              </span>
            </div>

            {f.etiqueta || isPartialConfirmation(f) ? (
              <div className="flex flex-wrap items-center gap-1">
                {f.etiqueta && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#EBE5DA] bg-[#FDFBF7] text-[#C5A669]">
                    <Tag size={10} />
                    {f.etiqueta}
                  </span>
                )}
                <PartialConfirmationBadge family={f} />
              </div>
            ) : (
              <span className="inline-flex items-center max-w-fit gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-dashed border-[#DDD8D0] text-[#C8C2BA]">
                Sin etiquetas
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <fieldset
          disabled={isAnySelected}
          className="disabled:opacity-30 disabled:pointer-events-none transition-all duration-500 mt-auto"
        >
          <DashedSeparator className="m-0 mb-4" />
          <div className="flex justify-between items-center">
            <FamilyLockButton
              family={f}
              onClick={(e) => {
                e.stopPropagation();
                onLockToggle(f);
              }}
            />
            <FamilyActionButtons
              family={f}
              invitationId={invitationId}
              onSendWhatsApp={onSendWhatsApp}
              onSendReminder={onSendReminder}
              onDelete={onDelete}
            />
          </div>
        </fieldset>
      </div>
    );
  },
  (prev, next) =>
    prev.families === next.families &&
    prev.isSelected === next.isSelected &&
    prev.isAnySelected === next.isAnySelected,
);

FamilyCard.displayName = "FamilyCard";

interface FamiliesCardsProps {
  families: Family[];
}

const FamiliesCards: React.FC<FamiliesCardsProps> = ({ families }) => {
  const {
    selectedFamilies,
    handleSelectFamily,
    handleLockToggle,
    handleEdit,
    handleDeleteFamily,
    whatsapp,
  } = useWeddingAdminContext();

  const { query } = useRouter();
  const isAnySelected = selectedFamilies.size > 0;

  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const calculateColumns = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width >= 1536) setColumns(4);
      else if (width >= 1024) setColumns(3);
      else if (width >= 768) setColumns(2);
      else setColumns(1);
    };

    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, []);

  const rowCount = Math.ceil(families.length / columns);

  // 1. Virtualizador para ESCRITORIO (scroll interno)
  const containerVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 186,
    overscan: 2,
    enabled: !isMobile,
  });

  // 2. Virtualizador para MÓVIL (scroll global de la ventana)
  const windowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 186,
    overscan: 2,
    scrollMargin: parentRef.current ? parentRef.current.offsetTop : 0,
    enabled: isMobile,
  });

  const activeVirtualizer = isMobile ? windowVirtualizer : containerVirtualizer;
  const TOP_SAFE_MARGIN = 16;

  // 🔥 Función para calcular el desplazamiento Y eliminando el hueco en móvil
  const getTransformY = (virtualRowStart: number) => {
    if (isMobile) {
      const margin = parentRef.current ? parentRef.current.offsetTop : 0;
      return virtualRowStart - margin;
    }
    return virtualRowStart + TOP_SAFE_MARGIN;
  };

  return (
    <div
      ref={parentRef}
      className={cn(
        "w-full pr-2 -mr-2 pb-20 md:pb-10",
        isMobile
          ? "h-auto overflow-visible"
          : "h-[calc(100dvh-380px)] md:h-[calc(100dvh-320px)] lg:h-[calc(100dvh-205px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#EBE5DA]",
      )}
    >
      <div
        className="w-full relative"
        style={{
          height: `${activeVirtualizer.getTotalSize()}px`,
        }}
      >
        {activeVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowFamilies = families.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full flex gap-2"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${getTransformY(virtualRow.start)}px)`,
              }}
            >
              {rowFamilies.map((g) => (
                <div
                  key={g.id}
                  className="pb-2"
                  style={{ width: `${100 / columns}%` }}
                >
                  <FamilyCard
                    families={g}
                    isSelected={selectedFamilies.has(g.id)}
                    isAnySelected={isAnySelected}
                    invitationId={query.invitationId}
                    onSelectFamily={handleSelectFamily}
                    onEdit={handleEdit}
                    onDelete={handleDeleteFamily}
                    onSendWhatsApp={(g) => whatsapp.open(g, "initial")}
                    onSendReminder={(g) => whatsapp.open(g, "reminder")}
                    onLockToggle={handleLockToggle}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FamiliesCards;
