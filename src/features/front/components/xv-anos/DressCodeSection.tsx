"use client";

import { motion } from "framer-motion";
import { cn } from "@heroui/theme";
import { EmeraldCard } from "./Card";

/** Mapeo de nº de columnas → clase Tailwind estática (Tailwind no
 *  soporta clases dinámicas generadas en runtime). */
const GRID_COLS: Record<3 | 4 | 5 | 6, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export interface ReservedColor {
  /** Código hex del color (ej. "#1b4332"). */
  hex: string;
  /** Nombre legible del color (ej. "Verde Esmeralda"). */
  name: string;
}

interface Props {
  /** Pretítulo (HTML: "Código de Vestimenta"). */
  preTitle?: string;
  /** Heading principal (HTML: "Formal / Elegante"). */
  heading?: string;
  /** Descripción libre (HTML: "Vestido largo o midi para damas..."). */
  description?: string;
  /** Subtítulo de la sección de colores reservados. */
  reservedColorsPreTitle?: string;
  /** Descripción de los colores reservados. */
  reservedColorsDescription?: string;
  /** Nota de cortesía al final (ej. "Agradecemos a nuestros..."). */
  respectfulNote?: string;
  /** Paleta de colores reservados para la quinceañera. */
  colorPalette?: ReservedColor[];
  /** Número de columnas del grid de color swatches. Default: 4. */
  colorPaletteColumns?: 3 | 4 | 5 | 6;
}

/**
 * DressCodeSection — código de vestimenta + paleta de colores reservados.
 *
 * Layout (basado en la referencia):
 *   1. PreTitle "CÓDIGO DE VESTIMENTA"
 *   2. Heading serif blanco "Formal / Elegante"
 *   3. Dos íconos circulares (vestido + traje)
 *   4. Descripción italic
 *   5. Divider
 *   6. Sub-preTitle "COLORES RESERVADOS EXCLUSIVAMENTE"
 *   7. Descripción italic
 *   9. Grid de color swatches (4 cols × 2 rows)
 *  10. Nota de cortesía
 *
 * Theme-aware via tokens semánticos.
 */
export default function DressCodeSection({
  preTitle = "Código de Vestimenta",
  heading = "Formal / Elegante",
  description = "Vestido largo o midi para damas · Traje oscuro para caballeros",
  reservedColorsPreTitle = "Colores Reservados Exclusivamente",
  respectfulNote = "Agradecemos a nuestros distinguidos invitados evitar vestir prendas en esta gama de tonalidades azules.",
  colorPalette = [
    { hex: "#a8d8f0", name: "Azul Cielo" },
    { hex: "#7eb8d9", name: "Azul Acero" },
    { hex: "#5a93b8", name: "Azul Media" },
    { hex: "#3a6a8a", name: "Azul Profundo" },
    { hex: "#c8e0eb", name: "Azul Polvo" },
    { hex: "#7d92a5", name: "Azul Gris" },
    { hex: "#2c3e50", name: "Azul Medianoche" },
    { hex: "#0f1c2e", name: "Azul Profundo 2" },
  ],
  colorPaletteColumns = 4,
}: Props) {
  return (
    <section className="px-6 py-8" aria-labelledby="dresscode-heading">
      <EmeraldCard className="p-7">
        {/* 1. PreTitle */}
        <motion.span
          className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold block mb-3 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {preTitle}
        </motion.span>

        {/* 2. Heading serif blanco */}
        <motion.h2
          id="dresscode-heading"
          className="font-cormorant text-3xl sm:text-4xl text-white text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
        >
          {heading}
        </motion.h2>

        {/* 3. Íconos vestido + traje en círculos */}
        <motion.div
          className="flex items-center justify-center gap-4 py-2 text-xv-accent-soft mb-3"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
          aria-hidden="true"
        >
          <div className="p-3 rounded-full bg-xv-bg-deep border border-xv-accent-soft/30 flex items-center justify-center">
            {/* Ícono vestido */}
            <svg
              className="w-6 h-6 stroke-current"
              fill="none"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M9 3v2m6-2v2M9 5l-2 5 3 2-2 11h8l-2-11 3-2-2-5H9z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="p-3 rounded-full bg-xv-bg-deep border border-xv-accent-soft/30 flex items-center justify-center">
            {/* Ícono traje / moño */}
            <svg
              className="w-6 h-6 stroke-current"
              fill="none"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M6 3h12l-2 8-4-2-4 2-2-8zM9 13v8m6-8v8M10 7h4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* 4. Descripción italic */}
        <motion.p
          className="font-cormorant italic text-base text-white text-center mb-6 leading-relaxed whitespace-pre-line"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          {description}
        </motion.p>

        {/* 5. Divider */}
        <div className="w-full h-px bg-xv-accent-soft/20 mb-6" />

        {/* 6. Sub-preTitle de colores reservados */}
        <motion.span
          className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-bold block text-center mb-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        >
          {reservedColorsPreTitle}
        </motion.span>

        {/* 8. Grid de color swatches (cols configurables) */}
        <motion.div
          className={cn(
            "grid gap-2 sm:gap-3 max-w-md mx-auto mb-6",
            GRID_COLS[colorPaletteColumns],
          )}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.42 }}
        >
          {colorPalette.map((color, idx) => (
            <motion.div
              key={`${color.hex}-${idx}`}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: 0.5 + idx * 0.06,
              }}
              className="flex flex-col items-center gap-1.5"
              title={color.name}
            >
              <span
                className="w-full aspect-[12/9] border border-xv-accent-soft/30 rounded-md shadow"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* 9. Nota de cortesía */}
        {respectfulNote && (
          <motion.p
            className="font-montserrat text-xs text-xv-accent-soft/85 text-center leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.8 }}
          >
            {respectfulNote}
          </motion.p>
        )}
      </EmeraldCard>
    </section>
  );
}