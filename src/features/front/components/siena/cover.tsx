"use client";

import { useEffect, useRef, useState } from "react";
import ArrowsIcon from "@/icons/arrows-icon";
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

type ImageConfig = {
  src: string;
  style: { backgroundPosition: string };
};

type Props = {
  isSealVisible: boolean;
  eventTitleClassName?: string;
  imagesConfig?: ImageConfig[];
  musicIconClassName?: string;
  musicContainerClassName?: string;
};

export default function Cover({
  isSealVisible,
  imagesConfig = [
    { src: "/img/cover1.webp", style: { backgroundPosition: "right" } },
    { src: "/img/cover2.webp", style: { backgroundPosition: "60%" } },
    { src: "/img/cover3.webp", style: { backgroundPosition: "right" } },
  ],
  eventTitleClassName ="",
  musicIconClassName = "",
  musicContainerClassName = ""
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const { family, setFamily } = useFamilyContext();
  const { toggleAudio } = useMusicStore();
  const [index, setIndex] = useState(0);
  const [isTriggerInView, setIsTriggerInView] = useState(true);

  const triggerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const preview = searchParams?.get("preview");
  const token = searchParams?.get("token");

  // 🔥 Ref de seguridad para evitar dobles registros causados por el StrictMode de React
  const hasLoggedRef = useRef(false);

  // --- INTERSECTION OBSERVER NATIVO ---
  // Reemplaza a `useInView` de Framer Motion
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
    if (!isSealVisible) {
      setTimeout(() => toggleAudio(), 5);
    }
  }, [isSealVisible, toggleAudio]);

  useEffect(() => {
    if (!isSealVisible && family && invitationData) {
      // 1. Validamos que estemos en un enlace vivo (sin preview y sin token)
      if (!preview && !token) {
        // 2. Evitamos dobles ejecuciones accidentales (típicas de React)
        if (!hasLoggedRef.current) {
          hasLoggedRef.current = true;

          // 3. SIEMPRE guardamos el log de actividad en el historial (costo: 1 escritura)
          ActivityService.logActivity(invitationData.id, {
            action: "view",
            familyId: family.id,
            familyName: family.nombre,
          }).catch(console.error);

          // 4. SOLO actualizamos la familia en Firebase si es la PRIMERA VEZ que lo abre
          if (!family.invitacionVista) {
            FamiliesService.markInvitationAsViewed(
              invitationData.id,
              family.id,
            ).catch(console.error);

            // Actualizamos el contexto local
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
        5000,
      );
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSealVisible, imagesConfig.length]);

  const activeIndex = isSealVisible ? 0 : index;

  return (
    <>
      {/* Animación local para el rebote de las flechas (Inicia después de la transición de entrada) */}
      <style>{`
        @keyframes smoothBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-smooth-bounce {
          animation: smoothBounce 1.6s ease-in-out infinite;
          animation-delay: 3.2s; /* Comienza a rebotar justo cuando termina su animación de entrada */
        }
      `}</style>

      <div className="relative w-full h-[95svh] bg-black">
        {/* === MOTOR DEL CARRUSEL EN CSS PURO === */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <div className="fixed top-0 w-full max-w-[500px] 2xl:max-w-[600px] h-[95svh]">
            {imagesConfig.map((img, i) => (
              <Image
                key={img.src}
                src={img.src}
                alt={`Cover ${i + 1}`}
                fill
                priority
                className={cn(
                  "object-cover transition-opacity duration-[1500ms] ease-in-out transform-gpu",
                  activeIndex === i ? "opacity-100" : "opacity-0",
                )}
                style={{ objectPosition: img.style.backgroundPosition }}
              />
            ))}
          </div>
        </div>

        {/* === CONTENIDO PRINCIPAL ANIMADO CON TAILWIND === */}
        <div className="relative z-10 h-full w-full">
          {/* Contenedor del Texto (Aparece a los 2.4s) */}
          <div className="absolute h-[60%] w-full flex flex-col justify-start bg-gradient-to-b from-black/45 via-black/20"></div>
          <div
            className={cn(
              "h-full w-full transition-all duration-1000 ease-out transform-gpu",
              isSealVisible
                ? "opacity-0 translate-x-5"
                : "opacity-100 translate-x-0 delay-[2200ms]",
            )}
          >
            {/* Degradado oscuro elegante hacia transparente */}
            <div className="h-full w-full flex flex-col justify-start">
              <div className="relative pr-6 flex flex-col items-end pt-12 drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)]">
                <p
                  className={cn(
                    "font-newIconScript text-white text-4xl drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)]",
                    eventTitleClassName,
                  )}
                >
                  {invitationData?.nombre}
                </p>
                <p className="font-nourdLight text-white text-lg mt-2">
                  NUESTRA BODA
                </p>
                <p className="font-nourdLight text-white text-md mt-1">
                  {invitationData &&
                    invitationData.fechaISO &&
                    formatToEventDate(invitationData.fechaISO)}
                </p>
              </div>
            </div>
          </div>

          {/* Trigger para el IntersectionObserver */}
          <div
            ref={triggerRef}
            className="h-[60px] w-full absolute bottom-11 pointer-events-none"
          />

          {/* Botón de Música (Aparece a los 2s) */}
          <div
            className={cn(
              "absolute bottom-11 right-5 transition-all duration-1000 ease-out transform-gpu",
              isSealVisible
                ? "opacity-0 translate-y-10"
                : "opacity-100 translate-y-0 delay-[2600ms]",
            )}
          >
            <Music iconClassName={musicIconClassName} />
          </div>

          {/* Flechas (Aparecen a los 2.2s y luego rebotan) */}
          {/* Indicador EXPLÍCITO de Deslizar (Aparece a los 2.2s y luego rebota) */}
          <div
            className={cn(
              "absolute bottom-11 left-0 right-0 w-full flex justify-center pointer-events-none transition-all duration-1000 ease-out transform-gpu",
              isSealVisible
                ? "opacity-0 translate-y-10"
                : "opacity-100 translate-y-0 delay-[3000ms]",
            )}
          >
            <div
              className={cn(
                "flex flex-col items-center gap-1 text-white drop-shadow-[2px_4px_2px_rgba(0,0,0,0.25)]",
                isSealVisible ? "" : "animate-smooth-bounce",
              )}
            >
              <span className="text-[9px] uppercase tracking-[0.3em] font-nourdMedium opacity-90 drop-shadow-md">
                Desliza
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-90"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* === BOTÓN FIJO DE MÚSICA EN TOP RIGHT === */}
      <div
        className={cn(
          "fixed top-5 right-5 min-[500px]:right-[calc(50%-230px)] 2xl:right-[calc(50%-280px)] z-[51] transition-all duration-1000 ease-out transform-gpu",
          isTriggerInView || isSealVisible
            ? "opacity-0 -translate-y-5 pointer-events-none duration-75"
            : "opacity-100 translate-y-0",
        )}
      >
        <Music iconClassName={musicIconClassName} containerClassName={musicContainerClassName} />
      </div>
    </>
  );
}
