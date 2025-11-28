import React from "react";
import { LogOut, BrainCircuit } from "lucide-react";
import { DashboardStats } from "../../../types/types";
interface HeaderProps {
  stats: DashboardStats;
  guestCount: number;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  stats,
  guestCount,
  onLogout
}) => (
  <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-serif font-bold">
            J&Y
          </div>
          <h1 className="text-xl font-serif font-semibold hidden sm:block">
            Panel de Boda
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-stone-500 uppercase tracking-wider">
              Invitados
            </p>
            <p className="font-bold text-yellow-600">
              {stats.confirmed} / {stats.total}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-stone-600"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
    {/* Mobile Stats Bar */}
    <div className="md:hidden bg-stone-100 px-4 py-2 flex items-center justify-between text-sm border-b border-stone-200">
      <div className="flex gap-4">
        <div className="text-center">
          <span className="block font-bold text-stone-800">{guestCount}</span>
          <span className="text-xs text-stone-500">Grupos</span>
        </div>
        <div className="text-center">
          <span className="block font-bold text-stone-800">{stats.total}</span>
          <span className="text-xs text-stone-500">Plazas</span>
        </div>
        <div className="text-center">
          <span className="block font-bold text-green-700">
            {stats.confirmed}
          </span>
          <span className="text-xs text-stone-500">OK</span>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
