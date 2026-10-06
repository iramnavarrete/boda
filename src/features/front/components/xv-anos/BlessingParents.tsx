"use client";

import { motion } from "framer-motion";
import { EmeraldCard, GoldCornerFrame } from "./Card";

interface Props {
  /** "Con la bendición de Dios y el amor de". */
  preTitle?: string;
  /** Título del bloque Papás (ej. "Mis Padres"). */
  parentsHeading: string;
  /** Nombre del papá. */
  padre: string;
  /** Nombre de la mamá. */
  madre: string;
  /** Título del bloque Padrinos (ej. "Mis Padrinos"). */
  godparentsHeading: string;
  padrino1: string;
  padrino2: string;
}

/**
 * BlessingParents — bendición + papás + padrinos de la quinceañera.
 *
 * Layout (basado en la referencia):
 *   1. Card emerald con esquinas decorativas doradas
 *   2. PreTitle en versalitas tracking ancho (gold/sky)
 *   3. Heading blanco serif
 *   4. Nombres en blanco, separados por "&" italic gold
 *   5. Filete separador
 *   6. Repite para padrinos
 *
 * Theme-aware via tokens semánticos (emerald/sapphire).
 */
export default function BlessingParents({
  preTitle = "Con la bendición de Dios y el amor de",
  parentsHeading,
  padre,
  madre,
  godparentsHeading,
  padrino1,
  padrino2,
}: Props) {
  return (
    <section className="px-6 py-8" aria-labelledby="blessing-heading">
      <EmeraldCard className="p-8">
        <GoldCornerFrame />

        {/* 1. PreTitle (gold, versalitas tracking ancho) */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-montserrat text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold text-center mb-3 whitespace-pre-line leading-relaxed"
        >
          {preTitle}
        </motion.p>

        {/* 2. Heading Papás (serif blanco) */}
        <motion.h3
          id="blessing-heading"
          className="font-cormorant text-3xl sm:text-4xl text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
        >
          {parentsHeading}
        </motion.h3>

        {/* 3. Padres: nombres en blanco con & italic gold en medio */}
        <div className="space-y-1 mb-6">
          <motion.p
            className="font-cormorant text-xl sm:text-2xl text-white text-center tracking-wide"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            {padre}
          </motion.p>
          <motion.span
            className="font-cormorant italic text-base text-xv-accent-soft text-center block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.18 }}
            aria-hidden="true"
          >
            &amp;
          </motion.span>
          <motion.p
            className="font-cormorant text-xl sm:text-2xl text-white text-center tracking-wide"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.22 }}
          >
            {madre}
          </motion.p>
        </div>

        {/* Filete separador centrado */}
        <div className="flex flex-col items-center">
          <div className="w-1/2 h-1 object-center border-t border-xv-accent-soft/40 pointer-events-none mb-4 opacity-50" />
        </div>

        {/* 5. Heading Padrinos (serif blanco) — o subtitle si existe */}
        <motion.h3
          className="font-cormorant text-3xl sm:text-4xl text-white text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          {godparentsHeading}
        </motion.h3>

        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-xv-accent-soft/40 pointer-events-none" />

        {/* 6. Padrinos: nombres en blanco con & italic gold en medio */}
        <div className="space-y-1">
          <motion.p
            className="font-cormorant text-xl sm:text-2xl text-white text-center tracking-wide"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
          >
            {padrino1}
          </motion.p>
          <motion.span
            className="font-cormorant italic text-base text-xv-accent-soft text-center block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.32 }}
            aria-hidden="true"
          >
            &amp;
          </motion.span>
          <motion.p
            className="font-cormorant text-xl sm:text-2xl text-white text-center tracking-wide"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.36 }}
          >
            {padrino2}
          </motion.p>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-montserrat text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold text-center mt-6 mb-3 whitespace-pre-line leading-relaxed"
        >
          Te invitamos a celebrar con nosotros este día tan especial.
        </motion.p>
      </EmeraldCard>
    </section>
  );
}
