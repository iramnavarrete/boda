import { ReactNode } from "react";
import { cn } from "@heroui/theme";

interface TooltipProps {
  children: ReactNode;
  text: string | ReactNode;
  className?: string;
  position?: "top" | "bottom";
  align?: "center" | "left" | "right";
}

export default function Tooltip({
  children,
  text,
  className,
  position = "bottom",
  align = "right",
}: TooltipProps) {
  // Manejo dinámico de la caja del tooltip según la alineación
  const alignmentClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-0",
    right: "right-0",
  };

  // Manejo dinámico de la flecha/triángulo según la alineación
  const arrowAlignmentClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-6",
    right: "right-6",
  };

  return (
    <div
      className={cn(
        "relative group/tooltip flex items-center justify-center shrink-0",
        className,
      )}
    >
      {children}
      <div
        className={cn(
          "absolute w-max max-w-[220px] sm:max-w-[260px] p-4 bg-white border border-[#EBE5DA] shadow-[0_10px_40px_-10px_rgba(44,44,41,0.2)] rounded-2xl text-xs text-[#5A5A5A] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none text-center",
          position === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
          alignmentClasses[align]
        )}
      >
        <p className="leading-relaxed">{text}</p>

        {/* Triángulo del tooltip */}
        <div
          className={cn(
            "absolute border-[6px] border-transparent",
            position === "bottom"
              ? "bottom-full border-b-white"
              : "top-full border-t-white",
            arrowAlignmentClasses[align]
          )}
        />
        <div
          className={cn(
            "absolute border-[7px] border-transparent -z-10",
            position === "bottom"
              ? "bottom-full border-b-[#EBE5DA] mb-[1px]"
              : "top-full border-t-[#EBE5DA] mt-[1px]",
            arrowAlignmentClasses[align]
          )}
        />
      </div>
    </div>
  );
}