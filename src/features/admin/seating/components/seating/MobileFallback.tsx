import { Monitor, ArrowLeft } from "lucide-react";

export default function MobileFallback() {
  return (
    <div className="flex lg:hidden flex-col h-[calc(100svh-4rem-1px)] items-center justify-center bg-[#FDFBF7] rounded-2xl px-6 border border-[#EBE5DA] relative overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#C5A669_0%,transparent_25%)] opacity-5 pointer-events-none" />

      <div className="relative flex items-center justify-center gap-4 mb-8">
        <div className="relative bg-white p-5 rounded-3xl shadow-lg border border-[#EBE5DA] z-10">
          <Monitor size={56} className="text-[#C5A669]" strokeWidth={1.5} />
          <div className="absolute -top-3 -right-3 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-[3px] border-white shadow-sm">
            <span className="text-sm font-bold">!</span>
          </div>
        </div>
      </div>

      <h2 className="font-serif text-3xl font-bold text-[#2C2C29] text-center mb-4">
        Diseñado para
        <br />
        pantallas grandes
      </h2>

      <p className="text-[15px] text-[#5A5A5A] text-center max-w-sm leading-relaxed mb-10">
        El diseñador de planos requiere de una computadora para funcionar
        correctamente. Arrastra mesas, asigna invitados y organiza tu evento con
        mayor precisión.
      </p>

      <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#EBE5DA] bg-white w-full max-w-sm mb-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="p-2.5 bg-[#F9F7F2] rounded-xl border border-[#EBE5DA] shrink-0 mt-0.5">
          <Monitor size={20} className="text-[#C5A669]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[15px] text-[#2C2C29] mb-1">
            Abre desde tu computadora
          </span>
          <span className="text-xs text-[#A8A29E] leading-relaxed">
            Recomendamos utilizar pantallas de 1024px o de mayor tamaño.
          </span>
        </div>
      </div>

      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#EBE5DA] bg-white text-[#5A5A5A] text-sm font-bold hover:bg-[#F9F7F2] hover:text-[#2C2C29] hover:border-[#C5A669]/50 transition-all shadow-sm"
      >
        <ArrowLeft size={16} />
        Volver atrás
      </button>
    </div>
  );
}
