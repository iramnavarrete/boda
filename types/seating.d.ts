import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Family, GuestSeat } from "@/types";

export type ElementType =
  | "round_table"
  | "rectangular_table"
  | "square_table"
  | "half_moon_table"
  | "cocktail_table"
  | "head_table"
  | "dance_floor"
  | "stage"
  | "dj_booth"
  | "cake_area"
  | "gift_table"
  | "drink_bar"
  | "buffet"
  | "candy_bar";

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
  | { type: "element" }
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
