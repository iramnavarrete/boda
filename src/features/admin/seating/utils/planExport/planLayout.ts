import { SeatingElement } from "@/types/seating";

/**
 * Tamaño de hoja carta en pulgadas.
 * 8.5" x 11" (Letter US).
 */
export const LETTER_W_IN = 8.5;
export const LETTER_H_IN = 11;

export const LETTER_W_CM = 21.59;
export const LETTER_H_CM = 27.94;

export interface PlanBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  /** Margen extra en píxeles del plano que queremos dejar alrededor del contenido. */
  padding: number;
}

/**
 * Calcula el bounding box del contenido del plano (mesas + áreas).
 * Devuelve también el padding recomendado para no cortar elementos.
 */
export function calculatePlanBounds(
  elements: SeatingElement[],
  padding = 80,
): PlanBounds {
  if (elements.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
      padding,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    if (el.x < minX) minX = el.x;
    if (el.y < minY) minY = el.y;
    if (el.x + el.width > maxX) maxX = el.x + el.width;
    if (el.y + el.height > maxY) maxY = el.y + el.height;
  }

  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
    padding,
  };
}

export type Orientation = "landscape" | "portrait";

/**
 * Decide si el plano se ajusta mejor en una hoja horizontal o vertical.
 *
 * Regla: comparamos el aspect ratio del contenido con el de la hoja carta.
 *   - aspect > 1 → contenido más ancho que alto → horizontal
 *   - aspect < 1 → contenido más alto que ancho → vertical
 *
 * Se aplica un umbral de tolerancia para no rotar la página por márgenes
 * mínimos.
 */
export function pickOrientation(bounds: PlanBounds): Orientation {
  if (bounds.width === 0 || bounds.height === 0) return "landscape";

  const contentAspect = bounds.width / bounds.height;
  const letterAspect = LETTER_W_IN / LETTER_H_IN; // ≈ 0.7727

  // Si el contenido es más cuadrado que la hoja (o más ancho),
  // conviene horizontal. Si es más vertical, vertical.
  return contentAspect > letterAspect ? "landscape" : "portrait";
}

export interface FittedPlanSize {
  /** Ancho disponible dentro de la hoja (pulgadas). */
  widthIn: number;
  /** Alto disponible dentro de la hoja (pulgadas). */
  heightIn: number;
  /** Ancho final del plano (pulgadas) tras escalar para caber en la hoja. */
  planWidthIn: number;
  /** Alto final del plano (pulgadas) tras escalar para caber en la hoja. */
  planHeightIn: number;
  orientation: Orientation;
}

/**
 * Calcula el tamaño final del plano para que QUEPA en la hoja carta
 * respetando los márgenes de impresión (0.5" cada lado).
 *
 * Mantiene el aspect ratio del contenido (object-fit: contain equivalente).
 */
export function fitPlanToLetter(bounds: PlanBounds): FittedPlanSize {
  const orientation = pickOrientation(bounds);

  // Márgenes de impresora típicos: 0.5" por lado.
  const MARGIN_IN = 0.5;
  const availableW = LETTER_W_IN - MARGIN_IN * 2;
  const availableH = LETTER_H_IN - MARGIN_IN * 2;

  const pageW = orientation === "landscape" ? availableH : availableW;
  const pageH = orientation === "landscape" ? availableW : availableH;

  if (bounds.width === 0 || bounds.height === 0) {
    return {
      widthIn: pageW,
      heightIn: pageH,
      planWidthIn: pageW,
      planHeightIn: pageH,
      orientation,
    };
  }

  const contentAspect = bounds.width / bounds.height;
  const pageAspect = pageW / pageH;

  let planW: number;
  let planH: number;

  if (contentAspect > pageAspect) {
    // El contenido es más ancho: limitamos por ancho
    planW = pageW;
    planH = pageW / contentAspect;
  } else {
    // El contenido es más alto: limitamos por alto
    planH = pageH;
    planW = pageH * contentAspect;
  }

  return {
    widthIn: pageW,
    heightIn: pageH,
    planWidthIn: planW,
    planHeightIn: planH,
    orientation,
  };
}
