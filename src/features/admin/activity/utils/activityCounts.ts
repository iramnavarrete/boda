import type { FamilyActivity } from "@/types";
import type { ActivityCounts } from "../types";

/**
 * Calcula los conteos por categoría sobre FAMILIAS ÚNICAS.
 *
 * Aclaración: como el filtro es "a nivel actividad", una familia con un
 * `view` y un `confirm` cuenta para AMBAS categorías. Esta función evita
 * inflar los números al contar families (no activities).
 *
 * Adicionalmente calcula `unanswered`: familias que tienen ≥1 view pero
 * NO tienen confirm ni decline.
 *
 * O(n) — una sola pasada construyendo Sets y un Map de flags por familia.
 */
export function computeActivityCounts(
  activities: FamilyActivity[],
): ActivityCounts {
  const familiesByAction = {
    confirm: new Set<string>(),
    view: new Set<string>(),
    decline: new Set<string>(),
  };
  const allFamilies = new Set<string>();

  // Flags por familia para detectar "unanswered" en una sola pasada
  const familyFlags = new Map<
    string,
    { view: boolean; confirm: boolean; decline: boolean }
  >();

  for (const a of activities) {
    if (!a.familyId) continue;
    allFamilies.add(a.familyId);
    familiesByAction[a.action].add(a.familyId);

    const flags = familyFlags.get(a.familyId) ?? {
      view: false,
      confirm: false,
      decline: false,
    };
    flags[a.action] = true;
    familyFlags.set(a.familyId, flags);
  }

  // Conteo de "unanswered": families con view pero sin confirm ni decline
  let unanswered = 0;
  for (const flags of familyFlags.values()) {
    if (flags.view && !flags.confirm && !flags.decline) {
      unanswered++;
    }
  }

  return {
    all: allFamilies.size,
    confirm: familiesByAction.confirm.size,
    view: familiesByAction.view.size,
    decline: familiesByAction.decline.size,
    unanswered,
  };
}