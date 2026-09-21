"use client";

import React, { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@heroui/theme";

/**
 * Opción del Dropdown. Permite icono a la izquierda y un elemento
 * "trailing" opcional a la derecha (típicamente un badge de conteo).
 */
export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

interface DropdownProps<T extends string> {
  /** Valor actual (controlado). */
  value: T;
  onChange: (val: T) => void;
  /** Estado de apertura controlado por el padre para coordinar múltiples dropdowns. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: DropdownOption<T>[];
  /** aria-label del botón trigger (importante para accesibilidad). */
  ariaLabel: string;
  /** Etiqueta visible arriba del trigger (opcional, usada en desktop). */
  label?: string;
  className?: string;
  /**
   * `true` cuando el valor seleccionado NO es el valor por defecto (ej.
   * filtro especial aplicado, sort no-default). Aplica un highlight al
   * trigger para distinguirlo del estado neutro — útil en móvil donde
   * el dropdown cerrado es el único indicador visible del filtro activo.
   * No tiene efecto si el dropdown está abierto (open tiene prioridad).
   */
  isActive?: boolean;
  /**
   * Clases Tailwind para el highlight del trigger cuando `isActive` es
   * `true` y el dropdown está cerrado. Permite asignar un color distintivo
   * por filtro (verde para confirm, rojo para decline, ámbar para
   * unanswered, etc.). Si no se provee, usa el amber default.
   */
  activeClassName?: string;
  /**
   * Label que se muestra en el trigger cuando el `value` actual no
   * matchea ninguna de las `options`. Útil para placeholders del estilo
   * "Selecciona…" o para indicar "ningún filtro aplicado" cuando la
   * opción "neutra" no está incluida en el array.
   */
  placeholderLabel?: string;
  /**
   * Icono que se muestra en el trigger cuando el `value` actual no
   * matchea ninguna `option` (se usa junto con `placeholderLabel`).
   */
  placeholderIcon?: React.ReactNode;
  /**
   * Color del icono cuando `isActive` es `true` y el dropdown está
   * cerrado. Coordinado con `activeClassName` (mismo color que el
   * border/bg del trigger). Si no se provee, mantiene `text-stone-500`.
   */
  iconActiveClass?: string;
}

/**
 * Dropdown personalizado — look & feel consistente con el sidebar de Activity:
 * - Border `#EBE5DA`, rounded-lg, fondo blanco
 * - Focus ring gold (`focus:ring-gold`)
 * - Menu con `border-gold/30`, shadow-xl, animaciones suaves
 *
 * Acepta iconos por opción y un slot "trailing" (típicamente count badge).
 * Funciona 100% con teclado: Escape cierra, Tab navega.
 */
export function Dropdown<T extends string>({
  value,
  onChange,
  open,
  onOpenChange,
  options,
  ariaLabel,
  label,
  className,
  isActive = false,
  activeClassName,
  placeholderLabel,
  placeholderIcon,
  iconActiveClass,
}: DropdownProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Si el valor actual no matchea ninguna opción, mostramos el placeholder
  // (ej. "Filtros especiales") en lugar del primer option (que sería el
  // primer filtro real y se mostraría mal cuando aún no hay filtro activo).
  const matched = options.find((o) => o.value === value);
  const current = matched ?? {
    value,
    label: placeholderLabel ?? options[0]?.label ?? "",
    icon: placeholderIcon ?? null,
    trailing: undefined,
  };

  // Click outside: cierra si el click es fuera del contenedor.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onOpenChange(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
    >
      {label && (
        <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
          {label}
        </h4>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        // Jerarquía visual del trigger:
        //  - open (dropdown abierto) → gold border + ring + shadow (más prominente)
        //  - isActive (filtro aplicado, dropdown cerrado) → color del filtro
        //    (verde/rojo/ámbar/stone según el tipo). Default amber si no se pasa.
        //  - default → white + gray border
        className={cn(
          "w-full flex items-center gap-1.5 px-2.5 py-2 bg-white border rounded-lg",
          "text-[13px] text-charcoal",
          "outline-none focus:ring-1 focus:ring-gold transition-all",
          open
            ? "border-gold/50 ring-1 ring-gold shadow-sm bg-[#FDFBF7]"
            : isActive
              ? (activeClassName ?? "border-amber-300 bg-amber-50/70")
              : "border-[#EBE5DA] hover:border-[#C5A669]/50",
        )}
      >
        {current.icon && (
          <span
            className={cn(
              "shrink-0 transition-colors",
              open
                ? "text-gold"
                : isActive && iconActiveClass
                  ? iconActiveClass
                  : "text-stone-500",
            )}
            aria-hidden="true"
          >
            {current.icon}
          </span>
        )}
        <span className="flex-1 text-left truncate font-medium">
          {current.label}
        </span>
        {/* `current.trailing` puede ser undefined cuando `current` es el
            placeholder sintetizado. */}
        {"trailing" in current && current.trailing && (
          <span className="shrink-0 mr-1">{current.trailing}</span>
        )}
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-stone-400 transition-transform duration-200",
            open && "rotate-180 text-gold",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Menu */}
      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute top-full left-0 right-0 mt-1 z-50",
            "bg-white/95 backdrop-blur-sm rounded-xl border border-[#C5A669]/30 shadow-xl overflow-hidden",
            "animate-in fade-in slide-in-from-top-2 duration-200",
          )}
        >
          <div className="p-1 flex flex-col gap-0.5 max-h-60 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-[13px]",
                    "transition-colors",
                    isSelected
                      ? "bg-[#FDFBF7] text-charcoal font-bold"
                      : "text-[#5A5A5A] hover:bg-stone-50",
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {opt.icon && (
                      <span
                        className={cn(
                          "shrink-0",
                          isSelected ? "text-gold" : "text-stone-400",
                        )}
                        aria-hidden="true"
                      >
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {opt.trailing && (
                    <span className="shrink-0">{opt.trailing}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}