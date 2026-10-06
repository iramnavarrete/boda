import { cn } from "@heroui/theme";
import type { HTMLAttributes, ReactNode } from "react";

interface EmeraldCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Card base reutilizable para todas las secciones del XV Años.
 *
 * Usa tokens semánticos (`bg-xv-bg-...`, `border-xv-accent-...`) que
 * cambian automáticamente al swappear `data-xv-theme` en el wrapper.
 * Default theme = emerald; alterna a sapphire manteniendo la estructura.
 */
export function EmeraldCard({ children, className, ...rest }: EmeraldCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-7 text-center relative overflow-hidden shadow-xl",
        "bg-xv-bg-card-from border border-xv-accent-soft/25 backdrop-blur-md",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(180deg, var(--xv-bg-card-from) 0%, var(--xv-bg-card-to) 100%)`,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Esquina decorativa estilo "monograma" para cards con marco dorado. */
export function GoldCornerFrame() {
  return (
    <>
      <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-xv-accent-soft/40 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-xv-accent-soft/40 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-xv-accent-soft/40 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-xv-accent-soft/40 pointer-events-none" />
    </>
  );
}

/** Separador decorativo ✦ + líneas horizontales, centrado. */
export function GoldDivider({ withStar = true }: { withStar?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 max-w-[200px] mx-auto">
      <span className="h-[1px] w-full bg-gradient-to-r from-transparent to-xv-accent-primary/60" />
      {withStar && <span className="text-xv-accent-soft text-xs">✦</span>}
      <span className="h-[1px] w-full bg-gradient-to-l from-transparent to-xv-accent-primary/60" />
    </div>
  );
}

/** Overline editorial (texto pequeño tracking ancho). */
export function Overline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-montserrat text-[10px] tracking-[0.35em] uppercase text-xv-accent-soft font-semibold block",
        className,
      )}
    >
      {children}
    </span>
  );
}