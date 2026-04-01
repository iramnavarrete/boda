import { AlertCircle } from "lucide-react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-paper font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.4] bg-[url('/img/textures/cream-paper.png')] pointer-events-none mix-blend-multiply" />

      <div className="relative z-10 bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgba(44,44,41,0.04)] border border-sand-200 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
          <AlertCircle size={36} strokeWidth={1.5} />
        </div>

        <h1 className="text-4xl font-serif text-charcoal-800 mb-3">
          No Encontrado
        </h1>

        <p className="text-stone-custom mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe o{" "}
          <strong className="text-charcoal-800">no tienes los permisos</strong>{" "}
          necesarios para visualizarla.
        </p>

        <button
          onClick={() => {
            if (router.asPath.includes("/admin")) {
              router.replace("/admin")
            }
            else {
              router.replace("/");
            }
          }}
          className="inline-flex items-center justify-center px-8 py-3.5 bg-gold-500 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold-600 transition-colors shadow-md hover:shadow-lg"
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
}
