import { memo } from "react";
import { useTimeAgo } from "@/features/shared/hooks/useTimeAgo";
import { FamilyQuoteMap } from "@/services/familyQuotesService";
import Botanic1 from "@/icons/botanic/botanic1";
import Botanic3 from "@/icons/botanic/botanic3";
import Botanic4 from "@/icons/botanic/botanic4";
import {
  CheckCircle2,
  Mail,
  MailOpen,
  Quote,
  XCircle,
  UserMinus,
  Tag,
} from "lucide-react";
import { useBotanicLevel, useElementRef } from "../hooks/useBotanicLevel";

const getInitials = (name: string) => {
  let parts = name.trim().split(" ");
  parts = parts.filter(
    (el) => el.toLowerCase() !== "&" && el.toLocaleLowerCase() !== "y",
  );
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

interface FamilyQuoteCardProps {
  msg: FamilyQuoteMap;
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

function FamilyQuoteCardImpl({ msg, onManualToggle }: FamilyQuoteCardProps) {
  const {
    leido,
    asistencia,
    autor,
    fechaCreacion,
    id,
    mensaje,
    parentesco,
    fechaModificacion,
  } = msg;
  const timeAgo = useTimeAgo(fechaModificacion);

  const cardRef = useElementRef<HTMLDivElement>();
  const botanicLevel = useBotanicLevel(cardRef);

  return (
    <div
      ref={cardRef}
      className={`
        relative rounded-2xl group flex flex-col w-full overflow-hidden
        transition-all duration-300 ease-out bg-white/70 shadow-[0_2px_15px_rgba(197,166,105,0.15)] hover:-translate-y-1 hover:shadow-[0_2px_20px_rgba(197,166,105,0.22)]
      `}
      onClick={() => onManualToggle(id, false)}
    >
      <div className="px-5 py-5 md:px-6 md:py-6 flex flex-col flex-1 relative">
        <div className="relative">
          {!leido && (
            <div className="absolute top-0 right-0 bg-gold-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 z-10 animate-bounce">
              Nuevo
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-visible z-0 text-gold-500"
          >
            {botanicLevel === "short" && (
              <Botanic4 className="absolute -top-2 -right-3 w-16 h-24 -rotate-[20deg] opacity-[0.3] -translate-x-1" />
            )}
            {botanicLevel === "tall" && (
              <Botanic1 className="absolute -bottom-2 -right-2 w-24 h-44 rotate-[15deg] opacity-[0.25] -translate-x-2" />
            )}
          </div>

          <div className="text-gold-500 opacity-60 mb-2 relative z-[1]">
            <Quote size={20} className="fill-current" />
          </div>

          <p className="px-2 font-serif text-[15px] md:text-base italic leading-snug mb-5 flex-1 text-stone-custom break-words relative z-[1]">
            {`${mensaje}`}
          </p>
        </div>

        <div className="flex items-start justify-between pt-3 mt-auto border-t border-sand-200/60 relative z-[1] bg-[#fdfdfb]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shadow-sm bg-gold-500 text-white">
                {getInitials(autor)}
              </div>

              {/* Badges de Asistencia (Manejando el estado "deleted") */}
              {asistencia === true ? (
                <div
                  title="Asistencia confirmada"
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm cursor-help"
                >
                  <CheckCircle2
                    size={14}
                    className="text-green-500 bg-green-50 rounded-full"
                  />
                </div>
              ) : asistencia === false ? (
                <div
                  title="No podrá asistir"
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm cursor-help"
                >
                  <XCircle
                    size={14}
                    className="text-red-500 bg-red-50 rounded-full"
                  />
                </div>
              ) : asistencia === "deleted" ? (
                <div
                  title="Familia eliminada de la lista"
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm cursor-help"
                >
                  <UserMinus
                    size={12}
                    className="text-stone-400 bg-stone-100 rounded-full p-0.5"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex flex-col min-w-0">
              {/* Nombre + parentesco como span inline al final del nombre.
                  El span del parentesco NO debe robarle espacio al nombre
                  (flex-wrap permite bajar de línea si no entra). */}
              <h3
                title={autor}
                className="font-bold text-charcoal-800 text-[12px] tracking-wide uppercase inline-flex items-baseline gap-1.5 flex-wrap"
              >
                <span className="whitespace-nowrap">{autor}</span>
                {parentesco && parentesco !== "Invitado" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border bg-[#FDFBF7] text-gold border-gold/30 normal-case tracking-wider shrink-0">
                    <Tag size={9} className="shrink-0" />
                    {parentesco}
                  </span>
                )}
              </h3>

              <span className="text-[10px] text-stone-400 mt-0.5">
                {timeAgo || fechaCreacion}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onManualToggle(id, leido || false);
            }}
            className={`p-2 rounded-full transition-colors z-20 ml-2 shrink-0 ${
              leido
                ? "text-stone-300 hover:text-gold-500 hover:bg-white"
                : "text-gold-500 bg-white shadow-sm border border-sand-200 hover:bg-gold-500 hover:text-white"
            }`}
            title={leido ? "Marcar como no leído" : "Marcar como leído"}
          >
            {leido ? <MailOpen size={16} /> : <Mail size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Memoizado: masonic desmonta/remonta cards al scrollear fuera/ dentro
 * del viewport. Sin memo, el `useTimeAgo` interno reinicia su estado y
 * se produce un flash visible. Con memo + `key` estable por `msg.id`,
 * React reusa la instancia DOM existente y se evita el parpadeo.
 */
const FamilyQuoteCard = memo(FamilyQuoteCardImpl);
FamilyQuoteCard.displayName = "FamilyQuoteCard";

export default FamilyQuoteCard;
