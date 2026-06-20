import { cn } from "@heroui/theme";
import Image from "next/image";

export default function CountDown({
  backgroundImage = "/img/countdown.webp",
  imageClassName = "",
}: {
  backgroundImage?: string;
  imageClassName?: string;
}) {
  return (
    <div className="relative w-full h-[100svh] bg-transparent">
      {backgroundImage && (
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <div className="fixed top-0 max-w-[500px] 2xl:max-w-[600px] w-full h-screen transform-gpu">
            <Image
              src={backgroundImage}
              alt="Fondo de la invitación"
              fill
              priority
              className={cn("object-cover object-center", imageClassName)}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none" />
    </div>
  );
}
