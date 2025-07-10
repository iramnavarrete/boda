import Cover from "./sections/cover";
import Quote from "./sections/quote";
import ParentsGodFathers from "./sections/parents-godfathers";
import CountDown from "./sections/countdown";
import CeremonyToast from "./sections/ceremony-toast";
import { Handlee, Outfit, Sacramento } from "next/font/google";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Gallery from "./sections/gallery";
import Assistants from "./sections/Assistants";
import Music from "./sections/music";
import { motion } from "framer-motion";
import Lottie, { Options as LottieOptions } from "react-lottie";
import animationData from "../../public/lottie/envolpe.json";
import { useRef, useState } from "react";
import Image from "next/image";

const handlee = Handlee({
  variable: "--font-handlee",
  subsets: ["latin"],
  weight: "400",
});
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: "400",
});
const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: "400",
});

const variants = {
  hidden: {
    opacity: 0,
    transition: { ease: "easeInOut", duration: 0.2 },
  },
  loop: { scale: 1.15 },
};

const defaultOptions: LottieOptions = {
  loop: false,
  autoplay: false,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
    className: "cursor-default",
  },
};

export default function Home() {
  const lottieRef = useRef<Lottie>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [envolpeDivHidden, setEnvolpeDivHidden] = useState(false);

  return (
    <main
      className={`${handlee.variable} ${outfit.variable} ${sacramento.variable}`}
    >
      <div
        className="fixed z-20 w-full h-full overflow-hidden"
        style={envolpeDivHidden ? { display: "none" } : {}}
      >
        <Lottie
          ref={lottieRef}
          isClickToPauseDisabled
          options={defaultOptions}
        />
        <motion.div
          variants={variants}
          initial={{
            scale: 1,
          }}
          onClick={() => {
            setIsVisible(false);
            document.body.classList.remove("overflow-hidden");
            setTimeout(() => {
              setEnvolpeDivHidden(true);
            }, 2000);
          }}
          animate={isVisible ? "loop" : "hidden"}
          className="absolute top-[calc(50%-65px)] left-[calc(30%-65px)] cursor-pointer"
          transition={{
            duration: 1,
            repeat: isVisible ? Infinity : 0,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        >
          <Image
            alt="Sello de carta"
            className="sello w-full h-auto"
            width={0}
            height={0}
            sizes="100vw"
            src={`/img/sello.png`}
            priority
          />
        </motion.div>
      </div>
      <motion.div
        whileInView={{
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
            duration: 1,
            delay: 0.2,
          },
        }}
        style={{ overflow: "hidden" }}
        viewport={{ once: true, amount: "some" }}
        initial={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center bg-[#fff2e0] overflow-hidden">
          <div className="max-w-[500px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
            <Cover />
            <Music />
            <Quote />
            <ParentsGodFathers />
            <CountDown />
            <CeremonyToast />
            <Gallery />
            <Assistants />
          </div>
        </div>
      </motion.div>
    </main>
  );
}
