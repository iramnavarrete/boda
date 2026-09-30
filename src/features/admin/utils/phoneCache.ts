// Cache simple en memoria para evitar releer el teléfono de una familia
// durante la sesión del admin. Debe invalidarse cada vez que el teléfono
// cambia (al guardar/editar la familia, al importar, etc.) — ver
// `invalidatePhoneCache` más abajo.

const cache = new Map<string, string | null>();

export function getCachedPhone(familyId: string): string | null | undefined {
  return cache.get(familyId);
}

export function setCachedPhone(familyId: string, phone: string | null): void {
  cache.set(familyId, phone);
}

/**
 * Invalida el cache de teléfono para una familia específica, o lo limpia
 * completamente si no se pasa `familyId`.
 *
 * Llamar después de cualquier escritura que modifique el teléfono de la
 * familia: `saveFamily` (edit/create) e `importFamilies` (bulk).
 */
export function invalidatePhoneCache(familyId?: string): void {
  if (familyId) {
    cache.delete(familyId);
  } else {
    cache.clear();
  }
}
