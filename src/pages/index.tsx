import Cover from "./sections/cover";
import Quote from "./sections/quote";
import ParentsGodFathers from "./sections/parents";
import CountDown from "./sections/countdown";
import CeremonyToast from "./sections/ceremony-toast";
import 'photoswipe/dist/photoswipe.css'; // Estilos base de PhotoSwipe
import Gallery from "./sections/gallery";
import Assistants from "./sections/Assistants";
import { motion } from "framer-motion";
import animationData from "../../public/lottie/envolpe.json";
import { useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import GiftsTable from "./sections/gifts-table";
import QrPhotos from "./sections/qr-photos";
import { AudioController } from "./sections/music";

const Lottie = dynamic(() => import("react-lottie"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-accent fixed z-50" />
  ),
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
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
    className: "cursor-default",
  },
};

export default function Home() {
  const [isSealVisible, setIsSealVisible] = useState(true);
  const [envolpeDivHidden, setEnvolpeDivHidden] = useState(false);
  const [isLottiePaused, setIsLottiePaused] = useState(true)

  return (
    <main
      className={`${newIconScript.variable} ${nourdLight.variable} ${nourdMedium.variable} ${nourdBold.variable}`}
    >
      <div
        className="fixed w-full h-full overflow-hidden z-50"
        style={envolpeDivHidden ? { display: "none" } : {}}
      >
        <Lottie
          options={defaultOptions}
          isClickToPauseDisabled
          isPaused={isLottiePaused}
        />
        <motion.div
          variants={variants}
          initial={{
            scale: 1,
          }}
          onClick={() => {
            setIsSealVisible(false); // Ocultamos el sello
            setTimeout(() => {
              setIsLottiePaused(false) // Iniciamos la animación de la carta luego de 400ms
            }, 400);
            document.body.classList.remove("overflow-hidden");
            setTimeout(() => {
              setEnvolpeDivHidden(true); // Ocultamos el div de la carta cuando pasen los 2400ms
            }, 2400);
          }}
          animate={isSealVisible ? "loop" : "hidden"}
          className="absolute top-[calc(50%-65px)] left-[calc(30%-65px)] cursor-pointer"
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
            height={0}
            sizes="100vw"
            src={`/img/sello.png`}
          />
        </motion.div>
      </div>

      <div style={{ overflow: "hidden" }}>
        <div className="flex flex-col items-center bg-accent overflow-hidden">
          <div className="max-w-[500px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
            <Cover isSealVisible={isLottiePaused} />
            <Quote />
            <ParentsGodFathers />
            <CountDown />
            <CeremonyToast />
            <Gallery />
            <GiftsTable />
            <Assistants />
            <QrPhotos />
            <AudioController />
          </div>
        </div>
      </div>
    </main>
  );
}
