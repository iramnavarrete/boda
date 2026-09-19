import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTimeAgo } from "@/features/shared/hooks/useTimeAgo";
import { FamilyQuoteMap } from "@/services/familyQuotesService";
import Botanic1 from "@/icons/botanic/botanic1";
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

const getInitials = (name: string) => {
  let parts = name.trim().split(" ");
  parts = parts.filter(
    (el) => el.toLowerCase() !== "&" && el.toLocaleLowerCase() !== "y",
  );
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

/** Altura en px a partir de la cual mostramos el botánico más alto. */
const TALL_BOTANIC_THRESHOLD = 260;

interface FamilyQuoteCardProps {
  msg: FamilyQuoteMap;
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

function FamilyQuoteCardImpl({
  msg,
  onManualToggle,
}: FamilyQuoteCardProps) {
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

  // Detectamos la altura real de la card con ResizeObserver para decidir
  // qué botánico colocar. Container queries con `size` funcionan pero son
  // menos confiables cross-browser que un observer en React.
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isTall, setIsTall] = useState(false);

  // Medición inicial sincrónica (useLayoutEffect) para evitar el flash
  // de botánico incorrecto en el primer paint de cards altas.
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    setIsTall(el.getBoundingClientRect().height >= TALL_BOTANIC_THRESHOLD);
  }, []);

  // Observer para cambios posteriores (ej. badge "Nuevo" aparece/desaparece
  // al togglear leído, lo que altera la altura de la card).
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setIsTall(entry.contentRect.height >= TALL_BOTANIC_THRESHOLD);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`
        relative rounded-2xl group flex flex-col w-full overflow-hidden
        transition-all duration-300 ease-out bg-white/70 shadow-[0_8px_30px_rgba(197,166,105,0.15)] hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(197,166,105,0.22)]
      `}
      onClick={() => onManualToggle(id, false)}
    >
      {/*
        Capa decorativa: botánico dorado siempre presente, detrás de todo.
        Pointer-events-none para no bloquear clicks sobre la card.
        overflow-hidden para que no se desborde al rotar.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden z-0 text-gold-500"
      >
        {isTall ? (
          <Botanic1
            className="absolute -bottom-2 -right-2 w-24 h-44 rotate-[15deg] opacity-[0.07] -translate-x-2"
          />
        ) : (
          <Botanic4
            className="absolute -top-2 -right-3 w-20 h-36 -rotate-[20deg] opacity-[0.09] -translate-x-1"
          />
        )}
      </div>

      <div className="px-5 py-5 md:px-6 md:py-6 flex flex-col flex-1 relative">
        {/* Badge "Nuevo" — más compacto que antes, con animación.
            Posicionado absolute arriba a la derecha; z-10 para quedar
            por encima del botanical. */}
        {!leido && (
          <div className="absolute top-5 right-5 bg-gold-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 z-10 animate-bounce">
            Nuevo
          </div>
        )}

        <div className="text-gold-500 opacity-60 mb-2 relative z-[1]">
          <Quote size={20} className="fill-current" />
        </div>

        <p className="px-2 font-serif text-[15px] md:text-base italic leading-snug mb-5 flex-1 text-stone-custom break-words relative z-[1]">
          {`${mensaje}`}
        </p>

        <div className="flex items-start justify-between pt-3 mt-auto border-t border-sand-200/60 relative z-[1]">
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
