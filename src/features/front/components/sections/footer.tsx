import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import HeartIcon from "@/icons/heart-icon";
import { useInView } from "framer-motion";
import { type LottieRefCurrentProps } from "lottie-react";
import animationData from "../../../../lottie/logojn.json";
import { useEffect, useMemo, useRef, useState } from "react";
import WhatsappIcon from "@/icons/whatsappIcon";
import CustomLottie from "@/features/shared/components/CustomLottie";
import { cn } from "@heroui/theme";
import { colorizeLottie } from "@/utils/lottie";
import { useXVTheme } from "@/features/front/hooks/useXVTheme";

/**
 * Variante visual del Footer.
 *
 * - `"wedding"` (default) — estilo clásico: bg-accent, texto theme-driven,
 *   corazón default, WhatsApp como icono simple sin background.
 * - `"xv"` — estilo XV AUTO-TEMATIZADO: detecta el theme activo (sapphire
 *   o emerald) del DOM y deriva todos los colores (background, lottie,
 *   WhatsApp CTA, heart glow) de los tokens del theme. NO requiere pasar
 *   `svgsColor` / `containerClassName` / `textClassName` manualmente —
 *   el componente se autoconfigura.
 */
export type FooterVariant = "wedding" | "xv";

/**
 * Color HEX que se pasa a `colorizeLottie` para pintar el logo "JN" del
 * lottie con el accent del theme XV. Cada entrada es el equivalente hex
 * de la CSS variable `--xv-accent-soft` (definida en `globals.css`):
 *   - sapphire: rgb(186 230 253) = #bae6fd (sky-300)
 *   - emerald:  rgb(223 190 125) = #dfbe7d (gold-300)
 *
 * Si los valores de `--xv-accent-soft` cambian en `globals.css`, hay que
 * actualizar este map. El comentario apunta a la fuente de verdad.
 */
const XV_LOTTIE_COLORS: Record<"sapphire" | "emerald", string> = {
  sapphire: "#bae6fd",
  emerald: "#dfbe7d",
};

