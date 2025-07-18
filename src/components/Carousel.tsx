import ArrowLeftIcon from "@/icons/arrow-left-icon";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import Slider, { Settings } from "react-slick";
import AnimatedEntrance from "./AnimatedEntrance";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { GalleryImage } from "../../types/types";

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
interface ArrowProps {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

function Arrow(props: ArrowProps) {
  const { className, onClick } = props;
  return (
    <div className={className} onClick={onClick}>
      <ArrowLeftIcon className="w-[40px] h-[40px]" />
    </div>
  );
}

export default function SimpleSlider() {
  const sliderRef = useRef<Slider>(null);

  // Define las configuraciones de Slick con el tipo Settings
  const settings: Settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    useTransform: false,
    arrows: false, 
    dots: true,
    adaptiveHeight: false,
  };

  useEffect(() => {
    // PhotoSwipe necesita un selector CSS que apunte al contenedor de los `<a>` tags.
    // La clase `my-slick-gallery` (o `pswp-gallery` como la usas) se aplicará al div padre del Slider.
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#pswp-gallery-container", // <-- Este ID se aplica al div que envuelve el Slider
      children: "div:not(.slick-cloned) >div>div> a", // PhotoSwipe buscará elementos 'a' dentro de este contenedor
      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();

    // Opcional: Sincronizar el slider con la imagen de PhotoSwipe
    lightbox.on("change", () => {
      if (
        sliderRef.current &&
        lightbox.pswp &&
        typeof lightbox.pswp.currIndex === "number"
      ) {
        sliderRef.current.slickGoTo(lightbox.pswp.currIndex);
      }
    });


    return () => {
      lightbox.destroy();
    };
  }, []); // Dependencias vacías para que se ejecute solo una vez al montar

  return (
    // El contenedor principal de la galería. Aquí es donde definirás el 80% de ancho.
    <div className="relative py-12 w-5/6 mx-auto">
      <AnimatedEntrance>
        <div id="pswp-gallery-container" className="w-full h-full">
          {/* Asegúrate de que este div tenga un tamaño */}
          <Slider
            ref={sliderRef}
            {...settings}
            className="slider-root" // React-Slick añade sus propias clases, esta es adicional
          >
            {/* CADA ELEMENTO HIJO DIRECTO DE SLIDER ES UN SLIDE */}
            {slides.map((slide, idx) => (
              <div key={idx} className="slick-slide-wrapper">
                <a
                  key={`pswp-gallery-item-${idx}`} // Mejor key para el 'a'
                  href={slide.src}
                  data-pswp-width={slide.width}
                  data-pswp-height={slide.height}
                  data-pswp-src={slide.src}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full h-full" // Asegura que el 'a' ocupe todo el espacio de la slide
                >
                  <Image
                    alt={slide.alt || `Imagen número ${idx} de la galería`}
                    width={slide.width}
                    height={slide.height}
                    quality={10}
                    className="slide-img" // Puedes añadir más estilos aquí si necesitas
                    src={slide.thumb}
                  />
                </a>
              </div>
            ))}
          </Slider>
        </div>
        {/* Flechas de navegación personalizadas fuera del Slider, controlando el SliderRef */}
        <Arrow
          className="absolute z-20 top-1/2 -translate-y-1/2 left-0" // Ajusta la posición de la flecha
          onClick={() => {
            if (sliderRef.current) {
              sliderRef.current.slickPrev();
            }
          }}
        />
        <Arrow
          className="absolute z-20 top-1/2 -translate-y-1/2 right-0 rotate-180" // Ajusta la posición
          onClick={() => {
            if (sliderRef.current) {
              sliderRef.current.slickNext();
            }
          }}
        />
      </AnimatedEntrance>
    </div>
  );
}
