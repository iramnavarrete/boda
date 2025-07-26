import FlowersCoverDown from "@/icons/flowers-cover-down";
import FlowersCoverUp from "@/icons/flowers-cover-up";
import { motion, useAnimate, useInView } from "framer-motion";
import Music from "./music";
import { useEffect, useRef } from "react";
import ArrowsIcon from "@/icons/arrows-icon";
import useMusicStore from "@/stores/musicStore";

const animateCoverVariants = {
  none: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      duration: 1,
      delay: 1.2,
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

  return (
    <>
      <div className="bg_fixed">
        <div className="overlay bg-main">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] to-primary bottom-0 h-36 w-full" />
        </div>
        <div className="relative">
          <motion.div
            variants={animateCoverVariants}
            animate={isSealVisible ? "none" : "show"}
            viewport={{ once: true, amount: "some" }}
            initial={{ opacity: 0}}
          >
            <div className="h-[calc(100vh-50px)] w-full flex flex-col drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)] relative">
              <div className="relative px-3">
                <div className="flex flex-1 justify-center items-center flex-col gap-3 pt-14 relative">
                  <motion.div
                    className="w-[80%]"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{
                      x: isSealVisible ? -20 : 0,
                      opacity: isSealVisible ? 0 : 1,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 1.6,
                      ease: "easeInOut",
                    }}
                  >
                    <FlowersCoverUp className="w-full" />
                  </motion.div>
                  <p className="font-nourdLight text-white text-lg">
                    NUESTRA BODA
                  </p>
                  <p className="font-newIconScript text-white text-4xl drop-shadow-[2px_2px_1px_rgba(0,0,0,0.95)]">
                    Yaneth <span className="text-2xl">&</span> Josué
                  </p>
                  <p className="font-nourdLight text-white text-lg">
                    25 / OCT / 2025
                  </p>
                  <motion.div
                    className="w-[80%]"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{
                      x: isSealVisible ? 20 : 0,
                      opacity: isSealVisible ? 0 : 1,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 1.6,
                      ease: "easeInOut",
                    }}
                  >
                  <FlowersCoverDown className="w-full" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
          <div ref={triggerRef} className="h-[25px] w-full absolute bottom-9" />
          <motion.div
            variants={animateCoverVariants}
            animate={isSealVisible ? "none" : "showMusic"}
            viewport={{ once: true, amount: "some" }}
            initial={{ opacity: 0, y: 40 }}
            className="absolute bottom-6 right-5"
          >
            <Music />
          </motion.div>
          <motion.div
            ref={arrowsScope}
            initial={{ opacity: 0, y: 40 }}
            className="absolute bottom-9 left-[calc(50%-16px)]"
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
        className="fixed top-5 right-5 z-[51]"
      >
        <Music />
      </motion.div>
    </>
  );
}
