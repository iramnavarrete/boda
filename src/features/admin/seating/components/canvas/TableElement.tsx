import React, { useCallback, useState, useEffect, useRef } from "react";
import { RotateCw } from "lucide-react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { useZoomStore } from "../../stores/useZoomStore";
import {
  STRUCTURAL_TYPES,
  UTILITY_TYPES,
  getElementLayer,
  SeatingElement,
} from "@/types/seating";
import { TableSeat } from "./TableSeat";
import { ElementShape } from "./ElementShape";
import { useGuestLookupMap } from "../../hooks/useGuestLookupMap";
import { useElementResize } from "../../hooks/useElementResize";
import { useSelectedIdsSet } from "../../hooks/useSelectedIdsSet";

const RESIZE_HANDLES = [
  { id: "top-left", style: { top: -8, left: -8 }, cursor: "cursor-nw-resize" },
  { id: "top-right", style: { top: -8, right: -8 }, cursor: "cursor-ne-resize" },
  { id: "bottom-left", style: { bottom: -8, left: -8 }, cursor: "cursor-sw-resize" },
  { id: "bottom-right", style: { bottom: -8, right: -8 }, cursor: "cursor-se-resize" },
];

// Mesas que deben mantener proporción 1:1 al redimensionar.
// Solo se aplica a mesas visualmente circulares/cuadradas. La mesa
// de novios, la principal y la rectangular tienen resize libre.
const SQUARE_ASPECT_TYPES = new Set([
  "round_table",
  "square_table",
  "cocktail_table",
]);

// Estructurales con resize restringido a un solo eje
const AXIS_LOCKED_TYPES: Record<string, "x" | "y"> = {
  wall: "x",
  door: "x",
  window: "x",
};

/**
 * Padding extra (en px) que se aplica ALREDEDOR de las mesas para que
 * el bounding box del elemento (y por tanto el área clickable,
 * draggeable y redimensionable) incluya también los asientos.
 *
 * Los asientos NO cambian de tamaño: este padding solo expande el
 * contenedor invisible que captura los eventos de pointer.
 *
 * Valor derivado de la geometría de asientos en `TableShape.tsx`:
 *   - Round/cocktail:  radio = width/2 + 26, seat = 28px → 40px desde el borde
 *   - Rectangular/head: y = ±22,       seat = 28px → 36px desde el borde
 *   - Half-moon:        radio = width/2 + 22 → 34px desde el borde
 * Usamos 48 para tener un margen visual limpio entre el asiento más
 * externo y el dashed border de selección.
 */
const SEAT_PADDING = 48;

/**
 * Padding para `lounge_table`. Los asientos del lounge (sillón,
 * bancas, poufs) ya están DENTRO del bounding box del elemento
 * (a diferencia de las mesas regulares donde los asientos se
 * distribuyen AFUERA del borde). Por eso este padding es 0: agregar
 * padding extra solo agrandaría el bounding box sin necesidad
 * visual, y haría que el resize se sienta "suelto".
 */
const LOUNGE_SEAT_PADDING = 0;