export default function Footer({
  textClassName = "",
  containerClassName = "",
  svgsColor,
  variant = "wedding",
}: {
  textClassName?: string;
  containerClassName?: string;
  svgsColor?: string;
  variant?: FooterVariant;
}) {
  const playerRef = useRef<LottieRefCurrentProps>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(divRef);
  const xvTheme = useXVTheme();
  const isXv = variant === "xv";

  /**
   * Color efectivo para el lottie JN:
   * - En XV → auto-derivado del theme activo (sapphire → sky-300, emerald → gold-300)
   * - En wedding → `svgsColor` que pase el caller, o undefined (lottie con color por defecto)
   *
   * NOTA: en XV, si el caller pasa `svgsColor` manualmente lo IGNORAMOS
   * — la idea es que el theme mande y no haya que hardcodear el color.
   */
  const effectiveSvgsColor = isXv ? XV_LOTTIE_COLORS[xvTheme] : svgsColor;

  /**
   * Colorización memoizada del lottie.
   *
   * `colorizeLottie` reemplaza los colores en el JSON, pero
   * `lottie-react` a veces IGNORA el `animationData` actualizado en el
   * primer mount (race entre `useMemo` y el `useEffect` interno de
   * lottie-react que crea la animación).
   *
   * FIX: forzar un re-mount controlado vía `mountKey` + `setTimeout(0)`.
   * El `setTimeout` hace el setState asíncrono → evita el warning de
   * "Calling setState synchronously within an effect".
   */
  const [mountKey, setMountKey] = useState(0);
  const prevSvgsColorRef = useRef<string | undefined>(undefined);

  const colorizedAnimationData = useMemo(() => {
    if (!effectiveSvgsColor) return animationData;
    return colorizeLottie(animationData, "jn_logo", {
      main: effectiveSvgsColor,
      secondary: effectiveSvgsColor,
      jnLogo: variant === "xv" ? "#fff" : "#000"
    });
  }, [effectiveSvgsColor]);

  /** Forzar re-mount del lottie. Disparamos el setState de forma
   *  asíncrona (setTimeout 0) para evitar el warning de React 19
   *  sobre cascading renders. */
  useEffect(() => {
    if (prevSvgsColorRef.current === effectiveSvgsColor) {
      // Primer mount → forzar re-mount para que lottie-react tome el JSON
      // colorizado (el primer mount suele tener un race con el useMemo).
      const timer = setTimeout(() => setMountKey((k) => k + 1), 0);
      return () => clearTimeout(timer);
    }
    // Cambio real de svgsColor → forzar re-mount con los nuevos colores
    prevSvgsColorRef.current = effectiveSvgsColor;
    const timer = setTimeout(() => setMountKey((k) => k + 1), 0);
    return () => clearTimeout(timer);
  }, [effectiveSvgsColor]);

  /**
   * Tracking para NO re-disparar la animación de entrada cuando el
   * componente re-renderiza por causas ajenas al viewport (ej. cuando
   * el usuario hace play/pause de la música y el store de Zustand
   * re-renderiza todo el árbol). ANTES: el useEffect dependía de
   * `[isInView]`, pero al re-renderizar el padre el IntersectionObserver
   * podía re-evaluar y disparar `goToAndStop(30)` + `goToAndPlay(30)`,
   * reseteando el lottie a frame 30 y haciendo que PARPADEE/desaparezca
   * visualmente.
   *
   * Ahora: usamos un `ref` para trackear el estado real anterior del
   * viewport y sólo hacemos el setup de animación cuando hay una
   * transición REAL (false→true o true→false). El setup se ejecuta
   * una sola vez por entrada al viewport.
   */
  const prevInViewRef = useRef(false);
  const setupDoneRef = useRef(false);

  useEffect(() => {
    if (prevInViewRef.current === isInView) return; // No hay cambio real
    prevInViewRef.current = isInView;

    if (!isInView) {
      // Salió del viewport → reset para que la próxima vez vuelva a animar
      setupDoneRef.current = false;
      playerRef.current?.stop();
      return;
    }

    if (setupDoneRef.current) return; // Ya se animó en esta entrada
    setupDoneRef.current = true;

    const animation = async () => {
      const player = playerRef.current;
      if (!player) return;
      player.goToAndStop(30, true);
      await new Promise((res) => setTimeout(res, 500));
      player.goToAndPlay(30, true);
    };
    animation();
  }, [isInView]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        isXv ? "bg-xv-bg-deepest py-10" : "bg-accent py-5",
        // En XV el theme controla el background → ignorar containerClassName.
        // En wedding, containerClassName sigue funcionando como siempre.
        isXv ? undefined : containerClassName,
      )}
    >
      <AnimatedEntrance>
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4 text-sm text-primary",
            isXv
              ? "font-cormorant !text-white"
              : "font-nourdLight text-primary",
            textClassName,
          )}
        >
          {/* "Hecho con ❤ por" — corazón con glow theme-aware en XV.
              El drop-shadow usa `var(--xv-shadow-text-glow)` (definido en
              globals.css): sky-300 para sapphire, gold-300 para emerald.
              La boda mantiene el corazón sin glow (style original). */}
          <div className="flex flex-row items-center gap-1.5">
            <p>Hecho con</p>
            <HeartIcon
              className={cn(
                "h-6 w-6",
                isXv && "h-5 w-5 text-xv-accent-soft",
              )}
              style={
                isXv
                  ? { filter: "drop-shadow(var(--xv-shadow-text-glow))" }
                  : undefined
              }
            />
            <p>por</p>
          </div>

          {/* Lottie con color del tema (cuando se pasa `svgsColor`).
              La clase extra `[&_path]:!fill-[X]` también fuerza el color
              vía CSS por si el `colorizeLottie` no llega a tiempo.
              Drop-shadow del lottie SOLO en variant "xv" — la boda se
              queda sin glow. Color desde `var(--xv-accent-soft)` al 40%. */}
          <div
            ref={divRef}
            onClick={() => {
              window.open("https://jninvitaciones.com", "_blank");
            }}
            className="flex justify-center"
            style={
              isXv
                ? {
                    filter:
                      "drop-shadow(0 0 14px rgb(var(--xv-accent-soft) / 0.4))",
                  }
                : undefined
            }
          >
            <CustomLottie
              /* `key={mountKey}` fuerza re-mount del player. El useEffect
                 con `[]` incrementa mountKey a 1 después del primer
                 render → React desmonta el lottie original y monta uno
                 NUEVO que SÍ toma el JSON colorizado de `useMemo`
                 (verificado: `colorizeLottie` sí reemplaza los colores,
                 pero el primer mount del lottie-react los ignora por
                 un race condition interno). */
              key={mountKey}
              className={cn(
                "w-[70%]",
                effectiveSvgsColor ? `[&_path]:!fill-[${effectiveSvgsColor}]` : "",
              )}
              animationData={colorizedAnimationData}
              lottieRef={playerRef}
              autoPlay={false}
              loop={false}
            />
          </div>

          {/* Tagline + CTA WhatsApp — diseño distinto por variant */}
          {isXv ? (
            <div className="flex flex-col max-w-[28ch] py-4 text-center">
              <p className="font-cormorant italic leading-snug">
                Haz tu evento inolvidable desde la primera impresión.
                <br />
                Escríbeme.
              </p>
              <a
                href="https://wa.me/526148750265?text=Me%20gustar%C3%ADa%20saber%20m%C3%A1s%20informaci%C3%B3n%20sobre%20las%20invitaciones%20digitales"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                className="group mt-5 mx-auto flex items-center justify-center w-14 h-14 rounded-full transition-all duration-400 active:scale-95"
                /* Gradient + glow theme-aware: usa `--xv-accent-soft` (sky-300
                   Gradient lineal diagonal (top-left → bottom-right) theme-aware.
                   Los colores se derivan de las CSS variables
                   `--xv-whatsapp-top` y `--xv-whatsapp-bottom` definidas
                   en `globals.css` bajo cada `[data-xv-theme]`:
                     - sapphire: top = deep sapphire blue, bottom = emerald
                     - emerald:  top = deep emerald,    bottom = emerald
                   Sólo se aplica en variant="xv" — la boda mantiene
                   su estilo original (icono WhatsApp simple sin gradient). */
                style={{
                  background: `linear-gradient(
                    135deg,
                    rgb(var(--xv-whatsapp-top) / 0.95) 0%,
                    rgb(var(--xv-whatsapp-top) / 0.95) 0%,
                    #10B981 100%
                  )`,
                  boxShadow: `
                    0 0 22px rgb(var(--xv-whatsapp-top) / 0.55),
                    0 0 60px rgba(16, 185, 129, 0.35),
                    inset 0 0 12px rgba(255,255,255,0.18)
                  `,
                }}
              >
                <WhatsappIcon className="w-7 h-7 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-110" />
              </a>
            </div>
          ) : (
            <div className="flex flex-col max-w-[25ch] py-4">
              <p>
                Haz tu evento inolvidable desde la primera impresión. Escríbeme.
              </p>
              <a
                href="https://wa.me/526148750265?text=Me%20gustar%C3%ADa%20saber%20m%C3%A1s%20informaci%C3%B3n%20sobre%20las%20invitaciones%20digitales"
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center items-center mt-4"
              >
                <WhatsappIcon className={cn("w-12 h-12", textClassName)} />
              </a>
            </div>
          )}
          <p
            className={cn(
              isXv
                ? "font-montserrat text-center text-[10px] tracking-[0.2em] uppercase opacity-60"
                : "",
            )}
          >
            © Copyright {new Date().getFullYear()}. Todos los derechos
            reservados.
          </p>
        </div>
      </AnimatedEntrance>
    </div>
  );
}
