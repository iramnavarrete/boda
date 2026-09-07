"use client";

import { useRef } from "react";
import { cn } from "@heroui/theme";
import Image from "next/image";
import { useSpeedParallax } from "../../hooks/useSpeedParallax";

type Props = {
  backgroundImage?: string;
  imageClassName?: string;
  /** Clases para controlar tamaño/altura de la sección. Por defecto ocupa 100svh. */
  className?: string;
  children?: React.ReactNode;
  /**
   * Velocidad relativa al scroll (eje Y), igual a `data-speed` de Jarallax.
   * 0.8 (default) reproduce el mismo efecto que el HTML de ejemplo.
   */
  speed?: number;
  /**
   * Posición horizontal de arranque (formato "X% Y%", solo se usa la X).
   * Igual convención que en CountDown.
   */
  panStart?: string;
  /**
   * Posición horizontal final. Si se define, la imagen se desplaza en X
   * conforme avanza el scroll, combinado con el parallax vertical de `speed`.
   */
  panEnd?: string;
};

/**
 * Variante de CountDown que combina dos técnicas:
 * - Vertical (Y): parallax por velocidad, estilo Jarallax (`speed`).
 * - Horizontal (X): pan por posición, estilo CountDown (`panStart`/`panEnd`).
 *
 * La imagen vive DENTRO de su propia sección (flujo normal del documento,
 * sin el truco de `position: fixed` que usa CountDown).
 *
 * No modifica CountDown.tsx — es un componente independiente.
 */
export default function CountDownJarallax({
  backgroundImage = "/img/countdown.webp",
  imageClassName = "",
  className,
  children,
  speed = 0.8,
  panStart = "50% 50%",
  panEnd,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useSpeedParallax({ containerRef, imageRef, speed, panStart, panEnd });

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-[70svh] overflow-hidden", className)}
    >
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <Image
            ref={imageRef}
            src={backgroundImage}
            alt="Fondo de la invitación"
            fill
            priority
            sizes="100vh"
            className={cn("object-cover will-change-transform", imageClassName)}
            style={{ objectPosition: panStart }}
          />
        </div>
      )}

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
        {children}
      </div>
    </div>
  );
}
