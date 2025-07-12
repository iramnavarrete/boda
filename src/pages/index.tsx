import Cover from "./sections/cover";
import Quote from "./sections/quote";
import ParentsGodFathers from "./sections/parents";
import CountDown from "./sections/countdown";
import CeremonyToast from "./sections/ceremony-toast";
import { Handlee, Outfit, Sacramento } from "next/font/google";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Gallery from "./sections/gallery";
import Assistants from "./sections/Assistants";
import Music from "./sections/music";
import { motion } from "framer-motion";
import animationData from "../../public/lottie/envolpe.json";
import { useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("react-lottie"), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-accent" />,
});

const newIconScript = localFont({
  src: "../fonts/New-Icon-Script.otf",
  variable: "--font-new-icon-script",
});

const nourdLight = localFont({
  src: "../fonts/nourd_light.ttf",
  variable: "--font-nourd-light",
});

const nourdMedium = localFont({
  src: "../fonts/nourd_medium.ttf",
  variable: "--font-nourd-medium",
});

const nourdBold = localFont({
  src: "../fonts/nourd_bold.ttf",
  variable: "--font-nourd-bold",
});

const variants = {
  hidden: {
    opacity: 0,
    transition: { ease: "easeInOut", duration: 0.2 },
  },
  loop: { scale: 1.15 },
};

const defaultOptions = {
  loop: false,
  animationData,
  autoplay: false,
  play: false,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
    className: "cursor-default",
  },
};

export default function Home() {
  // const lottieRef = useRef<Lottie>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [envolpeDivHidden, setEnvolpeDivHidden] = useState(false);

  return (
    <main
      className={`${newIconScript.variable} ${nourdLight.variable} ${nourdMedium.variable} ${nourdBold.variable}`}
    >
      <div
        className="fixed z-20 w-full h-full overflow-hidden"
        style={envolpeDivHidden ? { display: "none" } : {}}
      >
        <div className="lottie-envolpe h-full w-full">
          <Lottie isClickToPauseDisabled options={defaultOptions} />
        </div>
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
            {/* <Music /> */}
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
