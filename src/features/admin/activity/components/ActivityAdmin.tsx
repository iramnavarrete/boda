"use client";

import { memo } from "react";
import AdminPageShell from "@/features/shared/layouts/admin-page-shell";
import { ActivityProvider } from "../context/ActivityContext";
import ActivityFiltersSidebar from "./ActivityFiltersSidebar";
import ActivityCards from "./ActivityCards";
import ActivityEmptyState from "./ActivityEmptyState";
import Loader from "@/features/front/components/Loader";
import { useActivityContext } from "../context/ActivityContext";

/**
 * Layout principal de la página "Actividad de Invitados".
 *
 * **Patrón de scroll** (igual que `FamiliesMainSection` / `WeddingAdminLayout`):
 * - Root `h-[calc(100svh-65px)] overflow-hidden` (provisto por AdminPageShell).
 * - Header y sidebar permanecen **completamente fijos** (no se mueven).
 * - El contenedor del masonry (`ActivityCards`) es lo ÚNICO que scrollea.
 */
const ActivityLayout = memo(function ActivityLayout() {
  const { groupedActivities, isLoading, hasActiveFilters } =
    useActivityContext();

  return (
    <AdminPageShell
      title={
        <>
          Actividad de{" "}
          <span className="italic text-gold-500 font-light">Invitados</span>
        </>
      }
      subtitle="Visualiza y da seguimiento a todas las actividades de tus invitados."
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start h-full">
        <ActivityFiltersSidebar />

        <main className="flex-1 w-full min-w-0 h-full flex flex-col min-h-0">
          {/* Indicador de filtro activo (no scrollea) */}
          {hasActiveFilters && (
            <h3 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest mb-1.5 ml-1 shrink-0">
              Familias (filtrado)
            </h3>
          )}

          {/* ActivityCards es el ÚNICO elemento con scroll interno */}
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-24 h-full bg-white/80 rounded-3xl border border-dashed border-sand">
                <Loader />
              </div>
            ) : groupedActivities.length === 0 ? (
              <ActivityEmptyState
                variant={hasActiveFilters ? "no-results" : "no-data"}
              />
            ) : (
              <ActivityCards groups={groupedActivities} />
            )}
          </div>
        </main>
      </div>
    </AdminPageShell>
  );
});

export default function ActivityAdmin() {
  return (
    <ActivityProvider>
      <ActivityLayout />
    </ActivityProvider>
  );
}
