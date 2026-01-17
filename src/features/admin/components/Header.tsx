import React from "react";
import { LogOut, Heart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // O tu router preferido

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        {/* IZQUIERDA: Branding / Volver */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")} // O la ruta de tus eventos
            className="md:hidden p-2 text-stone-400 hover:text-stone-600"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-[#C5A669]">
              <Heart className="fill-current" size={16} />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-stone-800 leading-none">
                Boda X&J
              </h1>
              <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider hidden sm:block">
                Panel de Administración
              </p>
            </div>
          </div>
        </div>

        {/* DERECHA: Acciones Globales */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 mr-4 px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-stone-500 font-medium">En línea</span>
          </div>

          <div className="h-6 w-px bg-stone-200 mx-2 hidden md:block"></div>

          <button
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
