import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { useZoomStore } from "../../stores/useZoomStore";
import {
  Music,
  MonitorUp,
  MonitorPlay,
  Cake,
  Gift,
  Wine,
  UtensilsCrossed,
  Candy,
} from "lucide-react";
import { TableSettingsPopover } from "./TableSettingsPopover";
import { TableSeat } from "./TableSeat";
import { TableShape } from "./TableShape";
import { SeatingElement } from "@/types/seating";
import { useGuestLookupMap } from "../../hooks/useGuestLookupMap";
import { useElementResize } from "../../hooks/useElementResize";
import { useSelectedIdsSet } from "../../hooks/useSelectedIdsSet";

const AREA_ICONS: Record<string, React.ElementType> = {
  dance_floor: Music,
  stage: MonitorUp,
  dj_booth: MonitorPlay,
  cake_area: Cake,
  gift_table: Gift,
  drink_bar: Wine,
  buffet: UtensilsCrossed,
  candy_bar: Candy,
};

const RESIZE_HANDLES = [
  { id: "top-left", style: { top: -8, left: -8 }, cursor: "cursor-nw-resize" },
  { id: "top-right", style: { top: -8, right: -8 }, cursor: "cursor-ne-resize" },
  { id: "bottom-left", style: { bottom: -8, left: -8 }, cursor: "cursor-sw-resize" },
  { id: "bottom-right", style: { bottom: -8, right: -8 }, cursor: "cursor-se-resize" },
];

