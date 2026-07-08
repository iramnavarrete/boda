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

const defaultSlides: GalleryImage[] = [
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
}: {
  slides?: GalleryImage[];
  activeDotClassName?: string;
}) {
  // 🔥 LA SOLUCIÓN: Guardamos el Autoplay en un useRef para que React no lo mate en cada render
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 2000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: false, // Inicia pausado hasta que hagamos scroll
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplayPlugin.current,
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Hook para saber si el carrusel es visible
  const isInView = useInView(wrapperRef, { amount: 0.1 });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // CONTROL MAESTRO DE AUTOPLAY
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

    lightbox.on("beforeOpen", () => {
      setIsLightboxOpen(true);
    });

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

    return () => {
      lightbox.destroy();
    };
  }, [emblaApi]);

  return (
    <div className="relative py-12 w-11/12 mx-auto">
      <AnimatedEntrance>
        <div
          ref={wrapperRef}
          className="transition-opacity duration-300 ease-in-out w-full"
        >
          <div id="pswp-gallery-container" ref={galleryRef}>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
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
                      className="block w-full relative h-[70vh] overflow-hidden"
                    >
                      <Image
                        alt={slide.alt}
                        src={slide.thumb}
                        fill
                        sizes="(max-width: 768px) 100vw, 80vw"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL={slide.thumb}
                        priority={idx === 0}
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Arrow
            onClick={scrollPrev}
            className="absolute z-20 top-1/2 -translate-y-1/2 left-0 cursor-pointer"
          />
          <Arrow
            onClick={scrollNext}
            className="absolute z-20 top-1/2 -translate-y-1/2 right-0 rotate-180 cursor-pointer"
          />

          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`w-1 h-1 rounded-full ${
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
