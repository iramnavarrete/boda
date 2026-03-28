"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LottieRefCurrentProps } from "lottie-react";
import { useInView } from "framer-motion";

// Importación dinámica para evitar problemas de SSR con lottie-react
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="h-14 w-14 bg-[#fefefe] animate-pulse rounded-md" />
  ),
});

interface CustomLottieProps {
  animationData?: unknown;
  className?: string;
  lottieClassName?: string;
  startFrame?: number;
  delay?: number;
  loop?: boolean;
  autoPlay?: boolean;
  lottieRef?: React.RefObject<LottieRefCurrentProps | null> | any;

  // --- Nuevas props de compatibilidad (formato legacy / react-lottie) ---
  options?: any;
  isClickToPauseDisabled?: boolean;
  isPaused?: boolean;
  eventListeners?: Array<{ eventName: string; callback: () => void }>;
  [key: string]: any; // Permite pasar otras props nativas libremente
}

export default function CustomLottie({
  animationData,
  className = "",
  lottieClassName = "",
  startFrame = 0,
  delay = 0,
  loop = false,
  autoPlay = false,
  lottieRef,
  options,
  isClickToPauseDisabled,
  isPaused = false,
  eventListeners,
  ...rest // Resto de props
}: CustomLottieProps) {
  const internalRef = useRef<LottieRefCurrentProps>(null);
  const activeRef = lottieRef || internalRef;

  const divRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(divRef);

  // NUEVO: Estado para saber cuando Lottie realmente terminó de montarse en el DOM
  const [isLoaded, setIsLoaded] = useState(false);

  // Mapeo de opciones legacy
  const finalAnimationData = animationData || options?.animationData || options;
  const finalLoop = options?.loop !== undefined ? options.loop : loop;
  const finalAutoPlay =
    options?.autoplay !== undefined ? options.autoplay : autoPlay;
  const finalRendererSettings = options?.rendererSettings;

  const mappedEvents: Record<string, () => void> = {};
  if (eventListeners) {
    eventListeners.forEach(({ eventName, callback }) => {
      const reactLottieEventName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
      mappedEvents[reactLottieEventName] = callback;
    });
  }

  useEffect(() => {
    const animation = async () => {
      const player = activeRef.current;

      // Esperamos a que el player exista Y que Lottie haya notificado que cargó
      if (!player || !isLoaded) return;

      if (isPaused) {
        player.pause();
        return;
      }

      if (isInView) {
        if (startFrame > 0) {
          player.goToAndStop(startFrame, true);
        }

        if (delay > 0) {
          await new Promise((res) => setTimeout(res, delay));
        }

        if (isPaused) return;

        if (startFrame > 0) {
          player.goToAndPlay(startFrame, true);
        } else {
          player.play();
        }
      } else {
        player.pause();
      }
    };

    animation();
  }, [isInView, startFrame, delay, activeRef, isPaused, isLoaded]); // <-- Agregamos isLoaded como dependencia

  return (
    <div ref={divRef} className={className}>
      <Lottie
        className={lottieClassName}
        animationData={finalAnimationData}
        lottieRef={activeRef}
        autoplay={finalAutoPlay}
        loop={finalLoop}
        rendererSettings={finalRendererSettings} // <-- Mapeamos los ajustes de renderizado (preserveAspectRatio, etc.)
        {...mappedEvents}
        onDOMLoaded={() => {
          // 1. Avisamos a nuestro useEffect que ya puede ejecutar lógica de play/pause
          setIsLoaded(true);

          // 2. Si el componente padre envió su propia función DOMLoaded (como tu console.log), la ejecutamos
          if (mappedEvents.onDOMLoaded) {
            mappedEvents.onDOMLoaded();
          }
        }}
        {...rest}
      />
    </div>
  );
}
