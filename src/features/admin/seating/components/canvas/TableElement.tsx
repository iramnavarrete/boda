import React, { useCallback, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useSeatingStore } from "../../stores/useSeatingStore";
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
import { getCard, registerCard } from "../../utils/canvas/cardRegistry";
import { useSelectedIdsSet } from "../../hooks/useSelectedIdsSet";
import { useIsElementDragging } from "../../stores/dragStateStore";

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
    isDragging,
  } = useDraggable({
    id: `element-${element.id}`,
    data: { type: "element", element },
  });

  const {
    onPointerDownResize,
    onPointerMoveResize,
    onPointerUpResize,
  } = useElementResize(element.id, { lockAxis, lockAspectRatio });

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      // Registra la card en el module-level `cardRegistry` para que
      // el DragPositionTicker (hijo del DndContext) pueda escribir
      // el `style.transform` directo al DOM durante el drag de un
      // elemento existente (sin pasar por React, eliminando el
      // "doble escritor" que causaba temblor). Al desmontar, `node`
      // llega como `null` y el registro se limpia.
      registerCard(element.id, node);
      setDroppableRef(node);
      setDraggableRef(node);
    },
    [setDroppableRef, setDraggableRef, element.id],
  );

  // Único punto de verdad: ¿este elemento está siendo movido AHORA
  // MISMO (arrastrado directamente o como parte del bulk)? Este
  // selector solo re-renderiza al ENTRAR o SALIR del drag, nunca en
  // cada pointermove — antes usábamos `useDndContext()` y
  // `globalActive.rect.current.translated` lo que hacía re-render
  // de las 50 cards en cada frame.
  const isBeingMoved = useIsElementDragging(element.id);

  // Transform: DragPositionTicker tiene el control exclusivo del
  // `style.transform` mientras dura el drag. React NO escribe nada
  // acá mientras `isBeingMoved` sea true — evita el doble-escritor
  // que causaba el temblor.
  const transformStyle = (() => {
    const rotation = element.rotation ?? 0;

    // Deliberadamente NO depende de `isBeingMoved`. Este valor es el
    // estado "de reposo" del elemento (solo rotación, sin translate).
    // Si dependiera de isBeingMoved, React blanquearía el transform en
    // el commit que activa el drag, antes de que el
    // DragPositionTicker tenga chance de escribir su primer frame —
    // eso produce un parpadeo de 1 frame en elementos rotados. Al
    // mantener este valor CONSTANTE durante todo el ciclo de drag
    // (isBeingMoved true o false), React no vuelve a tocar la
    // propiedad `transform` del DOM mientras se arrastra (bailout de
    // reconciliación: no hay cambio en el valor calculado), dejando
    // al ticker con control exclusivo sin pelear por el nodo.
    if (rotation !== 0) {
      return `rotate(${rotation}deg)`;
    }

    return undefined;
  })();

  const isPartOfActiveDrag = isBeingMoved;

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
  // ─────────────────────────────────────────────────────────────
  // Estilo PowerPoint: el handle está DENTRO de la card (rota con
  // el elemento) y se posiciona arriba del centro horizontal. El
  // usuario arrastra el handle y la card rota siguiendo el cursor
  // alrededor de su centro.
  //
  // Importante sobre coordenadas: `e.clientX`/`e.clientY` son SIEMPRE
  // coordenadas de PANTALLA, pero `element.x`/`element.y` son world
  // (locales al `.canvas-droppable-area`, antes del `scale(zoom)`).
  // Mezclar las dos da un ángulo incorrecto en cualquier zoom != 100%
  // o con el canvas scrolleado. Por eso cacheamos el centro del
  // elemento en coordenadas de pantalla (vía `getBoundingClientRect`
  // del nodo del card registrado en cardRegistry) al pointerdown.
  // Como la rotación es siempre alrededor del centro
  // (transform-origin: 50% 50%, sin translate), ese centro coincide
  // con el centro real sin importar zoom, scroll o la rotación actual.
  const rotation = element.rotation ?? 0;
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;

  const HANDLE_OFFSET = 70; // separación pronunciada del elemento
  const HANDLE_SIZE = 28; // w-7 h-7
  const ROTATION_SNAP = 15;
  const cardWidth = element.width + (isTable ? seatPadding * 2 : 0);
  const elementTopY = isTable ? seatPadding : 0;
  const handleX = cardWidth / 2;
  const handleY = elementTopY - HANDLE_OFFSET;
  // Línea de unión: del borde inferior del handle al borde superior
  // del elemento (en coords de la card, antes de rotar).
  const lineTopY = handleY + HANDLE_SIZE;
  const lineHeight = elementTopY - lineTopY;

  // Ref con el estado del gesto de rotación. El centro se cachea en
  // coordenadas de PANTALLA al pointerdown, así que no hace falta
  // reconvertir zoom/scroll durante el gesto.
  const rotationStateRef = useRef<{
    initialAngle: number; // ángulo cursor→centro al pointerdown
    initialRotation: number; // rotación del elemento al pointerdown
    screenCenterX: number;
    screenCenterY: number;
    lastAppliedRotation: number; // último valor snappeado escrito al store
  } | null>(null);

  // Controla si la transición CSS de la card debe desactivarse. A
  // diferencia de `isBeingMoved` (que solo cubre el drag de dnd-kit),
  // esto cubre el gesto de rotación, que corre por fuera de dnd-kit.
  // Sin esto, cada cambio de rotación durante el drag se anima por
  // la transición CSS de la card, produciendo un salto/lag visible
  // sobre todo en el primer movimiento del gesto.
  const [isRotating, setIsRotating] = useState(false);

  const updateElementRotation = useSeatingStore(
    (s) => s.updateElementRotation,
  );

  const handleRotationPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // CRÍTICO: parar la propagación para que dnd-kit NO vea este
      // pointerdown. Si lo viera, iniciaría un drag del elemento en
      // lugar de una rotación.
      e.stopPropagation();
      e.preventDefault();

      // El centro debe calcularse en coordenadas de PANTALLA, no en
      // las coordenadas "world" de element.x/y — el canvas está
      // escalado por zoom (transform: scale(zoom)), así que mezclar
      // world coords con e.clientX/Y (que siempre son screen coords)
      // da un ángulo incorrecto en cualquier zoom != 100% o con el
      // canvas scrolleado. Usamos el bounding rect real del card: como
      // la rotación es siempre alrededor del centro (transform-origin:
      // 50% 50%, sin translate), su centro coincide con el centro real
      // del elemento sin importar zoom, scroll o la rotación actual.
      const cardEl = getCard(element.id);
      const rect = cardEl?.getBoundingClientRect();
      const screenCenterX = rect ? rect.left + rect.width / 2 : centerX;
      const screenCenterY = rect ? rect.top + rect.height / 2 : centerY;

      const startAngle =
        Math.atan2(
          e.clientY - screenCenterY,
          e.clientX - screenCenterX,
        ) * (180 / Math.PI);

      rotationStateRef.current = {
        initialAngle: startAngle,
        initialRotation: rotation,
        screenCenterX,
        screenCenterY,
        lastAppliedRotation: rotation,
      };

      // Desactiva la transición CSS de la card durante todo el gesto
      // (ver diagnóstico arriba) — evita el brinco/lag al rotar.
      setIsRotating(true);

      // Captura el pointer: garantiza que pointermove/pointerup se
      // sigan disparando aunque el cursor salga del handle.
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [element.id, centerX, centerY, rotation],
  );

  const handleRotationPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = rotationStateRef.current;
      if (!state) return;
      e.stopPropagation();

      const currentAngle =
        Math.atan2(
          e.clientY - state.screenCenterY,
          e.clientX - state.screenCenterX,
        ) * (180 / Math.PI);

      // Delta en grados. atan2 devuelve -180..180, así que el delta
      // puede cruzar el límite y dar saltos. Normalizamos a -180..180.
      let delta = currentAngle - state.initialAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const newRotation = state.initialRotation + delta;

      // Snap a pasos de ROTATION_SNAP (15°) EN CADA FRAME del gesto,
      // no solo al soltar. La rotación nunca debe tener decimales,
      // ni siquiera mientras se arrastra — se mueve de notch en notch.
      const snappedRaw =
        Math.round(newRotation / ROTATION_SNAP) * ROTATION_SNAP;
      const normalized = ((snappedRaw % 360) + 360) % 360;

      // Evita escribir al store si el valor snappeado no cambió desde
      // el último frame (el cursor sigue dentro del mismo notch de
      // 15°) — reduce renders innecesarios durante el arrastre.
      if (normalized !== state.lastAppliedRotation) {
        state.lastAppliedRotation = normalized;
        updateElementRotation(element.id, normalized);
      }
    },
    [element.id, updateElementRotation],
  );

  const handleRotationPointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    // Ya no hace falta re-snapear acá: handleRotationPointerMove
    // garantiza que el store siempre queda en un múltiplo de
    // ROTATION_SNAP durante todo el gesto.
    rotationStateRef.current = null;
    setIsRotating(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Si el pointer ya no está capturado, ignorar.
    }
  }, []);

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
        // Mientras dura el drag, indicamos al browser que prepare la
        // composición del transform (evita primer-frame lag) y
        // desactivamos cualquier transition de hover/selección que
        // pudiera sumar latencia al escribir style.transform directo.
        willChange: isBeingMoved || isRotating ? "transform" : undefined,
        transition: isBeingMoved || isRotating ? "none" : undefined,
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
          Se renderiza SIEMPRE; la visibilidad se delega a CSS vía
          `data-` attributes del card padre (ver globals.css:
          .selection-dashed + .table-element-card[data-selected=...]
          [data-is-table=true]:not([data-type="lounge_table"])).
          Así React no re-renderiza el TableElement cuando cambia
          la selección — el navegador se encarga del toggle.
          Como es `pointer-events: none`, no interfiere con la
          interacción ni con el contenido del element. */}
      <div
        className="selection-dashed absolute pointer-events-none border-2 border-dashed border-[#C5A669]/45 rounded-lg"
        style={{
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          zIndex: 25,
        }}
      />

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
          Estilo PowerPoint: handle dentro de la card (rota con el
          elemento), snap a 15°, offset 70px arriba del centro.
          Se muestra solo cuando el elemento está single-selected.
          ──────────────────────────────────────────────────────── */}
      {isSingleSelected && (
        <>
          {/* Línea de unión: del borde inferior del handle al borde
              superior del elemento (en coords de la card, antes de
              rotar). Como está DENTRO de la card, también rota con
              el elemento, manteniendo la conexión visual. */}
          <div
            className="absolute w-px bg-[#C5A669]/50 pointer-events-none"
            style={{
              left: handleX - 0.5, // centrar el 1px sobre handleX
              top: lineTopY,
              height: lineHeight,
            }}
          />

          {/* Handle circular con ícono de rotación. Captura el
              pointer para que el gesto funcione aunque el cursor
              salga del handle. */}
          <div
            className="absolute w-7 h-7 rounded-full bg-white border-2 border-[#C5A669] shadow-md flex items-center justify-center cursor-grab z-[55] hover:scale-110 transition-transform pointer-events-auto"
            style={{
              left: handleX - HANDLE_SIZE / 2, // centrado en handleX
              top: handleY,
            }}
            onPointerDown={handleRotationPointerDown}
            onPointerMove={handleRotationPointerMove}
            onPointerUp={handleRotationPointerUp}
            onPointerCancel={handleRotationPointerUp}
            onClick={(e) => e.stopPropagation()}
            title="Arrastra para rotar (snap a 15°)"
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

export default React.memo(
  TableElement,
  /**
   * Comparator fino: solo re-render si cambió algo que AFECTA el
   * render visual del card. Si todos los campos clave son iguales,
   * retornamos `true` (no re-render). Esto evita que React evalúe
   * el TableElement cuando el store devuelve un objeto `element`
   * nuevo (referencia distinta) pero con los mismos valores.
   *
   * NO incluimos aquí campos de selección (`selectedElementId` /
   * `selectedElementIds`) porque el estado de selección ya está
   * delegado a CSS vía `data-` attributes — el navegador se
   * encarga del toggle del border/sombra sin re-render de React.
   */
  (prev, next) => {
    const a = prev.element;
    const b = next.element;
    return (
      a.id === b.id &&
      a.x === b.x &&
      a.y === b.y &&
      a.width === b.width &&
      a.height === b.height &&
      a.rotation === b.rotation &&
      a.seats === b.seats &&
      a.assignedSeats === b.assignedSeats &&
      a.type === b.type &&
      a.alias === b.alias &&
      a.seatPosition === b.seatPosition &&
      a.textPosition === b.textPosition &&
      a.columnShape === b.columnShape
    );
  },
);
