/**
 * Helpers para comparar fechas en formato YYYY-MM-DD (que es como
 * el DatePicker y los servicios de Firestore persisten `fechaLimiteConfirmacion`).
 *
 * IMPORTANTE: usamos el locale `en-CA` de `toLocaleDateString` porque es
 * el ÚNICO locale nativo de los browsers que produce YYYY-MM-DD
 * consistente (otros locales pueden usar DD/MM/YYYY, MM/DD/YYYY, etc).
 *
 * Centralizado aquí para evitar duplicación entre los watchers de admin
 * y los formularios de invitación.
 */

/** Devuelve hoy en formato YYYY-MM-DD (locale `en-CA`). */
export const todayAsISO = (): string =>
  new Date().toLocaleDateString("en-CA");

/**
 * ¿La fecha ya pasó? `null`/`undefined`/`""` → false (sin error).
 * Si se pasa una fecha, se compara como string YYYY-MM-DD contra hoy.
 */
export const isDateInPast = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  return dateStr < todayAsISO();
};
