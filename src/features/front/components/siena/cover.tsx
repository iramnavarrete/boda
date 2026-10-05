"use client";

import { useEffect, useRef, useState } from "react";
import useMusicStore from "@/stores/musicStore";
import { useInvitationStore } from "../../stores/invitationStore";
import { formatToEventDate } from "@/utils/formatters";
import { useSearchParams } from "next/navigation";
import { ActivityService } from "@/services/activityService";
import { FamiliesService } from "@/services/familiesService";
import Image from "next/image";
import { cn } from "@heroui/theme";
import Music from "../sections/music";
import { useFamilyContext } from "../FamilyContext";
import SwipeUpGesture from "@/icons/swipe-up-gesture";

type ImageConfig = {
  src: string;
  style?: { backgroundPosition?: string };
  panStart?: string; // Ej: "45%" o "45% 50%"
  panEnd?: string;   // Ej: "55%" o "55% 50%"
  titlePosition?: "top" | "center" | "bottom";
};

type Props = {
  isSealVisible: boolean;
  eventTitleClassName?: string;
  imagesConfig?: ImageConfig[];
  musicIconClassName?: string;
  musicContainerClassName?: string;
  textAlign?: "left" | "right" | "center";
  customTitleComponent?: React.ReactNode;
  slideDuration?: number;
  musicButtonDelay?: number;
  scrollIndicatorDelay?: number;
};

// 🔥 HELPER ULTRA RÁPIDO: Convierte "45%" o "left" a coordenadas X e Y
const parsePosXY = (posStr?: string): [number, number] => {
  if (!posStr) return [50, 50];
  let str = posStr.toLowerCase().trim();
  if (str === "left") str = "0% 50%";
  if (str === "right") str = "100% 50%";
  if (str === "center") str = "50% 50%";

  const clean = str.replace(/,/g, "").trim().split(/\s+/);
  let rawX = parseFloat(clean[0]);
  if (isNaN(rawX)) rawX = 50;
  let rawY = clean[1] !== undefined ? parseFloat(clean[1]) : 50;
  if (isNaN(rawY)) rawY = 50;

  return [rawX, rawY];
};

