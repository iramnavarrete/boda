import { Family } from "@/types";

/**
 * Variables especiales soportadas en los mensajes custom de WhatsApp.
 * Se reemplazan en tiempo de envío mediante `replaceWhatsappVariables`.
 *
 *  - {nombreFamilia}  → nombre de la familia
 *  - {numInvitados}   → cantidad de invitados (solo el número)
 *  - {totalLugares}   → cantidad + "lugar"/"lugares" auto-formateado
 *                       (ej: "1 lugar", "2 lugares")
 *  - {link}           → URL de la invitación con la familia
 *  - {fechaLimite}    → fecha límite formateada (ej: "20 de agosto")
 */
export interface WhatsappMessageContext {
  family: Family;
  invitationId: string;
  /** Fecha límite en formato YYYY-MM-DD (la del input del admin) */
  limitDateStr: string | null;
}

/**
 * Formatea una fecha YYYY-MM-DD como "20 de agosto" en es-MX.
 * Devuelve string vacío si la fecha es null/inválida.
 */
function formatLimitDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
  });
}

/**
 * Formatea el conteo de lugares con singular/plural correcto.
 *  - 1 → "1 lugar"
 *  - N (cualquier otro) → "N lugares"
 */
function formatLugares(count: number): string {
  return count === 1 ? "1 lugar" : `${count} lugares`;
}

/**
 * Reemplaza las variables especiales en un template de mensaje.
 * Las variables no presentes en el contexto se dejan tal cual (no se borran)
 * para que el admin note que escribió algo mal.
 */
export function replaceWhatsappVariables(
  template: string,
  ctx: WhatsappMessageContext,
): string {
  const link = `https://jninvitaciones.com/i/${ctx.invitationId}?family=${ctx.family.id}`;
  const fechaLimite = formatLimitDate(ctx.limitDateStr);
  const count = ctx.family.invitados ?? 0;

  return template
    .replaceAll("{nombreFamilia}", ctx.family.nombre)
    .replaceAll("{numInvitados}", String(count))
    .replaceAll("{totalLugares}", formatLugares(count))
    .replaceAll("{link}", link)
    .replaceAll("{fechaLimite}", fechaLimite);
}
