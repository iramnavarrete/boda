import FlowersCoverDown from "@/icons/flowers-cover-down";
import FlowersCoverUp from "@/icons/flowers-cover-up";
import { motion } from "framer-motion";
import Music from "./music";

const animateCoverVariants = {
  none: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      duration: 1,
      delay: 1.5,
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
      delay: 1.8,
    },
  },
};

type Props = { isEnvolpeVisible: boolean };

export default function Cover({ isEnvolpeVisible }: Props) {
  return (
    <div className="bg_fixed">
      <div className="overlay bg-main">
        <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] to-primary bottom-0 h-36 w-full" />
      </div>
      <div className="relative">
        <motion.div
          variants={animateCoverVariants}
          animate={isEnvolpeVisible ? "none" : "show"}
          viewport={{ once: true, amount: "some" }}
          initial={{ opacity: 0, y: 40 }}
        >
          <div className="h-[calc(100vh-50px)] w-full flex flex-col drop-shadow-[4px_2px_1px_rgba(0,0,0,0.25)] relative">
            <div className="relative px-3">
              <div className="flex flex-1 justify-center items-center flex-col gap-3 pt-14 relative">
                <FlowersCoverUp className="w-[80%]" />
                <p className="font-nourdLight text-white text-xl">
                  NUESTRA BODA
                </p>
                <p className="font-newIconScript text-white text-4xl drop-shadow-[4px_2px_0_rgba(0,0,0,0.25)]">
                  Josué & Yaneth
                </p>
                <p className="font-nourdLight text-white text-xl">
                  25 / OCT / 2025
                </p>
                <FlowersCoverDown className="w-[80%]" />
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={animateCoverVariants}
          animate={isEnvolpeVisible ? "none" : "showMusic"}
          viewport={{ once: true, amount: "some" }}
          initial={{ opacity: 0, y: 40 }}
          className="absolute bottom-6 right-5"
        >
          <Music />
        </motion.div>
      </div>
    </div>
  );
}
