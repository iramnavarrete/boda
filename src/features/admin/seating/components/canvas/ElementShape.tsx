import React from "react";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { SeatingElement } from "@/types/seating";
import { TableShape } from "./TableShape";
import { StructuralElementShape } from "./StructuralElementShape";
import { AreaShape } from "./AreaShape";

interface ElementShapeProps {
  element: SeatingElement;
  renderSeatItem?: (
    seatIndex: number,
    coords: { x: number; y: number },
  ) => React.ReactNode;
  /**
   * Handlers de drag de dnd-kit. Se reenvían a `AreaShape` para que
   * `zone_shape` pueda aplicarlos SOLO al texto y al borde (no al
   * centro, para no atrapar el drag de mesas que estén dentro).
   */
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
}

/**
 * Dispatcher central: enruta el render según el tipo de elemento.
 *
 *  - Estructurales → `StructuralElementShape` (paredes, puertas, etc.)
 *  - Mesas         → `TableShape` (incluye la mesa de novios)
 *  - Áreas y otros → `AreaShape` (zonas, mobiliarios, servicios, etc.)
 */
export function ElementShape({
  element,
  renderSeatItem,
  dragAttributes,
  dragListeners,
}: ElementShapeProps) {
  const {
    type,
    width,
    height,
    alias,
    seats,
    assignedSeats,
    columnShape,
    seatPosition,
    textPosition,
  } = element;

  // Estructurales
  if (
    type === "wall" ||
    type === "door" ||
    type === "window" ||
    type === "column" ||
    type === "stairs" ||
    type === "aisle"
  ) {
    return (
      <StructuralElementShape
        type={type}
        width={width}
        height={height}
        alias={alias}
        columnShape={columnShape}
      />
    );
  }

  // Mesas
  if (
    type === "round_table" ||
    type === "rectangular_table" ||
    type === "square_table" ||
    type === "half_moon_table" ||
    type === "cocktail_table" ||
    type === "head_table" ||
    type === "sweethearts_table" ||
    type === "lounge_table"
  ) {
    return (
      <TableShape
        type={type}
        width={width}
        height={height}
        seatsCount={seats}
        alias={alias}
        assignedSeatsCount={assignedSeats.filter(Boolean).length}
        columnShape={columnShape}
        seatPosition={seatPosition}
        renderSeatItem={renderSeatItem}
      />
    );
  }

  // Áreas, servicios, espacios, utilidades
  return (
    <AreaShape
      type={type}
      width={width}
      height={height}
      alias={alias}
      textPosition={textPosition}
      dragAttributes={dragAttributes}
      dragListeners={dragListeners}
    />
  );
}

export default ElementShape;
