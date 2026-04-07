import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import Carousel from "@/features/front/components/Carousel";
import Separator from "@/icons/separator";
import { GalleryImage } from "@/types";
import { cn } from "@heroui/theme";

type Props = {
  containerClassName?: string;
  textClassName?: string;
  svgsColor?: string;
  slides?: GalleryImage[]
};

export default function Gallery({ containerClassName = "", textClassName = '', svgsColor, slides }: Props) {
  return (
    <div
      className={cn(
        "bg-accent flex flex-col items-center justify-center py-16",
        containerClassName,
      )}
    >
      <AnimatedEntrance>
        <div className="flex flex-col items-center justify-center gap-4">
          <Separator className="mx-10" color={svgsColor} />
          <p
            className={cn(
              "pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary",
              textClassName,
            )}
          >
            Nuestros recuerdos
          </p>
          <p
            className={cn(
              "font-nourdLight text-medium text-center px-10"
            )}
          >
            Detrás de cada instante congelado en el tiempo, vibra la dulce
            nostalgia de un amor que florece y se guarda para siempre.
          </p>
        </div>
      </AnimatedEntrance>
      <Carousel
        slides={slides}
        activeDotClassName={svgsColor ? `bg-[${svgsColor}]` : undefined}
      />
    </div>
  );
}
