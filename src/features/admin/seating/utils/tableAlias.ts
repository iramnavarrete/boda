import { SeatingElement } from "@/types/seating";

/**
 * Patrón aceptado para el alias de una mesa autogenerada.
 * Solo consideramos las que matchean exactamente `Mesa N` (con N
 * entero positivo) para no contar aliases personalizados que casualmente
 * contengan un número (p.ej. "Mesa de los novios" o "Mesa VIP 3").
 */
const TABLE_ALIAS_PATTERN = /^Mesa (\d+)$/;

/**
 * Devuelve el siguiente número entero de mesa a usar como default al
 * crear una nueva mesa. Toma en cuenta TODAS las mesas existentes
 * (incluyendo las que el usuario haya renombrado) y se basa en el
 * número más alto encontrado en aliases que matchean `Mesa N`.
 *
 * Ejemplos:
 *   - Sin mesas           → 1
 *   - Mesa 1, 2, 3        → 4
 *   - Mesa 1, Mesa 5      → 6
 *   - Mesa 15, Mesa VIP   → 16  (ignora "Mesa VIP" porque no matchea `Mesa N`)
 *   - Mesa 1, 3, 7        → 8
 */
export function getNextTableNumber(elements: SeatingElement[]): number {
  let max = 0;
  for (const el of elements) {
    // Solo mesas (seats > 0) cuentan. Las áreas/estructuras/etc. se ignoran.
    if (!el.seats || el.seats <= 0) continue;
    if (!el.alias) continue;

    const match = el.alias.match(TABLE_ALIAS_PATTERN);
    if (!match) continue;

    const n = parseInt(match[1], 10);
    if (Number.isFinite(n) && n > max) {
      max = n;
    }
  }
  return max + 1;
}

/**
 * Devuelve el alias por defecto para una mesa nueva, basado en el
 * siguiente número disponible en el plano.
 */
export function getDefaultTableAlias(elements: SeatingElement[]): string {
  return `Mesa ${getNextTableNumber(elements)}`;
}
