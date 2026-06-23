"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { cn } from "@heroui/theme";

interface TooltipProps {
  children: ReactNode;
  text: string | ReactNode;
  className?: string;
  position?: "top" | "bottom";
  align?: "center" | "left" | "right";
  interactive?: boolean; // Permite clics dentro del tooltip
}

export default function Tooltip({
  children,
  text,
  className,
  position = "bottom",
  align = "right",
  interactive = false,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Estado para forzar la ocultación del Tooltip (anular el hover temporalmente)
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {
    const handleInteractionOutside = (event: Event) => {
      // Si hacen scroll en la pantalla (móvil o PC), forzamos ocultar
      if (event.type === "scroll" || event.type === "touchmove") {
        setForceHide(true);
        return;
      }

      // Si tocan la pantalla o hacen clic, revisamos que sea FUERA del tooltip
      if (event.type === "touchstart" || event.type === "mousedown") {
        if (
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node)
        ) {
          setForceHide(true);
        }
      }
    };

    document.addEventListener("touchstart", handleInteractionOutside, {
      passive: true,
    });

    return () => {
      document.removeEventListener("touchmove", handleInteractionOutside);
    };
  }, []);

  const alignmentClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-0 -translate-x-3",
    right: "right-0 translate-x-3",
  };

  const arrowAlignmentClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-4",
    right: "right-4",
  };

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "relative group/tooltip flex items-center justify-center shrink-0 cursor-help",
        className,
      )}
      // 🔥 Cuando volvemos a hacer hover o a tocar el elemento, quitamos el bloqueo
      onMouseEnter={() => setForceHide(false)}
      onTouchStart={() => setForceHide(false)}
    >
      {children}

      {/* PUENTE INVISIBLE Y CAJA DEL TOOLTIP */}
      <div
        className={cn(
          "absolute z-50 transition-all duration-200",
          // 1. Comportamiento original por CSS (Hover)
          "opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible",
          // 2. Anulación por JS (¡Fuerza el ocultamiento si se activó el estado!)
          forceHide && "!opacity-0 !invisible !pointer-events-none",
          position === "bottom" ? "top-full pt-[8px]" : "bottom-full pb-[8px]",
          alignmentClasses[align],
          !interactive && "pointer-events-none",
        )}
      >
        <div className="relative w-max max-w-[220px] sm:max-w-[260px] p-2.5 px-3 bg-white border border-[#EBE5DA] shadow-[0_10px_40px_-10px_rgba(44,44,41,0.2)] rounded-xl text-xs text-[#5A5A5A] text-center">
          {typeof text === "string" ? (
            <p className="leading-relaxed relative z-10">{text}</p>
          ) : (
            <div className="relative z-10">{text}</div>
          )}

          {/* Flecha rotada */}
          <div
            className={cn(
              "absolute w-[12px] h-[12px] bg-white border-[#EBE5DA] rotate-45 pointer-events-none",
              position === "bottom"
                ? "-top-[6.5px] border-l border-t rounded-tl-[2px]"
                : "-bottom-[6.5px] border-r border-b rounded-br-[2px]",
              arrowAlignmentClasses[align],
            )}
          />
        </div>
      </div>
    </div>
  );
}
