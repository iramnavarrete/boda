import { MessageCircle } from "lucide-react";

interface QuotesEmptyStateProps {
  onClear: () => void;
}

/**
 * Empty state para la página de quotes.
 * Se muestra cuando no hay mensajes que coincidan con los filtros/búsqueda.
 */
const QuotesEmptyState = ({ onClear }: QuotesEmptyStateProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-white/50 rounded-[2rem] border border-dashed border-sand-200">
      <div className="w-16 h-16 bg-white/70 rounded-full flex items-center justify-center text-stone-300 mb-4 border border-sand-200">
        <MessageCircle size={32} strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-2xl text-charcoal-800 mb-2">
        Ningún mensaje encontrado
      </h3>
      <p className="text-stone-custom">
        Intenta cambiar los filtros o los términos de búsqueda.
      </p>
      <button
        onClick={onClear}
        className="mt-6 px-6 py-2 bg-white border border-sand-200 rounded-full text-sm font-bold hover:text-gold-500 transition-colors shadow-sm"
      >
        Limpiar filtros
      </button>
    </div>
  );
};

export default QuotesEmptyState;
