import Cover from "./sections/cover";
import Quote from "./sections/quote";
import ParentsGodFathers from "./sections/parents";
import CountDown from "./sections/countdown";
import CeremonyToast from "./sections/ceremony-toast";
import "photoswipe/dist/photoswipe.css"; // Estilos base de PhotoSwipe
import Gallery from "./sections/gallery";
import Assistants from "./sections/Assistants";
import { motion } from "framer-motion";
import mobile from "../../public/lottie/envolpe.json";
import desktop from "../../public/lottie/envolpeDesktop.json";
import { useEffect, useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import GiftsTable from "./sections/gifts-table";
import QrPhotos from "./sections/qr-photos";
import { AudioController } from "./sections/music";
import Footer from "./sections/footer";
import FlowersCoverUp from "@/icons/flowers-cover-up";
import FlowersCoverDown from "@/icons/flowers-cover-down";
import { brideName, groomName } from "@/constants/constants";

const Lottie = dynamic(() => import("react-lottie"), {
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-accent fixed z-50" />,
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

const mobileAnimation = {
  loop: false,
  animationData: mobile,
  autoplay: false,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
    className: "cursor-default z-[51]",
  },
};

const desktopAnimation = {
  loop: false,
  animationData: desktop,
  autoplay: false,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
    className: "cursor-default z-[51]",
  },
};

export default function Home() {
  const [isSealVisible, setIsSealVisible] = useState(true);
  const [envolpeDivHidden, setEnvolpeDivHidden] = useState(false);
  const [isLottiePaused, setIsLottiePaused] = useState(true);
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);
  const [overlayHidden, setOverlayHidden] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1280);
    };

    handleResize(); // ejecutar al inicio
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLottieComplete = () => {
    setIsLottieLoaded(true);
  };

  return (
    <main
      className={`${newIconScript.variable} ${nourdLight.variable} ${nourdMedium.variable} ${nourdBold.variable}`}
    >
      <div
        className="fixed w-full h-full overflow-hidden z-50"
        style={envolpeDivHidden ? { display: "none" } : {}}
      >
        {/* Overlay que se desvanece cuando el Lottie carga */}
        <motion.div
          className="absolute inset-0 bg-accent z-[51]"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLottieLoaded ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ display: overlayHidden ? "none" : "block" }}
          onAnimationComplete={() => {
            if (isLottieLoaded) {
              setOverlayHidden(true);
            }
          }}
        />
        <Lottie
          options={isMobile ? mobileAnimation : desktopAnimation }
          isClickToPauseDisabled
          isPaused={isLottiePaused}
          eventListeners={[
            {
              eventName: "DOMLoaded",
              callback: handleLottieComplete,
            },
          ]}
        />
        <motion.div
          variants={variants}
          initial={{
            scale: 1,
          }}
          onClick={() => {
            window.scrollTo({ top: 0 });
            setIsSealVisible(false); // Ocultamos el sello
            setTimeout(() => {
              setIsLottiePaused(false); // Iniciamos la animación de la carta luego de 400ms
            }, 400);
            document.body.classList.remove("overflow-hidden");
            setTimeout(() => {
              setEnvolpeDivHidden(true); // Ocultamos el div de la carta cuando pasen los 2400ms
            }, 2400);
          }}
          animate={isSealVisible ? "loop" : "hidden"}
          className="absolute top-[calc(50%-65px)] left-[calc(30%-65px)] xl:top-[calc(70%-65px)] xl:left-[calc(50%-65px)] cursor-pointer z-20"
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
            priority
            height={0}
            sizes="100vw"
            src={`/img/sello.png`}
          />
        </motion.div>
      </div>

      <div style={{ overflow: "hidden" }}>
        <div className="flex flex-col items-center overflow-hidden bg-texture">
          <div className="hidden sm:block fixed left-0 top-0 bottom-0 w-[calc(50%-250px)] 2xl:w-[calc(50%-300px)] opacity-60 place-content-center text-center">
            <FlowersCoverUp className="w-full text-primary drop-shadow-none hidden 2xl:block" />
            <p className="flex items-center justify-center font-newIconScript text-primary text-4xl 2xl:text-4xl -rotate-90 2xl:-rotate-0 2xl:py-12">
              {brideName} <span className="text-2xl 2xl:text-2xl px-2">&</span> {groomName}
            </p>
            <FlowersCoverDown className="w-full drop-shadow-none text-primary hidden 2xl:block" />
          </div>
          <div className="max-w-[500px] 2xl:max-w-[600px] relative min-[500px]:border-x-1 border-primary overflow-hidden">
            <Cover isSealVisible={isLottiePaused} />
            <Quote />
            <ParentsGodFathers />
            <CountDown />
            <CeremonyToast />
            <Gallery />
            <GiftsTable />
            <Assistants />
            <QrPhotos />
            <Footer />
            <AudioController />
          </div>
          <div className="hidden sm:block fixed right-0 top-0 bottom-0 w-[calc(50%-250px)] 2xl:w-[calc(50%-300px)] opacity-60 place-content-center text-center bg-texture">
            <FlowersCoverUp className="w-full text-primary drop-shadow-none hidden 2xl:block scale-x-[-1]" />
            <p className="flex gap-2 items-center justify-center font-newIconScript text-primary text-4xl 2xl:text-4xl rotate-90 2xl:rotate-0 2xl:py-12">
              25 <span>/</span> 10 <span>/</span> 25
            </p>
            <FlowersCoverDown className="w-full drop-shadow-none text-primary hidden 2xl:block scale-x-[-1]" />
          </div>
        </div>
      </div>
    </main>
  );
}
