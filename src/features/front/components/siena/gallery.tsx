"use client";

import { useEffect, useState } from "react";
import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import Carousel from "@/features/front/components/Carousel";
import { GalleryImage } from "@/types";
import { cn } from "@heroui/theme";

// 🔥 1. Extendemos InputSlide para aceptar objectPosition
export type InputSlide = Omit<GalleryImage, "width" | "height"> & {
  width?: number;
  height?: number;
  /**
   * Permite ajustar la posición de la miniatura antes de abrirla.
   * Ej: "center top", "20% 50%", "right bottom"
   */
  objectPosition?: string;
};

type Props = {
  containerClassName?: string;
  textClassName?: string;
  svgsColor?: string;
  slides?: InputSlide[];
  // 🔥 2. Nueva prop para controlar la altura del carrusel (vista previa)
  carouselHeight?: string | number | 'dynamic';
};

export default function Gallery({
  containerClassName = "",
  textClassName = "",
  svgsColor,
  slides = [],
  carouselHeight,
}: Props) {
  // Estado para guardar las diapositivas ya con sus medidas calculadas
  const [processedSlides, setProcessedSlides] = useState<GalleryImage[]>([]);

  useEffect(() => {
    if (!slides || slides.length === 0) return;

    let isMounted = true;

    const loadDimensions = async () => {
      const promises = slides.map((slide) => {
        return new Promise<GalleryImage>((resolve) => {
          // Si ya vienen las medidas (por si acaso), las respetamos
          // (Mantuvimos el casteo o construcción correcta según tu GalleryImage type)
          if (slide.width && slide.height) {
            resolve(slide as unknown as GalleryImage);
            return;
          }

          // Si no, creamos una imagen invisible en memoria para extraer su tamaño real
          const img = new Image();
          img.src = slide.src;

          img.onload = () => {
            resolve({
              ...slide,
              width: img.naturalWidth,
              height: img.naturalHeight,
            } as unknown as GalleryImage);
          };

          img.onerror = () => {
            // Medida de seguridad por si la imagen falla al cargar
            resolve({
              ...slide,
              width: 1200,
              height: 1600,
            } as unknown as GalleryImage);
          };
        });
      });

      const results = await Promise.all(promises);
      if (isMounted) {
        setProcessedSlides(results);
      }
    };

    loadDimensions();

    return () => {
      isMounted = false;
    };
  }, [slides]);

  return (
    <div
      className={cn(
        "bg-accent flex flex-col items-center justify-center py-24 relative overflow-hidden",
        containerClassName,
      )}
    >
      <AnimatedEntrance classname={cn("w-full flex flex-col items-center relative z-10", textClassName)}>
        {/* Overline Editorial */}
        <p className="text-[10px] font-nourdMedium text-current opacity-40 uppercase tracking-[0.4em] mb-4 text-center">
          — Galería —
        </p>

        {/* Título Script */}
        <p
          className="text-4xl font-newIconScript text-current mb-6 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.03)] text-center px-4"
        >
          Nuestros recuerdos
        </p>

        {/* Divisor minimalista */}
        <div className="flex items-center justify-center gap-3 mb-8 opacity-60">
          <div className="w-8 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
          <span className="text-current/50 text-xs">✦</span>
          <div className="w-8 h-px bg-[color-mix(in_srgb,currentColor_30%,transparent)]" />
        </div>

        {/* Texto poético con estilo refinado */}
        <p
          className="font-nourdLight text-sm text-current/80 leading-relaxed text-center px-8 mb-4 italic"
        >
          &quot;Detrás de cada instante congelado en el tiempo, vibra la dulce
          nostalgia de un amor que florece y se guarda para siempre.&quot;
        </p>
      </AnimatedEntrance>

      {/* Contenedor del Carrusel */}
      <AnimatedEntrance classname="w-full relative z-10 mt-8">
        {/* Solo renderizamos el Carousel cuando ya tenemos las medidas calculadas */}
        {processedSlides.length > 0 && (
          <Carousel
            slides={processedSlides}
            activeDotClassName={svgsColor ? `bg-[${svgsColor}]` : undefined}
            height={carouselHeight} 
            dynamicHeight={carouselHeight === 'dynamic'}
          />
        )}
      </AnimatedEntrance>
    </div>
  );
}