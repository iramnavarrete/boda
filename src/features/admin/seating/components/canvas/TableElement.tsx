import React, { useCallback, useEffect, useRef } from "react";
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
import {
  registerCard,
  unregisterCard,
  setCardRotation,
} from "../../utils/canvas/dragInterpolator";

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

  const { active: globalActive } = useDndContext();
  const {
    onPointerDownResize,
    onPointerMoveResize,
    onPointerUpResize,
  } = useElementResize(element.id, { lockAxis, lockAspectRatio });

  // Ref local al div del card para escribir el transform directo
  // al DOM (sin pasar por React) durante el drag. Se combina con
  // `setNodeRef` para no tener dos refs separadas.
  const cardRef = useRef<HTMLElement | null>(null);

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      cardRef.current = node;
      setDroppableRef(node);
      setDraggableRef(node);
    },
    [setDroppableRef, setDraggableRef],
  );

  // ──────────────────────────────────────────────────────────────────
  // REF para `globalActive` que cambia DURANTE el drag sin re-registrar
  // ──────────────────────────────────────────────────────────────────
  // `globalActive` cambia en CADA `pointermove` durante un drag. Si lo
  // pusiéramos como dependencia del `useEffect` que registra la card en
  // el interpolator, el effect se re-ejecutaría cada frame → el cleanup
  // llamaría `unregisterCard` (que limpia `style.transform`) → la card
  // saltaría a su posición original → sensación de "scroll raro" en
  // multi-select.
  //
  // Solución: lo almacenamos en un ref que se actualiza en cada render
  // (sin causar re-ejecución del effect), y el `computeTarget` del
  // interpolator lo lee directamente desde el ref.
  // ──────────────────────────────────────────────────────────────────
  const globalActiveRef = useRef(globalActive);
  // Actualizar el ref en un effect (no durante render). El ref solo
  // se lee dentro del `computeTarget` del interpolador (que se
  // ejecuta en cada frame, fuera del ciclo de React), así que
  // mantenerlo sincronizado vía effect es seguro y respeta la
  // regla de React 19: "refs son valores, no se accede durante
  // render".
  useEffect(() => {
    globalActiveRef.current = globalActive;
  }, [globalActive]);

  // Booleano que indica si ESTA card debe estar registrada en el
  // interpolator durante el drag actual. Solo cambia 2 veces:
  // al iniciar el drag (true) y al terminar (false). NO cambia
  // en cada pointermove, así que es seguro como dependencia del
  // useEffect.
  const isActiveDrag =
    globalActive?.data.current?.type === "element" &&
    (globalActive.id === `element-${element.id}` || isSelectedInBulk);

  // ──────────────────────────────────────────────────────────────────
  // INTERPOLACIÓN / SUAVIZADO DEL DRAG (Opción D + RAF global)
  // ──────────────────────────────────────────────────────────────────
  // El RAF loop es GLOBAL y COMPARTIDO entre todos los TableElements
  // (ver `utils/canvas/dragInterpolator.ts`). Esto garantiza que en
  // multi-select, TODAS las mesas se actualicen en el mismo frame
  // con el mismo target, eliminando el desfase que existía cuando
  // cada mesa tenía su propio RAF.
  //
  // CRÍTICO: este effect SOLO se ejecuta cuando `isActiveDrag` cambia
  // de booleano, NO en cada pointermove. Lee los valores actuales de
  // `globalActive` a través del ref `globalActiveRef`, no del closure.
  // ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isActiveDrag) return;

    const card = cardRef.current;
    if (!card) return;

    // `computeTarget` es un closure que el interpolator global evalúa
    // en cada frame. Lee los valores MÁS RECIENTES de dnd-kit desde
    // refs (que se actualizan en cada render sin re-registrar la card)
    // y devuelve el delta a aplicar en coords del mundo (post-zoom).
    //
    // IMPORTANTE: TODAS las cards (la arrastrada Y las del bulk) usan
    // la MISMA fuente de verdad: `active.rect.current.translated -
    // active.rect.current.initial`. dnd-kit actualiza `translated` en
    // cada `pointermove`, incluyendo cuando hay auto-scroll (los rects
    // son posiciones absolutas de pantalla via getBoundingClientRect,
    // que ya reflejan el scroll actual). El delta resultante es el
    // movimiento real en coords de pantalla, que dividimos por zoom
    // para obtener el delta en world coords (coords del canvas).
    const computeTarget = (): { x: number; y: number } | null => {
      const active = globalActiveRef.current;
      if (!active) return null;
      const currentZoom = useZoomStore.getState().zoom;

      if (
        active.rect.current.translated &&
        active.rect.current.initial
      ) {
        const deltaX =
          active.rect.current.translated.left -
          active.rect.current.initial.left;
        const deltaY =
          active.rect.current.translated.top -
          active.rect.current.initial.top;
        return {
          x: deltaX / currentZoom,
          y: deltaY / currentZoom,
        };
      }
      return null;
    };


    registerCard(element.id, card, computeTarget);
    // Leer la rotación actual del store (no del closure) para que
    // setCardRotation tenga el valor más reciente aunque el elemento
    // se re-rotara justo antes de empezar el drag.
    const currentRotation = useSeatingStore.getState().elements.find(
      (el) => el.id === element.id
    )?.rotation ?? 0;
    setCardRotation(element.id, currentRotation);

    return () => {
      // Leer la rotación FINAL del store (no del closure) para que
      // unregisterCard aplique la rotación correcta al DOM de forma
      // síncrona, evitando el bug donde el elemento aparecía en 0°
      // aunque el store dijera 90°.
      const finalRotation = useSeatingStore.getState().elements.find(
        (el) => el.id === element.id
      )?.rotation ?? 0;
      unregisterCard(element.id, finalRotation);
    };
    // Solo `isActiveDrag` cambia → effect se ejecuta 2 veces por drag
    // (inicio y fin), NO en cada pointermove.
  }, [isActiveDrag, element.id]);

  // Transform para React: solo `rotate` cuando NO hay drag activo.
  // Durante el drag, el interpolator global se encarga del transform.
  const transformStyle = (() => {
    const rotation = element.rotation ?? 0;

    if (globalActive && globalActive.data.current?.type === "element") {
      const activeId = globalActive.id as string;
      const isThisElementDragging = activeId === `element-${element.id}`;
      if (isThisElementDragging || isSelectedInBulk) {
        return undefined;
      }
    }

    if (rotation !== 0) {
      return `rotate(${rotation}deg)`;
    }

    // IMPORTANTE: retornar `"none"` (NO `undefined`) cuando no hay
    // rotación. ¿Por qué? React solo pone en su style-cache las
    // propiedades con valores truthy/strings. Si retornamos
    // `undefined`, React IGNORA la propiedad `transform` y NO
    // sobrescribe cualquier valor residual que haya dejado el
    // interpolador (`rotate(0deg) translate3d(X, Y, 0)` queda en
    // el DOM tras el drag). Con `"none"`, React SIEMPRE escribe
    // `style.transform = "none"` y limpia el residuo → la card
    // queda exactamente en su posición CSS (`left/top`).
    return "none";
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
  // HANDLE DE ROTACIÓN EN EL CANVAS — TEMPORALMENTE DESHABILITADO
  // ─────────────────────────────────────────────────────────────
  // TODO: Re-habilitar cuando se pula el comportamiento del drag
  // con elementos rotados. Hay un bug donde el `translate3d` del
  // interpolador compone incorrectamente con el `rotate` aplicado
  // por React, causando que la card se desplace en la dirección
  // equivocada cuando tiene rotación ≠ 0.
  //
  // Por ahora el handle NO se renderiza en el canvas. La
  // rotación se mantiene en el store (no se borra el campo
  // `element.rotation`) para que cuando esté listo, los datos
  // previos no se pierdan.
  //
  // El bloque original está comentado abajo como referencia.
  // ─────────────────────────────────────────────────────────────
  /*
  const rotationStateRef = useRef<{
    initialAngle: number;
    initialRotation: number;
  } | null>(null);

  const rotation = element.rotation ?? 0;
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  const HANDLE_OFFSET = 70;
  const HANDLE_SIZE = 28;
  const ROTATION_SNAP = 15;
  const cardWidth = element.width + (isTable ? seatPadding * 2 : 0);
  const elementTopY = isTable ? seatPadding : 0;
  const handleX = cardWidth / 2;
  const handleY = elementTopY - HANDLE_OFFSET;
  const lineTopY = handleY + HANDLE_SIZE;
  const lineHeight = elementTopY - lineTopY;

  const handleRotationPointerDown = useCallback(
    (e: React.PointerEvent) => { ... },
    [element.id, centerX, centerY, rotation],
  );
  const handleRotationPointerMove = useCallback(
    (e: React.PointerEvent) => { ... },
    [element.id, centerX, centerY],
  );
  const handleRotationPointerUp = useCallback(
    (e: React.PointerEvent) => { ... },
    [],
  );
  */

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
          TEMPORALMENTE DESHABILITADO — ver comentario arriba.
          Cuando esté listo el drag con rotación, descomentar
          este bloque y las variables/handlers asociados.
          ──────────────────────────────────────────────────────── */}
      {false && isSingleSelected && (
        <>
          {/* Línea de unión: del borde inferior del handle al borde
              superior del elemento (en coords de la card). */}
          <div
            className="absolute w-px bg-[#C5A669]/50 pointer-events-none"
            style={{
              left: 0 - 0.5, // centrar el 1px sobre handleX (deshabilitado)
              top: 0,        // (deshabilitado)
              height: 0,     // (deshabilitado)
            }}
          />

          {/* Handle circular con ícono de rotación (deshabilitado) */}
          <div
            className="absolute w-7 h-7 rounded-full bg-white border-2 border-[#C5A669] shadow-md flex items-center justify-center cursor-grab z-[55] hover:scale-110 transition-transform pointer-events-auto"
            style={{
              left: 0, // centrado sobre handleX (deshabilitado)
              top: 0,
            }}
            onClick={(e) => e.stopPropagation()}
            title="Arrastra para rotar (próximamente)"
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
