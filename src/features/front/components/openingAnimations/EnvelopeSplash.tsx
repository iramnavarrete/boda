"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CustomLottie from "@/features/shared/components/CustomLottie";

import mobile from "@/public/lottie/envolpe.json";
import desktop from "@/public/lottie/envolpeDesktop.json";
import { cn } from "@heroui/theme";

const variants = {
  hidden: {
    opacity: 0,
    transition: { ease: "easeInOut", duration: 0.2 },
  },
  loop: { scale: 1.15 },
};

interface EnvelopeSplashProps {
  className?: string;
  onOpen: () => void; // Callback para avisarle al Home que el sobre se abrió
  sealImage?: string;
}

export default function EnvelopeSplash({
  className = "",
  onOpen,
  sealImage
}: EnvelopeSplashProps) {
  const [isSealVisible, setIsSealVisible] = useState(true);
  const [envolpeDivHidden, setEnvolpeDivHidden] = useState(false);
  const [isLottiePaused, setIsLottiePaused] = useState(true);
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);
  const [overlayHidden, setOverlayHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1280);
    };

    document.body.classList.add("overflow-hidden");
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLottieComplete = () => {
    setIsLottieLoaded(true);
  };

  const handleSealClick = () => {
    window.scrollTo({ top: 0 });
    setIsSealVisible(false); // Ocultamos el sello

    setTimeout(() => {
      setIsLottiePaused(false); // Iniciamos la animación
      onOpen(); // Le avisamos al padre (Home) que cambie su estado a abierto
    }, 400);

    setTimeout(() => {
      setEnvolpeDivHidden(true); // Ocultamos el div de la carta completamente
      document.body.classList.remove("overflow-hidden"); // Mostramos el restante de la invitación
    }, 2400);
  };

  if (envolpeDivHidden) return null;

  return (
    <div
      className={cn(
        "fixed w-full h-full max-h-[100dvh] overflow-hidden z-50",
        className,
      )}
    >
      {/* Overlay que se desvanece cuando el Lottie carga */}
      <motion.div
        className="absolute inset-0 bg-accent z-[51]"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLottieLoaded ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ display: overlayHidden ? "none" : "block" }}
        onAnimationComplete={() => {
          if (isLottieLoaded) {
            setOverlayHidden(true);
          }
        }}
      />

      <CustomLottie
        className="w-full"
        options={{
          loop: false,
          animationData: isMobile ? mobile : desktop,
          autoplay: false,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
            className: "cursor-default z-[51] !w-full !h-screen !max-h-[100dvh]",
          },
        }}
        isClickToPauseDisabled
        isPaused={isLottiePaused}
        eventListeners={[
          {
            eventName: "DOMLoaded",
            callback: handleLottieComplete,
          },
        ]}
      />

      <motion.div
        variants={variants}
        initial={{ scale: 1 }}
        onClick={handleSealClick}
        animate={isSealVisible ? "loop" : "hidden"}
        className="absolute top-[calc(50%-65px)] left-[calc(30%-65px)] xl:top-[calc(70%-65px)] xl:left-[calc(50%-65px)] cursor-pointer z-20"
        transition={{
          duration: 1,
          repeat: isSealVisible ? Infinity : 0,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      >
        <Image
          alt="Sello de carta"
          className="sello w-full h-auto"
          width={0}
          priority
          height={0}
          sizes="100vw"
          src={sealImage || `/img/sello.png`}
        />
      </motion.div>
    </div>
  );
}
