import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Family, GuestSeat } from "@/types";

/**
 * Tipos de elementos que se pueden colocar en el plano de seating.
 *
 * Se organizan en capas lógicas:
 *  - structural : Siempre al fondo (paredes, puertas, ventanas, etc.)
 *  - service    : Baños, cocina, salidas de emergencia
 *  - furniture  : Photo booth, lounge, fuentes, etc.
 *  - area       : Áreas grandes del evento (pista, escenario, jardín, etc.)
 *  - utility    : Texto, líneas y formas libres
 *  - table      : Mesas (con o sin asientos)
 */
export type ElementLayer =
  | "structural"
  | "service"
  | "furniture"
  | "area"
  | "utility"
  | "table";

export type ElementType =
  // ─── Mesas ──────────────────────────────────────────────
  | "round_table"
  | "rectangular_table"
  | "square_table"
  | "half_moon_table"
  | "cocktail_table"
  | "head_table"
  | "sweethearts_table"
  // ─── Estructurales (siempre al fondo) ───────────────────
  | "wall"
  | "door"
  | "window"
  | "column"
  | "stairs"
  | "aisle"
  // ─── Servicios ──────────────────────────────────────────
  | "bathroom"
  | "kitchen"
  | "emergency_exit"
  | "check_in"
  // ─── Mobiliario ─────────────────────────────────────────
  | "photo_booth"
  | "lounge"
  | "fountain"
  | "plant"
  // ─── Áreas y Espacios Especiales ────────────────────────
  | "dance_floor"
  | "stage"
  | "dj_booth"
  | "cake_area"
  | "gift_table"
  | "drink_bar"
  | "buffet"
  | "candy_bar"
  | "garden_entrance"
  | "bride_room"
  | "groom_room"
  | "smoking_area"
  // ─── Utilidades ─────────────────────────────────────────
  | "text_label"
  | "line_divider"
  | "zone_shape";

export const STRUCTURAL_TYPES: ReadonlySet<ElementType> = new Set<ElementType>([
  "wall",
  "door",
  "window",
  "column",
  "stairs",
  "aisle",
]);

export const UTILITY_TYPES: ReadonlySet<ElementType> = new Set<ElementType>([
  "text_label",
  "line_divider",
  "zone_shape",
]);

/**
 * Devuelve la capa (layer) a la que pertenece un tipo de elemento.
 * Usado para ordenar el render en el canvas y aplicar z-index correcto.
 */
export function getElementLayer(type: ElementType): ElementLayer {
  if (STRUCTURAL_TYPES.has(type)) return "structural";
  if (UTILITY_TYPES.has(type)) return "utility";

  // Mesas
  if (
    type === "round_table" ||
    type === "rectangular_table" ||
    type === "square_table" ||
    type === "half_moon_table" ||
    type === "cocktail_table" ||
    type === "head_table" ||
    type === "sweethearts_table"
  ) {
    return "table";
  }

  // Servicios
  if (
    type === "bathroom" ||
    type === "kitchen" ||
    type === "emergency_exit" ||
    type === "check_in"
  ) {
    return "service";
  }

  // Mobiliario
  if (
    type === "photo_booth" ||
    type === "lounge" ||
    type === "fountain" ||
    type === "plant"
  ) {
    return "furniture";
  }

  // Por defecto: área
  return "area";
}

export type DragItemData =
  | {
      type: "palette_element";
      elementType: ElementType;
      width: number;
      height: number;
      seats: number;
      label: string;
    }
  | {
      type: "palette_layout";
      elementType: "custom_layout";
      width: number;
      height: number;
      seats: number;
      label: string;
    }
  | {
      type: "element";
      element: SeatingElement;
    }
  | {
      type: "guest";
      guest: GuestSeat & { familyName?: string; index?: number };
    }
  | { type: "family"; family: FamilyElement };

export interface PaletteItemType {
  type: ElementType | "custom_layout";
  label: string;
  seats: number;
  width: number;
  height: number;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}

export type SeatingFilterType = "all" | "pending" | "assigned" | "action";

/**
 * Forma de una columna. Solo aplica cuando `type === "column"`.
 */
export type ColumnShape = "square" | "circle";

/**
 * Lado de la mesa en el que se distribuyen los asientos.
 * Solo aplica a mesas con disposición lineal/lado-a-lado
 * (rectangular, head, half_moon, square) y a la mesa de novios
 * (cuyas sillas decorativas pueden ir arriba o abajo).
 *
 * Default: "top".
 */
export type SeatPosition = "top" | "bottom";

/**
 * Posición del texto dentro de un elemento de tipo `zone_shape`.
 * Solo aplica a ese tipo — el texto se ancla a una de las 4 esquinas
 * del rectángulo en lugar de ir centrado.
 *
 * Default: "top-left".
 */
export type TextPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface SeatingElement {
  id: string;
  type: ElementType;
  alias: string;
  x: number;
  y: number;
  width: number;
  height: number;
  seats: number;
  assignedSeats: string[];
  /**
   * Rotación del elemento en grados (0-360). Solo se aplica a la
   * representación visual; el bounding box lógico permanece sin rotar
   * para que el resize siga siendo predecible.
   *
   * Default: 0 (no rota).
   */
  rotation?: number;
  /**
   * Forma de la columna. Solo se usa cuando `type === "column"`.
   * Default: "square".
   */
  columnShape?: ColumnShape;
  /**
   * Lado de la mesa donde se colocan los asientos.
   * Default: "top".
   */
  seatPosition?: SeatPosition;
  /**
   * Posición del texto dentro de un `zone_shape`.
   * Default: "top-left".
   */
  textPosition?: TextPosition;
}

export interface FamilyElement {
  id: string;
  name: string;
  deadline: string | null;
  colorBg: string;
  colorBorder: string;
  guests: GuestSeat[];
  allowChanges: boolean;
  rawFamily: Family;
}

export interface UnassignOptions {
  includeNoDeadline: boolean;
  includePendingNotExpired: boolean;
  includePendingExpired: boolean;
}

export interface LayoutConfig {
  totalTables: number;
  seatsPerTable: number;
  includeDanceFloor: boolean;
  startingIndex: number;
  centerX: number;
  centerY: number;
}

export interface TableShapeProps {
  type: ElementType;
  width: number;
  height: number;
  seatsCount?: number;
  alias?: string;
  assignedSeatsCount?: number;
  /**
   * Forma de la columna. Solo se usa cuando type === "column".
   */
  columnShape?: ColumnShape;
  /**
   * Lado de la mesa donde se colocan los asientos.
   * Default: "top".
   */
  seatPosition?: SeatPosition;
  renderSeatItem?: (
    seatIndex: number,
    coords: { x: number; y: number },
  ) => React.ReactNode;
}
