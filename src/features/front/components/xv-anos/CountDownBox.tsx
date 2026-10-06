"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import {
  openCalendarEvent,
  type CalendarEventInput,
} from "@/features/front/utils/addToCalendar";

interface Props {
  /** Fecha objetivo en formato ISO (ej. "2027-01-23T17:00:00"). */
  targetDate: string;
  /** Etiqueta del badge superior. Default: "Cuenta regresiva". */
  badgeLabel?: string;
  /** Título de la sección. Default: "La Noche Mágica se Acerca". */
  heading?: string;
  /**
   * URL absoluta Google Calendar (opcional, legacy).
   * @deprecated Usa el botón dinámico que detecta plataforma (Google /
   * Apple / Outlook). Se conserva solo como fallback si el orquestador
   * aún lo pasa — cuando llegue al componente se ignora.
   */
  calendarUrl?: string;
  /** Texto del botón calendario. */
  calendarLabel?: string;
}

/**
 * CountDownBox — contador con 4 cells + CTA, basado en la referencia.
 *
 * Layout:
 *   1. Badge "CUENTA REGRESIVA" con dot pulsante (animate-ping)
 *   2. Heading serif blanco centrado
 *   3. Grid de 4 cards con números Cinzel + labels
 *   4. CTA pill con icono de calendario
 *
 * Theme-aware: usa tokens semánticos (`bg-xv-accent-primary/15`,
 * `text-xv-accent-dark`, etc.) — funciona en emerald y sapphire sin
 * colores hard-coded.
 *
 * DRY: el botón "Agregar a mi calendario" usa la misma
 * `openCalendarEvent` que `AddToCalendar.tsx` (bodas), por lo que
 * detecta dinámicamente Google / Apple / Outlook en lugar de hardcodear
 * un único `calendarUrl` con el template de Google.
 */
export default function CountDownBox({
  targetDate,
  badgeLabel = "Cuenta regresiva",
  heading = "La Noche Mágica se Acerca",
  calendarLabel = "Agregar a mi calendario",
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const [parts, setParts] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Patrón estándar del proyecto (mismo que ElegantText.tsx) para
    // evitar hydration mismatch entre SSR y client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const target = new Date(targetDate).getTime();
    if (Number.isNaN(target)) return;

    function tick() {
      const now = Date.now();
      const distance = target - now;
      if (distance < 0) {
        setParts({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setParts({ days, hours, minutes, seconds });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const cells = [
    { value: parts.days, label: "Días" },
    { value: parts.hours, label: "Horas" },
    { value: parts.minutes, label: "Min" },
    { value: parts.seconds, label: "Seg" },
  ];

  // El botón sólo se muestra cuando hay datos suficientes en el store
  // (mismo guard que el botón de bodas para mantener paridad visual).
  const canAddToCalendar = Boolean(
    invitationData && invitationData.fechaISO,
  );

  const handleAddToCalendar = () => {
    if (!canAddToCalendar) return;
    // Cast seguro: la guard previa garantiza `fechaISO` no-undefined.
    openCalendarEvent(invitationData as unknown as CalendarEventInput);
  };

  return (
    <section
      className="px-6 py-10 text-center"
      aria-labelledby="countdown-heading"
    >
      {/* 1. Badge con dot pulsante — fondo dark + borde accent */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-xv-bg-deepest/45 border border-xv-accent-soft/30 mb-6"
      >
        {/* Halo pulsante detrás del dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-xv-accent-soft opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-xv-accent-soft" />
        </span>
        <span className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-xv-accent-soft/60 font-medium">
          {badgeLabel}
        </span>
      </motion.div>

      {/* 2. Heading */}
      <motion.h2
        id="countdown-heading"
        className="font-cormorant text-3xl sm:text-4xl text-white mb-8"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      >
        {heading}
      </motion.h2>

      {/* 3. Grid de 4 cells — fondo accent semi-transparente */}
      <motion.div
        className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-[420px] mx-auto mb-8"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        {cells.map((cell, idx) => (
          <motion.div
            key={cell.label}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.3 + idx * 0.08,
            }}
            className="bg-xv-accent-primary/15 backdrop-blur-sm rounded-2xl py-3 sm:py-4 px-1 text-center shadow-md flex flex-col justify-center items-center border border-xv-accent-soft/20"
          >
            <span
              suppressHydrationWarning
              className="font-cormorant text-2xl sm:text-3xl font-light text-xv-accent-soft leading-none"
            >
              {mounted ? String(cell.value).padStart(2, "0") : "--"}
            </span>
            <span className="font-montserrat text-[8px] sm:text-[9px] font-medium tracking-[0.2em] uppercase text-xv-accent-soft opacity-60 mt-1.5">
              {cell.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* 4. CTA pill — fondo accent sólido + texto accent-dark.
          Pasa de <a href> a <button onClick> para poder detectar la
          plataforma (Google / Apple / Outlook) y abrir el calendario
          correcto en lugar de un único link hardcodeado a Google. */}
      {canAddToCalendar && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
        >
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-xv-accent-primary hover:bg-xv-accent-soft text-xv-accent-dark font-montserrat text-xs sm:text-sm font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-[0_10px_30px_-10px_rgba(56,189,248,0.5)] hover:shadow-[0_12px_40px_-10px_rgba(56,189,248,0.7)]"
          >
            <svg
              aria-hidden="true"
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
            </svg>
            <span>{calendarLabel}</span>
          </button>
        </motion.div>
      )}
    </section>
  );
}