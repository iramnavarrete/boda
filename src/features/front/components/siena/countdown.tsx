"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@heroui/theme";
import Image from "next/image";
import CountDownJarallax from "./countdownJarallax";

export type CountDownVariant = "default" | "jarallax";

type Props = {
  /**
   * Implementación a renderizar.
   * - "default" (por defecto): versión original con `position: fixed` y pan
   *   por object-position animado vía RAF.
   * - "jarallax": variante con parallax por velocidad (Y) + pan (X). La
   *   imagen vive dentro de su propia sección (sin `position: fixed`).
   *
   * Las props exclusivas de cada variant (ver JSDoc abajo) se ignoran cuando
   * no aplican, para mantener ambos componentes independientes.
   */
  variant?: CountDownVariant;

  backgroundImage?: string;
  imageClassName?: string;
  /**
   * Clases extra para el contenedor raíz de la sección. Sirve para
   * sobreescribir la altura por defecto (`h-[100svh]`) o añadir padding,
   * background, etc. Aplica a ambos variants.
   */
  className?: string;
  panStart?: string;
  panEnd?: string;

  /** Jarallax-only (sin efecto cuando variant="default"). */
  speed?: number;
  /** Jarallax-only (sin efecto cuando variant="default"). */
  children?: ReactNode;
};

const SMOOTH_TIME = 0.15; // segundos. Sube = más suave/lento, baja = más inmediato.
const MAX_DT = 1 / 24; // clamp para evitar saltos tras pausas del rAF

function parsePosition(str: string): [number, number] {
  const match = str.match(/-?\d+(\.\d+)?/g)?.map(Number) || [50, 50];
  const x = match[0] ?? 50;
  const y = match[1] ?? match[0] ?? 50;
  return [x, y];
}

// Overscan dinámico: cuánto hay que escalar la imagen para que el
// translate máximo no descubra bordes vacíos.
function computeOverscan(start: [number, number], end: [number, number]) {
  const range =
    Math.max(start[0], start[1], end[0], end[1]) -
    Math.min(start[0], start[1], end[0], end[1]);
  return 1 + range / 100 + 0.3;
}

function toTransform(x: number, y: number, overscan: number) {
  // translate en % (respecto al propio elemento) — se compone en GPU,
  // no dispara layout ni paint.
  return `translate3d(${50 - x}%, ${50 - y}%, 0) scale(${overscan})`;
}

type DefaultProps = {
  backgroundImage?: string;
  imageClassName?: string;
  className?: string;
  panStart?: string;
  panEnd?: string;
};

/**
 * Implementación original: imagen con `position: fixed` y pan por
 * object-position animado vía RAF (transform + scale con overscan).
 */
function CountDownDefault({
  backgroundImage = "/img/countdown.webp",
  imageClassName = "",
  className,
  panStart = "50% 50%",
  panEnd,
}: DefaultProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number | null>(null);
  const isVisible = useRef(true);

  useEffect(() => {
    if (!panEnd || !containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const image = imageRef.current;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const start = parsePosition(panStart);
    const end = parsePosition(panEnd);
    const overscan = computeOverscan(start, end);

    const applyProgress = (p: number) => {
      const x = start[0] + (end[0] - start[0]) * p;
      const y = start[1] + (end[1] - start[1]) * p;
      image.style.transform = toTransform(x, y, overscan);
    };

    const computeTargetProgress = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.visualViewport?.height ?? window.innerHeight;
      const distance = windowHeight - rect.top;
      const totalDistance = windowHeight + rect.height;
      const p = totalDistance > 0 ? distance / totalDistance : 0;
      targetProgress.current = Math.max(0, Math.min(1, p));
    };

    const stopLoop = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    const loop = (timestamp: number) => {
      const rawDt = lastTime.current
        ? (timestamp - lastTime.current) / 1000
        : 1 / 60;
      const dt = Math.min(rawDt, MAX_DT);
      lastTime.current = timestamp;

      const factor = 1 - Math.exp(-dt / SMOOTH_TIME);
      currentProgress.current +=
        (targetProgress.current - currentProgress.current) * factor;

      applyProgress(currentProgress.current);
      rafId.current = requestAnimationFrame(loop);
    };

    const ensureLoopRunning = () => {
      if (rafId.current === null && isVisible.current) {
        lastTime.current = 0;
        rafId.current = requestAnimationFrame(loop);
      }
    };

    const handleScroll = () => {
      computeTargetProgress();
      if (prefersReducedMotion) {
        currentProgress.current = targetProgress.current;
        applyProgress(currentProgress.current);
        return;
      }
      ensureLoopRunning();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (isVisible.current) ensureLoopRunning();
        else stopLoop();
      },
      { threshold: 0 },
    );

    computeTargetProgress();
    currentProgress.current = targetProgress.current;
    applyProgress(currentProgress.current);

    observer.observe(container);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      stopLoop();
    };
  }, [panStart, panEnd]);

  const staticStyle = !panEnd ? { objectPosition: panStart } : undefined;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[100svh] bg-transparent",
        className,
      )}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <div className="fixed top-0 max-w-[500px] 2xl:max-w-[600px] w-full h-screen overflow-hidden">
            <Image
              ref={imageRef}
              src={backgroundImage}
              alt="Fondo de la invitación"
              fill
              priority
              sizes="100vh"
              className={cn(
                "object-cover will-change-transform",
                imageClassName,
              )}
              style={staticStyle}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none" />
    </div>
  );
}

/**
 * Wrapper que delega al variant correspondiente.
 *
 * Importante: NO comparte lógica de hooks entre variants. Cada variant
 * mantiene su propio árbol de componentes y su propio ciclo de vida, para
 * que sea trivial cambiar entre uno y otro sin arrastrar estado ni
 * subscripciones.
 */
export default function CountDown({
  variant = "default",
  backgroundImage,
  imageClassName,
  panStart,
  panEnd,
  speed,
  className,
  children,
}: Props) {
  if (variant === "jarallax") {
    return (
      <CountDownJarallax
        backgroundImage={backgroundImage}
        imageClassName={imageClassName}
        panStart={panStart}
        panEnd={panEnd}
        speed={speed}
        className={className}
      >
        {children}
      </CountDownJarallax>
    );
  }

  return (
    <CountDownDefault
      backgroundImage={backgroundImage}
      imageClassName={imageClassName}
      className={className}
      panStart={panStart}
      panEnd={panEnd}
    />
  );
}
