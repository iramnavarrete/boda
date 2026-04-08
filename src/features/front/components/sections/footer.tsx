import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import HeartIcon from "@/icons/heart-icon";
import { useInView } from "framer-motion";
import { type LottieRefCurrentProps } from "lottie-react";
import animationData from "../../../../lottie/logojn.json";
import { useEffect, useRef } from "react";
import WhatsappIcon from "@/icons/whatsappIcon";
import CustomLottie from "@/features/shared/components/CustomLottie";
import { cn } from "@heroui/theme";
import { colorizeLottie } from "@/utils/lottie";

export default function Footer({
  textClassName = "",
  containerClassName = "",
  svgsColor
}: {
  textClassName?: string;
  containerClassName?: string;
  svgsColor?: string;
}) {
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
    <div
      className={cn(
        "bg-accent flex flex-col items-center justify-center py-5",
        containerClassName,
      )}
    >
      <AnimatedEntrance>
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4 text-sm font-nourdLight text-primary",
            textClassName,
          )}
        >
          <div className="flex flex-row gap-1">
            <p>Hecho con</p>
            <HeartIcon className="h-6 w-6" />
            <p>por</p>
          </div>
          <div ref={divRef} onClick={() => {window.open("https://jninvitaciones.com", "_blank")}} className="flex justify-center">
            <CustomLottie
              className={cn(
                "w-[70%]",
                svgsColor
                  ? `[&_path]:!fill-[${svgsColor}]`
                  : "",
              )}
              animationData={svgsColor ? colorizeLottie(animationData, "jn_logo", {main: '#000', secondary: svgsColor}) : animationData}
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
              <WhatsappIcon className={cn("w-12 h-12", textClassName)} />
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