function TableElement({ element }: { element: SeatingElement }) {
  // Selectores atómicos: solo re-render cuando cambia el valor de estas props
  const isSingleSelected = useSeatingStore(
    (state) => state.selectedElementId === element.id,
  );
  const selectedIds = useSelectedIdsSet();
  const isSelectedInBulk = selectedIds.has(element.id);
  const isSelected = isSingleSelected || isSelectedInBulk;

  const setSelectedElementId = useSeatingStore(
    (state) => state.setSelectedElementId,
  );

  // Map O(1) compartido por todos los TableElement (memoizado por families)
  const guestMap = useGuestLookupMap();

  const isTable = element.seats !== undefined && element.seats > 0;
  const isArea = !isTable;

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `table-${element.id}`,
    data: { type: "table" },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `element-${element.id}`,
    data: { type: "element", element },
  });

  const { active: globalActive } = useDndContext();
  const {
    onPointerDownResize,
    onPointerMoveResize,
    onPointerUpResize,
  } = useElementResize(element.id);

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDroppableRef(node);
      setDraggableRef(node);
    },
    [setDroppableRef, setDraggableRef],
  );

  // ========================================================================
  // RE-RENDER FORZADO DURANTE DRAG ACTIVO DE OTRO ELEMENTO
  // ========================================================================
  // Para que los elementos seleccionados en bulk sigan al elemento que se
  // está arrastrando, necesitamos re-renderizar en cada frame del drag.
  // useDndContext nos da `active` pero sus refs (rect.current.translated)
  // NO disparan re-render por sí solas. Este state es un truco barato:
  // solo se actualiza cuando hay un drag activo de tipo "element" y se
  // lee en el cálculo del transform (que se ejecuta en cada render).
  // ========================================================================
  const [, forceRender] = useState(0);
  useEffect(() => {
    if (
      !globalActive ||
      globalActive.data.current?.type !== "element" ||
      !isSelectedInBulk
    ) {
      return;
    }
    // Solo instalamos el loop si este elemento necesita seguir al drag.
    let raf = 0;
    const tick = () => {
      forceRender((n) => (n + 1) & 0xffff);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [globalActive, isSelectedInBulk]);

  // Cálculo directo (no memoizado): depende de `transform` que cambia cada
  // frame durante el drag de ESTE elemento, y del `forceRender` arriba
  // cuando es OTRO elemento el que se arrastra.
  const transformStyle = (() => {
    if (transform) {
      const currentZoom = useZoomStore.getState().zoom;
      return `translate3d(${transform.x / currentZoom}px, ${
        transform.y / currentZoom
      }px, 0)`;
    }

    if (
      isSelectedInBulk &&
      globalActive &&
      globalActive.data.current?.type === "element" &&
      globalActive.rect.current.translated &&
      globalActive.rect.current.initial
    ) {
      const currentZoom = useZoomStore.getState().zoom;
      const deltaX =
        globalActive.rect.current.translated.left -
        globalActive.rect.current.initial.left;
      const deltaY =
        globalActive.rect.current.translated.top -
        globalActive.rect.current.initial.top;
      return `translate3d(${deltaX / currentZoom}px, ${deltaY / currentZoom}px, 0)`;
    }

    return undefined;
  })();

  // Conteos memoizados (antes eran loops O(familias*guests) en cada render)
  const { validAssignedCount, assignedGuests } = useMemo(() => {
    if (!isTable) {
      return { validAssignedCount: 0, assignedGuests: [] as string[] };
    }
    const valid: string[] = [];
    for (const id of element.assignedSeats) {
      if (id && guestMap.has(id)) valid.push(id);
    }
    return { validAssignedCount: valid.length, assignedGuests: valid };
  }, [isTable, element.assignedSeats, guestMap]);

  const AreaIcon = AREA_ICONS[element.type];
  const isPartOfActiveDrag =
    isSelectedInBulk &&
    globalActive &&
    globalActive.data.current?.type === "element";

  const renderResizeHandles = useCallback(() => {
    if (!isSingleSelected || !isArea) return null;
    return (
      <>
        {RESIZE_HANDLES.map((h) => (
          <div
            key={h.id}
            className={`absolute w-4 h-4 bg-white border-[2.5px] border-[#C5A669] rounded-full z-[60] shadow-md hover:scale-125 transition-transform ${h.cursor}`}
            style={h.style}
            onPointerDown={(e) => onPointerDownResize(e, h.id)}
            onPointerMove={onPointerMoveResize}
            onPointerUp={onPointerUpResize}
            onPointerCancel={onPointerUpResize}
          />
        ))}
      </>
    );
  }, [
    isSingleSelected,
    isArea,
    onPointerDownResize,
    onPointerMoveResize,
    onPointerUpResize,
  ]);

  return (
    <div
      ref={setNodeRef}
      className="absolute table-element-card"
      data-selected={isSelected}
      data-single-selected={isSingleSelected}
      data-dragging={isDragging || isPartOfActiveDrag}
      data-is-over={isOver}
      data-is-table={isTable}
      data-is-area={isArea}
      data-type={element.type}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: transformStyle,
        touchAction: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElementId(isSingleSelected ? null : element.id);
      }}
    >
      {isSingleSelected && (
        <TableSettingsPopover
          element={element}
          isTable={isTable}
          onClose={() => setSelectedElementId(null)}
        />
      )}

      {renderResizeHandles()}

      {isArea && AreaIcon && (
        <div className="absolute top-2 left-2 area-icon-container z-10 pointer-events-none">
          <AreaIcon size={20} strokeWidth={2} />
        </div>
      )}

      <TableShape
        type={element.type}
        width={element.width}
        height={element.height}
        seatsCount={element.seats}
        alias={element.alias}
        assignedSeatsCount={validAssignedCount}
        renderSeatItem={(seatIndex, { x, y }) => {
          const assignedGuestId = element.assignedSeats[seatIndex];
          const guestInfo = assignedGuestId
            ? guestMap.get(assignedGuestId) || null
            : null;
          const isAssigned = !!guestInfo;

          const guestName = guestInfo
            ? guestInfo.nombre || `${guestInfo.familyName} #${guestInfo.index + 1}`
            : undefined;

          return (
            <TableSeat
              key={seatIndex}
              x={x}
              y={y}
              isDragging={isDragging}
              isAssigned={isAssigned}
              seatNumber={seatIndex + 1}
              guestName={guestName}
              status={guestInfo?.estatus}
              colorBg={guestInfo?.colorBg}
              colorBorder={guestInfo?.colorBorder}
              tableId={element.id}
              guestId={isAssigned ? assignedGuestId : undefined}
            />
          );
        }}
      />

      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
      />
    </div>
  );
}

export default React.memo(TableElement);
