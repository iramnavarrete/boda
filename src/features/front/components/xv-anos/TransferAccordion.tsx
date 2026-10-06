"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/features/front/hooks/useClipboard";

interface Props {
  /** Nombre del banco. */
  bank: string;
  /** Beneficiario. */
  beneficiary: string;
  /** Número de tarjeta (16 dígitos). Antes `clabe` (CLABE interbancaria). */
  cardNumber: string;
  /** Texto del toggle (oculto). Default: "Ver Datos Bancarios". */
  toggleLabel?: string;
  /** Texto del toggle (visible). Default: "Ocultar datos". */
  toggleLabelOpen?: string;
}

/**
 * TransferAccordion — `<details>` con los datos bancarios.
 * Theme-aware via tokens semánticos.
 */
export default function TransferAccordion({
  bank,
  beneficiary,
  cardNumber,
  toggleLabel = "Ver Datos Bancarios",
  toggleLabelOpen = "Ocultar datos",
}: Props) {
  const { copiedText, copy } = useClipboard();

  return (
    <section className="px-6 -mt-2 mb-6" aria-label="Datos para transferencia">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <details className="group text-left bg-xv-bg-deep/80 rounded-2xl border border-xv-bg-mid-soft/40 p-3.5 transition-all">
          <summary className="list-none flex justify-between items-center cursor-pointer font-montserrat text-xs tracking-wider text-xv-accent-soft uppercase font-semibold select-none">
            <span className="group-open:hidden">{toggleLabel}</span>
            <span className="hidden group-open:inline">{toggleLabelOpen}</span>
            <span
              className="text-xs transition-transform group-open:rotate-180 text-xv-accent-soft"
              aria-hidden="true"
            >
              ▼
            </span>
          </summary>

          <div className="mt-3 pt-3 border-t border-xv-bg-mid text-xs space-y-1.5 text-xv-accent-text font-montserrat">
            <p>
              <span className="text-xv-accent-soft font-medium">Banco:</span> {bank}
            </p>
            <p>
              <span className="text-xv-accent-soft font-medium">Beneficiario:</span>{" "}
              {beneficiary}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xv-accent-soft font-medium">Número de tarjeta:</span>
              <code className="font-mono text-xv-accent-text">{cardNumber}</code>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  copy(cardNumber);
                }}
                className="ml-auto p-1 rounded-md text-xv-accent-light hover:text-xv-accent-soft hover:bg-xv-bg-deepest/30 transition-colors"
                aria-label="Copiar número de tarjeta"
              >
                {copiedText === cardNumber ? (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Check size={12} /> Copiado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Copy size={12} /> Copiar
                  </span>
                )}
              </button>
            </div>
          </div>
        </details>
      </motion.div>
    </section>
  );
}