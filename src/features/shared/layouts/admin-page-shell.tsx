import { cn } from "@heroui/theme";
import type { ReactNode } from "react";

interface AdminPageShellProps {
  /** Título principal de la página (puede incluir JSX, ej. palabra en gold). */
  title: ReactNode;
  /** Subtítulo/descripción debajo del título. */
  subtitle?: ReactNode;
  /** Acción opcional a la derecha del header (ej. "Marcar todos leídos"). */
  rightAction?: ReactNode;
  /** Contenido de la página (filtros + grid, sidebar + grid, etc.). */
  children: ReactNode;
  /** Class extra para el contenedor raíz. */
  className?: string;
  /** Class extra para la sección del header (título/subtítulo/acción). */
  headerClassName?: string;
  /** Class extra para el contenedor del contenido. */
  contentClassName?: string;
  /**
   * Si `true`, el contenedor raíz ocupa la altura completa de la viewport
   * menos el header global (65px) y el contenido es lo único que scrollea.
   * Por defecto `true` para alinear con el patrón de Activity.
   * Si la página prefiere scroll nativo, pasar `false`.
   */
  fillViewport?: boolean;
}

/**
 * Shell compartido para páginas admin que necesitan un header editorial
 * (título + subtítulo + acción opcional) seguido de un área de contenido
 * scrollable.
 *
 * Usado por:
 * - `/admin/invitations/[id]/quotes` (Mensajes & Bendiciones)
 * - `/admin/invitations/[id]/activity` (Actividad de Invitados)
 *
 * Se ubica dentro de `AdminLayout`, que ya provee el header global y el
 * fondo paper. Este shell solo se encarga del layout interno de la página.
 */
const AdminPageShell = ({
  title,
  subtitle,
  rightAction,
  children,
  className,
  headerClassName,
  contentClassName,
  fillViewport = true,
}: AdminPageShellProps) => {
  return (
    <div
      className={cn(
        "bg-[#F9F7F2] font-sans text-[#2C2C29] flex flex-col w-full",
        // El comportamiento "header + search bar fijos" solo aplica en
        // desktop (md+). En móvil el padre fluye naturalmente, el header
        // y la search bar hacen scroll con la página, y desaparece el
        // espacio gris al final que dejaba `h-[calc(100svh-65px)]`.
        fillViewport && "md:h-[calc(100svh-65px)] md:overflow-hidden",
        className,
      )}
    >
      {/* Header editorial (sticky arriba, no scrollea) */}
      <header
        className={cn(
          "max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1.5 shrink-0",
          headerClassName,
        )}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-0.5 mb-3">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-2 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[#8F8F8B] text-sm md:text-base font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {rightAction && (
            <div className="shrink-0 flex items-center">{rightAction}</div>
          )}
        </div>
      </header>

      {/* Contenido (lo único que scrollea si fillViewport) */}
      <section
        className={cn(
          "max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-2 flex-1 min-h-0",
          contentClassName,
        )}
      >
        {children}
      </section>
    </div>
  );
};

export default AdminPageShell;
