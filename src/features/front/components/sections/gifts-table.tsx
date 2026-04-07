import AmazonIcon from "@/icons/amazon-icon";
// import LiverpoolIcon from "@/icons/liverpool-icon";
import BbvaIcon from "@/icons/bbva-icon";
// import BanamexIcon from "@/icons/banamex-icon";
// import SantanderIcon from "@/icons/santander-icon";
// import HsbcIcon from "@/icons/hsbc-icon";
import GiftIcon from "@/icons/gift-icon";
import { animate, AnimatePresence, useInView } from "framer-motion";
import { FC, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import AnimatedEntrance from "@/features/front/components/AnimatedEntrance";
import { giftSequence } from "@/constants/animationSequences";
import { cn } from "@heroui/theme";

// types.ts (o arriba del componente)
type StoreGift = {
  type: "amazon" | "liverpool" | "other";
  link: string;
  label?: string; // para "other"
  icon?: React.ReactNode; // para "other"
};

type BankTransfer = {
  bank: "bbva" | "banamex" | "santander" | "hsbc";
  cardNumber: string;
  beneficiary: string;
};

type Props = {
  containerClassName?: string;
  btnsClassName?: string;
  stores?: StoreGift[];       // mesas de regalos online
  showCash?: boolean;         // efectivo el día de la boda
  transfer?: BankTransfer;    // datos bancarios, undefined = no mostrar
};

// --- Iconos por tienda ---
const STORE_ICONS: Record<string, React.ReactNode> = {
  amazon: <AmazonIcon className="h-8 mb-6 animated-gift" />,
  // liverpool: <LiverpoolIcon className="h-8 mb-6 animated-gift" />,
};

// --- Iconos por banco ---
const BANK_ICONS: Record<string, React.ReactNode> = {
  bbva: <BbvaIcon className="h-12 animated-gift" />,
  // banamex: <BanamexIcon className="h-12 animated-gift" />,
  // santander: <SantanderIcon className="h-12 animated-gift" />,
  // hsbc: <HsbcIcon className="h-12 animated-gift" />,
};

const BANK_LABELS: Record<string, string> = {
  bbva: "BBVA",
  banamex: "Banamex",
  santander: "Santander",
  hsbc: "HSBC",
};

const GiftsTable: FC<Props> = ({
  containerClassName = "",
  btnsClassName = "",
  stores = [],
  showCash = false,
  transfer,
}) => {
  const [isCardInfoVisible, setIsCardInfoVisible] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    animate(giftSequence);
  }, [isInView]);

  return (
    <div className={cn("px-10 bg-primary w-full py-16", containerClassName)}>
      <div className="flex flex-col gap-5 justify-center items-center">
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

            {/* --- Tiendas online --- */}
            {stores.map((store, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <motion.div ref={idx === 0 ? ref : undefined}>
                  {store.type === "other"
                    ? store.icon
                    : STORE_ICONS[store.type]}
                </motion.div>
                <a
                  className={cn(
                    "border-border-button border-1 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary",
                    btnsClassName
                  )}
                  href={store.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {store.label ?? "Ver mesa"}
                </a>
              </div>
            ))}

            {/* --- Efectivo --- */}
            {showCash && (
              <div className="flex flex-col items-center gap-3">
                <GiftIcon className="h-12 animated-gift" />
                <div className="text-accent text-center leading-5 text-md font-nourdLight">
                  <p>En efectivo el día de la boda</p>
                </div>
              </div>
            )}

            {/* --- Transferencia --- */}
            {transfer && (
              <div className="flex flex-col items-center gap-1">
                {BANK_ICONS[transfer.bank]}
                <div className="text-accent text-center leading-8 text-md font-nourdMedium">
                  <p>Transferencia de fondos</p>
                </div>
                <button
                  className={cn(
                    "border-border-button border-1 px-8 py-3 rounded-2xl bg-button-dark font-nourdMedium text-primary",
                    btnsClassName
                  )}
                  onClick={() => setIsCardInfoVisible(!isCardInfoVisible)}
                >
                  {isCardInfoVisible ? "Ocultar datos bancarios" : "Ver datos bancarios"}
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
                        <p>{BANK_LABELS[transfer.bank]}</p>
                        <p className="font-nourdBold">Número de tarjeta:</p>
                        <p>{transfer.cardNumber}</p>
                        <p className="font-nourdBold">Beneficiario:</p>
                        <p>{transfer.beneficiary}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
};

export default GiftsTable;