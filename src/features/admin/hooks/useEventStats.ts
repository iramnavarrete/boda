import {
  Family,
  FilterCounts as FilterCountsStatus,
  FamilyActivity,
} from "@/types";
import { SeatingElement } from "../seating/stores/useSeatingStore";
import { useMemo } from "react";

export interface EventStats {
  invitados: {
    total: number;
    confirmados: number;
    pendientes: number;
    rechazados: number;
  };
  familias: {
    total: number;
    completas: number;
    parciales: number;
    rechazadas: number;
    sinResponder: number;
    sinAbrir: number;
  };
  logistica: {
    mesasTotal: number;
    mesasLlenas: number;
    mesasIncompletas: number;
    asientosTotal: number;
    asientosOcupados: number;
    asientosDisponibles: number;
    asientosAtencion: number;
  };
}

export interface FilterCounts {
  whatsapp: { all: number; sent: number; not_sent: number; empty: number };
  etiquetas: { all: number; Novia: number; Novio: number; Ambos: number };
  status: FilterCountsStatus;
}

interface UseEventStatsOptions {
  elements?: SeatingElement[];
  activities?: FamilyActivity[]; // 🔥 Ahora recibe el array crudo de actividades
  filters?: {
    whatsapp?: "all" | "sent" | "not_sent" | "empty" | string;
    tag?: "all" | "Novia" | "Novio" | "Ambos" | string;
  };
}

// ============================================================================
// SÚPER HOOK: ESTADÍSTICAS GLOBALES + FILTROS CRUZADOS
// ============================================================================

export const useEventStats = (
  families: Family[],
  options: UseEventStatsOptions = {},
) => {
  const { elements = [], activities, filters } = options;

  // 1. Procesamos internamente (y solo 1 vez) quiénes han visto la invitación
  const viewedFamilyIds = useMemo(() => {
    // 🔥 Verificación ESTRICTA para evitar fallos de Javascript (truthiness)
    if (!Array.isArray(activities)) return undefined;

    const ids = new Set<string>();
    activities.forEach((act) => {
      // Buscamos si existe al menos un ítem con actividad tipo "view"
      if (act.action === "view" && act.familyId) {
        ids.add(act.familyId);
      }
    });
    return ids;
  }, [activities]);

  const stats = useMemo(() => {
    const s: EventStats = {
      invitados: { total: 0, confirmados: 0, pendientes: 0, rechazados: 0 },
      familias: {
        total: families.length,
        completas: 0,
        parciales: 0,
        rechazadas: 0,
        sinResponder: 0,
        sinAbrir: 0,
      },
      logistica: {
        mesasTotal: 0,
        mesasLlenas: 0,
        mesasIncompletas: 0,
        asientosTotal: 0,
        asientosOcupados: 0,
        asientosDisponibles: 0,
        asientosAtencion: 0,
      },
    };

    families.forEach((c) => {
      // -- INVITADOS --
      const invitados = Number(c.invitados) || 0;
      const confirmados = Number(c.confirmados) || 0;

      s.invitados.total += invitados;
      s.invitados.confirmados += c.asistencia === true ? confirmados : 0;
      s.invitados.rechazados +=
        (c.asistencia === false ? invitados : 0) +
        (c.asistencia === true ? Math.max(0, invitados - confirmados) : 0);
      s.invitados.pendientes += c.asistencia === null ? invitados : 0;

      // -- FAMILIAS --
      if (c.asistencia === true) {
        if (confirmados >= invitados) s.familias.completas++;
        else s.familias.parciales++;
      } else if (c.asistencia === false) {
        s.familias.rechazadas++;
      } else {
        s.familias.sinResponder++;

        if (viewedFamilyIds !== undefined) {
          // Si nos pasaron el arreglo de actividades, la matemática es exacta
          if (!viewedFamilyIds.has(c.id)) {
            s.familias.sinAbrir++;
          }
        } else {
          // Fallback seguro si NO le pasamos las actividades (Ej. Vista general de Invitados)
          if (c.asistencia === null) {
            s.familias.sinAbrir++;
          }
        }
      }
    });

    // -- LOGÍSTICA DE MESAS (Se ignora automáticamente si no pasan 'elements') --
    if (elements.length > 0) {
      elements.forEach((el) => {
        if (el.seats && el.seats > 0) {
          s.logistica.mesasTotal++;
          s.logistica.asientosTotal += el.seats;

          const ocupados = el.assignedSeats.filter(
            (seat) => seat && seat.trim() !== "",
          );
          s.logistica.asientosOcupados += ocupados.length;

          if (ocupados.length >= el.seats) s.logistica.mesasLlenas++;
          else s.logistica.mesasIncompletas++;

          ocupados.forEach((seatId) => {
            for (const f of families) {
              const seat = f.asientos?.find((a) => a.id === seatId);
              if (seat && seat.estatus === "declined") {
                s.logistica.asientosAtencion++;
                break;
              }
            }
          });
        }
      });
      s.logistica.asientosDisponibles = Math.max(
        0,
        s.logistica.asientosTotal - s.logistica.asientosOcupados,
      );
    }

    return s;
  }, [families, elements, viewedFamilyIds]);

  // B. FAMILIAS FILTRADAS
  const filteredFamilies = useMemo(() => {
    if (!filters) return families;
    return families.filter((g) => {
      const w = filters.whatsapp || "all";
      const passWhatsapp =
        w === "sent"
          ? !!(g.whatsappEnviado && g.tieneTelefono)
          : w === "not_sent"
            ? !!(!g.whatsappEnviado && g.tieneTelefono)
            : w === "empty"
              ? !g.tieneTelefono
              : true;

      const t = filters.tag || "all";
      const passTag = t === "all" || g.etiqueta === t;

      return passWhatsapp && passTag;
    });
  }, [families, filters]);

  const filterCounts = useMemo<FilterCounts>(() => {
    return {
      whatsapp: {
        all: filteredFamilies.length,
        sent: filteredFamilies.filter(
          (g) => g.whatsappEnviado && g.tieneTelefono,
        ).length,
        not_sent: filteredFamilies.filter(
          (g) => !g.whatsappEnviado && g.tieneTelefono,
        ).length,
        empty: filteredFamilies.filter((g) => !g.tieneTelefono).length,
      },
      etiquetas: {
        all: filteredFamilies.length,
        Novia: filteredFamilies.filter((g) => g.etiqueta === "Novia").length,
        Novio: filteredFamilies.filter((g) => g.etiqueta === "Novio").length,
        Ambos: filteredFamilies.filter((g) => g.etiqueta === "Ambos").length,
      },
      status: filteredFamilies.reduce(
        (acc, g) => {
          const inv = Number(g.invitados) || 0;
          const conf = Number(g.confirmados) || 0;
          const partial = g.asistencia === true && conf > 0 && conf < inv;
          return {
            all: acc.all + 1,
            confirmed:
              acc.confirmed + (g.asistencia === true && !partial ? 1 : 0),
            partial: acc.partial + (partial ? 1 : 0),
            rejected: acc.rejected + (g.asistencia === false ? 1 : 0),
            pending: acc.pending + (g.asistencia == null ? 1 : 0),
          };
        },
        { all: 0, confirmed: 0, partial: 0, rejected: 0, pending: 0 },
      ),
    };
  }, [filteredFamilies]);

  return { stats, filteredFamilies, filterCounts };
};
