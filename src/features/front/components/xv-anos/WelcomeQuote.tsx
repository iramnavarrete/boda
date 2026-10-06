"use client";

import { motion } from "framer-motion";

interface Props {
  /** Emblema decorativo sobre el título (ej. "❧ ✦ ❧"). */
  emblem?: string;
  /** PreTitle en versalitas tracking ancho (admite \n para multi-línea). */
  preTitle?: string;
  /** Heading principal (admite \n para multi-línea). */
  heading: string;
  /** Cita en bloque (`<blockquote>`). */
  quote: string;
  /** Línea final debajo de la cita. */
  closingLine?: string;
}

/**
 * WelcomeQuote — sección "Para la noche de Sofía".
 *
 * Layout (basado en la referencia):
 *   1. Emblema decorativo arriba
 *   2. PreTitle en versalitas tracking ancho (gold)
 *   3. Heading en Cormorant, mixed case (cream)
 *   4. Divider con ✦ central y líneas gold a los lados
 *   5. Quote en italic (gold claro)
 *   6. Closing line (gold)
 *
 * Theme-aware via tokens semánticos (swapea con emerald/sapphire).
 */
export default function WelcomeQuote({
  emblem = "❧ ✦ ❧",
  preTitle = "Para la noche de Sofía",
  heading,
  quote,
  closingLine,
}: Props) {
  return (
    <section
      id="mensaje-inicial"
      className="px-6 py-20 text-center relative"
      aria-labelledby="welcome-heading"
    >
      {/* 2. PreTitle (versalitas, tracking ancho, multi-línea) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
        className="font-montserrat text-[11px] md:text-xs tracking-[0.3em] uppercase text-xv-accent-soft font-medium mb-5 whitespace-pre-line"
      >
        {preTitle}
      </motion.div>

      {/* 3. Heading (Cormorant, mixed case, multi-línea) — blanco */}
      <motion.h2
        id="welcome-heading"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
        className="font-cormorant text-4xl sm:text-5xl leading-tight text-white font-normal mb-6 whitespace-pre-line"
      >
        {heading}
      </motion.h2>
      <div className="flex flex-col items-center pb-8 pt-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="flex items-center justify-center gap-3 w-48 md:w-80 max-w-md"
          aria-hidden="true"
        >
          {/* Línea izquierda: pico apuntando hacia la izquierda */}
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 0.7,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              transformOrigin: "right",
              // Forma pennant: punta en el extremo izquierdo,
              // rectangular hacia la derecha (donde va la estrella).
              clipPath: "polygon(0% 50%, 100% 0%, 100% 100%)",
            }}
            className="block h-[3px] flex-1 bg-xv-accent-soft"
          />
          {/* Estrella central */}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.85,
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
            animate={{ scaleX: 1 }}
            transition={{
              delay: 0.7,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              transformOrigin: "left",
              // Pennant espejo: rectangular hacia la izquierda
              // (donde está la estrella), punta hacia la derecha.
              clipPath: "polygon(0% 0%, 100% 50%, 0% 100%)",
            }}
            className="block h-[3px] flex-1 bg-xv-accent-soft"
          />
        </motion.div>
      </div>

      {/* 5. Quote (Cormorant italic, blanco) */}
      <motion.blockquote
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.42 }}
        className="font-cormorant italic text-base sm:text-lg leading-relaxed text-white/90 mb-6 px-2"
      >
        “{quote}”
      </motion.blockquote>

      {/* 6. Closing line (azul cyan/sky) */}
      {closingLine && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.55 }}
          className="font-montserrat text-sm text-xv-accent-soft whitespace-pre-line"
        >
          {closingLine}
        </motion.p>
      )}
    </section>
  );
}
