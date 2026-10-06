"use client";

import { useSyncExternalStore } from "react";

/**
 * Themes disponibles para las invitaciones XV Años. El theme se aplica
 * vía `data-xv-theme="sapphire|emerald"` en el wrapper raíz (ver
 * `XvInvitationFrame`). Los CSS variables de cada theme viven en
 * `src/styles/globals.css` bajo los selectores `[data-xv-theme="…"]`.
 */
export type XvTheme = "sapphire" | "emerald";

/** Default en server / cuando aún no se leyó el DOM. */
const DEFAULT_THEME: XvTheme = "sapphire";

/**
 * Lee el theme XV activo del DOM leyendo el atributo `data-xv-theme`
 * del primer ancestro que lo tenga.
 *
 * Implementado con `useSyncExternalStore` (la forma idiomática de
 * React 18+ para leer de fuentes externas durante el render):
 *  - `subscribe` → MutationObserver sobre el atributo (reactividad
 *    automática si el theme cambia dinámicamente).
 *  - `getSnapshot` → lee el valor actual del DOM (síncrono, sin
 *    re-renders extras).
 *  - `getServerSnapshot` → devuelve el default en SSR.
 *
 * Ventaja vs. `useState + useEffect`: cero "setState in effect"
 * warnings, lectura síncrona, y se re-renderiza automáticamente si
 * el atributo cambia.
 */
function subscribe(callback: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const el = document.querySelector("[data-xv-theme]");
  if (!el) return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(el, { attributes: true, attributeFilter: ["data-xv-theme"] });
  return () => observer.disconnect();
}

function getSnapshot(): XvTheme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const el = document.querySelector("[data-xv-theme]");
  const t = el?.getAttribute("data-xv-theme");
  return t === "emerald" ? "emerald" : "sapphire";
}

function getServerSnapshot(): XvTheme {
  return DEFAULT_THEME;
}

export function useXVTheme(): XvTheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}