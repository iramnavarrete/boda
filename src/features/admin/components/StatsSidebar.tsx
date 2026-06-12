import React from "react";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { DashboardStats } from "@/types";

interface StatsSidebarProps {
  stats: DashboardStats;
}

const StatCard = ({
  title,
  value,
  icon,
  colorClass,
  borderHoverClass,
}: any) => {
  return (
    <div
      className={`
      min-w-[100px] lg:w-full
      bg-white/90 p-3 rounded-xl
      border border-sand
      shadow-sm relative overflow-hidden group
      transition-all duration-300 shrink-0
      hover:shadow-md hover:-translate-y-0.5 hover:z-10
      ${borderHoverClass || "hover:border-gold/50"}
    `}
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        <p className="text-[9px] font-bold text-stone-light uppercase tracking-widest mb-0.5 whitespace-nowrap">
          {title}
        </p>
        <span className="text-xl font-nourdMedium font-bold text-charcoal leading-none">
          {value}
        </span>
      </div>

      {/* Icono de Fondo (Marca de agua) */}
      <div
        className={`absolute -right-1 -bottom-1 opacity-[0.08] ${colorClass} group-hover:scale-110 group-hover:opacity-15 transition-all duration-500`}
      >
        {React.cloneElement(icon, { size: 40 })}
      </div>
    </div>
  );
};

export default function StatsSidebar({ stats }: StatsSidebarProps) {
  return (
    <div className="flex flex-col gap-2 w-full lg:w-32 font-sans">

      {/* CONTENEDOR FLEXIBLE: Scroll horizontal en móvil, Columna en Desktop */}
      <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="min-w-[100px] lg:w-full bg-primary-800/90 text-white p-3 rounded-xl shadow-md shadow-charcoal/20 relative overflow-hidden shrink-0 flex flex-col justify-center min-h-[70px] group border border-primary hover:z-10 transition-all">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-gold rounded-full blur-[30px] opacity-20 -mr-2 -mt-2 group-hover:opacity-30 transition-opacity"></div>

          <div className="absolute -top-1 -right-1 p-1.5 opacity-10 text-white group-hover:scale-110 transition-transform duration-500">
            <Users size={40} />
          </div>

          <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-0.5 relative z-10">
            Total
          </p>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-2xl font-nourdMedium font-bold leading-none text-white">
              {stats.total}
            </p>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold to-transparent opacity-80"></div>
        </div>

        {/* CARDS SECUNDARIAS */}

        {/* Confirmados */}
        <StatCard
          title="Confirmados"
          value={stats.confirmed}
          icon={<CheckCircle2 />}
          colorClass="text-primary"
          borderHoverClass="hover:border-primary-300"
        />

        {/* Pendientes */}
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={<Clock />}
          colorClass="text-gold"
          borderHoverClass="hover:border-gold/50"
        />

        {/* Rechazados */}
        <StatCard
          title="Rechazados"
          value={stats.rejected}
          icon={<XCircle />}
          colorClass="text-danger-700"
          borderHoverClass="hover:border-danger-300"
        />
      </div>
    </div>
  );
}