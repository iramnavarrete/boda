import AnimatedEntrance from "@/components/AnimatedEntrance";
import Carousel from "@/components/Carousel";

export default function Gallery() {
  return (
    <div className="bg-white flex flex-col items-center justify-center py-20">
      <AnimatedEntrance>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="font-sacramento text-4xl text-center">Galería</p>
          <p className="font-handlee text-medium text-center px-10">
            En cada fotografía hay un universo de emociones que no se pueden
            explicar, solo sentir.
          </p>
        </div>
      </AnimatedEntrance>
      <Carousel />
    </div>
  );
}
