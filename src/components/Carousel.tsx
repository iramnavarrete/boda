"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import Image from "next/image";
import ArrowLeftIcon from "@/icons/arrow-left-icon";
import AnimatedEntrance from "./AnimatedEntrance";
import { GalleryImage } from "../../types/types";
import Autoplay from "embla-carousel-autoplay";

const autoplay = Autoplay({
  delay: 2000, // milisegundos entre slides
  stopOnInteraction: true, // no se detiene si el usuario toca el slider
  stopOnMouseEnter: true, // pausa al hacer hover
  playOnInit: true, // inicia automáticamente
});

const slides: GalleryImage[] = [
  {
    src: "/img/gallery/1.webp",
    alt: "Imagen de la galería 1",
    height: 5103,
    width: 3306,
    thumb: "/img/gallery/thumbs/1.webp",
  },
  {
    src: "/img/gallery/2.webp",
    alt: "Imagen de la galería 2",
    height: 5095,
    width: 3397,
    thumb: "/img/gallery/thumbs/2.webp",
  },
  {
    src: "/img/gallery/3.webp",
    alt: "Imagen de la galería 3",
    height: 5184,
    width: 3456,
    thumb: "/img/gallery/thumbs/3.webp",
  },
  {
    src: "/img/gallery/4.webp",
    alt: "Imagen de la galería 4",
    height: 5184,
    width: 3456,
    thumb: "/img/gallery/thumbs/4.webp",
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

export default function SimpleSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#pswp-gallery-container",
      children: "a",
      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();

    lightbox.on("change", () => {
      if (emblaApi && typeof lightbox.pswp?.currIndex === "number") {
        emblaApi.scrollTo(lightbox.pswp.currIndex, true);
      }
    });

    return () => {
      lightbox.destroy();
    };
  }, [emblaApi]);

  return (
    <div className="relative py-12 w-5/6 mx-auto">
      <AnimatedEntrance>
        <div id="pswp-gallery-container" ref={galleryRef}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] px-2" // 1 slide visible, full width
                >
                  <a
                    href={slide.src}
                    data-pswp-width={slide.width}
                    data-pswp-height={slide.height}
                    data-pswp-src={slide.src}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full h-full"
                  >
                    <Image
                      alt={slide.alt}
                      src={slide.thumb}
                      width={800}
                      height={600}
                      className="w-full h-auto"
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

        {/* Flechas personalizadas */}
        <Arrow
          onClick={scrollPrev}
          className="absolute z-20 top-1/2 -translate-y-1/2 left-0 cursor-pointer"
        />
        <Arrow
          onClick={scrollNext}
          className="absolute z-20 top-1/2 -translate-y-1/2 right-0 rotate-180 cursor-pointer"
        />

        {/* Dots personalizados */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`w-1 h-1 rounded-full ${
                idx === selectedIndex ? "bg-primary" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </AnimatedEntrance>
    </div>
  );
}
