"use client";

import { useCallback, useEffect, useState } from "react";

export interface UseClipboardOptions {
  /** Tiempo (ms) que el flag `copied` queda en `true` antes de resetear. */
  resetMs?: number;
}

export interface UseClipboardReturn {
  /** `true` durante los `resetMs` posteriores a una copia exitosa. */
  copied: boolean;
  /** Texto que se acaba de copiar (útil para distinguir varios botones). */
  copiedText: string | null;
  /**
   * Copia `text` al portapapeles. Resuelve `true` si la copia tuvo
   * éxito, `false` si falló por permisos / contexto no seguro / etc.
   *
   * Estrategia:
   *  1. Intenta `navigator.clipboard.writeText` (API moderna, requiere
   *     contexto seguro + permiso del usuario).
   *  2. Si no está disponible o falla, fallback con `<textarea>` +
   *     `execCommand("copy")` (deprecado pero todavía funciona como
   *     red de seguridad en navegadores antiguos o contextos HTTP).
   */
  copy: (text: string) => Promise<boolean>;
  /** Reset manual del flag (útil si quieres controlar el feedback). */
  reset: () => void;
}

/**
 * Hook compartido para copiar texto al portapapeles con feedback
 * automático de "copiado" durante N ms.
 *
 * Antes vivía inline en `siena/gifts-table.tsx`. Extraído a un módulo
 * neutral (no ligado a siena/xv) para que cualquier componente del
 * feature `front` lo reuse — `xv-anos/CashGiftCard`, `xv-anos/
 * SongSuggestionsSection`, etc.
 */
export function useClipboard(
  options: UseClipboardOptions = {},
): UseClipboardReturn {
  const { resetMs = 2000 } = options;
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const reset = useCallback(() => setCopiedText(null), []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // 1) API moderna (Clipboard API)
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        window.isSecureContext
      ) {
        try {
          await navigator.clipboard.writeText(text);
          setCopiedText(text);
          return true;
        } catch (err) {
          console.warn(
            "API Clipboard bloqueada, usando método alternativo...",
            err,
          );
          // cae al fallback
        }
      }

      // 2) Fallback: <textarea> temporal + execCommand("copy")
      if (typeof document === "undefined") return false;
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const ok = document.execCommand("copy");
        if (ok) {
          setCopiedText(text);
          return true;
        }
        console.error("Fallo al copiar texto (execCommand retornó false)");
        return false;
      } catch (err) {
        console.error("Fallo al copiar texto", err);
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    },
    [],
  );

  // Auto-reset del flag después de `resetMs`.
  useEffect(() => {
    if (copiedText === null) return;
    const t = setTimeout(() => setCopiedText(null), resetMs);
    return () => clearTimeout(t);
  }, [copiedText, resetMs]);

  return { copied: copiedText !== null, copiedText, copy, reset };
}