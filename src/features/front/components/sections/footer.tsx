import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import HeartIcon from "@/icons/heart-icon";
import { useInView } from "framer-motion";
import { type LottieRefCurrentProps } from "lottie-react";
import animationData from "../../../../lottie/logojn.json";
import { useEffect, useRef } from "react";
import WhatsappIcon from "@/icons/whatsappIcon";
import CustomLottie from "@/features/shared/components/CustomLottie";

export default function Footer() {
  const playerRef = useRef<LottieRefCurrentProps>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(divRef);

  useEffect(() => {
    const animation = async () => {
      const player = playerRef.current;

      if (!player) return;

      if (isInView) {
        player.goToAndStop(30, true);
        await new Promise((res) => setTimeout(res, 500)); // espera a que termine la animación más 200 de delay
        player.goToAndPlay(30, true);
      } else {
        player.stop();
      }
    };
    animation();
  }, [isInView]);

  return (
    <div className="bg-accent flex flex-col items-center justify-center py-5">
      <AnimatedEntrance>
        <div className="flex flex-col items-center justify-center gap-4 text-sm font-nourdLight text-primary">
          <div className="flex flex-row gap-1">
            <p>Hecho con</p>
            <HeartIcon className="h-6 w-6 text-primary" />
            <p>por</p>
          </div>
          <div ref={divRef} className="flex justify-center">
            <CustomLottie
              className="w-[70%]"
              animationData={animationData}
              lottieRef={playerRef}
              autoPlay={false}
              loop={false}
            />
          </div>
          <div className="flex flex-col max-w-[25ch] py-4">
            <p>
              Haz tu evento inolvidable desde la primera impresión. Escríbeme.
            </p>
            <a
              href="https://wa.me/526142537718?text=Me%20gustar%C3%ADa%20saber%20m%C3%A1s%20informaci%C3%B3n%20sobre%20las%20invitaciones%20digitales"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center mt-4"
            >
              <WhatsappIcon className="w-12 h-12" />
            </a>
          </div>
          <div>
            <p>
              © Copyright {new Date().getFullYear()}. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </AnimatedEntrance>
    </div>
  );
}
