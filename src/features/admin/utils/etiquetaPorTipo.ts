/**
 * Etiquetas por tipo de invitación — taxonomía DRY para el admin.
 *
 * Cada invitación tiene su propio set de etiquetas para el campo
 * `Family.etiqueta`. El **valor canónico** completo se persiste en
 * Firestore (útil para búsqueda, export, integraciones); el **label
 * corto** se usa en pills/dropdowns/stats para no saturar la UI.
 *
 * Patrón value + label:
 *   - Firestore:  "Familia Paterna"   (canónico, completo)
 *   - UI:         "Fam. Paterna"      (label, corto)
 *
 * Sin cambios en el modelo de datos: `Family.etiqueta` sigue siendo
 * `string | null` libre. Solo cambian las opciones que la UI presenta
 * y que las stats/filters contabilizan, según `invitationData.tipo`.
 *
 * Bodas existentes en Firestore (con "Novia"/"Novio"/"Ambos") siguen
 * funcionando idénticamente — no hay migration.
 */

type EtiquetaSpec = { value: string; label: string };

/** Tags para bodas (valor canónico === label, ambos cortos). */
export const WEDDING_ETIQUETAS: readonly EtiquetaSpec[] = [
  { value: "Novia", label: "Novia" },
  { value: "Novio", label: "Novio" },
  { value: "Ambos", label: "Ambos" },
] as const;

/** Tags para XV Años (valor canónico completo, label corto para UI). */
export const XV_ETIQUETAS: readonly EtiquetaSpec[] = [
  { value: "Familia Paterna", label: "Fam. Paterna" },
  { value: "Familia Materna", label: "Fam. Materna" },
  { value: "Amigos", label: "Amigos" },
  { value: "Otros", label: "Otros" },
] as const;

/** Tags para bautizo (placeholder — mismo set que boda por ahora). */
export const BAUTIZO_ETIQUETAS = WEDDING_ETIQUETAS;

/** Tags para cumpleaños (placeholder — mismo set que boda por ahora). */
export const CUMPLEANOS_ETIQUETAS = WEDDING_ETIQUETAS;

/** Tipos derivados de las constantes (evita drift). */
export type WeddingEtiqueta = (typeof WEDDING_ETIQUETAS)[number]["value"];
export type XvEtiqueta = (typeof XV_ETIQUETAS)[number]["value"];
export type EtiquetaPorTipo = WeddingEtiqueta | XvEtiqueta;

/**
 * Specs de tags (value + label) según el tipo de invitación.
 *
 * Para boda, bautizo o cumpleaños devuelve las mismas etiquetas.
 * Default a WEDDING_ETIQUETAS si el tipo es desconocido.
 */
export function getEtiquetaOptions(
  tipo: string | null | undefined,
): readonly EtiquetaSpec[] {
  if (tipo === "xv_anos") return XV_ETIQUETAS;
  if (tipo === "bautizo") return BAUTIZO_ETIQUETAS;
  if (tipo === "cumpleanos") return CUMPLEANOS_ETIQUETAS;
  return WEDDING_ETIQUETAS; // default para boda y tipos desconocidos
}

/**
 * Devuelve el label corto (UI) a partir del valor canónico (Firestore).
 *
 * - Si `value` es null/undefined/"" → "Sin etiquetas" (placeholder).
 * - Si el valor está en el registry → su label corto.
 * - Si el valor NO está (dato legacy o custom) → fallback al value crudo.
 *
 * Esto asegura que tags antiguos sigan mostrándose incluso si se
 * renombra el registry en el futuro.
 */
export function getEtiquetaLabel(value: string | null | undefined): string {
  if (!value) return "Sin etiquetas";
  const all: readonly EtiquetaSpec[] = [
    ...WEDDING_ETIQUETAS,
    ...XV_ETIQUETAS,
    ...BAUTIZO_ETIQUETAS,
    ...CUMPLEANOS_ETIQUETAS,
  ];
  return all.find((e) => e.value === value)?.label ?? value;
}

/**
 * Estilos de los pills/tabs por valor canónico de etiqueta. Centralizado
 * para que todas las vistas (admin families, seating) usen la misma
 * paleta visual por tipo de evento.
 *
 * Bodas: rose/blue/purple. XV: emerald/sky para lados familiares,
 * amber/stone para amigos/otros.
 */
export interface EtiquetaStyle {
  /** Color del ícono del tag (Tailwind text-* class). */
  iconColor: string;
  /** Clases del estado seleccionado (background + border + text). */
  activeColorClass: string;
}

export const ETIQUETA_STYLES: Record<string, EtiquetaStyle> = {
  // Bodas
  Novia: {
    iconColor: "text-rose-400",
    activeColorClass:
      "bg-rose-50 border-rose-200 text-rose-700 ring-1 ring-rose-100",
  },
  Novio: {
    iconColor: "text-blue-400",
    activeColorClass:
      "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-100",
  },
  Ambos: {
    iconColor: "text-purple-400",
    activeColorClass:
      "bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-100",
  },
  // XV Años
  "Familia Paterna": {
    iconColor: "text-emerald-400",
    activeColorClass:
      "bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-100",
  },
  "Familia Materna": {
    iconColor: "text-sky-400",
    activeColorClass:
      "bg-sky-50 border-sky-200 text-sky-700 ring-1 ring-sky-100",
  },
  Amigos: {
    iconColor: "text-amber-400",
    activeColorClass:
      "bg-amber-50 border-amber-200 text-amber-700 ring-1 ring-amber-100",
  },
  Otros: {
    iconColor: "text-stone-400",
    activeColorClass:
      "bg-stone-100 border-stone-200 text-stone-700 ring-1 ring-stone-200",
  },
};

/** Default visual cuando el valor no está en el registry (tags legacy). */
export const ETIQUETA_DEFAULT_STYLE: EtiquetaStyle = {
  iconColor: "text-stone-400",
  activeColorClass:
    "bg-stone-100 border-stone-200 text-stone-700 ring-1 ring-stone-200",
};

/** Helper: devuelve el estilo para un valor (con fallback al default). */
export function getEtiquetaStyle(value: string | null | undefined): EtiquetaStyle {
  if (!value) return ETIQUETA_DEFAULT_STYLE;
  return ETIQUETA_STYLES[value] ?? ETIQUETA_DEFAULT_STYLE;
}

/**
 * Lista de valores canónicos de etiqueta según el tipo de invitación,
 * útil para mostrar en descripciones/ejemplos del importador y del
 * template de Excel.
 *
 * Ejemplos:
 *   boda      → "Novia · Novio · Ambos"
 *   xv_anos   → "Familia Paterna · Familia Materna · Amigos · Otros"
 */
export function getEtiquetaValueList(
  tipo: string | null | undefined,
): string {
  return getEtiquetaOptions(tipo).map((o) => o.value).join(" · ");
}