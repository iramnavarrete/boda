"use client";

/**
 * Interpolador GLOBAL compartido para el drag de elementos en el canvas.
 *
 * ¿Por qué global? Cada TableElement tenía su propio RAF loop
 * independiente, lo cual causaba que el multi-select se moviera
 * "a destiempo" — cada mesa procesaba su frame en momentos
 * ligeramente diferentes, dando la sensación de que unas van
 * adelantadas y otras atrasadas.
 *
 * Con un SOLO RAF global que itera sobre todas las cards registradas,
 * garantizamos que TODAS las mesas se actualicen en el mismo frame
 * con el mismo target, eliminando el desfase.
 *
 * Suavizado: usa "smooth-damp" (estilo Unity), que es frame-rate
 * independent. La fórmula `factor = 1 - exp(-dt / smoothTime)`
 * produce una curva natural de ease-out: el elemento arranca rápido
 * y se desacelera suavemente hacia el target. Se siente más "vivo"
 * que un lerp lineal con factor fijo.
 */

type ComputeTargetFn = () => { x: number; y: number } | null;

interface InterpolatorEntry {
  card: HTMLElement;
  currentX: number;
  currentY: number;
  /** Si ya hicimos el "snap" inicial al primer target. */
  initialized: boolean;
  rotation: number;
  computeTarget: ComputeTargetFn;
}

const entries = new Map<string, InterpolatorEntry>();
let raf = 0;
let lastFrameTime = 0;


/**
 * Smooth-damp (estilo Unity): el tiempo en segundos que tarda el
 * interpolador en alcanzar ~63% del target. Más bajo = más
 * responsivo, más alto = más suave.
 *
 * La fórmula `factor = 1 - exp(-dt / smoothTime)` es frame-rate
 * independent: en monitores 60Hz y 120Hz se siente igual.
 *
 * - 0.04s: muy responsivo, prácticamente directo (~2 frames de lag)
 * - 0.06s: responsivo con suavizado apenas perceptible  ← default
 * - 0.12s: balanceado (~70ms lag, sensación natural)
 *
 * Usamos 0.06s para minimizar el lag sin perder el suavizado.
 */
const SMOOTH_TIME = 0.06;

/** Distancia mínima bajo la cual hacemos snap directo (evita deriva infinita). */
const SNAP_THRESHOLD = 0.5;

function tick() {
  // Programar el siguiente RAF al final del tick (solo si hay entries)
  if (entries.size === 0) {
    raf = 0;
    return;
  }
  raf = requestAnimationFrame(tick);

  // Calcular dt real entre frames. Limitamos a 100ms para evitar
  // saltos grandes si el tab perdió foco o hubo un lag de render.
  // El smooth-damp es frame-rate independent: usa dt real, así que
  // funciona igual de bien a 60Hz, 120Hz o cualquier refresh rate.
  const now = performance.now();
  const dt = Math.min(
    lastFrameTime === 0 ? 1 / 60 : (now - lastFrameTime) / 1000,
    0.1
  );
  lastFrameTime = now;

  // Smooth-damp factor: ease-out exponencial
  // A 60fps (dt=0.0167s): factor = 1 - exp(-0.0167/0.06) ≈ 0.243
  // A 120fps (dt=0.0083s): factor = 1 - exp(-0.0083/0.06) ≈ 0.130
  // (factor más pequeño a más fps → misma curva, más muestras)
  const factor = 1 - Math.exp(-dt / SMOOTH_TIME);


  for (const entry of entries.values()) {
    const target = entry.computeTarget();
    if (!target) continue;

    // Snap en el primer frame: evitamos que la interpolación arranque
    // desde 0,0 cuando el elemento está siendo arrastrado a (200, 300)
    if (!entry.initialized) {
      entry.currentX = target.x;
      entry.currentY = target.y;
      entry.initialized = true;
    }

    let newX: number;
    let newY: number;

    const distX = target.x - entry.currentX;
    const distY = target.y - entry.currentY;

    // Snap directo si el error residual es menor al umbral:
    // evita la "deriva" infinita donde el elemento nunca llega exactamente
    // al target y sigue interpolando en fracciones de píxel.
    if (Math.abs(distX) < SNAP_THRESHOLD && Math.abs(distY) < SNAP_THRESHOLD) {
      newX = target.x;
      newY = target.y;
    } else {
      // Smooth-damp: ease-out exponencial hacia el target
      newX = entry.currentX + distX * factor;
      newY = entry.currentY + distY * factor;
    }

    entry.currentX = newX;
    entry.currentY = newY;

    // Aplicar al DOM via ref (sin pasar por React).
    //
    // ORDEN: `translate3d(...) rotate(...)` — el `translate3d` se
    // aplica PRIMERO en coords del mundo (lo que dicta el cursor),
    // y luego el `rotate` rota la card alrededor de su `transformOrigin`
    // (que es el centro de la card ya trasladada).
    //
    // ¿Por qué este orden y no el inverso?
    //   En CSS, `transform: A B` se interpreta como "transformar
    //   usando A sobre el resultado de transformar usando B". O sea,
    //   B transforma el vector original PRIMERO, y A transforma el
    //   resultado después. Si ponemos `rotate(deg) translate3d(dx,dy)`
    //   el `translate3d` se aplica DENTRO del sistema rotado (eje X
    //   local ≠ eje X del mundo) → la card se desplaza en
    //   diagonal cuando está rotada 90°/45° y se mueve siguiendo
    //   al cursor de forma "errónea".
    //   Con `translate3d(dx,dy) rotate(deg)`, el `translate3d` se
    //   aplica en coords del MUNDO (antes de la rotación), y la
    //   rotación es solo una transformación visual posterior que
    //   NO afecta la dirección del drag.
    entry.card.style.transform = `translate3d(${newX}px, ${newY}px, 0) rotate(${entry.rotation}deg)`;
  }
}

