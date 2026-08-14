import { SeatingElement, FamilyElement } from "@/types/seating";
import { drawElement } from "./planDrawing";

export interface CaptureOptions {
  dpi?: number;
  /**
   * Factor de resolución del canvas interno. 1 = coords del mundo,
   * 2.5 = 2.5x más pixeles (recomendado para impresión 300 DPI).
   */
  pixelRatio?: number;
}

export interface CapturedPlan {
  dataUrl: string;
  width: number;
  height: number;
  dpi: number;
}

/**
 * Renderiza el plano a PNG a ALTA RESOLUCIÓN.
 *
 * El truco está en que el canvas interno se crea con dimensiones
 * `worldSize * pixelRatio`. Cuando el layout final dibuja este PNG
 * a un tamaño menor, se hace un **downscale** (no upscale) y eso
 * conserva el detalle del texto y los círculos.
 *
 * Si renderizáramos a 1x y luego el layout lo agrandara, se vería
 * borroso (upscaling = pixelado).
 */
export async function capturePlanCanvas(
  elements: SeatingElement[],
  families: FamilyElement[],
  options: CaptureOptions = {},
): Promise<CapturedPlan> {
  const dpi = options.dpi ?? 300;
  // 2.5x = buen balance entre nitidez y peso de archivo
  // (≈ 9 MP para un plano típico de 1500x1000 mundo)
  const pixelRatio = options.pixelRatio ?? 2.5;

  // 1) Bounds del contenido (en coordenadas del mundo)
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of elements) {
    if (el.x < minX) minX = el.x;
    if (el.y < minY) minY = el.y;
    if (el.x + el.width > maxX) maxX = el.x + el.width;
    if (el.y + el.height > maxY) maxY = el.y + el.height;
  }
  if (!isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 800;
    maxY = 600;
  }

  const PADDING = 60;
  const contentW = maxX - minX;
  const contentH = maxY - minY;
  // Canvas real = mundo × pixelRatio
  const canvasW = Math.round((contentW + PADDING * 2) * pixelRatio);
  const canvasH = Math.round((contentH + PADDING * 2) * pixelRatio);

  // 2) Crear canvas de alta resolución
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas 2D.");

  // 3) Aplicar pixelRatio: el resto del código sigue usando coords del mundo,
  //    pero el canvas real tiene más pixeles → texto nítido al hacer downscale.
  ctx.scale(pixelRatio, pixelRatio);

  // 4) Fondo blanco (en coords del mundo)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, contentW + PADDING * 2, contentH + PADDING * 2);

  // 5) Dibujar las mesas
  ctx.save();
  ctx.translate(PADDING - minX, PADDING - minY);

  for (const el of elements) {
    ctx.save();
    ctx.translate(el.x, el.y);
    drawElement({ ctx, scale: 1 }, el, families);
    ctx.restore();
  }

  ctx.restore();

  // 6) Convertir a PNG
  const dataUrl = canvas.toDataURL("image/png");
  const img = await loadImage(dataUrl);

  return {
    dataUrl,
    width: img.naturalWidth,
    height: img.naturalHeight,
    dpi,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
