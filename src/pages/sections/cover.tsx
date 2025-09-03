import FlowersCoverDown from "@/icons/flowers-cover-down";
import FlowersCoverUp from "@/icons/flowers-cover-up";
import { AnimatePresence, motion, useAnimate, useInView } from "framer-motion";
import Music from "./music";
import { useEffect, useRef, useState } from "react";
import ArrowsIcon from "@/icons/arrows-icon";
import useMusicStore from "@/stores/musicStore";

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

type Props = { isSealVisible: boolean };

export default function Cover({ isSealVisible }: Props) {
  const [arrowsScope, animateArrows] = useAnimate();
  const { toggleAudio } = useMusicStore();
  const triggerRef = useRef(null);
  const isInView = useInView(triggerRef); // top visible
  const images = [
    { src: "/img/cover1.webp", style: { backgroundPosition: "right" } },
    { src: "/img/cover2.webp", style: { backgroundPosition: "60%" } },
    { src: "/img/cover3.webp", style: { backgroundPosition: "right" } },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isSealVisible) {
      setTimeout(() => {
        toggleAudio();
      }, 5);
    }
  }, [isSealVisible]);

  useEffect(() => {
    (async () => {
      if (isSealVisible === false) {
        await animateArrows(
          arrowsScope.current,
          { opacity: 1, y: 0 },
          { delay: 2.2 }
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
          }
        );
      }
    })();
  }, [isSealVisible, arrowsScope, animateArrows]);

  // Controla inicio/pausa del carrusel según isSealVisible
  useEffect(() => {
    // limpia cualquier intervalo previo (maneja StrictMode)
    let interval: NodeJS.Timeout | null = null;

    if (!isSealVisible) {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 5000); // 5s por imagen
    } else {
      // resetear al inicio mientras el sello no es visible
      setIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSealVisible]);

  return (
    <>
      <div className="bg_fixed">
        {images.map((img, i) => (
          <motion.div
            key={img.src}
            className="absolute overlay will-change-opacity"
            style={{ backgroundImage: `url(${img.src})`, ...img.style }}
            initial={{ opacity: i === 0 ? 1 : 0 }}
            animate={{ opacity: index === i ? 1 : 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        ))}
        <div className="relative">
          <motion.div
            variants={animateCoverVariants}
            animate={isSealVisible ? "none" : "show"}
            viewport={{ once: true, amount: "some" }}
            initial={{ opacity: 0, x: 20 }}
          >
            <div className="h-[calc(100vh-50px)] w-full flex flex-col drop-shadow-[2px_2px_1px_rgba(0,0,0,0.85)] relative">
              <div className="relative pr-6">
                <div className="flex flex-1 justify-end items-end flex-col pt-14 relative">
                  <p className="font-newIconScript text-white text-4xl drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)]">
                    Yaneth <span className="text-2xl">&</span> Josué
                  </p>
                  <p className="font-nourdLight text-white text-lg mt-2">
                    NUESTRA BODA
                  </p>
                  <p className="font-nourdLight text-white text-md mt-1">
                    25 / OCT / 2025
                  </p>
                </div>
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
            <Music />
          </motion.div>
          <motion.div
            ref={arrowsScope}
            initial={{ opacity: 0, y: 40 }}
            className="absolute bottom-11 left-[calc(50%-16px)]"
          >
            <ArrowsIcon className="w-8 h-8 drop-shadow-[2px_4px_2px_rgba(0,0,0,0.25)]" />
          </motion.div>
        </div>
      </div>
      <motion.div
        variants={animateFixedVariants}
        animate={isInView || isSealVisible ? "none" : "showMusic"}
        viewport={{ once: true, amount: "some" }}
        initial={{ opacity: 0, y: 40 }}
        className="fixed top-5 right-5 min-[500px]:right-[calc(50%-230px)] 2xl:right-[calc(50%-280px)] z-[51]"
      >
        <Music />
      </motion.div>
    </>
  );
}
