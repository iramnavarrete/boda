"use client";

import { useEffect, useRef } from "react";
import { cn } from "@heroui/theme";
import Image from "next/image";

type Props = {
  backgroundImage?: string;
  imageClassName?: string;
  panStart?: string;
  panEnd?: string;
};

export default function CountDown({
  backgroundImage = "/img/countdown.webp",
  imageClassName = "",
  panStart = "50% 50%",
  panEnd,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  useEffect(() => {
    if (!panEnd) return;

    let animationFrameId: number;

    const parsePosition = (str: string) => {
      const match = str.match(/-?\d+(\.\d+)?/g)?.map(Number) || [50, 50];
      const x = match[0] ?? 50;
      const y = match[1] ?? match[0] ?? 50;
      return [x, y];
    };

    const start = parsePosition(panStart);
    const end = parsePosition(panEnd);

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const distance = windowHeight - rect.top;
      const totalDistance = windowHeight + rect.height;

      const p = distance / totalDistance;
      targetProgress.current = Math.max(0, Math.min(1, p));
    };

    const smoothLoop = () => {
      currentProgress.current +=
        (targetProgress.current - currentProgress.current) * 0.07;

      if (imageRef.current) {
        const currentX =
          start[0] + (end[0] - start[0]) * currentProgress.current;
        const currentY =
          start[1] + (end[1] - start[1]) * currentProgress.current;

        imageRef.current.style.objectPosition = `${currentX}% ${currentY}%`;
      }

      animationFrameId = requestAnimationFrame(smoothLoop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();
    currentProgress.current = targetProgress.current;

    animationFrameId = requestAnimationFrame(smoothLoop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [panStart, panEnd]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100svh] bg-transparent"
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <div className="fixed top-0 max-w-[500px] 2xl:max-w-[600px] w-full h-screen">
            <Image
              ref={imageRef}
              src={backgroundImage}
              alt="Fondo de la invitación"
              fill
              priority
              sizes="100vh"
              className={cn("object-cover", imageClassName)}
              style={{ objectPosition: panStart }}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none" />
    </div>
  );
}