function startLoop() {
  if (raf) return;
  lastFrameTime = 0;
  raf = requestAnimationFrame(tick);
}

function stopLoop() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

/**
 * Registra una card en el interpolador. Si ya existe, solo
 * actualiza el `computeTarget` (útil cuando cambian las props).
 */
export function registerCard(
  id: string,
  card: HTMLElement,
  computeTarget: ComputeTargetFn,
) {
  const existing = entries.get(id);
  if (existing) {
    existing.card = card;
    existing.computeTarget = computeTarget;
  } else {
    entries.set(id, {
      card,
      currentX: 0,
      currentY: 0,
      initialized: false,
      rotation: 0,
      computeTarget,
    });
  }
  startLoop();
}

/**
 * Desregistra una card del interpolador y restaura el transform correctamente.
 *
 * ESTRATEGIA DE LIMPIEZA SÍNCRONA (corrige el bug de rotación):
 *
 *   El bug era: al soltar el drag, el element aparecía visualmente en 0°
 *   aunque el store dijera 90°. Causa: el RAF diferido del cleanup
 *   ejecutaba `style.transform = ""` DESPUÉS de que React había
 *   aplicado `rotate(90deg)`, sobrescribiendo la rotación correcta.
 *
 *   Solución: limpiar SÍNCRONAMENTE y aplicar la rotación final
 *   de inmediato al DOM. React, en su siguiente render, verá que el
 *   `style.transform` ya tiene `rotate(90deg)` y lo dejará igual
 *   (o lo sobreescribirá con el mismo valor → sin flash).
 *
 * @param id             ID del elemento a desregistrar.
 * @param finalRotation  Rotación final en grados (del store). Si se omite
 *                       o es 0, se limpia el transform a "".
 */
export function unregisterCard(id: string, finalRotation?: number) {
  const entry = entries.get(id);
  if (entry) {
    entries.delete(id);

    // Aplicar el transform final de forma SÍNCRONA antes del próximo
    // render de React para evitar flash de posición/rotación incorrecta.
    if (finalRotation !== undefined && finalRotation !== 0) {
      // Mantenemos la rotación visible mientras React re-renderiza.
      // React sobreescribirá con el mismo valor → sin flash.
      entry.card.style.transform = `rotate(${finalRotation}deg)`;
    } else {
      // Sin rotación: limpiamos el inline style. React aplicará
      // `transform: none` en su render, que es equivalente.
      entry.card.style.transform = "";
    }
  }
  if (entries.size === 0) stopLoop();
}

/** Actualiza la rotación de una card registrada. */
export function setCardRotation(id: string, rotation: number) {
  const entry = entries.get(id);
  if (entry) entry.rotation = rotation;
}

/** Limpia todo el interpolador (útil para HMR o tests). */
export function cleanupAll() {
  for (const entry of entries.values()) {
    entry.card.style.transform = "";
  }
  entries.clear();
  stopLoop();
}
