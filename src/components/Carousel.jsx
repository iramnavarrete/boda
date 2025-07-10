import ArrowLeftIcon from "@/icons/arrow-left-icon";
import Image from "next/image";
import { useRef } from "react";
import Slider from "react-slick";
import AnimatedEntrance from "./AnimatedEntrance";

const slides = [1, 2, 3, 4];

function Arrow(props) {
  const { className, onClick } = props;
  return (
    <div className={className} onClick={onClick}>
      <ArrowLeftIcon className="w-[40px] h-[40px]" />
    </div>
  );
}

export default function SimpleSlider() {
  const sliderRef = useRef(null);
  var settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    useTransform: false,
    arrows: false,
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    customPaging: (page) => {
      return (
        <a>
          <Image
            src={`/img/gallery/${page + 1}.webp`}
            className={`slide-${page + 1}`}
            width={0}
            height={0}
            sizes="100vw"
            alt={`thumb-for-slide-${page + 1}`}
          />
        </a>
      );
    },
  };
  return (
    <div className="relative py-20 w-5/6 h-full">
      <AnimatedEntrance>
        <Slider
          ref={sliderRef}
          {...settings}
          className="slider-root w-full h-full"
        >
          {slides.map((slide) => {
            return (
              <div key={`slide-${slide}`}>
                <Image
                  alt={`Imagen número ${slide} de la galería`}
                  className="slide-img w-full h-auto"
                  width={0}
                  height={0}
                  sizes="100vw"
                  src={`/img/gallery/${slide}.webp`}
                  priority
                />
              </div>
            );
          })}
        </Slider>
        <Arrow
          className="absolute z-20 top-1/2 left-[-5px]"
          onClick={() => {
            if (sliderRef.current) {
              sliderRef.current.slickPrev();
            }
          }}
        />
        <Arrow
          className="absolute z-20 top-1/2 right-[5px] rotate-180"
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
