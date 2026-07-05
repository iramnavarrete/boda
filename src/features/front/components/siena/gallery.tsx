import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import Carousel from "@/features/front/components/Carousel";
import { GalleryImage } from "@/types";
import { cn } from "@heroui/theme";

type Props = {
  containerClassName?: string;
  textClassName?: string;
  svgsColor?: string;
  slides?: GalleryImage[];
};

export default function Gallery({
  containerClassName = "",
  textClassName = "",
  svgsColor,
  slides,
}: Props) {
  return (
    <div
      className={cn(
        "bg-accent flex flex-col items-center justify-center py-24 relative overflow-hidden",
        containerClassName,
      )}
    >

      <AnimatedEntrance classname="w-full flex flex-col items-center relative z-10">
        {/* Overline Editorial */}
        <p className="text-[10px] font-nourdMedium text-primary/60 uppercase tracking-[0.4em] mb-4 text-center">
          — Galería —
        </p>

        {/* Título Script */}
        <p
          className={cn(
            "text-4xl font-newIconScript text-primary mb-6 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.03)] text-center px-4",
            textClassName,
          )}
        >
          Nuestros recuerdos
        </p>

        {/* Divisor minimalista */}
        <div className="flex items-center justify-center gap-3 mb-8 opacity-60">
          <div className="w-8 h-px bg-primary/30" />
          <span className="text-primary/50 text-xs">✦</span>
          <div className="w-8 h-px bg-primary/30" />
        </div>

        {/* Texto poético con estilo refinado */}
        <p
          className={cn(
            "font-nourdLight text-sm text-primary/80 leading-relaxed text-center px-8 mb-4 italic",
            textClassName,
          )}
        >
          &quot;Detrás de cada instante congelado en el tiempo, vibra la dulce
          nostalgia de un amor que florece y se guarda para siempre.&quot;
        </p>
      </AnimatedEntrance>

      {/* Contenedor del Carrusel */}
      <AnimatedEntrance classname="w-full relative z-10">
        <Carousel
          slides={slides}
          activeDotClassName={svgsColor ? `bg-[${svgsColor}]` : undefined}
        />
      </AnimatedEntrance>
    </div>
  );
}
