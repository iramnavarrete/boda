import React from "react";
import { Users, CheckCircle2, Clock, XCircle, TrendingUp } from "lucide-react";
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
      min-w-[120px] lg:w-full 
      bg-white p-4 rounded-2xl 
      border border-sand 
      shadow-sm relative overflow-hidden group 
      transition-all duration-300 shrink-0
      hover:shadow-md hover:-translate-y-0.5 hover:z-10
      ${borderHoverClass || "hover:border-gold/50"}
    `}
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        <p className="text-[10px] font-bold text-stone-light uppercase tracking-widest mb-1 whitespace-nowrap">
          {title}
        </p>
        <span className="text-2xl font-serif font-bold text-charcoal leading-none">
          {value}
        </span>
      </div>

      {/* Icono de Fondo (Marca de agua) */}
      <div
        className={`absolute -right-2 -bottom-2 opacity-[0.08] ${colorClass} group-hover:scale-110 group-hover:opacity-15 transition-all duration-500`}
      >
        {React.cloneElement(icon, { size: 50 })}
      </div>
    </div>
  );
};

export default function StatsSidebar({ stats }: StatsSidebarProps) {
  return (
    <div className="flex flex-col gap-2.5 w-full lg:w-32 font-sans">

      {/* CONTENEDOR FLEXIBLE: Scroll horizontal en móvil, Columna en Desktop */}
      {/* UPDATE: Agregado 'lg:overflow-visible' para evitar que se corten las sombras en desktop */}
      <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 pt-2 md:pt-0">
        {/* CARD PRINCIPAL (TOTAL) - Estilo Dark Stone/Charcoal */}
        {/* UPDATE: Agregado 'hover:z-10' para manejo correcto de apilamiento */}
        <div className="min-w-[120px] lg:w-full bg-charcoal text-white p-4 rounded-2xl shadow-md md:shadow-lg shadow-charcoal/20 relative overflow-hidden shrink-0 flex flex-col justify-center min-h-[85px] group border border-charcoal hover:z-10 transition-all">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gold rounded-full blur-[40px] opacity-20 -mr-4 -mt-4 group-hover:opacity-30 transition-opacity"></div>

          <div className="absolute -top-2 -right-2 p-2 opacity-10 text-white group-hover:scale-110 transition-transform duration-500">
            <Users size={56} />
          </div>

          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">
            Total
          </p>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-3xl font-serif font-bold leading-none text-white">
              {stats.total}
            </p>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-transparent opacity-80"></div>
        </div>

        {/* CARDS SECUNDARIAS */}

        {/* Confirmados */}
        <StatCard
          title="Confirmados"
          value={stats.confirmed}
          icon={<CheckCircle2 />}
          colorClass="text-green-700"
          borderHoverClass="hover:border-green-300"
        />

        {/* Pendientes */}
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={<Clock />}
          colorClass="text-gold-700" // Gold
          borderHoverClass="hover:border-gold/50"
        />

        {/* Rechazados */}
        <StatCard
          title="Rechazados"
          value={stats.rejected}
          icon={<XCircle />}
          colorClass="text-red-700"
          borderHoverClass="hover:border-red-200"
        />
      </div>
    </div>
  );
}