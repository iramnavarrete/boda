/**
 * Helper para analizar el estado de una mesa y devolver una lista
 * de "issues" (acciones sugeridas o información) que el usuario
 * debe ver en el panel del sidebar.
 *
 * La función es pura (no toca React ni stores directamente) y
 * recibe el contexto necesario (guestMap, families, actions) por
 * parámetro. Esto facilita testeo y memoización.
 *
 * Casos cubiertos (ver tabla en el plan):
 *   1. Critical: invitados declinados
 *   2. Critical: sobre-asignación
 *   3. Warning: faltan asientos por asignar
 *   4. Warning: invitados pendientes de confirmar
 *   5. Success: mesa completa, todos confirmados
 */
import type { SeatingElement, FamilyElement } from "@/types/seating";
import type { GuestLookupInfo } from "../hooks/useGuestLookupMap";

export type IssueSeverity = "critical" | "warning" | "success";

export type IssueIcon =
  | "rotate-ccw"
  | "user-plus"
  | "clock"
  | "alert"
  | "check";

export interface TableIssue {
  /** ID único (estable) para usar como key en React. */
  id: string;
  severity: IssueSeverity;
  icon: IssueIcon;
  /** Título corto del issue (línea 1). */
  title: string;
  /** Descripción más larga (línea 2). Opcional. */
  message?: string;
  /** Acción opcional con botón. Las acciones destructivas
   *  (ej. desasignar) deben abrir un modal de confirmación
   *  desde el caller, NO hacer cambios directos. */
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface IssueContext {
  /** Mapa de guestId → info del invitado. */
  guestMap: Map<string, GuestLookupInfo>;
  /** Lista de familias (para nombres, etc). */
  families: FamilyElement[];
  /** Acciones disponibles que el caller provee (normalmente
   *  funciones del store y el modal de confirmación). */
  actions: {
    /** Remueve un invitado específico del asiento que ocupa. */
    removeGuestFromTable: (tableId: string, guestId: string) => void;
    /** Abre el modal de confirmación global. El type es permisivo
     *  a propósito: el helper solo necesita pasar `title`, `message`,
     *  `isDanger` y `action`, pero el modal real exige más campos
     *  (ej. `isOpen: true`). El caller pasa una función con cast. */
    openConfirmModal: (config: Record<string, unknown>) => void;
  };
}

export function getTableIssues(
  element: SeatingElement,
  ctx: IssueContext,
): TableIssue[] {
  const issues: TableIssue[] = [];

  // Si no es una mesa con asientos, no hay nada que analizar.
  if (!element.seats || element.seats <= 0) return issues;

  // ------------------------------------------------------------
  // 1. Recolectar info de los asientos asignados
  // ------------------------------------------------------------
  const assigned = element.assignedSeats.filter((id): id is string =>
    Boolean(id),
  );
  const assignedInfos = assigned
    .map((id) => ctx.guestMap.get(id))
    .filter((info): info is GuestLookupInfo => Boolean(info));

  const declined = assignedInfos.filter((g) => g.estatus === "declined");
  const pending = assignedInfos.filter((g) => g.estatus === "pending");
  const confirmed = assignedInfos.filter((g) => g.estatus === "confirmed");

  // ------------------------------------------------------------
  // 2. CASOS CRÍTICOS
  // ------------------------------------------------------------

  // (a) Declinados
  if (declined.length > 0) {
    issues.push({
      id: `${element.id}-declined`,
      severity: "critical",
      icon: "rotate-ccw",
      title:
        declined.length === 1
          ? "1 invitado declinado"
          : `${declined.length} invitados declinados`,
      message: "Desasignar para liberar el lugar en la mesa.",
      action: {
        label: declined.length === 1 ? "Desasignar" : "Desasignar todos",
        onClick: () => {
          // Las acciones destructivas SIEMPRE pasan por el modal
          // de confirmación global. Nunca eliminación directa.
          //
          // Usamos el mismo fallback que el TableSeat: si el invitado
          // no tiene nombre, mostramos "Familia #N" para que el
          // usuario pueda identificarlo. Esto es importante porque
          // el campo `nombre` puede estar vacío en el formulario
          // original.
          const guestList = declined
            .map((g) =>
              g.nombre && g.nombre.trim().length > 0
                ? `• ${g.nombre}`
                : `• ${g.familyName} #${g.index + 1}`,
            )
            .join("\n");
          ctx.actions.openConfirmModal({
            isOpen: true,
            showConfirmToast: false,
            title: "⚠️ Desasignar invitados declinados",
            message: `Los siguientes invitados declinaron y ocupan asientos en esta mesa:\n\n${guestList}\n\n¿Deseas desasignarlos para liberar los lugares?`,
            isDanger: true,
            action: () => {
              for (const g of declined) {
                ctx.actions.removeGuestFromTable(element.id, g.id);
              }
            },
          });
        },
      },
    });
  }

  // (b) Sobre-asignación
  if (assigned.length > element.seats) {
    const overflow = assigned.length - element.seats;
    issues.push({
      id: `${element.id}-overflow`,
      severity: "critical",
      icon: "alert",
      title:
        overflow === 1 ? "1 invitado de más" : `${overflow} invitados de más`,
      message: `La mesa tiene capacidad para ${element.seats} pero hay ${assigned.length} asignados.`,
    });
  }

  // ------------------------------------------------------------
  // 3. CASOS WARNING
  // ------------------------------------------------------------

  // (c) Faltan asientos por asignar
  if (assigned.length < element.seats) {
    const missing = element.seats - assigned.length;
    issues.push({
      id: `${element.id}-missing`,
      severity: "warning",
      icon: "user-plus",
      title:
        missing === 1
          ? "Falta 1 asiento por asignar"
          : `Faltan ${missing} asientos por asignar`,
      message: `Capacidad: ${element.seats} • Asignados: ${assigned.length}`,
    });
  }

  // (d) Invitados pendientes de confirmar
  if (pending.length > 0) {
    issues.push({
      id: `${element.id}-pending`,
      severity: "warning",
      icon: "clock",
      title:
        pending.length === 1
          ? "1 invitado pendiente de confirmar"
          : `${pending.length} invitados pendientes de confirmar`,
      message: "Aún no han confirmado su asistencia.",
    });
  }

  // ------------------------------------------------------------
  // 4. CASO SUCCESS — solo si la mesa está completa y sana
  // ------------------------------------------------------------
  const isComplete = assigned.length === element.seats;
  const allConfirmed = declined.length === 0 && pending.length === 0;

  if (isComplete && allConfirmed) {
    issues.push({
      id: `${element.id}-ok`,
      severity: "success",
      icon: "check",
      title: "Mesa completa",
      message: "Sin acciones pendientes.",
    });
  }

  // Ordenar: critical → warning → success
  const order: Record<IssueSeverity, number> = {
    critical: 0,
    warning: 1,
    success: 2,
  };
  return issues.sort((a, b) => order[a.severity] - order[b.severity]);
}
