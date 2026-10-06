"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Props {
  /** URL de la imagen de fondo. */
  imageUrl: string;
  /** Emblema decorativo sobre la cita. */
  emblem?: string;
  /** Cita destacada centrada. */
  quote: string;
  /** Línea inferior en versalitas. */
  caption?: string;
}

/**
 * ParallaxTransition — sección "Bosque encantado".
 *
 * Parallax vertical sutil sobre la imagen con `useScroll` + `useTransform`.
 * Tokens semánticos → theme-aware (emerald/sapphire).
 */
export default function ParallaxTransition({
  imageUrl,
  quote,
  caption,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Parallax: la imagen se mueve 8% hacia arriba al scrollear.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      className="relative my-8 h-80 overflow-hidden"
      aria-labelledby="parallax-quote"
    >
      {/* Imagen con parallax */}
      <motion.div
        className="absolute inset-0 will-change-transform overflow-hidden scale-110"
        style={{ y }}
        aria-hidden="true"
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          quality={90}
          /* El parallax se renderiza full-width en mobile y hasta
             760px en desktop (columna XV). `sizes` describe el ancho
             real para evitar layout-shift warnings. */
          sizes="(max-width: 768px) 100vw, 760px"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Gradientes para profundidad — vignette fuerte con `via-transparent`
          para que el centro sea imagen pura y los bordes (100% navy)
          creen un gradient visible. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-xv-bg-deepest via-transparent to-xv-bg-deepest"
        aria-hidden="true"
      />

      {/* Gradiente en los laterales — solo escritorio. */}
      <div
        className="absolute inset-0 hidden md:block bg-gradient-to-r from-xv-bg-deepest via-transparent to-xv-bg-deepest"
        aria-hidden="true"
      />

      {/* Overlay con cita */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <p
          id="parallax-quote"
          className="font-cormorant italic text-xl md:text-2xl text-xv-accent-text xv-glow leading-relaxed"
        >
          “{quote}”
        </p>
        {caption && (
          <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft opacity-90 mt-3 font-medium">
            {caption}
          </span>
        )}
      </motion.div>
    </section>
  );
}