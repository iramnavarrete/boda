"use client";

import { useEffect, type RefObject } from "react";

const SMOOTH_TIME = 0.15; // segundos. Sube = más suave/lento, baja = más inmediato.
const MAX_DT = 1 / 24; // clamp para evitar saltos tras pausas del rAF

function parsePosition(str: string): [number, number] {
  const match = str.match(/-?\d+(\.\d+)?/g)?.map(Number) || [50, 50];
  const x = match[0] ?? 50;
  const y = match[1] ?? match[0] ?? 50;
  return [x, y];
}

type Options = {
  containerRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  /**
   * Velocidad relativa al scroll (estilo Jarallax), controla el eje Y.
   * 1 = sin parallax vertical. <1 = se rezaga (profundidad). >1 = se adelanta.
   */
  speed: number;
  /**
   * Posición horizontal de arranque, formato "X% Y%" (solo se usa la X).
   * Igual que panStart en CountDown. Default "50% 50%" = centrado, sin pan.
   */
  panStart?: string;
  /**
   * Posición horizontal final. Si se define (y su X difiere de panStart),
   * la imagen se desplaza en X conforme avanza el scroll — igual que en
   * CountDown, pero combinado aquí con el parallax vertical por velocidad.
   */
  panEnd?: string;
};

/**
 * Jarallax (velocidad en Y) + pan por posición (X), combinados en un solo
 * transform. Reutiliza la misma base de rendimiento que CountDown: RAF con
 * dt clampeado, IntersectionObserver, y transform en vez de propiedades
 * que disparan layout/paint.
 */
export function useSpeedParallax({
  containerRef,
  imageRef,
  speed,
  panStart = "50% 50%",
  panEnd,
}: Options) {
  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;

    const start = parsePosition(panStart);
    const end = panEnd ? parsePosition(panEnd) : start;

    const hasHorizontalPan = start[0] !== end[0];
    const hasVerticalSpeed = speed !== 1;

    // Si no hay ni pan horizontal ni velocidad vertical distinta de 1, no
    // hay nada que animar.
    if (!hasHorizontalPan && !hasVerticalSpeed) return;

    const container = containerRef.current;
    const image = imageRef.current;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Desplazamiento máximo (en % del propio elemento) que alcanza cada
    // eje a lo largo de todo el scroll. El overscan debe cubrir el mayor
    // de los dos para que ninguno descubra bordes vacíos.
    const maxTranslateXPercent = Math.max(
      Math.abs(50 - start[0]),
      Math.abs(50 - end[0]),
    );
    // El rango vertical total es |speed-1|*100%, repartido mitad para cada
    // lado del centro → la mitad es |speed-1|*50.
    const maxTranslateYPercent = Math.abs(speed - 1) * 50;
    const maxOffsetPercent = Math.max(
      maxTranslateXPercent,
      maxTranslateYPercent,
    );
    const overscan = 1 + maxOffsetPercent / 50 + 0.1;

    const targetProgress = { current: 0 };
    const currentProgress = { current: 0 };
    const lastTime = { current: 0 };
    const rafId: { current: number | null } = { current: null };
    const isVisible = { current: true };

    const applyProgress = (p: number) => {
      // X: interpolación directa entre panStart y panEnd, igual que en
      // CountDown (0 = panStart, 1 = panEnd).
      const x = start[0] + (end[0] - start[0]) * p;
      const translateXPercent = 50 - x;

      // Y: desplazamiento centrado por velocidad, igual que en el hook
      // anterior (Jarallax puro).
      const translateYPercent = (speed - 1) * (p - 0.5) * 100;

      image.style.transform = `translate3d(${translateXPercent}%, ${translateYPercent}%, 0) scale(${overscan})`;
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
  }, [containerRef, imageRef, speed, panStart, panEnd]);
}
