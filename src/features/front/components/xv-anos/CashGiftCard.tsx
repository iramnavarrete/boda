"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ChevronDown } from "lucide-react";
import { EmeraldCard } from "./Card";
import { useClipboard } from "@/features/front/hooks/useClipboard";

/** Datos bancarios opcionales (cuando se pasan, se renderiza un
 *  collapse animado dentro de la misma card con esta info). */
export interface CashGiftTransfer {
  bank: string;
  beneficiary: string;
  /** Número de tarjeta (16 dígitos) — antes `clabe`. */
  cardNumber: string;
  /** Texto del toggle cuando está cerrado. Default: "Ver Datos Bancarios". */
  toggleLabel?: string;
  /** Texto del toggle cuando está abierto. Default: "Ocultar datos". */
  toggleLabelOpen?: string;
}

interface Props {
  preTitle?: string;
  heading?: string;
  /** Frase/quote introductoria. */
  description: string;
  /** Si se pasa, renderiza el collapse con los datos bancarios
   *  dentro de la misma card. */
  transfer?: CashGiftTransfer;
}

/**
 * CashGiftCard — bloque "Lluvia de Sobres / Deseos".
 *
 * Layout unificado en UNA sola card (basado en el mockup):
 *   1. Icono circular de regalo
 *   2. PreTitle "MESA DE REGALOS"
 *   3. Heading serif "Lluvia de Sobres / Deseos"
 *   4. Descripción italic
 *   5. (opcional) collapse animado con datos bancarios adentro
 *      (Banco, Beneficiario + Copiar, Número de tarjeta + Copiar)
 *
 * Theme-aware via tokens semánticos (`bg-xv-bg-card-from/to`,
 * `text-xv-accent-soft`, etc.) — funciona en emerald y sapphire
 * sin colores hard-coded.
 */
export default function CashGiftCard({
  preTitle = "Mesa de Regalos",
  heading = "Lluvia de Sobres / Deseos",
  description = "Tu presencia es mi mayor obsequio. Si deseas hacerme un detalle, dispondremos de un buzón de estrellas para sobres el día del evento o vía transferencia.",
  transfer,
}: Props) {
  return (
    <section className="px-6 py-8" aria-labelledby="gifts-heading">
      <EmeraldCard className="p-6 text-center">
        {/* 1. Icono de regalo */}
        <motion.div
          className="w-10 h-10 rounded-full bg-xv-bg-deep border border-xv-accent-soft/40 mx-auto flex items-center justify-center text-xv-accent-soft mb-3"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V14h2V8.76L15.38 12 17 10.83 14.92 8H20v6z" />
          </svg>
        </motion.div>

        {/* 2. Pretitle */}
        <motion.span
          className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold block mb-1"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {preTitle}
        </motion.span>

        {/* 3. Heading */}
        <motion.h2
          id="gifts-heading"
          className="font-cormorant text-2xl text-white mb-2"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          {heading}
        </motion.h2>

        {/* 4. Descripción italic */}
        <motion.p
          className="font-cormorant italic text-sm text-xv-accent-soft/90 leading-relaxed mb-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
        >
          “{description}”
        </motion.p>

        {/* 5. (opcional) Datos bancarios dentro de la misma card */}
        {transfer && <TransferDetails transfer={transfer} />}
      </EmeraldCard>
    </section>
  );
}

/* ============================================================================
 * Sub-componente: <TransferDetails />
 * Collapse animado (en lugar de `<details>` nativo) que abre/cierra con
 * `height: 0` ↔ `height: "auto"` vía Framer Motion — más suave que el
 * snap del summary nativo.
 *
 * Muestra: Banco, Beneficiario (con Copiar), Número de tarjeta (con Copiar).
 * ========================================================================== */
function TransferDetails({ transfer }: { transfer: CashGiftTransfer }) {
  const {
    bank,
    beneficiary,
    cardNumber,
    toggleLabel = "Ver Datos Bancarios",
    toggleLabelOpen = "Ocultar datos",
  } = transfer;

  const [isOpen, setIsOpen] = useState(false);
  const { copiedText, copy } = useClipboard();

  // id para `aria-controls` del toggle
  const panelId = "xv-transfer-panel";

  return (
    <motion.div
      className="mt-2 mx-auto max-w-md text-left"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
    >
      <div className="rounded-2xl bg-xv-bg-deepest/55 border border-xv-accent-soft/30 overflow-hidden">
        {/* Toggle (button con ARIA correcto) */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full flex justify-between items-center cursor-pointer font-montserrat text-[10px] tracking-[0.2em] uppercase text-xv-accent-soft font-semibold select-none px-4 py-3 hover:bg-xv-accent-soft/5 transition-colors"
        >
          <span>{isOpen ? toggleLabelOpen : toggleLabel}</span>
          <ChevronDown
            size={14}
            className="text-xv-accent-soft transition-transform duration-300"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-hidden="true"
          />
        </button>

        {/* Collapse animado */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={panelId}
              key="transfer-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-4 pb-4 pt-3 border-t border-xv-accent-soft/25 text-xs space-y-2 text-white/85 font-montserrat">
                <p>
                  <span className="text-xv-accent-soft font-medium">
                    Banco:
                  </span>{" "}
                  {bank}
                </p>

                {/* Beneficiario + Copiar */}
                <div className="flex flex-col md:flex-row gap-1 md:gap-2 flex-wrap">
                  <span className="text-xv-accent-soft font-medium">
                    Beneficiario:
                  </span>
                  <span className="text-white/95">{beneficiary}</span>
                  <CopyButton
                    isCopied={copiedText === beneficiary}
                    onCopy={() => copy(beneficiary)}
                    label="Copiar beneficiario"
                  />
                </div>

                {/* Número de tarjeta + Copiar */}
                <div className="flex flex-col md:flex-row gap-1 md:gap-2 flex-wrap">
                  <span className="text-xv-accent-soft font-medium">
                    Número de tarjeta:
                  </span>
                  <code className="font-mono text-white/95 tracking-wider">
                    {cardNumber}
                  </code>
                  <CopyButton
                    isCopied={copiedText === cardNumber}
                    onCopy={() => copy(cardNumber)}
                    label="Copiar número de tarjeta"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* Botón de copiar compartido (Beneficiario + Número de tarjeta) */
function CopyButton({
  isCopied,
  onCopy,
  label,
}: {
  isCopied: boolean;
  onCopy: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      className="ml-auto p-1 rounded-md text-xv-accent-soft hover:bg-xv-accent-soft/15 transition-colors inline-flex items-center gap-1 text-[11px]"
    >
      {isCopied ? (
        <>
          <Check size={12} /> Copiado
        </>
      ) : (
        <>
          <Copy size={12} /> Copiar
        </>
      )}
    </button>
  );
}