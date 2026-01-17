import React from "react";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { DashboardStats } from "@/types";

interface StatsSidebarProps {
  stats: DashboardStats;
}

const StatCard = ({ title, value, icon, colorClass }: any) => {
  return (
    <div className="min-w-[110px] lg:w-full bg-white p-3 rounded-lg border border-stone-200 shadow-sm relative overflow-hidden group hover:border-stone-300 transition-all shrink-0">
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5 whitespace-nowrap">
          {title}
        </p>
        <span className="text-xl font-bold text-stone-800 leading-none">
          {value}
        </span>
      </div>

      {/* Icono de Fondo (Marca de agua) */}
      <div
        className={`absolute -right-3 -bottom-3 opacity-[0.12] ${colorClass} group-hover:scale-110 group-hover:opacity-20 transition-all duration-500`}
      >
        {React.cloneElement(icon, { size: 45 })}
      </div>
    </div>
  );
};

export default function StatsSidebar({ stats }: StatsSidebarProps) {
  return (
    // En desktop limitamos el ancho a w-56 para que sea columna angosta
    <div className="flex flex-col gap-2.5 w-full lg:w-28">
      {/* CONTENEDOR FLEXIBLE: Scroll horizontal en móvil, Columna en Desktop */}
      <div className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
        {/* CARD PRINCIPAL (TOTAL) */}
        <div className="min-w-[110px] lg:w-full bg-stone-900 text-white p-3 rounded-xl shadow-md relative overflow-hidden shrink-0 flex flex-col justify-center min-h-[70px]">
          <div className="absolute -top-1 -right-1 p-2 opacity-10">
            <Users size={48} />
          </div>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
            Total
          </p>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-2xl font-bold leading-none">{stats.total}</p>
            <span className="text-[10px] text-stone-500 font-medium">
              {stats.count} Familias
            </span>
          </div>
        </div>

        {/* CARDS SECUNDARIAS (Ya no necesitan bgClass) */}
        <StatCard
          title="Confirmados"
          value={stats.confirmed}
          icon={<CheckCircle2 />}
          colorClass="text-green-600"
        />

        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={<Clock />}
          colorClass="text-yellow-600"
        />

        <StatCard
          title="Rechazados"
          value={stats.rejected}
          icon={<XCircle />}
          colorClass="text-red-600"
        />
      </div>
    </div>
  );
}
