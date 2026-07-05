import Image from "next/image";
import { FC, useEffect, useState } from "react";
import Head from "next/head";

type Props = {
  img?: string;
  onOpen?: () => void;
  sealImage?: string;
};

const RippedPaperCover: FC<Props> = ({
  img = "/img/cover10.webp",
  onOpen = () => {},
  sealImage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSealVisible, setIsSealVisible] = useState(true);
  const [envolpeDivHidden, setEnvolpeDivHidden] = useState(false);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
  }, []);

  const handleSealClick = () => {
    window.scrollTo({ top: 0 });
    
    // Oculta el sello inmediatamente y cambia la opacidad a 0
    setIsSealVisible(false);

    // Arranca la animación de deslizado principal hacia arriba
    // DESPUÉS de 500ms
    setTimeout(() => {
      setIsOpen(true);
      
      // onOpen se lanza junto con la animación principal
      setTimeout(() => {
        onOpen();
      }, 400);

      // Limpia el DOM tras finalizar la transición de transform (1.2s + delay)
      setTimeout(() => {
        setEnvolpeDivHidden(true);
        document.body.classList.remove("overflow-hidden");
      }, 1500);

    }, 500); 
  };

  if (envolpeDivHidden) return null;

  return (
    <>
      <Head>
        <link rel="preload" href="/img/textures/natural-paper.png" as="image" />
      </Head>

      {/* AQUÍ DEFINIMOS NUESTRAS ANIMACIONES CONTINUAS EN CSS PURO.
        Es mucho más rápido para el navegador procesar esto que un framework.
      */}
      <style>{`
        @keyframes arrowFloat {
          0%, 100% { transform: translate(0, 0) rotate(10deg); }
          50% { transform: translate(4px, 2px) rotate(10deg); }
        }
        .anim-arrow-float {
          animation: arrowFloat 1.8s ease-in-out infinite;
        }

        @keyframes sealPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .anim-seal-pulse {
          animation: sealPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* CONTENEDOR PRINCIPAL: Usamos clases de transición de Tailwind */}
      <div
        className={`w-screen h-[100dvh] absolute top-0 left-0 z-[60] overflow-hidden will-change-transform ${
          isOpen ? "-translate-y-[100vh]" : "translate-y-0"
        } ${isSealVisible ? "bg-[#a47259]" : "bg-transparent"}`}
        style={{
          transition:
            "transform 1.2s cubic-bezier(0.77, 0, 0.17, 1), background-color 0.5s ease",
        }}
      >
        <div
          className="absolute inset-0 bg-[#ebc9c3]"
          // style={{ clipPath: FIBERS_POLYGON }}
          style={{ clipPath: "url(#rippedPaperClip)" }}
        ></div>
        <div
          className="absolute inset-0 bg-[#f3d5d1]"
          style={{ clipPath: "url(#rippedPaperClip)" }}
        >
          <div className="absolute inset-0 bg-[url('/img/textures/natural-paper.png')] pointer-events-none"></div>
          <div className="h-[55%] md:h-[70%] w-[calc(100vh*0.4)] md:w-[calc(100vh*0.6)] absolute z-30">
            <Image
              src={img}
              alt="Description"
              priority
              fill
              className="object-contain drop-shadow-sm"
            />
          </div>
        </div>

        <div className="absolute bottom-[22%] right-[15%] text-[#5e3428] flex flex-col gap-2">
          <div className=" text-center text-3xl md:text-6xl 2xl:text-8xl tracking-widest flex flex-col items-center gap-12 md:gap-24 relative">
            <p className="font-comprehensionSemiBold">JOSUÉ</p>
            <p className="font-comprehensionSemiBold">YANETH</p>
            <div className="absolute h-full w-full -top-3 md:-top-6 left-0 flex items-center justify-center px-4">
              <hr className="w-full border-[#5e3428] mt-3 md:mt-6" />
              <span className="font-aboveBeyondScript text-3xl md:text-5xl leading-[1.5] mx-2">
                y
              </span>
              <hr className="w-full border-[#5e3428] mt-3 md:mt-6" />
            </div>
          </div>
          <p className="text-[#5e3428] font-nourdLight text-center text-sm md:text-2xl lg:text-3xl 2xl:text-4xl tracking-widest">
            NOS CASAMOS
          </p>
          <p className="text-[#5e3428] font-autography text-center text-4xl">
            15 · 10 · 22
          </p>
        </div>

        {/* SECCIÓN DEL SELLO */}
        <div className="absolute bottom-0 right-2 flex items-center">
          {/* El contenedor del texto y la flecha se oculta suavemente al hacer clic */}
          <div
            className={`flex items-center gap-1 mt-[-15px] transition-opacity duration-500 ease-out ${
              isSealVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-col items-center rotate-[-4deg] mr-2">
              <p className="text-[#5e3428] font-aboveBeyondScript text-2xl md:text-3xl mt-[-6px] opacity-90">
                abrir
              </p>
            </div>

            {/* SVG con clase de animación CSS puro */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 120 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#5e3428] opacity-70 anim-arrow-float"
            >
              <path d="M 10 40 C 30 15, 70 15, 100 55" />
              <path d="M 75 55 L 100 55 L 90 30" />
            </svg>
          </div>

          {/* El sello también se desvanece suavemente con CSS transition */}
          <div
            onClick={handleSealClick}
            className={`cursor-pointer z-20 h-28 w-28 transition-opacity duration-500 ease-out ${
              isSealVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Animación del latido separada del wrapper de transición */}
            <div className="relative w-full h-full anim-seal-pulse">
              <Image
                src={sealImage || `/img/sello_cafe2.png`}
                alt="Sello de carta"
                fill
                priority
                className="object-contain drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default RippedPaperCover;