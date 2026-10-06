/**
 * Variants compartidas para animaciones de entrada (Framer Motion)
 * del módulo XV Años — Emerald & Gold Luxury.
 *
 * Importante: NO exportamos el tipo `Variants` directamente para
 * evitar problemas de inferencia con `motion.div` en TS 5.x
 * (el tipo `TargetAndTransition` se vuelve "demasiado complejo").
 * En su lugar, exportamos **objetos planos** que se pasan como
 * `initial={{...}}` / `whileInView={{...}}` directo en cada
 * `motion.*`. Es el mismo patrón que usa `siena/parents.tsx`,
 * `siena/ceremony-toast.tsx`, etc.
 *
 * Cada export es un objeto literal con `opacity`, `y`, `transition`.
 *
 * Respeta `prefers-reduced-motion` automáticamente (Framer lo detecta).
 */

/** Fade + slide-up simple (8s ease-out). */
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
} as const;

/** Solo fade-in. */
export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
} as const;

/** Scale-spring (entrada con rebote sutil). */
export const scaleSpring = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 18 },
  },
} as const;

/** Slide-up + spring. */
export const slideUpSpring = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
} as const;

/** Defaults para que cada sección reuse `whileInView` consistente. */
export const inViewViewport = {
  once: true,
  amount: 0.2,
} as const;