export default function Cover({
  isSealVisible,
  imagesConfig = [
    { src: "/img/cover1.webp", panStart: "45%", panEnd: "55%" },
    { src: "/img/cover2.webp", panStart: "55%", panEnd: "45%" },
    { src: "/img/cover3.webp", panStart: "45%", panEnd: "55%" },
  ],
  eventTitleClassName = "",
  musicIconClassName = "",
  musicContainerClassName = "",
  textAlign = "right",
  customTitleComponent,
  slideDuration = 6000,
  musicButtonDelay = 3000,
  scrollIndicatorDelay = 2600,
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { family, setFamily } = useFamilyContext();
  const { toggleAudio } = useMusicStore();
  const [index, setIndex] = useState(0);
  const [isTriggerInView, setIsTriggerInView] = useState(true);
  const [scrollOpacity, setScrollOpacity] = useState(1);

  const triggerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const preview = searchParams?.get("preview");
  const token = searchParams?.get("token");

  const hasLoggedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTriggerInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 200);
      setScrollOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isSealVisible) {
      setTimeout(() => toggleAudio(), 5);
    }
  }, [isSealVisible, toggleAudio]);

  useEffect(() => {
    if (!isSealVisible && family && invitationData) {
      if (!preview && !token) {
        if (!hasLoggedRef.current) {
          hasLoggedRef.current = true;
          ActivityService.logActivity(invitationData.id, {
            action: "view",
            familyId: family.id,
            familyName: family.nombre,
          }).catch(console.error);

          if (!family.invitacionVista) {
            FamiliesService.markInvitationAsViewed(
              invitationData.id,
              family.id,
            ).catch(console.error);
            setFamily((prev) =>
              prev ? { ...prev, invitacionVista: true } : prev,
            );
          }
        }
      }
    }
  }, [isSealVisible, family, preview, token, invitationData, setFamily]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isSealVisible) {
      interval = setInterval(
        () => setIndex((prev) => (prev + 1) % imagesConfig.length),
        slideDuration,
      );
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSealVisible, imagesConfig.length, slideDuration]);

  const activeIndex = isSealVisible ? 0 : index;
  const titlePos = imagesConfig[activeIndex]?.titlePosition || "top";

  return (
    <>
      <style>{`
        @keyframes smoothBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-smooth-bounce {
          animation: smoothBounce 1.6s ease-in-out infinite;
          animation-delay: 3.2s;
        }

        /* 🔥 Keyframes únicos por imagen con valores hardcodeados.
            Esto soluciona el bug de Safari: no interpola var() dentro
            de @keyframes, así que inyectamos un @keyframes específico
            por slide con sus panStart/panEnd ya "horneados". */
        ${imagesConfig
          .map((img, i) => {
            const [startX, startY] = parsePosXY(
              img.panStart || img.style?.backgroundPosition || "50%",
            );
            const [endX, endY] = parsePosXY(
              img.panEnd || img.panStart || img.style?.backgroundPosition || "50%",
            );
            return `
              @keyframes dynamicPan_${i} {
                0%   { transform: translate3d(-${startX}%, -${startY}%, 0); }
                100% { transform: translate3d(-${endX}%, -${endY}%, 0); }
              }
            `;
          })
          .join("\n")}
      `}</style>

      <div className="relative w-full h-[95svh] bg-black">
        <div className="absolute inset-0 w-full h-full z-0" style={{ clipPath: "inset(0 0 0 0)" }}>
          <div className="fixed top-0 w-full max-w-[500px] 2xl:max-w-[600px] h-[95svh]">
            {imagesConfig.map((img, i) => {
              const isViewing = !isSealVisible && activeIndex === i;

              // Solo necesitamos las coordenadas finales aquí — el @keyframes
              // dinámico generado arriba ya tiene los valores de panStart
              // horneados en sus keyframes 0%/100%.
              const [, , endX, endY] = [
                ...parsePosXY(img.panStart || img.style?.backgroundPosition || "50%"),
                ...parsePosXY(img.panEnd || img.panStart || img.style?.backgroundPosition || "50%"),
              ];

              return (
                <div
                  key={img.src}
                  className={cn(
                    "absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-[1200ms] ease-in-out",
                    isViewing ? "opacity-100 z-10" : "opacity-0 z-0",
                  )}
                >
                  <Image
                    src={img.src}
                    alt={`Cover ${i + 1}`}
                    width={1000}
                    height={1000}
                    // Precargamos para evitar el tirón al decodificar la imagen
                    priority={true}
                    quality={90}
                    className="h-full w-auto max-w-none absolute top-1/2 left-1/2 transform-gpu will-change-transform"
                    style={{
                      // Posición final (panEnd) — cuando la slide no está activa
                      // se queda "congelada" en su destino para que la entrada
                      // de la siguiente (con opacity) se vea natural.
                      transform: `translate3d(-${endX}%, -${endY}%, 0)`,
                      // Cada slide usa su propio @keyframes con valores
                      // hardcodeados (evita el bug de Safari con var()
                      // dentro de @keyframes).
                      animation: isViewing
                        ? `dynamicPan_${i} ${slideDuration}ms linear forwards`
                        : "none",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* === CONTENIDO PRINCIPAL === */}
        <div className="relative z-10 h-full w-full pointer-events-none">
          {!customTitleComponent && (
            <div className="absolute top-0 h-[60%] w-full flex flex-col justify-start bg-gradient-to-b from-black/45 via-black/20" />
          )}

          <div
            className={cn(
              "h-full w-full transition-all duration-1000 ease-out transform-gpu pointer-events-auto z-10",
              isSealVisible
                ? "opacity-0 translate-x-5"
                : "opacity-100 translate-x-0 delay-[2200ms]",
            )}
          >
            <div className="h-full w-full flex flex-col justify-start">
              <div
                className={cn(
                  "relative flex flex-col w-full drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)] transition-all duration-[1500ms] ease-in-out transform-gpu",
                  customTitleComponent ? "py-12" : "pt-12",
                  textAlign === "right" && "items-end pr-6 text-right",
                  textAlign === "left" && "items-start pl-6 text-left",
                  textAlign === "center" && "items-center px-6 text-center",
                  titlePos === "top" ? "translate-y-0" : "",
                  titlePos === "center" ? "translate-y-[40%]" : "",
                  titlePos === "bottom" ? "translate-y-[80%]" : "",
                )}
              >
                {customTitleComponent ? (
                  !isSealVisible && (
                    <div
                      className={eventTitleClassName}
                      style={{ opacity: scrollOpacity }}
                    >
                      <div className="relative inline-flex justify-center items-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square min-w-[240px] w-[140%] max-w-[400px] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.28)_0%,transparent_65%)] pointer-events-none -z-10" />

                        {customTitleComponent}
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    <p
                      style={{ opacity: scrollOpacity }}
                      className={cn(
                        "font-newIconScript text-white text-4xl drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)]",
                        eventTitleClassName,
                      )}
                    >
                      {invitationData?.nombre}
                    </p>
                    <p
                      style={{ opacity: scrollOpacity }}
                      className="font-nourdLight text-white text-lg mt-2"
                    >
                      NUESTRA BODA
                    </p>
                    <p
                      style={{ opacity: scrollOpacity }}
                      className="font-nourdLight text-white text-md mt-1"
                    >
                      {invitationData &&
                        invitationData.fechaISO &&
                        formatToEventDate(invitationData.fechaISO)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            ref={triggerRef}
            className="h-[60px] w-full absolute bottom-11 pointer-events-none"
          />

          <div
            className={cn(
              "absolute bottom-11 right-5 transition-all duration-1000 ease-out transform-gpu pointer-events-auto",
              isSealVisible
                ? "opacity-0 translate-y-10"
                : "opacity-100 translate-y-0",
            )}
            style={{
              transitionDelay: !isSealVisible ? `${musicButtonDelay}ms` : "0ms",
            }}
          >
            <Music iconClassName={musicIconClassName} />
          </div>

          <div
            className={cn(
              "absolute bottom-6 left-0 right-0 w-full flex justify-center pointer-events-none transition-all duration-1000 ease-out",
              isSealVisible
                ? "opacity-0 translate-y-10"
                : "opacity-100 translate-y-0",
            )}
            style={{
              transitionDelay: !isSealVisible
                ? `${scrollIndicatorDelay}ms`
                : "0ms",
            }}
          >
            <div
              className={cn(
                "flex flex-col text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]",
                isSealVisible ? "" : "animate-smooth-bounce",
              )}
            >
              <span className="text-[9px] uppercase tracking-[0.3em] font-nourdMedium opacity-90 drop-shadow-md">
                Desliza
              </span>
              <SwipeUpGesture />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed top-5 right-5 min-[500px]:right-[calc(50%-230px)] 2xl:right-[calc(50%-280px)] z-[51] transition-all duration-1000 ease-out transform-gpu",
          isTriggerInView || isSealVisible
            ? "opacity-0 -translate-y-5 pointer-events-none duration-75"
            : "opacity-100 translate-y-0",
        )}
      >
        <Music
          iconClassName={musicIconClassName}
          containerClassName={musicContainerClassName}
        />
      </div>
    </>
  );
}