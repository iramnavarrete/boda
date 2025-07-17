import AmazonIcon from "@/icons/amazon-icon";
import BbvaIcon from "@/icons/bbva-icon";
import GiftIcon from "@/icons/gift-icon";
import { AnimatePresence } from "framer-motion";
import { FC, useState } from "react";
import { motion } from "framer-motion";

const GiftsTable: FC = () => {
  const [isCardInfoVisible, setIsCardInfoVisible] = useState(false);
  return (
    <div className="px-12 bg-primary w-full py-16">
      <div className=" flex flex-col gap-5 justify-center items-center">
        <div className="flex flex-col items-center justify-center">
          <p className="pt-6 text-3xl drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)] font-newIconScript text-accent">
            Mesa de regalos
          </p>
        </div>
        <div className="text-accent text-center leading-5 text-md font-nourdLight px-2 mb-4">
          <p>
            El regalo es opcional, la asistencia obligatoria, pero si quieres
            tener un detalle con nosotros, que mejor que muestra luna de miel.
          </p>
        </div>
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex flex-col items-center">
            <AmazonIcon className="h-8 mb-6" />
            <a
              className="border-border-button border-1 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary"
              href="https://www.amazon.com.mx"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver mesa
            </a>
          </div>
          <div className="flex flex-col items-center gap-3">
            <GiftIcon className="h-12" />
            <div className="text-accent text-center leading-5 text-md font-nourdLight">
              <p>En efectivo el día de la boda</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <BbvaIcon className="h-12" />
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
                    <p>5741 4600 5879 5461</p>
                    <p className="font-nourdBold">Beneficiario: </p>
                    <p>Iram Navarrete</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftsTable;
