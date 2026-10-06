"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import SwipeUpGesture from "@/icons/swipe-up-gesture";

/**
 * Cover (Hero) de la invitación XV Años.
 *
 * - Cover NUNCA se desmonta (siempre montado en el árbol).
 * - Imagen hero con parallax vertical (y + scale) basado en scroll.
 * - Texto y decoraciones animan SOLO cuando `animateOn === true`
 *   (típicamente cuando el sobre se ha abierto).
 *
 * Layout:
 *   - Top centrado: preTitle
 *   - Imagen hero (con parallax + zoom sutil al hacer scroll)
 *   - Bottom centrado:
 *       ✦ divider
 *       Nombre
 *       ✦ (decoración pequeña)
 *       Fecha
 *       "Desliza" ↓
 */

interface Props {
  /** URL absoluta de la imagen hero. Horizontal preferida para desktop. */
  coverImage: string;
  /**
   * Classes extra para la `<Image>` del cover (e.g. `object-[48%]` para
   * ajustar el `object-position` por invitación). Si se omite, el default
   * `object-cover object-center` aplica.
   */
  imageClassName?: string;
  /** No se usa (la prop se conserva en el type por compatibilidad
   *  con configs antiguos). */
  monograma?: string;
  /** Subtítulo sobre el nombre. Default: "MIS XV AÑOS". */
  preTitle?: string;
  /**
   * Si `true`, las animaciones de texto/decoraciones están en su
   * estado final visible. Si `false`, están en su estado inicial
   * (oculto). Al pasar de `false` a `true`, las animaciones disparan.
   *
   * Típicamente se ata a `isEnvelopeOpened` del frame.
   */
  animateOn?: boolean;
}

export default function XvCover({
  coverImage,
  imageClassName,
  monograma,
  preTitle = "MIS XV AÑOS",
  animateOn = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  // Parallax pronunciado: la imagen se mueve 12% del scroll + zoom 1.15.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  // Datos dinámicos desde el store
  const nombre = useInvitationStore((s) => s.invitationData?.nombre ?? "");
  const fechaISO = useInvitationStore(
    (s) => s.invitationData?.fechaISO ?? "",
  );
  const formattedDate = fechaISO
    ? (() => {
        try {
          return new Intl.DateTimeFormat("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(fechaISO));
        } catch {
          return "";
        }
      })()
    : "";

  // Evita warning de "monograma declared but never used" — queda en el
  // type por compatibilidad con configs antiguos (Sofía/Valentina).
  void monograma;

  return (
    <section
      ref={ref}
      className="relative h-[95svh] md:h-[88vh] w-full overflow-hidden bg-xv-bg-deepest"
      aria-label="Portada de la invitación"
    >
      {/* ─── Capa 1: Imagen hero — siempre visible, parallax al scroll ── */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y, scale: imgScale }}
        aria-hidden="true"
      >
        <Image
          src={coverImage}
          alt=""
          fill
          priority
          quality={90}
          /* El cover vive dentro de la columna del XV (max 760px en
             2xl). `sizes` debe describir el ancho REAL de renderizado
             para que Next.js reserve el tamaño correcto en el
             layout-shift. Antes "100vw" sobre-asignaba. */
          sizes="(max-width: 768px) 100vh, 1000px"
          className={`object-cover ${imageClassName ?? "object-center"}`}
        />
      </motion.div>

      {/* ─── Capa 2a: Gradiente en el bottom (todos los viewports) ──── */}
      <div
        className="absolute h-96 bottom-0 left-0 right-0 bg-gradient-to-t from-xv-bg-deepest via-xv-bg-deepest/20 to-transparent"
        aria-hidden="true"
      />

      {/* ─── Capa 2b: Gradiente en los laterales (escritorio only) ─── */}
      <div
        className="absolute inset-0 hidden md:block bg-gradient-to-r from-xv-bg-deepest via-transparent to-xv-bg-deepest"
        aria-hidden="true"
      />

      {/* ─── Contenido: Top (preTitle) + Spacer + Bottom stack ───── */}
      <div
        className="relative z-10 h-full flex flex-col items-center text-center px-6 pt-10 md:py-14"
      >
        {/* TOP — PreTitle centrado */}
        <motion.span
          initial={{ opacity: 0, y: -16 }}
          animate={animateOn ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-montserrat text-[11px] md:text-xs tracking-[0.45em] uppercase text-xv-accent-soft font-semibold"
        >
          {preTitle}
        </motion.span>

        {/* Spacer — la imagen llena este espacio */}
        <div className="flex-1" />

        {/* BOTTOM — Nombre + decoración + fecha + desliza */}
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
          {/* Nombre — Cinzel display */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={animateOn ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{
              delay: 0.2,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-cinzel text-4xl md:text-5xl tracking-[0.15em] uppercase text-xv-accent-text font-normal xv-glow"
          >
            {nombre || "Mis XV Años"}
          </motion.h1>

          {/* Decoración: 2 líneas horizontales + estrella en medio */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={animateOn ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="flex items-center justify-center gap-3 w-48 md:w-80 max-w-md"
            aria-hidden="true"
          >
            {/* Línea izquierda: pico apuntando hacia la izquierda */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={animateOn ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{
                delay: 0.35,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                transformOrigin: "right",
                // Forma pennant: punta en el extremo izquierdo,
                // rectangular hacia la derecha (donde va la estrella).
                clipPath:
                  "polygon(0% 50%, 100% 0%, 100% 100%)",
              }}
              className="block h-[3px] flex-1 bg-xv-accent-soft"
            />
            {/* Estrella central */}
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={animateOn ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{
                delay: 0.35,
                type: "spring",
                stiffness: 220,
                damping: 18,
              }}
              className="text-xv-accent-soft"
            >
              ✦
            </motion.span>
            {/* Línea derecha: pico apuntando hacia la derecha */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={animateOn ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{
                delay: 0.35,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                transformOrigin: "left",
                // Pennant espejo: rectangular hacia la izquierda
                // (donde está la estrella), punta hacia la derecha.
                clipPath:
                  "polygon(0% 0%, 100% 50%, 0% 100%)",
              }}
              className="block h-[3px] flex-1 bg-xv-accent-soft"
            />
          </motion.div>

          {/* Fecha (ubicación omitida por solicitud) */}
          {formattedDate && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={animateOn ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="font-montserrat text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/90 font-medium whitespace-nowrap max-w-md"
            >
              {formattedDate}
            </motion.p>
          )}
        </div>

        {/* "Desliza" + chevron abajo de todo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={animateOn ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-6 flex flex-col items-center text-white/70 animate-bounce-subtle"
          aria-hidden="true"
        >
          <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase">
            Desliza
          </span>
          <SwipeUpGesture />
        </motion.div>
      </div>
    </section>
  );
}