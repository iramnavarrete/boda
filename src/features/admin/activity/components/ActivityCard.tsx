"use client";

import React, { memo } from "react";
import { Users, Filter, Clock } from "lucide-react";
import { cn } from "@heroui/theme";
import type { FamilyActivity, ActivityActionType } from "@/types";
import type { ActivityGroup } from "../types";
import { ACTIVITY_VISUAL, FILTER_VISUAL } from "../utils/activityLabels";
import { useActivityContext } from "../context/ActivityContext";
import { SCROLL_CARD_HEIGHT } from "../hooks/layoutConstants";
import { StatusIconCircle, TimeAgoStamp } from ".";

interface ActivityItemRowProps {
  activity: FamilyActivity;
}

const ActivityItemRow: React.FC<ActivityItemRowProps> = memo(
  ({ activity }) => {
    const visual = ACTIVITY_VISUAL[activity.action];

    return (
      <div className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
        <StatusIconCircle action={activity.action} size="sm" />

        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-charcoal font-medium leading-tight truncate">
            {visual.label(activity)}
          </p>
          <TimeAgoStamp
            timestamp={activity.timestamp}
            className="text-[10px] text-stone-400 font-medium mt-0.5"
          />
        </div>
      </div>
    );
  },
);
ActivityItemRow.displayName = "ActivityItemRow";

export interface ActivityCardProps {
  group: ActivityGroup;
}

const ActivityCard: React.FC<ActivityCardProps> = memo(({ group }) => {
  const { familyName, activities, hiddenBreakdown } = group;
  const count = activities.length;
  const hasScroll = count > 4;

  // ── Datos de filtro para el badge "Filtrado · X" ──
  const { filterStatus } = useActivityContext();
  const filterVisual = FILTER_VISUAL[filterStatus];
  const isUnansweredFilter = filterStatus === "unanswered";

  // ── Conteo y desglose de actividades ocultas ──
  const hiddenEntries = Object.entries(hiddenBreakdown) as [
    ActivityActionType,
    number,
  ][];
  const hiddenTotal = hiddenEntries.reduce(
    (sum, [, n]) => sum + (n as number),
    0,
  );
  // "Filtrado · X" solo aparece si hay actividades OCULTAS por el filtro.
  // Para "unanswered" no aplica (no hay confirm/decline que ocultar).
  const hasHidden = hiddenTotal > 0 && filterVisual !== null && !isUnansweredFilter;

  return (
    <div
      className={cn(
        // Estilo visual consistente con FamilyCard, pero SIN min-height
        // para que masonic mida la altura natural exacta vía ResizeObserver.
        "flex flex-col bg-white/90 rounded-2xl p-5 pb-3.5 border-2 border-sand",
        "transition-shadow duration-200",
        "hover:border-gold/50 hover:shadow-lg hover:shadow-stone-200/50",
        "w-full box-border",
      )}
      style={
        hasScroll
          ? { height: `${SCROLL_CARD_HEIGHT}px` }
          : undefined
      }
    >
      {/* ── Header: nombre arriba (sin truncar), badge como subtítulo ── */}
      <div className="flex w-full items-start mb-4 gap-3">
        {/* Avatar familia */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-[#FDFBF7] border border-[#EBE5DA] flex items-center justify-center mt-0.5">
          <Users size={18} className="text-gold" />
        </div>

        <div className="flex flex-col w-full min-w-0 gap-1">
          {/* Nombre completo (sin truncamiento) */}
          <h3
            title={familyName}
            className="font-serif text-[15px] font-bold text-charcoal leading-snug whitespace-normal break-words"
          >
            {familyName}
          </h3>

          {/* Badge "X actividades" como subtítulo debajo del nombre */}
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            <span className="self-start inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-[#FDFBF7] text-gold border-gold/30">
              {count} {count === 1 ? "actividad" : "actividades"}
            </span>

            {/* Badge "Filtrado · X" cuando hay filtro activo */}
            {hasHidden && filterVisual && (
              <span
                className={cn(
                  "self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border italic",
                  filterVisual.badgeClass,
                )}
                title="Esta familia tiene otras actividades que no se muestran por el filtro activo"
              >
                <Filter size={9} className="shrink-0" />
                Filtrado · {filterVisual.shortLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body: contiene 3 bloques en flex-col ──
          1. Lista de actividades (scrollable si hay muchas)
          2. Placeholder "Esperando confirmación" (siempre visible)
          3. Badge "+N ocultas" (siempre visible)
          Los badges están FUERA del scroll para que el admin no tenga que
          scrollear dentro de la card para verlos. */}
      <div className="border-t border-dashed border-[#EBE5DA] pt-3 flex-1 min-h-0 flex flex-col">
        {/* 1. Activities — área scrollable cuando hay >4 actividades */}
        <div
          className={cn(
            "flex-1 min-h-0",
            hasScroll
              ? "overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#EBE5DA]"
              : "",
          )}
        >
          {activities.map((act) => (
            <ActivityItemRow
              key={act.id ?? `${act.familyId}-${act.action}`}
              activity={act}
            />
          ))}
        </div>

        {/* 2. Placeholder "Esperando confirmación" — fuera del scroll.
            Estilo compacto en una sola línea, similar al badge "+N ocultas". */}
        {isUnansweredFilter && (
          <div className="pt-2 mt-2 border-t border-dashed border-[#F0EAE0]">
            <p className="text-[10px] text-stone-400 font-medium leading-tight">
              <Clock
                size={9}
                className="inline-block mr-1 -mt-0.5 text-amber-600"
              />
              <span className="font-bold text-amber-700">
                Esperando confirmación
              </span>
            </p>
          </div>
        )}

        {/* 3. Indicador de actividades ocultas — fuera del scroll. */}
        {hasHidden && (
          <div className="pt-2 mt-2 border-t border-dashed border-[#F0EAE0]">
            <p className="text-[10px] text-stone-400 font-medium leading-tight">
              <span className="font-bold text-charcoal-700">
                +{hiddenTotal}{" "}
                {hiddenTotal === 1 ? "actividad oculta" : "actividades ocultas"}
              </span>
              <span className="text-stone-400">
                {" "}
                (
                {hiddenEntries
                  .map(([action, n]) => {
                    const v = ACTIVITY_VISUAL[action];
                    return `${n} ${v.shortLabel.toLowerCase()}`;
                  })
                  .join(", ")}
                )
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ActivityCard.displayName = "ActivityCard";

export default ActivityCard;