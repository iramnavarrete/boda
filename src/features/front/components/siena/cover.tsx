import { motion, useAnimate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ArrowsIcon from "@/icons/arrows-icon";
import useMusicStore from "@/stores/musicStore";
import { useInvitationStore } from "../../stores/invitationStore";
import { formatToEventDate } from "@/utils/formatters";
import { useSearchParams } from "next/navigation";
import { ActivityService } from "@/services/activityService";
import Image from "next/image";
import { cn } from "@heroui/theme";
import Music from "../sections/music";

const animateCoverVariants = {
  none: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      duration: 1,
      delay: 2.4,
    },
  },
  showMusic: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      duration: 1,
      delay: 2,
    },
  },
};

const animateFixedVariants = {
  none: {
    opacity: 0,
    y: -20,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      duration: 0.05,
    },
  },
  showMusic: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      duration: 1,
    },
  },
};

type ImageConfig = {
  src: string;
  style: { backgroundPosition: string };
};

type Props = {
  isSealVisible: boolean;
  imagesConfig?: ImageConfig[];
  musicIconClassName?: string;
};

export default function Cover({
  isSealVisible,
  imagesConfig = [
    { src: "/img/cover1.webp", style: { backgroundPosition: "right" } },
    { src: "/img/cover2.webp", style: { backgroundPosition: "60%" } },
    { src: "/img/cover3.webp", style: { backgroundPosition: "right" } },
  ],
  musicIconClassName = "",
}: Props) {
  const invitationData = useInvitationStore((state) => state.invitationData);
  const [arrowsScope, animateArrows] = useAnimate();
  const { toggleAudio } = useMusicStore();
  const triggerRef = useRef(null);
  const isInView = useInView(triggerRef); // top visible
  const [index, setIndex] = useState(0);

  const searchParams = useSearchParams();
  const id = searchParams?.get("family");
  const preview = searchParams?.get("preview");
  const token = searchParams?.get("token");

  useEffect(() => {
    if (!isSealVisible) {
      setTimeout(() => {
        toggleAudio();
      }, 5);
    }
  }, [isSealVisible, toggleAudio]);

  useEffect(() => {
    if (!isSealVisible && id && !preview && !token && invitationData) {
      ActivityService.logActivity(invitationData.id, {
        action: "view",
        familyId: id,
      });
    }
  }, [id, preview, token, isSealVisible, invitationData]);

  useEffect(() => {
    (async () => {
      if (isSealVisible === false) {
        await animateArrows(
          arrowsScope.current,
          { opacity: 1, y: 0 },
          { delay: 2.2 },
        );
        animateArrows(
          arrowsScope.current,
          { opacity: 1, y: -20 },
          {
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse",
            delay: 0.5,
            duration: 0.8,
          },
        );
      }
    })();
  }, [isSealVisible, arrowsScope, animateArrows]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isSealVisible) {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % imagesConfig.length);
      }, 5000); // 5s por imagen
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSealVisible, imagesConfig.length]);

  // Variable derivada: Si el sello es visible, obligamos a que el índice activo sea el 0.
  // Si no es visible, usamos el estado 'index' que va cambiando en el carrusel.
  const activeIndex = isSealVisible ? 0 : index;

  return (
    <>
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
                  // Utilizamos la variable derivada aquí:
                  activeIndex === i ? "opacity-100" : "opacity-0",
                )}
                style={{ objectPosition: img.style.backgroundPosition }}
              />
            ))}
          </div>
        </div>

        {/* === CONTENIDO PRINCIPAL ANIMADO CON FRAMER MOTION === */}
        <div className="relative z-10 h-full w-full">
          <motion.div
            variants={animateCoverVariants}
            animate={isSealVisible ? "none" : "show"}
            viewport={{ once: true, amount: "some" }}
            initial={{ opacity: 0, x: 20 }}
            className="h-full w-full"
          >
            <div className="h-full w-full flex flex-col justify-start drop-shadow-[2px_2px_1px_rgba(0,0,0,0.85)] pt-12">
              <div className="relative pr-6 flex flex-col items-end">
                <p className="font-newIconScript text-white text-4xl drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)]">
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
          </motion.div>

          <div
            ref={triggerRef}
            className="h-[60px] w-full absolute bottom-11"
          />

          <motion.div
            variants={animateCoverVariants}
            animate={isSealVisible ? "none" : "showMusic"}
            viewport={{ once: true, amount: "some" }}
            initial={{ opacity: 0, y: 40 }}
            className="absolute bottom-11 right-5"
          >
            <Music iconClassName={musicIconClassName} />
          </motion.div>

          <motion.div
            ref={arrowsScope}
            initial={{ opacity: 0, y: 40 }}
            className="absolute bottom-11 left-[calc(50%-16px)]"
          >
            <ArrowsIcon className="w-8 h-8 drop-shadow-[2px_4px_2px_rgba(0,0,0,0.25)] text-white" />
          </motion.div>
        </div>
      </div>

      {/* === BOTÓN DE MÚSICA FLOTANTE (Fixed) === */}
      <motion.div
        variants={animateFixedVariants}
        animate={isInView || isSealVisible ? "none" : "showMusic"}
        viewport={{ once: true, amount: "some" }}
        initial={{ opacity: 0, y: 40 }}
        className="fixed top-5 right-5 min-[500px]:right-[calc(50%-230px)] 2xl:right-[calc(50%-280px)] z-[51]"
      >
        <Music iconClassName={musicIconClassName} />
      </motion.div>
    </>
  );
}
