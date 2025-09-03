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
    <div className="relative py-12 w-11/12 mx-auto">
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
                    data-pswp-msrc={slide.thumb}
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
        <div className="flex justify-center gap-2 mt-8">
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
