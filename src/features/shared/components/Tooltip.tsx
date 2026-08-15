"use client";

import {
  ReactNode,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  useSyncExternalStore,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@heroui/theme";

const GAP = 8;
const CLOSE_DELAY = 120; // ms — puente entre wrapper y tooltip
const VIEWPORT_MARGIN = 8; // px — margen mínimo al borde del viewport

// Funciones a nivel de módulo para `useSyncExternalStore`.
// Más estables que definirlas dentro del componente y evita el
// warning de "Calling setState synchronously within an effect"
// que aparecía con el patrón `useEffect(() => setMounted(true), [])`.
const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface TooltipProps {
  children: ReactNode;
  text: string | ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  align?: "center" | "left" | "right";
  interactive?: boolean;
}

interface Coords {
  top: number;
  left: number;
}

type TooltipPosition = "top" | "bottom" | "left" | "right";

/**
 * Handle imperativo expuesto vía `ref` para controlar el tooltip
 * desde el padre. Útil cuando necesitás cerrarlo en un momento
 * específico (p.ej. antes de abrir un modal) sin depender del
 * event bubbling — que se rompe si el child hace `stopPropagation`.
 */
export interface TooltipRef {
  /** Cierra el tooltip inmediatamente (cancela timers pendientes). */
  close: () => void;
}

const Tooltip = forwardRef<TooltipRef, TooltipProps>(function Tooltip({
  children,
  text,
  className,
  position = "bottom",
  align = "center",
  interactive = false,
}, ref) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // `mounted` vía useSyncExternalStore: false en SSR, true en cliente.
  // No causa el warning de cascading render.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  // Limpia el timer pendiente al desmontar
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Ocultar el tooltip ante cualquier scroll (ventana o contenedor padre).
  // El scroll mueve al wrapper de su posición cached, así que recalcular
  // cada frame sería costoso — es más simple cerrarlo.
  useEffect(() => {
    if (!open) return;
    const handleScroll = () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setOpen(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  // Handlers de hover con puente: dan 120ms para que el cursor cruce del
  // wrapper al tooltip (o viceversa) sin que se cierre. Es la técnica
  // estándar para tooltips con contenido interactivo (botones, links).
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, CLOSE_DELAY);
  }, [cancelClose]);

  const handleOpen = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  /**
   * Expone un handle imperativo para que el padre pueda cerrar el
   * tooltip en un momento específico (p.ej. antes de abrir un modal),
   * sin depender del event bubbling — que se rompe si el child hace
   * `e.stopPropagation()` en su onClick.
   *
   *   const tooltipRef = useRef<TooltipRef>(null);
   *   const handleDelete = (e) => {
   *     e.stopPropagation();
   *     tooltipRef.current?.close();   // ← cierra antes de abrir el modal
   *     triggerModal(...);
   *   };
   *   <Tooltip ref={tooltipRef} ...>
   *     <button onClick={handleDelete}>...</button>
   *   </Tooltip>
   */
  useImperativeHandle(
    ref,
    () => ({
      close: () => {
        cancelClose();
        setOpen(false);
      },
    }),
    [cancelClose],
  );

  // Calcular coordenadas en función del wrapper + tamaño medido del tooltip.
  // Implementa auto-flip: si no cabe en la posición solicitada, se voltea
  // al lado opuesto. Y clamp final al viewport como red de seguridad.
  const computeCoords = useCallback((): {
    coords: Coords;
    actualPosition: TooltipPosition;
  } => {
    if (!wrapperRef.current) {
      return { coords: { top: 0, left: 0 }, actualPosition: position };
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    // Defaults razonables mientras se mide la primera vez
    const w = size.width || 220;
    const h = size.height || 40;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Auto-flip: si no cabe en la posición pedida, usar la opuesta.
    let actual: TooltipPosition = position;
    if (position === "top" && rect.top - h - GAP < VIEWPORT_MARGIN) {
      actual = "bottom";
    } else if (
      position === "bottom" &&
      vh - rect.bottom - h - GAP < VIEWPORT_MARGIN
    ) {
      actual = "top";
    } else if (position === "left" && rect.left - w - GAP < VIEWPORT_MARGIN) {
      actual = "right";
    } else if (position === "right" && vw - rect.right - w - GAP < VIEWPORT_MARGIN) {
      actual = "left";
    }

    let top = 0;
    let left = 0;

    // Compensación para `align="right"`: el borde derecho del tooltip
    // queda matemáticamente alineado con el del trigger, pero en la
    // práctica se ve corrido ~4-6px a la izquierda por el border de
    // 1px del propio tooltip + el padding del botón. Este offset lo
    // empuja a la derecha para que el triángulo apunte visualmente
    // al centro del botón (no a su borde).
    const RIGHT_ALIGN_NUDGE = 12;

    switch (actual) {
      case "top":
        top = rect.top - h - GAP;
        left =
          align === "center"
            ? rect.left + rect.width / 2 - w / 2
            : align === "right"
              ? rect.right - w + RIGHT_ALIGN_NUDGE
              : rect.left;
        break;
      case "bottom":
        top = rect.bottom + GAP;
        left =
          align === "center"
            ? rect.left + rect.width / 2 - w / 2
            : align === "right"
              ? rect.right - w + RIGHT_ALIGN_NUDGE
              : rect.left;
        break;
      case "left":
        top = rect.top + rect.height / 2 - h / 2;
        left = rect.left - w - GAP;
        break;
      case "right":
        top = rect.top + rect.height / 2 - h / 2;
        left = rect.right + GAP;
        break;
    }

    // Clamp final: garantiza que el tooltip siempre quede dentro del viewport,
    // aunque el flip no haya sido suficiente (p.ej. item muy pequeño en una
    // zona ya cercana al borde).
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - h - VIEWPORT_MARGIN));
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - w - VIEWPORT_MARGIN));

    return { coords: { top, left }, actualPosition: actual };
  }, [position, align, size]);

  /**
   * EFECTOS DE MEDICIÓN POST-RENDER
   *
   * Estos `useLayoutEffect` SON el patrón estándar de React para
   * sincronizar state con el DOM (leer `getBoundingClientRect`,
   * `offsetWidth`, etc.). El linter `react-hooks/set-state-in-effect`
   * los marca como warning porque el setState está en el body del
   * effect, pero en este caso NO se puede derivar el valor durante
   * render (necesitamos medir el DOM post-render). El propio React
   * docs recomienda `eslint-disable-next-line` para estos casos:
   * https://react.dev/learn/you-might-not-need-an-effect#reading-latest-state-and-props
   *
   * `useLayoutEffect` (no `useEffect`) es clave: corre síncronamente
   * antes de que el browser pinte, así que el usuario nunca ve el
   * "primer frame" con valores incorrectos — el browser solo pinta
   * cuando ya tenemos las medidas reales.
   */

  // Tras abrir o cambiar el texto, medir el tooltip y guardar su tamaño.
  useLayoutEffect(() => {
    if (!open || !tooltipRef.current) return;
    const w = tooltipRef.current.offsetWidth;
    const h = tooltipRef.current.offsetHeight;
    if (w !== size.width || h !== size.height) {
      setSize({ width: w, height: h });
    }
  }, [open, text, size]);

  // Recalcular coordenadas y posición final (con auto-flip) cuando
  // cambien las dependencias (open, size medida, position, align).
  useLayoutEffect(() => {
    if (!open) return;
    const result = computeCoords();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoords(result.coords);
    setActualPosition(result.actualPosition);
  }, [open, computeCoords]);

  return (
    <>
      <div
        ref={wrapperRef}
        className={cn(
          "relative flex items-center justify-center shrink-0 cursor-help",
          className,
        )}
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
        onTouchStart={handleOpen}
      >
        {children}
      </div>

      {/* Portal al body: escapa del stacking context del item virtualizado,
          garantizando que el tooltip quede encima de TODO sin importar
          el z-index de los vecinos. */}
      {mounted && open
        ? createPortal(
            <div
              ref={tooltipRef}
              role="tooltip"
              className={cn(
                "fixed z-[9999] transition-opacity duration-200",
                open ? "opacity-100" : "opacity-0",
                !interactive && "pointer-events-none",
              )}
              style={{ top: coords.top, left: coords.left }}
              // El tooltip también participa del puente: si el cursor
              // entra, cancela cualquier cierre pendiente del wrapper.
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="relative w-max max-w-[220px] sm:max-w-[260px] p-2.5 px-3 bg-white border border-[#EBE5DA] shadow-[0_10px_40px_-10px_rgba(44,44,41,0.2)] rounded-xl text-xs text-[#5A5A5A] text-center">
                {typeof text === "string" ? (
                  <p className="leading-relaxed relative z-10">{text}</p>
                ) : (
                  <div className="relative z-10">{text}</div>
                )}

                <div
                  className={cn(
                    "absolute w-[12px] h-[12px] bg-white border-[#EBE5DA] rotate-45 pointer-events-none",
                    getArrowClasses(actualPosition, align),
                  )}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
});

export default Tooltip;

function getArrowClasses(
  position: TooltipPosition,
  align: "center" | "left" | "right",
): string {
  const horizontalAlign = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-4",
    right: "right-4",
  }[align];

  const verticalAlign = "top-1/2 -translate-y-1/2";

  /**
   * MISMA técnica que `TableSettingsPopover` (líneas 214-217):
   *
   *   <div class="absolute ... w-3 h-3 bg-... border-r border-b border-... rotate-45"
   *        style="bottom: -5" />
   *
   * El "triángulo" es un cuadrado 12×12 rotado 45°. Se posiciona con
   * `-bottom-[5px]` (AFUERA del tooltip). La mitad que queda DENTRO
   * del tooltip se oculta naturalmente porque su `bg-white` coincide
   * con el `bg-white` del tooltip — visualmente solo se ve la mitad
   * inferior del rombo, que es un triángulo.
   *
   * Para que esto funcione, los bordes deben estar SÓLO en los dos
   * lados que forman la "V" del triángulo (los otros dos lados no
   * deben tener borde, si no se vería un cuadrado fantasma con
   * bordes cruzando el interior).
   */
  const base =
    "absolute w-[12px] h-[12px] bg-white border-[#EBE5DA] rotate-45 pointer-events-none";

  switch (position) {
    case "top":
      // Triángulo apuntando hacia ABAJO (debajo del tooltip)
      return `${base} -bottom-[5px] ${horizontalAlign} border-r border-b`;
    case "bottom":
      // Triángulo apuntando hacia ARRIBA (encima del tooltip)
      return `${base} -top-[5px] ${horizontalAlign} border-l border-t`;
    case "left":
      // Triángulo apuntando a la DERECHA (a la derecha del tooltip)
      return `${base} -right-[5px] ${verticalAlign} border-t border-r`;
    case "right":
      // Triángulo apuntando a la IZQUIERDA (a la izquierda del tooltip)
      return `${base} -left-[5px] ${verticalAlign} border-b border-l`;
  }
}
