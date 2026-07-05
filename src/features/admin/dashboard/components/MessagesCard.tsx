import React from "react";
import { MessageCircle, ArrowRight, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useTimeAgo } from "@/features/shared/hooks/useTimeAgo";
import { useDashboardMessages } from "../hooks/useDashboardMessages";
import DashboardCard from "./DashboardCard";
import Loader from "@/features/front/components/Loader";
import Link from "next/link";

const MessagesCard: React.FC<{ quotesRoute: string }> = ({ quotesRoute }) => {
  const {
    messages,
    currentMessage,
    isLoading,
    currentIndex,
    nextSlide,
    prevSlide,
    goToSlide,
  } = useDashboardMessages();

  // Uso del hook de tiempo (se actualiza cuando cambia el mensaje actual)
  const timeAgoString = useTimeAgo(currentMessage?.fechaModificacion);

  // Obtener iniciales del autor para el estilo editorial
  const getInitials = (name: string) => {
    if (!name) return "";
    const cleanName = name.replace("Familia", "").replace("Primos", "").trim();
    const words = cleanName.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  return (
    <DashboardCard
      icon={MessageCircle}
      title="Muro de Deseos"
      subtitle="Mensajes de tus invitados"
      className="h-80"
      headerRight={
        <Link 
          href={quotesRoute} 
          className="hidden md:flex text-[10px] font-bold text-[#C5A669] hover:text-[#2C3627] transition-colors items-center gap-1 uppercase tracking-widest bg-[#FDFBF7] border border-[#EBE5DA] px-3 py-1.5 rounded-full shadow-sm"
        >
          Ver Todos <ArrowRight size={12} />
        </Link>
      }
    >
      {isLoading ? (
        <Loader />
      ) : !currentMessage ? (
        <div className="flex-1 flex items-center justify-center text-stone-400 text-xs italic">
          No hay mensajes disponibles
        </div>
      ) : (
        <>
          <div className="absolute top-0 left-2 text-[#C5A669]/20 pointer-events-none z-0">
            <Quote size={50} className="transform rotate-180" />
          </div>

          <div
            className="flex-1 flex flex-col animate-in fade-in duration-500 relative w-full min-h-0 z-10"
            key={currentMessage.id}
          >
            {/* Mensaje - Arriba (Alineado a la izquierda, separado del autor) */}
            <div className="flex flex-1 items-center overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#EBE5DA] min-h-0">
              <p className="text-[#5A5A5A] font-serif text-[16px] italic leading-relaxed break-words text-left pl-6 relative z-10 pt-4">
                &quot;{currentMessage.mensaje}&quot;
              </p>
            </div>

            {/* Autor y Controles - Abajo (Horizontal) */}
            <div className="flex items-end justify-between pt-2 mt-2 border-t border-[#EBE5DA]/60 shrink-0">
              {/* Controles del Carrusel integrados a la derecha */}
              {messages.length > 1 && (
                <div className="flex items-center gap-4 shrink-0 pl-2 sm:pl-4">
                  {/* Paginación Dots */}
                  <div className="hidden sm:flex gap-1.5">
                    {messages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? "w-5 bg-[#C5A669]"
                            : "w-1.5 bg-[#EBE5DA] hover:bg-[#C5A669]/50"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Flechas */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={prevSlide}
                      className="p-1.5 rounded-full border border-[#EBE5DA] text-[#A8A29E] hover:text-[#C5A669] hover:border-[#C5A669] hover:bg-[#FDFBF7] transition-all active:scale-95 shadow-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="p-1.5 rounded-full border border-[#EBE5DA] text-[#A8A29E] hover:text-[#C5A669] hover:border-[#C5A669] hover:bg-[#FDFBF7] transition-all active:scale-95 shadow-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Autor con iniciales */}
              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FDFBF7] border border-[#C5A669]/30 flex items-center justify-center shadow-sm shrink-0">
                  <span className="font-serif text-[#C5A669] text-sm sm:text-base font-bold">
                    {getInitials(currentMessage.autor)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#2C3627] uppercase tracking-[0.2em] leading-tight">
                    {currentMessage.autor}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-[#A8A29E] font-medium uppercase tracking-[0.15em] mt-0.5">
                    {timeAgoString}
                  </span>
                </div>
              </div>
            </div>

            <Link 
              href={quotesRoute} 
              className="md:hidden mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-[10px] font-bold text-[#C5A669] uppercase tracking-widest hover:bg-[#F9F7F2] transition-colors shadow-sm shrink-0 active:scale-[0.98]"
            >
              Ver todos los mensajes <ArrowRight size={14} />
            </Link>
            
          </div>
        </>
      )}
    </DashboardCard>
  );
};

export default React.memo(MessagesCard);