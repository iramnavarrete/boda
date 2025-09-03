import AmazonIcon from "@/icons/amazon-icon";
import BbvaIcon from "@/icons/bbva-icon";
import GiftIcon from "@/icons/gift-icon";
import { animate, AnimatePresence, useInView } from "framer-motion";
import { FC, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import AnimatedEntrance from "@/components/AnimatedEntrance";
import { giftSequence } from "@/constants/animationSequences";

const GiftsTable: FC = () => {
  const [isCardInfoVisible, setIsCardInfoVisible] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    animate(giftSequence);
  }, [isInView]);
  return (
    <div className="px-10 bg-primary w-full py-16">
      <div className=" flex flex-col gap-5 justify-center items-center">
        <AnimatedEntrance>
          <div className="flex flex-col items-center justify-center">
            <p className="pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-accent">
              Mesa de regalos
            </p>
          </div>
          <div className="text-accent text-center leading-5 text-md font-nourdLight px-2 mb-4 py-8">
            <p>
              Tu presencia es el mejor regalo, pero si deseas tener un detalle
              con nosotros, puedes contribuir a hacer nuestra luna de miel aún
              más especial.
            </p>
          </div>
        </AnimatedEntrance>
        <AnimatedEntrance>
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex flex-col items-center">
              <motion.div ref={ref}>
                <AmazonIcon className="h-8 mb-6 animated-gift" />
              </motion.div>
              <a
                className="border-border-button border-1 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary"
                href="https://www.amazon.com.mx/wedding/registry/305VURTI12M1T"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver mesa
              </a>
            </div>
            <div className="flex flex-col items-center gap-3">
              <GiftIcon className="h-12 animated-gift" />
              <div className="text-accent text-center leading-5 text-md font-nourdLight">
                <p>En efectivo el día de la boda</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BbvaIcon className="h-12 animated-gift" />
              <div className="text-accent text-center leading-8 text-md font-nourdMedium">
                <p>Transferencia de fondos</p>
              </div>
              <button
                className="border-border-button border-1 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary"
                onClick={() => setIsCardInfoVisible(!isCardInfoVisible)}
              >
                {!isCardInfoVisible
                  ? "Ver datos bancarios"
                  : "Ocultar datos bancarios"}
              </button>
              <AnimatePresence>
                {isCardInfoVisible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="text-accent text-center leading-7 text-md font-nourdLight pt-4">
                      <p className="font-nourdBold">Banco:</p>
                      <p>BBVA</p>
                      <p className="font-nourdBold">Numero tarjeta: </p>
                      <p>4152 3139 4438 3681</p>
                      <p className="font-nourdBold">Beneficiario: </p>
                      <p>Iram Navarrete</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
};

export default GiftsTable;
