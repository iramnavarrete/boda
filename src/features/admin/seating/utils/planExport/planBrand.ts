/** Constantes de marca (compartidas por image y PDF). */
export const BRAND_NAME = "JN Invitaciones";
export const BRAND_URL = "https://jninvitaciones.com";
export const BRAND_MUTED = "#7A7A7A";

/** Path al logo estático en /public. */
const BRAND_LOGO_URL = "/brand/jn-invitaciones-logo.png";

/** Texto del watermark. */
export const BRAND_TAG = `Generado con`;

/**
 * Carga el logo de la marca como `HTMLImageElement` (para `ctx.drawImage`).
 *
 * Va directo al PNG estático de /public, sin pasar por React DOM ni
 * html-to-image → evita errores de cross-origin stylesheet.
 */
export function loadBrandIcon(): Promise<HTMLImageElement> {
  return loadImage(BRAND_LOGO_URL);
}

/**
 * Devuelve los bytes PNG del logo a alta resolución (para embeber
 * en el PDF con `pdfDoc.embedPng`).
 */
export async function getBrandIconPngBytes(): Promise<Uint8Array> {
  const response = await fetch(BRAND_LOGO_URL);
  if (!response.ok) {
    throw new Error(
      `No se pudo cargar el logo de marca (${response.status} ${response.statusText})`,
    );
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

// =====================================================================
// Helpers internos
// =====================================================================

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`No se pudo cargar la imagen: ${src}`));
    img.src = src;
  });
}
