import { UserCheck, UserMinus, Armchair } from "lucide-react";

interface SidebarStatsProps {
  stats: {
    guests: { total: number; assigned: number; pending: number };
    seats: { total: number; occupied: number; available: number };
  };
}

export function SidebarStats({ stats }: SidebarStatsProps) {
  return (
    <>
      <div className="flex gap-2 mb-2">
        <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 border border-emerald-100/60 rounded-lg shadow-sm">
          <UserCheck size={12} className="text-emerald-600" />
          <span className="text-[9px] md:text-[10px] font-bold text-emerald-700">
            {stats.guests.assigned} asignados
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-amber-50 border border-amber-100/60 rounded-lg shadow-sm">
          <UserMinus size={12} className="text-amber-600" />
          <span className="text-[9px] md:text-[10px] font-bold text-amber-700">
            {stats.guests.pending} pendientes
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 border border-blue-100/60 rounded-lg shadow-sm">
          <Armchair size={12} className="text-blue-600" />
          <span className="text-[9px] md:text-[10px] font-bold text-blue-700">
            Lugares: {stats.seats.occupied} ocupados de {stats.seats.total}
          </span>
        </div>
      </div>
    </>
  );
}
