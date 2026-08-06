"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import Image from "next/image";
import ArrowLeftIcon from "@/icons/arrow-left-icon";
import AnimatedEntrance from "./AnimatedEntrance";
import { GalleryImage } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@heroui/theme";
import { useInView } from "framer-motion";

export type CarouselSlide = GalleryImage & {
  objectPosition?: string;
};

const defaultSlides: CarouselSlide[] = [
  {
    src: "/img/gallery/g1.jpg",
    alt: "Imagen de la galería 1",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g1.jpg",
    msrc: "/img/gallery/thumbs/g1.jpg",
  },
  {
    src: "/img/gallery/g2.jpg",
    alt: "Imagen de la galería 2",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g2.jpg",
    msrc: "/img/gallery/thumbs/g2.jpg",
  },
  {
    src: "/img/gallery/g3.jpg",
    alt: "Imagen de la galería 3",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g3.jpg",
    msrc: "/img/gallery/thumbs/g3.jpg",
  },
  {
    src: "/img/gallery/g4.jpg",
    alt: "Imagen de la galería 4",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g4.jpg",
    msrc: "/img/gallery/thumbs/g4.jpg",
  },
  {
    src: "/img/gallery/g5.jpg",
    alt: "Imagen de la galería 5",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g5.jpg",
    msrc: "/img/gallery/thumbs/g5.jpg",
  },
  {
    src: "/img/gallery/g7.jpg",
    alt: "Imagen de la galería 7",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g7.jpg",
    msrc: "/img/gallery/thumbs/g7.jpg",
  },
  {
    src: "/img/gallery/g8.jpg",
    alt: "Imagen de la galería 8",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g8.jpg",
    msrc: "/img/gallery/thumbs/g8.jpg",
  },
  {
    src: "/img/gallery/g9.jpg",
    alt: "Imagen de la galería 9",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g9.jpg",
    msrc: "/img/gallery/thumbs/g9.jpg",
  },
  {
    src: "/img/gallery/g10.jpg",
    alt: "Imagen de la galería 10",
    height: 6016,
    width: 4000,
    thumb: "/img/gallery/thumbs/g10.jpg",
    msrc: "/img/gallery/thumbs/g10.jpg",
  },
];

function Arrow({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <div className={className} onClick={onClick}>
      <ArrowLeftIcon className="w-[40px] h-[40px]" />
    </div>
  );
}

export default function SimpleSlider({
  slides = defaultSlides,
  activeDotClassName = "",
  height,
  dynamicHeight = false,
}: {
  slides?: CarouselSlide[];
  activeDotClassName?: string;
  height?: string | number;
  dynamicHeight?: boolean;
}) {
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 2000,
      // 🔥 Volvemos a true para que Embla no intente manejar esto por su cuenta.
      // Nosotros tomaremos el control manual.
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: false,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplayPlugin.current,
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(wrapperRef, { amount: 0.5 });

  // 🔥 Control manual en las flechas: Resetea el tiempo y sigue reproduciendo
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

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // 🔥 CONTROL MANUAL DE ARRASTRE (DRAG)
  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;

    // 1. Cuando el usuario toca la foto, paramos en seco el temporizador
    emblaApi.on("pointerDown", () => {
      autoplay.stop();
    });

    // 2. Cuando el usuario suelta la foto, reiniciamos el temporizador a 0 y lo iniciamos
    emblaApi.on("pointerUp", () => {
      autoplay.reset();
      autoplay.play();
    });
  }, [emblaApi]);

  // CONTROL MAESTRO DE VISIBILIDAD Y LIGHTBOX
  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;

    if (isInView && !isLightboxOpen) {
      autoplay.play();
    } else {
      autoplay.stop();
    }
  }, [isInView, isLightboxOpen, emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const lightbox = new PhotoSwipeLightbox({
      gallery: "#pswp-gallery-container",
      children: "a",
      pswpModule: () => import("photoswipe"),
      preload: [1, 3],
      showHideOpacity: true,
    });

    lightbox.on("beforeOpen", () => setIsLightboxOpen(true));

    lightbox.on("initialZoomInEnd", () => {
      if (wrapperRef.current) {
        wrapperRef.current.style.opacity = "0";
        wrapperRef.current.style.pointerEvents = "none";
      }
    });

    lightbox.on("close", () => {
      setIsLightboxOpen(false);
      if (wrapperRef.current) {
        wrapperRef.current.style.opacity = "1";
        wrapperRef.current.style.pointerEvents = "auto";
      }
    });

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
  }, [emblaApi]);

  const activeSlide = slides[selectedIndex];
  const activeAspectRatio =
    activeSlide && activeSlide.width && activeSlide.height
      ? `${activeSlide.width} / ${activeSlide.height}`
      : "2 / 3";

  return (
    <div className="relative py-12 w-11/12 mx-auto">
      <AnimatedEntrance>
        <div
          ref={wrapperRef}
          className="transition-opacity duration-300 ease-in-out w-full"
        >
          <div id="pswp-gallery-container" ref={galleryRef}>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex items-start">
                {" "}
                {slides.map((slide, idx) => (
                  <div key={idx} className="flex-[0_0_100%] px-2">
                    <a
                      href={slide.src}
                      data-pswp-width={slide.width}
                      data-pswp-height={slide.height}
                      data-pswp-src={slide.src}
                      data-pswp-msrc={slide.thumb}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full relative overflow-hidden transition-all duration-500 ease-in-out rounded-xl"
                      style={{
                        height: dynamicHeight ? "auto" : height || "70vh",
                        aspectRatio: dynamicHeight
                          ? activeAspectRatio
                          : undefined,
                      }}
                    >
                      <Image
                        alt={slide.alt}
                        src={slide.thumb}
                        fill
                        sizes="(max-width: 768px) 100vw, 80vw"
                        className="object-cover transition-transform duration-500"
                        placeholder="blur"
                        blurDataURL={slide.thumb}
                        priority={idx === 0}
                        style={{
                          objectPosition: slide.objectPosition || "center",
                        }}
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Arrow
            onClick={scrollPrev}
            className="absolute z-20 top-1/2 -translate-y-10 left-0 cursor-pointer"
          />
          <Arrow
            onClick={scrollNext}
            className="absolute z-20 top-1/2 -translate-y-10 right-0 rotate-180 cursor-pointer"
          />

          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // 🔥 También reseteamos el tiempo si tocan un puntito
                  emblaApi?.plugins().autoplay?.reset();
                  emblaApi?.plugins().autoplay?.play();
                  emblaApi?.scrollTo(idx);
                }}
                className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                  idx === selectedIndex
                    ? cn("bg-primary", activeDotClassName)
                    : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </AnimatedEntrance>
    </div>
  );
}
