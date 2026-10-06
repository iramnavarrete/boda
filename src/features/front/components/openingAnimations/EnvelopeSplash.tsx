"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import CustomLottie from "@/features/shared/components/CustomLottie";

import mobile from "@/public/lottie/envolpe.json";
import desktop from "@/public/lottie/envolpeDesktop.json";
import { cn } from "@heroui/theme";
import WaxSeal from "@/features/shared/components/WaxSeal";
import { colorizeLottie } from "@/utils/lottie";

interface EnvelopeSplashProps {
  className?: string;
  onOpen: () => void; // Callback para avisarle al Home que el sobre se abrió
  sealConfig?: {
    initials?: string;
    sealColor?: string;
    textColor?: string;
    customSvg?: React.ReactNode;
    /** SVG opcional para el borde/ornamento circular del sello
     *  (reemplaza el `SealDecoration` por defecto). */
    borderSvg?: React.ReactNode;
  };
  /**
   * Colores opcionales para recolorear el sobre.
   * Si se omite, mantiene los colores originales del Lottie.
   *
   *  - `body`: cuerpo del sobre + carta interior (en el JSON, ambos usan
   *    el mismo color crema claro).
   *  - `border`: bordes/solapas del sobre.
   *
   * Útil para variantes del tema (ej. XV: body verde, border dorado).
   */
  envelopeColors?: {
    body: string;
    border: string;
  };
}

export default function EnvelopeSplash({
  className = "",
  onOpen,
  sealConfig,
  envelopeColors,
}: EnvelopeSplashProps) {
  const [isSealVisible, setIsSealVisible] = useState(true);
  const [envolpeDivHidden, setEnvolpeDivHidden] = useState(false);
  const [isLottiePaused, setIsLottiePaused] = useState(true);
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);
  const [overlayHidden, setOverlayHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Resolución del JSON final del Lottie. Si `envelopeColors` viene,
  // aplicamos `colorizeLottie` sobre el JSON importado (mobile o desktop).
  const baseMobileData = mobile as Parameters<typeof colorizeLottie>[0];
  const baseDesktopData = desktop as Parameters<typeof colorizeLottie>[0];
  const mobileAnimationData = envelopeColors
    ? colorizeLottie(baseMobileData, "envelope", envelopeColors)
    : baseMobileData;
  const desktopAnimationData = envelopeColors
    ? colorizeLottie(baseDesktopData, "envelopeDesktop", envelopeColors)
    : baseDesktopData;

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
      <Head>
        <link
          rel="preload"
          href="/img/sello-gris.png"
          as="image"
          type="image/png"
          fetchPriority="high"
        />
      </Head>

      {/* Estilo local para la animación de escala infinita del sello */}
      <style>{`
        @keyframes scalePulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
      `}</style>

      {/* Overlay que se desvanece cuando el Lottie carga usando Tailwind transition */}
      <div
        className={cn(
          "absolute inset-0 bg-accent z-[51] transition-opacity duration-500 ease-in-out",
          isLottieLoaded ? "opacity-0" : "opacity-100",
        )}
        style={{ display: overlayHidden ? "none" : "block", backgroundColor: envelopeColors?.body || "#f5efe6 " }}
        onTransitionEnd={() => {
          if (isLottieLoaded) {
            setOverlayHidden(true);
          }
        }}
      />

      <CustomLottie
        className="w-full"
        options={{
          loop: false,
          animationData: isMobile ? mobileAnimationData : desktopAnimationData,
          autoplay: false,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
            className:
              "cursor-default z-[51] !w-full !h-screen !max-h-[100dvh]",
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

      {/* Contenedor del sello animado con Tailwind y animación CSS nativa */}
      <div
        onClick={handleSealClick}
        className={cn(
          "absolute top-[calc(50%-65px)] left-[calc(30%-65px)] xl:top-[calc(70%-65px)] xl:left-[calc(50%-65px)] z-20 cursor-pointer transition-opacity duration-200 ease-in-out",
          isSealVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        style={{
          animation: isSealVisible
            ? "scalePulse 1s infinite alternate ease-in-out"
            : "none",
        }}
      >
        <WaxSeal
          initials={sealConfig?.initials}
          textColor={sealConfig?.textColor}
          sealColor={sealConfig?.sealColor}
          customSvg={sealConfig?.customSvg}
          borderSvg={sealConfig?.borderSvg}
        />
      </div>
    </div>
  );
}
