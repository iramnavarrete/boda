"use client";

import React from "react";
import { Activity, SearchX } from "lucide-react";

interface ActivityEmptyStateProps {
  variant: "no-data" | "no-results";
}

/**
 * Estado vacío unificado para el grid de actividades.
 * Misma estética que `FamiliesGridView` (círculo dorado + título serif).
 */
const ActivityEmptyState: React.FC<ActivityEmptyStateProps> = ({ variant }) => {
  const isNoResults = variant === "no-results";

  return (
    <div className="relative flex flex-col items-center justify-center py-24 px-4 bg-white/80 rounded-3xl border border-dashed border-sand shadow-[0_2px_10px_-5px_rgba(44,44,41,0.05)]">
      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gold/10 rounded-full blur-xl scale-150" />
          <div className="relative bg-paper/30 p-5 rounded-full border border-sand shadow-sm">
            {isNoResults ? (
              <SearchX className="h-10 w-10 text-gold" strokeWidth={1.5} />
            ) : (
              <Activity className="h-10 w-10 text-gold" strokeWidth={1.5} />
            )}
          </div>
        </div>
        <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">
          {isNoResults
            ? "No se encontraron actividades."
            : "Aún no hay actividad registrada."}
        </h3>
        <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
          {isNoResults
            ? "Ninguna actividad coincide con tu búsqueda o filtros actuales. Intenta limpiarlos para ver el listado completo."
            : "Cuando los invitados abran, confirmen o rechacen la invitación, sus movimientos aparecerán aquí."}
        </p>
      </div>
    </div>
  );
};

export default ActivityEmptyState;