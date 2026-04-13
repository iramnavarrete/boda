import { CheckSquare, Square, Clock, CheckCircle2, XCircle, Tag } from "lucide-react";
import { Guest } from "@/types";
import { memo, useCallback } from "react";
import DashedSeparator from "./DashedSeparator";
import { cn } from "@heroui/theme";
import { useRouter } from "next/router";
import { GuestActionButtons, GuestLockButton } from "./GuestActionButtons";
import PartialConfirmationBadge from "./PartialConfirmationBadge";

interface GuestsCardsProps {
  guests: Guest[];
  selectedGuests: Set<string>;
  onSelectGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onSendReminder: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
}

interface GuestCardProps {
  guest: Guest;
  isSelected: boolean;
  isAnySelected: boolean;
  invitationId: string | string[] | undefined;
  onSelectGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendWhatsApp: (guest: Guest) => void;
  onSendReminder: (guest: Guest) => void;
  onLockToggle: (guest: Guest) => void;
}

const GuestCard = memo(
  ({
    guest: g,
    isSelected,
    isAnySelected,
    invitationId,
    onSelectGuest,
    onEdit,
    onDelete,
    onSendWhatsApp,
    onSendReminder,
    onLockToggle,
  }: GuestCardProps) => {
    return (
      <div
        onClick={() => (isAnySelected ? onSelectGuest(g.id) : onEdit(g))}
        className={cn(
          "relative flex flex-col bg-white/90 rounded-2xl p-5 cursor-default transition-all duration-300 border-2",
          isSelected
            ? "border-gold shadow-[0_8px_30px_-5px_rgba(197,166,105,0.3)] z-10"
            : "border-sand hover:border-gold/50 hover:shadow-lg hover:shadow-stone-200/50 md:hover:-translate-y-0.5",
        )}
      >
        {/* Header */}
        <div className="flex flex-1 justify-between items-center mb-4 gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectGuest(g.id);
              }}
              className={cn(
                "p-1 rounded-lg transition-all duration-200 shrink-0",
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

            <div>
              <h3 className="font-serif text-base font-bold text-charcoal leading-snug line-clamp-2">
                {g.nombre}
              </h3>
              {g.etiqueta && (
                <span className="inline-flex items-center gap-1 m-0.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-[#EBE5DA] bg-[#FDFBF7] text-[#C5A669]">
                  <Tag size={10} />
                  {g.etiqueta}
                </span>
              )}
              <PartialConfirmationBadge guest={g} />
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0",
              g.asistencia === null
                ? "bg-paper/30 text-gold border-gold/20"
                : g.asistencia === true
                  ? "bg-primary-50 text-primary border-primary-100"
                  : "bg-danger-50 text-danger-700 border-danger-100",
            )}
          >
            {g.asistencia === null ? (
              <Clock size={12} />
            ) : g.asistencia === true ? (
              <CheckCircle2 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            <span>
              {g.asistencia === true ? g.confirmados : 0}/{g.invitados}
            </span>
          </span>
        </div>

        {/* Footer */}
        <fieldset
          disabled={isAnySelected}
          className="disabled:opacity-30 disabled:pointer-events-none transition-all duration-500"
        >
          <DashedSeparator className="m-0 mb-4" />
          <div className="flex justify-between items-center">
            <GuestLockButton
              guest={g}
              onClick={(e) => {
                e.stopPropagation();
                onLockToggle(g);
              }}
            />
            <GuestActionButtons
              guest={g}
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
    prev.guest === next.guest &&
    prev.isSelected === next.isSelected &&
    prev.isAnySelected === next.isAnySelected,
);

GuestCard.displayName = "GuestCard";

const GuestsCards: React.FC<GuestsCardsProps> = ({
  guests,
  selectedGuests,
  onSelectGuest,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onSendReminder,
  onLockToggle,
}) => {
  const { query } = useRouter();
  const isAnySelected = selectedGuests.size > 0;

  const handleSelect   = useCallback((id: string) => onSelectGuest(id), [onSelectGuest]);
  const handleEdit     = useCallback((g: Guest)   => onEdit(g),         [onEdit]);
  const handleDelete   = useCallback((g: Guest)   => onDelete(g),       [onDelete]);
  const handleWhatsApp = useCallback((g: Guest)   => onSendWhatsApp(g), [onSendWhatsApp]);
  const handleReminder = useCallback((g: Guest)   => onSendReminder(g), [onSendReminder]);
  const handleLock     = useCallback((g: Guest)   => onLockToggle(g),   [onLockToggle]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 select-none pb-20">
      {guests.map((g) => (
        <GuestCard
          key={g.id}
          guest={g}
          isSelected={selectedGuests.has(g.id)}
          isAnySelected={isAnySelected}
          invitationId={query.invitationId}
          onSelectGuest={handleSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSendWhatsApp={handleWhatsApp}
          onSendReminder={handleReminder}
          onLockToggle={handleLock}
        />
      ))}
    </div>
  );
};

export default GuestsCards;