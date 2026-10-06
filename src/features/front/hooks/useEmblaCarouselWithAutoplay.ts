"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { AutoplayOptionsType } from "embla-carousel-autoplay";
import { useInView, type UseInViewOptions } from "framer-motion";

/**
 * Tipo de las opciones de Embla (primer argumento de `useEmblaCarousel`).
 * Derivado del propio hook para no depender del paquete `embla-carousel`
 * (no instalado directamente — sólo transitivamente vía
 * `embla-carousel-react` y `embla-carousel-autoplay`).
 */
type EmblaOptions = Parameters<typeof useEmblaCarousel>[0];

/** API de Embla (segundo elemento de la tupla retornada). */
type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

export interface UseEmblaCarouselWithAutoplayOptions {
  /** Opciones de Embla (`loop`, `align`, `containScroll`, `skipSnaps`…). */
  emblaOptions?: EmblaOptions;
  /** Opciones del plugin Autoplay (`delay`, `stopOnInteraction`, etc.). */
  autoplay?: AutoplayOptionsType;
  /** Opciones de `useInView` (default: `{ amount: 0.5 }`). */
  inView?: UseInViewOptions;
  /** Si `true`, NO monta el plugin de autoplay (carrusel estático). */
  disableAutoplay?: boolean;
}

export interface UseEmblaCarouselWithAutoplayReturn {
  /** Ref para el wrapper del carrusel (necesario para in-view).
   *  Tipado como `RefObject<HTMLDivElement>` (no-nullable) para
   *  compatibilidad directa con `ref={...}` en JSX. */
  ref: React.RefObject<HTMLDivElement>;
  /** Ref para el viewport Embla (root del carrusel). */
  emblaRef: (node: HTMLElement | null) => void;
  /** API de Embla (o `undefined` antes del mount). */
  emblaApi: EmblaApi | undefined;
  /** `true` cuando el wrapper está al menos 50% en viewport. */
  isInView: boolean;
  /** Estado de la lightbox (PhotoSwipe). Pausa el autoplay cuando abre. */
  isLightboxOpen: boolean;
  setIsLightboxOpen: (open: boolean) => void;
  /** Handlers que REINICIAN el autoplay después de cada acción. */
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  /** `true` si el plugin de autoplay está montado y operable. */
  autoplayReady: boolean;
}

/**
 * Hook compartido: Embla + Autoplay + in-view + drag-detection.
 *
 * Encapsula EXACTAMENTE el patrón que usa el carrusel de Siena
 * (gallery + melissa-santiago + vianey-omar):
 *
 *  - Crea el plugin de Autoplay (`stopOnInteraction: true`,
 *    `stopOnMouseEnter: true`, `playOnInit: false` por default).
 *  - Detecta con `useInView(..., { amount: 0.5 })` si el wrapper está
 *    en pantalla — sólo entonces corre el autoplay.
 *  - Pausa el autoplay cuando se abre un lightbox (PhotoSwipe).
 *  - En `pointerDown` para el autoplay; en `pointerUp` lo resetea y
 *    reanuda (así el drag no se "pelea" con el auto-advance).
 *  - `scrollPrev/Next/To` resetean el timer antes de avanzar.
 *
 * Usado por:
 *  - `features/front/components/Carousel.tsx` (siena: bodas)
 *  - `features/front/components/xv-anos/XvGallery.tsx` (xv años)
 *
 * DRY: cualquier ajuste futuro al comportamiento del autoplay se hace
 * UNA sola vez acá y se propaga a ambos.
 */
export function useEmblaCarouselWithAutoplay(
  options: UseEmblaCarouselWithAutoplayOptions = {},
): UseEmblaCarouselWithAutoplayReturn {
  const {
    emblaOptions,
    autoplay,
    inView = { amount: 0.5 },
    disableAutoplay = false,
  } = options;

  /* Plugin de autoplay (memoizado — vive durante todo el mount) */
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 2000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: false,
      ...autoplay,
    }),
  );

  /* Plugins pasados a Embla */
  const plugins = disableAutoplay ? [] : [autoplayPlugin.current];

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);

  /* Wrapper ref para useInView. El tipado `useRef<HTMLDivElement>(null)`
     * funciona con React 19 (que infiere `RefObject<HTMLDivElement | null>`)
     * y se proyecta a `RefObject<HTMLDivElement>` no-nullable en el
     * return del hook para que el consumer pueda hacer `ref={wrapperRef}`
     * sin cast. */
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, inView);

  /* Estado del lightbox (PhotoSwipe). El consumer lo controla. */
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  /* Play/pause en función de inView + lightbox */
  useEffect(() => {
    if (!emblaApi) return;
    const ap = emblaApi.plugins().autoplay;
    if (!ap) return;
    if (isInView && !isLightboxOpen) {
      ap.play();
    } else {
      ap.stop();
    }
  }, [isInView, isLightboxOpen, emblaApi]);

  /* Drag detection — pause en pointerDown, reset+play en pointerUp */
  useEffect(() => {
    if (!emblaApi) return;
    const ap = emblaApi.plugins().autoplay;
    if (!ap) return;
    emblaApi.on("pointerDown", () => ap.stop());
    emblaApi.on("pointerUp", () => {
      ap.reset();
      ap.play();
    });
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.plugins().autoplay?.reset();
    emblaApi.plugins().autoplay?.play();
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.plugins().autoplay?.reset();
    emblaApi.plugins().autoplay?.play();
    emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (idx: number) => {
      if (!emblaApi) return;
      emblaApi.plugins().autoplay?.reset();
      emblaApi.plugins().autoplay?.play();
      emblaApi.scrollTo(idx);
    },
    [emblaApi],
  );

  return {
    ref: ref as unknown as React.RefObject<HTMLDivElement>,
    emblaRef,
    emblaApi,
    isInView,
    isLightboxOpen,
    setIsLightboxOpen,
    scrollPrev,
    scrollNext,
    scrollTo,
    autoplayReady: !disableAutoplay,
  };
}