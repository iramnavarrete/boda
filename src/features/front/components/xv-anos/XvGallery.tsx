"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@heroui/theme";
import { useEmblaCarouselWithAutoplay } from "@/features/front/hooks/useEmblaCarouselWithAutoplay";

/**
 * Slide individual del carrusel XvGallery. Replica la slide del mockup de referencia:
 *  - badge "01 / 04" en top-right (opcional)
 *  - caption italic xv-glow (opcional)
 *  - subcaption tracking-widest en sky-300/80 (opcional)
 */
export interface XvGallerySlide {
  src: string;
  /** Miniatura. Si no se pasa, se usa `src`. */
  thumb?: string;
  alt: string;
  width?: number;
  height?: number;
  objectPosition?: string;
  /** Badge numérico top-right (ej. "01 / 04"). Si no, se calcula auto. */
  badge?: string;
  /** Caption italic inferior (ej. "Un sueño hecho realidad"). */
  caption?: string;
  /** Subcaption tracking-widest debajo del caption (ej. "Gala de Quinceañera"). */
  subcaption?: string;
}

interface Props {
  /** Pretítulo editorial (HTML: "MOMENTOS ESPECIALES"). */
  preTitle?: string;
  /** Heading principal (HTML: "Galería de Recuerdos"). */
  heading?: string;
  /** Emblema decorativo sobre el pretítulo (HTML: "✦ ✧ ✦"). */
  emblem?: string;
  /** Texto poético italic entre el heading y el carrusel. */
  customText?: string;
  /** Slides del carrusel (mínimo 1). */
  slides: XvGallerySlide[];
}

/**
 * XvGallery — sección de galería XV Años con carrusel Embla + PhotoSwipe.
 *
 * Implementación propia (NO usa `siena/gallery.tsx`). Mantiene el mismo
 * comportamiento funcional que el carrusel de Siena (Embla con autoplay,
 * dots, flechas + PhotoSwipe full-screen) pero con el look & feel del
 * mockup XV:
 *   - Header editorial: emblema + pretítulo + divider + heading + texto poético
 *   - Slides en cards con borde sky-300/35, badge "01 / 04" y caption
 *   - Carrusel con scroll-snap (muestra preview del siguiente/anterior)
 *   - Dots anchos: activo w-6 h-1.5, inactivo w-2 h-1.5
 *   - Flechas circulares flotantes a los lados
 *   - Click sobre la imagen → PhotoSwipe lightbox fullscreen
 *
 * Theme-aware: usa tokens `bg-xv-bg-deepest`, `border-xv-accent-soft/35`,
 * `text-xv-accent-soft`, etc. Cambian automáticamente según
 * `data-xv-theme="emerald|sapphire"` del contenedor padre.
 *
 * DRY: usa las mismas librerías que el carrusel de bodas (Embla + PhotoSwipe)
 * — sin agregar dependencias ni duplicar lógica.
 */
