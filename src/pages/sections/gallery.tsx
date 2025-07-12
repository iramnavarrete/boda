import AnimatedEntrance from "@/components/AnimatedEntrance";
import Carousel from "@/components/Carousel";
import Separator from "@/icons/separator";

export default function Gallery() {
  return (
    <div className="bg-accent flex flex-col items-center justify-center py-16">
      <AnimatedEntrance>
        <div className="flex flex-col items-center justify-center gap-4">
          <Separator className="mx-10" />
          <p className="pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-primary">
            Galería
          </p>
          <p className="font-nourdLight text-medium text-center px-10">
            En cada fotografía hay un universo de emociones que no se pueden
            explicar, solo sentir.
          </p>
        </div>
      </AnimatedEntrance>
      <Carousel />
    </div>
  );
}