function TableElement({ element }: { element: SeatingElement }) {
  const isSingleSelected = useSeatingStore(
    (state) => state.selectedElementId === element.id,
  );
  const selectedIds = useSelectedIdsSet();
  const isSelectedInBulk = selectedIds.has(element.id);
  const isSelected = isSingleSelected || isSelectedInBulk;

  const setSelectedElementId = useSeatingStore(
    (state) => state.setSelectedElementId,
  );
  const setSelectedElementIds = useSeatingStore(
    (state) => state.setSelectedElementIds,
  );

  const guestMap = useGuestLookupMap();

  const isTable = element.seats !== undefined && element.seats > 0;
  const isArea = !isTable;
  const isStructural = STRUCTURAL_TYPES.has(element.type);
  const isUtility = UTILITY_TYPES.has(element.type);
  const layer = getElementLayer(element.type);

  // Padding del bounding box: 0 para lounge_table (sus asientos
  // viven DENTRO del elemento), 48 para el resto de las mesas
  // (cuyos asientos se distribuyen AFUERA del borde).
  const seatPadding =
    element.type === "lounge_table" ? LOUNGE_SEAT_PADDING : SEAT_PADDING;

  // Resize: TODOS los elementos (mesas, áreas, utilidades, estructurales) tienen resize
  const allowResize = true;
  const lockAxis = AXIS_LOCKED_TYPES[element.type];
  const lockAspectRatio = SQUARE_ASPECT_TYPES.has(element.type);

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
  } = useElementResize(element.id, { lockAxis, lockAspectRatio });

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDroppableRef(node);
      setDraggableRef(node);
    },
    [setDroppableRef, setDraggableRef],
  );

  // Re-render a 60fps durante el drag activo.
  //
  // ¿Por qué? Porque el `transformStyle` de los elementos que NO son
  // el activo pero sí están en la selección en masa (bulk) lee
  // `globalActive.rect.current.translated` e `globalActive.rect.current.
  // initial` para calcular su delta. Esos son REFS de dnd-kit, no state
  // de React, así que un cambio en ellos no dispara re-render por sí
  // solo. Sin este RAF loop, los "acompañantes" del drag multi-select
  // solo se actualizarían al final del drag, dando un movimiento
  // entrecortado.
  //
  // El loop solo se monta cuando este elemento es el que se está
  // arrastrando O forma parte de la selección en masa.
  const [, forceRender] = useState(0);
  useEffect(() => {
    if (!globalActive) return;
    if (globalActive.data.current?.type !== "element") return;
    const activeId = globalActive.id as string;
    const isThisElementDragging = activeId === `element-${element.id}`;
    if (!isThisElementDragging && !isSelectedInBulk) return;

    let raf = 0;
    const tick = () => {
      forceRender((n) => (n + 1) & 0xffff);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [globalActive, isSelectedInBulk, element.id]);

  // Transform: combina drag translate3d + rotación
  const transformStyle = (() => {
    const rotation = element.rotation ?? 0;

    if (transform) {
      const currentZoom = useZoomStore.getState().zoom;
      return `translate3d(${transform.x / currentZoom}px, ${
        transform.y / currentZoom
      }px, 0) rotate(${rotation}deg)`;
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
      return `translate3d(${deltaX / currentZoom}px, ${deltaY / currentZoom}px, 0) rotate(${rotation}deg)`;
    }

    if (rotation !== 0) {
      return `rotate(${rotation}deg)`;
    }

    return undefined;
  })();

  const isPartOfActiveDrag =
    isSelectedInBulk &&
    globalActive &&
    globalActive.data.current?.type === "element";

  const renderResizeHandles = useCallback(() => {
    if (!isSingleSelected || !allowResize) return null;
    return (
      <>
        {RESIZE_HANDLES.map((h) => (
          <div
            key={h.id}
            className={`absolute w-4 h-4 bg-white border-[2.5px] border-[#C5A669] rounded-full z-[60] shadow-md hover:scale-125 transition-transform pointer-events-auto ${h.cursor}`}
            style={h.style}
            onPointerDown={(e) => onPointerDownResize(e, h.id)}
            onPointerMove={onPointerMoveResize}
            onPointerUp={onPointerUpResize}
            onPointerCancel={onPointerUpResize}
            // Tras un resize el navegador dispara `click` en el handle.
            // Si lo dejamos burbujear, la card lo recibe y ejecuta
            // `setSelectedElementId(null)`, deseleccionando la mesa y
            // cerrando el sidebar de edición. Lo cortamos acá.
            onClick={(e) => e.stopPropagation()}
          />
        ))}
      </>
    );
  }, [
    isSingleSelected,
    allowResize,
    onPointerDownResize,
    onPointerMoveResize,
    onPointerUpResize,
  ]);

  // ─────────────────────────────────────────────────────────────
  // HANDLE DE ROTACIÓN EN EL CANVAS
  // Aparece arriba del elemento cuando está seleccionado.
  // Se arrastra para rotar el elemento alrededor de su centro.
  //
  // El handle y la línea de unión se renderizan DENTRO de la card,
  // por lo que ROTAN con el elemento. Esto es más natural: el handle
  // siempre está en la parte "superior" del elemento desde su
  // perspectiva local, igual que en PowerPoint.
  // ─────────────────────────────────────────────────────────────
  const rotationStateRef = useRef<{
    initialAngle: number;
    initialRotation: number;
  } | null>(null);

  const rotation = element.rotation ?? 0;
  // Centro del elemento en coordenadas del mundo (no se ve afectado
  // por la rotación porque la rotación es alrededor del centro).
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;

  // Posición del handle EN COORDENADAS DE LA CARD (con el padding
  // de SEAT_PADDING para mesas, o 0 para zonas). Como está dentro
  // de la card, rota con el elemento.
  const HANDLE_OFFSET = 70; // separación pronunciada del elemento
  const HANDLE_SIZE = 28; // w-7 h-7
  const ROTATION_SNAP = 15;
  const cardWidth = element.width + (isTable ? seatPadding * 2 : 0);
  const elementTopY = isTable ? seatPadding : 0;
  // x: centro horizontal de la card (que coincide con el centro
  //    del elemento gracias al padding simétrico de SEAT_PADDING).
  // y: HANDLE_OFFSET arriba del borde superior del elemento.
  const handleX = cardWidth / 2;
  const handleY = elementTopY - HANDLE_OFFSET;
  // Línea de unión: del borde superior del elemento (elementTopY)
  // hasta el borde inferior del handle (handleY + HANDLE_SIZE).
  const lineTopY = handleY + HANDLE_SIZE;
  const lineHeight = elementTopY - lineTopY;

  const handleRotationPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const canvasEl = document.querySelector(".canvas-droppable-area");
      if (!canvasEl) return;
      const canvasRect = canvasEl.getBoundingClientRect();
      const zoom = useZoomStore.getState().zoom;

      const centerXScreen = centerX * zoom + canvasRect.left;
      const centerYScreen = centerY * zoom + canvasRect.top;

      const initialAngle =
        Math.atan2(
          e.clientY - centerYScreen,
          e.clientX - centerXScreen,
        ) *
        (180 / Math.PI);

      rotationStateRef.current = {
        initialAngle,
        initialRotation: rotation,
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [element.id, centerX, centerY, rotation],
  );

  const handleRotationPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = rotationStateRef.current;
      if (!state) return;

      const canvasEl = document.querySelector(".canvas-droppable-area");
      if (!canvasEl) return;
      const canvasRect = canvasEl.getBoundingClientRect();
      const zoom = useZoomStore.getState().zoom;

      const centerXScreen = centerX * zoom + canvasRect.left;
      const centerYScreen = centerY * zoom + canvasRect.top;

      const currentAngle =
        Math.atan2(
          e.clientY - centerYScreen,
          e.clientX - centerXScreen,
        ) *
        (180 / Math.PI);

      const deltaAngle = currentAngle - state.initialAngle;
      const rawRotation = state.initialRotation + deltaAngle;
      // Snap a múltiplos de 15° para mantener la grilla consistente.
      const snappedRotation = Math.round(rawRotation / ROTATION_SNAP) * ROTATION_SNAP;

      useSeatingStore.getState().updateElementRotation(element.id, snappedRotation);
    },
    [element.id, centerX, centerY],
  );

  const handleRotationPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (rotationStateRef.current) {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        rotationStateRef.current = null;
      }
    },
    [],
  );

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
      data-is-structural={isStructural}
      data-is-utility={isUtility}
      data-layer={layer}
      data-type={element.type}
      style={{
        // Para mesas: expandimos el contenedor con SEAT_PADDING para
        // que el área clickable/draggeable/redimensionable incluya
        // los asientos. Para el resto de elementos, comportamiento
        // idéntico al anterior (padding = 0).
        left: element.x - (isTable ? seatPadding : 0),
        top: element.y - (isTable ? seatPadding : 0),
        width: element.width + (isTable ? seatPadding * 2 : 0),
        height: element.height + (isTable ? seatPadding * 2 : 0),
        transform: transformStyle,
        transformOrigin: "50% 50%",
        // Para zone_shape: la card NO captura pointer events. Solo
        // los 4 border strips y el texto tienen pointer-events:auto,
        // así el hover (y por tanto el "bring to front") solo se
        // dispara al pasar por el borde o por el texto, NO por el
        // centro transparente. Para mesas/estructura/utilidad se
        // mantiene el comportamiento normal.
        ...(element.type === "zone_shape"
          ? { pointerEvents: "none" as const }
          : {}),
        touchAction: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        // Si hay múltiples elementos seleccionados (multi-selección
        // via drag-to-select del canvas), un click aislado sobre
        // UN elemento debe deseleccionar los demás y dejar
        // seleccionado únicamente el elemento clickeado. Así, al
        // arrastrarlo, solo se mueve ese y no el grupo.
        const multiCount = useSeatingStore.getState().selectedElementIds.length;
        if (multiCount > 1) {
          setSelectedElementIds([element.id]);
          setSelectedElementId(element.id);
          return;
        }

        // Comportamiento normal: toggle de selección individual.
        setSelectedElementId(isSingleSelected ? null : element.id);
      }}
    >
      {renderResizeHandles()}

      {/* Dashed border dorado que delimita el ÁREA REDIMENSIONABLE.
          Solo se muestra en MESAS NORMALES (no en lounge_table, áreas
          ni zone_shape). Va 4px adentro del edge del card para no
          chocar con los resize handles (que están en top: -8, etc.).
          Como es `pointer-events: none`, no interfiere con la
          interacción ni con el contenido del element. */}
      {isSingleSelected && isTable && element.type !== "lounge_table" && (
        <div
          className="absolute pointer-events-none border-2 border-dashed border-[#C5A669]/45 rounded-lg"
          style={{
            top: 4,
            left: 4,
            right: 4,
            bottom: 4,
            zIndex: 25,
          }}
        />
      )}

      {/* Contenido del elemento (mesa o área). Las mesas se centran
          dentro del contenedor dejando SEAT_PADDING de margen para
          que los asientos quepan dentro del bounding box. */}
      <div
        className="absolute"
        style={{
          position: "absolute",
          left: isTable ? seatPadding : 0,
          top: isTable ? seatPadding : 0,
          width: element.width,
          height: element.height,
          overflow: isTable ? "visible" : undefined,
          // Para áreas (incluye zone_shape): el contenedor queda
          // transparente a pointer events. El `area-shape` (o los
          // border strips + texto, en zone_shape) decide qué áreas
          // capturan eventos. Así el centro de la zona deja pasar
          // clicks a los elementos que estén detrás.
          pointerEvents: isArea ? "none" : "auto",
        }}
      >
        <ElementShape
          element={element}
          dragAttributes={attributes}
          dragListeners={listeners}
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
      </div>

      {/* Capa de drag: cubre todo el contenedor (incluido el padding
          de los asientos). Los asientos tienen z-20 y los handles z-60,
          por lo que el drag del elemento solo se activa en el área
          "vacía" del padding o sobre la mesa misma. */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute inset-0 cursor-grab active:cursor-grabbing z-0 ${
          // Para zone_shape, el drag lo manejan el texto y el borde
          // dentro de AreaShape. El centro queda libre para arrastrar
          // los elementos que estén dentro de la zona.
          element.type === "zone_shape" ? "pointer-events-none" : ""
        }`}
      />

      {/* ────────────────────────────────────────────────────────
          HANDLE DE ROTACIÓN + LÍNEA DE UNIÓN
          Renderizados DENTRO de la card para que roten con el
          elemento (estilo PowerPoint). El handle siempre queda
          en la parte "superior" del elemento desde su perspectiva
          local, sin importar la rotación aplicada.
          Solo visibles cuando el elemento está single-selected.
          ──────────────────────────────────────────────────────── */}
      {isSingleSelected && (
        <>
          {/* Línea de unión: del borde inferior del handle al borde
              superior del elemento (en coords de la card). */}
          <div
            className="absolute w-px bg-[#C5A669]/50 pointer-events-none"
            style={{
              left: handleX - 0.5, // centrar el 1px sobre handleX
              top: lineTopY,
              height: lineHeight,
            }}
          />

          {/* Handle circular con ícono de rotación */}
          <div
            className="absolute w-7 h-7 rounded-full bg-white border-2 border-[#C5A669] shadow-md flex items-center justify-center cursor-grab z-[55] hover:scale-110 transition-transform pointer-events-auto"
            style={{
              left: handleX - HANDLE_SIZE / 2, // centrar el handle sobre handleX
              top: handleY,
            }}
            onPointerDown={handleRotationPointerDown}
            onPointerMove={handleRotationPointerMove}
            onPointerUp={handleRotationPointerUp}
            onPointerCancel={handleRotationPointerUp}
            onClick={(e) => e.stopPropagation()}
            title="Arrastra para rotar"
          >
            <RotateCw
              size={14}
              className="text-[#C5A669] shrink-0"
              strokeWidth={2.5}
              style={{ transform: "translate(0.5px, 0.5px)" }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(TableElement);
