import { useTimeAgo } from "@/features/shared/hooks/useTimeAgo";
import { GuestQuote } from "@/types";
import { Mail, MailOpen, Quote, Sparkles } from "lucide-react";

const getInitials = (name: string) => {
  let parts = name.trim().split(" ");
  parts = parts.filter(el => el.toLowerCase() !== '&' && el.toLocaleLowerCase() !== 'y')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

interface GuestQuoteCardProps {
  msg: GuestQuote;
  onManualToggle: (id: string, currentStatus: boolean) => void;
}

export default function GuestQuoteCard({
  msg,
  onManualToggle,
}: GuestQuoteCardProps) {
  const { leido } = msg;
  const timeAgo = useTimeAgo(msg.timestamp);

  return (
    <div
      className={`
        relative rounded-[20px] group flex flex-col w-full overflow-hidden
        transition-[box-shadow,transform] duration-300 bg-white/70 shadow-[0_8px_30px_rgba(197,166,105,0.15)] hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(197,166,105,0.22)]
      `}
      // Si hace click en la tarjeta lo marcamos como leído en automático
      onClick={() => onManualToggle(msg.id, false)}
    >
      <div className="p-6 md:p-8 flex flex-col flex-1 relative">
        {!leido && (
          <div className="absolute top-4 right-4 bg-gold-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1 z-10 animate-bounce">
            <Sparkles size={10} /> Nuevo
          </div>
        )}

        <div className="text-gold-500 opacity-60 mb-4">
          <Quote size={24} className="fill-current" />
        </div>

        <p className="font-serif text-lg md:text-xl italic leading-relaxed mb-8 flex-1 text-stone-custom">
          {`${msg.mensaje}`}
        </p>

        <div className="flex items-start justify-between pt-5 mt-auto border-t border-sand-200/60">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-sm bg-gold-500 text-white shrink-0">
              {getInitials(msg.autor)}
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-charcoal-800 text-sm tracking-wide uppercase">
                {msg.autor}
              </p>

              {/* Alineamos el Rol y la Fecha uno arriba del otro (o al lado si prefieres) */}
              <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold mt-0.5">
                {msg.parentesco}
              </span>

              <span className="text-[11px] text-stone-400 mt-1 capitalize-first">
                {timeAgo || msg.fecha}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onManualToggle(msg.id, leido || false);
            }}
            className={`p-3 rounded-full transition-colors z-20 ml-2 shrink-0 ${
              leido
                ? "text-stone-300 hover:text-gold-500 hover:bg-white"
                : "text-gold-500 bg-white shadow-sm border border-sand-200 hover:bg-gold-500 hover:text-white"
            }`}
            title={leido ? "Marcar como no leído" : "Marcar como leído"}
          >
            {leido ? <MailOpen size={18} /> : <Mail size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