export default function XvGallery({
  preTitle = "Momentos Especiales",
  heading = "Galería de Recuerdos",
  emblem = "✦ ✧ ✦",
  customText = "Detrás de cada instante congelado en el tiempo, vibra la dulce magia de un momento que perdura para siempre.",
  slides,
}: Props) {
  // Hook compartido: Embla + autoplay + in-view + drag detection.
  // Mismo comportamiento que el carrusel de Siena (gallery + bodas
  // melissa-santiago / vianey-omar) — sólo cambia el look & feel.
  const {
    emblaRef,
    emblaApi,
    ref: wrapperRef,
    setIsLightboxOpen,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useEmblaCarouselWithAutoplay({
    emblaOptions: {
      loop: false,
      align: "center",
      containScroll: false,
      skipSnaps: false,
    },
    autoplay: {
      delay: 2500,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  /**
   * Dimensiones reales de cada imagen, calculadas en runtime para que
   * PhotoSwipe las use en `data-pswp-width/height` y NO estire las
   * imágenes a un aspect ratio incorrecto.
   *
   * Misma estrategia que `siena/gallery.tsx`: si la slide ya trae
   * `width/height` se respetan; si no, se carga un `new Image()` en
   * memoria y se lee `naturalWidth/naturalHeight`.
   */
  const [dims, setDims] = useState<
    Record<number, { width: number; height: number }>
  >({});

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    let isMounted = true;

    const promises = slides.map((slide, idx) => {
      if (slide.width && slide.height) {
        return Promise.resolve({
          idx,
          width: slide.width,
          height: slide.height,
        });
      }
      return new Promise<{
        idx: number;
        width: number;
        height: number;
      }>((resolve) => {
        // Usamos el `Image` nativo del DOM (window), porque arriba
        // importamos `Image` de `next/image` y eso sombrea el global.
        const img = new window.Image();
        img.src = slide.src;
        img.onload = () => {
          resolve({
            idx,
            width: img.naturalWidth || 1200,
            height: img.naturalHeight || 1600,
          });
        };
        img.onerror = () => {
          resolve({ idx, width: 1200, height: 1600 });
        };
      });
    });

    Promise.all(promises).then((results) => {
      if (!isMounted) return;
      const map: Record<number, { width: number; height: number }> = {};
      results.forEach((r) => {
        map[r.idx] = { width: r.width, height: r.height };
      });
      setDims(map);
    });

    return () => {
      isMounted = false;
    };
  }, [slides]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // PhotoSwipe fullscreen lightbox — se enlaza al contenedor #xv-gallery-container.
  // El flag `isLightboxOpen` viene del hook compartido, que a su vez
  // pausa el autoplay mientras la lightbox está abierta.
  useEffect(() => {
    if (!emblaApi) return;

    const lightbox = new PhotoSwipeLightbox({
      gallery: "#xv-gallery-container",
      children: "a",
      pswpModule: () => import("photoswipe"),
      preload: [1, 3],
      showHideOpacity: true,
    });

    lightbox.on("beforeOpen", () => setIsLightboxOpen(true));
    lightbox.on("close", () => setIsLightboxOpen(false));

    lightbox.on("change", () => {
      if (typeof lightbox.pswp?.currIndex === "number") {
        const nextIndex = lightbox.pswp.currIndex;
        requestAnimationFrame(() => {
          emblaApi.scrollTo(nextIndex, true);
        });
      }
    });

    lightbox.init();

    return () => lightbox.destroy();
  }, [emblaApi, setIsLightboxOpen]);

  const total = slides.length;

  if (total === 0) return null;

  return (
    <section
      id="xv-gallery-section"
      className="bg-xv-bg-deepest px-4 py-10 text-center relative overflow-hidden"
      aria-labelledby="xv-gallery-heading"
    >
      {/* ─── Header editorial ────────────────────────────────────────── */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {emblem && (
          <div className="flex justify-center mb-2">
            <div className="text-xv-accent-soft text-sm tracking-widest font-serif">
              {emblem}
            </div>
          </div>
        )}
        <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-xv-accent-soft font-semibold block mb-1">
          {preTitle}
        </span>
        <h2
          id="xv-gallery-heading"
          className="font-cormorant text-3xl text-white xv-glow mb-2"
        >
          {heading}
        </h2>
        <div className="flex items-center justify-center gap-3 max-w-[120px] mx-auto my-3">
          <span className="h-[1px] w-full bg-xv-accent-soft/40" />
          <span className="text-xv-accent-soft text-xs">✦</span>
          <span className="h-[1px] w-full bg-xv-accent-soft/40" />
        </div>
        {customText && (
          <p className="font-cormorant italic text-xs text-xv-accent-soft/90 leading-relaxed max-w-xs mx-auto px-2">
            “{customText}”
          </p>
        )}
      </motion.div>

      {/* ─── Carousel ────────────────────────────────────────────────── */}
      <motion.div
        ref={wrapperRef}
        className="relative max-w-[400px] mx-auto group"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex" id="xv-gallery-container">
            {slides.map((slide, idx) => {
              // Dimensiones reales para PhotoSwipe: prioriza las medidas
              // ya calculadas, luego las provistas en config, y al final
              // el fallback 1200x1600 (mientras se cargan las reales).
              const real = dims[idx];
              const pswpW = real?.width ?? slide.width ?? 1200;
              const pswpH = real?.height ?? slide.height ?? 1600;
              return (
              <div
                key={`${slide.src}-${idx}`}
                className="flex-[0_0_84%] sm:flex-[0_0_320px] min-w-0 px-1"
              >
                <div
                  className="rounded-3xl overflow-hidden p-2 border border-xv-accent-soft/35 shadow-2xl relative transition-all duration-300 backdrop-blur-md"
                  style={{
                    backgroundImage: `linear-gradient(180deg, var(--xv-bg-card-from) 0%, var(--xv-bg-card-to) 100%)`,
                  }}
                >
                  <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80">
                    <a
                      href={slide.src}
                      data-pswp-width={pswpW}
                      data-pswp-height={pswpH}
                      data-pswp-src={slide.src}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full h-full relative"
                    >
                      <Image
                        alt={slide.alt}
                        src={slide.thumb ?? slide.src}
                        fill
                        sizes="(max-width: 768px) 84vw, 320px"
                        className="object-cover"
                        priority={idx === 0}
                        style={{
                          objectPosition: slide.objectPosition ?? "center",
                        }}
                      />
                      {/* Gradient overlay para el look luxury */}
                      <div className="absolute inset-0 bg-gradient-to-t from-xv-bg-deepest via-xv-bg-deepest/20 to-transparent opacity-85 pointer-events-none" />
                    </a>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* ─── Flechas de navegación ───────────────────────────────── */}
        <button
          aria-label="Foto anterior"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          type="button"
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-xv-accent-soft/40",
            "flex items-center justify-center text-xv-accent-soft shadow-xl backdrop-blur-md",
            "active:scale-95 transition-all hover:bg-xv-accent-soft/20",
            "disabled:opacity-30 disabled:pointer-events-none",
          )}
          style={{
            backgroundColor: "rgb(var(--xv-bg-deepest) / 0.85)",
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          aria-label="Siguiente foto"
          onClick={scrollNext}
          disabled={!canScrollNext}
          type="button"
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-xv-accent-soft/40",
            "flex items-center justify-center text-xv-accent-soft shadow-xl backdrop-blur-md",
            "active:scale-95 transition-all hover:bg-xv-accent-soft/20",
            "disabled:opacity-30 disabled:pointer-events-none",
          )}
          style={{
            backgroundColor: "rgb(var(--xv-bg-deepest) / 0.85)",
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* ─── Dots indicator ────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-2 mt-4"
        role="tablist"
        aria-label="Selector de diapositiva"
      >
        {slides.map((_, idx) => {
          const isActive = idx === selectedIndex;
          return (
            <button
              key={idx}
              aria-label={`Ir a diapositiva ${idx + 1}`}
              onClick={() => scrollTo(idx)}
              type="button"
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                isActive
                  ? "w-6 bg-xv-accent-soft shadow-[0_0_8px_rgba(186,230,253,0.8)]"
                  : "w-2 bg-xv-accent-soft/30 hover:bg-xv-accent-soft/60",
              )}
            />
          );
        })}
      </div>
    </section>
  );
}
