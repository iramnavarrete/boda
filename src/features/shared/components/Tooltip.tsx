"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { cn } from "@heroui/theme";

interface TooltipProps {
  children: ReactNode;
  text: string | ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  align?: "center" | "left" | "right";
  interactive?: boolean;
}

export default function Tooltip({
  children,
  text,
  className,
  position = "bottom",
  align = "center",
  interactive = false,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {
    const handleInteractionOutside = (event: Event) => {
      if (event.type === "scroll" || event.type === "touchmove") {
        setForceHide(true);
        return;
      }

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

  const positionClasses = {
    top: "bottom-full pb-[8px]",
    bottom: "top-full pt-[8px]",
    left: "right-full pr-[8px]",
    right: "left-full pl-[8px]",
  };

  const getAlignmentClasses = () => {
    if (position === "top" || position === "bottom") {
      return {
        center: "left-1/2 -translate-x-1/2",
        left: "left-0 -translate-x-3",
        right: "right-0 translate-x-3",
      }[align];
    }
    // Para left y right, centramos verticalmente por defecto
    return "top-1/2 -translate-y-1/2";
  };

  const getArrowClasses = () => {
    const horizontalAlign = {
      center: "left-1/2 -translate-x-1/2",
      left: "left-4",
      right: "right-4",
    }[align];

    switch (position) {
      case "top":
        return `-bottom-[6.5px] border-r border-b rounded-br-[2px] ${horizontalAlign}`;
      case "bottom":
        return `-top-[6.5px] border-l border-t rounded-tl-[2px] ${horizontalAlign}`;
      case "left":
        return "-right-[6.5px] top-1/2 -translate-y-1/2 border-t border-r rounded-tr-[2px]";
      case "right":
        return "-left-[6.5px] top-1/2 -translate-y-1/2 border-b border-l rounded-bl-[2px]";
    }
  };

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "relative group/tooltip flex items-center justify-center shrink-0 cursor-help",
        className,
      )}
      onMouseEnter={() => setForceHide(false)}
      onTouchStart={() => setForceHide(false)}
    >
      {children}

      <div
        className={cn(
          "absolute z-50 transition-all duration-200",
          "opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible",
          forceHide && "!opacity-0 !invisible !pointer-events-none",
          positionClasses[position],
          getAlignmentClasses(),
          !interactive && "pointer-events-none",
        )}
      >
        <div className="relative w-max max-w-[220px] sm:max-w-[260px] p-2.5 px-3 bg-white border border-[#EBE5DA] shadow-[0_10px_40px_-10px_rgba(44,44,41,0.2)] rounded-xl text-xs text-[#5A5A5A] text-center">
          {typeof text === "string" ? (
            <p className="leading-relaxed relative z-10">{text}</p>
          ) : (
            <div className="relative z-10">{text}</div>
          )}

          {/* Flecha dinámica */}
          <div
            className={cn(
              "absolute w-[12px] h-[12px] bg-white border-[#EBE5DA] rotate-45 pointer-events-none",
              getArrowClasses(),
            )}
          />
        </div>
      </div>
    </div>
  );
}
