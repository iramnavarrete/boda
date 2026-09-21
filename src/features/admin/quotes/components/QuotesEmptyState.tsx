import { MessageCircle } from "lucide-react";
import Botanic1 from "@/icons/botanic/botanic1";
import Botanic4 from "@/icons/botanic/botanic4";

interface QuotesEmptyStateProps {
  onClear: () => void;
}

/**
 * Empty state para la página de quotes.
 * Se muestra cuando no hay mensajes que coincidan con los filtros/búsqueda.
 *
 * Diseño:
 *  - Contenedor con bordes dashed + bg paper translúcido (integrado con
 *    el entorno sin competirir con el bg principal).
 *  - Dos botánicos decorativos en esquinas opuestas (top-right y
 *    bottom-left) — integrados con el ambiente, no compitiendo con el
 *    contenido central.
 *  - Tamaños y padding escalonados móvil/desktop para que en móvil se vea
 *    proporcional sin ocupar toda la pantalla.
 */
const QuotesEmptyState = ({ onClear }: QuotesEmptyStateProps) => {
  return (
    <div className="relative flex flex-col items-center justify-center text-center py-12 md:py-20 px-4 md:px-6 min-h-[55vh] md:min-h-[60vh] bg-white/50 rounded-2xl md:rounded-[2rem] border border-dashed border-sand-200 overflow-hidden">
      {/* Botánicos decorativos — esquinas opuestas para enmarcar el
          contenido sin distraer. opacity baja para que se integren al
          fondo paper del entorno. */}
      <Botanic4
        aria-hidden
        className="pointer-events-none absolute top-4 -right-9 w-36 h-36 -rotate-[40deg] text-gold-500/30"
      />
      <Botanic1
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-4 w-20 md:w-28 h-32 md:h-44 rotate-[30deg] text-gold-500/25"
      />

      <div className="relative z-10 flex flex-col items-center max-w-xs">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/80 rounded-full flex items-center justify-center text-stone-400 mb-3 md:mb-4 border border-sand-200 shadow-sm">
          <MessageCircle size={26} strokeWidth={1.5} />
        </div>
        <h3 className="font-serif text-lg md:text-2xl text-charcoal-800 mb-1.5 md:mb-2">
          Ningún mensaje encontrado
        </h3>
        <p className="text-xs md:text-sm text-stone-custom leading-relaxed">
          Intenta cambiar los filtros o los términos de búsqueda.
        </p>
        <button
          onClick={onClear}
          className="mt-4 md:mt-6 px-5 md:px-6 py-1.5 md:py-2 bg-white border border-sand-200 rounded-full text-xs md:text-sm font-bold hover:text-gold-500 transition-colors shadow-sm"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default QuotesEmptyState;
